const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Crear directorio uploads si no existe
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para solo imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)

});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Conexión a MySQL
const pool = mysql.createPool({
    host: 'srv1135.hstgr.io',
    user: 'u990150337_Escolar',
    password: '|3t9yI6&l',
    database: 'u990150337_Escolar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conexión exitosa a la base de datos MySQL');
    connection.release();
});

// ------------------- ENDPOINTS -------------------

// ALUMNOS
app.get('/alumnos', (req, res) => {
    pool.query('SELECT * FROM Alumno', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json(results);
    });
});

app.post('/alumnos', (req, res) => {
    const { nombre_completo, correo, password, matricula, grupo } = req.body;
    const query = 'INSERT INTO Alumno (nombre_completo, correo, password, matricula, grupo) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [nombre_completo, correo, password, matricula, grupo], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno creado', id: results.insertId });
    });
});

app.put('/alumnos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_completo, correo, password, matricula, grupo } = req.body;
    const query = 'UPDATE Alumno SET nombre_completo = ?, correo = ?, password = ?, matricula = ?, grupo = ? WHERE id = ?';
    pool.query(query, [nombre_completo, correo, password, matricula, grupo, id], (err) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno actualizado' });
    });
});

app.delete('/alumnos/:id', (req, res) => {
    pool.query('DELETE FROM Alumno WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno eliminado' });
    });
});

// ADMINISTRADORES
app.get('/administradores', (req, res) => {
    pool.query('SELECT * FROM Administrador', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json(results);
    });
});

app.post('/administradores', (req, res) => {
    const { nombre_completo, matricula, password } = req.body;
    const query = 'INSERT INTO Administrador (nombre_completo, matricula, password) VALUES (?, ?, ?)';
    pool.query(query, [nombre_completo, matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Administrador creado', id: results.insertId });
    });
});

app.post('/login-admin', (req, res) => {
    const { matricula, password } = req.body;
    const query = 'SELECT * FROM Administrador WHERE matricula = ? AND password = ?';
    pool.query(query, [matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length === 0) return res.status(401).send('Credenciales inválidas');
        res.status(200).json({ message: 'Autenticación exitosa' });
    });
});

app.post('/login-alumno', (req, res) => {
    const { matricula, password } = req.body;
    const query = 'SELECT * FROM Alumno WHERE matricula = ? AND contraseña = ?';
    pool.query(query, [matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length === 0) return res.status(401).send('Credenciales inválidas');
        res.status(200).json({
            message: 'Autenticación exitosa',
            matricula: results[0].matricula
        });
    });
});

// LIBROS
app.get('/libros', (req, res) => {
    const query = 'SELECT id, ISBN, titulo, autor, stock, imagen FROM Libro';
    pool.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al obtener los libros');
        const librosConImagenes = results.map(libro => ({
            ...libro,
            imagen: libro.imagen ? `http://localhost:5000/uploads/${libro.imagen}` : null
        }));
        res.json(librosConImagenes);
    });
});

app.get('/libros/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM Libro WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send('Error al obtener el libro');
        if (results.length === 0) return res.status(404).send('Libro no encontrado');
        res.json(results[0]);
    });
});

app.post('/libros', upload.single('imagen'), (req, res) => {
    const { ISBN, titulo, autor, stock } = req.body;

    // Validar campos requeridos
    if (!ISBN || !titulo || !autor || !stock) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar que el stock sea un número
    if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número válido mayor o igual a 0' });
    }

    // Validar que no haya caracteres especiales en ISBN, título y autor
    const regex = /^[a-zA-Z0-9\s]+$/; // Solo permite letras, números y espacios
    if (!regex.test(ISBN) || !regex.test(titulo) || !regex.test(autor)) {
        return res.status(400).json({ error: 'No se permiten caracteres especiales en ISBN, título o autor' });
    }

    // Validar que el archivo subido sea una imagen
    if (req.file && !['image/jpeg', 'image/png', 'image/jpg'].includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'El archivo debe ser una imagen válida (JPEG, PNG, JPG)' });
    }

    // Obtener el nombre del archivo de imagen si se subió
    const imagen = req.file ? req.file.filename : null;

    const query = 'INSERT INTO Libro (ISBN, titulo, autor, stock, imagen) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [ISBN, titulo, autor, stock, imagen], (err, results) => {
        if (err) {
            console.error('Error al crear libro:', err);
            return res.status(500).json({ error: 'Error al crear libro' });
        }

        // Devolver la información del libro creado
        res.status(201).json({
            message: 'Libro creado exitosamente',
            id: results.insertId,
            imagen: imagen ? `http://localhost:5000/uploads/${imagen}` : null
        });
    });
});

