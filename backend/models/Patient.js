
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true,
      min: 0
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"]
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true
    },

    disease: {
      type: String,
      required: true,
      trim: true
    },

    diagnosis: {
      type: String,
      default: ""
    },

    treatment: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Admitted", "Discharged"],
      default: "Admitted"
    },

    admissionDate: {
      type: Date,
      default: Date.now
    },

    dischargeDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
