require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Patient = require("./models/Patient");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hospital Management System API is running!");
});

// API 1: Register a new patient
app.post("/api/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();

    res.status(201).json({
      message: "Patient registered successfully",
      patient: savedPatient
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Patient ID already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to register patient"
    });
  }
});

// API 2: View all patients
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await Patient.find().sort({
      createdAt: -1
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patients"
    });
  }
});


 // API 3: Search patients by patient ID or name
app.get("/api/patients/search", async (req, res) => {
  try {
    const q = req.query.q;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Please enter a patient ID or name"
      });
    }

    const patients = await Patient.find({
      $or: [
        { patientId: { $regex: q.trim(), $options: "i" } },
        { name: { $regex: q.trim(), $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Failed to search patients"
    });
  }
});

// API 4: Update patient details
app.put("/api/patients/:id", async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "age",
      "gender",
      "contactNumber",
      "disease",
      "diagnosis",
      "treatment"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.status(200).json({
      message: "Patient updated successfully",
      patient
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to update patient"
    });
  }
});

// API 5: Delete a patient
app.delete("/api/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.status(200).json({
      message: "Patient deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete patient"
    });
  }
});

// API 6: Discharge a patient
app.patch("/api/patients/:id/discharge", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    if (patient.status === "Discharged") {
      return res.status(400).json({
        message: "Patient is already discharged"
      });
    }

    patient.status = "Discharged";
    patient.dischargeDate = new Date();

    await patient.save();

    res.status(200).json({
      message: "Patient discharged successfully",
      patient
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to discharge patient"
    });
  }
});


// Start the server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });