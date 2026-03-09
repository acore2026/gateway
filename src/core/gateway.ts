import { ChannelAdapter, StandardMessage } from "./interfaces";
import { processMessage } from "../agent/mockAgent";

/**
 * Central Gateway that orchestrates adapters and routes messages
 * between external platforms and the AI Agent.
 */
export class Gateway {
  private adapters: Map<string, ChannelAdapter> = new Map();
  private sessions: Map<string, StandardMessage[]> = new Map();

  /**
   * Register a channel adapter with the gateway.
   * @param name - Unique identifier for the adapter
   * @param adapter - The adapter instance to register
   */
  registerAdapter(name: string, adapter: ChannelAdapter): void {
    console.log(`[Gateway] Registering adapter: ${name}`);
    this.adapters.set(name, adapter);

    // Set up message handler for this adapter
    adapter.onMessage((message) => this.handleIncomingMessage(name, message));
  }

  /**
   * Get the session key for a conversation.
   * Combines platform and chatId for uniqueness.
   */
  private getSessionKey(platform: string, chatId: string): string {
    return `${platform}:${chatId}`;
  }

  /**
   * Get or create conversation history for a session.
   */
  private getSessionHistory(platform: string, chatId: string): StandardMessage[] {
    const key = this.getSessionKey(platform, chatId);
    if (!this.sessions.has(key)) {
      this.sessions.set(key, []);
    }
    return this.sessions.get(key)!;
  }

  /**
   * Handle an incoming message from any adapter.
   */
  private async handleIncomingMessage(
    adapterName: string,
    message: StandardMessage
  ): Promise<void> {
    console.log(
      `[Gateway] Received message from ${adapterName} - User: ${message.userName}, Text: ${message.text}`
    );

    // Get conversation history and add new message
    const history = this.getSessionHistory(message.platform, message.chatId);
    history.push(message);

    // Get response from mock agent
    const response = await processMessage(history, message);

    // Send response back through the same adapter
    await this.routeResponse(adapterName, message.chatId, response);

    // Store the agent's response in history for context
    const agentMessage: StandardMessage = {
      messageId: `agent-${Date.now()}`,
      chatId: message.chatId,
      userId: "agent",
      userName: "MockAgent",
      platform: message.platform,
      text: response,
      timestamp: Date.now(),
    };
    history.push(agentMessage);
  }

  /**
   * Route a response back to the user through the appropriate adapter.
   */
  private async routeResponse(
    adapterName: string,
    chatId: string,
    text: string
  ): Promise<void> {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      console.error(`[Gateway] Adapter not found: ${adapterName}`);
      return;
    }

    console.log(`[Gateway] Sending response via ${adapterName} to chat ${chatId}`);
    await adapter.sendMessage(chatId, text);
  }

  /**
   * Start all registered adapters.
   */
  async start(): Promise<void> {
    console.log("[Gateway] Starting all adapters...");
    const startPromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.start()
    );
    await Promise.all(startPromises);
  }

  /**
   * Stop all registered adapters.
   */
  async stop(): Promise<void> {
    console.log("[Gateway] Stopping all adapters...");
    const stopPromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.stop()
    );
    await Promise.all(stopPromises);
  }
}
