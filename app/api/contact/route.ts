import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import * as XLSX from "xlsx"
import mongoose from "mongoose"

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Get or create Contact model
let Contact: any
try {
  Contact = mongoose.model("Contact")
} catch {
  Contact = mongoose.model("Contact", contactSchema)
}


async function connectDB() {
  if (mongoose.connections[0].readyState) {
    console.log("MongoDB already connected")
    return
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log("MongoDB connected successfully!")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}


async function sendEmails(contactData: any) {
  try {
   
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email credentials not configured.")
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

    
    console.log("Testing SMTP connection...")
    await transporter.verify()
    console.log("SMTP connection verified!")

    console.log("Generating Excel in memory...")
    const contacts = await Contact.find().sort({ createdAt: -1 })
    console.log(`Found ${contacts.length} contacts for Excel`)

    const excelData = contacts.map((contact: any, index: number) => ({
      "S.No": index + 1,
      Name: contact.name,
      Email: contact.email,
      Subject: contact.subject,
      Message: contact.message,
      Date: new Date(contact.createdAt).toLocaleDateString("en-IN"),
      Time: new Date(contact.createdAt).toLocaleTimeString("en-IN"),
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 }, // S.No
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 30 }, // Subject
      { wch: 50 }, // Message
      { wch: 12 }, // Date
      { wch: 12 }, // Time
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Responses")

    console.log("Creating Excel buffer in memory...")
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    })
    console.log("Excel buffer created successfully - NO FILES SAVED!")

    // Admin emails
   const adminEmails = [process.env.EMAIL_USER]

if (process.env.EMAIL_FROM && process.env.EMAIL_FROM !== process.env.EMAIL_USER) {
  adminEmails.push(process.env.EMAIL_FROM)
}

    console.log("Sending admin notification email with Excel buffer...")
    const adminResult = await transporter.sendMail({
      from: `"SST Alumni System" <${process.env.EMAIL_USER}>`,
      to: adminEmails.join(", "),
      subject: "New Contact Form Submission - SST Alumni System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 25px;">
            <h1 style="margin: 0; font-size: 32px;">New Contact!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">SST Alumni System</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 2px solid #eee;">
                <td style="padding: 15px 0; font-weight: bold; color: #555;">- Name:</td>
                <td style="padding: 15px 0; color: #333;">${contactData.name}</td>
              </tr>
              <tr style="border-bottom: 2px solid #eee;">
                <td style="padding: 15px 0; font-weight: bold; color: #555;">- Email:</td>
                <td style="padding: 15px 0; color: #333;">${contactData.email}</td>
              </tr>
              <tr style="border-bottom: 2px solid #eee;">
                <td style="padding: 15px 0; font-weight: bold; color: #555;">- Subject:</td>
                <td style="padding: 15px 0; color: #333;">${contactData.subject}</td>
              </tr>
              <tr style="border-bottom: 2px solid #eee;">
                <td style="padding: 15px 0; font-weight: bold; color: #555; vertical-align: top;">- Message:</td>
                <td style="padding: 15px 0; color: #333; line-height: 1.6;">${contactData.message}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0; font-weight: bold; color: #555;">- Time:</td>
                <td style="padding: 15px 0; color: #333;">${new Date(contactData.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-top: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1976d2;">Summary</h3>
            <p style="margin: 0; color: #1976d2; line-height: 1.8;">
              <strong>- Total Responses:</strong> ${contacts.length}<br>
              <strong>- Excel Attachment:</strong> Complete contact data (${contacts.length} records)<br>
              <strong>- Action Required:</strong> Please respond within 24-48 hours
            </p>
          </div>
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              • Excel file attached with all contact responses<br>
              • Secure and efficient delivery
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "SST_Alumni_Contact_Responses.xlsx",
          content: excelBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    })


    const thankYouResult = await transporter.sendMail({
      from: `"SST Alumni System" <${process.env.EMAIL_USER}>`,
      to: contactData.email,
      subject: "Thank You for Contacting SST Alumni System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 25px;">
            <h1 style="margin: 0; font-size: 32px;">Thank You!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">SST Alumni System</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${contactData.name}! </h2>
            <p style="color: #555; line-height: 1.8; font-size: 18px;">
              Thank you for contacting us through the SST Alumni System. We have received your message and truly appreciate you taking the time to reach out to us.
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #667eea; margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Your Message Summary</h3>
              <p style="margin: 0; color: #555; line-height: 1.6;">
                <strong>Subject:</strong> ${contactData.subject}<br>
                <strong>Submitted:</strong> ${new Date(contactData.createdAt).toLocaleString("en-IN")}<br>
                <strong>Reference ID:</strong> ${contactData._id}
              </p>
            </div>
          </div>
          
          <div style="background: #e8f5e8; border-left: 5px solid #4caf50; padding: 25px; border-radius: 10px; margin-top: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">What's Next?</h3>
            <p style="margin: 0; color: #2e7d32; line-height: 1.8;">
              <strong>• Response Time:</strong> We will get back to you within 24-48 working hours<br>
              <strong>• Direct Contact:</strong> For urgent matters, reach us at ${process.env.EMAIL_FROM}<br>
              <strong>• status:</strong> Your message has been successfully logged in our system
            </p>
          </div>
        </div>
      `,
    })

    console.log("Thank you email sent successfully!")
    console.log("Thank You Message ID:", thankYouResult.messageId)

    console.log("ALL EMAILS SENT SUCCESSFULLY - NO FILES SAVED!")
    return true
  } catch (error) {
    console.error("EMAIL SENDING FAILED:")
    console.error("Error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  console.log("Timestamp:", new Date().toISOString())

  try {
    // Connect to database
    await connectDB()

    // Parse request body
    const body = await request.json()
    const { name, email, subject, message } = body

    console.log("RECEIVED CONTACT FORM DATA:")
    console.log("Name:", name)
    console.log("Email:", email)
    console.log("Subject:", subject)
    console.log("Message:", message)

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log("VALIDATION FAILED - Missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required fields (name, email, subject, message)",
        },
        { status: 400 },
      )
    }

    console.log("VALIDATION PASSED")

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date(),
    }

    console.log("SAVING TO DATABASE...")
    const newContact = new Contact(contactData)
    const savedContact = await newContact.save()

    console.log("SUCCESSFULLY SAVED TO DATABASE")
    console.log("Saved Contact ID:", savedContact._id)

    try {
      await sendEmails(savedContact)
      console.log("EMAIL SENDING COMPLETED SUCCESSFULLY!")
    } catch (emailError) {
      console.error("EMAIL SENDING FAILED:")
      console.error("Email Error:", emailError)
    }

    const response = {
      success: true,
      message: "Contact message received and processed successfully",
      _id: savedContact._id,
      contactId: savedContact._id,
      timestamp: new Date().toISOString(),
      source: "Next.js API Route",
      processing: "In-Memory",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("CONTACT FORM PROCESSING ERROR:")
    console.error("Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + (error as Error).message,
        source: "Next.js API Route",
      },
      { status: 500 },
    )
  }
}
