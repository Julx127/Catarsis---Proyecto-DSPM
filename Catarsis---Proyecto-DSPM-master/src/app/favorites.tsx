import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const favorites = [
  { title: 'Chicago', image: require('../../assets/images/Imagenes Catarsis/CartelChicago.png') },
  { title: 'Six', image: require('../../assets/images/Imagenes Catarsis/CartelSix.png') },
  { title: 'Hamilton', image: require('../../assets/images/Imagenes Catarsis/CartelHamilton.png') },
];

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>VOLVER</Text></Pressable>
          <Text style={styles.kicker}>MI PERFIL</Text>
          <Text style={styles.title}>Favoritos</Text>
          <Text style={styles.subtitle}>Tus obras guardadas para volver cuando quieras.</Text>
          <View style={styles.grid}>
            {favorites.map((work) => (
              <Pressable key={work.title} onPress={() => router.push({ pathname: '/work-detail', params: { title: work.title } })} style={styles.item}>
                <Image source={work.image} contentFit="contain" style={styles.poster} />
                <Text style={styles.itemTitle}>{work.title}</Text>
              </Pressable>
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
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, paddingBottom: 120 },
  backButton: { paddingVertical: 8, marginBottom: 26 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  kicker: { color: '#e00000', fontFamily: 'serif', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 34, fontWeight: '700', marginTop: 3 },
  subtitle: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 22 },
  item: { width: '31%' },
  poster: { width: '100%', aspectRatio: 1 },
  itemTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 13, fontWeight: '700', marginTop: 4 },
});
