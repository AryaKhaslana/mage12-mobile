import re

with open('services/notificationService.ts', 'r') as f:
    content = f.read()

# Replace import
content = content.replace(
    'import * as Notifications from "expo-notifications";',
    'import * as Notifications from "expo-notifications";\nimport { SchedulableTriggerInputTypes } from "expo-notifications";'
)

# Replace trigger
old_trigger = """    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    } as any,"""
new_trigger = """    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: hour,
      minute: minute,
    },"""

content = content.replace(old_trigger, new_trigger)

with open('services/notificationService.ts', 'w') as f:
    f.write(content)
