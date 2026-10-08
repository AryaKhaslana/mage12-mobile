import re

with open('app/cuaca.tsx', 'r') as f:
    content = f.read()

# Change the section title and array mapping
content = content.replace('Prakiraan 3 Hari', 'Prakiraan 5 Hari')
content = content.replace('(weatherData.forecast3Days || [])', '(weatherData.forecast5Days || [])')

with open('app/cuaca.tsx', 'w') as f:
    f.write(content)

print("Fixed frontend to 5 days")
