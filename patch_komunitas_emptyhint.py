import re

with open('app/(tabs)/komunitas.tsx', 'r') as f:
    content = f.read()

old_emptyhint = """const EmptyHint = ({ icon, title, subtitle, ctaText, onCtaPress }: { icon: any, title: string, subtitle: string, ctaText?: string, onCtaPress?: () => void }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 16 }}>
    <MaterialIcons name={icon} size={48} color="#bdcabd" style={{ marginBottom: 16 }} />"""

new_emptyhint = """const EmptyHint = ({ icon, imageSource, title, subtitle, ctaText, onCtaPress }: { icon?: any, imageSource?: any, title: string, subtitle: string, ctaText?: string, onCtaPress?: () => void }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 16 }}>
    {imageSource ? (
      <Image source={imageSource} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
    ) : (
      <MaterialIcons name={icon} size={48} color="#bdcabd" style={{ marginBottom: 16 }} />
    )}"""

content = content.replace(old_emptyhint, new_emptyhint)

# Find where EmptyHint is called for Posts and Search
# Case 1: Postingan kosong
content = content.replace(
    '<EmptyHint\n              icon="speaker-notes-off"\n              title="Belum ada obrolan"',
    '<EmptyHint\n              imageSource={require("../../assets/images/icontampilanawal/seedling-meneropong.png")}\n              title="Belum ada obrolan"'
)
# Case 2: Postingan populer
content = content.replace(
    '<EmptyHint\n                  icon="trending-down"\n                  title="Belum ada yang populer"',
    '<EmptyHint\n                  imageSource={require("../../assets/images/icontampilanawal/seedling-meneropong.png")}\n                  title="Belum ada yang populer"'
)
# Case 3: Error state or whatever else uses EmptyHint in search (if any)
content = content.replace(
    'icon="search-off"\n                  title="Pencarian tidak ditemukan"',
    'imageSource={require("../../assets/images/icontampilanawal/seedling-meneropong.png")}\n                  title="Pencarian tidak ditemukan"'
)


with open('app/(tabs)/komunitas.tsx', 'w') as f:
    f.write(content)
