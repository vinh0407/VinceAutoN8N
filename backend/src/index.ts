import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { createServer } from './api/server.js';
import { globalCronScheduler } from './scheduler/cron-manager.js';
import { globalTelegramPoller } from './scheduler/telegram-poller.js';
import { globalCloudBackup } from './storage/cloud-backup.js';

const PORT = Number(process.env.PORT) || 5678;

const { server } = createServer();

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`
=============================================================
  ⚡ VINCEAUTO WORKFLOW AUTOMATION & AI AGENT PLATFORM ⚡
=============================================================
  🌐 Server:       http://0.0.0.0:${PORT}
  📡 API Base:     http://0.0.0.0:${PORT}/api
  🎯 Webhooks:     http://0.0.0.0:${PORT}/webhook/:path
  🩺 Health Check: http://0.0.0.0:${PORT}/health
=============================================================
  `);

  // 1. Restore persisted data first (Render Free disk is wiped on every restart)
  await globalCloudBackup.restore();
  globalCloudBackup.startAutoSync();

  // 2. Re-activate everything that was published before the restart
  globalCronScheduler.start();
  globalTelegramPoller.start();

  // 3. Keep the free instance awake (Render sleeps after 15 min without inbound traffic)
  const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
  if (keepAliveUrl) {
    const pingTarget = `${keepAliveUrl.replace(/\/$/, '')}/ping`;
    console.log(`[KeepAlive] Self-ping enabled: ${pingTarget} (every 5 min)`);
    setInterval(async () => {
      try {
        await axios.get(pingTarget, { timeout: 15000 });
      } catch (err: any) {
        console.warn(`[KeepAlive] ping failed: ${err.message}`);
      }
    }, 5 * 60 * 1000);
  }
});
