import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommentsScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const workTitle = title || 'Obra seleccionada';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.replace({ pathname: '/work-detail', params: { title: workTitle } })} style={styles.backButton}><Text style={styles.backText}>VOLVER A LA OBRA</Text></Pressable>
          <Text style={styles.kicker}>TU OPINION</Text>
          <Text style={styles.title}>{workTitle}</Text>
          <Text style={styles.subtitle}>Compartí tu experiencia con la comunidad.</Text>
          <View style={styles.ratingBox}><Text style={styles.label}>Tu calificacion</Text><Text style={styles.stars}>★ ★ ★ ★ ★</Text></View>
          <Text style={styles.label}>Comentario</Text>
          <TextInput multiline placeholder="Escribi tu reseña..." placeholderTextColor="#b8b8b8" style={styles.commentInput} textAlignVertical="top" />
          <Pressable style={({ pressed }) => [styles.submit, pressed && styles.pressed]}><Text style={styles.submitText}>PUBLICAR COMENTARIO</Text></Pressable>
          <Text style={styles.sectionTitle}>Opiniones recientes</Text>
          <View style={styles.review}><Text style={styles.user}>Nickname 1</Text><Text style={styles.reviewStars}>★ ★ ★ ★ ☆</Text><Text style={styles.reviewText}>Una obra que volveria a ver.</Text></View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, paddingBottom: 120 },
  backButton: { paddingVertical: 8, marginBottom: 26 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  kicker: { color: '#e00000', fontFamily: 'serif', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 32, fontWeight: '700', marginTop: 3 },
  subtitle: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 26 },
  ratingBox: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#555555', paddingVertical: 16, marginBottom: 24 },
  label: { color: '#ffffff', fontFamily: 'serif', fontSize: 15, fontWeight: '700', marginBottom: 9 },
  stars: { color: '#e00000', fontSize: 24, letterSpacing: 4 },
  commentInput: { minHeight: 130, borderRadius: 8, backgroundColor: '#3c3c3c', borderWidth: 1, borderColor: '#696969', color: '#ffffff', fontFamily: 'serif', fontSize: 14, padding: 14 },
  submit: { alignSelf: 'flex-start', borderRadius: 20, backgroundColor: '#c40000', paddingHorizontal: 18, paddingVertical: 12, marginTop: 14 },
  submitText: { color: '#ffffff', fontFamily: 'serif', fontSize: 10, fontWeight: '700' },
  sectionTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 20, fontWeight: '700', marginTop: 32, marginBottom: 14 },
  review: { borderTopWidth: 1, borderTopColor: '#555555', paddingTop: 16 },
  user: { color: '#ffffff', fontFamily: 'serif', fontSize: 15, fontWeight: '700' },
  reviewStars: { color: '#e00000', fontSize: 16, marginTop: 6 },
  reviewText: { color: '#d4d4d4', fontFamily: 'serif', fontSize: 14, marginTop: 7 },
  pressed: { opacity: 0.72 },
});
