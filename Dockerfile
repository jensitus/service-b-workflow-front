FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf

COPY dist/insurance-showcase/ /usr/share/nginx/html
