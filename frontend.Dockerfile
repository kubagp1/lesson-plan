FROM node as build

WORKDIR /usr/app/
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
COPY shared/ shared/
RUN rm -rf ./dist/; npm run build

FROM nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/dist/ /usr/frontend