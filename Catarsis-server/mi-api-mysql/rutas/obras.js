const express=require('express');
const router=express.Router();
const db=require('../db'); 

router.get('/', (req, res) => {
  db.query('SELECT * FROM obras', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// obtener obra y producciones segun el id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);

  // error si no existe el id
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'ID de obra inválido'
    });
  }

  // seleccionar obra y contar sus producciones
  const sqlObra = `
    SELECT
      o.idobras,
      o.titulo,
      o.autor,
      o.sinopsis,
      o.portada,
      (
        SELECT COUNT(*)
        FROM interacciones_obras io
        WHERE io.obras_idobras = o.idobras
          AND io.\`like\` = 1
      ) AS likes
    FROM obras o
    WHERE o.idobras = ?
  `;

  db.query(sqlObra, [id], (err, obras) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'Error al obtener la obra'
      });
    }

    if (obras.length === 0) {
      return res.status(404).json({
        mensaje: 'Obra no encontrada'
      });
    }

    // seleccionar producciones por año
    const sqlProducciones = `
      SELECT idproducciones, ubicacion, anio
      FROM producciones
      WHERE obras_idobras = ?
      ORDER BY anio ASC
    `;

    db.query(sqlProducciones, [id], (err, producciones) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          mensaje: 'Error al obtener las producciones'
        });
      }

      res.json({
        ...obras[0],
        likes: Number(obras[0].likes),
        producciones
      });
    });
  });
});

// publicar una obra con sus producciones
router.post('/', (req, res) => {
  const { titulo, autor, sinopsis, portada, producciones } = req.body;

  // errpr si los campos estan incompletos (el .trim sirve para eliminar los espacios en blanco de la cadena)
  if (
    typeof titulo !== 'string' || !titulo.trim() ||
    typeof autor !== 'string' || !autor.trim() ||
    typeof sinopsis !== 'string' || !sinopsis.trim() ||
    typeof portada !== 'string' || !portada.trim() ||
    !Array.isArray(producciones) || producciones.length === 0
  ) {
    return res.status(400).json({
      mensaje: 'Completá todos los campos y agregá al menos una producción'
    });
  }

  // revisa si la ubicacion y el año son validos
  const produccionesValidas = producciones.every((p) =>
    typeof p.ubicacion === 'string' &&
    p.ubicacion.trim() &&
    p.anio !== '' &&
    Number.isInteger(Number(p.anio)) &&
    Number(p.anio) >= 1000 &&
    Number(p.anio) <= 9999
  );
  if (!produccionesValidas) {
    return res.status(400).json({
      mensaje: 'Revisá la ubicación y el año de cada producción'
    });
  }

  db.getConnection((err, conexion) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'No se pudo conectar con la base de datos'
      });
    }
    conexion.beginTransaction((err) => {
      if (err) {
        conexion.release();
        return res.status(500).json({
          mensaje: 'No se pudo iniciar la operación'
        });
      }

      // insertar la obra
      const sqlObra = `
        INSERT INTO obras (titulo, autor, sinopsis, portada)
        VALUES (?, ?, ?, ?)
      `;

      conexion.query(
        sqlObra,
        [titulo.trim(), autor.trim(), sinopsis.trim(), portada.trim()],
        (err, resultado) => {
          if (err) {
            return conexion.rollback(() => {
              conexion.release();
              console.error(err);
              res.status(500).json({
                mensaje: 'Error al guardar la obra'
              });
            });
          }

          // crear las producciones con el id de la obra
          const obraId = resultado.insertId;

          const valoresProducciones = producciones.map((p) => [
            obraId,
            p.ubicacion.trim(),
            Number(p.anio)
          ]);
          const sqlProducciones = `
            INSERT INTO producciones (obras_idobras, ubicacion, anio)
            VALUES ?
          `;
          conexion.query(
            sqlProducciones,
            [valoresProducciones],
            (err) => {
              if (err) {
                return conexion.rollback(() => {
                  conexion.release();
                  console.error(err);
                  res.status(500).json({
                    mensaje: 'Error al guardar las producciones'
                  });
                });
              }
              conexion.commit((err) => {
                if (err) {
                  return conexion.rollback(() => {
                    conexion.release();
                    console.error(err);
                    res.status(500).json({
                      mensaje: 'No se pudo confirmar la publicación'
                    });
                  });
                }
                conexion.release();
                res.status(201).json({
                  mensaje: 'Obra publicada correctamente',
                  idobras: obraId
                });
              });
            }
          );
        }
      );
    });
  });
});


// Eliminar obras segun su id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);

  // error si el id es invalido
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'ID de obra inválido'
    });
  }
  db.getConnection((err, conexion) => {
    if (err) {
      return res.status(500).json({
        mensaje: 'No se pudo conectar con la base de datos'
      });
    }
    conexion.beginTransaction((err) => {
      if (err) {
        conexion.release();
        return res.status(500).json({
          mensaje: 'No se pudo iniciar la operación'
        });
      }

      // eliminar todos los registros relacionados en otras tablas
      const eliminarRelacionados = [
        'DELETE FROM producciones WHERE obras_idobras = ?',
        'DELETE FROM interacciones_obras WHERE obras_idobras = ?',
        'DELETE FROM resenias WHERE obras_idobras = ?'
      ];

      let indice = 0;
      // eliminar obra y relacionados
      function siguienteEliminacion() {
        if (indice >= eliminarRelacionados.length) {
          conexion.query(
            'DELETE FROM obras WHERE idobras = ?',
            [id],
            (err, resultado) => {
              if (err) {
                return rollback(err);
              }
              if (resultado.affectedRows === 0) {
                return rollback(null, 404);
              }
              conexion.commit((err) => {
                if (err) {
                  return rollback(err);
                }
                conexion.release();
                res.json({
                  mensaje: 'Obra eliminada correctamente'
                });
              });
            }
          );
          return;
        }

        conexion.query(
          eliminarRelacionados[indice],
          [id],
          (err) => {
            if (err) {
              return rollback(err);
            }
            indice++;
            siguienteEliminacion();
          }
        );
      }
      function rollback(err, status = 500) {
        conexion.rollback(() => {
          conexion.release();
          if (err) {
            console.error(err);
          }
          res.status(status).json({
            mensaje: status === 404
              ? 'La obra no existe'
              : 'No se pudo eliminar la obra'
          });
        });
      }
      siguienteEliminacion();
    });
  });
});

module.exports=router;