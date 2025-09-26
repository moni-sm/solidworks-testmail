require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// MongoDB Schema
const registrationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  organization: String,
  designation: String,
  timestamp: { type: Date, default: Date.now }
});
const Registration = mongoose.model("Registration", registrationSchema);

// Excel file path
const excelFilePath = path.join(__dirname, "registrations.xlsx");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Registration endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { name, phone, email, organization, designation } = req.body;
    if (!name || !phone || !email || !organization || !designation) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to MongoDB
    const newRegistration = new Registration({ name, phone, email, organization, designation });
    await newRegistration.save();

    // Send email notification
    const mailOptions = {
      from: `"SOLIDWORKS Event" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "SOLIDWORKS Event Registration",
      html: `
        <h3>New Registration</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Organization:</b> ${organization}</p>
        <p><b>Designation:</b> ${designation}</p>
        <p><b>Time:</b> ${new Date().toLocaleString()}</p>
      `
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to download Excel (fetch all data from MongoDB)
app.get("/api/download-excel", async (req, res) => {
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
      { header: "Timestamp", key: "timestamp", width: 25 },
    ];

    registrations.forEach(reg => {
      sheet.addRow({
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        organization: reg.organization,
        designation: reg.designation,
        timestamp: reg.timestamp.toLocaleString()
      });
    });

    const tempFilePath = path.join(__dirname, "registrations.xlsx");
    await workbook.xlsx.writeFile(tempFilePath);

    res.download(tempFilePath, "registrations.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file." });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
