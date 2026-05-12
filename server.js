const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new sqlite3.Database("./peliculas.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS peliculas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      genero TEXT NOT NULL,
      anio INTEGER NOT NULL,
      descripcion TEXT NOT NULL
    )
  `);

  db.get("SELECT COUNT(*) AS total FROM peliculas", (err, row) => {
    if (!err && row.total === 0) {
      db.run(`
        INSERT INTO peliculas (titulo, genero, anio, descripcion)
        VALUES 
        ('Intensamente', 'Animación', 2015, 'Película animada sobre las emociones de una niña.'),
        ('Coco', 'Animación', 2017, 'Historia sobre la familia, la música y las tradiciones mexicanas.'),
        ('Avatar', 'Ciencia ficción', 2009, 'Película ambientada en el planeta Pandora.')
      `);
    }
  });
});

function layout(content) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>CRUD de Películas</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <div class="contenedor">
      <header>
        <h1>CRUD de Películas</h1>
        <p>Aplicación web con base de datos</p>
      </header>

      <nav>
        <a href="/">Inicio</a>
        <a href="/agregar">Agregar película</a>
      </nav>

      <main>
        ${content}
      </main>

      <footer>
        <p>Curso: Conceptualización de servicios en la nube</p>
        <p>Nombre: JESSICA NAYELI JOSELINNE CUELLAR RIVERA</p>
        <p>Código: 224065839</p>
        <p>Correo: jessica.cuellar24a@udgvirtual.udg.mx</p>
      </footer>
    </div>
  </body>
  </html>
  `;
}

app.get("/", (req, res) => {
  db.all("SELECT * FROM peliculas", (err, peliculas) => {
    if (err) return res.send("Error al consultar registros.");

    let contenido = `
      <h2>Lista de películas</h2>
      <a class="boton" href="/agregar">Agregar nueva película</a>
      <table>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Género</th>
          <th>Año</th>
          <th>Acciones</th>
        </tr>
    `;

    peliculas.forEach(p => {
      contenido += `
        <tr>
          <td>${p.id}</td>
          <td>${p.titulo}</td>
          <td>${p.genero}</td>
          <td>${p.anio}</td>
          <td>
            <a href="/ver/${p.id}">Ver</a>
            <a href="/editar/${p.id}">Editar</a>
            <a href="/eliminar/${p.id}" onclick="return confirm('¿Seguro que deseas eliminar este registro?')">Eliminar</a>
          </td>
        </tr>
      `;
    });

    contenido += `</table>`;
    res.send(layout(contenido));
  });
});

app.get("/ver/:id", (req, res) => {
  db.get("SELECT * FROM peliculas WHERE id = ?", [req.params.id], (err, p) => {
    if (err || !p) return res.send("Registro no encontrado.");

    const contenido = `
      <h2>Detalle de película</h2>
      <div class="card">
        <p><strong>ID:</strong> ${p.id}</p>
        <p><strong>Título:</strong> ${p.titulo}</p>
        <p><strong>Género:</strong> ${p.genero}</p>
        <p><strong>Año:</strong> ${p.anio}</p>
        <p><strong>Descripción:</strong> ${p.descripcion}</p>
      </div>
      <a class="boton" href="/">Regresar</a>
    `;

    res.send(layout(contenido));
  });
});

app.get("/agregar", (req, res) => {
  const contenido = `
    <h2>Agregar película</h2>
    <form action="/agregar" method="POST">
      <label>Título:</label>
      <input type="text" name="titulo" required>

      <label>Género:</label>
      <input type="text" name="genero" required>

      <label>Año:</label>
      <input type="number" name="anio" required>

      <label>Descripción:</label>
      <textarea name="descripcion" required></textarea>

      <button type="submit">Guardar</button>
    </form>
  `;

  res.send(layout(contenido));
});

app.post("/agregar", (req, res) => {
  const { titulo, genero, anio, descripcion } = req.body;

  db.run(
    "INSERT INTO peliculas (titulo, genero, anio, descripcion) VALUES (?, ?, ?, ?)",
    [titulo, genero, anio, descripcion],
    () => {
      res.redirect("/");
    }
  );
});

app.get("/editar/:id", (req, res) => {
  db.get("SELECT * FROM peliculas WHERE id = ?", [req.params.id], (err, p) => {
    if (err || !p) return res.send("Registro no encontrado.");

    const contenido = `
      <h2>Editar película</h2>
      <form action="/editar/${p.id}" method="POST">
        <label>Título:</label>
        <input type="text" name="titulo" value="${p.titulo}" required>

        <label>Género:</label>
        <input type="text" name="genero" value="${p.genero}" required>

        <label>Año:</label>
        <input type="number" name="anio" value="${p.anio}" required>

        <label>Descripción:</label>
        <textarea name="descripcion" required>${p.descripcion}</textarea>

        <button type="submit">Actualizar</button>
      </form>
    `;

    res.send(layout(contenido));
  });
});

app.post("/editar/:id", (req, res) => {
  const { titulo, genero, anio, descripcion } = req.body;

  db.run(
    "UPDATE peliculas SET titulo = ?, genero = ?, anio = ?, descripcion = ? WHERE id = ?",
    [titulo, genero, anio, descripcion, req.params.id],
    () => {
      res.redirect("/");
    }
  );
});

app.get("/eliminar/:id", (req, res) => {
  db.run("DELETE FROM peliculas WHERE id = ?", [req.params.id], () => {
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});