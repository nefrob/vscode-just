# Builtin functions

system-info:
  @echo "This is an {{arch()}} machine".

home_dir := env_var('HOME')