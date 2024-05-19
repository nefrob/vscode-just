# Escaped blocks

publish:
  rm -f {{tarball}}
  mkdir {{tardir}}
  cp README.md *.c {{tardir}}
  tar zcvf {{tarball}} {{tardir}}
  scp {{tarball}} me@server.com:release/
  rm -rf {{tarball}} {{tardir}}

braces:
  echo 'I {{{{LOVE}} curly braces!'

braces:
  echo '{{'I {{LOVE}} curly braces!'}}'

braces:
  echo 'I {{ "{{" }}LOVE}} curly braces!'