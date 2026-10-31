import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiDevPlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/extract' || url === '/api/digest') {
          try {
            // Buffer JSON body
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString();
            let body = {};
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch (e) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Malformed JSON payload.' }));
                return;
              }
            }

            // Create Vercel-compatible req/res facade
            req.body = body;

            res.status = function (code) {
              this.statusCode = code;
              return this;
            };

            res.json = function (data) {
              this.setHeader('Content-Type', 'application/json');
              this.end(JSON.stringify(data));
              return this;
            };

            if (url === '/api/extract') {
              const handler = (await import('./api/extract.js')).default;
              await handler(req, res);
            } else if (url === '/api/digest') {
              const handler = (await import('./api/digest.js')).default;
              await handler(req, res);
            }
            return;
          } catch (err) {
            console.error('[Vite API Proxy Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    port: 5173,
    open: false
  }
});
