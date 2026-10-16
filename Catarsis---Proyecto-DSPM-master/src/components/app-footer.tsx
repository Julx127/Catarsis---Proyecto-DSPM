import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  useAppTheme,
  View
} from '@/components/app-theme';

const footerImages = {
  works: require('../../assets/images/Imagenes Catarsis/MenuFooterMascarasRojas.png'),
  community: require('../../assets/images/Imagenes Catarsis/MenuFooterComunidadRojo.png'),
  profile: require('../../assets/images/Imagenes Catarsis/MenuFooterPerfilRojo.png'),
};

const lightFooterImages = {
  works: require('../../assets/images/Imagenes Catarsis/MenuBlancoFooterMascarasRojas.png'),
  community: require('../../assets/images/Imagenes Catarsis/MenuBlancoFooterComunidadRojo.png'),
  profile: require('../../assets/images/Imagenes Catarsis/MenuBlancoFooterPerfilRojo.png'),
};

const footerRoutes = ['/works', '/community', '/profile', '/favorites', '/watched', '/likes', '/work-detail', '/comments'];

export function AppFooter() {
  const pathname = usePathname();
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';
  const isVisible = footerRoutes.some((route) => pathname === route);

  if (!isVisible) {
    return null;
  }

  const activeImage = pathname === '/community' ? footerImages.community : pathname === '/profile' || pathname === '/favorites' || pathname === '/watched' || pathname === '/likes' ? footerImages.profile : footerImages.works;
  const activeLightImage = pathname === '/community'
    ? lightFooterImages.community
    : pathname === '/profile' || pathname === '/favorites' || pathname === '/watched' || pathname === '/likes'
      ? lightFooterImages.profile
      : lightFooterImages.works;

  return (
    <View style={styles.footer}>
      <Image
        source={isDark ? activeImage : activeLightImage}
        contentFit="fill"
        style={styles.footerImage}
      />
      <Pressable accessibilityLabel="Obras" onPress={() => router.replace('/works')} style={styles.worksTarget}>
      </Pressable>
      <Pressable accessibilityLabel="Comunidad" onPress={() => router.replace('/community')} style={styles.communityTarget}>
      </Pressable>
      <Pressable accessibilityLabel="Perfil" onPress={() => router.replace('/profile')} style={styles.profileTarget}>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { position: 'absolute', bottom: 0, width: '100%', maxWidth: 520, alignSelf: 'center', aspectRatio: 1077 / 235, backgroundColor: '#202020' },
  footerImage: { width: '100%', height: '100%' },
  worksTarget: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '33.333%' },
  communityTarget: { position: 'absolute', left: '33.333%', top: 0, bottom: 0, width: '33.333%' },
  profileTarget: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '33.333%' },
});
