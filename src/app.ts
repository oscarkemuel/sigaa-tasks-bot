import express from 'express';
import { Telegram } from 'telegraf';

import { getTasks } from './services/sigaaService';
import { getMessage } from './utils/message';

const app = express();

app.get('/sigaa', async (_, res) => {
  const tasks = await getTasks();

  res.status(200).send(tasks);
})

app.get('/sigaa/telegram', async (_, res) => {
  const tasks = await getTasks();

  const telegram = new Telegram(process.env.TELEGRAM_TOKEN || '');

  try {
    if(tasks.length == 0){
      await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', 'SEM ATIVIDADES NO SIGAA');
    }else {
      await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', getMessage(tasks));
    }
  } catch (error) {
      await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', 'OCORREU ALGUM PROBLEMA');
  }

  res.status(204).send({});
})

app.listen(process.env.PORT || 3000, () => console.log(`Server on port ${process.env.PORT || 3000}`))
