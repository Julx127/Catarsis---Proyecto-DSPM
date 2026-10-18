import UserWorksList from '@/components/obrasUsuario';

export default function WatchedScreen() {
  return (
    <UserWorksList
      tipo="vista"
      titulo="Obras vistas"
      subtitulo="El registro de las obras que ya viste"
    />
  );
}