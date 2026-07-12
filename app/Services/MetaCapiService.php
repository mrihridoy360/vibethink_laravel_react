<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;

class MetaCapiService
{
    /**
     * Send conversion event to Meta Graph API.
     *
     * @param string $eventName
     * @param array $userData
     * @param array $customData
     * @param string|null $eventId
     * @param string|null $eventSourceUrl
     * @return bool
     */
    public function sendEvent(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null, ?string $eventSourceUrl = null): bool
    {
        // Fetch values from settings database table
        $enabled = Setting::getValue('meta_tracking_enabled', '1');
        $pixelId = Setting::getValue('meta_pixel_id');
        $accessToken = Setting::getValue('meta_capi_access_token');
        $testEventCode = Setting::getValue('meta_capi_test_event_code');

        // Bypasses if tracking is explicitly disabled or configuration is missing
        if ($enabled !== '1' || empty($pixelId) || empty($accessToken)) {
            Log::debug("Meta CAPI skipped. Tracking disabled or credentials missing.", [
                'enabled' => $enabled,
                'has_pixel_id' => !empty($pixelId),
                'has_access_token' => !empty($accessToken)
            ]);
            return false;
        }

        // Standard user data formatting & SHA-256 hashing
        $hashedUserData = [];
        
        if (!empty($userData['email'])) {
            $hashedUserData['em'] = [hash('sha256', strtolower(trim($userData['email'])))];
        }
        if (!empty($userData['phone'])) {
            // Strip non-numeric characters for phone normalization
            $phone = preg_replace('/\D/', '', $userData['phone']);
            if (!empty($phone)) {
                $hashedUserData['ph'] = [hash('sha256', $phone)];
            }
        }
        if (!empty($userData['first_name'])) {
            $hashedUserData['fn'] = [hash('sha256', strtolower(trim($userData['first_name'])))];
        }
        if (!empty($userData['last_name'])) {
            $hashedUserData['ln'] = [hash('sha256', strtolower(trim($userData['last_name'])))];
        }

        // Add client metadata
        $hashedUserData['client_ip_address'] = request()->ip();
        $hashedUserData['client_user_agent'] = request()->userAgent();

        $event = [
            'event_name' => $eventName,
            'event_time' => time(),
            'event_id' => $eventId ?? 'evt_' . uniqid('', true),
            'event_source_url' => $eventSourceUrl ?? request()->fullUrl(),
            'action_source' => 'website',
            'user_data' => $hashedUserData,
        ];

        if (!empty($customData)) {
            $event['custom_data'] = $customData;
        }

        $payload = [
            'data' => [$event]
        ];

        if (!empty($testEventCode)) {
            $payload['test_event_code'] = $testEventCode;
        }

        try {
            // Graph API version v18.0 is long-term stable
            $response = Http::post("https://graph.facebook.com/v18.0/{$pixelId}/events?access_token={$accessToken}", $payload);

            if ($response->failed()) {
                Log::error("Meta CAPI failed response: " . $response->body());
                return false;
            }

            Log::debug("Meta CAPI event sent successfully: {$eventName}", ['event_id' => $event['event_id']]);
            return true;
        } catch (\Exception $e) {
            Log::error("Meta CAPI exception occurred: " . $e->getMessage());
            return false;
        }
    }
}
