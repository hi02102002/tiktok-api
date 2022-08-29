import { errorMiddleware } from '@/middlewares';
import { authRouter, carRouter } from '@/routes';
import { connectDB, logger } from '@/utils';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config({
   path: './config.env',
});

const app: Express = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/cars', carRouter);
app.use('/api', authRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, () => {
   logger.info(`Server running in mode on port ${PORT}`);
   connectDB();
});
