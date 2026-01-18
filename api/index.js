import { createApp } from '../server/_core/index.ts';

// For Vercel, we can import from the source if we use the right loader,
// but it's safer to use the compiled version if possible.
// However, Vercel's @vercel/node can handle TS files directly in the api/ directory.
// Let's just export the app directly.

const app = createApp();
export default app;
