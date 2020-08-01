import express from 'express';
import winston from 'winston';

import gradesRouter from './routes/grades.js';

import { promises as fs } from 'fs';
const { readFile, writeFile } = fs;

global.fileName = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

const app = express();
app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    global.logger.info('API started.');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      grades: [],
    };

    global.logger.debug(`Couln't find the file ${global.fileName} ...`);
    await writeFile(global.fileName, JSON.stringify(initialJson, null, '\t'))
      .then(() => {
        global.logger.info('API started and file created.');
      })
      .catch((err) => {
        global.logger.error(err.message);
      });
  }
});
