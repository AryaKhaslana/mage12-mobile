import re

with open('app/onboarding.tsx', 'r') as f:
    content = f.read()

# Slide 2: seedling-diam.png -> seedling-menanam.png
content = content.replace(
    '''  {
    id: "2",
    title: "TaniSync itu apa sih?",
    description:
      "Aplikasi asisten urban farming yang bantu kamu nanem sayur sendiri di rumah — walau cuma punya balkon kecil sekalipun.",
    image: require("../assets/images/icontampilanawal/seedling-diam.png"),
  },''',
    '''  {
    id: "2",
    title: "TaniSync itu apa sih?",
    description:
      "Aplikasi asisten urban farming yang bantu kamu nanem sayur sendiri di rumah — walau cuma punya balkon kecil sekalipun.",
    image: require("../assets/images/icontampilanawal/seedling-menanam.png"),
  },'''
)

# Slide 3: seedling-diam.png -> seedling-lompat.png
content = content.replace(
    '''  {
    id: "3",
    title: "Gak akan lupa lagi",
    description:
      "Reminder otomatis kapan harus nyiram & mupuk, plus kumpulin streak tiap kali kamu rajin ngerawat tanaman.",
    image: require("../assets/images/icontampilanawal/seedling-diam.png"),
  },''',
    '''  {
    id: "3",
    title: "Gak akan lupa lagi",
    description:
      "Reminder otomatis kapan harus nyiram & mupuk, plus kumpulin streak tiap kali kamu rajin ngerawat tanaman.",
    image: require("../assets/images/icontampilanawal/seedling-lompat.png"),
  },'''
)

# Slide 4: seedling-diam.png -> seedling-meneropong.png
content = content.replace(
    '''  {
    id: "4",
    title: "Kecil tapi berdampak",
    description:
      "Setiap tanaman yang kamu rawat bantu ketahanan pangan mandiri di kotamu — kecil tapi nyata.",
    image: require("../assets/images/icontampilanawal/seedling-diam.png"),
  },''',
    '''  {
    id: "4",
    title: "Kecil tapi berdampak",
    description:
      "Setiap tanaman yang kamu rawat bantu ketahanan pangan mandiri di kotamu — kecil tapi nyata.",
    image: require("../assets/images/icontampilanawal/seedling-meneropong.png"),
  },'''
)

with open('app/onboarding.tsx', 'w') as f:
    f.write(content)
