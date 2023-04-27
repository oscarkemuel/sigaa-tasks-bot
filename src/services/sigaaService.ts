require('dotenv').config();
import puppeteer from 'puppeteer';
import MessageService from './messageService';

interface IActivities{
  title: string;
  date: string;
  matter?: string;
  status?: string;
  statusImg?: string;
}

class SigaaService {
  private login;
  private password;
  private messageService;

  constructor() {
    this.login = process.env.LOGIN_SIGAA || '';
    this.password = process.env.PASSWORD_SIGAA || '';
    this.messageService = MessageService;
  }

  async getTasks() {
    const browser = await puppeteer.launch({
      'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();
    const AWAIT = 10 * 1000;

    // Acessando página do discente
    await page.goto('https://sigaa.ufrn.br/sigaa/public/home.jsf');
    await page.waitForTimeout(AWAIT);
    await page.click('[href="/sigaa/"]');
    await page.waitForTimeout(AWAIT);
    await page.type('[name="username"]', this.login);
    await page.type('[name="password"]', this.password);
    await page.click('[name="submit"]');
    await page.waitForTimeout(AWAIT);

    // Coletando Atividades
    const activities = await page.evaluate(() => {
      const table = document.querySelector('[id="avaliacao-portal"] table tbody');
      const rows: Element[]  = Array.from(table ? table.children : []);
      rows.shift();

      let tasks = rows.map((todo) => {
        const date = (todo.querySelector('td:nth-child(2)') as HTMLElement)?.innerText;
        const text = (todo.querySelector('td:nth-child(3)') as HTMLElement)?.innerText;
        const matter = text.split('\n')[0];
        const title = text.split('\n')[1];
        const status = date.includes('(') ? 'ABERTO' : 'ENCERRADO';

        let statusImg;
        const iconStatus = todo.querySelector('td:nth-child(1) > img');
        if (iconStatus) {
          if (iconStatus.getAttribute('title') === 'Atividade concluída') {
            statusImg = "✅"
          } else {
            statusImg = "❗"
          }
        }

        return {date, matter, title, status, statusImg};
      });

      const tasksFiltred = tasks.filter((chore) => chore.status === 'ABERTO')

      return tasksFiltred;
    });

    await browser.close();

    return activities;
  }

  formatMessage(tasks: IActivities[]): string{
    let message: string = '\nSIGAA\n';
    message = message.concat('--------------------------------------');

    for (let i = 0; i < tasks.length; i++) {
      const todo = tasks[i];
      const sequential = i + 1;

      if(todo.matter){
        message = message.concat(`\n${sequential}. ${todo.matter}`);
        message = message.concat(`\n${todo.date}`);
        message = message.concat(`\n${todo.title}`);
        message = message.concat(`\n(${todo.status})${todo.statusImg ? ` ${todo.statusImg}` : ''}\n`);
      }else{
        message = message.concat(`\n${sequential}. ${todo.title}`);
        message = message.concat(`\n${todo.date}\n`);
      }
    }

    message = message.concat('--------------------------------------')

    return message;
  }

  async sendTasksToTelegram() {
    const tasks = await this.getTasks();

    if(tasks.length == 0){
      await this.messageService.sendMessage('SEM ATIVIDADES NO SIGAA', true);
    } else {
      const message = this.formatMessage(tasks);

      await this.messageService.sendMessage(message, true);
    }
  }
}

export default new SigaaService();
