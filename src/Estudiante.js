const pool = require('../database/conexionBD');

//Definimos la clase Estudiante
class Estudiante {
    constructor(nombre, email, nombre_curso) {
        this.nombre = nombre;
        this.email = email;
        this.nombre_curso = nombre_curso;
    }

    //Método para eliminar la tabla si existe y luego crearla
    static async crearTablaEstudiantes() {
        const dropSql = `DROP TABLE IF EXISTS public.estudiantes`;
        const createSql = `CREATE TABLE IF NOT EXISTS public.estudiantes (
            id_estudiante SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            fecha_inscripcion TIMESTAMP NOT NULL DEFAULT now(),
            nombre_curso VARCHAR(100) NOT NULL
        )`;

        console.log("Eliminando la tabla estudiantes si existe...");
        await pool.query(dropSql);
        console.log("Tabla estudiantes eliminada.");

        console.log("Creando la tabla estudiantes...");
        return pool.query(createSql);
    }

    //Método para insertar un estudiante en la base de datos
    insertarEstudiante() {
        const sql = `INSERT INTO public.estudiantes (nombre, email, nombre_curso)
        VALUES ($1, $2, $3) RETURNING id_estudiante, fecha_inscripcion`;
        const values = [this.nombre, this.email, this.nombre_curso];
        return pool.query(sql, values).then((result) => {
            console.log(`Estudiante insertado con ID: ${result.rows[0].id_estudiante}, Fecha de inscripción: ${result.rows[0].fecha_inscripcion}`);
        }).catch((err) => {
            console.error("Error al insertar el estudiante:", err);
        });
    }

    //Método estático para encontrar un estudiante por ID
    static buscarEstudiantePorID(id) {
        const sql = `SELECT id_estudiante, nombre, email, fecha_inscripcion, nombre_curso FROM public.estudiantes WHERE id_estudiante = $1`;
        return pool.query(sql, [id]).then((result) => {
            if (result.rows.length > 0) {
                const estudiante = result.rows[0];
                console.log(`Estudiante encontrado: ${JSON.stringify(estudiante)}`);
                return new Estudiante(estudiante.nombre, estudiante.email, estudiante.nombre_curso);
            } else {
                console.log(`No se encontró estudiante con ID: ${id}`);
            }
        }).catch((err) => {
            console.error("Error al buscar el estudiante:", err);
        });
    }

    //Método estático para obtener todos los estudiantes
    static todosEstudiantes() {
        const sql = `SELECT id_estudiante, nombre, email, fecha_inscripcion, nombre_curso FROM public.estudiantes`;
        return pool.query(sql).then((result) => {
            console.log("Todos los estudiantes:", result.rows);
            return result.rows;
        }).catch((err) => {
            console.error("Error al obtener los estudiantes:", err);
        });
    }

    //Método para eliminar un estudiante por ID
    static eliminarEstudiante(id) {
        const sql = `DELETE FROM public.estudiantes WHERE id_estudiante = $1 RETURNING *`;
        return pool.query(sql, [id]).then((result) => {
            if (result.rowCount > 0) {
                console.log(`Estudiante con ID ${id} eliminado: ${JSON.stringify(result.rows[0])}`);
            } else {
                console.log(`No se encontró estudiante con ID: ${id}`);
            }
        }).catch((err) => {
            console.error("Error al eliminar el estudiante:", err);
        });
    }

    //Método para modificar un estudiante existente por ID
    static modificarEstudiante(id, nuevoEstudiante) {
        const sql = `UPDATE public.estudiantes SET nombre = $1, email = $2, nombre_curso = $3 WHERE id_estudiante = $4 RETURNING *`;
        const values = [nuevoEstudiante.nombre, nuevoEstudiante.email, nuevoEstudiante.nombre_curso, id];
        return pool.query(sql, values).then((result) => {
            if (result.rowCount > 0) {
                console.log(`Estudiante modificado: ${JSON.stringify(result.rows[0])}`);
                return result.rows[0];
            } else {
                console.log(`No se encontró estudiante con ID: ${id}`);
            }
        }).catch((err) => {
            console.error("Error al modificar el estudiante:", err);
        });
    }
}

//Ejecución de las operaciones
async function main() {
    console.log("Iniciando migración...");
    await Estudiante.crearTablaEstudiantes();

    //Creando e insertando estudiantes
    const estudiante1 = new Estudiante('María García', 'maria.garcia@example.com', 'Matemáticas');
    const estudiante2 = new Estudiante('Pedro Fernández', 'pedro.fernandez@example.com', 'Ciencias');
    await estudiante1.insertarEstudiante();
    await estudiante2.insertarEstudiante();

    //Buscar un estudiante por ID
    await Estudiante.buscarEstudiantePorID(1);

    //Modificar un estudiante
    const nuevoEstudiante = new Estudiante('Juan Pérez', 'juan.perez@example.com', 'Historia');
    await Estudiante.modificarEstudiante(1, nuevoEstudiante);

    //Mostrar todos los estudiantes
    await Estudiante.todosEstudiantes();

    //Eliminar un estudiante
    await Estudiante.eliminarEstudiante(2);

    //Mostrar todos los estudiantes
    await Estudiante.todosEstudiantes();
}

main();
