# Checking if bounds are properly respected for embedded languages

sh:
    #!/usr/bin/env sh
    hello='Yo'
    echo "$hello from a shell script!"

python:
    #!/usr/bin/env python3
    class Hello:
        def __init__(self):
            print('Hello from python!')
    print('Hello from python!')
another-sh:
    #!/usr/bin/env sh
    hello='Yo'
    echo "$hello from a shell script!"

python-with-param hello="Hello":
    #!/usr/bin/env python3
    class Hello:
        def __init__(self, hello):
            self.hello = hello
    print('Hello from python: {{hello}}')

sh-with-deps: sh (python-with-param "Hello") (another-sh)
    #!/usr/bin/env sh
    echo "Hello from sh!"

python-with-deps-on-multiple-lines: \
    sh \
    (python-with-param "Hello") \
    (another-sh)
    #!/usr/bin/env python3
    class Hello:
        def __init__(self, hello):
            self.hello = hello
    print('Hello from python!')
