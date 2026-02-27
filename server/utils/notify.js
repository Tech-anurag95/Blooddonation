const nodemailer = require('nodemailer');
const axios = require('axios');
const webpush = require('web-push');

// Configure VAPID keys for Web Push
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:no-reply@bloodconnect.local';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
} else {
  console.log('Web Push VAPID keys not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in environment to enable push notifications.');
}

const sendEmail = async (to, subject, text) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    console.log(`SMTP not configured. Email to ${to}: ${subject} - ${text}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@bloodconnect.local',
      to,
      subject,
      text
    });
  } catch (err) {
    console.error('Error sending email:', err.message || err);
  }
};

const sendSMS = async (phone, message) => {
  // Twilio or other SMS provider can be used. If TWILIO creds are set, attempt send; otherwise log.
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM) {
    console.log(`SMS not configured. Message to ${phone}: ${message}`);
    return;
  }

  try {
    const qs = new URLSearchParams({
      From: process.env.TWILIO_FROM,
      To: phone,
      Body: message
    });

    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, qs.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`
      }
    });
  } catch (err) {
    console.error('Error sending SMS:', err.message || err);
  }
};

const notifyDonors = async (bloodRequest, donors = []) => {
  const subject = `Urgent: ${bloodRequest.bloodType} needed at ${bloodRequest.hospital}`;
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/request/${bloodRequest._id}`;
  const text = `${bloodRequest.quantity} unit(s) of ${bloodRequest.bloodType} required at ${bloodRequest.hospital}, ${bloodRequest.city}. Urgency: ${bloodRequest.urgency}. Contact: ${bloodRequest.phone}\n\nDetails: ${link}`;

  // Limit notifications to avoid spamming
  const limited = donors.slice(0, 20);

  await Promise.all(limited.map(async (d) => {
    if (d.email) await sendEmail(d.email, subject, `Hi ${d.name || ''},\n\n${text}`);
    if (d.phone) await sendSMS(d.phone, `${subject} — ${bloodRequest.hospital}. See ${link}`);
    // send web push to stored subscriptions for donor
    if (d.pushSubscriptions && d.pushSubscriptions.length > 0 && VAPID_PUBLIC && VAPID_PRIVATE) {
      const payload = JSON.stringify({ title: subject, body: `${bloodRequest.quantity} unit(s) needed at ${bloodRequest.hospital}`, url: link });
      for (const sub of d.pushSubscriptions) {
        try {
          await webpush.sendNotification(sub, payload);
        } catch (err) {
          console.error('Web push send error:', err.message || err);
        }
      }
    }
  }));
};

module.exports = { notifyDonors };
