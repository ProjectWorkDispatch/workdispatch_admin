'use strict';
import 'dotenv/config';

// Importaciones
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { corsOptions } from './cors-configuration.js';
import { dbConnection } from './db.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';

// Importaciones de Rutas
const BASE_URL = '/workDispatch/v1';
import reviewRoutes from '../src/Review/review.routes.js';
import notificationRoutes from '../src/Notification/notification.routes.js';
import reportRoutes from '../src/Report/report.routes.js';
import userRoutes from '../src/Users/user.routes.js';
import verificationRoutes from '../src/Verifications/verification.routes.js';
import categoryRoutes from '../src/Categories/category.routes.js';
import WorkerPortFolioRoutes from '../src/WorkerPortFolio/WorkerPortFolio.routes.js';
import ProposalRoutes from '../src/Proposal/Proposal.routes.js';
import ServiceRoutes from '../src/Service/Service.routes.js';
import SkillRoutes from '../src/Skill/skill.routes.js';
import ServiceRequestRoutes from '../src/ServiceRequest/serviceRequest.routes.js';
import UserSkillRoutes from '../src/UserSkill/userSkill.routes.js';
import conversationRoutes from '../src/Conversation/conversation.routes.js'
import messageRoutes from '../src/Message/message.routes.js';
import authRoutes from '../src/Auth/auth.routes.js';
import { seedDefaultData } from './seed.js';

const middleware = (app) => {
    app.use(helmet(helmetConfiguration));
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(requestLimit);
    app.use(morgan('dev'));
}

const routes = (app) => {
    app.use(`${BASE_URL}/Auth`, authRoutes);
    app.use(`${BASE_URL}/users`, userRoutes);
    app.use(`${BASE_URL}/verifications`, verificationRoutes);
    app.use(`${BASE_URL}/categories`, categoryRoutes);
    
    app.use(`${BASE_URL}/reviews`, reviewRoutes);
    app.use(`${BASE_URL}/notifications`, notificationRoutes);
    app.use(`${BASE_URL}/reports`, reportRoutes);

    app.use(`${BASE_URL}/PortFolio`, WorkerPortFolioRoutes);
    app.use(`${BASE_URL}/Proposal`, ProposalRoutes);
    app.use(`${BASE_URL}/Service`, ServiceRoutes);

    app.use(`${BASE_URL}/skill`, SkillRoutes);
    app.use(`${BASE_URL}/serviceRequest`, ServiceRequestRoutes);
    app.use(`${BASE_URL}/userSkill`, UserSkillRoutes);

    app.use(`${BASE_URL}/conversations`, conversationRoutes);
    app.use(`${BASE_URL}/messages`, messageRoutes);


}

const createApp = () => {
    const app = express();

    app.use(async (req, res, next) => {
        try {
            await dbConnection();
            next();
        } catch (error) {
            console.error('Error al conectar con la base de datos:', error);
            res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
        }
    });

    middleware(app);
    routes(app);
    app.use(errorHandler);
    return app;
};

const initServer = async () => {
    const PORT = process.env.PORT || 3001;

    try {
        await dbConnection();
        const app = createApp();

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Base URL: http://localhost:${PORT}${BASE_URL}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

export { initServer, createApp };