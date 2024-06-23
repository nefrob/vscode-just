# Recipes

# Basic
foo:
  echo 'hello'

abc-DEF-123:
  echo 'hello'

# Parameters

foo param1:
  echo {{param1}}

foo param1 param2:
  echo {{param1}} {{param2}}

foo $bar:
  echo $bar

foo a b=var:
  echo {{a}} {{b}}

default_value a=("a" + ("b" + "c")):
  echo {{a}}

foo a=(arch + "-unknown-unknown") b=(arch / "input.dat"):
  echo {{a}} {{b}}

# TODO: backticks broken
a $A $B=`echo $A`:
  echo $A $B

variadic MESSAGE *FLAGS:
  echo {{MESSAGE}} {{FLAGS}}

plus_variadic +FLAGS='-q':
  echo {{FLAGS}}

# Dependencies

basic: foo
  echo 'bar'

b: a && c d
  echo 'hello from b'

default: (build "main")

complex: lint && (build ("a" + ("b" / "c"))) && test
  echo "hello"
