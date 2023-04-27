require('dotenv').config();
import { Markup, Telegraf }  from "telegraf";

class MessageService {
  private botToken;
  private telegramChatId;
  private bot;

  constructor() {
    this.botToken = process.env.TELEGRAM_TOKEN || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
    this.bot = new Telegraf(this.botToken);
  }

  generateKeyboard() {
    return Markup.keyboard([['Enviar novamente']]).oneTime().resize()
  }

  async sendMessage(message: string, withKeyboard = false) {
    try {
      await this.bot.telegram.sendMessage(
        this.telegramChatId,
        message,
        withKeyboard ? this.generateKeyboard() : undefined
      );
    } catch (error) {
      await this.bot.telegram.sendMessage(
        this.telegramChatId,
        'OCORREU ALGUM PROBLEMA',
        withKeyboard ? this.generateKeyboard() : undefined
      );
    }
  }
}

export default new MessageService();
