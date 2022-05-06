FROM node:16-alpine

#set env variables by assigning arg values
ARG TYPEORM_HOST
ARG TYPEORM_USERNAME
ARG TYPEORM_PASSWORD
ARG TYPEORM_DATABASE
ARG TYPEORM_PORT

ENV TYPEORM_HOST=$TYPEORM_HOST
ENV TYPEORM_USERNAME=$TYPEORM_USERNAME
ENV TYPEORM_PASSWORD=$TYPEORM_PASSWORD
ENV TYPEORM_DATABASE=$TYPEORM_DATABASE
ENV TYPEORM_PORT=$TYPEORM_PORT

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g typeorm ts-node #check if this is really needed

COPY . .

RUN npm run build

EXPOSE $PORT

CMD [ "npm", "run", "typeorm-migration" ]
CMD [ "npm", "run", "start:prod" ]