<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailVerification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email-verification {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email verification for a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $this->info("Testing email verification for user: {$user->name} ({$user->email})");
        
        // Check if email is already verified
        if ($user->hasVerifiedEmail()) {
            $this->warn("User email is already verified.");
            return 0;
        }

        // Send verification email
        try {
            $user->sendEmailVerificationNotification();
            $this->info("Verification email sent successfully!");
            
            // Show verification URL (for testing purposes)
            $verificationUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );
            
            $this->info("Verification URL: {$verificationUrl}");
            
        } catch (\Exception $e) {
            $this->error("Failed to send verification email: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
} 