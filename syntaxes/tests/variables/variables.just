
# Aliases

alias b := build
alias help-123 := some-recipe

# Variables and substitution

tmpdir  := `mktemp -d`
version := "0.2.7"
tardir  := tmpdir / "awesomesauce-" + version
tarball := tardir + ".tar.gz"

foo := "a/"
bar := foo / "b"

# Logical operators

foo := '' && 'goodbye'      # ''
bar := 'hello' && 'goodbye' # 'goodbye'

foo := '' || 'goodbye'      # 'goodbye'
bar := 'hello' || 'goodbye' # 'hello'

# Exports

export RUST_BACKTRACE := "1"
unexport FOO
