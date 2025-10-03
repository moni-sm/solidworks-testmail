require("dotenv").config();
const Registration = require("../models/Registration");
const ExcelJS = require("exceljs");
const path = require("path");
const nodemailer = require("nodemailer");

// 📩 Setup Nodemailer transporter (Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // your gmail
    pass: process.env.GMAIL_PASS, // app password
  },
});

// 📌 Register User endpoint WITH sending emails
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
      to: process.env.ADMIN_EMAIL, // admin email from .env
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

    // Send both mails
    await transporter.sendMail(userMail);
    await transporter.sendMail(adminMail);

    res.status(200).json({ message: "✅ Registration successful. Emails sent." });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 📌 Download Excel endpoint (unchanged)
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
