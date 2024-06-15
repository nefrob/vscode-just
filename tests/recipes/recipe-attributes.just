# Recipe attributes

[doc]
[confirm]
[linux]
[macos]
[no-cd]
[no-exit-message]
[private]
[no-quiet]
[unix]
[windows]
foo:
    echo "foo"

# Attribute chaining

[no-cd, private]
foo:
    echo "foo"

# Attribute values

[confirm("Are you sure you want to delete everything?")]
delete-everything:
    rm -rf *

[confirm: "Are you sure you want to delete everything?"]
delete-everything:
    rm -rf *
