FROM node:20
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
COPY shared/ src/shared/
RUN npm run build
CMD ["sh", "-c", "rm -rf /mnt/static/* && cp -r ./dist/* /mnt/static/"]