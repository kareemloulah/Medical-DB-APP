FROM node:18.19.0-alpine3.19

WORKDIR /app

COPY ./*.json  .

RUN npm install 

COPY . .

EXPOSE 5000


CMD ["npm" , "run" , "dev"]
