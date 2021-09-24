const nodemailer = require('nodemailer');

const sendEmails = async (options) => {
    // create reusable smtp transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    // send email with defined transport:
    let info = await transporter.sendMail({
        from:`${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    });

    console.log('Message sent: %s', info.messageId);
}

module.exports = sendEmails;