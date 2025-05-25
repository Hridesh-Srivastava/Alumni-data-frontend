import nodemailer from "nodemailer"

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// Send OTP email
export const sendOTPEmail = async (email: string, name: string, otp: string) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"SST Alumni System" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification - SST Alumni System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Email Verification</h1>
            <p style="color: #666; font-size: 16px;">SST Alumni Data Collection System</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Thank you for registering with the SST Alumni Data Collection System. 
              To complete your registration, please verify your email address using the code below:
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #007bff; color: white; padding: 15px 30px; border-radius: 6px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Important:</strong> This verification code will expire in 10 minutes. 
              If you didn't request this verification, please ignore this email.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email from SST Alumni Data Collection System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error("Failed to send verification email")
  }
}
