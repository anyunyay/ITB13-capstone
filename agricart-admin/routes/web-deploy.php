<?php

// Temporary deployment route - REMOVE AFTER FIRST DEPLOYMENT
Route::get('/deploy-setup', function () {
    if (app()->environment('production')) {
        try {
            // Run migrations
            Artisan::call('migrate', ['--force' => true]);
            
            // Clear caches
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');
            
            return response()->json([
                'status' => 'success',
                'message' => 'Deployment setup completed',
                'migrations' => Artisan::output()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    return response()->json(['message' => 'Only available in production']);
});