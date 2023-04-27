import express from 'express';

import SigaaService from './services/sigaaService';
import botService from './services/botService';

const app = express();
app.use(express.json());

botService.hearBot();

app.get('/', (_, res) => {
  res.status(200).json({
    routes: [
      {
        route: '/sigaa',
        description: 'Get all tasks from SIGAA in JSON format'
      },
      {
        route: '/sigaa/telegram',
        description: 'Send all tasks from SIGAA to telegram'
      }
    ]
  });
})

app.get('/sigaa', async (_, res) => {
  const tasks = await SigaaService.getTasks();

  res.status(200).json(tasks);
})

app.get('/sigaa/telegram', async (_, res) => {
  SigaaService.sendTasksToTelegram();

  res.status(200).send({
    status: `SIGAA tasks sent to telegram - ${new Date().toLocaleString('pt-BR')}`
  });
})

app.listen(process.env.PORT || 3000, () => console.log(`Server on port ${process.env.PORT || 3000}`))
