FROM outeredge/edge-docker-php:5.6.12

COPY composer.* /var/www/

RUN composer install --no-interaction --optimize-autoloader --prefer-dist --no-dev && \
    composer clear-cache

COPY . /var/www/

RUN usermod -u 1000 www-data
