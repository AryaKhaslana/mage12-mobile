import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(auth)/register.tsx'
with open(filepath, 'r') as f:
    content = f.read()

pattern = re.compile(r'(<View style=\{styles\.inputWrapper\}>.*?placeholder="Email".*?</View>)', re.DOTALL)
match = pattern.search(content)

if match:
    email_block = match.group(1)
    new_username_block = """
                {/* Username Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="at-outline" size={20} color={activeInput === 'username' ? '#4CAF50' : '#A0AAB5'} />
                  </View>
                  <TextInput
                    style={[styles.input, activeInput === 'username' && styles.inputFocused]}
                    placeholder="Username (tanpa spasi)"
                    placeholderTextColor="#A0AAB5"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    onFocus={() => setActiveInput('username')}
                    onBlur={() => setActiveInput('')}
                  />
                </View>"""
    
    content = content[:match.end()] + new_username_block + content[match.end():]
    with open(filepath, 'w') as f:
        f.write(content)
    print("Injected Username input into JSX")
else:
    print("Could not find email input block")
