<?php

/**
 * Watch logs for suspicious order detection
 * Run this before creating your third order
 */

$logFile = __DIR__ . '/storage/logs/laravel.log';

if (!file_exists($logFile)) {
    echo "Log file not found\n";
    exit(1);
}

echo "=== Watching logs for suspicious order detection ===\n";
echo "Create your third order now...\n\n";

// Get current file size
$lastSize = filesize($logFile);

// Watch for 60 seconds
$endTime = time() + 60;

while (time() < $endTime) {
    clearstatcache();
    $currentSize = filesize($logFile);
    
    if ($currentSize > $lastSize) {
        // New content added
        $handle = fopen($logFile, 'r');
        fseek($handle, $lastSize);
        
        while (!feof($handle)) {
            $line = fgets($handle);
            
            // Filter for relevant logs
            if (strpos($line, 'Checking for recent merged orders') !== false ||
                strpos($line, 'Recent merged order search result') !== false ||
                strpos($line, 'Third order detected') !== false ||
                strpos($line, 'Suspicious order pattern detected') !== false ||
                strpos($line, 'Orders marked as suspicious') !== false) {
                echo $line;
            }
        }
        
        fclose($handle);
        $lastSize = $currentSize;
    }
    
    usleep(500000); // Sleep for 0.5 seconds
}

echo "\n=== Stopped watching ===\n";
