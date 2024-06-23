# Escaped blocks

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
  echo {{ '{{ var }}' }}
  echo {{ "{{ var" }} }}
  echo {{ "{{ var }}" }}
  echo {{ "{{ 'var' }}" }}
