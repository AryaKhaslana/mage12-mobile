import re

with open('app/(tabs)/index.tsx', 'r') as f:
    content = f.read()

old_emptyhint = """const EmptyHint = ({
  icon,
  title,
  subtitle,
  ctaText,
  onCtaPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaPress?: () => void;
}) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
    }}
  >
    <MaterialIcons
      name={icon}
      size={40}
      color="#bdcabd"
      style={{ marginBottom: 12 }}
    />"""

new_emptyhint = """const EmptyHint = ({
  icon,
  imageSource,
  title,
  subtitle,
  ctaText,
  onCtaPress,
}: {
  icon?: any;
  imageSource?: any;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaPress?: () => void;
}) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
    }}
  >
    {imageSource ? (
      <Image 
        source={imageSource} 
        style={{ width: 120, height: 120, marginBottom: 12, resizeMode: 'contain' }} 
      />
    ) : (
      <MaterialIcons
        name={icon}
        size={40}
        color="#bdcabd"
        style={{ marginBottom: 12 }}
      />
    )}"""

content = content.replace(old_emptyhint, new_emptyhint)

# Now find where EmptyHint is called in index.tsx
old_hint_tugas = """            <EmptyHint
              icon="spa"
              title="Wah, semua tugas selesai! 🎉"
              subtitle="Tanamamu sudah aman hari ini."
            />"""

new_hint_tugas = """            <EmptyHint
              imageSource={require("../../assets/images/icontampilanawal/seedling-lompat.png")}
              title="Wah, semua tugas selesai! 🎉"
              subtitle="Tanamamu sudah aman hari ini."
            />"""

content = content.replace(old_hint_tugas, new_hint_tugas)

old_hint_tanaman = """            {tanamanList.length === 0 ? (
              <EmptyHint
                icon="local-florist"
                title="Kebunmu masih kosong nih 🌱"
                subtitle="Yuk mulai tanam tanaman pertamamu!"
                ctaText="Tanam Sekarang"
                onCtaPress={() => router.push("/(tabs)/tanaman")}
              />
            ) : ("""

new_hint_tanaman = """            {tanamanList.length === 0 ? (
              <EmptyHint
                imageSource={require("../../assets/images/icontampilanawal/seedling-menanam.png")}
                title="Kebunmu masih kosong nih 🌱"
                subtitle="Yuk mulai tanam tanaman pertamamu!"
                ctaText="Tanam Sekarang"
                onCtaPress={() => router.push("/(tabs)/tanaman")}
              />
            ) : ("""
content = content.replace(old_hint_tanaman, new_hint_tanaman)

with open('app/(tabs)/index.tsx', 'w') as f:
    f.write(content)
