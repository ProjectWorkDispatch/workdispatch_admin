import 'dotenv/config';
import { createApp } from '../configs/app.js';
import { dbConnection } from '../configs/db.js';

const app = createApp();

app.use(async (req, res, next) => {
    try {
        await dbConnection();
        next();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
    }
});

export default app;