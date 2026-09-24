import re

with open('app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

styles_replacement = """const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF8F0",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    paddingTop: 16,
  },

  // Style animasi neobrutalism saat ditekan -> Diubah jadi scale (Clay style)
  pressedShadow4: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FBF8F0",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    color: "#00522c",
  },
  subtitle: {
    fontSize: 14,
    color: "#5C5A4F",
    fontFamily: "Nunito_500Medium",
  },

  tanibotFab: {
    position: "absolute",
    bottom: 16,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3FA86B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    shadowColor: "#3FA86B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 50,
  },
  pressedFab: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#1F5C3D",
    borderRadius: 28,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  fireIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFB627",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#00522c",
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  taskIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: "#F6F3EB",
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 4,
  },
  taskStatus: {
    fontFamily: "Nunito_500Medium",
    fontSize: 11,
    color: "#5C5A4F",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: "#F1EEE6",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDoneCoral: {
    backgroundColor: "#FF6B5C",
  },
  checkboxDoneAmber: {
    backgroundColor: "#FFB627",
  },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  plantCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  plantImagePlaceholder: {"""

# Replace styles block
content = re.sub(r'const styles = StyleSheet\.create\(\{.*?plantImagePlaceholder: \{', styles_replacement, content, flags=re.DOTALL)

# Replace inline Neobrutalism in Modals
content = content.replace(
    "borderWidth: 2, borderColor: '#123924', alignItems: 'center', boxShadow: '3px 3px 0px #123924'",
    "borderWidth: 0, alignItems: 'center', shadowColor: '#123924', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3"
)
content = content.replace(
    "transform: [{ translateY: 3 }, { translateX: 3 }], boxShadow: '0px 0px 0px #123924'",
    "transform: [{ scale: 0.96 }], shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1"
)
content = content.replace(
    "borderWidth: 3, borderColor: '#123924'",
    "borderWidth: 0, shadowColor: '#123924', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 10"
)

with open('app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

