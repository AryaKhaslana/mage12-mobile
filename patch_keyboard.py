import re

with open('app/(tabs)/tanibot.tsx', 'r') as f:
    content = f.read()

hook_code = """
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);
"""

# Insert the hook
content = re.sub(
    r'(const flatListRef = useRef<FlatList>\(null\);)',
    r'\1\n' + hook_code,
    content
)

# Update the view style
content = content.replace(
    '<View style={styles.inputArea}>',
    '<View style={[styles.inputArea, isKeyboardVisible && { paddingBottom: 16 }]}>'
)

with open('app/(tabs)/tanibot.tsx', 'w') as f:
    f.write(content)

print("Keyboard logic patched!")
