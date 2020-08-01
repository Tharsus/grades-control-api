import express from 'express';

import { promises as fs, write } from 'fs';
import { send } from 'process';
const { readFile, writeFile } = fs;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let grade = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    console.log(data);

    grade = {
      id: data.nextId,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);
    data.nextId++;

    await writeFile(global.fileName, JSON.stringify(data, null, '\t'));

    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const grade = req.body;
    const data = JSON.parse(await readFile(global.fileName));

    const index = data.grades.findIndex((current) => {
      return current.id === grade.id;
    });

    if (index === -1) {
      throw new Error(`Couldn't find the record with id: ${grade.id}.`);
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;
    data.grades[index].timestamp = new Date();

    await writeFile(global.fileName, JSON.stringify(data, null, '\t'));

    res.send(data.grades[index]);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  console.log(err.message);
  res.status(400).send({ error: err.message });
});

export default router;
