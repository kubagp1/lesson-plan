FROM node:20
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ . 
COPY shared/ src/shared/
RUN npm run build
CMD ["npm", "start"]