# Project Overview
We are building a lightweight, Agent-centric API Gateway prototype inspired by the OpenClaw framework. This system routes messages between external communication platforms and internal AI Agents using an Adapter Design Pattern. 

Currently, we are focusing strictly on a **Telegram Long Polling** implementation to bypass inbound network firewalls, alongside a **Mock AI Agent** for testing the routing logic.

# Tech Stack & Tools
* **Language:** TypeScript (Node.js)
* **Package Manager:** `npm`
* **Core Libraries:** * `grammy` (Telegram Bot API framework)
  * `dotenv` (Environment variable management)
  * `https-proxy-agent` (For routing Telegram API calls through a local network proxy)
* **Type Definitions:** `@types/node`

# Environment & Network Constraints
The development environment runs inside a private network. Because the Telegram API is blocked by a regional firewall, all outbound requests to `api.telegram.org` MUST be routed through a local proxy. 
The application will rely on a `.env` file containing:
* `TELEGRAM_BOT_TOKEN=your_token_here`
* `PROXY_URL=http://your_host_ip:7890` (The proxy agent must be applied to the grammY Bot instance).

# Architecture & Directory Structure
Use a flat directory structure under `src/`. Do not overcomplicate the architecture; keep it modular but simple.

## 1. `src/core/interfaces.ts` (The Contract)
Define the strict platform-agnostic data structures:
* `StandardMessage`: `{ messageId: string, chatId: string, userId: string, userName: string, platform: string, text: string, timestamp: number }`
* `ChannelAdapter` Interface: Requires `start()`, `stop()`, `onMessage(callback)`, and `sendMessage(chatId, text)`.

## 2. `src/adapters/telegram.ts` (The Implementation)
Implement the `ChannelAdapter` interface for Telegram using `grammy`.
* Instantiate the bot using `TELEGRAM_BOT_TOKEN`.
* Inject `HttpsProxyAgent` using `PROXY_URL` to ensure network connectivity.
* Map inbound `ctx.message` to `StandardMessage`.
* Map outbound `sendMessage` to `bot.api.sendMessage()`.

## 3. `src/core/gateway.ts` (The Router)
The central manager that orchestrates the adapters and session state.
* Maintain a registry of adapters (`Map<string, ChannelAdapter>`).
* Maintain an in-memory session store for conversation history (`Map<string, StandardMessage[]>`).
* Implement a routing method that receives an inbound message, updates the history, passes context to the Agent, waits for the reply, and routes the response back out via the correct adapter.

## 4. `src/agent/mockAgent.ts` (The Brain)
A dummy asynchronous function to simulate an LLM. 
* Accept the conversation history and the new message.
* Use `setTimeout` to simulate a 1-2 second processing delay.
* Return a mock string (e.g., `[Mock Agent] Echo: <text>`).

## 5. `src/index.ts` (The Entry Point)
Wire the dependencies together:
1. Load `.env` using `dotenv`.
2. Instantiate the `Gateway`.
3. Instantiate the `TelegramAdapter`.
4. Register the adapter with the gateway.
5. Start the gateway.

# Execution Instructions for Claude
1. Initialize the project: Run `npm init -y` and generate a `tsconfig.json` configured for Node.js (ES2022, CommonJS or ESModules).
2. Install dependencies: `npm install grammy dotenv https-proxy-agent` and `npm install -D typescript @types/node ts-node`.
3. Generate the source code files matching the architecture described above.
4. Create a template `.env.example` file.
5. Add a `"start": "ts-node src/index.ts"` script to `package.json`.

---

# Implementation Status: COMPLETE

## What Was Built

All components have been implemented and committed to the repository:

### Generated Files
```
src/
├── core/
│   ├── interfaces.ts     # StandardMessage & ChannelAdapter interface
│   └── gateway.ts        # Central routing logic & session store
├── adapters/
│   └── telegram.ts       # Telegram implementation with proxy support
├── agent/
│   └── mockAgent.ts      # Simple echo mock agent
└── index.ts              # Entry point & dependency wiring
```

### Additional Files Created
- `.gitignore` - Excludes node_modules, .env, and dist/
- `.env.example` - Template for environment variables
- `tsconfig.json` - TypeScript configuration (ES2022, CommonJS)
- `package.json` - Dependencies and scripts

## How to Run

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```bash
   TELEGRAM_BOT_TOKEN=your_actual_bot_token
   PROXY_URL=http://your_host_ip:7890
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Notes

- The gateway uses **long polling** for Telegram, making it firewall-friendly
- Proxy is **mandatory** - the app will exit if `PROXY_URL` is not set
- Session history is stored **in-memory** (not persisted across restarts)
- Mock Agent responds with: `[Mock Agent] Echo: <text>` after 1-2 second delay