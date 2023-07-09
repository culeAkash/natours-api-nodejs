const nodemailer = require('nodemailer');

// Gmail spam emails quickly hence, it is suitable for small apps only, Now we are using mail trap for testing, later we will implement better mail service

module.exports = sendEmail = async (options) => {
  // TODO Step 1) Create a transporter
  // ? Transporter => service used to send emails.  Ex : gmail
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // Activate in gmail "less secure app" option
  })

  // TODO Step 2) Define the email options
  const mailOptions = {
    from: 'Akash Jaiswal <akashjais929@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  //TODO Step 3) Actually send the email with nodemailer
  await transporter.sendMail(mailOptions);

}