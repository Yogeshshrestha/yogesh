import { Resend } from 'resend';

/**
 * Vercel serverless function — POST /api/contact
 *
 * This runs on Vercel's servers in production.
 * The Resend API key comes from Vercel Environment Variables,
 * never from the browser or the built frontend bundle.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body ?? {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'Server is not configured. Set RESEND_API_KEY in Vercel.',
      });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.RESEND_TO_EMAIL || 'yogeshshrestha845@gmail.com',
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
}
