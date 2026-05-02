import { ENV } from '../src/lib/env.js';
import express from 'express';
import { corsOption } from './core/security/corsOption.js';



// database connection
import { connectDb } from './core/db/mongo.js';
await connectDb();


// express app initialization
const app = express();



// cors
import cors from "cors";
app.use(cors(corsOption));



// express parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// cookie parser
import cookieParser from "cookie-parser";
app.use(cookieParser());



// helmet
import helmet from "helmet";
app.use(helmet());


export default app;
