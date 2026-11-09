import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './api/server.js';
import { globalCronScheduler } from './scheduler/cron-manager.js';

const PORT = process.env.PORT || 5678;

const { server } = createServer();

server.listen(PORT, () => {
  console.log(`
=============================================================
  ⚡ VINCEAUTO WORKFLOW AUTOMATION & AI AGENT PLATFORM ⚡
=============================================================
  🌐 Server:       http://localhost:${PORT}
  📡 API Base:     http://localhost:${PORT}/api
  🎯 Webhooks:     http://localhost:${PORT}/webhook/:path
  🤖 AI Engine:    Active (Gemini, OpenAI, Claude, Ollama)
  🔄 Schedulers:   Active
=============================================================
  `);

  // Start background cron scheduler
  globalCronScheduler.start();
});
