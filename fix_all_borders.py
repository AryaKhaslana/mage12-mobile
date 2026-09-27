import os
import re

def clean_borders(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # We want to remove properties like borderTopWidth: 2, borderBottomColor: '#123924', etc.
    # The regex \s*border(?:Top|Bottom|Left|Right)?(?:Width|Color):\s*(?:\d+|['"]#[0-9a-fA-F]{6}['"])\s*,?
    
    # Let's specifically target the #123924 border colors and all border widths > 0.
    # Wait, some border widths might be set to 0. We can just leave them or remove them.
    # To be safe, we'll remove all border(Top|Bottom|Left|Right)Width: (1|2|3|4)
    content = re.sub(r'border(?:Top|Bottom|Left|Right)Width:\s*[1-4]\s*,?', '', content)
    
    # Remove old borderColor variants that are #123924
    content = re.sub(r'border(?:Top|Bottom|Left|Right)Color:\s*[\'"]#123924[\'"]\s*,?', '', content)
    
    # Remove any stray borderColor: '#123924' that Fatih might have missed
    content = re.sub(r'borderColor:\s*[\'"]#123924[\'"]\s*,?', '', content)
    
    if content != original:
        # Check for trailing commas or weird syntax left behind
        # Actually it's easier to just strip them cleanly. Let's do a basic write.
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Cleaned {filepath}")

for root, _, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx'):
            clean_borders(os.path.join(root, file))

print("All leftover borders cleaned!")
