const nodemailer = require('nodemailer');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escape and cap a user-supplied field before it goes into the email HTML.
function clean(value, maxLen = 300) {
  if (value === undefined || value === null) return '';
  return escapeHtml(String(value).slice(0, maxLen));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so bots don't adapt.
  if (body.website) {
    return res.status(200).json({ success: true });
  }

  if (!body.name || !body.email || !body.phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  if (typeof body.email !== 'string' || body.email.length > 254 || !EMAIL_RE.test(body.email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  // Check env vars are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP_USER or SMTP_PASS environment variables');
    return res.status(500).json({ error: 'Email not configured' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const name = clean(body.name, 100);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, 150);
  const address = clean(body.address, 300);
  const budget = clean(body.budget, 50);
  const displayType = clean(body.displayType, 50);
  const width = clean(body.width, 10);
  const height = clean(body.height, 10);
  const numDisplays = clean(body.numDisplays, 10);
  const location = clean(body.location, 200);
  const contentType = clean(body.contentType, 50);
  const timeline = clean(body.timeline, 50);
  const source = clean(body.source, 50);
  const description = clean(body.description, 5000);
  const contactMethod = clean(body.contactMethod, 20);

  const sqft = (parseFloat(body.width) || 0) * (parseFloat(body.height) || 0);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">New Quote Request</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">LPLED by LPCREATIVE, LLC</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 40%;">Name</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>
          ${company ? `<tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
          ${address ? `<tr><td style="padding: 8px 0; color: #666;">Address</td><td style="padding: 8px 0;">${address}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #666;">Preferred Contact</td><td style="padding: 8px 0;">${contactMethod || 'Email'}</td></tr>
        </table>

        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 25px;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 40%;">Budget Range</td><td style="padding: 8px 0; font-weight: bold;">${budget}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Display Type</td><td style="padding: 8px 0;">${displayType}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Dimensions</td><td style="padding: 8px 0;">${width}' x ${height}' (${sqft} sq ft)</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Number of Displays</td><td style="padding: 8px 0;">${numDisplays}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Configuration</td><td style="padding: 8px 0;">${body.displayConfig === 'double' ? 'Double Sided' : 'Single Sided'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Location/Venue</td><td style="padding: 8px 0;">${location}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Content Type</td><td style="padding: 8px 0;">${contentType}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Timeline</td><td style="padding: 8px 0;">${timeline}</td></tr>
        </table>

        ${source ? `<p style="margin-top: 20px; color: #666;"><strong>How they found us:</strong> ${source}</p>` : ''}
        ${description ? `
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 25px;">Additional Details</h2>
          <p style="color: #333; line-height: 1.6;">${description}</p>
        ` : ''}
      </div>
    </div>
  `;

  const subjectName = String(body.name).slice(0, 100).replace(/[\r\n]/g, ' ');
  const subjectCompany = body.company ? ` — ${String(body.company).slice(0, 100).replace(/[\r\n]/g, ' ')}` : '';
  const subjectBudget = String(body.budget || '').slice(0, 50).replace(/[\r\n]/g, ' ');

  try {
    await transporter.sendMail({
      from: `"LPLED Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
      replyTo: body.email,
      subject: `New Quote Request: ${subjectName}${subjectCompany} (${subjectBudget})`,
      html: htmlBody
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error.message, error.code);
    return res.status(500).json({ error: 'Failed to send' });
  }
};
