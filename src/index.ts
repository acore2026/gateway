import dotenv from "dotenv";
import { Gateway } from "./core/gateway";
import { TelegramAdapter } from "./adapters/telegram";

// Load environment variables from .env file
dotenv.config();

/**
 * Application entry point.
 * Wires together all dependencies and starts the Gateway.
 */
async function main(): Promise<void> {
  console.log("=== Starting Agent-centric API Gateway ===\n");

  // Validate required environment variables
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const proxyUrl = process.env.PROXY_URL;

  if (!botToken) {
    console.error("Error: TELEGRAM_BOT_TOKEN environment variable is required");
    process.exit(1);
  }

  if (!proxyUrl) {
    console.error("Error: PROXY_URL environment variable is required");
    process.exit(1);
  }

  console.log(`Proxy configured: ${proxyUrl}`);

  // Create the central gateway
  const gateway = new Gateway();

  // Create and register the Telegram adapter
  const telegramAdapter = new TelegramAdapter(botToken, proxyUrl);
  gateway.registerAdapter("telegram", telegramAdapter);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\nReceived SIGINT, shutting down gracefully...");
    await gateway.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n\nReceived SIGTERM, shutting down gracefully...");
    await gateway.stop();
    process.exit(0);
  });

  // Start the gateway (this starts all registered adapters)
  await gateway.start();
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
