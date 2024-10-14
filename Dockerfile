FROM node:22-alpine 

ENV YARN_CACHE_FOLDER=/root/.yarn

# TODO: add xvfb for integration tests
RUN apk update && \
  apk add just

WORKDIR /code
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn yarn install --frozen-lockfile

COPY . .

CMD [ "sleep", "infinity" ]
