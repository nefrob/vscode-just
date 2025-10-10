# Change Log

## [Unreleased]

### Added

- Builtins, color constants and recipe attributes from `just` release 1.38.0 through 1.43.0
-  Or operator `||` from `just` release 1.37.0

## [0.8.0] - 2025-01-02

### Added

- Task runner support

## [0.7.0] - 2025-01-02

### Added

- ~~Add dependabot update configuration~~

### Changed

- Recipes can now be spawned in a (new) terminal instead of being logged to the extension output channel
- Log level can now be set in the extension settings
- Upgrade node from 21 to 22, along with other dependencies
- Improve scope list formatting

### Fixed

- Embedded recipes with empty lines now highlight correctly

## [0.6.0] - 2024-10-06

### Added

- Unicode codepoint escaped characters in strings from `just` release 1.36.0
- Unexport keyword from `just` release 1.29.0
- VSCode command to run recipes

## [0.5.3] - 2024-08-14

### Changed

- Add tests for settings added in release 1.33.0

### Fixed

- Correctly package changes from version `0.5.2` that were not included in the release

## [0.5.2] - 2024-08-02

###  Changed

- Shebangs now highlight at the start of recipes

## [0.5.1] - 2024-07-17

### Added

- New `dir` shortening of `directory` builtin functions from `just` release 1.31.0

## [0.5.0] - 2024-07-16

### Added

- Format on save
- Typescript config

## [0.4.0] - 2024-07-08

### Added

- `HEX` constants
- Optional `?` operator for `import` and `mod`
- `scopes.json` for visibility and tracking of language scopes

### Fixed

- Backticks in recipe definitions now highlight correctly

### Changed

- Updated tests
- Cleaned up inconsistent scope names for the same tokens

## [0.3.0] - 2024-06015

### Added

- Add simple syntax token snapshot tests
- Add builtin functions, recipe attribute and settings from just releases 1.27.0 through 1.29.1

## [0.2.1] - 2024-03-31

### Fixed

- Recipe names with numbers highlight correctly

## [0.2.0] - 2024-03-16

### Added

-   New functions: `canonicalize`, `blake3` and `blake3_file`

### Changed

-   Move extension out of pre-release
-   Migrate to yaml grammar
-   Adds back recipe dependency symbol highlighting
-   Upgrade dependencies


## [0.1.1] - 2024-01-19

### Changed

-   Avoid highlighting unknown recipe dependency symbols (this is the job of a semantic highlighter)
-   General grammar cleanup

## [0.1.0] - 2024-01-18

### Added

-   Initial release of the project

# Template

## [x.x.x] - XXXX-XX-XX

### Added

### Fixed

### Changed

### Removed
