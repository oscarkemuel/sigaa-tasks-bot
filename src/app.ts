import express from 'express';

import sigaa from './sigaa';
import clickup from './clickup';

const app = express();

app.get('/sigaa', async (req, res) => {
  const toTelegram = req.query.telegram;
  const activities = await sigaa(!!toTelegram);

  res.status(200).send(activities);
})

app.get('/clickup', async (req, res) => {
  const toTelegram = req.query.telegram;
  const activities = await clickup(!!toTelegram);

  res.status(200).send(activities);
})

app.listen(process.env.PORT || 3000, () => console.log('Server on'))
