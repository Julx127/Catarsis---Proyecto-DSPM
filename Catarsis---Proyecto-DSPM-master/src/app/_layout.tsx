import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFooter } from '@/components/app-footer';
import { AppThemeProvider, useAppTheme } from '@/components/app-theme';

SplashScreen.preventAutoHideAsync();

// La funcion Tab Layout carga las fuentes de la aplicacion y monta el tema y la navegacion cuando estan listas.
export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts({
    RocaOne: require('../../assets/fonts/RocaOne-Rg.ttf'),
    RocaTwo: require('../../assets/fonts/RocaTwo-Rg.ttf'),
    Montserrat: require('../../assets/fonts/Montserrat-Regular.ttf')
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AppThemeProvider>
      <ThemedNavigation />
    </AppThemeProvider>
  );
}

// Aplica el tema de navegacion actual y muestra las pantallas, el splash y el pie de Catarsis.
function ThemedNavigation() {
  const { mode } = useAppTheme();

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      <AppFooter />
    </ThemeProvider>
  );
}