app.put('/libros/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { titulo, autor, stock } = req.body;
    const imagen = req.file ? req.file.filename : null;

    if (!titulo || !autor || !stock) {
        return res.status(400).json({ error: 'Los campos título, autor y stock son obligatorios' });
    }

    const query = imagen
        ? 'UPDATE Libro SET titulo = ?, autor = ?, stock = ?, imagen = ? WHERE id = ?'
        : 'UPDATE Libro SET titulo = ?, autor = ?, stock = ? WHERE id = ?';

    const params = imagen
        ? [titulo, autor, stock, imagen, id]
        : [titulo, autor, stock, id];

    pool.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al actualizar el libro:', err);
            return res.status(500).send('Error al actualizar el libro');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Libro no encontrado');
        }
        res.status(200).send('Libro actualizado');
    });
});

app.delete('/libros/:id', (req, res) => {
    const { id } = req.params;

    const deletePrestamosQuery = `DELETE FROM Prestamo WHERE ISBN = (SELECT ISBN FROM Libro WHERE id = ?)`;
    pool.query(deletePrestamosQuery, [id], (err) => {
        if (err) return res.status(500).send('Error al eliminar prÃ©stamos');

        const deleteLibroQuery = 'DELETE FROM Libro WHERE id = ?';
        pool.query(deleteLibroQuery, [id], (err, results) => {
            if (err) return res.status(500).send('Error al eliminar libro');
            if (results.affectedRows === 0) return res.status(404).send('Libro no encontrado');
            res.status(200).send('Libro eliminado');
        });
    });
});

// PRÉSTAMOS
app.get('/prestamos', (req, res) => {
    const { matricula } = req.query;

    let query = `
        SELECT p.id, p.matricula, p.ISBN,
        DATE_FORMAT(p.fechaPrestamo, '%Y-%m-%d') AS fechaPrestamo,
        DATE_FORMAT(p.fechaDevolucion, '%Y-%m-%d') AS fechaDevolucion,
        l.titulo, l.imagen, l.stock, p.cantidad AS cantidadSolicitada, p.returned
        FROM Prestamo p
        JOIN Libro l ON p.ISBN = l.ISBN
    `;

    const params = [];
    if (matricula) {
        query += ' WHERE p.matricula = ?';
        params.push(matricula);
    }

    pool.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener los préstamos:', err);
            return res.status(500).json({ error: 'Error al obtener los préstamos' });
        }

        const prestamosConImagenes = results.map(prestamo => ({
            ...prestamo,
            imagen: prestamo.imagen ? `http://localhost:5000/uploads/${prestamo.imagen}` : null
        }));

        res.json(prestamosConImagenes);
    });
});

