import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {

  try {
    // Check environment variables
    console.log("Checking environment variables...")
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Missing")
    console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "Set" : "Missing")

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message: "Email credentials not configured.",
          source: "Contact Form Email Test",
        },
        { status: 500 },
      )
    }

    console.log("Creating email transporter...")
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    await transporter.verify()
    console.log("SMTP connection verified!")

    const result = await transporter.sendMail({
      from: `"SST Alumni System Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Contact Form Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Contact Form Email Test</h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px;">
            <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN")}</p>
            <p><strong>Email User:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Purpose:</strong> This tests the email delivery for contact form submissions</p>
          </div>
        </div>
      `,
    })

    console.log("Test email sent successfully!")
    console.log("Message ID:", result.messageId)

    return NextResponse.json({
      success: true,
      message: "Contact form email test successful!",
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
      source: "Contact Form Email Test",
      emailUser: process.env.EMAIL_USER,
    })
  } catch (error) {
    console.error("Contact form email test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message,
        source: "Contact Form Email Test",
        error: error,
      },
      { status: 500 },
    )
  }
}
