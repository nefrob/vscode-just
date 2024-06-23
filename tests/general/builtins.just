# Builin keywords

alias
set
export
import
mod

# Control keywords

if
else

# Builtin functions

# System info

arch()
num_cpus()
os()
os_family()

# External commands

shell(command, arg1)

# Environment variables

env_var(key)
env_var_or_default(key, default)
env(key)
env(key, default)

# Invocation information

is_dependency()

# Invocation directory

invocation_directory()

# Just

justfile()
justfile_directory()
just_executable()
just_pid()

# Source

source_file()
source_directory()
module_file()
module_directory()


# Strings

append(suffix, s)
prepend(prefix, s)
encode_uri_component(s)
quote(s)
replace(s, from, to) 
replace_regex(s, regex, replacement)
trim(s)
trim_end(s)
trim_end_match(s, pat)
trim_end_matches(s, pat) 
trim_start(s) 
trim_start_match(s, pat)
trim_start_matches(s, pat)

capitalize(s)
kebabcase(s)
lowercamelcase(s)
lowercase(s)
shoutykebabcase(s)
shoutysnakecase(s)
snakecase(s)
titlecase(s)
uppercamelcase(s)
uppercase(s)

# Paths

absolute_path(path)
canonicalize(path)
extension(path)
file_name(path)
file_stem(path)
parent_directory(path)
without_extension(path)

clean(path)
join(a, b)

path_exists(path)

# Errors

error(message)
assert(condition, expressions)

# Utils

blake3(string)
blake3_file(path)
sha256(string)
sha256_file(path)
uuid()

choose(n, alphabet)

datetime(format)
datetime_utc(format)

semver_matches(version, requirement)

cache_directory()
config_directory()
config_local_directory()
data_directory()
data_local_directory()
executable_directory()
home_directory()
