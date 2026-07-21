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
                    
                    config([
                        'mail.default' => $mailer,
                        'mail.mailers.smtp.transport' => $mailer,
                        'mail.mailers.smtp.host' => $emailSettings['mail_host'] ?? '',
                        'mail.mailers.smtp.port' => $emailSettings['mail_port'] ?? '',
                        'mail.mailers.smtp.username' => $emailSettings['mail_username'] ?? '',
                        'mail.mailers.smtp.password' => $emailSettings['mail_password'] ?? '',
                        'mail.mailers.smtp.encryption' => $emailSettings['mail_encryption'] ?? null,
                        'mail.mailers.smtp.scheme' => $emailSettings['mail_encryption'] ?? null,
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
