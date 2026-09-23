// creamos todas la interfaces

export interface etiquetas{
    idetiquetas: number;
    nombre: string;
}

export interface interacciones_obras{
    idinteracciones_obras: number;
    obras_idobras: number;
    usuarios_idusuarios: number;
    vista: boolean;
    like: boolean;
    favorita: boolean;
}

export interface interacciones_posteos{
    idinteracciones_posteos: number;
    usuarios_idusuarios: number;
    posteos_idposteos: number;
    like: boolean;
    dislike: boolean;
}

export interface obras{
  idobras: number;
  titulo: string;
  autor: string;
  sinopsis: string;
  portada: string;
}

export interface posteos{
  idposteos: number;
  usuarios_idusuarios: number;
  contenido: string;
  fecha_creacion: Date;
}

export interface posteos_etiquetas{
    posteos_idposteos: number;
    etiquetas_idetiquetas: number;
}

export interface producciones{
   idproducciones: number;
   obras_idobras: number;
   ubicacion: string;
   anio: number;
}

export interface resenias{
    idresenias: number;
    obras_idobras: number;
    usuarios_idusuarios: number;
    estrellas: number;
    comentario: string;
    fecha_publicacion: Date;
}

export interface usuarios{
    idusuarios: number;
    username: string;
    email: string;
    password: string;
    admin: boolean;
}