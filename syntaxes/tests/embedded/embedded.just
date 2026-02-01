# Embedded languages
# TODO: how to test embedded grammars in snapshots?

python:
    #!/usr/bin/env python3
    print('Hello from python!')

js:
    #!/usr/bin/env node
    console.log('Greetings from JavaScript!')

deno:
    #!/usr/bin/env deno run
    console.log('Hello from Deno!');
    const name: string = 'Deno';

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

empty-lines:
    #!/usr/bin/env python3
    print('Hello from python!')

    print('Hello from python!')

bash-with-env-S:
    #!/usr/bin/env -S bash -Eeuo pipefail
    echo "Highlighting should work with -S flag"
    set +e
    echo "This is a shell script"

python-with-env-S:
    #!/usr/bin/env -S python3 -u
    print('Python with -S flag')
    print('Should have proper highlighting')

node-with-env-S:
    #!/usr/bin/env -S node --trace-warnings
    console.log('Node.js with -S flag');
    console.log('Should have proper highlighting');

deno-with-env-S:
    #!/usr/bin/env -S deno run --allow-run --allow-read --allow-env --allow-write
    console.log('Deno with -S flag and multiple permissions');
    const data: string = 'TypeScript works!';

