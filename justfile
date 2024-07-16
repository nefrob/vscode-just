[private]
default:
    just --list

build +ARGS="":
    docker compose build {{ ARGS }}

test +ARGS="":
    docker compose run --rm dev /bin/sh -c \
        "yarn pretest"
    # TODO: setup xvfb for running tests in container/ci
    # docker compose run --rm dev /bin/sh -c \
    #     "xvfb-run -a yarn test-extension {{ ARGS }}"
    docker compose run --rm dev /bin/sh -c \
        "yarn test-grammar {{ ARGS }}"

lint:
    docker compose run --rm dev /bin/sh -c \
        "just --fmt --unstable"
    docker compose run --rm dev /bin/sh -c \
        "yarn format --write"
    docker compose run --rm dev /bin/sh -c \
        "yarn lint --fix"

translate:
    docker compose run --rm dev /bin/sh -c \
        "yarn --silent js-yaml syntaxes/just.tmLanguage.yml > syntaxes/just.tmLanguage.json"
    docker compose run --rm dev /bin/sh -c "yarn --silent gen-scopes"

package +ARGS="":
    just translate
    docker compose run --rm dev /bin/sh -c \
        "mkdir -p build && yarn package && yarn vsce package --yarn --out build/ {{ ARGS }}"

console:
    -docker compose run --rm dev /bin/sh

down:
    docker compose down
