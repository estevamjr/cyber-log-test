FROM node:22-alpine

RUN apk add --no-cache bash

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node .

#USER node

EXPOSE 3000