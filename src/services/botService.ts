require('dotenv').config();
import { Markup, Telegraf }  from "telegraf";
import SigaaService from "./sigaaService";

class BotService {
  private botToken;
  private bot;
  private sigaaService;

  constructor() {
    this.botToken = process.env.TELEGRAM_TOKEN || '';
    this.bot = new Telegraf(this.botToken);
    this.sigaaService = SigaaService;
  }

  async hearBot() {
    try {
      this.bot.hears('Enviar novamente', (ctx) => {
        ctx.reply('Aguarde um momento...')
        this.sigaaService.sendTasksToTelegram()
      });

      this.bot.launch();
    } catch (error) {
      console.log(error);
    }
  }
}

export default new BotService();
