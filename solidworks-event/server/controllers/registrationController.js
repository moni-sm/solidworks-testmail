require("dotenv").config();
const Registration = require("../models/Registration");
const ExcelJS = require("exceljs");
const path = require("path");
const nodemailer = require("nodemailer");

// 📩 Setup Nodemailer transporter (Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail", // use Gmail service
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail
    pass: process.env.GMAIL_PASS, // Gmail App Password (required for 2FA)
  },
});

// Optional: Verify SMTP connection on startup
transporter.verify((err, success) => {
  if (err) console.error("❌ SMTP Connection Error:", err);
  else console.log("✅ SMTP Server ready to send emails");
});

// 📌 Register User endpoint
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, email, organization, designation } = req.body;

    if (!name || !phone || !email || !organization || !designation) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save registration to DB
    const newRegistration = new Registration({
      name,
      phone,
      email,
      organization,
      designation,
      timestamp: new Date(),
    });
    await newRegistration.save();

    // ✅ Email to Client
    const userMail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "✅ Registration Successful",
      text: `Hello ${name},

Thank you for registering.

Organization: ${organization}
Designation: ${designation}
Phone: ${phone}
Email: ${email}

We’ll get in touch with you soon.

Best Regards,
The Team`,
    };

    // ✅ Email to Admin
    const adminMail = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Registration Received",
      text: `New Registration Details:

Name: ${name}
Email: ${email}
Phone: ${phone}
Organization: ${organization}
Designation: ${designation}
Time: ${new Date().toLocaleString()}`,
    };

    // Send emails (fire-and-forget style)
    transporter.sendMail(userMail, (err, info) => {
      if (err) console.error("❌ User email error:", err);
      else console.log("✅ User email sent:", info.response);
    });

    transporter.sendMail(adminMail, (err, info) => {
      if (err) console.error("❌ Admin email error:", err);
      else console.log("✅ Admin email sent:", info.response);
    });

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
