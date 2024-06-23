# Demo

set tempdir := "/tmp"

export MY_VAR := `./my_script.sh`

[confirm: "Continue?"]
@foo PARAM_1="hello" PARAM_2="world" +ARGS:
    echo {{ PARAM_1 }} {{ PARAM_2 }} {{ ARGS }}

python:
  #!/usr/bin/env python3
  print('Hello from python!')
