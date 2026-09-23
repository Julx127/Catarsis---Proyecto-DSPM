import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const activeWorks = ['Chicago', 'Hamilton', 'Maybe Happy Ending', 'Six', 'The Book of Mormon', "The Guy Who Didn't Like Musicals"];

export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>CERRAR SESION</Text></Pressable>
          <Text style={styles.title}>Publicacion de obras</Text>
          <Pressable onPress={() => router.push('/works')} style={styles.viewWorksButton}>
            <Text style={styles.viewWorksText}>VER OBRAS</Text>
          </Pressable>
          <TextInput placeholder="Titulo de la obra" placeholderTextColor="#b8b8b8" style={styles.input} />
          <TextInput placeholder="Descripcion" placeholderTextColor="#b8b8b8" multiline style={[styles.input, styles.descriptionInput]} />
          <Text style={styles.sectionTitle}>Produccion</Text>
          <TextInput placeholder="Nickname 1" placeholderTextColor="#b8b8b8" style={styles.input} />
          <TextInput placeholder="Nickname 2" placeholderTextColor="#b8b8b8" style={styles.input} />
          <TextInput placeholder="Nickname 3" placeholderTextColor="#b8b8b8" style={styles.input} />
          <Pressable style={styles.addProduction}><Text style={styles.addProductionText}>＋ AGREGAR PRODUCCION</Text></Pressable>
          <TextInput placeholder="Ubicacion" placeholderTextColor="#b8b8b8" style={styles.input} />
          <TextInput placeholder="Año de estreno" placeholderTextColor="#b8b8b8" keyboardType="numeric" style={styles.input} />
          <Pressable style={styles.attachBox}><Text style={styles.attachIcon}>＋</Text><Text style={styles.attachText}>Adjuntar imagen de la obra</Text></Pressable>
          <View style={styles.actions}>
            <Pressable onPress={() => router.back()} style={styles.cancelButton}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
            <Pressable style={styles.publishButton}><Text style={styles.publishText}>Publicar Obra</Text></Pressable>
          </View>
          <Text style={styles.demoNote}>Vista de demostracion. Las acciones se conectaran al backend.</Text>
          <Text style={styles.sectionTitle}>Obras vigentes</Text>
          <View style={styles.activeWorks}>
            {activeWorks.map((work) => (
              <View key={work} style={styles.workRow}>
                <Text style={styles.workName}>{work}</Text>
                <Pressable style={styles.deleteButton}>
                  <Text style={styles.deleteText}>ELIMINAR OBRA</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, paddingBottom: 42 },
  backButton: { paddingVertical: 8, marginBottom: 18 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginBottom: 22 },
  viewWorksButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#8f0000', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9, marginTop: -10, marginBottom: 18 },
  viewWorksText: { color: '#ffffff', fontFamily: 'serif', fontSize: 10, fontWeight: '700' },
  input: { height: 45, borderRadius: 6, backgroundColor: '#3c3c3c', borderWidth: 1, borderColor: '#696969', color: '#ffffff', fontFamily: 'serif', fontSize: 14, paddingHorizontal: 16, marginBottom: 12 },
  descriptionInput: { height: 92, paddingTop: 13, textAlignVertical: 'top' },
  sectionTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 20, fontWeight: '700', marginTop: 6, marginBottom: 12 },
  addProduction: { alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 14 },
  addProductionText: { color: '#e00000', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  attachBox: { height: 105, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#696969', backgroundColor: '#3c3c3c', marginTop: 4 },
  attachIcon: { color: '#e00000', fontSize: 28, lineHeight: 30 },
  attachText: { color: '#d2d2d2', fontFamily: 'serif', fontSize: 14, marginTop: 5 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 },
  cancelButton: { minWidth: 104, alignItems: 'center', borderRadius: 20, backgroundColor: '#777777', paddingHorizontal: 18, paddingVertical: 11 },
  cancelText: { color: '#ffffff', fontFamily: 'serif', fontSize: 12, fontWeight: '700' },
  publishButton: { minWidth: 125, alignItems: 'center', borderRadius: 20, backgroundColor: '#c40000', paddingHorizontal: 18, paddingVertical: 11 },
  publishText: { color: '#ffffff', fontFamily: 'serif', fontSize: 12, fontWeight: '700' },
  demoNote: { color: '#888888', fontFamily: 'serif', fontSize: 11, textAlign: 'center', marginTop: 18 },
  activeWorks: { borderTopWidth: 1, borderTopColor: '#555555' },
  workRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: 1, borderBottomColor: '#555555', paddingVertical: 13 },
  workName: { flex: 1, color: '#ffffff', fontFamily: 'serif', fontSize: 14 },
  deleteButton: { borderWidth: 1, borderColor: '#c40000', borderRadius: 16, paddingHorizontal: 11, paddingVertical: 8 },
  deleteText: { color: '#e00000', fontFamily: 'serif', fontSize: 9, fontWeight: '700' },
});
