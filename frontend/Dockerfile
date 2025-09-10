FROM node:22-alpine

WORKDIR /app

COPY ./*.json  .

RUN npm install 

COPY . .

EXPOSE 5173


CMD ["npm", "run", "dev"]
