[private]
default:
    just --list

lint:
    just --fmt --unstable

build +ARGS="":
    docker compose build {{ ARGS }}

up +ARGS="-d":
    docker compose up {{ ARGS }}

console:
    -docker compose run --rm dev /bin/sh

down:
    docker compose down
