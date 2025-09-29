const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const { registerUser, downloadExcel } = require("../controllers/registrationController");

// Register a new user
router.post("/register", registerUser);

// Get all registrations
router.get("/registrations", async (req, res) => {
  try {
    const regs = await Registration.find().sort({ timestamp: -1 });
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete selected registrations
router.post("/registrations/delete", async (req, res) => {
  const { ids } = req.body;
  try {
    await Registration.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Deleted selected registrations" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete all registrations
router.delete("/registrations/deleteAll", async (req, res) => {
  try {
    await Registration.deleteMany({});
    res.json({ message: "Deleted all registrations" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Download Excel
router.get("/download-excel", downloadExcel);

module.exports = router;
