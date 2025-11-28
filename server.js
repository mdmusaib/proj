// ----------------------
//  IMPORTS
// ----------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ----------------------
//  INITIALIZE APP
// ----------------------
const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
//  MONGODB CONNECTION
// ----------------------
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_local';

mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// ----------------------
//  MONGOOSE MODEL
// ----------------------
const TreatmentCategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  icon: { type: String }, // store icon name (React icons mapped on frontend)
  title: String,
  titleAr: String,
  treatments: [String],
  treatmentsAr: [String]
});

const TreatmentCategory = mongoose.model(
  "TreatmentCategory",
  TreatmentCategorySchema
);

// ----------------------
//  GET API
// ----------------------
app.get('/api/treatments', async (req, res) => {
  try {
    const categories = await TreatmentCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
//  SEEDER API (RUN ONCE)
// ----------------------
app.post('/admin/seed-treatments', async (req, res) => {
  const treatmentCategories = [
  {
    slug: "general-internal-medicine",
    title: "General & Internal Medicine",
    treatments: [
      "Outpatient Consultation / Routine Check-up",
      "Preventive / Lifestyle Medicine Package",
      "Infectious Disease Treatment"
    ]
  },
  {
    slug: "organ-based-systemic-specialties",
    title: "Organ-Based & Systemic Specialties",
    treatments: [
      "Cardiology",
      "Angiography",
      "Angioplasty / Stent",
      "CABG (Bypass Surgery)",
      "Valve Replacement",
      "Pacemaker Implant",
      "Cardiothoracic / Thoracic Surgery",
      "Pulmonology / Respiratory",
      "Gastroenterology / Hepatology",
      "Nephrology / Urology",
      "Neurology / Neurosurgery",
      "Endocrinology",
      "Rheumatology",
      "Vascular Surgery"
    ]
  },
  {
    slug: "musculoskeletal-structural-care",
    title: "Musculoskeletal & Structural Care",
    treatments: [
      "Total Knee Replacement (single)",
      "Bilateral Knee Replacement",
      "Hip Replacement",
      "Spine Surgery (structural)",
      "Arthroscopy (joint keyhole)",
      "Sports Injury Treatment",
      "Physiotherapy / Rehab Session"
    ]
  },
  {
    slug: "skin-senses-appearance",
    title: "Skin, Senses & Appearance",
    treatments: [
      "Dermatology / Laser Procedures",
      "Plastic / Reconstructive Surgery",
      "Cosmetic / Aesthetic Surgery",
      "Cataract Surgery",
      "LASIK (both eyes)",
      "ENT (Ear, Nose, Throat) Procedures",
      "Cochlear Implant",
      "Dental Implants (per tooth)"
    ]
  },
  {
    slug: "womens-health-maternity",
    title: "Women’s Health & Maternity",
    treatments: [
      "Normal (Vaginal) Delivery",
      "Cesarean Section (C-Section)",
      "IVF (per cycle)",
      "ICSI (advanced IVF)",
      "Hysterectomy",
      "Myomectomy / Fibroid Removal"
    ]
  },
  {
    slug: "child-health-pediatrics",
    title: "Child Health & Pediatrics",
    treatments: [
      "Pediatric Consultation / Tests",
      "Neonatal ICU (NICU) – per day",
      "Pediatric Surgery",
      "Pediatric Cardiac Surgery (Congenital Heart Disease)",
      "Cleft Lip / Palate Repair"
    ]
  },
  {
    slug: "cancer-blood-disorders",
    title: "Cancer & Blood Disorders",
    treatments: [
      "Chemotherapy (per cycle)",
      "Radiation Therapy",
      "Major Cancer Surgery",
      "Immunotherapy (per cycle)",
      "Bone Marrow Transplant",
      "Palliative Care"
    ]
  },
  {
    slug: "organ-transplant-advanced-surgery",
    title: "Organ Transplant & Advanced Surgery",
    treatments: [
      "Kidney Transplant",
      "Liver Transplant",
      "Heart Transplant",
      "Multi-Organ Transplant"
    ]
  },
  {
    slug: "emergency-critical-care",
    title: "Emergency & Critical Care",
    treatments: [
      "ICU (Intensive Care) – per day",
      "Trauma / Accident Care (initial / package)",
      "Pain Management / Anesthesia Packages"
    ]
  },
  {
    slug: "mental-health-behavioral-sciences",
    title: "Mental Health & Behavioral Sciences",
    treatments: [
      "Psychiatry / Counseling Session",
      "Addiction Rehab (per month)"
    ]
  },
  {
    slug: "diagnostics-allied-services",
    title: "Diagnostics & Allied Services",
    treatments: [
      "MRI Scan",
      "CT Scan",
      "PET-CT Scan",
      "Full Body / Executive Check-up",
      "Genetic Testing / Analysis"
    ]
  },
  {
    slug: "immunology-specialized-medicine",
    title: "Immunology & Specialized Medicine",
    treatments: [
      "Allergy / Immunology Treatment",
      "Sleep Medicine (Sleep Apnea Therapy)",
      "Chronic Pain Management",
      "Rehabilitation Medicine"
    ]
  },
  {
    slug: "cosmetic-plastic-reconstructive",
    title: "Cosmetic, Plastic & Reconstructive Surgery",
    treatments: [
      "Rhinoplasty",
      "Liposuction",
      "Tummy Tuck",
      "Breast Augmentation",
      "Hair Transplant (2,000–3,000 grafts)"
    ]
  },
  {
    slug: "preventive-health-checkups",
    title: "Preventive Health & Check-ups",
    treatments: [
      "Executive / Full Body Check-up",
      "Preventive Medicine Program (annual)"
    ]
  },
  {
    slug: "allied-therapeutic-supportive-care",
    title: "Allied Therapeutic & Supportive Care",
    treatments: [
      "Physiotherapy Session",
      "Occupational Therapy / Rehab",
      "Nutritional Counselling / Dietetics Package",
      "Home Healthcare / Nursing Services"
    ]
  }
];

  try {
    await TreatmentCategory.deleteMany({});
    await TreatmentCategory.insertMany(treatmentCategories);
    res.json({ message: "Treatment categories seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Seeder error" });
  }
});

// ----------------------
//  START SERVER
// ----------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
