const nodemailer = require("nodemailer");
require("dotenv").config();

//create function to send email

const sendAccVerificationEmail = async (to, resetToken) => {
  try {
    //create transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    //create message
    const message = {
      to,
      subject: "Account Verification",
      html: `
        <p>You are receiving this test email because you (or someone else) have requested to verify your account.<p/>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p>http://localhost:3001/verify-email/${resetToken}<p/>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
    };
    // send the email
    const info = await transporter.sendMail(message);
    console.log("Email sent", info.messageId);
  } catch (error) {
    console.log(error);
    throw new Error("Email sending failed");
  }
};

module.exports = sendAccVerificationEmail;
