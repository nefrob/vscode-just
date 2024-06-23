# Strings

# Escaping sequences

string-with-tab             := "\t"
string-with-newline         := "\n"
string-with-carriage-return := "\r"
string-with-double-quote    := "\""
string-with-slash           := "\\"
string-with-no-newline      := "\
"

escapes := """\t\n\r\"\\"""
escapes := '\t\n\r\"\\'
escapes := '''\t\n\r\"\\'''

# Multi-line

single := '
hello
'

double := "
goodbye
"

# Indented

x := '''
  foo
  bar
'''

y := """
  abc
    wuv
  xyz
"""

# Expanded

foobar := x"~/$FOO/${BAR}"
foobar := x"""~/$FOO/${BAR}"""
foobar := x'~/$FOO/${BAR}'
foobar := x'''~/$FOO/${BAR}'''
