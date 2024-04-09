FROM node:alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm config set proxy http://server:4000

EXPOSE 3000