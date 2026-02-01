# Strings

# Quote within a string

single-quote := "don't be afraid of contractions"

# Escaping sequences

carriage-return   := "\r"
double-quote      := "\""
newline           := "\n"
no-newline        := "\
"
slash             := "\\"
tab               := "\t"
unicode-codepoint := "\u{1F916}"
non-unicode-not-escaped := "\a{1F916}"

escapes := """\t\n\r\"\u{123}\\"""
escapes := '\t\n\r\"\u{123}\\'
escapes := '''\t\n\r\"\u{123}\\'''

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

# TODO: should there be special highlighting for these strings?

foobar  := x"~/$FOO/${BAR}"
foobar  := x"""~/$FOO/${BAR}"""
foobar  := x'~/$FOO/${BAR}'
foobar  := x'''~/$FOO/${BAR}'''
message := f'Hello, {{name}}!'
foo     := f'I {{{{LOVE} curly braces!'
