export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, email } = req.body;
  if (!firstName || !email) {
    return res.status(400).json({ error: 'Missing firstName or email' });
  }

  const SELAR_URL = 'https://selar.com/8713g4z88e';
  const waMessage = `Hi Ola, I'm interested in your AI software developer course. My name is ${firstName}.\n\nI have few questions. `;
  const WHATSAPP_URL = `https://wa.me/2349036374359?text=${encodeURIComponent(waMessage)}`;

  const emailHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Hi ${firstName},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Thanks for your interest in the AI Software Developer course.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">AI can write the code for you now. What most builders don't know is what to check before that code goes live — what to test, what to secure, what to ask. That's what this course teaches.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">You can go ahead and get the course now, or message us directly on WhatsApp if you have questions first.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px">
        <tr><td style="border-radius:999px;background:#111">
          <a href="${SELAR_URL}" style="display:block;padding:14px 20px;color:#fff;text-decoration:none;font-weight:bold;font-size:15px;text-align:center;border-radius:999px">Get the course now →</a>
        </td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
        <tr><td style="border-radius:999px;background:#25D366">
          <a href="${WHATSAPP_URL}" style="display:block;padding:14px 20px;color:#fff;text-decoration:none;font-weight:bold;font-size:15px;text-align:center;border-radius:999px">Message us on WhatsApp</a>
        </td></tr>
      </table>
      <p style="font-size:15px;line-height:1.6;margin:0;color:#555">Talk soon,<br>Ola</p>
    </div>
  `;

  const result = { emailSent: false, sheetSaved: false, emailError: null, sheetError: null };

  // Attempt 1: send the welcome email via Resend
  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@learnfromola.online',
        to: email,
        subject: `Welcome, ${firstName} — here's how to get started`,
        html: emailHtml
      })
    });

    if (emailRes.ok) {
      result.emailSent = true;
    } else {
      result.emailError = await emailRes.text();
    }
  } catch (err) {
    result.emailError = err.message;
  }

  // Attempt 2: log the lead to the Google Sheet — runs regardless of email outcome
  try {
    const sheetRes = await fetch('https://script.google.com/macros/s/AKfycbz4wgzcjv1szlSZnvcWSaLWZjaBnRoqsCpSYX2PQUA9wPAGpEdesQfcBJRbIIGfanza/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, email })
    });

    if (sheetRes.ok) {
      result.sheetSaved = true;
    } else {
      result.sheetError = await sheetRes.text();
    }
  } catch (err) {
    result.sheetError = err.message;
  }

  // Report exactly what happened — no more silent failure
  const overallOk = result.emailSent || result.sheetSaved;
  return res.status(overallOk ? 200 : 502).json(result);
        }
