# Noise operators

@quiet:
  echo hello

_private:
  echo hello

body:
  -echo "suppress error"
  @echo quiet
