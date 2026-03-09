/**
 * Platform-agnostic data structures and interfaces for the Gateway system.
 */

/**
 * Standardized message format used across all platform adapters.
 */
export interface StandardMessage {
  messageId: string;
  chatId: string;
  userId: string;
  userName: string;
  platform: string;
  text: string;
  timestamp: number;
}

/**
 * Interface that all channel adapters must implement.
 * This ensures a consistent API for different communication platforms.
 */
export interface ChannelAdapter {
  /**
   * Start the adapter and begin listening for messages.
   */
  start(): Promise<void>;

  /**
   * Stop the adapter and clean up resources.
   */
  stop(): Promise<void>;

  /**
   * Register a callback to handle incoming messages.
   * @param callback - Function to call when a message is received
   */
  onMessage(callback: (message: StandardMessage) => void): void;

  /**
   * Send a message to a specific chat.
   * @param chatId - The target chat identifier
   * @param text - The message text to send
   */
  sendMessage(chatId: string, text: string): Promise<void>;
}
