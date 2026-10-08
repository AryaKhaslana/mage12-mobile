const fs = require('fs');
let code = fs.readFileSync('app/edit-profil.tsx', 'utf-8');

// 1. Add states
code = code.replace(
  /const \[avatarUrl, setAvatarUrl\] = useState<string \| null>\(null\);/,
  `const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);`
);

code = code.replace(
  /const \[fotoBaru, setFotoBaru\] = useState<ImagePicker\.ImagePickerAsset \| null>\(null\);/,
  `const [fotoBaru, setFotoBaru] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [bannerBaru, setBannerBaru] = useState<ImagePicker.ImagePickerAsset | null>(null);`
);

// 2. Add to initialData
code = code.replace(
  /setAvatarUrl\(user\.avatarUrl \|\| null\);/,
  `setAvatarUrl(user.avatarUrl || null);
        setBannerUrl(user.bannerUrl || null);`
);

// 3. Add pickBanner
code = code.replace(
  /const pickImage = async \(\) => \{[\s\S]*?\}\s*;\s*const handleSave = async \(\) => \{/,
  `const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'TaniSync butuh izin akses galeri buat ganti avatar broskie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7 });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoBaru(result.assets[0]);
    }
  };

  const pickBanner = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'TaniSync butuh izin akses galeri buat ganti banner broskie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7 });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setBannerBaru(result.assets[0]);
    }
  };

  const handleSave = async () => {`
);

// 4. Append to FormData
code = code.replace(
  /if \(fotoBaru\) \{[\s\S]*?as any\);\s*\}/,
  `if (fotoBaru) {
        formData.append("avatar", {
          uri: fotoBaru.uri,
          name: "avatar.jpg",
          type: "image/jpeg"
        } as any);
      }
      
      if (bannerBaru) {
        formData.append("banner", {
          uri: bannerBaru.uri,
          name: "banner.jpg",
          type: "image/jpeg"
        } as any);
      }`
);

// 5. Add UI logic for banner
code = code.replace(
  /const displayAvatarUri = fotoBaru \? fotoBaru\.uri : avatarUrl;/,
  `const displayAvatarUri = fotoBaru ? fotoBaru.uri : avatarUrl;
  const displayBannerUri = bannerBaru ? bannerBaru.uri : bannerUrl;`
);

// 6. Update UI
code = code.replace(
  /\{\/\* AVATAR \*\/\}/,
  `{/* BANNER SECTION */}
            <View style={styles.bannerSection}>
              <Pressable onPress={pickBanner} style={({ pressed }) => [styles.bannerContainer, pressed && { opacity: 0.8 }]}>
                {displayBannerUri ? (
                  <Image source={{ uri: displayBannerUri }} style={styles.bannerImage} />
                ) : (
                  <View style={styles.bannerPlaceholder}>
                    <MaterialIcons name="image" size={32} color="#a09d91" />
                  </View>
                )}
                <View style={styles.bannerEditBadge}>
                  <MaterialIcons name="camera-alt" size={14} color="#FFFFFF" />
                </View>
              </Pressable>
              <Text style={styles.avatarHint}>Tap untuk ganti banner</Text>
            </View>

            {/* AVATAR */}`
);

// 7. Add Styles
code = code.replace(
  /avatarSection: \{/,
  `bannerSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  bannerContainer: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E8E5DA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E5DA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#123924',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  avatarSection: {`
);

fs.writeFileSync('app/edit-profil.tsx', code);
