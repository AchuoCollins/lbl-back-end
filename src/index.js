import 'dotenv/config';
import { createApp } from './app.js';
import { seedAdminFromEnv } from './db/store.js';

const app = createApp();
const port = process.env.PORT || 4000;

await seedAdminFromEnv();

app.listen(port, () => {
  console.log(`LBL backend listening on http://localhost:${port}`);
});
