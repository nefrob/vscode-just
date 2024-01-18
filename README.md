# vscode-just

This repo defines a VSCode syntax highlighting extension for the [just](https://github.com/casey/just) language.

## Features

Syntax highlighting for just files:

-   TODO: list features and add screenshots

-   Unlike previous iterations of this extension, this extension does not provide command running capabilities from VSCode.

## Known Issues

This extension does simple and/or best effort syntax highlighting. It is not intended to be 100% comprehensive, but rather provide a good enough experience for most users. An LSP solution would be an alternative future approach. That being said, if you find a bug or missing feature, please open an issue or a pull request.

-   Escaping within a string, e.g. `"{{ variable }}"`, colors all non-match content as a string. Ideally non-match content should look like plain text in this case but I am unsure how to remove highlighting forced by the surrounding string. For consistency, I opted to always have escaped content colored as a string, whether the block is within a string or not.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## References

-   [ TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)

-   Previous iterations on `just` syntax grammars

    -   [shellock/vscode-just](https://github.com/skellock/vscode-just)
    -   [sclu1034/vscode-just](https://github.com/sclu1034/vscode-just/)

-   [Example language grammars](https://github.com/microsoft/vscode-textmate/tree/09effd8b7429b71010e0fa34ea2e16e622692946/test-cases/themes/syntaxes)

-   [Just manual](https://just.systems/man/en/)
