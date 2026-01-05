<?php
// Simple test endpoint to verify PHP is working
echo "PHP is working on Vercel!";
echo "<br>";
echo "Current directory: " . __DIR__;
echo "<br>";
echo "Laravel bootstrap exists: " . (file_exists(__DIR__ . '/../bootstrap/app.php') ? 'Yes' : 'No');
echo "<br>";
echo "Public directory exists: " . (is_dir(__DIR__ . '/../public') ? 'Yes' : 'No');
?>