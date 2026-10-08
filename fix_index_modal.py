import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(tabs)/index.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add import
if "import ProfileOnboardingModal" not in content:
    content = content.replace(
        "import CoachMarkOverlay from '../../components/dashboard/CoachMarkOverlay';",
        "import CoachMarkOverlay from '../../components/dashboard/CoachMarkOverlay';\nimport ProfileOnboardingModal from '../../components/dashboard/ProfileOnboardingModal';"
    )

# 2. Add state
if "const [showProfilePopup, setShowProfilePopup] = useState(false);" not in content:
    content = content.replace(
        "const [showRestorePopup, setShowRestorePopup] = useState(false);",
        "const [showRestorePopup, setShowRestorePopup] = useState(false);\n  const [showProfilePopup, setShowProfilePopup] = useState(false);"
    )

# 3. Trigger popup on data fetch
trigger_logic = """      // Tampilkan popup lengkapi profil jika username masih kosong (misal hasil login Google)
      if (meRes?.data?.data && !meRes.data.data.username) {
        setShowProfilePopup(true);
      }"""
if trigger_logic not in content:
    old_fetch = """      setUserData(meRes?.data?.data || null);

      if (meRes?.data?.data?.tanaman) {"""
    
    new_fetch = """      setUserData(meRes?.data?.data || null);

      // Tampilkan popup lengkapi profil jika username masih kosong (misal hasil login Google)
      if (meRes?.data?.data && !meRes.data.data.username) {
        setShowProfilePopup(true);
      }

      if (meRes?.data?.data?.tanaman) {"""
    
    content = content.replace(old_fetch, new_fetch)

# 4. Add modal JSX
modal_jsx = """      <ProfileOnboardingModal 
        isVisible={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        onSuccess={(newUsername) => {
          setShowProfilePopup(false);
          setUserData((prev: any) => prev ? { ...prev, username: newUsername } : prev);
          showNotification("Cakep!", "Username lu berhasil disimpen.", "success");
        }}
      />"""

if "<ProfileOnboardingModal" not in content:
    content = content.replace(
        "      <CoachMarkOverlay",
        modal_jsx + "\n\n      <CoachMarkOverlay"
    )

with open(filepath, 'w') as f:
    f.write(content)
print("Updated index.tsx with ProfileOnboardingModal")
