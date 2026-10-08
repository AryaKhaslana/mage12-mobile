import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_banner = "{/* BANNER */}\n        <BotanicBanner />"
new_banner = """{/* BANNER */}
        {profile?.bannerUrl ? (
          <Image source={{ uri: profile.bannerUrl }} style={[styles.banner, shadowCard]} contentFit="cover" />
        ) : params.bannerUrl ? (
          <Image source={{ uri: params.bannerUrl }} style={[styles.banner, shadowCard]} contentFit="cover" />
        ) : (
          <BotanicBanner />
        )}"""

content = content.replace(old_banner, new_banner)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated banner logic")
