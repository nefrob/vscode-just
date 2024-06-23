# If-statements

conditional:
  if true; then echo 'True!'; fi

conditional:
  if true; then \
    echo 'True!'; \
  fi

conditional:
  #!/usr/bin/env sh
  if true; then
    echo 'True!'
  fi

# Loops

for:
  for file in `ls .`; do echo $file; done

for:
  for file in `ls .`; do \
    echo $file; \
  done

while:
  while `server-is-dead`; do ping -c 1 server; done

while:
  while `server-is-dead`; do \
    ping -c 1 server; \
  done

while:
  #!/usr/bin/env sh
  while `server-is-dead`; do
    ping -c 1 server
  done

# Pathensis don't need explicit lone breaks

abc := ('a' +
        'b'
         + 'c')

abc2 := (
  'a' +
  'b' +
  'c'
)

foo param=('foo'
      + 'bar'
    ):
  echo {{param}}

bar: (foo
        'Foo'
     )
  echo 'Bar!'

# Backslash continues as if whitespace

a := 'foo' + \
     'bar'

foo param1 \
  param2='foo' \
  *varparam='': dep1 \
                (dep2 'foo')
  echo {{param1}} {{param2}} {{varparam}}

dep1: \
    # this comment is not part of the recipe body
  echo 'dep1'

dep2 \
  param:
    echo 'Dependency with parameter {{param}}'
  
# Line contiuation in interpolations

recipe:
  echo '{{ \
  "This interpolation " + \
    "has a lot of text." \
  }}'
  echo 'back to recipe body'