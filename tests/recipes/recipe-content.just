# Noise operators

@quiet:
  echo hello

_private:
  echo hello

body:
  -echo "supress error"
  @echo quiet

# Variables in recipes illegal

# TODO: not implemented
# foo:
#   x := "hello"