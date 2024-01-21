# Contributing

This page lists the steps needed to set up a development environment and contribute to the project.

## Via dev container (recommended)

1. Fork and clone this repo.

2. Install the [recommended VSCode extensions](.vscode/extensions.json).

3. Install [Docker](https://docs.docker.com/get-docker/).

4. From the command pallet, run `Reopen in Container`.

5. Launch the extension in test mode via VSCode debug launch profile.

## Locally

1. Fork and clone this repo.

2. Setup `nodejs` version `20`. We recommend using [asdf](https://asdf-vm.com/guide/getting-started.html).

3. Install `yarn`, ex. via `brew install yarn`.

4. Install dependencies.

    ```shell
    yarn install
    ```

5. Install the [recommended VSCode extensions](.vscode/extensions.json).

6. Launch the extension in test mode via VSCode debug launch profile.

## Additional notes

See also the auto generated [quickstart guide](vsc-extension-quickstart.md).
