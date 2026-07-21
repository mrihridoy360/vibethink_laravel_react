<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $emailSettings = \App\Models\Setting::where('group', 'email')
                    ->pluck('value', 'key')
                    ->toArray();

                if (!empty($emailSettings['mail_mailer'])) {
                    $mailer = $emailSettings['mail_mailer'];
                    
                    $encryption = $emailSettings['mail_encryption'] ?? null;
                    // Symfony Mailer supports 'smtp' (TLS/STARTTLS/Plain) and 'smtps' (SSL). 'tls' is not a valid scheme.
                    $scheme = null;
                    if (is_string($encryption)) {
                        $encLower = strtolower($encryption);
                        if ($encLower === 'ssl') {
                            $scheme = 'smtps';
                        } elseif ($encLower === 'tls') {
                            $scheme = null; // Auto-upgrades to STARTTLS on port 587/25
                        } else {
                            $scheme = $encryption;
                        }
                    }
                    
                    config([
                        'mail.default' => $mailer,
                        'mail.mailers.smtp.transport' => $mailer,
                        'mail.mailers.smtp.host' => $emailSettings['mail_host'] ?? '',
                        'mail.mailers.smtp.port' => $emailSettings['mail_port'] ?? '',
                        'mail.mailers.smtp.username' => $emailSettings['mail_username'] ?? '',
                        'mail.mailers.smtp.password' => $emailSettings['mail_password'] ?? '',
                        'mail.mailers.smtp.encryption' => $encryption,
                        'mail.mailers.smtp.scheme' => $scheme,
                        'mail.from.address' => $emailSettings['mail_from_address'] ?? '',
                        'mail.from.name' => $emailSettings['mail_from_name'] ?? '',
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Silence exceptions to prevent boot failures during migrations or command execution
        }
    }
}
