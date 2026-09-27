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
// Canonical checkbox wording shown on /updates. Bump CONSENT_VERSION whenever the wording changes
// (and update updates.html + the Twilio campaign's opt-in description to match).
const CONSENT_VERSION = '2026-09-27-v1';
const CONSENT_TEXT = 'Yes, text me project updates. By checking this box, I agree to receive recurring automated text messages from LPLED (LPCREATIVE, LLC) at the mobile number provided about LED display projects I am involved in, including project status updates, installation and crew scheduling, arrival, delivery, and site coordination notices, invoice and payment reminders, and service and warranty updates. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. See our Text Messaging Terms and Privacy Policy.';

const ROLES = { client: 'Client / school contact', subcontractor: 'Subcontractor or supplier', team: 'LPLED team member', other: 'Other' };

// Normalize a US number to +1XXXXXXXXXX, or return null.
function toE164(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so bots don't adapt.
  if (body.website) {
    return res.status(200).json({ success: true });
  }

  if (!body.name || !body.email || !body.role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }
  if (typeof body.email !== 'string' || body.email.length > 254 || !EMAIL_RE.test(body.email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  const smsConsent = body.smsConsent === 'yes';
  const phoneE164 = toE164(body.phone);
  if (smsConsent && !phoneE164) {
    return res.status(400).json({ error: 'A valid US mobile number is required for text updates' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP_USER or SMTP_PASS environment variables');
    return res.status(500).json({ error: 'Email not configured' });
  }

  // Consent record: server timestamp + request metadata, so the opt-in is provable later.
  const receivedAt = new Date().toISOString();
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const userAgent = String(req.headers['user-agent'] || '').slice(0, 300);

  const name = clean(body.name, 100);
  const email = clean(body.email, 254);
  const phone = phoneE164 ? clean(phoneE164, 20) : clean(body.phone, 40);
  const organization = clean(body.organization, 150);
  const role = clean(ROLES[body.role] || body.role, 50);
  const project = clean(body.project, 150);
  const consentText = clean(body.consentText, 1200);
  const pageUrl = clean(body.pageUrl, 300);

  const row = (label, value) => value
    ? `<tr><td style="padding: 8px 0; color: #666; width: 40%; vertical-align: top;">${label}</td><td style="padding: 8px 0;">${value}</td></tr>`
    : '';

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1f2937; padding: 24px 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Project Updates Sign-Up</h1>
        <p style="color: #f75f3f; margin: 5px 0 0; font-weight: bold;">${smsConsent ? 'SMS CONSENT: YES (email + text)' : 'SMS consent: no (email only)'}</p>
      </div>
      <div style="background: #f9f9f9; padding: 24px 30px; border-radius: 0 0 10px 10px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${row('Name', `<strong>${name}</strong>`)}
          ${row('Email', `<a href="mailto:${email}">${email}</a>`)}
          ${row('Mobile', phone)}
          ${row('Role', role)}
          ${row('Organization', organization)}
          ${row('Project / venue', project)}
        </table>
        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #f75f3f; padding-bottom: 6px; margin-top: 24px;">Consent record</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${row('Received (UTC)', receivedAt)}
          ${row('SMS consent box', smsConsent ? 'Checked' : 'Not checked')}
          ${row('Page', pageUrl)}
          ${row('IP address', clean(ip, 64))}
          ${row('User agent', clean(userAgent, 300))}
          ${smsConsent ? row('Consent version', CONSENT_VERSION) : ''}
          ${smsConsent ? row('Wording matches site', String(body.consentText || '') === CONSENT_TEXT ? 'Yes' : '<strong style="color:#b83820">NO - check</strong>') : ''}
          ${smsConsent ? row('Consent wording shown', consentText) : ''}
        </table>
      </div>
    </div>
  `;

  const subjectName = String(body.name).slice(0, 100).replace(/[\r\n]/g, ' ');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: `"LPLED Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
      replyTo: body.email,
      subject: `Updates sign-up: ${subjectName} (${smsConsent ? 'email + SMS' : 'email only'})`,
      html: htmlBody
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error.message, error.code);
    return res.status(500).json({ error: 'Failed to send' });
  }
};
