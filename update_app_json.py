import json

with open('app.json', 'r') as f:
    data = json.load(f)

data['expo']['icon'] = "./assets/images/icontampilanawal/icon-aplikasi.png"
data['expo']['splash'] = {
    "image": "./assets/images/icontampilanawal/icon-aplikasi.png",
    "resizeMode": "contain",
    "backgroundColor": "#FBF8F0"
}

with open('app.json', 'w') as f:
    json.dump(data, f, indent=2)

print("app.json updated with icon and splash screen")
