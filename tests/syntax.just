# Syntax highlighting tests
# This file is likely not valid to actually be run
# Examples are generally copied from the just documentation

# Aliases

alias b := build

build:
  echo 'Building!'

# Settings

set allow-duplicate-recipes := false

# Variables and substitution
tmpdir  := `mktemp -d`
version := "0.2.7"
tardir  := tmpdir / "awesomesauce-" + version
tarball := tardir + ".tar.gz"

publish:
  rm -f {{tarball}}
  mkdir {{tardir}}
  cp README.md *.c {{tardir}}
  tar zcvf {{tarball}} {{tardir}}
  scp {{tarball}} me@server.com:release/
  rm -rf {{tarball}} {{tardir}}

export RUST_BACKTRACE := "1"

foo := "a/"
bar := foo / "b"

braces:
  echo 'I {{{{LOVE}} curly braces!'

braces:
  echo '{{'I {{LOVE}} curly braces!'}}'

braces:
  echo 'I {{ "{{" }}LOVE}} curly braces!'

# Strings

string-with-tab             := "\t"
string-with-newline         := "\n"
string-with-carriage-return := "\r"
string-with-double-quote    := "\""
string-with-slash           := "\\"
string-with-no-newline      := "\
"

single := '
hello
'

double := "
goodbye
"

escapes := '\t\n\r\"\\'

x := '''
  foo
  bar
'''

# this string will evaluate to `abc\n  wuv\nxyz\n`
y := """
  abc
    wuv
  xyz
"""

# Functions

system-info:
  @echo "This is an {{arch()}} machine".

home_dir := env_var('HOME')

# Recipe attributes

[no-cd]
[private]
foo:
    echo "foo"

[no-cd, private]
foo:
    echo "foo"

[confirm("Are you sure you want to delete everything?")]
delete-everything:
  rm -rf *

# Command evaluation

localhost := `dumpinterfaces | cut -d: -f2 | sed 's/\/.*//' | sed 's/ //g'`

serve:
  ./serve {{localhost}} 8080

stuff := ```
    echo foo
    echo bar
  ```

# Conditional expressions

foo := if "2" == "2" { "Good!" } else { "1984" }
foo := if "hello" != "goodbye" { "xyz" } else { "abc" }
foo := if "hello" =~ 'hel+o' { "match" } else { "mismatch" }
foo := if env_var("RELEASE") == "true" { `get-something-from-release-database` } else { "dummy-value" }
foo := if "hello" == "goodbye" {
  "xyz"
} else if "a" == "a" {
  "abc"
} else {
  "123"
}

# Recipes

default: (build "main")

build target:
  @echo 'Building {{target}}…'
  cd {{target}} && make

foo:
  -cat foo
  echo 'Done!'

build target:
  @echo "Building {{target}}…"

push target: (build target)
  @echo 'Pushing {{target}}…'

# Extra

test: lint && (build ("a" + ("b" / "c"))) && test
  @echo "test"

default := 'all'

test target tests=default:
  @echo 'Testing {{target}}:{{tests}}…'
  ./test --tests {{tests}} {{target}}

test triple=(arch + "-unknown-unknown") input=(arch / "input.dat"):
  ./test {{triple}}

# Extra case
test nested=("a" + ("b" + "c")):
  ./test {{nested}}
  echo (("a") + ("b" + "c"))

commit MESSAGE *FLAGS:
  git commit {{FLAGS}} -m "{{MESSAGE}}"

test +FLAGS='-q':
  cargo test {{FLAGS}}

foo $bar:
  echo $bar

a:
  echo 'A!'

b: a && c d
  echo 'B!'

c:
  echo 'C!'

d:
  echo 'D!'

@quiet:
  echo hello
  echo goodbye
  @# all done!

# Embedded languages

python:
  #!/usr/bin/env python3
  print('Hello from python!')

js:
  #!/usr/bin/env node
  console.log('Greetings from JavaScript!')

perl:
  #!/usr/bin/env perl
  print "Larry Wall says Hi!\n";

sh:
  #!/usr/bin/env sh
  hello='Yo'
  echo "$hello from a shell script!"

ruby:
  #!/usr/bin/env ruby
  puts "Hello from ruby!"

# Imports

import 'foo/bar.just'

mod bar
