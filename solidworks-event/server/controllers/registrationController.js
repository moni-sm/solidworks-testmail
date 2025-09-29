require("dotenv").config();
const Registration = require("../models/Registration");
const ExcelJS = require("exceljs");
const path = require("path");
const nodemailer = require("nodemailer");

// Nodemailer Transporter (recommended settings)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP Connection Error:", err);
  } else {
    console.log("✅ SMTP Ready to Send Emails");
  }
});

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, email, organization, designation } = req.body;

    if (!name || !phone || !email || !organization || !designation) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to MongoDB
    const newRegistration = new Registration({
      name,
      phone,
      email,
      organization,
      designation,
      timestamp: new Date(),
    });
    await newRegistration.save();

    // Admin Email
    const adminMail = {
      from: `"SOLIDWORKS Event" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New SOLIDWORKS Event Registration",
      html: `
        <h3>New Registration Received</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Organization:</b> ${organization}</p>
        <p><b>Designation:</b> ${designation}</p>
        <p><b>Registered On:</b> ${new Date().toLocaleString()}</p>
      `,
    };

    // Customer Email
    const customerMail = {
      from: `"SOLIDWORKS Event" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your SOLIDWORKS Event Registration Confirmation",
      html: `
        <h3>Thank you for registering!</h3>
        <p>We have received your details:</p>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Organization:</b> ${organization}</p>
        <p><b>Designation:</b> ${designation}</p>
        <p><b>Registered On:</b> ${new Date().toLocaleString()}</p>
        <br/>
        <p>We will contact you soon with more event details.</p>
      `,
    };

    // Send admin and customer emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(customerMail);

    res.status(200).json({ message: "Registration successful. Confirmation emails sent." });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Download Excel (unchanged except error log improvements)
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
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
