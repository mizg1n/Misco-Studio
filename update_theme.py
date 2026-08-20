import os
import re

directory = r"C:\Users\Casper\Desktop\tattoo-parlor-manager\frontend\src"

def replace_colors(content):
    # Mapping for colors
    content = content.replace("purple-", "yellow-")
    content = content.replace("pink-", "amber-")
    content = content.replace("indigo-", "orange-")
    return content

count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = replace_colors(content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1

print(f"Updated colors in {count} files")