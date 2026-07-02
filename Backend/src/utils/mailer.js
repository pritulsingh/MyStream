import axios from "axios";

export const sendEmail = async (to, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "MyStream",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject: "Your OTP Code",
        htmlContent: `
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error(
      "❌ Email send failed:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send verification email");
  }
};