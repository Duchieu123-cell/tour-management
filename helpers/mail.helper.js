const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

const buildMailOptions = (email, subject, content) => ({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: content
  });

// Keep the callback behavior used by the existing admin mail flow.
module.exports.sendMail = (email, subject, content) => {
  createTransporter().sendMail(buildMailOptions(email, subject, content), (error, info) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
};

// Promise-based mail sending for customer flows that need to report delivery errors.
module.exports.sendMailAsync = (email, subject, content) => {
  return createTransporter().sendMail(buildMailOptions(email, subject, content));
};