app.post('/prestamos', (req, res) => {
    const { fechaPrestamo, fechaDevolucion, matricula, ISBN, cantidad } = req.body;

    // Verificar si todos los campos están presentes
    if (!fechaPrestamo || !fechaDevolucion || !matricula || !ISBN || !cantidad) {
        console.error('Campos faltantes:', { fechaPrestamo, fechaDevolucion, matricula, ISBN, cantidad });
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Obtener el stock actual del libro
    const getStockQuery = 'SELECT stock FROM Libro WHERE ISBN = ?';
    pool.query(getStockQuery, [ISBN], (err, results) => {
        if (err) {
            console.error('Error al obtener el stock del libro:', err);
            return res.status(500).json({ error: 'Error al obtener el stock del libro' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        const stockActual = results[0].stock;

        // Verificar si hay suficiente stock para realizar el préstamo
        if (stockActual < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente para realizar el préstamo' });
        }

        // Reducir el stock del libro
        const nuevoStock = stockActual - cantidad;
        const updateStockQuery = 'UPDATE Libro SET stock = ? WHERE ISBN = ?';
        pool.query(updateStockQuery, [nuevoStock, ISBN], (err) => {
            if (err) {
                console.error('Error al actualizar el stock del libro:', err);
                return res.status(500).json({ error: 'Error al actualizar el stock del libro' });
            }

            // Registrar el préstamo
            const insertLoanQuery = `
                INSERT INTO Prestamo (fechaPrestamo, fechaDevolucion, matricula, ISBN, cantidad)
                VALUES (?, ?, ?, ?, ?)
            `;
            pool.query(insertLoanQuery, [fechaPrestamo, fechaDevolucion, matricula, ISBN, cantidad], (err, results) => {
                if (err) {
                    console.error('Error al registrar el préstamo:', err);
                    return res.status(500).json({ error: 'Error al registrar el préstamo' });
                }

                res.status(201).json({ message: 'Préstamo registrado exitosamente', id: results.insertId });
            });
        });
    });
});

app.put('/prestamos/:id', (req, res) => {
    const { id } = req.params;
    const { returned } = req.body;

    if (returned === undefined) {
        return res.status(400).json({ error: 'El campo "returned" es obligatorio' });
    }

    // Obtener la información del préstamo antes de actualizar
    const getLoanQuery = `
        SELECT p.ISBN, p.cantidad, l.stock
        FROM Prestamo p
        JOIN Libro l ON p.ISBN = l.ISBN
        WHERE p.id = ?
    `;

    pool.query(getLoanQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el préstamo:', err);
            return res.status(500).send('Error al obtener el préstamo');
        }

        if (results.length === 0) {
            return res.status(404).send('Préstamo no encontrado');
        }

        const { ISBN, cantidad, stock } = results[0];

        // Actualizar el estado del préstamo a "devuelto"
        const updateLoanQuery = 'UPDATE Prestamo SET returned = ? WHERE id = ?';
        pool.query(updateLoanQuery, [returned, id], (err, loanResults) => {
            if (err) {
                console.error('Error al actualizar el préstamo:', err);
                return res.status(500).send('Error al actualizar el préstamo');
            }

            if (loanResults.affectedRows === 0) {
                return res.status(404).send('Préstamo no encontrado');
            }

            // Si el préstamo se marcó como devuelto, actualizar el stock del libro
            if (returned) {
                const newStock = stock + cantidad;
                const updateStockQuery = 'UPDATE Libro SET stock = ? WHERE ISBN = ?';
                pool.query(updateStockQuery, [newStock, ISBN], (err) => {
                    if (err) {
                        console.error('Error al actualizar el stock del libro:', err);
                        return res.status(500).send('Error al actualizar el stock del libro');
                    }

                    res.status(200).send('Préstamo actualizado y stock del libro incrementado');
                });
            } else {
                res.status(200).send('Préstamo actualizado');
            }
        });
    });
});

// ------------------- ENDPOINTS -------------------

// ALUMNOS
app.get('/alumnos', (req, res) => {
    pool.query('SELECT * FROM Alumno', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json(results);
    });
});
app.post('/alumnos', (req, res) => {
    const { nombre_completo, correo, password, matricula, grupo } = req.body;
    const q = 'INSERT INTO Alumno (nombre_completo, correo, password, matricula, grupo) VALUES (?, ?, ?, ?, ?)';
    pool.query(q, [nombre_completo, correo, password, matricula, grupo], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno creado', id: results.insertId });
    });
});
app.put('/alumnos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_completo, correo, password, matricula, grupo } = req.body;
    const q = 'UPDATE Alumno SET nombre_completo = ?, correo = ?, password = ?, matricula = ?, grupo = ? WHERE id = ?';
    pool.query(q, [nombre_completo, correo, password, matricula, grupo, id], err => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno actualizado' });
    });
});
app.delete('/alumnos/:id', (req, res) => {
    pool.query('DELETE FROM Alumno WHERE id = ?', [req.params.id], err => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Alumno eliminado' });
    });
});

