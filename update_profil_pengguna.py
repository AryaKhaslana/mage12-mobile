import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace userId with username in params
content = content.replace(
    "const { userId } = useLocalSearchParams<{ userId: string }>();",
    "const { username } = useLocalSearchParams<{ username: string }>();"
)
content = content.replace(
    "const parsedUserId = Number(userId);",
    "const parsedUserId = username; // Keep variable name for simplicity or rename, but let's just use username directly."
)

# Actually, let's just properly replace all `parsedUserId` to `targetUsername` or something.
# But regex is safer. Let's just sed/replace specific lines.
