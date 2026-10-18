const express=require('express');
const router=express.Router();
const db=require('../db'); 

router.get('/', (req, res) => {
  db.query('SELECT * FROM interacciones_obras', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// obtener las interacciones del usuario logeado con la obra seleccionada, segun sus ids
router.get('/usuario/:usuarioId/obra/:obraId', (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const obraId = Number(req.params.obraId);

  // error si las ids no existen
  if (
    !Number.isInteger(usuarioId) || usuarioId <= 0 ||
    !Number.isInteger(obraId) || obraId <= 0
  ) {
    return res.status(400).json({
      mensaje: 'IDs inválidos'
    });
  }

  const sql = `
    SELECT vista, \`like\`, favorita
    FROM interacciones_obras
    WHERE usuarios_idusuarios = ?
      AND obras_idobras = ?
    LIMIT 1
  `;
  db.query(sql, [usuarioId, obraId], (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'Error al consultar las interacciones'
      });
    }
    const interaccion = resultados[0] || {
      vista: 0,
      like: 0,
      favorita: 0
    };
    res.json(interaccion);
  });
});

// modificar las interacciones
router.post('/toggle', (req, res) => {
  const { usuarioId, obraId, campo } = req.body;

  const usuario = Number(usuarioId);
  const obra = Number(obraId);
  const camposPermitidos = ['vista', 'like', 'favorita'];

  // error si las ids son invalidas
  if (
    !Number.isInteger(usuario) || usuario <= 0 ||
    !Number.isInteger(obra) || obra <= 0 ||
    !camposPermitidos.includes(campo)
  ) {
    return res.status(400).json({
      mensaje: 'Datos inválidos'
    });
  }

  // buscar interacciones existentes con esa obra
  const sqlBuscar = `
    SELECT idinteracciones_obras, vista, \`like\`, favorita
    FROM interacciones_obras
    WHERE usuarios_idusuarios = ?
      AND obras_idobras = ?
    LIMIT 1
  `;
  db.query(sqlBuscar, [usuario, obra], (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'Error al consultar la interacción'
      });
    }
    if (resultados.length === 0) {
      const valores = {
        vista: 0,
        like: 0,
        favorita: 0
      };
      valores[campo] = 1;

      // Insertar nueva interaccion si todavia no existe una
      const sqlInsertar = `
        INSERT INTO interacciones_obras
          (obras_idobras, usuarios_idusuarios, vista, \`like\`, favorita)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(
        sqlInsertar,
        [
          obra,
          usuario,
          valores.vista,
          valores.like,
          valores.favorita
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              mensaje: 'Error al guardar la interacción'
            });
          }
          res.json({
            vista: valores.vista,
            like: valores.like,
            favorita: valores.favorita
          });
        }
      );
      return;
    }

    const actual = resultados[0];
    const nuevoValor = Number(actual[campo]) === 1 ? 0 : 1;

    // actualizar interaccion existente
    const sqlActualizar = `
      UPDATE interacciones_obras
      SET \`${campo}\` = ?
      WHERE idinteracciones_obras = ?
    `;
    db.query(
      sqlActualizar,
      [nuevoValor, actual.idinteracciones_obras],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            mensaje: 'Error al actualizar la interacción'
          });
        }
        res.json({
          vista: campo === 'vista' ? nuevoValor : Number(actual.vista),
          like: campo === 'like' ? nuevoValor : Number(actual.like),
          favorita: campo === 'favorita' ? nuevoValor : Number(actual.favorita)
        });
      }
    );
  });
});

// bbtener las obras vistas, likeadas o favoritas de un usuario
router.get('/usuario/:usuarioId/tipo/:tipo', (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const tipo = req.params.tipo;

  const camposPermitidos = ['vista', 'like', 'favorita'];

  // error si los datos son invalidos
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ mensaje: 'ID de usuario inválido' });
  }
  if (!camposPermitidos.includes(tipo)) {
    return res.status(400).json({ mensaje: 'Tipo de interacción inválido' });
  }

  // obtener las obras con las que interactuo el usuario, y ver que tipo de interaccion es (vista, like o fav.)
  const sql = `
    SELECT o.idobras, o.titulo, o.portada
    FROM interacciones_obras i
    INNER JOIN obras o ON o.idobras = i.obras_idobras
    WHERE i.usuarios_idusuarios = ?
      AND i.\`${tipo}\` = 1
    ORDER BY o.titulo ASC
  `;
  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        mensaje: 'Error al obtener las obras del usuario'
      });
    }
    res.json(results);
  });
});

module.exports=router;