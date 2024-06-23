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

# Dependencies

test: lint && (build ("a" + ("b" / "c"))) && test
  @echo "test"

default := 'all'

test target tests=default:
  @echo 'Testing {{target}}:{{tests}}…'
  ./test --tests {{tests}} {{target}}

test triple=(arch + "-unknown-unknown") input=(arch / "input.dat"):
  ./test {{triple}}

a $A $B=`echo $A`:
  echo $A $B

venv:
  [ -d foo ] || python3 -m venv foo

run: venv
  ./foo/bin/python3 main.py

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
