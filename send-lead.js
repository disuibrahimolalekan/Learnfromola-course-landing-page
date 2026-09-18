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
        subject: `Thanks for your interest, ${firstName}!`,
        html: `<p>Hi ${firstName},</p><p>Thanks for checking out the AI Software Developer course. We'll be in touch shortly.</p>`
      })
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      return res.status(502).json({ error: 'Email send failed', detail: errText });
    }

    await fetch('https://script.google.com/macros/s/AKfycbz4wgzcjv1szlSZnvcWSaLWZjaBnRoqsCpSYX2PQUA9wPAGpEdesQfcBJRbIIGfanza/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, email })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
