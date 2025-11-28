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
app.get('/admin/seed-treatments', async (req, res) => {
  const treatmentCategories = [
  {
    "slug": "general-internal-medicine",
    "title": "General & Internal Medicine",
    "treatments": [
      { "name": "Outpatient Consultation / Routine Check-up", "cost": "$300 – $800" },
      { "name": "Preventive / Lifestyle Medicine Package", "cost": "$300 – $800" },
      { "name": "Infectious Disease Treatment", "cost": "Varies (included in above range)" }
    ]
  },
  {
    "slug": "organ-based-systemic-specialties",
    "title": "Organ-Based & Systemic Specialties",
    "treatments": [
      { "name": "Cardiology", "cost": "Depends on procedure" },
      { "name": "Angiography", "cost": "$300 – $600" },
      { "name": "Angioplasty / Stent", "cost": "$2,500 – $4,000" },
      { "name": "CABG (Bypass Surgery)", "cost": "$4,500 – $7,000" },
      { "name": "Valve Replacement", "cost": "$6,000 – $9,000" },
      { "name": "Pacemaker Implant", "cost": "$3,000 – $4,500" },
      { "name": "Cardiothoracic / Thoracic Surgery", "cost": "Major surgery — varies" },
      { "name": "Pulmonology / Respiratory", "cost": "Lung surgery varies" },
      { "name": "Gastroenterology / Hepatology", "cost": "Procedure-specific" },
      { "name": "Nephrology / Urology", "cost": "Procedure-specific" },
      { "name": "Neurology / Neurosurgery", "cost": "Procedure-specific" },
      { "name": "Endocrinology", "cost": "Depends on case" },
      { "name": "Rheumatology", "cost": "Depends on condition" },
      { "name": "Vascular Surgery", "cost": "Varies — vascular repair/bypass" }
    ]
  },
  {
    "slug": "musculoskeletal-structural-care",
    "title": "Musculoskeletal & Structural Care",
    "treatments": [
      { "name": "Total Knee Replacement (single)", "cost": "$4,000 – $6,000" },
      { "name": "Bilateral Knee Replacement", "cost": "$7,000 – $9,000" },
      { "name": "Hip Replacement", "cost": "$5,000 – $8,000" },
      { "name": "Spine Surgery (structural)", "cost": "$6,000 – $9,000" },
      { "name": "Arthroscopy (joint keyhole)", "cost": "$2,000 – $3,500" },
      { "name": "Sports Injury Treatment", "cost": "$1,000 – $2,000" },
      { "name": "Physiotherapy / Rehab Session", "cost": "$30 – $50 per session" }
    ]
  },
  {
    "slug": "skin-senses-appearance",
    "title": "Skin, Senses & Appearance",
    "treatments": [
      { "name": "Dermatology / Laser Procedures", "cost": "$500 – $1,500" },
      { "name": "Plastic / Reconstructive Surgery", "cost": "$1,000 – $5,000" },
      { "name": "Cosmetic / Aesthetic Surgery", "cost": "Depends on procedure" },
      { "name": "Cataract Surgery", "cost": "$400 – $800 (per eye)" },
      { "name": "LASIK (both eyes)", "cost": "$800 – $1,200" },
      { "name": "ENT (Ear, Nose, Throat) Procedures", "cost": "$600 – $2,500" },
      { "name": "Cochlear Implant", "cost": "$14,000 – $18,000" },
      { "name": "Dental Implants (per tooth)", "cost": "$500 – $800" }
    ]
  },
  {
    "slug": "womens-health-maternity",
    "title": "Women’s Health & Maternity",
    "treatments": [
      { "name": "Normal (Vaginal) Delivery", "cost": "$800 – $1,200" },
      { "name": "Cesarean Section (C-Section)", "cost": "$1,500 – $2,500" },
      { "name": "IVF (per cycle)", "cost": "$3,000 – $4,500" },
      { "name": "ICSI (advanced IVF)", "cost": "$4,000 – $5,500" },
      { "name": "Hysterectomy", "cost": "$2,000 – $3,000" },
      { "name": "Myomectomy / Fibroid Removal", "cost": "$2,500 – $3,500" }
    ]
  },
  {
    "slug": "child-health-pediatrics",
    "title": "Child Health & Pediatrics",
    "treatments": [
      { "name": "Pediatric Consultation / Tests", "cost": "$300 – $800" },
      { "name": "Neonatal ICU (NICU) – per day", "cost": "$200 – $400" },
      { "name": "Pediatric Surgery", "cost": "$2,000 – $4,000" },
      { "name": "Pediatric Cardiac Surgery (Congenital Heart Disease)", "cost": "$6,000 – $9,000" },
      { "name": "Cleft Lip / Palate Repair", "cost": "$1,500 – $2,500" }
    ]
  },
  {
    "slug": "cancer-blood-disorders",
    "title": "Cancer & Blood Disorders",
    "treatments": [
      { "name": "Chemotherapy (per cycle)", "cost": "$400 – $800" },
      { "name": "Radiation Therapy", "cost": "$2,000 – $4,000" },
      { "name": "Major Cancer Surgery", "cost": "$3,000 – $7,000" },
      { "name": "Immunotherapy (per cycle)", "cost": "$2,500 – $6,000" },
      { "name": "Bone Marrow Transplant", "cost": "$22,000 – $35,000" },
      { "name": "Palliative Care", "cost": "Varies (duration-based)" }
    ]
  },
  {
    "slug": "organ-transplant-advanced-surgery",
    "title": "Organ Transplant & Advanced Surgery",
    "treatments": [
      { "name": "Kidney Transplant", "cost": "$12,000 – $18,000" },
      { "name": "Liver Transplant", "cost": "$32,000 – $45,000" },
      { "name": "Heart Transplant", "cost": "$45,000 – $65,000" },
      { "name": "Multi-Organ Transplant", "cost": "Varies (multiple organs)" }
    ]
  },
  {
    "slug": "emergency-critical-care",
    "title": "Emergency & Critical Care",
    "treatments": [
      { "name": "ICU (Intensive Care) – per day", "cost": "$100 – $300" },
      { "name": "Trauma / Accident Care (initial / package)", "cost": "$2,000 – $5,000" },
      { "name": "Pain Management / Anesthesia Packages", "cost": "$500 – $1,500" }
    ]
  },
  {
    "slug": "mental-health-behavioral-sciences",
    "title": "Mental Health & Behavioral Sciences",
    "treatments": [
      { "name": "Psychiatry / Counseling Session", "cost": "$400 – $1,200" },
      { "name": "Addiction Rehab (per month)", "cost": "$1,000 – $3,000" }
    ]
  },
  {
    "slug": "diagnostics-allied-services",
    "title": "Diagnostics & Allied Services",
    "treatments": [
      { "name": "MRI Scan", "cost": "$150 – $300" },
      { "name": "CT Scan", "cost": "$100 – $200" },
      { "name": "PET-CT Scan", "cost": "$400 – $600" },
      { "name": "Full Body / Executive Check-up", "cost": "$150 – $400" },
      { "name": "Genetic Testing / Analysis", "cost": "Varies (test-specific)" }
    ]
  },
  {
    "slug": "immunology-specialized-medicine",
    "title": "Immunology & Specialized Medicine",
    "treatments": [
      { "name": "Allergy / Immunology Treatment", "cost": "$400 – $1,000" },
      { "name": "Sleep Medicine (Sleep Apnea Therapy)", "cost": "$1,000 – $2,000" },
      { "name": "Chronic Pain Management", "cost": "$500 – $1,200" },
      { "name": "Rehabilitation Medicine", "cost": "Varies (long-term rehab)" }
    ]
  },
  {
    "slug": "cosmetic-plastic-reconstructive",
    "title": "Cosmetic, Plastic & Reconstructive Surgery",
    "treatments": [
      { "name": "Rhinoplasty", "cost": "$2,000 – $3,500" },
      { "name": "Liposuction", "cost": "$2,500 – $4,000" },
      { "name": "Tummy Tuck", "cost": "$3,000 – $5,000" },
      { "name": "Breast Augmentation", "cost": "$3,000 – $4,500" },
      { "name": "Hair Transplant (2,000–3,000 grafts)", "cost": "$1,200 – $2,000" }
    ]
  },
  {
    "slug": "preventive-health-checkups",
    "title": "Preventive Health & Check-ups",
    "treatments": [
      { "name": "Executive / Full Body Check-up", "cost": "$150 – $400" },
      { "name": "Preventive Medicine Program (annual)", "cost": "Customized" }
    ]
  },
  {
    "slug": "allied-therapeutic-supportive-care",
    "title": "Allied Therapeutic & Supportive Care",
    "treatments": [
      { "name": "Physiotherapy Session", "cost": "$30 – $50" },
      { "name": "Occupational Therapy / Rehab", "cost": "Similar to physiotherapy" },
      { "name": "Nutritional Counselling / Dietetics Package", "cost": "Depends on plan" },
      { "name": "Home Healthcare / Nursing Services", "cost": "Depends on care plan" }
    ]
  }
]


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
