FROM node
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ . 
COPY shared/ src/shared/
RUN npm run build
CMD ["npm", "start"]