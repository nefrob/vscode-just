# Noise operators

foo:
  -echo "supress error"
  @echo quiet

@quiet:
  echo hello

_private:
  echo hello

# Variables in recipes

foo:
  x := "hello" # This doesn't work!
  echo {{x}}