// ADMINISTRADORES
app.get('/administradores', (req, res) => {
    pool.query('SELECT * FROM Administrador', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json(results);
    });
});
app.post('/administradores', (req, res) => {
    const { nombre_completo, matricula, password } = req.body;
    const q = 'INSERT INTO Administrador (nombre_completo, matricula, password) VALUES (?, ?, ?)';
    pool.query(q, [nombre_completo, matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.json({ message: 'Administrador creado', id: results.insertId });
    });
});
app.post('/login-admin', (req, res) => {
    const { matricula, password } = req.body;
    const q = 'SELECT * FROM Administrador WHERE matricula = ? AND password = ?';
    pool.query(q, [matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length === 0) return res.status(401).send('Credenciales inválidas');
        res.status(200).json({ message: 'Autenticación exitosa' });
    });
});
app.post('/login-alumno', (req, res) => {
    const { matricula, password } = req.body;
    const q = 'SELECT * FROM Alumno WHERE matricula = ? AND contraseña = ?';
    pool.query(q, [matricula, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length === 0) return res.status(401).send('Credenciales inválidas');
        res.status(200).json({ message: 'Autenticación exitosa', matricula: results[0].matricula });
    });
});

// LIBROS
app.get('/libros', (req, res) => {
    const q = 'SELECT id, ISBN, titulo, autor, stock, imagen FROM Libro';
    pool.query(q, (err, results) => {
        if (err) return res.status(500).send('Error al obtener los libros');
        res.json(results.map(l => ({
            ...l,
            imagen: l.imagen ? `http://localhost:5000/uploads/${l.imagen}` : null
        })));
    });
});
app.get('/libros/:id', (req, res) => {
    pool.query('SELECT * FROM Libro WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Error al obtener el libro');
        if (results.length === 0) return res.status(404).send('Libro no encontrado');
        res.json(results[0]);
    });
});
app.post('/libros', upload.single('imagen'), (req, res) => {
    const { ISBN, titulo, autor, stock } = req.body;
    if (!ISBN||!titulo||!autor||!stock) return res.status(400).json({ error:'Todos los campos obligatorios' });
    if (isNaN(stock)||stock<0)     return res.status(400).json({ error:'Stock inválido' });
    const regex = /^[a-zA-Z0-9\s]+$/;
    if (!regex.test(ISBN)||!regex.test(titulo)||!regex.test(autor))
        return res.status(400).json({ error:'Caracteres especiales no permitidos'});
    const imagen = req.file ? req.file.filename : null;
    pool.query(
      'INSERT INTO Libro (ISBN,titulo,autor,stock,imagen) VALUES(?,?,?,?,?)',
      [ISBN,titulo,autor,stock,imagen],
      (err, results) => {
        if (err) return res.status(500).json({ error:'Error al crear libro' });
        res.status(201).json({ message:'Libro creado', id:results.insertId, imagen });
      }
    );
});
app.put('/libros/:id', upload.single('imagen'), (req, res) => {
    const { titulo, autor, stock } = req.body;
    if (!titulo||!autor||!stock) return res.status(400).json({ error:'Campos obligatorios' });
    const imagen = req.file ? req.file.filename : null;
    const q = imagen
      ? 'UPDATE Libro SET titulo=?,autor=?,stock=?,imagen=? WHERE id=?'
      : 'UPDATE Libro SET titulo=?,autor=?,stock=? WHERE id=?';
    const params = imagen
      ? [titulo,autor,stock,imagen,req.params.id]
      : [titulo,autor,stock,req.params.id];
    pool.query(q, params, (err, results) => {
        if (err) return res.status(500).send('Error al actualizar');
        if (results.affectedRows===0) return res.status(404).send('No encontrado');
        res.send('Libro actualizado');
    });
});
app.delete('/libros/:id', (req, res) => {
    pool.query(
      'DELETE FROM Prestamo WHERE ISBN=(SELECT ISBN FROM Libro WHERE id=?)',
      [req.params.id],
      err => {
        if (err) return res.status(500).send('Error eliminar préstamos');
        pool.query('DELETE FROM Libro WHERE id=?',[req.params.id],(e,r) => {
          if (e) return res.status(500).send('Error eliminar libro');
          if (r.affectedRows===0) return res.status(404).send('No encontrado');
          res.send('Libro eliminado');
        });
      }
    );
});

// PRÉSTAMOS

// Obtener préstamos (opcional por matrícula)
app.get('/prestamos', (req, res) => {
  const { matricula } = req.query;
  let q = `
    SELECT p.id,p.matricula,p.ISBN,
           DATE_FORMAT(p.fechaPrestamo,'%Y-%m-%d') AS fechaPrestamo,
           DATE_FORMAT(p.fechaDevolucion,'%Y-%m-%d') AS fechaDevolucion,
           l.titulo,l.imagen,l.stock,p.cantidad AS cantidadSolicitada,p.returned
    FROM Prestamo p JOIN Libro l ON p.ISBN=l.ISBN
  `;
  const params = [];
  if (matricula) {
    q += ' WHERE p.matricula = ?';
    params.push(matricula);
  }
  pool.query(q, params, (err, results) => {
    if (err) return res.status(500).json({ error:'Error al obtener préstamos' });
    res.json(results);
  });
});

