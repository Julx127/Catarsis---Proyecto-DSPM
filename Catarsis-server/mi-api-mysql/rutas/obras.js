const express=require('express');
const router=express.Router();
const db=require('../db'); 

router.get('/', (req, res) => {
  db.query('SELECT * FROM obras', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// obtener obra segun el id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'ID de obra inválido'
    });
  }

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

module.exports=router;