// Imports
import express from 'express';
import routes from './routes';
import path from 'path';
import cors from 'cors';
import { errors } from 'celebrate';

// Init
const app = express();

// Cors support
app.use(cors());

// JSON support
app.use(express.json());

// Routes
app.use(routes);

// Statis folders
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Erros
app.use(errors());

// Init server
app.listen(3333);