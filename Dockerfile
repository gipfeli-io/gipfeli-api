FROM node:16-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g typeorm ts-node

COPY . .

RUN npm run build

EXPOSE $PORT

CMD [ "npm", "run", "typeorm", "migration" ]
CMD [ "npm", "run", "start:prod" ]