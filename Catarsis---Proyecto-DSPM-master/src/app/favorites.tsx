import UserWorksList from '@/components/obrasUsuario';

export default function FavoritesScreen() {
  return (
    <UserWorksList
      tipo="favorita"
      titulo="Favoritos"
      subtitulo="Tus obras favoritas"
    />
  );
}