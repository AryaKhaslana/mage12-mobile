import re

with open('app/(tabs)/komunitas.tsx', 'r') as f:
    content = f.read()

# 1. Add imports (Modal, TextInput, Animated, Alert, * as ImagePicker)
import_patch = """import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView, Image, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';"""
content = re.sub(r"import React, { useState, useCallback } from 'react';\nimport { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView, Image, ActivityIndicator, RefreshControl } from 'react-native';", import_patch, content)

# 2. Add Skeleton Component
skeleton_patch = """
const PostSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.45, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.postCard, { opacity: fadeAnim, marginBottom: 16 }]}>
      <View style={styles.postHeader}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8E5DA' }} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ width: 120, height: 10, borderRadius: 5, backgroundColor: '#E8E5DA' }} />
          <View style={{ width: 60, height: 10, borderRadius: 5, backgroundColor: '#E8E5DA' }} />
        </View>
        <View style={{ width: 90, height: 20, borderRadius: 100, backgroundColor: '#E8E5DA' }} />
      </View>
      <View style={{ gap: 6, marginBottom: 12 }}>
        <View style={{ width: '100%', height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: '100%', height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
      </View>
      <View style={{ width: '100%', aspectRatio: 4/3, borderRadius: 16, backgroundColor: '#E8E5DA' }} />
    </Animated.View>
  );
};
"""
content = content.replace("export default function KomunitasScreen() {", skeleton_patch + "\nexport default function KomunitasScreen() {")

# 3. Add Modal State and Handle Submit to KomunitasScreen
modal_state_patch = """  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tipePost, setTipePost] = useState<"progress_update" | "panen_surplus" | "pertanyaan">("progress_update");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFoto(result.assets[0]);
    }
  };

  const handleSubmitPost = async () => {
    if (!deskripsi.trim()) {
      Alert.alert("Error", "Deskripsi belum diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("tipePost", tipePost);
      formData.append("deskripsi", deskripsi);
      if (foto) {
        formData.append("foto", {
          uri: foto.uri,
          name: "foto.jpg",
          type: "image/jpeg",
        } as any);
      }

      await api.post("/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Sukses", "Berhasil posting broskie!");
      setIsModalVisible(false);
      setDeskripsi("");
      setFoto(null);
      setTipePost("progress_update");
      handleRefresh();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal memposting.";
      if (msg.toLowerCase().includes("lokasi")) {
        Alert.alert("Lokasi belum lengkap", msg, [
          { text: "OK", onPress: () => router.push("/(tabs)/profil") }
        ]);
      } else {
        Alert.alert("Gagal", msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };"""
content = content.replace("const limit = 10;", "const limit = 10;\n" + modal_state_patch)

# 4. Replace loading screen with Skeleton
old_loading = """  if (isLoading && !isRefreshing && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3FA86B" />
      </SafeAreaView>
    );
  }"""
new_loading = """  if (isLoading && !isRefreshing && posts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Komunitas</Text>
        </View>
        <View style={styles.scrollContent}>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </View>
      </SafeAreaView>
    );
  }"""
content = content.replace(old_loading, new_loading)

# 5. Add FAB and Modal UI
modal_ui = """
        {coords && (
          <Pressable 
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.pressedShadow4
            ]}
            onPress={() => setIsModalVisible(true)}
          >
            <MaterialIcons name="add" size={28} color="#FFFFFF" />
          </Pressable>
        )}

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => !isSubmitting && setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bagikan ke Komunitas</Text>
                <Pressable onPress={() => !isSubmitting && setIsModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#123924" />
                </Pressable>
              </View>

              <View style={styles.chipRow}>
                {[
                  { label: "Progress 🌱", value: "progress_update" },
                  { label: "Panen Surplus 🌾", value: "panen_surplus" },
                  { label: "Pertanyaan ❓", value: "pertanyaan" }
                ].map(chip => (
                  <Pressable
                    key={chip.value}
                    style={[styles.chip, tipePost === chip.value ? styles.chipActive : styles.chipInactive]}
                    onPress={() => setTipePost(chip.value as any)}
                  >
                    <Text style={[styles.chipText, tipePost === chip.value ? styles.chipTextActive : styles.chipTextInactive]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="Ceritakan panenmu, tanya sesuatu..."
                  placeholderTextColor="#bdcabd"
                  value={deskripsi}
                  onChangeText={setDeskripsi}
                  maxLength={500}
                />
                <Text style={styles.counterText}>{deskripsi.length}/500</Text>
              </View>

              {!foto ? (
                <Pressable style={styles.photoButton} onPress={handlePickImage}>
                  <Text style={styles.photoButtonText}>📷 Pilih Foto</Text>
                </Pressable>
              ) : (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: foto.uri }} style={styles.previewImage} />
                  <Pressable style={styles.removePhotoButton} onPress={() => setFoto(null)}>
                    <MaterialIcons name="close" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}

              <Pressable 
                style={styles.submitButton}
                onPress={handleSubmitPost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Posting!</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
"""
content = content.replace("      </View>\n    </SafeAreaView>", modal_ui)

# 6. Add Styles correctly
styles_patch = """,
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '4px 4px 0px #123924',
    elevation: 5,
    zIndex: 50,
  },
  pressedShadow4: {
    boxShadow: '0px 0px 0px #123924',
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18,57,36,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FBF8F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: '#123924',
    borderBottomWidth: 0,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
  },
  chipActive: {
    backgroundColor: '#3FA86B',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#3e4a40',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 16,
    padding: 16,
    height: 120,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#123924',
    textAlignVertical: 'top',
  },
  counterText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 10,
    color: '#5C5A4F',
    textAlign: 'right',
    marginTop: 4,
  },
  photoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 100,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  photoButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#123924',
  },
  previewContainer: {
    width: 120,
    aspectRatio: 4/3,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(18,57,36,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#1F5C3D',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    alignItems: 'center',
    boxShadow: '4px 4px 0px #123924',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
  }
});"""

content = re.sub(r"  distanceText: {\n    fontSize: 10,\n    color: '#5C5A4F',\n    fontFamily: 'Nunito_500Medium',\n  },\n});", "  distanceText: {\n    fontSize: 10,\n    color: '#5C5A4F',\n    fontFamily: 'Nunito_500Medium',\n  }" + styles_patch, content)

with open('app/(tabs)/komunitas.tsx', 'w') as f:
    f.write(content)
