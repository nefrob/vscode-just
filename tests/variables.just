
# Aliases

alias b := build

build:
  echo 'Building!'

# Variables and substitution

tmpdir  := `mktemp -d`
version := "0.2.7"
tardir  := tmpdir / "awesomesauce-" + version
tarball := tardir + ".tar.gz"

foo := "a/"
bar := foo / "b"

export RUST_BACKTRACE := "1"

