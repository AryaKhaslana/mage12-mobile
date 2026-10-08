import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(auth)/register.tsx'
with open(filepath, 'r') as f:
    content = f.read()

pattern = re.compile(r'(<View style=\{styles\.inputContainer\}>\s*<TextInput\s*style=\{\[styles\.input, activeInput === \'email\' && styles\.inputFocused\]\}\s*placeholder="Email".*?</View>)', re.DOTALL)
match = pattern.search(content)

if match:
    new_username_block = """

              {/* Username */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, activeInput === 'username' && styles.inputFocused]}
                  placeholder="Username (tanpa spasi)"
                  placeholderTextColor="#8F9B94"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  onFocus={() => setActiveInput('username')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>"""
    
    content = content[:match.end()] + new_username_block + content[match.end():]
    with open(filepath, 'w') as f:
        f.write(content)
    print("Injected Username input into JSX")
else:
    print("Could not find email input block")
