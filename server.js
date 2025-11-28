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
  icon: { type: String }, 
  title: String,
  titleAr: String,

  // CHANGE HERE 👇
  treatments: [
    {
      name: { type: String, required: true },
      cost: { type: String, required: true }
    }
  ],

  treatmentsAr: [String]
});




const TreatmentCategory = mongoose.model(
  "TreatmentCategory",
  TreatmentCategorySchema
);


const DoctorSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  hospital: { type: String, required: true },
  experience: { type: String },
  image: { type: String },
  isTopDoctor: { type: Boolean, default: false },
  position: { type: String },
  degree: { type: String },
  about: { type: String },

  medicalProblems: [{ type: String }],

  procedures: [{ type: String }],

  faqs: [
    {
      question: { type: String },
      answer: { type: String }
    }
  ]
});
const Doctor = mongoose.model("doctors", DoctorSchema);
// ----------------------
//  HOSPITAL MODEL
// ----------------------
const HospitalSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: String,
  image: String,
  location: String,
  rating: Number,
  beds: Number,
  specialties: [String],
  description: String,
  accreditations: [String],
  latitude: Number,
  longitude: Number,
});

const Hospital = mongoose.model(
  "hospitals",
  HospitalSchema
);
// ----------------------
//  GET HOSPITALS
// ----------------------
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET single doctor by slug
app.get('/api/doctors/:slug', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ slug: req.params.slug });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/admin/seed-doctor', async (req, res) => {
 const doctors =[];



  try {
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    res.json({ message: "doctor data  seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Seeder error" });
  }
});

