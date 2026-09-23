import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { obras } from '@/interfaces/interfaces';


export default function WorksScreen() {

  const [query, setQuery] = useState('');
  const [obras, setObras] = useState<obras[]>([]);
// Obtener datos de obras
  useEffect(() => {
    fetch('http://10.238.140.45:5000/obras')
      .then((response) => response.json())
      .then((data) => setObras(data))
      .catch((error) => console.error('Error al obtener datos:', error));
  }, []); 
  const filteredWorks = useMemo(
    () => obras.filter((obra) => obra.titulo.toLowerCase().includes(query.trim().toLowerCase())),
    [query, obras],
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/Imagenes Catarsis/LogoCatarsis.png')}
              contentFit="contain"
              style={styles.logo}
            />
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>CATARSIS</Text>
              <Text style={styles.title}>Obras</Text>
              <Text style={styles.subtitle}>Encontraras una gran variedad de obras y una comunidad amplia de las mismas.</Text>
            </View>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar obra..."
            placeholderTextColor="#b8b8b8"
            style={styles.searchInput}
            accessibilityLabel="Buscar obra"
          />

          <Text style={styles.sectionTitle}>Cartelera</Text>
          
          
          <View style={styles.grid}>
            {filteredWorks.map((obra) => (
              <Pressable
                key={obra.idobras}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/work-detail', params: { title: obra.titulo } })}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <Image source={{ uri: obra.portada }} contentFit="contain" style={styles.poster} />
                <Text numberOfLines={6} style={styles.cardTitle}>
                  {obra.titulo}
                </Text>
              </Pressable>
            ))}
          </View>

          {filteredWorks.length === 0 && <Text style={styles.empty}>No encontramos esa obra.</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 4, paddingBottom: 24 },
  backButton: { position: 'absolute', top: 0, left: 0, zIndex: 1, paddingVertical: 8, paddingHorizontal: 4 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  logo: { width: 72, height: 72, marginTop: 18 },
  headerCopy: { flex: 1, paddingTop: 18 },
  kicker: { color: '#e00000', fontFamily: 'serif', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 32, fontWeight: '700' },
  subtitle: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 13, lineHeight: 18, marginTop: 2 },
  searchInput: { height: 46, borderRadius: 23, backgroundColor: '#3c3c3c', borderWidth: 1, borderColor: '#696969', color: '#ffffff', fontFamily: 'serif', fontSize: 14, paddingHorizontal: 20 },
  sectionTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 22, fontWeight: '700', marginTop: 26, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 20 },
  card: { width: '47%', paddingBottom: 10 },
  poster: { width: '100%', aspectRatio: 1 },
  cardTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 14, fontWeight: '700', lineHeight: 18, paddingHorizontal: 10, paddingTop: 3 },
  empty: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 15, textAlign: 'center', paddingVertical: 40 },
  pressed: { opacity: 0.72 },
});
