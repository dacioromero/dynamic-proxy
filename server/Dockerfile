FROM node:12.16.1-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --no-cache --production

COPY index.js ./

CMD node index.js
