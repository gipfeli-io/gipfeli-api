FROM node:16-alpine

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

RUN npm i -g typeorm ts-node #check if this is really needed

COPY . .

RUN npm run build

EXPOSE $PORT

CMD npm run typeorm:migrate && npm run start:prod