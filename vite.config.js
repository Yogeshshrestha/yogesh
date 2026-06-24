import { defineConfig, loadEnv } from 'vite';
import { Resend } from 'resend';

/**
 * vite.config.js
 * ─────────────────────────────────────────────────────────
 * Vite configuration with a custom dev-server plugin that
 * handles the POST /api/contact endpoint.
 *
 * WHY A SERVER PLUGIN AND NOT FRONTEND CODE?
 * The Resend API key is a SECRET. If you import and use it
 * directly in a browser JS file, anyone can open DevTools
 * and steal your key. The Vite plugin runs only on the
 * Node.js dev server — the key never reaches the browser.
 *
 * FOR PRODUCTION:
 * Deploy the same logic as a serverless function
 * (Vercel /api route, Netlify Function, Cloudflare Worker, etc.)
 * and set RESEND_API_KEY as an environment variable there.
 */
export default defineConfig(({ mode }) => {
  // loadEnv reads your .env file and makes the variables available here
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      contactApiPlugin(env.RESEND_API_KEY),
    ],
  };
});


/**
 * contactApiPlugin
 * A Vite plugin that adds a POST /api/contact route to the
 * dev server. Receives form data and sends it via Resend.
 *
 * @param {string} apiKey - The Resend API key from .env
 */
function contactApiPlugin(apiKey) {
  return {
    name: 'contact-api',

    // configureServer runs once when `vite dev` starts.
    // `server` is Vite's Connect middleware instance.
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        // Only allow POST requests
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Read the request body (Node streams — data arrives in chunks)
        let body = '';
        req.on('data', (chunk) => { body += chunk.toString(); });

        req.on('end', async () => {
          try {
            const { name, email, subject, message } = JSON.parse(body);

            // Basic server-side guard
            if (!name || !email || !subject || !message) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'All fields are required.' }));
              return;
            }

            if (!apiKey || apiKey === 're_xxxxxxxxx') {
              console.warn('\n⚠  Resend API key not set. Open .env and replace re_xxxxxxxxx with your real key.\n');
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Server is not configured. Please set RESEND_API_KEY in .env' }));
              return;
            }

            const resend = new Resend(apiKey);

            await resend.emails.send({
              from: 'onboarding@resend.dev',
              to:   'yogeshshrestha845@gmail.com',
              subject: `[Portfolio Contact] ${subject}`,
              html: `
                <h2>New message from your portfolio</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p>${message.replace(/\n/g, '<br>')}</p>
              `,
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));

          } catch (err) {
            console.error('Resend error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to send email. Please try again.' }));
          }
        });
      });
    },
  };
}
