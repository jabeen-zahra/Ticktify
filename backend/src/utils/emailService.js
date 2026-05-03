const nodemailer = require('nodemailer');

const buildTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EmailService] ⚠️  SMTP credentials not set — emails disabled');
    return null;
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

const transporter = buildTransport();

if (transporter) {
  transporter.verify((err) => {
    if (err) console.warn(`[EmailService] ⚠️  SMTP failed: ${err.message}`);
    else     console.log('[EmailService] ✅ SMTP transport ready');
  });
}

const send = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.warn(`[EmailService] Skipped email to ${to}: no SMTP transport`);
    return null;
  }
  const from = `"${process.env.EMAIL_FROM_NAME || 'Ticktify'}" <${process.env.EMAIL_FROM}>`;
  try {
    const info = await transporter.sendMail({ from, to, subject, html, text });
    console.log(`[EmailService] ✅ Sent to ${to}: ${subject}`);
    return info;
  } catch (err) {
    console.error(`[EmailService] ❌ Failed to send to ${to}: ${err.message}`);
    return null;
  }
};

const htmlWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticktify</title>
</head>
<body style="margin:0;padding:0;background:#08090F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090F;padding:40px 20px;">
    <tr><td>
      <table width="600" align="center" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#0D1117;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#0A0C14;padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.07);">
            <span style="font-size:20px;font-weight:800;color:#CBFF47;">Ticktify</span>
            <span style="font-size:10px;letter-spacing:3px;color:rgba(203,255,71,0.6);text-transform:uppercase;margin-left:8px;">Opportunities</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <div style="color:#F0F4FF;font-size:15px;line-height:1.7;">
              ${content}
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0A0C14;padding:20px 32px;border-top:1px solid rgba(255,255,255,0.07);">
            <p style="margin:0;font-size:12px;color:#4A5568;text-align:center;">
              © ${new Date().getFullYear()} Ticktify — Pakistan's Student Opportunities Hub
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const sendWelcome = async (user) => {
  const dashLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;
  return send({
    to: user.email, subject: 'Welcome to Ticktify 🎉',
    html: htmlWrapper(`
      <h2 style="margin:0 0 16px;color:#F0F4FF;font-size:24px;font-weight:700;">Welcome, ${user.name.split(' ')[0]}! 👋</h2>
      <p style="color:#8892A4;">Your account is ready. Start discovering opportunities across Pakistan.</p>
      <p style="margin:24px 0;">
        <a href="${dashLink}" style="display:inline-block;background:#CBFF47;color:#08090F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
          Explore Opportunities →
        </a>
      </p>
      <p style="color:#4A5568;font-size:13px;">If you didn't create this account, please ignore this email.</p>
    `),
    text: `Welcome to Ticktify, ${user.name}! Visit: ${dashLink}`,
  });
};

const sendOrganizerApproved = async (user) => {
  const dashLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/organizer`;
  return send({
    to: user.email, subject: 'Your Ticktify organizer account is approved ✅',
    html: htmlWrapper(`
      <h2 style="margin:0 0 16px;color:#CBFF47;font-size:24px;font-weight:700;">Account Approved! ✅</h2>
      <p style="color:#8892A4;">
        <strong style="color:#F0F4FF;">${user.organizerProfile?.organizationName || 'Your organization'}</strong>
        is now verified on Ticktify.
      </p>
      <p style="margin:24px 0;">
        <a href="${dashLink}" style="display:inline-block;background:#CBFF47;color:#08090F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
          Post Your First Listing →
        </a>
      </p>
    `),
    text: `Your organizer account has been approved. Start posting at ${dashLink}`,
  });
};

const sendOrganizerRejected = async (user, reason) => {
  return send({
    to: user.email, subject: 'Ticktify — Organizer application update',
    html: htmlWrapper(`
      <h2 style="margin:0 0 16px;color:#F0F4FF;font-size:24px;font-weight:700;">Application Update</h2>
      <p style="color:#8892A4;">We could not approve <strong style="color:#F0F4FF;">${user.organizerProfile?.organizationName || 'your organization'}</strong> at this time.</p>
      ${reason ? `<div style="background:#1a1025;border:1px solid rgba(255,85,85,0.2);border-radius:10px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#FF5555;font-size:13px;font-weight:600;">Reason:</p>
        <p style="margin:8px 0 0;color:#8892A4;">${reason}</p>
      </div>` : ''}
      <p style="color:#8892A4;">Contact <a href="mailto:support@ticktify.pk" style="color:#CBFF47;">support@ticktify.pk</a> for help.</p>
    `),
    text: `Your organizer application was not approved. Reason: ${reason || 'Not specified'}.`,
  });
};

const sendListingApproved = async (user, opportunity) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/opportunities/${opportunity.slug || opportunity._id}`;
  return send({
    to: user.email, subject: `✅ "${opportunity.title}" is now live on Ticktify`,
    html: htmlWrapper(`
      <h2 style="margin:0 0 16px;color:#CBFF47;font-size:22px;font-weight:700;">Your listing is live! 🚀</h2>
      <p style="color:#8892A4;"><strong style="color:#F0F4FF;">"${opportunity.title}"</strong> is now visible to students across Pakistan.</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;background:#CBFF47;color:#08090F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
          View Listing →
        </a>
      </p>
    `),
    text: `Your listing "${opportunity.title}" is now live: ${link}`,
  });
};

