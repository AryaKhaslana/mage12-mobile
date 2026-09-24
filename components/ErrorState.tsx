import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function ErrorState({ 
  onRetry, 
  title = "Sinyal Ilang, Seedling Tidur Dulu ", 
  subtitle = "Koneksi internetmu lagi ngambek nih broskie. Cek kuota atau nyalain WiFi lagi biar Seedling bangun!",
  icon = "wifi-off"
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/icontampilanawal/seedling-ngantuk.svg')} 
        style={{ width: 140, height: 140, marginBottom: 24 }} 
        contentFit="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <Pressable 
        style={({ pressed }) => [
          styles.retryBtn,
          pressed && styles.pressedShadow
        ]}
        onPress={onRetry}
      >
        <MaterialIcons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.retryText}>Coba Lagi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FBF8F0' },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE5E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    
    marginBottom: 24,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#123924',
    textAlign: 'center',
    marginBottom: 12 },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#5C5A4F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B5C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  retryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#FFFFFF' },
  pressedShadow: {
    shadowColor: "#123924", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    transform: [{ scale: 0.98 }] }
});
