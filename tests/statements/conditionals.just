# Conditional expressions

foo := if "2" == "2" { "Good!" } else { "1984" }
foo := if "hello" != "goodbye" { "xyz" } else { "abc" }
foo := if "hello" =~ 'hel+o' { "match" } else { "mismatch" }
foo := if env_var("RELEASE") == "true" { `get-something-from-release-database` } else { "dummy-value" }
foo := if "hello" == "goodbye" {
  "xyz"
} else if "a" == "a" {
  "abc"
} else {
  "123"
}