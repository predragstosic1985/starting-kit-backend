FROM node:18-alpine

WORKDIR /app

RUN corepack enable

COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "run", "start:prod"]