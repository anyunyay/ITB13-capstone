# Use PHP 8.2 FPM
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libonig-dev libxml2-dev \
    nodejs npm default-mysql-client \
    && docker-php-ext-install pdo_mysql mbstring bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies & build assets
RUN npm install && npm run build

# Clear Laravel caches
RUN php artisan config:clear \
 && php artisan cache:clear \
 && php artisan route:clear \
 && php artisan view:clear

# Set permissions for storage and cache
RUN chown -R www-data:www-data storage bootstrap/cache

# Expose the port (Render uses dynamic $PORT)
EXPOSE ${PORT}

# Start Laravel using Render's port
CMD php artisan serve --host=0.0.0.0 --port=${PORT}
