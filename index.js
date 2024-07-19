import express from "express";
import cors from "cors";
import UserRouter from './routers/UserRouter.js'
import * as dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import http from 'http';
import AdminRouter from "./routers/AdminRouter.js";

dotenv.config()

const PORT = process.env.PORT;

const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(cors({
   credentials: true,
   origin: process.env.CLIENT_URL,
}));
app.use('/User', UserRouter);
app.use('/Admin', AdminRouter);

const web = http.Server(app);

try {
   web.listen(PORT, process.env.SERVER_URL, () => console.log('Server is working'))

} catch (e) {
   console.log(`${e.message}`);
}

