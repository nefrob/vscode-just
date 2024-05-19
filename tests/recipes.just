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


# Imports

import 'foo/bar.just'

mod bar
