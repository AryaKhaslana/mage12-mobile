import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("const userId = Number(params.userId);", "const targetUsername = params.username;")
content = content.replace("if (!userId) return;", "if (!targetUsername) return;")
content = content.replace("getPublicUserProfile(userId)", "getPublicUserProfile(targetUsername)")
content = content.replace("getUserCommunityPosts(userId, 1, 20)", "getUserCommunityPosts(targetUsername, 1, 20)")
content = content.replace("getUserPublicTanaman(userId)", "getUserPublicTanaman(targetUsername)")
content = content.replace("}, [userId]);", "}, [targetUsername]);")
content = content.replace("if (me?.id && me.id === userId) {", "if (me?.username && me.username === targetUsername) {")
content = content.replace("}, [userId, fetchAll]);", "}, [targetUsername, fetchAll]);")
# Note: toggleFollowUser might still need an ID or we can change it to username.
# Let's assume toggleFollowUser takes a username if we change the backend, but backend toggleFollow uses ID.
# Wait! In the API `getPublicUserProfile`, the response includes `id`. So we can use `profileData?.id` for toggleFollowUser!
content = content.replace("const res = await toggleFollowUser(userId);", "if (!profileData?.id) return;\n      const res = await toggleFollowUser(profileData.id);")

with open(filepath, 'w') as f:
    f.write(content)
print("Updated profil-pengguna.tsx to use targetUsername")
