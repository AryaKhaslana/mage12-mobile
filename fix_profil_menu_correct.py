import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add state for Bottom Sheet
if "const [showMoreMenu, setShowMoreMenu] = useState(false);" not in content:
    content = content.replace(
        "const [saved, setSaved] = useState<Record<number, boolean>>({});",
        "const [saved, setSaved] = useState<Record<number, boolean>>({});\n  const [showMoreMenu, setShowMoreMenu] = useState(false);"
    )

# 2. Change handleMore to open the sheet
old_handle_more = """  const handleMore = () => {
    Alert.alert(nama, undefined, [
      { text: "Bagikan Profil", onPress: handleShare },
      { text: "Laporkan Pengguna", style: "destructive", onPress: () => showNotification("Terima kasih", "Laporanmu sudah kami terima", "success") },
      { text: "Batal", style: "cancel" },
    ]);
  };"""
new_handle_more = """  const handleMore = () => {
    setShowMoreMenu(true);
  };"""
content = content.replace(old_handle_more, new_handle_more)

# 3. Add the Bottom Sheet JSX precisely at the end of the SafeAreaView
bottom_sheet_jsx = """      {/* Bottom Sheet Modal */}
      <Modal visible={showMoreMenu} transparent animationType="fade" onRequestClose={() => setShowMoreMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMoreMenu(false)}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{nama}</Text>
            
            <Pressable 
              style={styles.sheetOption} 
              onPress={() => {
                setShowMoreMenu(false);
                setTimeout(handleShare, 300);
              }}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#E8F7EE' }]}>
                <MaterialIcons name="share" size={24} color="#3FA86B" />
              </View>
              <Text style={styles.sheetOptionText}>Bagikan Profil</Text>
            </Pressable>

            <Pressable 
              style={styles.sheetOption} 
              onPress={() => {
                setShowMoreMenu(false);
                setTimeout(() => showNotification("Terima kasih", "Laporanmu sudah kami terima", "success"), 300);
              }}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <MaterialIcons name="report-problem" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.sheetOptionText, { color: '#EF4444' }]}>Laporkan Pengguna</Text>
            </Pressable>

          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>"""

content = content.replace("    </SafeAreaView>", bottom_sheet_jsx)

# 4. Add Bottom Sheet Styles EXACTLY at the end of the file before the final });
bottom_sheet_styles = """
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 48,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 24,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sheetIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
});"""

content = re.sub(r'\}\);$', bottom_sheet_styles, content)

# 5. Make sure Modal is imported
if "Modal," not in content and "Modal " not in content:
    content = content.replace("ActivityIndicator,", "ActivityIndicator,\n  Modal,")

with open(filepath, 'w') as f:
    f.write(content)
print("Updated Bottom Sheet Correctly")
