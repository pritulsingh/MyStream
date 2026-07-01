import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for port 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text
        })
    } catch (error) {
        console.error("Email send failed:", error)
        throw new Error("Failed to send verification email")
    }
}