import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  View as NativeView,
  type ColorValue,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle
} from 'react-native';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

const THEME_KEY = 'catarsisColorTheme';
type AppThemeMode = 'dark' | 'light';

type AppThemeContextValue = {
  mode: AppThemeMode;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  mode: 'dark',
  toggleTheme: () => {}
});

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<AppThemeMode>('dark');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_KEY).then((savedMode) => {
      if (active && (savedMode === 'dark' || savedMode === 'light')) {
        setMode(savedMode);
      }
    }).catch((error: unknown) => {
      console.error('No se pudo cargar el tema guardado:', error);
    });

    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    AsyncStorage.setItem(THEME_KEY, nextMode).catch((error: unknown) => {
      console.error('No se pudo guardar el tema:', error);
    });
  }, [mode]);

  return (
    <AppThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}

function mapColor(color: ColorValue | undefined, property: 'text' | 'surface' | 'border') {
  if (typeof color !== 'string' || !/^#[\da-f]{6}$/i.test(color)) return color;

  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const isAccent = red > green * 1.35 && red > blue * 1.35;
  if (isAccent) return color;

  const luminance =
    (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  if (property === 'text') {
    if (luminance > 0.72) return '#252525';
    if (luminance > 0.48) return '#555555';
    return color;
  }

  if (property === 'border') {
    return luminance < 0.72 ? '#b8b8b8' : color;
  }

  if (luminance < 0.15) return '#ffffff';
  if (luminance < 0.28) return '#e5e5e5';
  if (luminance < 0.52) return '#eeeeee';
  if (luminance < 0.72) return '#f7f7f7';
  return color;
}

function themedTextStyle(style: TextProps['style'], mode: AppThemeMode) {
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  if (!flattened) return { fontFamily: 'Montserrat' };
  return {
    ...flattened,
    fontFamily: flattened.fontFamily === 'RocaOne' || flattened.fontFamily === 'RocaTwo'
      ? flattened.fontFamily
      : 'Montserrat',
    ...(mode === 'light' && flattened.color
      ? { color: mapColor(flattened.color, 'text') }
      : {})
  };
}

function themedViewStyle(style: ViewProps['style'], mode: AppThemeMode) {
  const flattened = StyleSheet.flatten(style) as ViewStyle | undefined;
  if (mode !== 'light' || !flattened) return style;

  return {
    ...flattened,
    backgroundColor: mapColor(flattened.backgroundColor, 'surface'),
    borderColor: mapColor(flattened.borderColor, 'border'),
    borderTopColor: mapColor(flattened.borderTopColor, 'border'),
    borderRightColor: mapColor(flattened.borderRightColor, 'border'),
    borderBottomColor: mapColor(flattened.borderBottomColor, 'border'),
    borderLeftColor: mapColor(flattened.borderLeftColor, 'border')
  };
}

export function Text(props: TextProps) {
  const { mode } = useAppTheme();
  return <NativeText {...props} style={themedTextStyle(props.style, mode)} />;
}

export function View(props: ViewProps) {
  const { mode } = useAppTheme();
  return <NativeView {...props} style={themedViewStyle(props.style, mode)} />;
}

export function TextInput(props: TextInputProps) {
  const { mode } = useAppTheme();
  const flattenedStyle = StyleSheet.flatten(props.style) as
    | (TextStyle & ViewStyle)
    | undefined;
  const style = {
    ...flattenedStyle,
    fontFamily: 'Montserrat',
    ...(mode === 'light'
      ? {
          color: mapColor(flattenedStyle?.color, 'text'),
          backgroundColor: mapColor(flattenedStyle?.backgroundColor, 'surface'),
          borderColor: mapColor(flattenedStyle?.borderColor, 'border'),
          borderTopColor: mapColor(flattenedStyle?.borderTopColor, 'border'),
          borderRightColor: mapColor(flattenedStyle?.borderRightColor, 'border'),
          borderBottomColor: mapColor(flattenedStyle?.borderBottomColor, 'border'),
          borderLeftColor: mapColor(flattenedStyle?.borderLeftColor, 'border')
        }
      : {})
  };
  return (
    <NativeTextInput
      {...props}
      placeholderTextColor={
        mode === 'light'
          ? mapColor(props.placeholderTextColor, 'text')
          : props.placeholderTextColor
      }
      style={style}
    />
  );
}

export function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const { mode, toggleTheme } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onPress={toggleTheme}
      style={({ pressed }) => [
        inline ? styles.inlineToggle : styles.toggle,
        isDark ? styles.toggleDark : styles.toggleLight,
        pressed && styles.pressed
      ]}
    >
      <NativeText style={[styles.toggleText, isDark ? styles.toggleTextDark : styles.toggleTextLight]}>
        {isDark ? '☀ Claro' : '☾ Oscuro'}
      </NativeText>
    </Pressable>
  );
}

export { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet };

const styles = StyleSheet.create({
  toggle: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 2000,
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  inlineToggle: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14
  },
  toggleDark: { backgroundColor: '#303030', borderColor: '#777777' },
  toggleLight: { backgroundColor: '#ffffff', borderColor: '#777777' },
  toggleText: { fontFamily: 'Montserrat', fontSize: 11, fontWeight: '700' },
  toggleTextDark: { color: '#ffffff' },
  toggleTextLight: { color: '#242424' },
  pressed: { opacity: 0.72 }
});
