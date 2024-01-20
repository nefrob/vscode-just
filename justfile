[private]
default:
    just --list

lint:
    just --fmt --unstable

build +ARGS="":
    docker compose build {{ ARGS }}


console:
    -docker compose run --rm dev /bin/sh

package +ARGS="":
    docker compose run --rm dev /bin/sh -c "mkdir -p out && yarn vsce package --yarn --out out/ {{ ARGS }}"

down:
    docker compose down
