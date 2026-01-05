#!/bin/sh

# Laravel startup script

# Clear caches at container start
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Run migrations (optional, for first deployment)
# php artisan migrate --force

# Start the server on Render's dynamic port
php artisan serve --host=0.0.0.0 --port=${PORT}