// Obtener solo activos (returned = 0)
app.get('/prestamos/activo/:matricula', (req, res) => {
  pool.query(
    'SELECT * FROM Prestamo WHERE matricula=? AND returned=0',
    [req.params.matricula],
    (err, results) => {
      if (err) return res.status(500).json({ error:'Error al obtener activos' });
      if (results.length === 0) return res.status(404).json([]);
      res.json(results);
    }
  );
});

// Crear préstamo (validaciones incluidas)
app.post('/prestamos', (req, res) => {
  const { fechaPrestamo, fechaDevolucion, matricula, ISBN, cantidad } = req.body;
  if (!fechaPrestamo||!fechaDevolucion||!matricula||!ISBN||!cantidad) {
    return res.status(400).json({ error:'Todos los campos obligatorios' });
  }

  const fp = new Date(fechaPrestamo), fd = new Date(fechaDevolucion), hoy = new Date();
  // Año actual
  if (fp.getFullYear() !== hoy.getFullYear() || fd.getFullYear() !== hoy.getFullYear()) {
    return res.status(400).json({ error:'Fechas deben ser de este año' });
  }
  // ≤ 2 meses
  const maxDev = new Date(fp); maxDev.setMonth(maxDev.getMonth()+2);
  if (fd > maxDev) {
    return res.status(400).json({ error:'Devolución > 2 meses' });
  }

  // Duplicado activo
  pool.query(
    'SELECT * FROM Prestamo WHERE matricula=? AND ISBN=? AND returned=0',
    [matricula, ISBN],
    (e0, r0) => {
      if (e0) return res.status(500).json({ error:'Error duplicado' });
      if (r0.length) {
        return res.status(400).json({ error:'Ya tienes este libro en préstamo' });
      }
      // Stock
      pool.query('SELECT stock FROM Libro WHERE ISBN=?',[ISBN],(e1,r1)=>{
        if (e1) return res.status(500).json({ error:'Error stock' });
        if (!r1.length) return res.status(404).json({ error:'Libro no existe' });
        if (r1[0].stock < cantidad) {
          return res.status(400).json({ error:'Stock insuficiente' });
        }
        // Insert y update stock
        pool.query(
          'INSERT INTO Prestamo(fechaPrestamo,fechaDevolucion,matricula,ISBN,cantidad,returned) VALUES(?,?,?,?,?,0)',
          [fechaPrestamo,fechaDevolucion,matricula,ISBN,cantidad],
          (e2,r2) => {
            if (e2) return res.status(500).json({ error:'Error registro' });
            pool.query(
              'UPDATE Libro SET stock=stock-? WHERE ISBN=?',
              [cantidad,ISBN],
              e3 => {
                if (e3) return res.status(500).json({ error:'Error stock' });
                res.status(201).json({ message:'Préstamo registrado', id:r2.insertId });
              }
            );
          }
        );
      });
    }
  );
});

// Marcar devuelto
app.put('/prestamos/:id', (req, res) => {
  const { id } = req.params, { returned } = req.body;
  if (returned === undefined) return res.status(400).json({ error:'returned obligatorio' });
  pool.query(
    'SELECT ISBN,cantidad FROM Prestamo WHERE id=?',[id],
    (e0,r0) => {
      if (e0) return res.status(500).send('Error fetch');
      if (!r0.length) return res.status(404).send('No encontrado');
      const { ISBN,cantidad } = r0[0];
      pool.query(
        'UPDATE Prestamo SET returned=? WHERE id=?',[returned,id],
        e1 => {
          if (e1) return res.status(500).send('Error update');
          if (returned) {
            pool.query(
              'UPDATE Libro SET stock=stock+? WHERE ISBN=?',[cantidad,ISBN],
              e2 => {
                if (e2) return res.status(500).send('Error reprovision');
                res.send('Devuelto y stock repuesto');
              }
            );
          } else res.send('Préstamo actualizado');
        }
      );
    }
  );
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Bienvenido a la API del Sistema Escolar');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});