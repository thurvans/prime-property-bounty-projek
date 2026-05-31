import { config } from './config.js';
import { createApp, ensureStore } from './app.js';

const app = createApp({ serveClient: true });

await ensureStore();
app.listen(config.port, () => {
  console.log(`Prime Property API berjalan di http://localhost:${config.port}`);
});
