require('dotenv').config();
import puppeteer from 'puppeteer';
import { Telegram } from 'telegraf';
import getMessage from './utils/message';

export default async function sigaa(toTelegram: boolean) {
  const browser = await puppeteer.launch({
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  const AWAIT = 5 * 1000;

  // Acessando página do discente
  await page.goto('https://sigaa.ufrn.br/sigaa/public/home.jsf');
  await page.waitForTimeout(AWAIT);
  await page.click('[href="/sigaa/"]');
  await page.waitForTimeout(AWAIT);
  await page.type('[name="username"]', process.env.LOGIN_SIGAA || '');
  await page.type('[name="password"]', process.env.PASSWORD_SIGAA || '');
  await page.click('[name="submit"]');
  await page.waitForTimeout(AWAIT);

  // Coletando Atividades
  const activities = await page.evaluate(() => {
    const table = document.querySelector('[id="avaliacao-portal"] table tbody');
    const rows: Element[]  = Array.from(table ? table.children : []);
    rows.shift();

    let chores = rows.map((todo) => {
      const date = (todo.querySelector('td:nth-child(2)') as HTMLElement)?.innerText;
      const text = (todo.querySelector('td:nth-child(3)') as HTMLElement)?.innerText;
      const matter = text.split('\n')[0];
      const title = text.split('\n')[1];
      const status = date.includes('(') ? 'ABERTO' : 'ENCERRADO';

      return {date, matter, title, status};
    });

    return chores;
  });

  await browser.close();

  if(toTelegram){
    const telegram = new Telegram(process.env.TELEGRAM_TOKEN || '');

    try {
      if(activities.length == 0){
        await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', 'SEM ATIVIDADES NO SIGAA');
      }else {
        await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', getMessage(activities));
      }
    } catch (error) {
        await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', 'OCORREU ALGUM PROBLEMA');
    }
  }

  return activities;
}
