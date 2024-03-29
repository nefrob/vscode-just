[private]
default:
    just --list

build +ARGS="":
    docker compose build {{ ARGS }}

lint:
    docker compose run --rm dev /bin/sh -c \
        "just --fmt --unstable"
    docker compose run --rm dev /bin/sh -c \
        "yarn prettier --cache --write ."

translate:
    docker compose run --rm dev /bin/sh -c \
        "yarn --silent js-yaml syntaxes/just.tmLanguage.yml > syntaxes/just.tmLanguage.json"

package +ARGS="":
    docker compose run --rm dev /bin/sh -c \
        "mkdir -p out && yarn vsce package --yarn --out out/ {{ ARGS }}"

console:
    -docker compose run --rm dev /bin/sh

down:
    docker compose down
