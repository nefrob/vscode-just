# Interpolation blocks

# TODO: interpolation blocks always color as strings since we can't
# effectively push scope for nested string/escape blocks

base:
  echo {{var}} {{ var }}
  echo {{ a + 'b' + c }}
  echo {{ 'a' / 'b' }}
  echo '{{ var }}'
  echo '''{{ var }}'''
  echo '{{ 'var' }}'
  echo '''{{ 'var' }}'''

# Braces are escaped

escaped:
  echo '{{{{ var }}'
  echo '''{{{{ var }}'''
  echo {{{{ var }}
  echo '{{ "{{" }} var }}'
  echo {{ "{{" }} var }}
  echo '{{'{{ var }}'}}'
  # TODO: broken nesting
  # echo {{ '{{ var }}' }}
  # echo {{ "{{ var" }} }}
  # echo {{ "{{ 'var' }}" }}
