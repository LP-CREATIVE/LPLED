const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone, company, address,
    budget, displayType, width, height, numDisplays,
    displayConfig, location, contentType, timeline,
    source, description, contactMethod
  } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  // Check env vars are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP_USER or SMTP_PASS environment variables');
    return res.status(500).json({ error: 'Email not configured', detail: 'Missing SMTP credentials' });
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

  const sqft = (parseFloat(width) || 0) * (parseFloat(height) || 0);

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
          <tr><td style="padding: 8px 0; color: #666;">Configuration</td><td style="padding: 8px 0;">${displayConfig === 'double' ? 'Double Sided' : 'Single Sided'}</td></tr>
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

  try {
    await transporter.sendMail({
      from: `"LPLED Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `New Quote Request: ${name}${company ? ` — ${company}` : ''} (${budget})`,
      html: htmlBody
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error.message, error.code);
    return res.status(500).json({ error: 'Failed to send', detail: error.message });
  }
};
