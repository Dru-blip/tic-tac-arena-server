
FROM node:20.16-alpine3.20


WORKDIR /app


COPY . .

RUN npm install

CMD [ "npm","run","start:dev" ]