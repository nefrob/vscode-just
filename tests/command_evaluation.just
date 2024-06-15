# command evaluation

localhost := `dumpinterfaces | cut -d: -f2 | sed 's/\/.*//' | sed 's/ //g'`

stuff := ```
    echo foo
    echo bar
  ```