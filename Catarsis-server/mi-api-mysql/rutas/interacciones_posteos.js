const express=require('express');
const router=express.Router();
const db=require('../db'); 

router.get('/', (req, res) => {
  db.query('SELECT * FROM interacciones_posteos', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.post('/toggle', (req, res) => {
  const usuarioId = Number(req.body.usuarioId);
  const posteoId = Number(req.body.posteoId);

  if (
    !Number.isInteger(usuarioId) || usuarioId <= 0 ||
    !Number.isInteger(posteoId) || posteoId <= 0
  ) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  const sqlBuscar = `
    SELECT idinteracciones_posteos, \`like\`
    FROM interacciones_posteos
    WHERE usuarios_idusuarios = ?
      AND posteos_idposteos = ?
    LIMIT 1
  `;
  db.query(sqlBuscar, [usuarioId, posteoId], (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al consultar el “Me gusta”' });
    }

    const guardar = (nuevoLike, callback) => {
      const sqlActualizar = `
        UPDATE interacciones_posteos
        SET \`like\` = ?
        WHERE idinteracciones_posteos = ?
      `;
      db.query(sqlActualizar, [nuevoLike, resultados[0].idinteracciones_posteos], callback);
    };

    const responder = (nuevoLike, writeError) => {
      if (writeError) {
        console.error(writeError);
        return res.status(500).json({ mensaje: 'No se pudo guardar el “Me gusta”' });
      }

      db.query(
        'SELECT COUNT(*) AS likes FROM interacciones_posteos WHERE posteos_idposteos = ? AND `like` = 1',
        [posteoId],
        (countError, filas) => {
          if (countError) {
            console.error(countError);
            return res.status(500).json({ mensaje: 'El “Me gusta” se guardó, pero no se pudo actualizar el contador' });
          }
          res.json({ like: nuevoLike, likes: Number(filas[0].likes) });
        }
      );
    };

    if (resultados.length === 0) {
      db.query(
        'INSERT INTO interacciones_posteos (usuarios_idusuarios, posteos_idposteos, `like`, dislike) VALUES (?, ?, 1, 0)',
        [usuarioId, posteoId],
        (insertError) => responder(1, insertError)
      );
      return;
    }

    const nuevoLike = Number(resultados[0].like) === 1 ? 0 : 1;
    guardar(nuevoLike, (updateError) => responder(nuevoLike, updateError));
  });
});

module.exports=router;