FROM node:18-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn add mysql2

ENV PATH /opt/node_modules/.bin:$PATH
RUN chown -R node:node /opt/app
RUN chmod 755 /opt/app/public
RUN mkdir -p /opt/app/public/uploads
RUN chown -R node:node /opt/app/public

USER node
RUN ["yarn", "build"]
EXPOSE 1337
CMD ["yarn", "develop"]
