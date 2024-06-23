FROM node:14 as build-stage

WORKDIR /app
COPY ./angular-app /app

RUN npm install
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build-stage /app/dist/angular-app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
