import nodeMailer from "nodemailer";

const mailSender = async (email, title, body) => {
  try {
    if (!email || !title || !body) {
      throw new Error("Missing required email, title, or body parameters.");
    }

    const transporter = nodeMailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 2525, // Recommended port for secure TLS
      secure: false, // Use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: '"Project EDTECH" <no-reply@edtech.com>', // Set a valid sender address
      to: `${email}`,
      subject: "Test Mail",
      body:"this is a test mail",
    });

    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("There is an error in mailSender:", error.message);
    throw error;
  }
};

export default mailSender;
