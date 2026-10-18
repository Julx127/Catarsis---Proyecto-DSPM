import UserWorksList from '@/components/obrasUsuario';

export default function LikesScreen() {
  return (
    <UserWorksList
      tipo="like"
      titulo="Likes"
      subtitulo="Las obras que te gustan"
    />
  );
}