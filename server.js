// ----------------------
//  IMPORTS
// ----------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require("nodemailer");

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


const ContactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    country: String,
    language: String,
    treatment: String,
    message: String,
  },
  { timestamps: true }
);


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

  medicalProblems: [
    {
      title: String,
      description: String
    }
  ],

  procedures: [
    {
      title: String,
      description: String
    }
  ],

  faqs: [
    {
      question: String,
      answer: String
    }
  ]
});

const Doctor = mongoose.model("doctors", DoctorSchema);

const Contact = mongoose.model("contacts", ContactSchema);

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
// FILTER hospitals by name
app.get('/api/hospitals', async (req, res) => {
  try {
    const { name } = req.query;

    // If ?name exists → filter
    if (name) {
      const hospital = await Hospital.findOne({
        normalizedName: name
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .trim()
      });

      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      return res.json(hospital);
    }

    // Else return all hospitals
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
 const doctors =[
  {
    "slug": "dr-purshotam-lal",
    "name": "Dr. Purshotam Lal",
    "specialty": "Cardiology & CTVS",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "Introduced multiple first-in-India cardiac procedures",
    "image": "",
    "isTopDoctor": true,
    "position": "Chairman - Metro Group of Hospitals",
    "degree": "MD, AB (USA), FRCP (C), FACM, FICC, FACC, FSCAI (USA)",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-neeraj-jain",
    "name": "Dr. Neeraj Jain",
    "specialty": "Interventional Cardiology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "23+ years, 50,000+ treated patients",
    "image": "",
    "isTopDoctor": false,
    "position": "Medical Director",
    "degree": "MBBS, MD, DM, FACC",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-praveen-kumar-bansal",
    "name": "Dr. Praveen Kumar Bansal",
    "specialty": "Medical Oncology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "25+ years experience",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Oncology Services",
    "degree": "MBBS, MD, DM",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-sumant-gupta",
    "name": "Dr. Sumant Gupta",
    "specialty": "Medical Oncology, Hematology, BMT",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "Performed first BMT in Faridabad",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Metro Cancer Institute",
    "degree": "DM, MD, MBBS",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-vikash-kumar",
    "name": "Dr. Vikash Kumar",
    "specialty": "Radiation Oncology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "Former Associate Director at AIMS",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & Head - Radiation Oncology",
    "degree": "MD, MBBS",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-ritesh-mongha",
    "name": "Dr. Ritesh Mongha",
    "specialty": "Urology, Renal Transplant & Robotic Surgery",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "19+ years, 10,000+ surgeries",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & Sr. Consultant",
    "degree": "MCh, MS, DNB, MBBS",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-shailendra-lalwani",
    "name": "Dr. Shailendra Lalwani",
    "specialty": "Liver Transplant, HPB & GI Surgery",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "2500+ liver transplants",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & HOD",
    "degree": "MBBS, MS, DNB",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-lalit-sehgal",
    "name": "Dr. Lalit Sehgal",
    "specialty": "Liver Transplant Anaesthesia & Critical Care",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & HOD",
    "degree": "MBBS, MD, DNB",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-vishal-khurana",
    "name": "Dr. Vishal Khurana",
    "specialty": "Gastroenterology & Hepatobiliary Sciences",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "",
    "image": "",
    "isTopDoctor": false,
    "position": "Director",
    "degree": "DM, MD, MBBS",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-himanshu-arora",
    "name": "Dr. Himanshu Arora",
    "specialty": "Neurosurgery & Spine Surgery",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "",
    "image": "",
    "isTopDoctor": false,
    "position": "Director",
    "degree": "MBBS, DNB",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-arun-kumar-singh",
    "name": "Dr. Arun Kumar C. Singh",
    "specialty": "Endocrinology & Diabetology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "",
    "image": "",
    "isTopDoctor": false,
    "position": "Director",
    "degree": "MBBS, MD, DM",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-midur-kumar-sharma",
    "name": "Dr. Midur Kumar Sharma",
    "specialty": "Laparoscopic, Bariatric & Metabolic Surgery",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "",
    "image": "",
    "isTopDoctor": false,
    "position": "Associate Director",
    "degree": "MCLS, MS, MBBS",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
  {
    "slug": "dr-ashok-dhar",
    "name": "Dr. Ashok Kr. Dhar",
    "specialty": "Orthopaedics & Joint Replacement",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "",
    "image": "",
    "isTopDoctor": false,
    "position": "Director",
    "degree": "",
    "about": "",
    "medicalProblems": [],
    "procedures": [],
    "faqs": []
  },
   {
    "slug": "dr-ruchi-taneja",
    "name": "Dr. Ruchi Taneja",
    "specialty": "Gynecology & Obstetrics",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "20+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573792305_Dr-Ruchi-Taneja.jpg",
    "isTopDoctor": true,
    "position": "Senior Consultant - Gynecology",
    "degree": "MBBS, DGO, DNB",
    "about": "Dr. Ruchi Taneja is a senior gynecologist with expertise in high-risk pregnancies, infertility, menstrual disorders, and laparoscopic gynecological surgeries.",
    "medicalProblems": [
      "High-Risk Pregnancy",
      "Infertility",
      "PCOS",
      "Menstrual Disorders"
    ],
    "procedures": [
      "Normal Delivery",
      "C-Section",
      "Laparoscopic Gynec Surgery",
      "Infertility Treatment"
    ],
    "faqs": []
  },
  {
    "slug": "dr-ilima-dutta",
    "name": "Dr. Ilima Dutta",
    "specialty": "Gynecology & Obstetrics",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "15+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663072011_Dr_Ilima_Dutta-min.jpg",
    "isTopDoctor": false,
    "position": "Consultant Gynecologist",
    "degree": "MBBS, DNB (OBGYN)",
    "about": "Dr. Ilima Dutta specializes in pregnancy care, gynecological disorders, family planning, and minimally invasive surgery.",
    "medicalProblems": [
      "Pregnancy Care",
      "Fibroids",
      "Endometriosis",
      "PCOS"
    ],
    "procedures": [
      "C-Section",
      "Hysterectomy",
      "Gynec Laparoscopy",
      "Infertility Treatments"
    ],
    "faqs": []
  },
  {
    "slug": "dr-vipasha-brajpuriya",
    "name": "Dr. Vipasha Brajpuriya",
    "specialty": "Pediatrics",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "18+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1637144584_vipasha.jpg",
    "isTopDoctor": true,
    "position": "Senior Consultant Pediatrician",
    "degree": "MBBS, MD (Pediatrics)",
    "about": "Dr. Vipasha is an experienced pediatrician treating newborn & childhood diseases, vaccinations, growth disorders, asthma, and infections.",
    "medicalProblems": [
      "Childhood Infections",
      "Asthma",
      "Growth Delay",
      "Allergies"
    ],
    "procedures": [
      "Child Vaccination",
      "Nebulization",
      "Newborn Care"
    ],
    "faqs": []
  },
  {
    "slug": "dr-renu-bhatt",
    "name": "Dr. Renu Bhatt",
    "specialty": "Physiotherapy",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "15+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1672210642_Renu.JPG",
    "isTopDoctor": false,
    "position": "Senior Physiotherapist",
    "degree": "MPT",
    "about": "Dr. Renu Bhatt is experienced in orthopedic, neurological, and sports physiotherapy with expertise in pain management.",
    "medicalProblems": [
      "Back Pain",
      "Neck Pain",
      "Knee Pain",
      "Frozen Shoulder"
    ],
    "procedures": [
      "Electrotherapy",
      "Manual Therapy",
      "Rehabilitation",
      "Sports Physio"
    ],
    "faqs": []
  },
  {
    "slug": "dr-sunil-kathuria",
    "name": "Dr. Sunil Kathuria",
    "specialty": "Orthopaedics",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "30+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573797339_Dr-Sunil-Kathuria.jpg",
    "isTopDoctor": true,
    "position": "Senior Consultant - Ortho",
    "degree": "MBBS, MS (Orthopaedics)",
    "about": "Dr. Sunil Kathuria is a senior orthopedic surgeon specializing in joint replacement, trauma, and sports injuries.",
    "medicalProblems": [
      "Arthritis",
      "Fractures",
      "Ligament Tears",
      "Joint Pain"
    ],
    "procedures": [
      "Total Knee Replacement",
      "Total Hip Replacement",
      "Arthroscopy",
      "Fracture Fixation"
    ],
    "faqs": []
  },
  {
    "slug": "dr-neelam-rewal",
    "name": "Dr. Neelam Rewal",
    "specialty": "ENT",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "25+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663072262_Dr_Neelam_Rewal-min.jpg",
    "isTopDoctor": false,
    "position": "Senior Consultant",
    "degree": "MS (ENT)",
    "about": "Dr. Neelam Rewal has over 25 years of experience in ENT and has worked extensively at Safdarjung Hospital & Lady Hardinge Medical College.",
    "medicalProblems": [
      "Tonsillitis",
      "Hearing Loss",
      "Sinusitis",
      "ENT Infections"
    ],
    "procedures": [
      "Sinus Surgery",
      "Tonsillectomy",
      "Ear Surgery",
      "Endoscopic ENT Procedures"
    ],
    "faqs": []
  },
  {
    "slug": "dr-giriraj-singh",
    "name": "Dr. Giriraj Singh",
    "specialty": "Urology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "10+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1660906874_Giriraj-Singh.jpg",
    "isTopDoctor": false,
    "position": "Consultant",
    "degree": "M.Ch (Urology)",
    "about": "Dr. Giriraj Singh specializes in diagnosing and treating kidney, ureter, bladder, and male reproductive system disorders.",
    "medicalProblems": [
      "Kidney Stones",
      "Prostate Enlargement",
      "Urinary Tract Infection",
      "Urethral Stricture"
    ],
    "procedures": [
      "Laser Kidney Stone Removal",
      "TURP",
      "Urethral Reconstruction",
      "Endourological Procedures"
    ],
    "faqs": []
  },
  {
    "slug": "dr-ashish-agarwal",
    "name": "Dr. Ashish Agarwal",
    "specialty": "Cardiology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "22+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573795989_Dr-Ashish-Agarwal.jpg",
    "isTopDoctor": true,
    "position": "Director & Unit Head - Cardiology",
    "degree": "DM (Cardiology)",
    "about": "Dr. Ashish Agarwal is a senior cardiologist specializing in angioplasty, heart failure, arrhythmia, and cardiac emergencies.",
    "medicalProblems": [
      "Heart Attack",
      "CAD",
      "Arrhythmia",
      "Heart Failure"
    ],
    "procedures": [
      "Angiography",
      "Angioplasty",
      "Pacemaker Implant",
      "Cardiac Catheterization"
    ],
    "faqs": []
  },
  {
    "slug": "dr-rahul-kawatra",
    "name": "Dr. Rahul Kawatra",
    "specialty": "Gastroenterology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "13+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663570533_Rahul_kawatra-min.jpg",
    "isTopDoctor": false,
    "position": "Consultant Gastroenterologist",
    "degree": "DM (Gastroenterology)",
    "about": "Specialist in liver, stomach, and intestinal disorders with expertise in endoscopy and colonoscopy.",
    "medicalProblems": [
      "Liver Disease",
      "Acid Reflux",
      "Ulcers",
      "IBS"
    ],
    "procedures": [
      "Upper GI Endoscopy",
      "Colonoscopy",
      "ERCP",
      "Liver Biopsy"
    ],
    "faqs": []
  },
  {
    "slug": "dr-deepak-kumar-mishra",
    "name": "Dr. Deepak Kumar Mishra",
    "specialty": "Internal Medicine",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "20+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573796595_Dr-Deepak-Kumar-Mishra.jpg",
    "isTopDoctor": false,
    "position": "Senior Consultant",
    "degree": "MD (Medicine)",
    "about": "Experienced in diabetes, hypertension, thyroid disorders, and infectious diseases.",
    "medicalProblems": [
      "Diabetes",
      "Hypertension",
      "Thyroid Disorders",
      "Infections"
    ],
    "procedures": [
      "Chronic Disease Management",
      "Infection Treatment",
      "Lifestyle Counseling"
    ],
    "faqs": []
  },
  {
    "slug": "dr-rishi-raj",
    "name": "Dr. Rishi Raj",
    "specialty": "Dermatology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "3+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573798502_Dr-Rishi-Raj.jpg",
    "isTopDoctor": false,
    "position": "Consultant Dermatologist",
    "degree": "MD (Dermatology)",
    "about": "Expert in skin, hair, and nail disorders with advanced cosmetic dermatology training.",
    "medicalProblems": [
      "Acne",
      "Eczema",
      "Psoriasis",
      "Hair Loss"
    ],
    "procedures": [
      "Laser Treatment",
      "Chemical Peels",
      "Dermatosurgery",
      "Skin Biopsy"
    ],
    "faqs": []
  },
  {
    "slug": "dr-amit-kumar-singhal",
    "name": "Dr. Amit Kumar Singhal",
    "specialty": "Neurology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "15+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663570884_amit_singhal-min.jpg",
    "isTopDoctor": false,
    "position": "Senior Consultant Neurologist",
    "degree": "DM (Neurology)",
    "about": "Specialist in epilepsy, stroke, migraine, neuropathies and neuromuscular diseases.",
    "medicalProblems": [
      "Stroke",
      "Epilepsy",
      "Migraine",
      "Neuropathy"
    ],
    "procedures": [
      "EEG",
      "NCS",
      "Stroke Management",
      "Botox for Migraine"
    ],
    "faqs": []
  },
  {
    "slug": "dr-vikram-kharbanda",
    "name": "Dr. Vikram Kharbanda",
    "specialty": "Orthopaedics",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "18+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573798526_Vikram-Khardbanda.jpg",
    "isTopDoctor": false,
    "position": "Senior Consultant",
    "degree": "MS (Orthopaedics)",
    "about": "Expert in joint replacement, sports injury, spine disorders and trauma care.",
    "medicalProblems": [
      "Arthritis",
      "Back Pain",
      "Ligament Tear",
      "Fracture"
    ],
    "procedures": [
      "Joint Replacement",
      "Arthroscopy",
      "Spine Surgery",
      "Trauma Surgery"
    ],
    "faqs": []
  },
  {
    "slug": "dr-rahul-malik",
    "name": "Dr. Rahul Malik",
    "specialty": "Oncology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "12+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663072532_Dr_Rahul_malik-min.jpg",
    "isTopDoctor": false,
    "position": "Consultant Oncologist",
    "degree": "DM (Medical Oncology)",
    "about": "Experienced in chemotherapy, targeted therapy, and immunotherapy for major cancers.",
    "medicalProblems": [
      "Breast Cancer",
      "Lung Cancer",
      "Blood Cancer",
      "Colon Cancer"
    ],
    "procedures": [
      "Chemotherapy",
      "Immunotherapy",
      "Targeted Therapy"
    ],
    "faqs": []
  },
  {
    "slug": "dr-seema-vaid",
    "name": "Dr. Seema Vaid",
    "specialty": "Pediatrics",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "30+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573798897_Dr-Seema-Vaid.jpg",
    "isTopDoctor": false,
    "position": "Senior Consultant – Pediatrics",
    "degree": "MD (Pediatrics)",
    "about": "Senior pediatrician with deep experience in newborn care, growth issues, and child diseases.",
    "medicalProblems": [
      "Infections",
      "Asthma",
      "Nutrition Issues",
      "Newborn Problems"
    ],
    "procedures": [
      "Vaccination",
      "Pediatric Emergency Care",
      "Growth Monitoring"
    ],
    "faqs": []
  },
  {
    "slug": "dr-ashwani-kumar",
    "name": "Dr. Ashwani Kumar",
    "specialty": "Nephrology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "16+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663571142_ashwani_kumar-min.jpg",
    "isTopDoctor": false,
    "position": "Consultant Nephrologist",
    "degree": "DM (Nephrology)",
    "about": "Expert in kidney diseases, dialysis care, transplant evaluation and electrolyte disorders.",
    "medicalProblems": [
      "CKD",
      "AKI",
      "Kidney Failure",
      "High Creatinine"
    ],
    "procedures": [
      "Dialysis",
      "Kidney Biopsy",
      "Transplant Evaluation"
    ],
    "faqs": []
  },
  {
    "slug": "dr-ajay-sharma",
    "name": "Dr. Ajay Sharma",
    "specialty": "Ophthalmology",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "25+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573798588_Dr-Ajay-Sharma.jpg",
    "isTopDoctor": false,
    "position": "Senior Consultant",
    "degree": "MS (Ophthalmology)",
    "about": "Specialist in cataract, LASIK, glaucoma, cornea & ocular disorders.",
    "medicalProblems": [
      "Cataract",
      "Glaucoma",
      "Dry Eye",
      "Corneal Disease"
    ],
    "procedures": [
      "LASIK",
      "Cataract Surgery",
      "Glaucoma Surgery",
      "Corneal Transplant"
    ],
    "faqs": []
  },
  {
    "slug": "dr-abhishek-bansal",
    "name": "Dr. Abhishek Bansal",
    "specialty": "Dentistry",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "8+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1573798662_Dr-Abhishek-Bansal.jpg",
    "isTopDoctor": false,
    "position": "Consultant Dentist",
    "degree": "BDS, MDS",
    "about": "Expert in cosmetic dentistry, RCT, dental implants, braces and smile correction.",
    "medicalProblems": [
      "Tooth Pain",
      "Gum Disease",
      "Cavities",
      "Crooked Teeth"
    ],
    "procedures": [
      "Root Canal",
      "Dental Implants",
      "Braces",
      "Teeth Whitening"
    ],
    "faqs": []
  },
  {
    "slug": "dr-saurabh-garg",
    "name": "Dr. Saurabh Garg",
    "specialty": "Psychiatry",
    "hospital": "Metro Hospital, Faridabad",
    "normalizedHospital": "metro multispeciality",
    "experience": "10+ years",
    "image": "https://www.metrohospitals.com/images/doctor/1663571354_saurabh_garg-min.jpg",
    "isTopDoctor": false,
    "position": "Consultant Psychiatrist",
    "degree": "MD (Psychiatry)",
    "about": "Treats depression, anxiety, OCD, bipolar disorder and addiction.",
    "medicalProblems": [
      "Depression",
      "Anxiety",
      "OCD",
      "Bipolar Disorder"
    ],
    "procedures": [
      "Psychotherapy",
      "Medication Management",
      "Addiction Treatment"
    ],
    "faqs": []
  }, {
    "slug": "dr-alka-kriplani",
    "name": "Dr. Alka Kriplani",
    "specialty": "Obstetrics & Gynecology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "40+ years",
    "image": "",
    "isTopDoctor": true,
    "position": "Chairperson - Obstetrics and Gynecology",
    "degree": "MD, FRCOG, FAMS, FICOG, FICMCH, FIMSA, FCLS",
    "about": "Dr. Alka Kriplani is an eminent gynecologist with over four decades of experience, former Head at AIIMS New Delhi. Renowned for leadership, academics, and innovations in women's healthcare.",
    "medicalProblems": [
      "High-risk pregnancy",
      "Reproductive endocrine disorders",
      "Infertility",
      "Menopausal issues",
      "Gynecological disorders (fibroids, endometriosis)"
    ],
    "procedures": [
      "Gynecological endoscopy",
      "Laparoscopy",
      "Hysteroscopy",
      "High-risk pregnancy management",
      "Reproductive endocrinology procedures"
    ],
    "faqs": []
  },
  {
    "slug": "dr-m-v-padma-srivastava",
    "name": "Dr. M V Padma Srivastava",
    "specialty": "Neurology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "40+ years",
    "image": "",
    "isTopDoctor": true,
    "position": "Chairperson - Neurology",
    "degree": "MBBS, MD, DM, MAMS",
    "about": "Padma Shri awardee and pioneer in stroke care and cerebrovascular disease management. Instrumental in establishing hyperacute thrombolysis programs and national stroke guidelines.",
    "medicalProblems": [
      "Stroke / acute ischemic stroke",
      "Alzheimer's disease and dementia",
      "Cerebrovascular disorders",
      "Neurodegenerative conditions"
    ],
    "procedures": [
      "Thrombolysis for acute stroke",
      "Stroke unit management",
      "Neurorehabilitation pathways",
      "Diagnostic cerebrovascular evaluations"
    ],
    "faqs": []
  },
  {
    "slug": "dr-r-ranga-rao",
    "name": "Dr. R Ranga Rao",
    "specialty": "Medical Oncology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "30+ years",
    "image": "",
    "isTopDoctor": true,
    "position": "Chairman - Oncology",
    "degree": "DM (Oncology), MD (Internal Medicine), MBBS",
    "about": "Dr. (Col) R. Ranga Rao is a senior medical oncologist with over three decades of experience and international training (MD Anderson). Expert in solid tumors, chemotherapy protocols and palliative oncology.",
    "medicalProblems": [
      "Solid organ cancers (breast, lung, GI, etc.)",
      "Advanced cancer symptom management",
      "Palliative needs"
    ],
    "procedures": [
      "Systemic chemotherapy",
      "Targeted therapy protocols",
      "Palliative interventions",
      "Oncology multidisciplinary planning"
    ],
    "faqs": []
  },
  {
    "slug": "dr-rajnish-monga",
    "name": "Dr. Rajnish Monga",
    "specialty": "Gastroenterology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "20+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Chairman - Gastroenterology",
    "degree": "MBBS, MD, DM",
    "about": "Experienced gastroenterologist with a focus on pancreatic diseases, acute pancreatitis and complex colonic disorders; trained in advanced endoscopic techniques (ERCP, EUS).",
    "medicalProblems": [
      "Acute and chronic pancreatitis",
      "Pancreatic diseases",
      "Colonic disorders (IBD, colitis)",
      "Liver and biliary disorders"
    ],
    "procedures": [
      "ERCP",
      "Endoscopic ultrasound (EUS)",
      "Therapeutic endoscopy",
      "Endoscopic management of biliary/pancreatic diseases"
    ],
    "faqs": []
  },
  {
    "slug": "dr-sushant-srivastava",
    "name": "Dr. Sushant Srivastava",
    "specialty": "Cardiothoracic & Vascular Surgery (CTVS)",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "30+ years",
    "image": "",
    "isTopDoctor": true,
    "position": "Chairperson - CTVS",
    "degree": "MS (General Surgery), M.Ch (CTVS - AIIMS)",
    "about": "Nationally renowned cardiothoracic and heart-lung transplant surgeon with 30+ years experience and over 15,000 surgeries. Pioneer in stitch-less valve implantation and awake CABG in North India.",
    "medicalProblems": [
      "End-stage heart failure",
      "Valvular heart disease",
      "Coronary artery disease",
      "Congenital cardiac defects"
    ],
    "procedures": [
      "Heart transplantation",
      "Left ventricular assist device (LVAD) implantation",
      "Beating-heart CABG",
      "Valve repairs and replacements (including stitch-less techniques)",
      "Aortic aneurysm surgery",
      "Minimally invasive cardiac surgery"
    ],
    "faqs": []
  },
  {
    "slug": "dr-v-s-mehta",
    "name": "Dr. V S Mehta",
    "specialty": "Neurosurgery",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "40+ years",
    "image": "",
    "isTopDoctor": true,
    "position": "Chairman - Neurosurgery",
    "degree": "MBBS, MS (General Surgery), M.Ch (Neurosurgery)",
    "about": "Padma Shri neurosurgeon, former Head of Neurosurgery at AIIMS New Delhi, with decades of expertise in complex brain and spine surgery including brain tumors and brachial plexus surgery.",
    "medicalProblems": [
      "Brain tumors",
      "Brainstem lesions",
      "Brachial plexus injuries",
      "Intracranial vascular disorders"
    ],
    "procedures": [
      "Brain tumor surgery",
      "Skull base and brainstem surgery",
      "Microsurgery for brachial plexus",
      "Complex cranial and spinal procedures"
    ],
    "faqs": []
  },
  {
    "slug": "dr-abhay-kapoor",
    "name": "Dr. Abhay Kapoor",
    "specialty": "Interventional Radiology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "19+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Interventional Radiology",
    "degree": "FVIR, MD, MBBS",
    "about": "Experienced interventional radiologist pecializing in ablative therapies for liver cancer (RFA, MWA), trans-arterial therapies (TACE, TARE), and advanced image-guided interventions.",
    "medicalProblems": [
      "Primary and secondary liver cancers",
      "Image-guided tumor management",
      "Vascular lesions"
    ],
    "procedures": [
      "Radiofrequency ablation (RFA)",
      "Microwave ablation (MWA)",
      "TACE (transarterial chemoembolization)",
      "TARE (transarterial radioembolization)",
      "Cryoablation"
    ],
    "faqs": []
  },
  {
    "slug": "dr-manmohan-singh",
    "name": "Dr. Manmohan Singh",
    "specialty": "Neurosurgery",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "25+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Vice Chairperson - Neurosurgery",
    "degree": "M.Ch (Neurosurgery), M.S (Surgery), MBBS",
    "about": "Leading skull base and neurovascular surgeon; former Professor of Neurosurgery and head of Gamma Knife Centre at AIIMS. Expertise in cavernous sinus tumors and radiosurgery.",
    "medicalProblems": [
      "Skull base tumors",
      "Cavernous sinus lesions",
      "Complex neurovascular disease",
      "Movement disorders"
    ],
    "procedures": [
      "Skull base surgery",
      "Radiosurgery / Gamma Knife",
      "Deep brain stimulation",
      "Micro-neurosurgical techniques"
    ],
    "faqs": []
  },
  {
    "slug": "dr-amit-bhushan-sharma",
    "name": "Dr. Amit Bhushan Sharma",
    "specialty": "Cardiology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "15+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director And Unit Head - Cardiology",
    "degree": "DM (Cardiology) + International Fellowships (Interventional Cardiology, EP, Pediatric devices)",
    "about": "Interventional cardiologist with advanced fellowships in the USA; pioneer in minimally invasive structural heart procedures and TAVR/TAVI in India.",
    "medicalProblems": [
      "Severe valvular disease",
      "Structural heart disease",
      "Coronary artery disease",
      "Arrhythmias"
    ],
    "procedures": [
      "Transcatheter Aortic Valve Replacement (TAVR/TAVI)",
      "MitraClip and structural interventions",
      "Leadless pacemaker procedures",
      "Device closures (ASD/VSD)",
      "Electrophysiology and pacing"
    ],
    "faqs": []
  },
  {
    "slug": "dr-amitava-sengupta",
    "name": "Dr. Amitava Sengupta",
    "specialty": "Pediatrics & Neonatology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "40+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Pediatrics and Neonatology",
    "degree": "Fellowship Neonatology, FNNF, MICP, DCH, MBBS",
    "about": "Renowned neonatologist with long international experience and national leadership in neonatal intensive care and training.",
    "medicalProblems": [
      "Neonatal intensive care needs",
      "Prematurity and neonatal critical illness",
      "Neonatal infections",
      "Newborn respiratory and feeding issues"
    ],
    "procedures": [
      "Neonatal ICU management",
      "Advanced neonatal resuscitation",
      "Neonatal ventilation and ECMO-related care pathways",
      "Neonatal follow-up and developmental care"
    ],
    "faqs": []
  },
  {
    "slug": "dr-ankur-garg",
    "name": "Dr. Ankur Garg",
    "specialty": "Liver Transplant & HPB Surgery",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "25+ years",
    "image": "",
    "isTopDoctor": true,
    "position": "Group Director And HOD - Liver Transplant",
    "degree": "MBBS, MS (General Surgery), MCh (HPB Surgery & Liver Transplant)",
    "about": "World-renowned liver transplant surgeon with over 2,500 liver transplants and extensive experience in complex HPB surgeries.",
    "medicalProblems": [
      "Acute liver failure",
      "End-stage liver disease",
      "Complex hepatobiliary tumors",
      "Liver transplant complications"
    ],
    "procedures": [
      "Living donor liver transplant (LDLT)",
      "Cadaveric liver transplant",
      "Paediatric & dual-lobe transplant",
      "Complex liver resections",
      "ABO-incompatible transplants"
    ],
    "faqs": []
  },
  {
    "slug": "dr-arunesh-kumar",
    "name": "Dr. Arunesh Kumar",
    "specialty": "Pulmonology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "23+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & HOD - Pulmonology",
    "degree": "MBBS, DNB, MRCP (UK), FRCP (London)",
    "about": "UK-trained respiratory physician with extensive experience in lung cancer, interventional bronchoscopy, EBUS TBNA and advanced pulmonary diagnostics.",
    "medicalProblems": [
      "Lung cancer",
      "Severe asthma",
      "Interstitial lung disease",
      "Chronic respiratory failure"
    ],
    "procedures": [
      "Interventional bronchoscopy",
      "EBUS TBNA",
      "Thoracoscopy",
      "Advanced pulmonary diagnostics and biopsies",
      "Biologic therapy for asthma"
    ],
    "faqs": []
  },
  {
    "slug": "dr-arvind-mehra",
    "name": "Dr. Arvind Mehra",
    "specialty": "Orthopaedics & Trauma",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "20+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Senior Director And HOD - Orthopaedics",
    "degree": "MCh, ALSSE, MS, MBBS",
    "about": "Experienced traumatologist and orthopaedic surgeon specialising in complex fractures, joint replacement and paediatric deformity corrections; over 20,000 surgeries.",
    "medicalProblems": [
      "Complex fractures",
      "Joint & spine disorders",
      "Paediatric orthopaedic deformities",
      "Limb length discrepancies"
    ],
    "procedures": [
      "Trauma surgery",
      "Joint replacement",
      "Paediatric deformity correction",
      "Minimally invasive orthopaedic procedures"
    ],
    "faqs": []
  },
  {
    "slug": "dr-bharat-b-kukreti",
    "name": "Dr. Bharat B Kukreti",
    "specialty": "Cardiology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "15+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director And Unit Head - Cardiology",
    "degree": "DM Cardiology (AIIMS), MD (Medicine), MBBS",
    "about": "Senior interventional cardiologist skilled in angiography, PTCA, device closures, electrophysiology and aortic stent grafting.",
    "medicalProblems": [
      "Coronary artery disease",
      "Valve disease",
      "Arrhythmias",
      "Structural heart defects"
    ],
    "procedures": [
      "Coronary angiogram (CAG)",
      "PTCA / angioplasty",
      "Device closures (ASD / VSD)",
      "EPS and RF ablation",
      "Aortic stent grafting",
      "AICD implantation"
    ],
    "faqs": []
  },
  {
    "slug": "dr-indu-bansal-aggarwal",
    "name": "Dr. Indu Bansal Aggarwal",
    "specialty": "Radiation Oncology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "25+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Group Director And HOD - Radiation Oncology",
    "degree": "MD (Radiation Oncology), Dip. Hospital Management, MBBS",
    "about": "Experienced radiation oncologist with expertise in pediatric tumors, head & neck cancers and advanced radiotherapy techniques; trained at MD Anderson.",
    "medicalProblems": [
      "Pediatric cancers",
      "Head & neck malignancies",
      "Solid tumors requiring radiotherapy"
    ],
    "procedures": [
      "Conformal radiotherapy",
      "IMRT/IGRT",
      "Palliative radiotherapy",
      "Stereotactic radiotherapy (where available)"
    ],
    "faqs": []
  },
  {
    "slug": "dr-mandeep-singh",
    "name": "Dr. Mandeep Singh",
    "specialty": "Plastic & Cosmetic Surgery",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "20+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & HOD - Plastic Surgery",
    "degree": "MBBS, MS, DNB",
    "about": "Board-certified plastic surgeon trained in India and the USA with broad experience in cosmetic and reconstructive procedures.",
    "medicalProblems": [
      "Aesthetic concerns",
      "Post-traumatic reconstruction",
      "Burn sequelae",
      "Congenital deformities"
    ],
    "procedures": [
      "Cosmetic surgery (breast, body contouring, rhinoplasty)",
      "Reconstructive microsurgery",
      "Scar revision",
      "Hand surgery"
    ],
    "faqs": []
  },
  {
    "slug": "dr-nitin-jain",
    "name": "Dr. Nitin Jain",
    "specialty": "Critical Care",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "18+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & HOD - Critical Care",
    "degree": "EDIC, MD, MBBS",
    "about": "Senior intensivist trained in ECMO and lung transplant care; extensive critical care teaching experience and leadership roles.",
    "medicalProblems": [
      "Multi-organ failure",
      "Sepsis and septic shock",
      "Respiratory failure",
      "Post-operative ICU care"
    ],
    "procedures": [
      "Mechanical ventilation and weaning",
      "ECMO management",
      "Hemodynamic monitoring",
      "ICU resuscitation protocols"
    ],
    "faqs": []
  },
  {
    "slug": "dr-p-n-gupta",
    "name": "Dr. P N Gupta",
    "specialty": "Nephrology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "20+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director & HOD - Nephrology",
    "degree": "DNB (Nephrology), MD, MBBS",
    "about": "Senior nephrologist with extensive kidney transplant experience and a fellowship in kidney transplantation; supervised numerous haemodialysis programs.",
    "medicalProblems": [
      "Chronic kidney disease",
      "End-stage renal disease",
      "Post-transplant complications",
      "Acute kidney injury"
    ],
    "procedures": [
      "Hemodialysis",
      "Kidney transplant management",
      "Peritoneal dialysis (where applicable)",
      "Renal biopsy"
    ],
    "faqs": []
  },
  {
    "slug": "dr-rajesh-kumar",
    "name": "Dr. Rajesh Kumar",
    "specialty": "Internal Medicine",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "15+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Internal Medicine",
    "degree": "MD (Medicine), MBBS",
    "about": "Experienced internist and infectious disease specialist, ACLS trainer with strong background in critical care and preventive medicine.",
    "medicalProblems": [
      "Infectious diseases (dengue, malaria etc.)",
      "Chronic medical conditions (diabetes, hypertension)",
      "Pre-operative assessment"
    ],
    "procedures": [
      "Lumbar puncture",
      "Ventilation & life support management",
      "ACLS training and resuscitation"
    ],
    "faqs": []
  },
  {
    "slug": "dr-sumit-bhatia",
    "name": "Dr. Sumit Bhatia",
    "specialty": "Gastroenterology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "15+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Gastroenterology",
    "degree": "MD (Internal Medicine), DM (Medical Gastroenterology)",
    "about": "Senior gastroenterologist with international fellowships in advanced endoscopy (ERCP, EUS) and expertise in inflammatory bowel disease and therapeutic endoscopy.",
    "medicalProblems": [
      "Inflammatory bowel disease (IBD)",
      "Biliary and pancreatic disorders",
      "Refractory GI bleeding"
    ],
    "procedures": [
      "ERCP",
      "EUS",
      "Therapeutic endoscopy (hemostasis, stenting)",
      "Advanced polypectomy"
    ],
    "faqs": []
  },
  {
    "slug": "dr-vaibhaw-kumar",
    "name": "Dr. Vaibhaw Kumar",
    "specialty": "Liver Transplant & HPB Surgery",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "15+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Liver Transplant",
    "degree": "MCh (HPB Surgery & Liver Transplant), MS, MBBS",
    "about": "Experienced HPB and liver transplant surgeon who has been part of large scale liver transplant programs and complex HPB surgeries.",
    "medicalProblems": [
      "End-stage liver disease",
      "Complex hepatobiliary tumors",
      "Post-transplant complications"
    ],
    "procedures": [
      "Living-donor liver transplant",
      "Cadaveric transplant",
      "Complex liver resections",
      "HPB surgery"
    ],
    "faqs": []
  },
  {
    "slug": "dr-vivek-logani",
    "name": "Dr. Vivek Logani",
    "specialty": "Orthopaedics",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "23+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Director - Orthopaedics",
    "degree": "MS (Orthopedics), DNB (Orthopedics), MNAMS, MBBS",
    "about": "Veteran joint replacement surgeon and early adopter of robotics and computer navigation in arthroplasty, with thousands of joint replacement procedures.",
    "medicalProblems": [
      "Osteoarthritis",
      "Revision arthroplasty",
      "Complex joint deformities",
      "Sports injuries"
    ],
    "procedures": [
      "Robot / navigation-assisted joint replacement",
      "Primary & revision knee and hip replacements",
      "Unicompartmental knee replacement",
      "Allograft bone banking procedures"
    ],
    "faqs": []
  },
  {
    "slug": "dr-seema-sharma",
    "name": "Dr. Seema Sharma",
    "specialty": "Obstetrics & Gynecology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "22+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Associate Director - Obstetrics and Gynecology",
    "degree": "MS (Obs. & Gyne), MBBS, Fellowship in Minimal Access Surgery",
    "about": "Senior gynecologist with expertise in high-risk pregnancy care, infertility management and advanced laparoscopic gynecological surgery.",
    "medicalProblems": [
      "High-risk pregnancy",
      "Infertility",
      "Fibroids",
      "Endometriosis"
    ],
    "procedures": [
      "Laparoscopic gynecologic surgery",
      "Infertility evaluations",
      "High-risk obstetric management"
    ],
    "faqs": []
  },
  {
    "slug": "dr-vikash-goyal",
    "name": "Dr. Vikash Goyal",
    "specialty": "Cardiology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "10+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Associate Director - Cardiology",
    "degree": "DM (Cardiology), MD (Medicine), MBBS",
    "about": "Interventional cardiologist with high volumes of angiographies and angioplasties and expertise in complex PCI and TAVI/TAVR procedures.",
    "medicalProblems": [
      "Coronary artery disease",
      "Valvular heart disease",
      "Heart failure"
    ],
    "procedures": [
      "PCI / angioplasty (complex & chronic total occlusion)",
      "TAVR/TAVI procedures",
      "Structural interventions"
    ],
    "faqs": []
  },
  {
    "slug": "dr-amitabh-malik",
    "name": "Dr. Amitabh Malik",
    "specialty": "ENT (Ear, Nose & Throat)",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "25+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Chief & HOD - ENT",
    "degree": "MS (ENT), F.A.G.E, MBBS",
    "about": "Senior ENT surgeon with expertise in pediatric ENT, micro ear/laryngeal surgery, endoscopic sinus surgery and cochlear implantation.",
    "medicalProblems": [
      "Pediatric ENT disorders",
      "Chronic sinusitis",
      "Hearing impairment",
      "Laryngeal disorders"
    ],
    "procedures": [
      "Endoscopic sinus surgery",
      "Micro ear and laryngeal surgery",
      "Cochlear implant procedures",
      "Management of fungal / mucormycosis where applicable"
    ],
    "faqs": []
  },
  {
    "slug": "dr-anurag-khaitan",
    "name": "Dr. Anurag Khaitan",
    "specialty": "Urology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "10+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Chief & HOD - Urology",
    "degree": "DNB Genitourinary Surgery, MCh (Urology - AIIMS), MS, MBBS",
    "about": "Expert urologist skilled in robotic surgery, prostate cancer operations, reconstructive urology and advanced endourology.",
    "medicalProblems": [
      "Prostate cancer and BPH",
      "Kidney stones",
      "Urethral stricture",
      "Reconstructive urological problems"
    ],
    "procedures": [
      "Robotic urologic surgery",
      "Radical prostatectomy / prostate cancer surgery",
      "Laser prostate procedures",
      "Endourological stone removal and reconstructive surgery"
    ],
    "faqs": []
  },
  {
    "slug": "dr-manish-mannan",
    "name": "Dr. Manish Mannan",
    "specialty": "Pediatrics & Neonatology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "15+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Head Of Department - Pediatrics and Neonatology",
    "degree": "MBBS, DCH, Senior Research Fellowship (ICMR)",
    "about": "Pediatrician and former Army Medical Corps physician with experience across AIIMS and major hospitals; expertise in growth, development and nutrition.",
    "medicalProblems": [
      "Child growth & development issues",
      "Pediatric infections",
      "Nutritional deficiencies",
      "Neonatal problems"
    ],
    "procedures": [
      "Pediatric emergency care",
      "Growth monitoring",
      "Vaccination programs",
      "Neonatal support and follow-up"
    ],
    "faqs": []
  },
  {
    "slug": "dr-meenakshi-sharma",
    "name": "Dr. Meenakshi Sharma",
    "specialty": "General, Minimal Access, GI & Bariatric Surgery",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "26+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Chief & HOD - General, Minimal Access, GI & Bariatric Surgery",
    "degree": "DNB, MS, MBBS",
    "about": "Senior surgeon specialising in hernia, minimal access and GI surgery with fellowships from Cleveland Clinic and Ulm.",
    "medicalProblems": [
      "Hernias",
      "GI surgical disorders",
      "Obesity and bariatric concerns",
      "Trauma-related abdominal surgery"
    ],
    "procedures": [
      "Laparoscopic hernia repair",
      "Bariatric surgery",
      "Endoscopic procedures for piles",
      "Abdominal wall reconstruction"
    ],
    "faqs": []
  },
  {
    "slug": "dr-sageer-aazaz",
    "name": "Dr. Sageer Aazaz",
    "specialty": "Dental Services / Implantology",
    "hospital": "Paras Health Gurugram",
    "normalizedHospital": "paras health gurugram",
    "experience": "20+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "Head Of Department - Dental Services",
    "degree": "BDS, CCI (Germany)",
    "about": "Experienced dental implantologist and head of multidisciplinary dental department; performed thousands of implant and full-mouth rehabilitation procedures.",
    "medicalProblems": [
      "Missing teeth",
      "Full-mouth rehabilitation needs",
      "Complex dental implant cases",
      "Chronic periodontal disease"
    ],
    "procedures": [
      "Dental implants",
      "Full mouth rehabilitation",
      "Fixed & removable prosthodontics",
      "Implant-supported overdentures"
    ],
    "faqs": []
  },{
    "id": 30,
    "name": "Dr. R. R. Dutta",
    "slug": "dr-rr-dutta-internal-medicine-gurgaon",
    "designation": "Head Of Department - Internal Medicine",
    "qualifications": ["MD (Medicine)", "MBBS"],
    "hospital": "Paras Health Gurugram",
    "specialization": ["Internal Medicine", "Bone Marrow Transplantation", "Stem Cell Transplantation"],
    "certifications": [
      "Specialized Training in Bone Marrow Transplantation",
      "Advanced Certification in Internal Medicine",
      "Hickman Catheter Insertion"
    ],
    "medicalProblems": [
      "Complex Internal Medicine Disorders",
      "Blood Disorders Requiring Transplant",
      "Immunodeficiency Disorders",
      "Chronic Infections",
      "Multi-system Diseases"
    ],
    "procedures": [
      "Bone Marrow Transplant",
      "Stem Cell Transplant",
      "Central Line (Hickman) Insertion",
      "Advanced Internal Medicine Management"
    ],
    "awards": [
      "Excellence in Medicine Award",
      "Recognition for Research Contributions",
      "Outstanding Service Award"
    ]
  },
  {
    "id": 31,
    "name": "Dr. Anu Daber",
    "slug": "dr-anu-daber-rheumatology-gurgaon",
    "designation": "Senior Consultant - Rheumatology and Clinical Immunology",
    "qualifications": ["MD", "DNB", "DM", "MRCP (Edinburgh)"],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Rheumatology",
      "Clinical Immunology",
      "Autoimmune Disorders",
      "Adult & Paediatric Rheumatology"
    ],
    "certifications": [
      "EULAR Course in Rheumatic Diseases",
      "Royal College of Physicians Specialty Certification",
      "British Society of Rheumatology Certification"
    ],
    "medicalProblems": [
      "Arthritis",
      "Autoimmune Diseases",
      "Connective Tissue Disorders",
      "Vasculitis",
      "Paediatric Rheumatological Disorders"
    ],
    "procedures": [
      "Intra-articular Injections",
      "Intralesional Injections",
      "Carpal Tunnel Injections",
      "Skin, Muscle, Lip, Nerve Biopsies"
    ],
    "awards": ["Gold Medallist", "Research Excellence Recognition"]
  },
  {
    "id": 32,
    "name": "Dr. Ashutosh Goyal",
    "slug": "dr-ashutosh-goyal-endocrinology-gurgaon",
    "designation": "Senior Consultant - Endocrinology",
    "qualifications": [
      "MD (Medicine)",
      "DNB Endocrinology",
      "MRCP (UK) Endocrinology",
      "CCEBDM"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": ["Endocrinology", "Diabetes", "Hormonal Disorders"],
    "certifications": ["Specialty Certificate Endocrinology & Diabetes", "CCEBDM"],
    "medicalProblems": [
      "Diabetes",
      "Thyroid Disorders",
      "Pituitary Disorders",
      "Obesity",
      "Hormonal Imbalances"
    ],
    "procedures": [
      "Diabetes Management",
      "Endocrine Disorder Evaluation",
      "Hormonal Therapy Planning"
    ],
    "awards": []
  },
  {
    "id": 33,
    "name": "Dr. Ekta Nigam",
    "slug": "dr-ekta-nigam-dermatology-gurgaon",
    "designation": "Senior Consultant - Dermatology and Cosmetology",
    "qualifications": ["MD Dermatology Venereology & Leprosy", "MBBS"],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Dermatology",
      "Cosmetology",
      "Aesthetic Dermatology",
      "Psoriasis Management"
    ],
    "certifications": [
      "Advanced Dermatological Procedures",
      "Laser Treatment Techniques",
      "Cosmetic Dermatology Training"
    ],
    "medicalProblems": [
      "Acne",
      "Psoriasis",
      "Pigmentation Disorders",
      "Hair Loss",
      "Skin Infections"
    ],
    "procedures": [
      "Laser Treatments",
      "Chemical Peels",
      "Cosmetic Dermatology Procedures"
    ],
    "awards": ["Excellence in Dermatology Award", "Outstanding Mentorship Accolade"]
  },
  {
    "id": 34,
    "name": "Dr. Madhuri Jaitley",
    "slug": "dr-madhuri-jaitley-nephrology-gurgaon",
    "designation": "Senior Consultant - Nephrology",
    "qualifications": ["MBBS", "MD", "DNB Nephrology"],
    "hospital": "Paras Health Gurugram",
    "specialization": ["Nephrology", "Renal Transplant", "Hemodialysis"],
    "certifications": ["Renal Sciences", "Vascular Access", "Electrolyte Management"],
    "medicalProblems": ["Kidney Failure", "CKD", "Electrolyte Disorders", "Glomerular Diseases"],
    "procedures": ["Dialysis", "Renal Transplant Evaluation", "Vascular Access Procedures"],
    "awards": []
  },
  {
    "id": 35,
    "name": "Dr. Manpreet Sodhi",
    "slug": "dr-manpreet-sodhi-gynecology-gurgaon",
    "designation": "Senior Consultant - Obstetrics and Gynecology",
    "qualifications": [
      "Fellowship in ART & IVF",
      "Ultrasound Training",
      "Minimally Invasive Gynecology Training"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Infertility",
      "IVF",
      "Laparoscopy",
      "High-Risk Pregnancy"
    ],
    "certifications": [
      "ICOG/FOBSI Fellowship",
      "Ultrasound Certification",
      "AIIMS Minimally Invasive Gynecology"
    ],
    "medicalProblems": [
      "Infertility",
      "PCOS",
      "High-Risk Pregnancy",
      "Gynecological Disorders"
    ],
    "procedures": ["IVF", "Laparoscopic Surgery", "Ultrasound", "Minimally Invasive Gynecology"],
    "awards": ["Gold Medal – AOGD Conference"]
  },
  {
    "id": 36,
    "name": "Dr. Naveen Satija",
    "slug": "dr-naveen-satija-general-surgery-gurgaon",
    "designation": "Senior Consultant - General, GI & Bariatric Surgery",
    "qualifications": ["DNB", "MS", "MBBS"],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Laparoscopic Surgery",
      "General Surgery",
      "Gastrointestinal Surgery"
    ],
    "certifications": ["FIAGES", "FALS"],
    "medicalProblems": [
      "Hernia",
      "Gallbladder Disease",
      "GI Tumors",
      "Anorectal Disorders"
    ],
    "procedures": [
      "Laparoscopic Hernia Surgery",
      "GI Surgery",
      "Bariatric Techniques",
      "Fistula/Hemorrhoid Treatment"
    ],
    "awards": ["Outstanding Contribution Award"]
  },
  {
    "id": 37,
    "name": "Dr. Preeti Singh",
    "slug": "dr-preeti-singh-clinical-psychology-gurgaon",
    "designation": "Senior Consultant - Psychiatry (Clinical Psychologist)",
    "qualifications": [
      "Doctorate in Clinical Psychology",
      "Masters in Psychology",
      "Bachelors in Psychology"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Psychotherapy",
      "Psychometric Testing",
      "Biofeedback",
      "Trauma Therapy"
    ],
    "certifications": [
      "Certified CBT Therapist",
      "Certified Psychodynamic Therapist",
      "Accredited Mindfulness Practitioner"
    ],
    "medicalProblems": [
      "Depression",
      "Anxiety",
      "Trauma",
      "Addiction",
      "Learning Disabilities"
    ],
    "procedures": [
      "Psychotherapy",
      "Biofeedback Therapy",
      "Psychometric Assessments",
      "Brainspotting Therapy"
    ],
    "awards": [
      "Excellence in Clinical Psychology Award",
      "Mental Health Awareness Contribution Award"
    ]
  },
  {
    "id": 38,
    "name": "Dr. Rahul Kumar",
    "slug": "dr-rahul-kumar-orthopedics-gurgaon",
    "designation": "Senior Consultant - Orthopaedics",
    "qualifications": ["MS Ortho", "MBBS"],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Sports Injury",
      "Joint Replacement",
      "Arthroscopy"
    ],
    "certifications": ["Fellowship Knee & Shoulder Surgery (Germany & London)"],
    "medicalProblems": [
      "Sports Injuries",
      "Ligament Tears",
      "Arthritis",
      "Shoulder/Knee Problems"
    ],
    "procedures": [
      "Arthroscopy (Knee, Shoulder)",
      "Joint Replacement Surgery",
      "Sports Injury Management"
    ],
    "awards": []
  },
  {
    "id": 39,
    "name": "Dr. Rajsrinivas Parthasarathy",
    "slug": "dr-rajsrinivas-parthasarathy-neurointervention-gurgaon",
    "designation": "Senior Consultant - Neuro Intervention",
    "qualifications": ["MRCP UK", "MBBS"],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Neurointervention",
      "Stroke Management",
      "Cerebrovascular Disorders"
    ],
    "certifications": [
      "University of Alberta Certification",
      "GMC UK Certification"
    ],
    "medicalProblems": [
      "Stroke",
      "Aneurysm",
      "Brain Vessel Disorders",
      "AVM"
    ],
    "procedures": [
      "Neurointerventional Procedures",
      "Endovascular Treatment",
      "Stroke Intervention"
    ],
    "awards": []
  },
  {
    "id": 40,
    "name": "Dr. Rakesh Tiwari",
    "slug": "dr-rakesh-tiwari-pediatrics-gurgaon",
    "designation": "Senior Consultant - Pediatrics & Neonatology",
    "qualifications": ["MD Pediatrics", "MBBS"],
    "hospital": "Paras Health Gurugram",
    "specialization": ["Pediatrics", "Neonatology", "Critical Care"],
    "certifications": ["Development Supportive Care Faculty"],
    "medicalProblems": [
      "Newborn Critical Illness",
      "Pediatric Infections",
      "Growth Issues",
      "Neonatal Disorders"
    ],
    "procedures": [
      "Vaccination",
      "Neonatal Care",
      "Pediatric Emergency Care"
    ],
    "awards": []
  },
  {
    "id": 41,
    "name": "Dr. Ram Chander Jiloha",
    "slug": "dr-ram-chander-jiloha-psychiatry-gurgaon",
    "designation": "Senior Consultant - Psychiatry",
    "qualifications": ["MBBS", "MD Psychiatry"],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Schizophrenia",
      "Bipolar Disorder",
      "Addiction Psychiatry",
      "Child Psychiatry"
    ],
    "certifications": [
      "WHO Fellowship – Addiction Psychiatry (UCLA)",
      "WHO Fellowship – Child Psychiatry (UBC)"
    ],
    "medicalProblems": [
      "Severe Mental Illness",
      "Addiction",
      "Depression",
      "Anxiety",
      "Relationship Disorders"
    ],
    "procedures": [
      "Pharmacotherapy",
      "Psychotherapy",
      "Behaviour Therapy"
    ],
    "awards": [
      "Indira Gandhi Appreciation Award",
      "Lifetime Achievement Award (VIMHANS)",
      "Multiple National Awards"
    ]
  },
  {
    "id": 42,
    "name": "Dr. Nainika Goel",
    "slug": "dr-nainika-goel-dermatology-gurgaon",
    "designation": "Consultant - Dermatology and Cosmetology",
    "qualifications": [
      "MBBS",
      "MD Dermatology",
      "DNB Dermatology"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Dermatology",
      "Dermatosurgery",
      "Aesthetic Dermatology"
    ],
    "certifications": [
      "Fellowship Lasers & Dermatosurgery",
      "Clinical Dermatology Fellowship"
    ],
    "medicalProblems": [
      "Acne",
      "Hair Loss",
      "Pigmentation",
      "Skin Aging",
      "STDs"
    ],
    "procedures": [
      "Laser Treatments",
      "Injectables",
      "Skin & Hair Surgery"
    ],
    "awards": []
  },
  {
    "id": 43,
    "name": "Dr. Nandini Baruah",
    "slug": "dr-nandini-baruah-dermatology-gurgaon",
    "designation": "Consultant - Dermatology and Cosmetology",
    "qualifications": [
      "Fellowship Cutaneous Surgery (AIIMS)",
      "Fellowship Cosmetic Surgery (Safdarjung)",
      "DDVL"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Dermatology",
      "Cosmetology",
      "Aesthetic Medicine"
    ],
    "certifications": [
      "Advanced Laser Techniques",
      "Chemical Peeling",
      "Hair Transplant Surgery"
    ],
    "medicalProblems": [
      "Acne",
      "Psoriasis",
      "Burn Scars",
      "Vitiligo",
      "Pigmentation"
    ],
    "procedures": [
      "Laser",
      "Chemical Peels",
      "Hair Transplant",
      "Botox",
      "Fillers"
    ],
    "awards": ["Excellence in Dermatology Award"]
  },
  {
    "id": 44,
    "name": "Dr. Nadeem U Rehman",
    "slug": "dr-nadeem-rehman-cardiology-gurgaon",
    "designation": "Consultant - Cardiology",
    "qualifications": [
      "MBBS",
      "MD General Medicine",
      "DNB Medicine",
      "DM Cardiology",
      "DrNB Cardiology"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Interventional Cardiology",
      "Coronary Interventions",
      "Structural Heart Disease"
    ],
    "certifications": [
      "DFID – CMC Vellore",
      "Masters in Lipidology (ACC)"
    ],
    "medicalProblems": [
      "Coronary Artery Disease",
      "Heart Failure",
      "Arrhythmia",
      "Congenital Heart Disease"
    ],
    "procedures": [
      "Angioplasty",
      "Stenting",
      "TAVR",
      "Pacemaker/ICD/CRT",
      "Peripheral Interventions"
    ],
    "awards": []
  },
  {
    "id": 45,
    "name": "Dr. Pooja Anand",
    "slug": "dr-pooja-anand-neurology-gurgaon",
    "designation": "Consultant - Neurology",
    "qualifications": [
      "DM Neurology (AIIMS)",
      "MD Medicine (MAMC)",
      "MBBS Gold Medallist"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Neuroimmunology",
      "Epilepsy",
      "Movement Disorders",
      "Dementia"
    ],
    "certifications": ["SCE Neurology – RCP UK"],
    "medicalProblems": [
      "Epilepsy",
      "Parkinsonism",
      "Multiple Sclerosis",
      "Dementia"
    ],
    "procedures": [
      "Neurological Evaluation",
      "Immunotherapy Planning",
      "Seizure Management"
    ],
    "awards": ["National Young Scholar Winner 2023-24"]
  },
  {
    "id": 46,
    "name": "Dr. Prachi Gupta",
    "slug": "dr-prachi-gupta-gynecology-gurgaon",
    "designation": "Consultant - Obstetrics and Gynecology",
    "qualifications": [
      "MS Obstetrics & Gynecology",
      "MBBS",
      "ICOG Fellowship",
      "MRCOG Part 1"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Infertility",
      "Laparoscopy",
      "High-Risk Pregnancy",
      "Colposcopy"
    ],
    "certifications": [
      "ICOG Gynecological Endoscopy",
      "ISCCP Colposcopy",
      "CIMP Certification"
    ],
    "medicalProblems": [
      "Infertility",
      "PCOS",
      "High-Risk Pregnancy",
      "Cervical Pathology"
    ],
    "procedures": [
      "Laparoscopy",
      "IUI/Infertility Treatment",
      "Colposcopy",
      "Painless Delivery"
    ],
    "awards": []
  },
  {
    "id": 47,
    "name": "Dr. Raghav Bansal",
    "slug": "dr-raghav-bansal-liver-transplant-gurgaon",
    "designation": "Consultant - Liver Transplant",
    "qualifications": [
      "Fellowship Liver Transplant",
      "DrNB Surgical Gastroenterology",
      "MS Surgery",
      "MBBS"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Liver Transplant",
      "GI Oncology",
      "Minimal Access Surgery"
    ],
    "certifications": ["GI Oncology & Liver Transplant Training"],
    "medicalProblems": [
      "Liver Failure",
      "Cirrhosis",
      "GI Cancers",
      "Liver Tumors"
    ],
    "procedures": [
      "Liver Transplant",
      "GI Onco Surgery",
      "Minimal Access Liver Surgery"
    ],
    "awards": []
  },
  {
    "id": 48,
    "name": "Dr. Devanshee Aakash Shah",
    "slug": "dr-devanshee-shah-medical-oncology-gurgaon",
    "designation": "Associate Consultant - Oncology",
    "qualifications": [
      "DM Medical Oncology",
      "MD General Medicine",
      "MBBS",
      "Harvard eDiploma Oncology"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Medical Oncology",
      "Lung Cancer",
      "Head & Neck Cancer",
      "Hematologic Malignancies"
    ],
    "certifications": ["Harvard eDiploma Oncology"],
    "medicalProblems": [
      "Cancer (Solid & Blood)",
      "Advanced Malignancies",
      "Chemotherapy Side Effects"
    ],
    "procedures": [
      "Chemotherapy",
      "Immunotherapy",
      "Targeted Therapy"
    ],
    "awards": ["ASH Abstract Achievement Award 2023"]
  },
  {
    "id": 49,
    "name": "Dr. Shipra Gupta",
    "slug": "dr-shipra-gupta-oncology-gurgaon",
    "designation": "Associate Consultant - Oncology",
    "qualifications": [
      "MBBS",
      "MD Radiation Oncology",
      "DNB Radiation Oncology",
      "DrNB Medical Oncology"
    ],
    "hospital": "Paras Health Gurugram",
    "specialization": [
      "Medical Oncology",
      "Breast Cancer",
      "Palliative Care"
    ],
    "certifications": [
      "Essentials of Palliative Care – AIIMS",
      "IAPC Palliative Certification"
    ],
    "medicalProblems": [
      "Breast Cancer",
      "Solid Tumors",
      "Advanced Cancer"
    ],
    "procedures": [
      "Chemotherapy",
      "Targeted Therapy",
      "Palliative Treatment"
    ],
    "awards": []
  }
  
]



  try {
    // await Doctor.deleteMany({});
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
  const treatmentCategories =[];


  try {
    await TreatmentCategory.deleteMany({});
    await TreatmentCategory.insertMany(treatmentCategories);
    res.json({ message: "Treatment categories seeded successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Seeder error" });
  }
});

app.post("/api/send-mail", async (req, res) => {
  try {
    const { name, email, phone, message, treatment, country, language } = req.body;


    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
// 1️⃣ Save to MongoDB
    const savedContact = await Contact.create({
      name,
      email,
      phone,
      country,
      language,
      treatment,
      message,
    });
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "musaibkm@gmail.com",
        pass: "Infy@632509"
      },
    });

    const mailOptions = {
      from: email,
      to: "musaibkm@gmail.com",
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact / Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Country:</strong> ${country || "N/A"}</p>
        <p><strong>Treatment:</strong> ${treatment || "N/A"}</p>
        <p><strong>Preferred Language:</strong> ${language || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});
// ----------------------
//  START SERVER
// ----------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
