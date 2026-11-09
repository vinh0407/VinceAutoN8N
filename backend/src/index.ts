import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { createServer } from './api/server.js';
import { globalCronScheduler } from './scheduler/cron-manager.js';

const PORT = Number(process.env.PORT) || 5678;

const { server } = createServer();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
=============================================================
  ⚡ VINCEAUTO WORKFLOW AUTOMATION & AI AGENT PLATFORM ⚡
=============================================================
  🌐 Server:       http://0.0.0.0:${PORT}
  📡 API Base:     http://0.0.0.0:${PORT}/api
  🎯 Webhooks:     http://0.0.0.0:${PORT}/webhook/:path
  🩺 Health Check: http://0.0.0.0:${PORT}/health
  🤖 AI Engine:    Active (Gemini, OpenAI, Claude, Ollama)
  🔄 Schedulers:   Active
=============================================================
  `);

  // Start background cron scheduler
  globalCronScheduler.start();

  // Render / Cloud Free Tier Self-Ping Keep-Alive
  const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
  if (keepAliveUrl) {
    const pingTarget = `${keepAliveUrl.replace(/\/$/, '')}/health`;
    console.log(`[KeepAlive] Auto self-ping enabled: ${pingTarget} (interval: 10m)`);

    setInterval(async () => {
      try {
        await axios.get(pingTarget);
        console.log(`[KeepAlive] Auto-ping success at ${new Date().toLocaleTimeString('vi-VN')}`);
      } catch (err: any) {
        console.warn(`[KeepAlive] Auto-ping notice: ${err.message}`);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
});
