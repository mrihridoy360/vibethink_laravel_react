<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\PaymentGateway;
use Illuminate\Support\Facades\Log;

class ZiniPayService
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $gateway = PaymentGateway::where('key', 'zinipay')->first();
        if ($gateway && $gateway->config) {
            $this->apiKey = $gateway->config['api_key'] ?? '';
            // Allow user to configure custom base URL, defaulting to the standard ZiniPay api root
            $providedUrl = $gateway->config['base_url'] ?? 'https://api.zinipay.com';
            $this->baseUrl = rtrim($providedUrl, '/');
        } else {
            $this->baseUrl = 'https://api.zinipay.com';
        }
    }

    /**
     * Initialize payment by creating invoice on ZiniPay.
     *
     * @param array $data
     * @return array
     */
    public function initPayment(array $data)
    {
        $url = $this->baseUrl . '/v1/payment/create';

        try {
            Log::info('ZiniPay init payment request', [
                'url' => $url,
                'data' => array_merge($data, ['metadata' => 'JSON object masked for log'])
            ]);

            $response = Http::withHeaders([
                'zini-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->when(app()->isLocal(), function ($query) {
                $query->withoutVerifying();
            })->post($url, $data);

            $result = $response->json();
            Log::info('ZiniPay init payment response', ['response' => $result]);
            return $result;
        } catch (\Exception $e) {
            Log::error('ZiniPay Init Payment Exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'status' => false,
                'message' => 'Connection to ZiniPay failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Verify payment status using ZiniPay invoice_id / val_id.
     *
     * @param string $invoiceId
     * @return array
     */
    public function verifyPayment(string $invoiceId)
    {
        $url = $this->baseUrl . '/v1/payment/verify';

        try {
            Log::info('ZiniPay verify payment request', [
                'url' => $url,
                'invoice_id' => $invoiceId
            ]);

            $response = Http::withHeaders([
                'zini-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->when(app()->isLocal(), function ($query) {
                $query->withoutVerifying();
            })->post($url, [
                'invoice_id' => $invoiceId
            ]);

            $result = $response->json();
            Log::info('ZiniPay verify payment response', ['response' => $result]);
            return $result;
        } catch (\Exception $e) {
            Log::error('ZiniPay Verify Payment Exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'status' => 'FAILED',
                'message' => 'Connection to ZiniPay verification failed: ' . $e->getMessage()
            ];
        }
    }
}
