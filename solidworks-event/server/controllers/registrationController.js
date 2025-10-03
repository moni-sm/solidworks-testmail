require("dotenv").config();
const Registration = require("../models/Registration");
const ExcelJS = require("exceljs");
const path = require("path");
const nodemailer = require("nodemailer");

// 📩 Setup Nodemailer transporter (Gmail + App Password)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,               // TLS port works on Render
  secure: false,           // false for TLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Gmail App Password required for 2FA accounts
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
});

// 📌 Register User endpoint
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, email, organization, designation } = req.body;

    if (!name || !phone || !email || !organization || !designation) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to DB
    const newRegistration = new Registration({
      name,
      phone,
      email,
      organization,
      designation,
      timestamp: new Date(),
    });
    await newRegistration.save();

    // ✅ Email to Client (confirmation)
    const userMail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "✅ Registration Successful",
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for registering with us. Here are your details:</p>
        <ul>
          <li><b>Organization:</b> ${organization}</li>
          <li><b>Designation:</b> ${designation}</li>
          <li><b>Phone:</b> ${phone}</li>
          <li><b>Email:</b> ${email}</li>
        </ul>
        <p>We’ll get in touch with you soon.</p>
        <br/>
        <p>Best Regards,<br/>The Team</p>
      `,
    };

    // ✅ Email to Admin (notification)
    const adminMail = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Registration Received",
      html: `
        <h2>New Registration Details</h2>
        <ul>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Phone:</b> ${phone}</li>
          <li><b>Organization:</b> ${organization}</li>
          <li><b>Designation:</b> ${designation}</li>
          <li><b>Time:</b> ${new Date().toLocaleString()}</li>
        </ul>
      `,
    };

    // Send emails individually to avoid breaking endpoint
    try {
      await transporter.sendMail(userMail);
      console.log("✅ User confirmation email sent");
    } catch (err) {
      console.error("❌ User email error:", err);
    }

    try {
      await transporter.sendMail(adminMail);
      console.log("✅ Admin notification email sent");
    } catch (err) {
      console.error("❌ Admin email error:", err);
    }

    res.status(200).json({ message: "✅ Registration successful. Emails sent (if possible)." });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 📌 Download Excel endpoint
exports.downloadExcel = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ timestamp: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Organization", key: "organization", width: 25 },
      { header: "Designation", key: "designation", width: 25 },
      { header: "Registered On", key: "timestamp", width: 30 },
    ];

    registrations.forEach((reg) => {
      sheet.addRow({
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        organization: reg.organization,
        designation: reg.designation,
        timestamp: reg.timestamp.toLocaleString(),
      });
    });

    const filePath = path.join(__dirname, "../registrations.xlsx");
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, "registrations.xlsx", (err) => {
      if (err) {
        console.error("❌ File download error:", err);
        res.status(500).json({ message: "Error downloading file." });
      }
    });
  } catch (err) {
    console.error("❌ Excel Export Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
