const express = require('express');
const router = express.Router();
const db = require('../db');

// obtener reseña con el nombre de usuario y la fecha en el formato yyyy-mm-dd
router.get('/', (req, res) => {
  const sql = `
    SELECT
      r.idresenias,
      r.obras_idobras,
      r.usuarios_idusuarios,
      u.username,
      r.estrellas,
      r.comentario,
      DATE_FORMAT(r.fecha_publicacion, '%Y-%m-%d') AS fecha
    FROM resenias r
    INNER JOIN usuarios u
      ON u.idusuarios = r.usuarios_idusuarios
    ORDER BY r.fecha_publicacion DESC, r.idresenias DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'Error al obtener las reseñas'
      });
    }
    res.json(results);
  });
});

// obtener las reseñas de la obra seleccionada, segun su id
router.get('/obra/:obraId', (req, res) => {
  const obraId = Number(req.params.obraId);

  // error si el id es invalido
  if (!Number.isInteger(obraId) || obraId <= 0) {
    return res.status(400).json({
      mensaje: 'ID de obra inválido'
    });
  }

  // obtener reseña con nombre de usuario
  const sql = `
    SELECT
      r.idresenias,
      r.obras_idobras,
      r.usuarios_idusuarios,
      u.username,
      r.estrellas,
      r.comentario,
      DATE_FORMAT(r.fecha_publicacion, '%Y-%m-%d') AS fecha
    FROM resenias r
    INNER JOIN usuarios u
      ON u.idusuarios = r.usuarios_idusuarios
    WHERE r.obras_idobras = ?
    ORDER BY r.fecha_publicacion DESC, r.idresenias DESC
  `;
  db.query(sql, [obraId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'Error al obtener las reseñas de la obra'
      });
    }
    res.json(results);
  });
});

// publicar una reseña
router.post('/', (req, res) => {
  const { obraId, usuarioId, estrellas, comentario } = req.body;

  const obra = Number(obraId);
  const usuario = Number(usuarioId);
  const puntuacion = Number(estrellas);

  // error sk los datos no estan completos
  if (
    !Number.isInteger(obra) || obra <= 0 ||
    !Number.isInteger(usuario) || usuario <= 0 ||
    !Number.isInteger(puntuacion) ||
    puntuacion < 1 || puntuacion > 5 ||
    typeof comentario !== 'string' ||
    comentario.trim().length === 0
  ) {
    return res.status(400).json({
      mensaje: 'Completá la calificación y el comentario correctamente'
    });
  }

  // insertar reseña nueva
  const sql = `
    INSERT INTO resenias
      (obras_idobras, usuarios_idusuarios, estrellas,
       comentario, fecha_publicacion)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  db.query(
    sql,
    [obra, usuario, puntuacion, comentario.trim()],
    (err, resultado) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          mensaje: 'Error al publicar la reseña'
        });
      }

      // mostrar nueva reseña
      const sqlNueva = `
        SELECT
          r.idresenias,
          r.obras_idobras,
          r.usuarios_idusuarios,
          u.username,
          r.estrellas,
          r.comentario,
          DATE_FORMAT(r.fecha_publicacion, '%Y-%m-%d') AS fecha
        FROM resenias r
        INNER JOIN usuarios u
          ON u.idusuarios = r.usuarios_idusuarios
        WHERE r.idresenias = ?
      `;
      db.query(sqlNueva, [resultado.insertId], (err, filas) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            mensaje: 'No se pudo mostrar la nueva reseña'
          });
        }

        res.status(201).json(filas[0]);
      });
    }
  );
});

module.exports = router;
