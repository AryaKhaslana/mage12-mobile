with open('app/detail-tanaman.tsx', 'r') as f:
    content = f.read()

# 1. Hide/Disable actions if already watered
old_action = """        {/* ACTION BUTTONS (Sesuai mockup tapi dimodif buat Konfirmasi Disiram) */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.btnWhite]} onPress={handleValidasiButton} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#123924" /> : <Text style={styles.btnWhiteText}>Konfirmasi{`\\n`}Disiram</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.btnGreen]} onPress={handleValidasiPhoto} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnGreenText}>Foto &{`\\n`}Validasi</Text>}
          </TouchableOpacity>
        </View>"""

new_action = """        {/* ACTION BUTTONS (Sesuai mockup tapi dimodif buat Konfirmasi Disiram) */}
        {tanaman.statusPenyiraman !== "SUDAH_DISIRAM" && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.btnWhite]} onPress={handleValidasiButton} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#123924" /> : <Text style={styles.btnWhiteText}>Konfirmasi{`\\n`}Disiram</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.btnGreen]} onPress={handleValidasiPhoto} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnGreenText}>Foto &{`\\n`}Validasi</Text>}
            </TouchableOpacity>
          </View>
        )}"""

content = content.replace(old_action, new_action)

with open('app/detail-tanaman.tsx', 'w') as f:
    f.write(content)
