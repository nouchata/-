FROM nginx:1.21.6

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./banner-light.png /var/www/banner-light.png
COPY ./privkey.pem /etc/ssl/private/key.pem
COPY ./fullchain.pem /etc/ssl/certs/cert.pem