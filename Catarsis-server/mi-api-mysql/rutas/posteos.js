const express=require('express');
const router=express.Router();
const db=require('../db'); 

router.get('/', (req, res) => {
  const sql = `
    SELECT
      p.idposteos,
      p.usuarios_idusuarios,
      u.username,
      p.contenido,
      p.fecha_creacion,
      (
        SELECT COUNT(*)
        FROM interacciones_posteos ip
        WHERE ip.posteos_idposteos = p.idposteos
          AND ip.\`like\` = 1
      ) AS likes
    FROM posteos p
    INNER JOIN usuarios u
      ON u.idusuarios = p.usuarios_idusuarios
    ORDER BY p.fecha_creacion DESC, p.idposteos DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map((posteo) => ({
      ...posteo,
      likes: Number(posteo.likes)
    })));
  });
});

router.post('/', (req, res) => {
  const usuarioId = Number(req.body.usuarioId);
  const contenido = typeof req.body.contenido === 'string'
    ? req.body.contenido.trim()
    : '';

  if (!Number.isInteger(usuarioId) || usuarioId <= 0 || !contenido || contenido.length > 2000) {
    return res.status(400).json({
      mensaje: 'El usuario y una opinión de hasta 2000 caracteres son obligatorios'
    });
  }

  const hashtags = [...new Set(
    Array.from(contenido.matchAll(/#([\p{L}\p{N}_]+)/gu), (match) => match[1].toLowerCase())
  )];

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error(connectionError);
      return res.status(500).json({ mensaje: 'No se pudo conectar con la base de datos' });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        console.error(transactionError);
        connection.release();
        return res.status(500).json({ mensaje: 'No se pudo iniciar la publicación' });
      }

      connection.query(
        'INSERT INTO posteos (usuarios_idusuarios, contenido, fecha_creacion) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [usuarioId, contenido],
        (postError, postResult) => {
          if (postError) {
            return connection.rollback(() => {
              console.error(postError);
              connection.release();
              res.status(500).json({ mensaje: 'No se pudo publicar la opinión' });
            });
          }

          const postId = postResult.insertId;
          const guardarHashtag = (index) => {
            if (index >= hashtags.length) {
              return connection.commit((commitError) => {
                if (commitError) {
                  return connection.rollback(() => {
                    console.error(commitError);
                    connection.release();
                    res.status(500).json({ mensaje: 'No se pudo guardar la opinión' });
                  });
                }
                connection.release();
                res.status(201).json({ idposteos: postId, mensaje: 'Opinión publicada correctamente' });
              });
            }

            const nombre = hashtags[index];
            connection.query(
              'SELECT idetiquetas FROM etiquetas WHERE LOWER(nombre) = ? LIMIT 1',
              [nombre.toLowerCase()],
              (findError, rows) => {
                if (findError) return rollback(findError);
                if (rows.length > 0) {
                  return vincularEtiqueta(index, rows[0].idetiquetas);
                }

                connection.query(
                  'INSERT INTO etiquetas (nombre) VALUES (?)',
                  [nombre],
                  (insertError, etiquetaResult) => {
                    if (insertError) return rollback(insertError);
                    vincularEtiqueta(index, etiquetaResult.insertId);
                  }
                );
              }
            );
          };

          const vincularEtiqueta = (index, etiquetaId) => {
            connection.query(
              'INSERT INTO posteos_etiquetas (posteos_idposteos, etiquetas_idetiquetas) VALUES (?, ?)',
              [postId, etiquetaId],
              (linkError) => {
                if (linkError) return rollback(linkError);
                guardarHashtag(index + 1);
              }
            );
          };

          const rollback = (error) => {
            connection.rollback(() => {
              console.error(error);
              connection.release();
              res.status(500).json({ mensaje: 'No se pudo guardar la opinión y sus hashtags' });
            });
          };

          guardarHashtag(0);
        }
      );
    });
  });
});

router.delete('/:id', (req, res) => {
  const posteoId = Number(req.params.id);
  const usuarioId = Number(req.body.usuarioId);

  if (
    !Number.isInteger(posteoId) || posteoId <= 0 ||
    !Number.isInteger(usuarioId) || usuarioId <= 0
  ) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error(connectionError);
      return res.status(500).json({ mensaje: 'No se pudo conectar con la base de datos' });
    }

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        console.error(transactionError);
        connection.release();
        return res.status(500).json({ mensaje: 'No se pudo iniciar el borrado' });
      }

      connection.query(
        'SELECT usuarios_idusuarios FROM posteos WHERE idposteos = ? LIMIT 1',
        [posteoId],
        (findError, posteos) => {
          if (findError) return rollback(findError);
          if (posteos.length === 0) {
            return rollback(null, 404, 'La publicación no existe');
          }
          if (Number(posteos[0].usuarios_idusuarios) !== usuarioId) {
            return rollback(null, 403, 'Solo podés borrar tus propias publicaciones');
          }

          connection.query(
            'DELETE FROM interacciones_posteos WHERE posteos_idposteos = ?',
            [posteoId],
            (interaccionesError) => {
              if (interaccionesError) return rollback(interaccionesError);

              connection.query(
                'DELETE FROM posteos_etiquetas WHERE posteos_idposteos = ?',
                [posteoId],
                (etiquetasError) => {
                  if (etiquetasError) return rollback(etiquetasError);

                  connection.query(
                    'DELETE FROM posteos WHERE idposteos = ? AND usuarios_idusuarios = ?',
                    [posteoId, usuarioId],
                    (deleteError, resultado) => {
                      if (deleteError) return rollback(deleteError);
                      if (resultado.affectedRows !== 1) {
                        return rollback(null, 404, 'La publicación ya no existe');
                      }

                      connection.commit((commitError) => {
                        if (commitError) return rollback(commitError);
                        connection.release();
                        res.json({ mensaje: 'Publicación eliminada correctamente' });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );

      function rollback(error, status = 500, mensaje = 'No se pudo eliminar la publicación') {
        connection.rollback(() => {
          if (error) console.error(error);
          connection.release();
          res.status(status).json({ mensaje });
        });
      }
    });
  });
});

module.exports=router;