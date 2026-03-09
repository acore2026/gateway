import { Bot, Context } from "grammy";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ChannelAdapter, StandardMessage } from "../core/interfaces";

/**
 * Telegram adapter implementing the ChannelAdapter interface.
 * Uses grammY library with HttpsProxyAgent for firewall bypass.
 */
export class TelegramAdapter implements ChannelAdapter {
  private bot: Bot;
  private messageHandler?: (message: StandardMessage) => void;

  constructor(botToken: string, proxyUrl: string) {
    // Configure HttpsProxyAgent for all Telegram API requests
    const agent = new HttpsProxyAgent(proxyUrl);
    this.bot = new Bot(botToken, {
      client: {
        baseFetchConfig: {
          agent: agent,
        },
      },
    });

    this.setupHandlers();
  }

  /**
   * Set up message handlers for incoming Telegram updates.
   */
  private setupHandlers(): void {
    this.bot.on("message:text", (ctx: Context) => {
      if (!ctx.message || !this.messageHandler) {
        return;
      }

      const standardMessage = this.mapToStandardMessage(ctx);
      this.messageHandler(standardMessage);
    });
  }

  /**
   * Map grammY context to StandardMessage format.
   */
  private mapToStandardMessage(ctx: Context): StandardMessage {
    const message = ctx.message!;
    const chat = ctx.chat!;
    const from = ctx.from!;

    return {
      messageId: String(message.message_id),
      chatId: String(chat.id),
      userId: String(from.id),
      userName: from.username || from.first_name || "Unknown",
      platform: "telegram",
      text: message.text || "",
      timestamp: message.date * 1000, // Convert seconds to milliseconds
    };
  }

  /**
   * Start the bot and begin long polling.
   */
  async start(): Promise<void> {
    console.log("[TelegramAdapter] Starting bot with long polling...");
    await this.bot.start({
      onStart: (botInfo) => {
        console.log(`[TelegramAdapter] Bot @${botInfo.username} started successfully`);
      },
    });
  }

  /**
   * Stop the bot and clean up resources.
   */
  async stop(): Promise<void> {
    console.log("[TelegramAdapter] Stopping bot...");
    await this.bot.stop();
  }

  /**
   * Register a message handler callback.
   */
  onMessage(callback: (message: StandardMessage) => void): void {
    this.messageHandler = callback;
  }

  /**
   * Send a message to a specific Telegram chat.
   */
  async sendMessage(chatId: string, text: string): Promise<void> {
    await this.bot.api.sendMessage(chatId, text);
  }
}
