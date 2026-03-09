import { StandardMessage } from "../core/interfaces";

/**
 * Mock AI Agent that simulates LLM processing.
 * Provides simple echo responses with a processing delay.
 */

/**
 * Process a user message with simulated LLM delay.
 * @param history - Previous conversation history
 * @param newMessage - The incoming message to process
 * @returns The mock agent's response text
 */
export async function processMessage(
  history: StandardMessage[],
  newMessage: StandardMessage
): Promise<string> {
  // Simulate processing delay (1-2 seconds)
  const delayMs = 1000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // Simple echo response
  return `[Mock Agent] Echo: ${newMessage.text}`;
}
