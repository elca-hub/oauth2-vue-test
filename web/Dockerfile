FROM node:12-slim

COPY . .

RUN yarn install && yarn build

CMD [ "node", "./server.js" ]