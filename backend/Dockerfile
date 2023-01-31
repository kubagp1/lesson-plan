FROM node
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . . 
CMD npm start