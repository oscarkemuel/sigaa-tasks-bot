require('dotenv').config();
import { Telegram } from "telegraf";

class TelegramService {
  private telegramToken;
  private telegramChatId;
  private telegram;

  constructor() {
    this.telegramToken = process.env.TELEGRAM_TOKEN || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
    this.telegram = new Telegram(this.telegramToken);
  }

  async sendMessage(message: string) {
    try {
      await this.telegram.sendMessage(this.telegramChatId, message);
    } catch (error) {
      await this.telegram.sendMessage(this.telegramChatId, 'OCORREU ALGUM PROBLEMA');
    }
  }
}

export default new TelegramService();
