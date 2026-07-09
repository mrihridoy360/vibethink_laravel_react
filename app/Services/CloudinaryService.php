<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    /**
     * Upload an image to Cloudinary using raw cURL (no SDK dependency).
     */
    public function uploadImage(UploadedFile $file, string $folder = 'images', array $options = []): ?array
    {
        try {
            $cloudName = env('CLOUDINARY_CLOUD_NAME');
            $apiKey    = env('CLOUDINARY_KEY');
            $apiSecret = env('CLOUDINARY_SECRET');

            $timestamp = time();

            $params = [
                'folder'    => $folder,
                'format'    => $options['format'] ?? 'webp',
                'timestamp' => $timestamp,
            ];

            if (!empty($options['transformation'])) {
                $params['transformation'] = $options['transformation'];
            }

            // Generate signature
            ksort($params);
            $signatureString = '';
            foreach ($params as $key => $value) {
                $signatureString .= ($signatureString ? '&' : '') . $key . '=' . $value;
            }
            $signatureString .= $apiSecret;
            $signature = sha1($signatureString);

            $postFields = [
                'file'      => new \CURLFile($file->getRealPath(), $file->getMimeType(), $file->getClientOriginalName()),
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature,
                'folder'    => $params['folder'],
                'format'    => $params['format'],
            ];

            if (!empty($options['transformation'])) {
                $postFields['transformation'] = $options['transformation'];
            }

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload",
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postFields,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);

            $response  = curl_exec($ch);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                Log::error('Cloudinary cURL error: ' . $curlError);
                return null;
            }

            $result = json_decode($response, true);

            if (!isset($result['secure_url'])) {
                Log::error('Cloudinary upload returned no secure_url', ['response' => $response]);
                return null;
            }

            return [
                'public_id' => $result['public_id'],
                'url'       => $result['secure_url'],
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Upload a course thumbnail to Cloudinary (800px wide, WebP).
     */
    public function uploadThumbnail(UploadedFile $file): ?array
    {
        return $this->uploadImage($file, 'thumbnails', [
            'transformation' => 'w_800,c_limit,q_auto',
        ]);
    }

    /**
     * Delete an image from Cloudinary by public_id.
     */
    public function deleteImage(string $publicId): bool
    {
        try {
            $cloudName = env('CLOUDINARY_CLOUD_NAME');
            $apiKey    = env('CLOUDINARY_KEY');
            $apiSecret = env('CLOUDINARY_SECRET');

            $timestamp = time();
            $params    = ['public_id' => $publicId, 'timestamp' => $timestamp];

            ksort($params);
            $signatureString = '';
            foreach ($params as $key => $value) {
                $signatureString .= ($signatureString ? '&' : '') . $key . '=' . $value;
            }
            $signatureString .= $apiSecret;
            $signature = sha1($signatureString);

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => "https://api.cloudinary.com/v1_1/{$cloudName}/image/destroy",
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => [
                    'public_id' => $publicId,
                    'api_key'   => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);

            $response  = curl_exec($ch);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                Log::error('Cloudinary delete cURL error: ' . $curlError);
                return false;
            }

            $result = json_decode($response, true);
            return isset($result['result']) && $result['result'] === 'ok';
        } catch (\Exception $e) {
            Log::error('Cloudinary delete exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Extract public_id from a Cloudinary URL.
     */
    public function extractPublicId(string $url): ?string
    {
        try {
            $path = parse_url($url, PHP_URL_PATH);
            if (!$path) return null;

            $uploadPos = strpos($path, '/upload/');
            if ($uploadPos === false) return null;

            $relativePath = substr($path, $uploadPos + 8);
            $relativePath = preg_replace('/^v\d+\//', '', $relativePath);
            $relativePath = preg_replace('/\.[^.]+$/', '', $relativePath);

            return urldecode($relativePath);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if a URL is a Cloudinary URL.
     */
    public function isCloudinaryUrl(string $url): bool
    {
        return str_contains($url, 'cloudinary.com') || str_contains($url, 'res.cloudinary.com');
    }
}
