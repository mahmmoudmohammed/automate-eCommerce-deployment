FROM php:8.4-fpm AS base

RUN apt-get update && apt-get install -y \
        git curl zip unzip \
        libpng-dev libonig-dev libxml2-dev \
        libpq-dev libsqlite3-dev \
    && docker-php-ext-install pdo_pgsql pdo_sqlite mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app

FROM base AS deps

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader

COPY . .
RUN composer dump-autoload --optimize

FROM deps AS test

ENV APP_ENV=testing
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=:memory:

RUN cp .env.example .env \
    && php artisan key:generate \
    && php artisan test --env=testing

FROM base AS production

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .
RUN composer dump-autoload --optimize

RUN chown -R www-data:www-data /app

CMD ["php-fpm"]