// ----------------------
//  SEED TREATMENTS (RUN ONCE)
// ----------------------
app.get('/admin/seed-hospital', async (req, res) => {
  const hospitalData = [
  {
    "slug": "medanta-the-medicity-gurgaon",
    "name": "Medanta - The Medicity",
    "normalizedName": "medanta medicity",
    "image": "/uploads/medanta.jpg",
    "location": "Gurgaon",
    "normalizedLocation": "gurgaon",
    "rating": 4.8,
    "beds": 1391,
    "specialties": [
      "Cardiology",
      "Cardiothoracic Surgery",
      "Liver Transplant",
      "Orthopedics",
      "Nephrology",
      "Gastroenterology",
      "Pulmonology",
      "Oncology",
      "Bone Marrow Transplant",
      "Emergency Medicine"
    ],
    "accreditations": ["JCI", "NABH", "NABL"],
    "description": "Medanta – The Medicity, founded by Dr. Naresh Trehan...",
    "latitude": 28.4595,
    "longitude": 77.0266
  },
  {
    "slug": "fortis-memorial-research-institute-gurgaon",
    "name": "Fortis Memorial Research Institute (FMRI)",
    "normalizedName": "fortis memorial research",
    "image": "/uploads/fmri.jpg",
    "location": "Gurgaon",
    "normalizedLocation": "gurgaon",
    "rating": 4.9,
    "beds": 310,
    "specialties": [
      "Neurosurgery",
      "Cancer Treatment",
      "Bone Marrow Transplant",
      "Cardiology",
      "Orthopedics",
      "Gastroenterology",
      "Critical Care"
    ],
    "accreditations": ["JCI", "NABH", "NABL", "CEA"],
    "description": "FMRI is a world-class quaternary care hospital...",
    "latitude": 28.5041,
    "longitude": 77.0917
  },
  {
    "slug": "artemis-hospital-gurgaon",
    "name": "Artemis Hospital",
    "normalizedName": "artemis",
    "image": "/uploads/artemis.jpg",
    "location": "Gurgaon",
    "normalizedLocation": "gurgaon",
    "rating": 4.6,
    "beds": 600,
    "specialties": [
      "Bone Marrow Transplant",
      "Oncology",
      "Neurology",
      "Orthopedics",
      "Cardiology",
      "Emergency Care"
    ],
    "accreditations": ["JCI", "NABH"],
    "description": "Artemis Hospital is Gurgaon’s first JCI...",
    "latitude": 28.4513,
    "longitude": 77.0722
  },
  {
    "slug": "max-super-speciality-hospital-saket",
    "name": "Max Super Speciality Hospital, Saket",
    "normalizedName": "max saket",
    "image": "/uploads/max-saket.jpg",
    "location": "New Delhi",
    "normalizedLocation": "new delhi",
    "rating": 4.7,
    "beds": 104,
    "specialties": [
      "Cardiology",
      "Oncology",
      "Bariatric Surgery",
      "IVF",
      "Neurosurgery",
      "Orthopedics"
    ],
    "accreditations": ["NABH", "NABL", "AACI"],
    "description": "Max Saket is a leading multi-speciality hospital...",
    "latitude": 28.5273,
    "longitude": 77.2192
  },
  {
    "slug": "max-super-speciality-hospital-patparganj",
    "name": "Max Super Speciality Hospital, Patparganj",
    "normalizedName": "max patparganj",
    "image": "/uploads/max-patparganj.jpg",
    "location": "New Delhi",
    "normalizedLocation": "new delhi",
    "rating": 4.6,
    "beds": 400,
    "specialties": [
      "Neurology",
      "Cancer Care",
      "Cardiology",
      "Orthopedics",
      "Emergency Medicine"
    ],
    "accreditations": ["NABH", "NABL", "AACI"],
    "description": "Max Patparganj is an advanced tertiary care facility...",
    "latitude": 28.6426,
    "longitude": 77.3151
  },
  {
    "slug": "amrita-hospital-faridabad",
    "name": "Amrita Hospital, Faridabad",
    "normalizedName": "amrita faridabad",
    "image": "/uploads/amrita.jpg",
    "location": "Faridabad",
    "normalizedLocation": "faridabad",
    "rating": 4.9,
    "beds": 1600,
    "specialties": [
      "Cardiac Sciences",
      "Neurosciences",
      "Radiation Oncology",
      "Gastro Sciences",
      "Transplants",
      "Mother & Child Care"
    ],
    "accreditations": ["NABH", "JCI (Applied)"],
    "description": "Amrita Hospital Faridabad is one of India’s largest...",
    "latitude": 28.3670,
    "longitude": 77.3170
  },
  {
    "slug": "metro-hospital-faridabad",
    "name": "Metro Hospital, Faridabad",
    "normalizedName": "metro faridabad",
    "image": "/uploads/metro.jpg",
    "location": "Faridabad",
    "normalizedLocation": "faridabad",
    "rating": 4.2,
    "beds": 307,
    "specialties": [
      "Cardiology",
      "Cardiac Surgery",
      "Orthopedics",
      "Nephrology",
      "Oncology"
    ],
    "accreditations": ["NABH", "NABL"],
    "description": "Metro Hospital Faridabad is a major center for cardiac excellence...",
    "latitude": 28.4089,
    "longitude": 77.3160
  },
  {
    "slug": "paras-health-gurgaon",
    "name": "Paras Health, Gurgaon",
    "normalizedName": "paras health gurgaon",
    "image": "/uploads/paras.jpg",
    "location": "Gurgaon",
    "normalizedLocation": "gurgaon",
    "rating": 4.5,
    "beds": 300,
    "specialties": [
      "Neurosurgery",
      "Neurology",
      "Cardiology",
      "Orthopedics",
      "Cancer Care"
    ],
    "accreditations": ["NABH", "NABL"],
    "description": "Paras Hospital Gurgaon is known for neurology...",
    "latitude": 28.4514,
    "longitude": 77.0340
  },
  {
    "slug": "asian-hospital-faridabad",
    "name": "Asian Hospital, Faridabad",
    "normalizedName": "asian faridabad",
    "image": "/uploads/asian.jpg",
    "location": "Faridabad",
    "normalizedLocation": "faridabad",
    "rating": 4.7,
    "beds": 425,
    "specialties": [
      "Cancer Care",
      "Bone Marrow Transplant",
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Urology",
      "Mother & Child Care"
    ],
    "accreditations": ["NABH", "NABL", "AACI"],
    "description": "Asian Institute of Medical Sciences...",
    "latitude": 28.4085,
    "longitude": 77.3170
  },
  {
    "slug": "manipal-hospital-faridabad",
    "name": "Manipal Hospital, Faridabad",
    "normalizedName": "manipal faridabad",
    "image": "/uploads/manipal.jpg",
    "location": "Faridabad",
    "normalizedLocation": "faridabad",
    "rating": 4.8,
    "beds": 380,
    "specialties": [
      "Gastroenterology",
      "Cardiology",
      "Critical Care",
      "Orthopedics",
      "Oncology"
    ],
    "accreditations": ["NABH", "NABL"],
    "description": "Manipal Hospital Faridabad offers world-class care...",
    "latitude": 28.3675,
    "longitude": 77.3240
  }
]

;

  try {
    await Hospital.deleteMany({});
    await Hospital.insertMany(hospitalData);
    res.json({ message: "hospital data  seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Seeder error" });
  }
});

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
