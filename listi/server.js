// server.js (CommonJS)
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Configurar pool de Postgres
// Usamos process.env.DATABASE_URL (setear en .env en local y como variable en Render)
const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({
  connectionString,
  // En producción (Render) normalmente necesitarás usar SSL; dejamos esta configuración
  // para aceptar certificados no verificados si NODE_ENV === 'production'.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ENDPOINT: registrarse
app.post('/api/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    // Verificar si ya existe usuario o correo
    const check = await pool.query(
      'SELECT id FROM usuarios WHERE nombre_usuario = $1 OR correo_electronico = $2',
      [nombre, email]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ error: 'Nombre de usuario o correo ya registrado.' });
    }

    // Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Insertar
    await pool.query(
      'INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena) VALUES ($1, $2, $3)',
      [nombre, email, hashed]
    );

    return res.json({ success: true, message: 'Usuario registrado.' });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Health check (útil para Render)
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});