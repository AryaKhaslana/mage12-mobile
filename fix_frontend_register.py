import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(auth)/register.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add state for username
old_state = """  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');"""
new_state = """  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');"""
content = content.replace(old_state, new_state)

# 2. Add validation logic
old_validation = """  const handleRegister = async () => {
    if (!nama || !email || !password || !confirmPassword) {"""
new_validation = """  const handleRegister = async () => {
    if (!nama || !email || !username || !password || !confirmPassword) {"""
content = content.replace(old_validation, new_validation)

# 3. Add to API payload
old_payload = """        nama,
        email,
        password,"""
new_payload = """        nama,
        email,
        username,
        password,"""
content = content.replace(old_payload, new_payload)

# 4. Add UI Input field for Username (below Email)
old_input = """            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#3FA96B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Alamat Email" 
                placeholderTextColor="#A1A8B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>"""

new_input = """            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#3FA96B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Alamat Email" 
                placeholderTextColor="#A1A8B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="alternate-email" size={20} color="#3FA96B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Username (tanpa spasi)" 
                placeholderTextColor="#A1A8B0"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>"""
content = content.replace(old_input, new_input)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated register.tsx")