const sendListingRejected = async (user, opportunity, reason) => {
  return send({
    to: user.email, subject: `Ticktify — "${opportunity.title}" listing update`,
    html: htmlWrapper(`
      <h2 style="margin:0 0 16px;color:#F0F4FF;font-size:22px;font-weight:700;">Listing Not Approved</h2>
      <p style="color:#8892A4;">Your listing <strong style="color:#F0F4FF;">"${opportunity.title}"</strong> could not be approved.</p>
      ${reason ? `<div style="background:#1a1025;border:1px solid rgba(255,85,85,0.2);border-radius:10px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#FF5555;font-size:13px;font-weight:600;">Reason:</p>
        <p style="margin:8px 0 0;color:#8892A4;">${reason}</p>
      </div>` : ''}
      <p style="color:#8892A4;">Please edit and resubmit. Contact <a href="mailto:support@ticktify.pk" style="color:#CBFF47;">support@ticktify.pk</a> if needed.</p>
    `),
    text: `Your listing "${opportunity.title}" was not approved. Reason: ${reason || 'Not specified'}`,
  });
};

const sendDeadlineReminder = async (user, opportunity) => {
  const daysLeft = Math.ceil((new Date(opportunity.deadline) - Date.now()) / (1000 * 60 * 60 * 24));
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/opportunities/${opportunity.slug || opportunity._id}`;
  return send({
    to: user.email, subject: `⏰ Deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}: ${opportunity.title}`,
    html: htmlWrapper(`
      <h2 style="margin:0 0 8px;color:#F0F4FF;font-size:22px;font-weight:700;">⏰ Deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</h2>
      <p style="color:#CBFF47;font-weight:700;margin:0 0 16px;">${opportunity.title}</p>
      <p style="color:#8892A4;">You bookmarked this — don't miss the deadline!</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;background:#CBFF47;color:#08090F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
          Apply Now →
        </a>
      </p>
    `),
    text: `Reminder: "${opportunity.title}" deadline is in ${daysLeft} days. Apply at ${link}`,
  });
};

const sendPasswordChanged = async (user) => {
  return send({
    to: user.email, subject: '🔒 Your Ticktify password was changed',
    html: htmlWrapper(`
      <h2 style="margin:0 0 16px;color:#F0F4FF;font-size:22px;font-weight:700;">🔒 Password Changed</h2>
      <p style="color:#8892A4;">Your Ticktify password was recently changed. If you made this change, no action needed.</p>
      <div style="background:#1a1025;border:1px solid rgba(255,85,85,0.2);border-radius:10px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#FF5555;font-size:13px;">
          ⚠️ If you did NOT make this change, contact
          <a href="mailto:support@ticktify.pk" style="color:#CBFF47;">support@ticktify.pk</a> immediately.
        </p>
      </div>
      <p style="color:#4A5568;font-size:13px;">Time: ${new Date().toUTCString()}</p>
    `),
    text: `Your Ticktify password was changed. If this wasn't you, contact support@ticktify.pk immediately.`,
  });
};

module.exports = {
  send,
  sendWelcome,
  sendOrganizerApproved,
  sendOrganizerRejected,
  sendListingApproved,
  sendListingRejected,
  sendDeadlineReminder,
  sendPasswordChanged,
};