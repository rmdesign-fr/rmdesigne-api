const nodemailer = require('nodemailer');
const dns = require('dns');

const env = require('../config/env');
const logger = require('../utils/logger');

dns.setDefaultResultOrder('ipv4first');

let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  const smtpPass = env.SMTP_PASS.replace(/\s+/g, '');
  const port = Number(env.SMTP_PORT);

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,

    secure: port === 465,
    requireTLS: port === 587,

    family: 4,

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    auth: {
      user: env.SMTP_USER,
      pass: smtpPass,
    },

    tls: {
      rejectUnauthorized: true,
    },

    logger: true,
    debug: true,
  });

  transporter.verify().then(
    () => {
      logger.info(
        {
          host: env.SMTP_HOST,
          port,
          user: env.SMTP_USER,
        },
        'SMTP ready'
      );
    },
    (err) => {
      logger.error(
        {
          message: err.message,
          code: err.code,
          stack: err.stack,
        },
        'SMTP verification failed'
      );
    }
  );
} else {
  logger.warn(
    'SMTP credentials missing — emails will be skipped'
  );
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    logger.info(
      { to, subject },
      '[DEV] Email skipped (no SMTP config)'
    );
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `R.M Design <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(
      {
        messageId: info.messageId,
        to,
      },
      'Email sent'
    );

    return info;
  } catch (error) {
    logger.error(
      {
        error: error.message,
        code: error.code,
        stack: error.stack,
        to,
        subject,
      },
      'Failed to send email'
    );

    return null;
  }
}

async function sendBookingConfirmation(booking) {
  return sendEmail({
    to: booking.email,
    subject:
      'Confirmation de votre rendez-vous — R.M Design',
    html: `
      <h2>Merci ${booking.name} !</h2>

      <p>Votre rendez-vous a été enregistré :</p>

      <ul>
        <li><strong>Date :</strong>
          ${new Date(
            booking.date
          ).toLocaleDateString('fr-FR')}
        </li>

        <li><strong>Heure :</strong>
          ${booking.time}
        </li>

        <li><strong>Service :</strong>
          ${booking.service}
        </li>
      </ul>

      <p>
        Nous vous contacterons pour confirmer.
      </p>

      <p>— L'équipe R.M Design</p>
    `,
  });
}

async function sendBookingNotificationToAdmin(
  booking
) {
  return sendEmail({
    to: env.BUSINESS_EMAIL,

    subject: `Nouveau RDV de ${booking.name}`,

    html: `
      <h2>Nouveau rendez-vous</h2>

      <ul>
        <li>
          <strong>Client :</strong>
          ${booking.name}
          (${booking.email})
        </li>

        <li>
          <strong>Date :</strong>
          ${new Date(
            booking.date
          ).toLocaleDateString('fr-FR')}
        </li>

        <li>
          <strong>Heure :</strong>
          ${booking.time}
        </li>

        <li>
          <strong>Service :</strong>
          ${booking.service}
        </li>

        <li>
          <strong>Description :</strong>
          ${
            booking.description || '—'
          }
        </li>
      </ul>
    `,
  });
}

async function sendContactNotification(
  contact
) {
  return sendEmail({
    to: env.BUSINESS_EMAIL,

    subject: `Nouveau message de ${contact.name}`,

    html: `
      <h2>Message de contact</h2>

      <ul>
        <li>
          <strong>Nom :</strong>
          ${contact.name}
        </li>

        <li>
          <strong>Email :</strong>
          ${
            contact.email || '—'
          }
        </li>

        <li>
          <strong>Téléphone :</strong>
          ${
            contact.phone || '—'
          }
        </li>
      </ul>

      <p>${contact.message}</p>
    `,
  });
}

async function sendOrderConfirmation(order) {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<li>${i.name} x${i.qty} — ${Number(
          i.price
        ).toFixed(2)} €</li>`
    )
    .join('');

  return sendEmail({
    to: order.customerEmail,

    subject:
      'Confirmation de commande — R.M Design',

    html: `
      <h2>
        Merci ${order.customerName} !
      </h2>

      <p>
        Votre commande a été enregistrée.
      </p>

      <ul>${itemsHtml}</ul>

      <p>
        <strong>
          Total :
          ${Number(
            order.total
          ).toFixed(2)} €
        </strong>
      </p>

      <p>— L'équipe R.M Design</p>
    `,
  });
}

async function sendBookingStatusUpdate(
  booking
) {
  const statusLabels = {
    confirmed: 'confirmé',
    cancelled: 'annulé',
  };

  const label =
    statusLabels[booking.status] ||
    booking.status;

  return sendEmail({
    to: booking.email,

    subject: `Votre rendez-vous a été ${label} — R.M Design`,

    html: `
      <h2>
        Bonjour ${booking.name},
      </h2>

      <p>
        Votre rendez-vous du
        <strong>
          ${new Date(
            booking.date
          ).toLocaleDateString('fr-FR')}
        </strong>

        à

        <strong>
          ${booking.time}
        </strong>

        a été

        <strong>
          ${label}
        </strong>.
      </p>

      ${
        booking.status === 'confirmed'
          ? '<p>Nous vous attendons !</p>'
          : '<p>N’hésitez pas à reprendre rendez-vous.</p>'
      }

      <p>— L'équipe R.M Design</p>
    `,
  });
}

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingNotificationToAdmin,
  sendContactNotification,
  sendOrderConfirmation,
  sendBookingStatusUpdate,
};
