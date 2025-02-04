# Creating multi-stage build for production
ARG NODE_VERSION=18.17.0
FROM node:${NODE_VERSION}-alpine as build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev > /dev/null 2>&1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json yarn.lock ./
RUN yarn config set network-timeout 600000 -g && yarn install --production
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY . .
RUN yarn build

# Creating final production image
FROM node:${NODE_VERSION}-alpine
RUN apk add --no-cache vips-dev
RUN apk add --no-cache vips-dev mysql-client
ARG NODE_ENV=production
ARG PORT= ${PORT}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
WORKDIR /opt/app
COPY --from=build /opt/app ./
ENV PATH /opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node
EXPOSE ${PORT}
CMD ["sh", "-c", "node --version && yarn start"]