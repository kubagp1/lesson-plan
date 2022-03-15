FROM node
WORKDIR /usr/app/
COPY backend/ .
RUN npm install -g json-server
EXPOSE 5000
CMD json-server --port 5000 --host 0.0.0.0 db.json