require('dotenv').config();
import puppeteer from 'puppeteer';
import { Telegram } from 'telegraf';
import getMessage from './utils/message';

export default async function clickup(toTelegram: boolean){
  const browser = await puppeteer.launch({
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  const AWAIT = 5 * 1000;

  // Acessando página com as tarefas
  await page.goto('https://app.clickup.com/login');
  await page.waitForTimeout(AWAIT);
  await page.type('[type="email"]', process.env.LOGIN_CLICKUP || '');
  await page.type('[type="password"]', process.env.PASSWORD_CLICKUP || '');
  await page.click('[type="submit"]');
  await page.waitForTimeout(10000);
  await page.click('[data-test="simple-sidebar-home-item"]');
  await page.waitForTimeout(AWAIT);
  await page.click('cu-user-inbox cu-inbox-section:nth-child(4) [data-test="inbox-list__title"]');
  await page.waitForTimeout(AWAIT);

  // Coletando atividades
  const activities = await page.evaluate(() => {
    const table = document.querySelector('[id="inbox_3"]');
    const rows: Element[]  = Array.from(table ? table.children : []);

    let chores = rows.map((todo) => {
      const title = (todo.querySelector('cu-task-row-main > a > div > div > div > span') as HTMLElement)?.innerHTML;
      const date = new Date((todo.querySelector('div.cu-task-row__main > cu-task-row-readonly-date > div') as HTMLElement)?.innerHTML).toLocaleDateString();

      return {title, date};
    });


    return chores;
  });

  await browser.close();

  if(toTelegram){
    const telegram = new Telegram(process.env.TELEGRAM_TOKEN || '');

    try {
      if(activities.length == 0){
        await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', 'SEM ATIVIDADES NO CLICKUP');
      }else {
        await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', getMessage(activities));
      }
    } catch (error) {
        await telegram.sendMessage(process.env.TELEGRAM_CHAT_ID || '', 'OCORREU ALGUM PROBLEMA');
    }
  }

  return activities;
}
