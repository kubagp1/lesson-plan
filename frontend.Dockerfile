FROM node
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
COPY shared/ src/shared/
RUN npm run build
