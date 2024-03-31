

# Test braces escape content

@b1 var="1":
  # 1
  echo {{var}}
  echo {{ var }}
  echo '{{var}}'
  echo '{{ var }}'
  echo '''{{var}}'''
  echo '''{{ var }}'''

  # var
  echo {{'var'}}
  echo {{ 'var' }}

  # strange
  echo '{{'var'}}'
  echo '''{{'''var'''}}'''
  echo '{{' var '}}'
  echo '''{{''' var '''}}'''
  echo '{{ 'var' }}'
  echo '''{{ '''var''' }}'''
  echo ' {{ 'var' }} '
  echo ''' {{ '''var''' }} '''
  echo '{{ 'a' + var +  'b' }}'

# Test braces are escaped

@b2 var="1":
  echo '{{{{ var }}'
  echo '''{{{{ var }}'''
  echo {{{{ var }}
  echo '{{ "{{" }} var }}'
  echo '''{{ "{{" }} var }}'''
  echo '''{{ """{{""" }} var }}'''
  echo {{ "{{" }} var }}
  echo {{ """{{""" }} var }}
  echo '{{'{{ var }}'}}'
  echo '''{{'''{{ var }}'''}}'''
  echo {{ '{{ var }}' }}
  echo {{ '''{{ var }}''' }}
  echo {{ "{{ var" }} }}
  echo {{ "{{ var }}" }}
  echo {{ "{{ 'var' }}" }}

# Illegal for justfiles

# echo '{{' {{ 'var' }} '}}'
# echo {{' {{ 'var' }} '}}
# echo {{{ var }}

  