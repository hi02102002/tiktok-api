import { errorMiddleware } from '@/middlewares';
import { authRouter, postRouter, uploadRouter, userRouter } from '@/routes';
import { connectDB, logger } from '@/utils';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import xssClean from 'xss-clean';

dotenv.config({
   path: './config.env',
});

const app: Express = express();
const apiLimiter = rateLimit({
   windowMs: 60 * 60 * 1000, // 15 minutes
   max: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
   message: 'Too many accounts from this IP, please try again after an hour',
});
app.use(morgan('dev'));

app.use('/api', apiLimiter);
app.use(mongoSanitize());
app.use(xssClean());
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use('/api', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api', uploadRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, () => {
   logger.info(`Server running in mode on port ${PORT}`);
   connectDB();
});
