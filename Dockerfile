FROM node:21-alpine 

ENV YARN_CACHE_FOLDER=/root/.yarn

RUN apk add just

WORKDIR /code
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn yarn

COPY . .

CMD [ "sleep", "infinity" ]
