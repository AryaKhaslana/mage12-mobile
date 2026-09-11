import json

with open('app.json', 'r') as f:
    app_data = json.load(f)

for plugin in app_data['expo']['plugins']:
    if isinstance(plugin, list) and plugin[0] == "expo-notifications":
        if "icon" in plugin[1]:
            del plugin[1]["icon"]

with open('app.json', 'w') as f:
    json.dump(app_data, f, indent=2)
