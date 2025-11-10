FROM nginx:latest AS production-stage

#COPY --from=build /app/dist /usr/share/nginx/html
COPY /dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]