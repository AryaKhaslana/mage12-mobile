import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(auth)/register.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_email_input = """                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail-outline" size={20} color={activeInput === 'email' ? '#4CAF50' : '#A0AAB5'} />
                  </View>
                  <TextInput
                  style={[styles.input, activeInput === 'email' && styles.inputFocused]}
                  placeholder="Email"
                  placeholderTextColor="#A0AAB5"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput('')}
                  />
                </View>"""

new_inputs = """                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail-outline" size={20} color={activeInput === 'email' ? '#4CAF50' : '#A0AAB5'} />
                  </View>
                  <TextInput
                  style={[styles.input, activeInput === 'email' && styles.inputFocused]}
                  placeholder="Email"
                  placeholderTextColor="#A0AAB5"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput('')}
                  />
                </View>

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

if old_email_input in content:
    content = content.replace(old_email_input, new_inputs)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Injected Username input into JSX")
else:
    print("Could not find email input block")
