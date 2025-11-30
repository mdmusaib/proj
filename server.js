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

  medicalProblems: {
    type: [
      {
        title: String,
        description: String
      }
    ],
    default: []
  },

  procedures: {
    type: [
      {
        title: String,
        description: String
      }
    ],
    default: []
  },

  faqs: {
    type: [
      {
        question: String,
        answer: String
      }
    ],
    default: []
  }
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
  specialties: String,
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
        name: name.trim()
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


app.get("/admin/seed-doctor", async (req, res) => {
  const doctors =[
  {
    "slug": "dr-manjinder-sandhu",
    "name": "Dr. (Col) Manjinder Sandhu",
    "specialty": "Interventional Cardiology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "35+ years",
    "image": "assets/upload/Dr. (Col) Manjinder Sandhu.png",
    "isTopDoctor": true,
    "position": "Principal Director - Cardiology",
    "degree": "MBBS | MD - Medicine | DNB | DM - Cardiology",
    "about": "Dr. (Col) Manjinder Sandhu is a renowned interventional cardiologist with over 35 years of clinical excellence. After a distinguished career in the Indian Army Medical Corps, he transitioned to civilian practice. He is highly skilled in complex angioplasty techniques such as IVUS, OCT, Rotablation, and Laser Angioplasty, as well as structural heart interventions including TAVR and MitraClip. A fellow of major international cardiac societies, he has authored several scientific papers and mentored young cardiologists for over two decades.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Blockages in heart arteries requiring stenting or intervention."
      },
      {
        "title": "Structural Heart Diseases",
        "description": "Valve diseases treated with TAVR, MitraClip and advanced procedures."
      },
      {
        "title": "Complex Coronary Lesions",
        "description": "Calcified and difficult-to-treat arterial blockages."
      },
      {
        "title": "Heart Failure & Rhythm Disorders",
        "description": "Comprehensive management of cardiac dysfunction."
      }
    ],
    "procedures": [
      {
        "title": "Complex Angioplasty",
        "description": "IVUS, OCT, Rotablation and Laser-assisted angioplasty."
      },
      {
        "title": "Structural Heart Procedures",
        "description": "TAVR, MitraClip and transcatheter valve interventions."
      },
      {
        "title": "Coronary Stenting",
        "description": "Advanced stent placement for blocked heart arteries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sandhu perform complex angioplasty?",
        "answer": "Yes, he is an expert in IVUS, OCT, Rotablation, and laser angioplasty."
      },
      {
        "question": "Is he experienced in structural heart procedures?",
        "answer": "Yes, he specializes in TAVR, MitraClip and minimally invasive valve therapy."
      },
      {
        "question": "Does he have military medical experience?",
        "answer": "Yes, he served with distinction in the Indian Army Medical Corps."
      }
    ]
  },
  {
    "slug": "dr-amit-javed",
    "name": "Dr. (Prof.) Amit Javed",
    "specialty": "GI, Bariatric & GI Onco Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "25+ years",
    "image": "assets/upload/Dr. (Prof.) Amit Javed.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director & HOD - LAP GI, GI Onco, Bariatric & MIS Surgery",
    "degree": "MBBS | MS - General Surgery (PGI Chandigarh) | MCh - GI Surgery (AIIMS) | FACS (USA)",
    "about": "Dr. Amit Javed is an internationally trained GI, GI Onco, and Bariatric surgeon with over 25 years of experience. He has previously worked at UCSF (USA), MSKCC New York, and GB Pant Hospital. Known for performing 1000+ surgeries annually, he is highly skilled in minimal access, robotic, cancer, and advanced hepatobiliary surgeries. He is an avid researcher with over 50 publications and has pioneered several innovative surgical techniques. Humble and patient-centric, he mentors numerous surgeons across India.",
    "medicalProblems": [
      {
        "title": "Gastrointestinal Cancers",
        "description": "Esophagus, stomach, pancreas, liver, colon cancers."
      },
      {
        "title": "Severe Obesity",
        "description": "Bariatric and metabolic surgery for weight loss."
      },
      {
        "title": "Gallbladder & Liver Diseases",
        "description": "Stones, tumors and hepatobiliary disorders."
      },
      {
        "title": "Complex GI Disorders",
        "description": "Reflux disease, hernias, colorectal issues."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic GI Surgery",
        "description": "Keyhole surgeries for GI and hepatobiliary diseases."
      },
      {
        "title": "Bariatric Surgery",
        "description": "Weight loss procedures including sleeve, bypass and revision surgery."
      },
      {
        "title": "GI Cancer Surgery",
        "description": "Advanced minimally invasive and robotic cancer operations."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Javed internationally trained?",
        "answer": "Yes, he has worked at UCSF and MSKCC New York."
      },
      {
        "question": "Does he specialize in bariatric surgery?",
        "answer": "Yes, he performs advanced metabolic and weight loss surgeries."
      },
      {
        "question": "Does he perform robotic surgeries?",
        "answer": "Yes, he is an expert in robotic GI and cancer surgery."
      }
    ]
  },
  {
    "slug": "dr-anil-mandhani",
    "name": "Dr. Anil Mandhani",
    "specialty": "Urology & Uro-Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "35+ years",
    "image": "assets/upload/Dr. Anil Mandhani.jpg",
    "isTopDoctor": true,
    "position": "Chairman - Urology",
    "degree": "MBBS | MS - Surgery | MCh - Urology | DNB - Urology | Fellowship - Robotic Urology (Cornell, New York)",
    "about": "Dr. Anil Mandhani is one of India\u2019s most respected urologists with over 35 years of experience. He has served at SGPGIMS Lucknow as well as top corporate hospitals. His expertise spans robotic uro-oncology, renal transplant, prostate surgery, and complex urological conditions. He has performed over 550+ robotic surgeries and 1000+ kidney transplants. Known for ethical, evidence-based care, he has authored impactful research and received numerous national and international awards.",
    "medicalProblems": [
      {
        "title": "Kidney & Ureter Disorders",
        "description": "Stones, strictures, tumors, and advanced urological conditions."
      },
      {
        "title": "Prostate Diseases",
        "description": "BPH, prostate cancer, and complex prostate concerns."
      },
      {
        "title": "Urological Cancers",
        "description": "Kidney, bladder, prostate and testicular cancers."
      },
      {
        "title": "Kidney Failure",
        "description": "Conditions requiring transplant surgery."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Uro-Oncology",
        "description": "Robotic prostatectomy, cystectomy, and kidney surgeries."
      },
      {
        "title": "Kidney Transplant",
        "description": "Living and deceased donor renal transplantation."
      },
      {
        "title": "Advanced Endourology",
        "description": "Laser and minimally invasive kidney stone management."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Mandhani an expert in robotic surgery?",
        "answer": "Yes, he has performed more than 550 robotic surgeries."
      },
      {
        "question": "Does he perform kidney transplants?",
        "answer": "Yes, he has performed over 1000 kidney transplants."
      },
      {
        "question": "Is he a researcher?",
        "answer": "Yes, he has several award-winning research contributions."
      }
    ]
  },
  {
    "slug": "dr-ankur-bahl",
    "name": "Dr. Ankur Bahl",
    "specialty": "Medical Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "15+ years",
    "image": "assets/upload/Dr. Ankur BAHL.webp",
    "isTopDoctor": true,
    "position": "Principal Director - Medical Oncology",
    "degree": "MBBS | MD - Medicine | DM - Medical Oncology",
    "about": "Dr. Ankur Bahl is a leading medical oncologist with over 15 years of experience. An alumnus of Maulana Azad Medical College and AIIMS, he specializes in immunotherapy, targeted therapy, chemotherapy, hormonal therapy, and palliative care. He has authored landmark Indian studies on targeted therapy and leukemia. A pioneer in oncology education platforms, he leads national tumor boards and master classes, and has mentored numerous oncology trainees.",
    "medicalProblems": [
      {
        "title": "Solid Tumors",
        "description": "Breast, lung, colon, ovarian and other cancers."
      },
      {
        "title": "Blood Cancers",
        "description": "Leukemia, lymphoma, myeloma and related malignancies."
      },
      {
        "title": "Metastatic Cancers",
        "description": "Advanced stage cancers requiring systemic therapy."
      },
      {
        "title": "Genetic & Immunologic Tumors",
        "description": "Cancers treated with immunotherapy and targeted therapy."
      }
    ],
    "procedures": [
      {
        "title": "Chemotherapy",
        "description": "Advanced drug therapy for cancer management."
      },
      {
        "title": "Immunotherapy",
        "description": "Immune-based treatments for solid and blood cancers."
      },
      {
        "title": "Targeted Therapy",
        "description": "Precision medicine for genetically-driven cancers."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Bahl specialize in immunotherapy?",
        "answer": "Yes, he is highly experienced in modern immuno-oncology treatments."
      },
      {
        "question": "Has he led major research studies?",
        "answer": "Yes, he is lead author of landmark Indian cancer data sets."
      },
      {
        "question": "Does he train oncology students?",
        "answer": "Yes, he mentors national and international oncology fellows."
      }
    ]
  },
  {
    "slug": "dr-arvind-khurana",
    "name": "Dr. Arvind Kumar Khurana",
    "specialty": "Gastroenterology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "35+ years",
    "image": "assets/upload/Dr. Arvind Kumar Khurana.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director - Gastroenterology",
    "degree": "MBBS | MD - Medicine | DNB | DM - Gastroenterology | FRCP (Ireland)",
    "about": "Dr. Arvind Khurana is one of India\u2019s most respected gastroenterologists with over 35 years of experience and more than 1,50,000 endoscopic procedures. He has performed over 25,000 CBD stone removals, 2,000 metallic stents, 2,000 PEG placements, and 900 PTBD procedures. He is renowned for advanced pancreaticobiliary endoscopy and neonatal/pediatric endoscopy. He frequently presents research, leads conferences, and contributes significantly to gastroenterology education.",
    "medicalProblems": [
      {
        "title": "Pancreatic & Biliary Diseases",
        "description": "Pancreatitis, CBD stones, cholangitis and strictures."
      },
      {
        "title": "Gastrointestinal Bleeding",
        "description": "Emergency and interventional endoscopic control."
      },
      {
        "title": "Esophageal & Stomach Disorders",
        "description": "Reflux, strictures and motility disorders."
      },
      {
        "title": "Liver Diseases",
        "description": "Hepatitis, cirrhosis and liver-related GI complications."
      }
    ],
    "procedures": [
      {
        "title": "Advanced Endoscopy",
        "description": "Diagnostic and therapeutic GI endoscopy."
      },
      {
        "title": "ERCP & Biliary Stenting",
        "description": "CBD stone removal, metallic stenting and pancreatic interventions."
      },
      {
        "title": "PEG & PTBD",
        "description": "Percutaneous feeding tubes and drainage procedures."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Khurana performed large volumes of endoscopies?",
        "answer": "Yes, over 1,50,000 procedures."
      },
      {
        "question": "Does he perform pediatric endoscopy?",
        "answer": "Yes, he is skilled in pediatric and neonatal endoscopy."
      },
      {
        "question": "Is he a researcher?",
        "answer": "Yes, he has published and presented several significant studies."
      }
    ]
  },
  {
    "slug": "dr-atul-kumar-mittal",
    "name": "Dr. Atul Kumar Mittal",
    "specialty": "ENT (Ear, Nose & Throat)",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "30+ years",
    "image": "assets/upload/Dr. Atul Kumar Mittal.jpg",
    "isTopDoctor": true,
    "position": "Principal Director - ENT",
    "degree": "MBBS | MS - ENT",
    "about": "Dr. Atul Kumar Mittal is a highly respected ENT surgeon with over 30 years of clinical and surgical excellence. As Principal Director of ENT at Fortis Gurgaon, he performs more than 800 surgeries annually. His expertise includes endoscopic sinus and skull base surgery, balloon sinuplasty, adenoidectomy, sleep surgery, thyroid and laryngeal surgery, and cochlear implantation. He is known for his precision, leadership, and contributions to ENT research and CMEs.",
    "medicalProblems": [
      {
        "title": "Chronic Sinusitis",
        "description": "Long-standing sinus infections requiring endoscopic treatment."
      },
      {
        "title": "Sleep Apnea & Snoring",
        "description": "Airway obstruction causing breathing issues during sleep."
      },
      {
        "title": "Thyroid & Laryngeal Disorders",
        "description": "Voice, airway and thyroid gland-related ENT issues."
      },
      {
        "title": "Pediatric ENT Issues",
        "description": "Adenoid, tonsil, ear infections and airway issues in children."
      }
    ],
    "procedures": [
      {
        "title": "Endoscopic Sinus & Skull Base Surgery",
        "description": "Minimally invasive surgery for chronic sinus and skull base problems."
      },
      {
        "title": "Balloon Sinuplasty",
        "description": "Advanced treatment for sinus blockage with minimal downtime."
      },
      {
        "title": "Sleep & Airway Surgery",
        "description": "Surgery for snoring, OSA, and airway correction."
      },
      {
        "title": "Cochlear Implant Surgery",
        "description": "Hearing restoration procedure for severe hearing loss."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mittal specialize in sinus surgery?",
        "answer": "Yes, he is an expert in endoscopic sinus and skull base surgery."
      },
      {
        "question": "Does he perform sleep apnea surgery?",
        "answer": "Yes, he performs advanced sleep and airway surgeries."
      },
      {
        "question": "Is he experienced in cochlear implants?",
        "answer": "Yes, he has extensive experience with cochlear implantation."
      }
    ]
  },
  {
    "slug": "dr-balkar-singh",
    "name": "Dr. Balkar Singh",
    "specialty": "Anaesthesiology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "30+ years",
    "image": "assets/upload/Dr. Balkar Singh.webp",
    "isTopDoctor": true,
    "position": "Principal Director - Anaesthesiology",
    "degree": "MBBS | MD - Anaesthesiology",
    "about": "Dr. Balkar Singh is a senior anaesthesiologist with over 27 years of experience across major hospitals in India, Nigeria, and Saudi Arabia. He has deep expertise in difficult airway management, critical care anaesthesia, and perioperative safety. He previously served as Head of Department at Primus Hospital (Nigeria) and Senior Consultant at Max Hospital Saket. He is recognized for his precision, leadership, and patient-focused care.",
    "medicalProblems": [
      {
        "title": "Difficult Airway Conditions",
        "description": "Complex airway cases requiring advanced anaesthetic management."
      },
      {
        "title": "High-Risk Surgical Cases",
        "description": "Anaesthesia for critical cardiac, neuro, trauma and transplant surgeries."
      },
      {
        "title": "Pain & Sedation Management",
        "description": "Acute and chronic pain requiring anaesthetic expertise."
      }
    ],
    "procedures": [
      {
        "title": "General & Regional Anaesthesia",
        "description": "Anaesthesia for all types of surgeries including high-risk cases."
      },
      {
        "title": "Difficult Airway Management",
        "description": "Specialized airway procedures for complex situations."
      },
      {
        "title": "Critical Care Anaesthesia",
        "description": "Anaesthetic support for ICU and life-threatening emergencies."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Balkar Singh manage difficult airways?",
        "answer": "Yes, he is highly experienced in difficult airway management."
      },
      {
        "question": "Has he worked internationally?",
        "answer": "Yes, in Nigeria and Saudi Arabia besides top Indian hospitals."
      },
      {
        "question": "Does he handle high-risk surgeries?",
        "answer": "Yes, he routinely manages anaesthesia for complex surgeries."
      }
    ]
  },
  {
    "slug": "dr-gourdas-choudhuri",
    "name": "Dr. (Prof.) Gourdas Choudhuri",
    "specialty": "Gastroenterology & Hepatobiliary Sciences",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "42+ years",
    "image": "assets/upload/Dr. Gourdas Choudhuri.jpg",
    "isTopDoctor": true,
    "position": "Chairman - Gastroenterology & Hepatobiliary Sciences",
    "degree": "MBBS | MD - Medicine | DM - Gastroenterology | FACG | FICP | FAMS | FRCPI",
    "about": "Dr. (Prof.) Gourdas Choudhuri is a nationally eminent gastroenterologist with over 42 years of experience. He is the first in India to introduce Endoscopic Ultrasound (EUS) and ESWL for biliary stones. Previously heading SGPGIMS Lucknow, he transformed it into one of India's top GI centers. With over 200 scientific publications, multiple awards, and leadership roles in national societies, he is globally recognized for liver and digestive disease care and advanced endoscopy.",
    "medicalProblems": [
      {
        "title": "Liver Diseases",
        "description": "Cirrhosis, hepatitis, fatty liver and chronic liver disorders."
      },
      {
        "title": "Pancreatic Disorders",
        "description": "Acute and chronic pancreatitis, pancreatic tumors."
      },
      {
        "title": "Biliary Tract Diseases",
        "description": "Bile duct stones, strictures, and cholangitis."
      },
      {
        "title": "GI Cancers",
        "description": "Stomach, esophageal, pancreatic, and colorectal cancers."
      }
    ],
    "procedures": [
      {
        "title": "Endoscopic Ultrasound (EUS)",
        "description": "Advanced imaging for pancreas, bile ducts, and GI lesions."
      },
      {
        "title": "ESWL for Biliary Stones",
        "description": "Shockwave lithotripsy for bile duct stone removal."
      },
      {
        "title": "Advanced Therapeutic Endoscopy",
        "description": "EGD, ERCP, colonoscopy and pancreaticobiliary interventions."
      }
    ],
    "faqs": [
      {
        "question": "Did Dr. Choudhuri introduce EUS in India?",
        "answer": "Yes, he was the first to bring EUS to India."
      },
      {
        "question": "Is he involved in research?",
        "answer": "Yes, he has over 200 scientific publications."
      },
      {
        "question": "Does he treat complex liver diseases?",
        "answer": "Yes, he is a national leader in hepatology and complex GI care."
      }
    ]
  },
  {
    "slug": "dr-krishan-chugh",
    "name": "Dr. Krishan Chugh",
    "specialty": "Paediatrics & Paediatric Pulmonology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "32+ years",
    "image": "assets/upload/Dr. Krishan Chugh.avif",
    "isTopDoctor": true,
    "position": "Principal Director & HOD - Pediatrics",
    "degree": "MBBS | MD - Paediatrics",
    "about": "Dr. Krishan Chugh is one of Asia\u2019s most distinguished pediatricians, and a pioneer in pediatric pulmonology and interventional bronchoscopy in India. He established the first PICU in India at Kalawati Saran Hospital and later the first private PICU at Sir Ganga Ram Hospital. At FMRI, he leads one of the region\u2019s most advanced PICUs and is revered for training hundreds of pediatricians across India. He is widely published, internationally invited, and a leading voice in child health.",
    "medicalProblems": [
      {
        "title": "Paediatric Respiratory Diseases",
        "description": "Asthma, pneumonia, airway disorders and chronic lung issues."
      },
      {
        "title": "Neonatal & Paediatric Infections",
        "description": "Serious infections requiring PICU care."
      },
      {
        "title": "Allergy & Pediatric Pulmonology Disorders",
        "description": "Allergic airway diseases, chronic cough, bronchial issues."
      },
      {
        "title": "Critical Care Conditions",
        "description": "Life-threatening conditions requiring PICU management."
      }
    ],
    "procedures": [
      {
        "title": "Paediatric Bronchoscopy",
        "description": "Diagnostic and interventional bronchoscopy for children."
      },
      {
        "title": "PICU Critical Care Management",
        "description": "Advanced paediatric intensive care."
      },
      {
        "title": "Respiratory Support Procedures",
        "description": "Ventilation, airway support, and emergency paediatric care."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Chugh a pioneer in pediatric bronchoscopy?",
        "answer": "Yes, he introduced and advanced pediatric bronchoscopy in India."
      },
      {
        "question": "Does he lead a PICU?",
        "answer": "Yes, he heads the PICU at Fortis Gurgaon."
      },
      {
        "question": "Does he teach pediatricians?",
        "answer": "Yes, he has trained numerous pediatricians across India."
      }
    ]
  },
  {
    "slug": "dr-manoj-kumar-goel",
    "name": "Dr. Manoj Kumar Goel",
    "specialty": "Pulmonology & Sleep Medicine",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "32+ years",
    "image": "assets/upload/Dr. Manoj Kumar Goel.png",
    "isTopDoctor": true,
    "position": "Principal Director & Unit Head - Pulmonology & Sleep Medicine",
    "degree": "MBBS | MD - Respiratory Medicine | FCCP | DIP | FIAB | FISDA | FICM | FISM | FICCM",
    "about": "Dr. Manoj Kumar Goel is a senior pulmonologist and sleep medicine expert with over 32 years of experience. He is one of the earliest pioneers of non-invasive ventilation and sleep medicine in India. Trained internationally in France, Belgium, and Australia, he specializes in bronchoscopy, EBUS, cryobiopsy, thoracoscopy, and airway stenting. He has served as a faculty and chairperson at major national conferences and received several national awards for excellence in pulmonary intervention.",
    "medicalProblems": [
      {
        "title": "Chronic Lung Diseases",
        "description": "Asthma, COPD, ILD and long-term respiratory disorders."
      },
      {
        "title": "Sleep Disorders",
        "description": "Sleep apnea, insomnia, and sleep-disordered breathing."
      },
      {
        "title": "Airway Issues",
        "description": "Airway narrowing, tracheal disorders and respiratory obstruction."
      },
      {
        "title": "Critical Pulmonary Diseases",
        "description": "Severe lung infections, ARDS and ICU-based respiratory failure."
      }
    ],
    "procedures": [
      {
        "title": "Bronchoscopy & EBUS",
        "description": "Advanced bronchoscopic and ultrasound-guided lung procedures."
      },
      {
        "title": "Cryobiopsy",
        "description": "Tissue biopsy using cryotechnology for ILD and lung lesions."
      },
      {
        "title": "Medical Thoracoscopy",
        "description": "Minimally invasive procedure for pleural disorders."
      },
      {
        "title": "Airway Stenting",
        "description": "Stent placement for airway narrowing or obstruction."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Goel trained internationally?",
        "answer": "Yes, in France, Belgium, and Australia."
      },
      {
        "question": "Does he specialize in EBUS & Cryobiopsy?",
        "answer": "Yes, he is an expert in both procedures."
      },
      {
        "question": "Is he a pioneer in sleep medicine?",
        "answer": "Yes, he helped introduce sleep medicine in India."
      }
    ]
  },
  {
    "slug": "dr-nitesh-rohatgi",
    "name": "Dr. Nitesh Rohatgi",
    "specialty": "Medical Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "15+ years",
    "image": "assets/upload/Dr. Nitesh Rohatgi.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director - Medical Oncology",
    "degree": "MBBS | DNB | MNAMS | M.Med (Dundee, UK) | CCT (Leeds, UK) | MRCP (London) | FRCP (Edinburgh) | FRSM (London)",
    "about": "Dr. Nitesh Rohatgi is a senior medical oncologist with extensive international experience, previously practicing at the renowned London Oncology Clinic, Harley Street. He is a fellow of the Royal College of Physicians (UK) and Royal Society of Medicine. With a strong academic record, he has led multiple clinical trials, contributed significantly to oncology research, and is considered a key opinion leader in India. He specializes in solid organ cancers and precision oncology.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Comprehensive medical oncology treatment protocols."
      },
      {
        "title": "Lung Cancer",
        "description": "Targeted therapy, immunotherapy and chemotherapy."
      },
      {
        "title": "Gastrointestinal Cancers",
        "description": "Stomach, colon, liver and pancreatic cancers."
      },
      {
        "title": "Gynecologic & Urologic Cancers",
        "description": "Ovarian, kidney, bladder, and prostate cancers."
      },
      {
        "title": "Brain Tumors & Head-Neck Cancers",
        "description": "Advanced systemic oncology care."
      }
    ],
    "procedures": [
      {
        "title": "Chemotherapy",
        "description": "Modern chemotherapy protocols for solid tumors."
      },
      {
        "title": "Immunotherapy",
        "description": "Immune-based cancer treatments including checkpoint inhibitors."
      },
      {
        "title": "Targeted Therapy",
        "description": "Personalized treatment based on genetic & molecular profiling."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Rohatgi trained internationally?",
        "answer": "Yes, he completed medical oncology training in the UK and worked at Harley Street, London."
      },
      {
        "question": "Does he specialize in immunotherapy?",
        "answer": "Yes, he has extensive experience in immunotherapy and targeted oncology."
      },
      {
        "question": "Is he involved in clinical trials?",
        "answer": "Yes, he is a Principal Investigator for national and international oncology trials."
      }
    ]
  },
  {
    "slug": "dr-parul-maheshwari-sharma",
    "name": "Dr. Parul Maheshwari Sharma",
    "specialty": "Ophthalmology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "25+ years",
    "image": "assets/upload/Dr. Parul Maheshwari Sharma.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director & HOD - Ophthalmology",
    "degree": "MBBS | MS | DNB | MNAMS | FICO",
    "about": "Dr. Parul M Sharma is a highly accomplished ophthalmologist with 25+ years of experience. She is trained at top global institutes including Moorfields Eye Hospital (London), LV Prasad Eye Institute (Hyderabad), and Singapore National Eye Centre. She specializes in glaucoma, advanced cataract surgery, refractive procedures like FEMTO bladeless LASIK, PRK, Phakic ICL, squint surgery, keratoconus management, and pediatric ophthalmology. She has received multiple awards including VN Raizada Award and Dr. AC Agarwal Trophy.",
    "medicalProblems": [
      {
        "title": "Glaucoma",
        "description": "Progressive optic nerve damage requiring specialized care."
      },
      {
        "title": "Cataract",
        "description": "Age-related lens opacity requiring surgical correction."
      },
      {
        "title": "Refractive Errors",
        "description": "Myopia, hyperopia and astigmatism requiring laser correction."
      },
      {
        "title": "Keratoconus",
        "description": "Corneal thinning and protrusion affecting vision."
      }
    ],
    "procedures": [
      {
        "title": "FEMTO Bladeless Cataract Surgery",
        "description": "Advanced micro-incision cataract surgery."
      },
      {
        "title": "LASIK / PRK / ICL",
        "description": "Refractive correction using modern laser techniques."
      },
      {
        "title": "Pediatric Eye Surgery",
        "description": "Squint correction and anterior segment surgeries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sharma perform bladeless cataract surgery?",
        "answer": "Yes, she specializes in FEMTO bladeless micro-phaco cataract surgery."
      },
      {
        "question": "Does she treat glaucoma?",
        "answer": "Yes, she has extensive experience in glaucoma management."
      },
      {
        "question": "Is she internationally trained?",
        "answer": "Yes, she trained at Moorfields London, LVPEI, and SNEC."
      }
    ]
  },
  {
    "slug": "dr-rahul-bhargava",
    "name": "Dr. Rahul Bhargava",
    "specialty": "Hematology, Hemato-Oncology & Bone Marrow Transplant",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "15+ years",
    "image": "assets/upload/Dr. Rahul Bhargava.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director & Chief - Hematology, Hemato-Oncology & BMT",
    "degree": "MBBS | MD - Medicine | DM - Clinical Haematology",
    "about": "Dr. Rahul Bhargava is one of India\u2019s leading hematologists and bone marrow transplant specialists. With over 1500+ stem cell transplants completed, he is credited with establishing 10 low-cost BMT centers across India. He performed India's first MS stem cell transplant in 2016. Widely recognized for community hematology initiatives and large-scale anemia and thalassemia awareness programs, he is regarded as a pioneer in BMT and clinical hematology.",
    "medicalProblems": [
      {
        "title": "Leukemia & Blood Cancers",
        "description": "Acute and chronic blood cancers requiring specialized treatment."
      },
      {
        "title": "Thalassemia & Aplastic Anemia",
        "description": "Severe blood disorders requiring BMT evaluation."
      },
      {
        "title": "Lymphomas & Myeloma",
        "description": "Advanced systemic hematologic cancers."
      },
      {
        "title": "Multiple Sclerosis (MS)",
        "description": "Autoimmune neurological condition treated via stem cell transplant."
      }
    ],
    "procedures": [
      {
        "title": "Bone Marrow Transplant (BMT)",
        "description": "Over 1500+ successful transplants including haploidentical and unrelated donor."
      },
      {
        "title": "Stem Cell Transplant for MS",
        "description": "First in India to perform and promote this treatment."
      },
      {
        "title": "Chemotherapy for Hematologic Cancers",
        "description": "Protocol-based treatment for blood cancers."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Bhargava performed many BMTs?",
        "answer": "Yes, he has performed over 1500 bone marrow transplants."
      },
      {
        "question": "Does he treat thalassemia?",
        "answer": "Yes, he is a leading expert in thalassemia and community hematology."
      },
      {
        "question": "Is he known for MS stem cell transplants?",
        "answer": "Yes, he performed India's first MS stem cell transplant."
      }
    ]
  },
  {
    "slug": "dr-rakesh-kumar-gupta",
    "name": "Dr. Rakesh Kumar Gupta",
    "specialty": "Radiology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "35+ years",
    "image": "assets/upload/Dr. Rakesh Kumar Gupta.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director - Radiology",
    "degree": "MD - Radiology",
    "about": "Dr. Rakesh Kumar Gupta is a senior radiologist with expertise in advanced MR imaging and MR spectroscopy for neurological and non-neurological disorders. With over 35 years of clinical excellence across India\u2019s top institutions, he has authored numerous scientific publications and is an active member of leading radiology societies. He is widely respected for his diagnostic accuracy and leadership in modern imaging techniques.",
    "medicalProblems": [
      {
        "title": "Neurological Conditions",
        "description": "Stroke, tumors, seizures and brain disorders diagnosed via MRI."
      },
      {
        "title": "Musculoskeletal Disorders",
        "description": "Joint, ligament, bone and spine evaluations."
      },
      {
        "title": "Abdominal & Pelvic Diseases",
        "description": "Liver, kidney, pancreatic and reproductive organ imaging."
      }
    ],
    "procedures": [
      {
        "title": "MRI & MR Spectroscopy",
        "description": "Advanced imaging for neurological & systemic diseases."
      },
      {
        "title": "CT Scan & Ultrasound",
        "description": "High-precision diagnostic imaging."
      },
      {
        "title": "Interventional Radiology Support",
        "description": "Imaging guidance for minimally invasive procedures."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Gupta an expert in MR spectroscopy?",
        "answer": "Yes, he is a leading expert in MR spectroscopy in India."
      },
      {
        "question": "Does he diagnose neurological disorders?",
        "answer": "Yes, with advanced MRI techniques."
      },
      {
        "question": "Is he widely published?",
        "answer": "Yes, he has numerous national and international publications."
      }
    ]
  },
  {
    "slug": "dr-rama-joshi",
    "name": "Dr. Rama Joshi",
    "specialty": "Gynaecologic Oncology & Robotic Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "30+ years",
    "image": "assets/upload/Dr. Rama Joshi.jpeg",
    "isTopDoctor": true,
    "position": "Chairman - Gynae Oncology & Robotic Surgery",
    "degree": "MBBS (Gold Medalist) | MS (Gynae & Obstetrics) | Fellow - Gynae Oncology (TMH Mumbai) | UICC Fellow (USA)",
    "about": "Dr. Rama Joshi is a distinguished gynecologic oncologist and robotic surgeon with 30+ years of expertise. She has performed all major radical surgeries for gynecologic cancers and is among India\u2019s leading robotic gynae-onco surgeons. Trained at Tata Memorial Hospital, University of Michigan, and University of Lyon, she is known for excellence in cancer surgery, research, and robotic technology. She has received several national awards for her contributions to women\u2019s cancer care.",
    "medicalProblems": [
      {
        "title": "Cervical Cancer",
        "description": "Comprehensive oncological and surgical management."
      },
      {
        "title": "Ovarian Cancer",
        "description": "Advanced staging, cytoreductive and robotic surgeries."
      },
      {
        "title": "Endometrial Cancer",
        "description": "Minimally invasive and robotic treatment options."
      },
      {
        "title": "Vulvar & Vaginal Cancers",
        "description": "Complex radical surgeries for rare gynecological cancers."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Cancer Surgery",
        "description": "Minimally invasive robotic procedures for gynecologic cancers."
      },
      {
        "title": "Radical Hysterectomy",
        "description": "Advanced surgical removal for cervical and uterine cancers."
      },
      {
        "title": "Cytoreductive & Debulking Surgery",
        "description": "Maximal tumor removal in ovarian cancer."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Joshi a robotic surgery expert?",
        "answer": "Yes, she has over 10 years of experience in robotic gynae-onco surgery."
      },
      {
        "question": "Has she trained internationally?",
        "answer": "Yes, in the USA and France including da Vinci robotic training in California."
      },
      {
        "question": "Does she treat all gynae cancers?",
        "answer": "Yes, she specializes in cervical, ovarian, uterine, vulvar and vaginal cancers."
      }
    ]
  },
  {
    "slug": "dr-rana-patir",
    "name": "Dr. Rana Patir",
    "specialty": "Neurosurgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "32+ years",
    "image": "assets/upload/Dr. Rana Patir.jpg",
    "isTopDoctor": true,
    "position": "Chairman - Neurosurgery",
    "degree": "MS - General Surgery | MCh - Neurosurgery | Fellowship - Neurosurgery (UK)",
    "about": "Dr. Rana Patir is one of India\u2019s most respected neurosurgeons with over 32 years of experience and more than 10,000 neurological procedures. He has been faculty at AIIMS, Sir Ganga Ram Hospital, and Professor of Neurosurgery at Guwahati Medical College. He specializes in minimally invasive brain and spine surgery, skull base surgery, neurovascular surgery, EC-IC bypass, pediatric neurosurgery, and epilepsy surgery.",
    "medicalProblems": [
      {
        "title": "Brain Tumors",
        "description": "Benign and malignant brain tumors requiring advanced neurosurgery."
      },
      {
        "title": "Spine Disorders",
        "description": "Herniated discs, spinal stenosis and spinal cord compression."
      },
      {
        "title": "Neurovascular Conditions",
        "description": "Aneurysms, AVMs and vascular malformations."
      },
      {
        "title": "Pediatric Neurological Disorders",
        "description": "Congenital and acquired brain and spine conditions in children."
      }
    ],
    "procedures": [
      {
        "title": "Minimally Invasive Brain & Spine Surgery",
        "description": "Advanced keyhole neurosurgical techniques."
      },
      {
        "title": "Skull Base Surgery",
        "description": "Complex surgeries for deep-seated brain tumors."
      },
      {
        "title": "EC-IC Bypass Surgery",
        "description": "Revascularization procedure for cerebrovascular disease."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Patir performed many neurosurgeries?",
        "answer": "Yes, he has performed more than 10,000 neurosurgical procedures."
      },
      {
        "question": "Does he specialize in minimally invasive neurosurgery?",
        "answer": "Yes, it is one of his key areas of expertise."
      },
      {
        "question": "Has he worked internationally?",
        "answer": "Yes, he completed fellowship training in the UK."
      }
    ]
  },
  {
    "slug": "dr-sandeep-vaishya",
    "name": "Dr. Sandeep Vaishya",
    "specialty": "Neurosurgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "30+ years",
    "image": "assets/upload/Dr. SANDEEP VAISHYA.jpeg",
    "isTopDoctor": true,
    "position": "Executive Director & HOD - Neurosurgery",
    "degree": "MBBS | MS - General Surgery | MCh - Neurosurgery | Sundt Fellowship (Mayo Clinic, USA)",
    "about": "Dr. Sandeep Vaishya is a globally renowned neurosurgeon with 30+ years of experience. He is an awardee of the prestigious Sundt Fellowship from Mayo Clinic, USA, and has served as faculty at AIIMS. With more than 150 publications and two textbooks to his credit, he is considered among India\u2019s finest experts in neurological and spine surgery.",
    "medicalProblems": [
      {
        "title": "Brain Tumors & Neuro-Oncology",
        "description": "Advanced treatment of malignant and benign brain tumors."
      },
      {
        "title": "Spine Disorders",
        "description": "Degenerative spine disease, deformities and trauma."
      },
      {
        "title": "Peripheral Nerve Disorders",
        "description": "Nerve compression, injury and neuropathies."
      },
      {
        "title": "Functional Neurosurgery",
        "description": "Parkinson\u2019s disease, epilepsy and movement disorders."
      }
    ],
    "procedures": [
      {
        "title": "Microsurgery for Brain Tumors",
        "description": "Precision tumor removal using advanced microsurgical techniques."
      },
      {
        "title": "Minimally Invasive Spine Surgery",
        "description": "Endoscopic and MIS solutions for spine issues."
      },
      {
        "title": "Functional & Stereotactic Surgery",
        "description": "Deep brain stimulation and epilepsy surgery."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Vaishya internationally trained?",
        "answer": "Yes, he completed the prestigious Sundt Fellowship at Mayo Clinic."
      },
      {
        "question": "Does he treat spine disorders?",
        "answer": "Yes, he is highly experienced in spine surgery."
      },
      {
        "question": "Does he perform tumor surgery?",
        "answer": "Yes, he is an expert in brain tumor and neuro-oncology surgery."
      }
    ]
  },
  {
    "slug": "dr-udgeath-dhir",
    "name": "Dr. Udgeath Dhir",
    "specialty": "Cardiothoracic & Vascular Surgery (CTVS)",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "18+ years",
    "image": "assets/upload/Dr. Udgeath Dhir.jpg",
    "isTopDoctor": true,
    "position": "Principal Director - Cardiothoracic & Vascular Surgery",
    "degree": "MBBS | MS | MCh - Cardiac Surgery",
    "about": "Dr. Udgeath Dhir is a leading CTVS surgeon with over 7500 surgeries performed. He is formally trained in rheumatic mitral valve repair in Bangkok and advanced TAVI procedures. With experience at Escorts Heart Institute and Medanta, he specializes in minimally invasive cardiac, valvular, coronary, congenital heart surgery and heart failure management. He has multiple publications and has received prestigious international awards.",
    "medicalProblems": [
      {
        "title": "Heart Valve Diseases",
        "description": "Mitral, aortic and tricuspid valve disorders requiring surgical repair."
      },
      {
        "title": "Coronary Artery Disease",
        "description": "Blockages requiring bypass surgery."
      },
      {
        "title": "Congenital Heart Defects",
        "description": "Birth-related cardiac structural abnormalities."
      },
      {
        "title": "Heart Failure Conditions",
        "description": "Advanced surgical and device-based treatment."
      }
    ],
    "procedures": [
      {
        "title": "Total Arterial Bypass Surgery",
        "description": "Advanced CABG using arterial grafts."
      },
      {
        "title": "Minimally Invasive Valve Surgery",
        "description": "Small-incision valve repair and replacement."
      },
      {
        "title": "TAVI & Structural Heart Procedures",
        "description": "Transcatheter valve interventions."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Dhir performed many cardiac surgeries?",
        "answer": "Yes, over 7500 cardiac surgeries to date."
      },
      {
        "question": "Does he specialize in minimally invasive surgery?",
        "answer": "Yes, including minimally invasive valve and coronary surgeries."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, in Bangkok for valve repair and advanced TAVI."
      }
    ]
  },
  {
    "slug": "dr-vedant-kabra",
    "name": "Dr. Vedant Kabra",
    "specialty": "Surgical Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "25+ years",
    "image": "assets/upload/Dr. Vedant Kabra.png",
    "isTopDoctor": true,
    "position": "Principal Director - Surgical Oncology",
    "degree": "MBBS | MS | DNB | MRCS (Edinburgh) | MNAMS | FIAGES",
    "about": "Dr. Vedant Kabra is a leading surgical oncologist with 25+ years of experience and over 12,000 cancer surgeries. He trained at Tata Memorial Hospital, Mumbai and National Cancer Centre, Singapore. He is highly skilled in complex oncosurgical and robotic cancer procedures. Dr. Kabra is known for his academic excellence, awareness initiatives, and leadership of tobacco cessation programs in Haryana through the VoTV movement.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Surgical and reconstructive management."
      },
      {
        "title": "Gastrointestinal Cancers",
        "description": "Stomach, colon, liver and pancreatic malignancies."
      },
      {
        "title": "Head & Neck Cancers",
        "description": "Thyroid, oral cavity and throat cancers."
      },
      {
        "title": "Gynecologic & Urologic Cancers",
        "description": "Ovarian, uterine, kidney and bladder cancers."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Cancer Surgery",
        "description": "Advanced minimally invasive cancer procedures."
      },
      {
        "title": "Complex Oncosurgery",
        "description": "Surgical treatment for advanced and rare cancers."
      },
      {
        "title": "Reconstructive Surgery",
        "description": "Reconstruction after cancer resection."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Kabra performed many cancer surgeries?",
        "answer": "Yes, more than 12,000 surgical oncology procedures."
      },
      {
        "question": "Does he perform robotic surgery?",
        "answer": "Yes, he is an expert in robotic cancer surgery."
      },
      {
        "question": "Is he active in cancer awareness?",
        "answer": "Yes, he leads major awareness drives and tobacco cessation campaigns."
      }
    ]
  },
  {
    "slug": "dr-vikas-dua",
    "name": "Dr. Vikas Dua",
    "specialty": "Paediatric Hematology, Hemato-Oncology & Bone Marrow Transplant",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "15+ years",
    "image": "assets/upload/Dr. Vikas Dua.jpeg",
    "isTopDoctor": true,
    "position": "Principal Director & Head - Pediatric Hematology, Hemato-Oncology & BMT",
    "degree": "MBBS | MD - Paediatrics | FNB - Paediatric Hematology Oncology",
    "about": "Dr. Vikas Dua is a leading pediatric hemato-oncologist and BMT specialist, known for outstanding results in pediatric transplants. With over 1000+ transplants performed, including rare unrelated and haploidentical cases, he is considered among India\u2019s best pediatric BMT experts. He is highly regarded for his success rates and for performing rare procedures unmatched in India.",
    "medicalProblems": [
      {
        "title": "Pediatric Blood Cancers",
        "description": "Leukemia, lymphoma and other childhood malignancies."
      },
      {
        "title": "Thalassemia & Aplastic Anemia",
        "description": "Advanced transplant-based treatment."
      },
      {
        "title": "Primary Immunodeficiency",
        "description": "Severe immune disorders requiring BMT."
      },
      {
        "title": "Benign Pediatric Hematology",
        "description": "Anemia, bleeding disorders and platelet conditions."
      }
    ],
    "procedures": [
      {
        "title": "Pediatric Bone Marrow Transplant",
        "description": "Over 1000+ successful matched and haploidentical BMTs."
      },
      {
        "title": "Stem Cell Transplant",
        "description": "Advanced transplant procedures for benign & malignant diseases."
      },
      {
        "title": "Chemotherapy for Pediatric Cancers",
        "description": "Protocol-based treatment for children."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Dua performed many pediatric BMTs?",
        "answer": "Yes, he has completed over 1000+ transplants."
      },
      {
        "question": "Does he treat thalassemia?",
        "answer": "Yes, he is one of India\u2019s top experts in thalassemia treatment."
      },
      {
        "question": "Does he perform haploidentical transplants?",
        "answer": "Yes, he is known for pioneering results in pediatric haploidentical transplants."
      }
    ]
  },
  {
    "slug": "dr-vinod-raina",
    "name": "Dr. Vinod Raina",
    "specialty": "Medical Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "40+ years",
    "image": "assets/upload/Dr. Vinod Raina.png",
    "isTopDoctor": true,
    "position": "Chairman - Oncosciences",
    "degree": "MBBS | MD (AIIMS) | MRCP (UK) | FRCP (Edinburgh & London) | FAMS",
    "about": "Dr. Vinod Raina is one of India's most eminent medical oncologists with over 40 years of experience. Former Professor & Head of Medical Oncology at AIIMS, he has treated thousands of cancer patients and personally performed around 400 bone marrow/stem cell transplants. He has been the Principal Investigator for nearly 50 clinical research projects at AIIMS and co-founded the INDOX network. He is regarded as a powerhouse of oncology expertise and has mentored over 70 oncologists now practicing worldwide.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Advanced medical and targeted therapy management."
      },
      {
        "title": "Lung Cancer",
        "description": "Immunotherapy, chemotherapy and precision oncology."
      },
      {
        "title": "GI & Hepatobiliary Cancers",
        "description": "Colon, stomach, liver and pancreatic malignancies."
      },
      {
        "title": "Lymphomas & Myelomas",
        "description": "Expert management of hematological cancers."
      }
    ],
    "procedures": [
      {
        "title": "Chemotherapy & Targeted Therapy",
        "description": "Protocol-based cancer treatment."
      },
      {
        "title": "Immunotherapy",
        "description": "Advanced immune-modulating cancer treatment."
      },
      {
        "title": "Bone Marrow / Stem Cell Transplant",
        "description": "Performed ~400 transplants personally."
      }
    ],
    "faqs": [
      {
        "question": "Did Dr. Raina work at AIIMS?",
        "answer": "Yes, he was Professor & Head of Medical Oncology at AIIMS."
      },
      {
        "question": "Does he specialize in breast cancer?",
        "answer": "Yes, it is one of his key areas of expertise."
      },
      {
        "question": "Has he led clinical research?",
        "answer": "Yes, he was PI for ~50 projects and co-founded the INDOX network."
      }
    ]
  },
  {
    "slug": "dr-vivek-vij",
    "name": "Dr. Vivek Vij",
    "specialty": "Liver Transplant & Hepatobiliary Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "25+ years",
    "image": "assets/upload/Dr. Vivek Vij.jpeg",
    "isTopDoctor": true,
    "position": "Chairman - Liver Transplant & Hepatobiliary Sciences",
    "degree": "MBBS | MS | MRCS (Edinburgh) | DNB",
    "about": "Dr. Vivek Vij is a globally acclaimed liver transplant surgeon with more than 4000+ liver transplants and a 97% patient success rate. He is credited with pioneering living donor liver transplant surgery in India and maintaining a 100% donor safety record. Honored internationally, including a special award from ILTS (Chicago), he has contributed over 50+ scientific papers and trains surgeons through structured fellowship programs.",
    "medicalProblems": [
      {
        "title": "Liver Cirrhosis",
        "description": "End-stage liver disease evaluation and transplant."
      },
      {
        "title": "Liver Failure",
        "description": "Acute and chronic liver failure requiring transplant guidance."
      },
      {
        "title": "Hepatitis B & C",
        "description": "Advanced antiviral and transplant-focused management."
      },
      {
        "title": "Liver Cancer (HCC)",
        "description": "Surgical and transplant-based treatment."
      }
    ],
    "procedures": [
      {
        "title": "Living Donor Liver Transplant",
        "description": "Pioneering expertise with world-class success rates."
      },
      {
        "title": "Cadaveric Liver Transplant",
        "description": "High-volume complex transplant procedures."
      },
      {
        "title": "Hepatobiliary Surgery",
        "description": "Tumor removal, bile duct surgery and reconstruction."
      }
    ],
    "faqs": [
      {
        "question": "How many liver transplants has Dr. Vij performed?",
        "answer": "Over 4000+ successful liver transplants."
      },
      {
        "question": "Is he internationally trained?",
        "answer": "Yes, including the prestigious Roche Preceptorship in the USA."
      },
      {
        "question": "Is he known for donor safety?",
        "answer": "Yes, he formalized protocols achieving 100% donor safety."
      }
    ]
  },
  {
    "slug": "dr-amitabh-parti",
    "name": "Dr. Amitabh Parti",
    "specialty": "Internal Medicine",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "32+ years",
    "image": "assets/upload/Dr. Amitabh Parti.png",
    "isTopDoctor": true,
    "position": "Senior Director & Unit Head - Internal Medicine",
    "degree": "MBBS (Gold Medalist) | MD - Internal Medicine",
    "about": "Dr. Amitabh Parti is a senior internal medicine specialist with 32+ years of clinical expertise in managing complex medical conditions including cardiac, pulmonary, metabolic, and infectious diseases. He is known for his excellence in corporate healthcare, emergency triage management, and comprehensive chronic disease care. He also serves as an empanelled physician for several major corporates across India.",
    "medicalProblems": [
      {
        "title": "Cardiometabolic Diseases",
        "description": "Hypertension, diabetes, hyperlipidemia and heart-related conditions."
      },
      {
        "title": "Respiratory Disorders",
        "description": "Asthma, COPD and common infections."
      },
      {
        "title": "Tropical & Infectious Diseases",
        "description": "Dengue, malaria, typhoid and viral illnesses."
      },
      {
        "title": "General Internal Medicine",
        "description": "Chronic lifestyle diseases and preventive care."
      }
    ],
    "procedures": [
      {
        "title": "Comprehensive Medical Evaluation",
        "description": "Diagnosis and long-term management of systemic illnesses."
      },
      {
        "title": "Corporate Health Programs",
        "description": "Surveillance, emergency care, annual screenings."
      },
      {
        "title": "Chronic Disease Management",
        "description": "Diabetes, cardiac, respiratory and lifestyle disorders."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Parti experienced in complex inpatient care?",
        "answer": "Yes, he has decades of experience managing critical medical cases."
      },
      {
        "question": "Does he manage diabetes & cardiac diseases?",
        "answer": "Yes, these are major areas of expertise."
      },
      {
        "question": "Does he handle corporate health programs?",
        "answer": "Yes, he oversees large-scale corporate medical requirements."
      }
    ]
  },
  {
    "slug": "dr-anil-kumar-anand",
    "name": "Dr. Anil Kumar Anand",
    "specialty": "Radiation Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "31+ years",
    "image": "assets/upload/Dr. Anil Kumar Anand.jpeg",
    "isTopDoctor": true,
    "position": "Senior Director & HOD - Radiation Oncology",
    "degree": "MBBS | MD - Radiotherapy & Oncology",
    "about": "Dr. Anil Kumar Anand is a senior radiation oncologist with 31+ years of experience. An alumnus of PGI Chandigarh, he has received specialized training at New York Hospital Medical Center and Middlesex Hospital, London. He has led radiation oncology departments at multiple reputed institutions and has contributed significantly to scientific research, especially in stereotactic body radiation therapy (SBRT).",
    "medicalProblems": [
      {
        "title": "Head & Neck Cancers",
        "description": "Advanced radiotherapy and organ-preserving treatments."
      },
      {
        "title": "Breast Cancer",
        "description": "Modern radiation protocols for early and advanced disease."
      },
      {
        "title": "Lung & GI Cancers",
        "description": "Targeted radiation using precision technologies."
      },
      {
        "title": "Prostate & Pelvic Tumors",
        "description": "Image-guided radiotherapy and SBRT."
      }
    ],
    "procedures": [
      {
        "title": "IMRT / IGRT",
        "description": "Precision-targeted radiation therapy."
      },
      {
        "title": "SBRT",
        "description": "Stereotactic body radiation for recurrent and complex tumors."
      },
      {
        "title": "Brachytherapy",
        "description": "Internal radiation for select cancers."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Anand internationally trained?",
        "answer": "Yes, in both New York and London."
      },
      {
        "question": "Does he specialize in SBRT?",
        "answer": "Yes, he has published research on SBRT for recurrent cancers."
      },
      {
        "question": "Does he treat head and neck cancers?",
        "answer": "Yes, with extensive experience in advanced radiotherapy."
      }
    ]
  },
  {
    "slug": "dr-ishita-b-sen",
    "name": "Dr. Ishita B. Sen",
    "specialty": "Nuclear Medicine",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "26+ years",
    "image": "assets/upload/Dr. Ishita B.Sen.png",
    "isTopDoctor": true,
    "position": "Senior Director - Nuclear Medicine",
    "degree": "MBBS | DRM | DNB - Nuclear Medicine",
    "about": "Dr. Ishita B. Sen is a senior nuclear medicine specialist with 24+ years of expertise, focusing on nuclear oncology and radionuclide therapies. She has worked across major hospitals in Delhi-NCR and is highly skilled in PET-CT-based diagnostics and therapeutic nuclear medicine.",
    "medicalProblems": [
      {
        "title": "Oncological Imaging",
        "description": "PET-CT scans for cancer staging and treatment response."
      },
      {
        "title": "Thyroid Disorders",
        "description": "Radioiodine imaging and therapy for thyroid disease."
      },
      {
        "title": "Bone Scans",
        "description": "Diagnosis of fractures, metastases and bone infections."
      },
      {
        "title": "Radionuclide Therapy",
        "description": "Therapeutic isotope use for cancer and other conditions."
      }
    ],
    "procedures": [
      {
        "title": "PET-CT",
        "description": "Whole-body cancer imaging and staging."
      },
      {
        "title": "Nuclear Cardiology Scans",
        "description": "Myocardial perfusion imaging."
      },
      {
        "title": "Radionuclide Therapy",
        "description": "Targeted therapy for cancer and thyroid disorders."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sen specialize in nuclear oncology?",
        "answer": "Yes, it is her primary area of interest."
      },
      {
        "question": "Does she perform radionuclide therapy?",
        "answer": "Yes, for thyroid and cancer patients."
      },
      {
        "question": "Is PET-CT part of her expertise?",
        "answer": "Yes, she is highly experienced in PET-CT diagnostics."
      }
    ]
  },
  {
    "slug": "dr-jayant-arora",
    "name": "Dr. Jayant Arora",
    "specialty": "Orthopaedics",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "24+ years",
    "image": "assets/upload/Dr. Vedant Kabra.png",
    "isTopDoctor": true,
    "position": "Senior Director & Unit Head - Orthopaedics",
    "degree": "MBBS | MS - Orthopaedics | DNB | MRCS (UK) | CCBST (UK)",
    "about": "Dr. Jayant Arora is an internationally trained orthopaedic surgeon with 24 years of experience, including 12+ years of training and practice in the UK. He is a global authority in Partial & Total Knee Replacement using computer navigation and robotic techniques. He is also an expert in sports injury management and arthroscopic surgery. Before joining FMRI, he headed the Orthopaedics department at Columbia Hospital.",
    "medicalProblems": [
      {
        "title": "Knee Osteoarthritis",
        "description": "Advanced arthritis requiring partial or total knee replacement."
      },
      {
        "title": "Sports Injuries",
        "description": "ACL tears, meniscus injuries and ligament damage."
      },
      {
        "title": "Hip & Joint Disorders",
        "description": "Degenerative joint diseases and trauma."
      },
      {
        "title": "Shoulder & Rotator Cuff Problems",
        "description": "Chronic pain, instability and injuries."
      }
    ],
    "procedures": [
      {
        "title": "Robotic & Computer-Navigated Knee Replacement",
        "description": "Highly precise knee replacement surgery."
      },
      {
        "title": "Arthroscopic Surgery",
        "description": "Keyhole surgery for sports injuries."
      },
      {
        "title": "Joint Preservation & Reconstruction",
        "description": "Advanced techniques to restore joint function."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Arora trained internationally?",
        "answer": "Yes, he trained and practiced in the UK for 12+ years."
      },
      {
        "question": "Does he perform robotic knee replacement?",
        "answer": "Yes, he is internationally recognized for it."
      },
      {
        "question": "Does he treat sports injuries?",
        "answer": "Yes, he is an expert in arthroscopic sports surgery."
      }
    ]
  },
  {
    "slug": "dr-nikhil-kumar",
    "name": "Dr. Nikhil Kumar",
    "specialty": "Interventional Cardiology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "39+ years",
    "image": "assets/upload/Dr. Nikhil Kumar.jpeg",
    "isTopDoctor": true,
    "position": "Senior Director - Cardiology",
    "degree": "MBBS | MD - General Medicine | DM - Cardiology",
    "about": "Dr. Nikhil Kumar is a veteran interventional cardiologist with over 39 years of comprehensive experience across interventional, non-invasive and preventive cardiology. A former Professor & Head of Cardiology at Army Hospital (R&R), he has also served in leadership roles at Metro Hospitals and Fortis Gurgaon. He specializes in complex coronary angioplasty, rotational atherectomy, valvuloplasty, device closures, pacemaker and AICD implantation, CRT therapy, and peripheral angioplasty.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Blockages, angina, and heart attack management."
      },
      {
        "title": "Valvular Heart Diseases",
        "description": "Stenosis, regurgitation and catheter-based interventions."
      },
      {
        "title": "Heart Failure",
        "description": "Advanced device-based and medical management."
      },
      {
        "title": "Arrhythmias",
        "description": "Pacemaker, AICD and CRT for rhythm disorders."
      }
    ],
    "procedures": [
      {
        "title": "Complex Angioplasty",
        "description": "Rotablation, stenting and high-risk coronary interventions."
      },
      {
        "title": "Valvuloplasty",
        "description": "Balloon-based opening of stenotic valves."
      },
      {
        "title": "Pacemaker & AICD Implantation",
        "description": "Device therapy for bradycardia and life-threatening arrhythmias."
      },
      {
        "title": "Peripheral & Renal Angioplasty",
        "description": "Angioplasty of carotid, renal and other peripheral vessels."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Kumar served in the Indian Army?",
        "answer": "Yes, he was Professor & Head of Cardiology at Army Hospital (R&R)."
      },
      {
        "question": "Does he perform complex angioplasty?",
        "answer": "Yes, including rotablation and high-risk cases."
      },
      {
        "question": "Does he implant pacemakers and AICDs?",
        "answer": "Yes, he is highly experienced in device therapy."
      }
    ]
  },
  {
    "slug": "dr-niranjan-naik",
    "name": "Dr. Niranjan Naik",
    "specialty": "Surgical Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "21+ years",
    "image": "assets/upload/Dr. Niranjan Naik.jpeg",
    "isTopDoctor": true,
    "position": "Senior Director - Surgical Oncology",
    "degree": "MBBS | MS (AIIMS) | Onco-Surgery (IRCH, AIIMS) | FIAGES",
    "about": "Dr. Niranjan Naik is a renowned surgical oncologist with expertise in breast and gastrointestinal cancer surgery. Trained at AIIMS (IRCH), he has performed over 12,000 onco-surgical operations and excels in laparoscopic, thoracoscopic and endoscopic cancer procedures. He has served as faculty at multiple conferences, contributed to research publications and mentored DNB oncology trainees. He is widely regarded as one of the top breast cancer surgeons in Delhi-NCR.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Breast-conserving and oncoplastic surgical treatment."
      },
      {
        "title": "Gastrointestinal Cancers",
        "description": "Stomach, colon, rectal and pancreatic cancer surgeries."
      },
      {
        "title": "Thoracic Tumors",
        "description": "Minimally invasive thoracoscopic cancer surgeries."
      },
      {
        "title": "Endocrine & Soft Tissue Tumors",
        "description": "Advanced surgical management of rare tumors."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Cancer Surgery",
        "description": "Minimally invasive procedures for GI malignancies."
      },
      {
        "title": "Breast Onco-Surgery",
        "description": "Breast-conserving, reconstruction and lymph node procedures."
      },
      {
        "title": "Endoscopic Procedures",
        "description": "Diagnostic and therapeutic endoscopy for cancer patients."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Naik trained at AIIMS?",
        "answer": "Yes, he trained at IRCH, AIIMS."
      },
      {
        "question": "How many surgeries has he performed?",
        "answer": "Over 12,000 cancer surgeries."
      },
      {
        "question": "Does he treat breast cancer?",
        "answer": "Yes, he is among the best breast cancer surgeons in NCR."
      }
    ]
  },
  {
    "slug": "dr-nitika-sobti",
    "name": "Dr. Nitika Sobti",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "28+ years",
    "image": "assets/upload/Dr. Nitika Sobti.png",
    "isTopDoctor": true,
    "position": "Senior Director - Obstetrics & Gynaecology",
    "degree": "MBBS | DGO | Diploma in MAS (AMASI)",
    "about": "Dr. Nitika Sobti is a highly respected obstetrician & gynaecologist with over 28 years of experience. She is an expert in high-risk pregnancy, natural birthing, minimally invasive surgery and birth psychology. As the founder of the Virtue Baby Program, she integrates science, mindfulness and Garb Sanskar principles into antenatal care. She specializes in laparoscopic surgery, hysteroscopy, endometriosis treatment, and comprehensive women\u2019s wellness.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Management of medically complex pregnancies."
      },
      {
        "title": "Fibroids & Ovarian Cysts",
        "description": "Advanced laparoscopic treatment."
      },
      {
        "title": "Endometriosis",
        "description": "Minimally invasive diagnostic and surgical management."
      },
      {
        "title": "Adolescent Gynaecology",
        "description": "Hormonal and developmental health issues."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic & Hysteroscopic Surgery",
        "description": "Scarless minimally invasive procedures."
      },
      {
        "title": "Natural Birthing & Holistic Pregnancy Care",
        "description": "Birth psychology & meditative techniques."
      },
      {
        "title": "Robotic Gynae Surgery",
        "description": "Precision robotic-assisted procedures."
      }
    ],
    "faqs": [
      {
        "question": "What is Dr. Sobti known for?",
        "answer": "Natural birthing, birth psychology and minimally invasive surgery."
      },
      {
        "question": "Does she manage high-risk pregnancies?",
        "answer": "Yes, she has extensive expertise in it."
      },
      {
        "question": "What is the Virtue Baby Program?",
        "answer": "A science + spirituality-based antenatal program founded by her."
      }
    ]
  },
  {
    "slug": "dr-prashant-saxena",
    "name": "Dr. Prashant Saxena",
    "specialty": "Pulmonology, Critical Care & Sleep Medicine",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "22+ years",
    "image": "assets/upload/Dr. Prashant Saxena.jpeg",
    "isTopDoctor": true,
    "position": "Senior Director & Unit Head - Pulmonology & Sleep Medicine",
    "degree": "MBBS | MD | FRCP (Edin) | EDIC (Europe) | FCCP (USA) | EDARM (Europe) | FICCM | EMPH (USA)",
    "about": "Dr. Prashant Saxena is an internationally trained pulmonologist and critical care expert with fellowships from Australia, Europe, Greece, France and Italy. He specializes in interventional pulmonology, thoracoscopy, bronchoscopy, sleep medicine and advanced ICU care. He has pioneered infection prevention bundles and antibiotic stewardship programs that significantly reduced hospital-acquired infections.",
    "medicalProblems": [
      {
        "title": "Chronic Lung Diseases",
        "description": "Asthma, COPD and long-term respiratory disorders."
      },
      {
        "title": "Respiratory Failure",
        "description": "Advanced ICU and ventilation management."
      },
      {
        "title": "Sleep Disorders",
        "description": "Sleep apnea, insomnia and sleep-disordered breathing."
      },
      {
        "title": "Pleural & Airway Diseases",
        "description": "Effusions, airway narrowing and lung infections."
      }
    ],
    "procedures": [
      {
        "title": "Interventional Bronchoscopy",
        "description": "Therapeutic & diagnostic bronchoscopic procedures."
      },
      {
        "title": "Thoracoscopy",
        "description": "Minimally invasive pleural evaluation and biopsy."
      },
      {
        "title": "Sleep Studies & PAP Therapy",
        "description": "Polysomnography and respiratory sleep solutions."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Saxena internationally trained?",
        "answer": "Yes, across Australia, Europe and the UK."
      },
      {
        "question": "Does he specialize in interventional pulmonology?",
        "answer": "Yes, one of India's leading experts."
      },
      {
        "question": "Does he handle critical care?",
        "answer": "Yes, he has deep expertise in ICU medicine."
      }
    ]
  },
  {
    "slug": "dr-salil-jain",
    "name": "Dr. Salil Jain",
    "specialty": "Nephrology & Renal Transplant",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "25+ years",
    "image": "assets/upload/Dr. Salil Jain.jpg",
    "isTopDoctor": true,
    "position": "Senior Director & HOD - Nephrology & Renal Transplant",
    "degree": "MBBS | MD | DNB (Nephrology)",
    "about": "Dr. Salil Jain is a leading nephrologist with over 24 years of experience in kidney disease management and renal transplantation. He has served at major hospitals across Delhi and Gurgaon and is widely regarded as one of the best nephrologists in NCR. He has authored several national and international publications and is known for precise diagnosis and compassionate patient care.",
    "medicalProblems": [
      {
        "title": "Chronic Kidney Disease",
        "description": "Early to advanced-stage kidney failure management."
      },
      {
        "title": "Acute Kidney Injury",
        "description": "Critical care and emergency nephrology."
      },
      {
        "title": "Dialysis-Related Problems",
        "description": "Hemodialysis and peritoneal dialysis support."
      },
      {
        "title": "Kidney Transplant Evaluation",
        "description": "Recipient and donor assessment."
      }
    ],
    "procedures": [
      {
        "title": "Kidney Transplant",
        "description": "Living & deceased donor renal transplantation."
      },
      {
        "title": "Dialysis Management",
        "description": "Comprehensive dialysis planning and monitoring."
      },
      {
        "title": "Renal Biopsy",
        "description": "Precise tissue diagnosis of kidney diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Jain perform kidney transplants?",
        "answer": "Yes, he is a leading transplant nephrologist."
      },
      {
        "question": "Is he experienced in dialysis management?",
        "answer": "Yes, including hemodialysis and peritoneal dialysis."
      },
      {
        "question": "Is he well-known in Gurgaon?",
        "answer": "Yes, he is considered one of the top nephrologists in NCR."
      }
    ]
  },
  {
    "slug": "dr-sandeep-dewan",
    "name": "Dr. Sandeep Dewan",
    "specialty": "Critical Care Medicine",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "23+ years",
    "image": "assets/upload/Dr. Sandeep Dewan.png",
    "isTopDoctor": true,
    "position": "Senior Director & HOD - Critical Care",
    "degree": "MBBS | DNB (Anaesthesiology) | IDCC",
    "about": "Dr. Sandeep Dewan is a senior critical care specialist with extensive experience across leading hospitals including Sir Ganga Ram Hospital and Escorts Heart Institute. He completed his Fellowship in Critical Care Medicine and has led major ICU programs. As the organiser of FECCS, he contributes significantly to academic advancement in critical care.",
    "medicalProblems": [
      {
        "title": "Sepsis & Multi-Organ Failure",
        "description": "Advanced ICU management of critical illnesses."
      },
      {
        "title": "Respiratory Failure",
        "description": "Ventilation and high-end respiratory support."
      },
      {
        "title": "Cardiac Emergencies",
        "description": "Intensive care for acute cardiac events."
      },
      {
        "title": "Post-Surgical Critical Support",
        "description": "ICU care after major surgeries."
      }
    ],
    "procedures": [
      {
        "title": "Mechanical Ventilation",
        "description": "Advanced respiratory and life support."
      },
      {
        "title": "Hemodynamic Monitoring",
        "description": "Critical care monitoring and intervention."
      },
      {
        "title": "Critical Care Interventions",
        "description": "Lines, drains, procedures and life-saving care."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Dewan specialize in ICU medicine?",
        "answer": "Yes, he has over two decades of ICU expertise."
      },
      {
        "question": "Does he treat multi-organ failure?",
        "answer": "Yes, it is a key area of his practice."
      },
      {
        "question": "Is he academically active?",
        "answer": "Yes, he organizes the FECCS critical care conference."
      }
    ]
  },
  {
    "slug": "dr-suneeta-mittal",
    "name": "Dr. Suneeta Mittal",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "43+ years",
    "image": "assets/upload/Dr. Suneeta Mittal.jpeg",
    "isTopDoctor": true,
    "position": "Senior Director & HOD - Obstetrics & Gynaecology",
    "degree": "MBBS | MD (Obs & Gynae) | Fellowship MET (Scotland) | MNAMS | FAMS | FICOG | FICLS | FICMH | FRCOG",
    "about": "Dr. Suneeta Mittal is one of India's most respected gynaecologists with over 43 years of experience. She has assisted the Government of India and WHO in drafting national reproductive health guidelines including Emergency Contraception, Medical Abortion and Adolescent Anaemia control programs. A pioneer in advanced gynaecologic surgery and robotic techniques, she is widely known for managing the most complex gynaecological and pregnancy-related cases.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Expert care for complex maternal and fetal conditions."
      },
      {
        "title": "Gynaecologic Disorders",
        "description": "Fibroids, endometriosis, cysts and hormonal problems."
      },
      {
        "title": "Reproductive Health Issues",
        "description": "Adolescent and women\u2019s reproductive health concerns."
      },
      {
        "title": "Menopause & Hormonal Concerns",
        "description": "Comprehensive evaluation and treatment."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Gynae Surgery",
        "description": "Precision robotic procedures for complex cases."
      },
      {
        "title": "Laparoscopic & Hysteroscopic Surgery",
        "description": "Minimally invasive treatment of gynecological problems."
      },
      {
        "title": "Advanced Obstetric Care",
        "description": "High-risk pregnancy and delivery management."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Mittal worked with government health programs?",
        "answer": "Yes, she authored several national reproductive health guidelines."
      },
      {
        "question": "Does she handle complex gynecologic cases?",
        "answer": "Yes, she is a top referral specialist nationwide."
      },
      {
        "question": "Is she trained internationally?",
        "answer": "Yes, including MET Fellowship in Scotland."
      }
    ]
  },
  {
    "slug": "dr-vinayak-agarwal",
    "name": "Dr. Vinayak Agarwal",
    "specialty": "Non-Invasive Cardiology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "24+ years",
    "image": "assets/upload/Dr. Vinayak Agarwal.jpeg",
    "isTopDoctor": true,
    "position": "Senior Director & Head - Non-Invasive Cardiology",
    "degree": "MBBS | MD - Medicine | DNB - Cardiology",
    "about": "Dr. Vinayak Agarwal is a highly experienced cardiologist with 24+ years of expertise in non-invasive, clinical and interventional cardiology. An alumnus of Maulana Azad Medical College and UCMS Delhi, he has worked at Escorts Heart Institute, Medanta, and PSRI. He is known for early heart disease detection, sports cardiology, cardio-oncology and transplant cardiology.",
    "medicalProblems": [
      {
        "title": "Heart Disease Risk Assessment",
        "description": "Early detection and preventive evaluation."
      },
      {
        "title": "Cardiac Rhythm Disorders",
        "description": "Holter-based diagnosis and management."
      },
      {
        "title": "Cardio-Oncology Care",
        "description": "Heart monitoring during cancer therapy."
      },
      {
        "title": "Heart Failure Evaluation",
        "description": "Non-invasive monitoring and long-term care."
      }
    ],
    "procedures": [
      {
        "title": "Echocardiography & Cardiac Imaging",
        "description": "Advanced imaging for diagnosis and monitoring."
      },
      {
        "title": "Stress Testing & Holter Monitoring",
        "description": "Functional assessment of cardiovascular health."
      },
      {
        "title": "Non-Invasive Cardiac Screening",
        "description": "Heart disease risk profiling and preventive protocols."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Agarwal specialize in early heart disease detection?",
        "answer": "Yes, it is one of his major focus areas."
      },
      {
        "question": "Is he experienced in sports cardiology?",
        "answer": "Yes, he runs specialized sports cardiology clinics."
      },
      {
        "question": "Does he provide community cardiology programs?",
        "answer": "Yes, he actively manages integrated cardiac wellness clinics."
      }
    ]
  },
  {
    "slug": "dr-anand-sinha",
    "name": "Dr. Anand Sinha",
    "specialty": "Paediatric Surgery & Pediatric Urology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "17+ years",
    "image": "assets/upload/Dr. Anand Sinha.png",
    "isTopDoctor": true,
    "position": "Director - Paediatrics & Pediatric Surgery",
    "degree": "MBBS | MS - General Surgery | MCh - Paediatric Surgery (AIIMS) | Fellowship - Pediatric Robotic Urology (USA)",
    "about": "Dr. Anand Sinha is one of India\u2019s finest paediatric surgeons and among the first to introduce robotic surgery in children. Trained at AIIMS and the University of Chicago, he has performed 10,000+ pediatric surgeries, including neonatal, gastrointestinal, thoracic, urological and robotic procedures. Under his leadership, the pediatric surgery department at Fortis has become one of India\u2019s best centers with near-zero complication rates.",
    "medicalProblems": [
      {
        "title": "Pediatric Urological Disorders",
        "description": "Hydronephrosis, PUJ obstruction, reflux and congenital anomalies."
      },
      {
        "title": "Neonatal Surgical Conditions",
        "description": "Congenital GI, lung, abdominal and urological defects."
      },
      {
        "title": "Pediatric Tumors",
        "description": "Solid tumors requiring surgery."
      },
      {
        "title": "Pediatric Abdominal & Thoracic Issues",
        "description": "Hernias, cysts, digestive tract and airway problems."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Pediatric Surgery",
        "description": "Robotic urology and minimally invasive pediatric operations."
      },
      {
        "title": "Laparoscopic Pediatric Surgery",
        "description": "Keyhole surgery for abdominal and GI conditions."
      },
      {
        "title": "Pediatric Endoscopy & Thoracoscopy",
        "description": "Minimally invasive chest and airway procedures."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Sinha trained in robotic pediatric urology?",
        "answer": "Yes, he trained at the University of Chicago, USA."
      },
      {
        "question": "Does he perform neonatal surgeries?",
        "answer": "Yes, he is highly experienced in neonatal and infant surgery."
      },
      {
        "question": "How many pediatric surgeries has he performed?",
        "answer": "Over 10,000 successful procedures."
      }
    ]
  },
  {
    "slug": "dr-gagan-deep-chhabra",
    "name": "Dr. Gagan Deep Chhabra",
    "specialty": "Nephrology & Kidney Transplant",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "15+ years",
    "image": "assets/upload/Dr. Gagan Deep Chhabra.png",
    "isTopDoctor": true,
    "position": "Director & Unit Head - Nephrology & Kidney Transplant",
    "degree": "MBBS | DNB - Medicine | DNB - Nephrology",
    "about": "Dr. Gagan Deep Chhabra is a distinguished nephrologist with extensive experience in kidney transplantation, having performed over 2500 renal transplants. He has served at top hospitals like Max Saket, Sir Ganga Ram Hospital and BLK. Recognized with the AITSE award by the President of India, he is known for excellence in dialysis access procedures and academic mentorship.",
    "medicalProblems": [
      {
        "title": "End-Stage Kidney Disease",
        "description": "Evaluation and preparation for transplant or dialysis."
      },
      {
        "title": "Dialysis Access Problems",
        "description": "AV fistula, graft and shunt-related issues."
      },
      {
        "title": "Glomerular Diseases",
        "description": "Autoimmune and nephritic kidney disorders."
      },
      {
        "title": "Hypertension & Diabetic Kidney Disease",
        "description": "Long-term kidney protection and treatment."
      }
    ],
    "procedures": [
      {
        "title": "Kidney Transplant",
        "description": "Over 2500 successful renal transplants."
      },
      {
        "title": "AV Fistula & Shunt Procedures",
        "description": "Expert creation and management of dialysis access."
      },
      {
        "title": "Renal Biopsy",
        "description": "Diagnostic biopsy for kidney diseases."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Chhabra performed many transplants?",
        "answer": "Yes, over 2500 kidney transplants."
      },
      {
        "question": "Does he create AV fistulas?",
        "answer": "Yes, he has vast expertise in dialysis access procedures."
      },
      {
        "question": "Has he received national honors?",
        "answer": "Yes, awarded by the President of India for academic excellence."
      }
    ]
  },
  {
    "slug": "dr-himanshu-verma",
    "name": "Dr. Himanshu Verma",
    "specialty": "Vascular Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "17+ years",
    "image": "assets/upload/Dr. Himanshu Verma.jpeg",
    "isTopDoctor": true,
    "position": "Director - Vascular Surgery",
    "degree": "MBBS | MS - General Surgery | Fellowship - Vascular & Endovascular Surgery (RGUHS) | Ted Rogers Fellowship - Mayo Clinic (USA)",
    "about": "Dr. Himanshu Verma is one of India\u2019s leading vascular surgeons with advanced training from Mayo Clinic, USA. He specializes in complex endovascular and open vascular surgeries, redo surgeries, diabetic limb salvage and aneurysm repairs. He has performed over 5000 AV fistula surgeries and has authored more than 40 scientific publications including book chapters.",
    "medicalProblems": [
      {
        "title": "Aortic Aneurysms",
        "description": "Endovascular and open repair of aortic diseases."
      },
      {
        "title": "Peripheral Artery Disease",
        "description": "Bypass, angioplasty and stenting."
      },
      {
        "title": "Varicose Veins",
        "description": "Laser, RFA and minimally invasive treatments."
      },
      {
        "title": "Diabetic Foot Disorders",
        "description": "Limb salvage, angioplasty and wound care."
      }
    ],
    "procedures": [
      {
        "title": "Redo Vascular Surgeries",
        "description": "Correction of previously failed vascular procedures."
      },
      {
        "title": "AV Fistula & Dialysis Access",
        "description": "Over 5000 complex AV fistula procedures."
      },
      {
        "title": "Aortic & Peripheral Bypass",
        "description": "Bypass surgeries for severe blockages."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Verma trained internationally?",
        "answer": "Yes, he completed a fellowship at Mayo Clinic, USA."
      },
      {
        "question": "Does he treat varicose veins?",
        "answer": "Yes, using laser, RFA and stenting."
      },
      {
        "question": "Does he perform complex redo surgeries?",
        "answer": "Yes, it is one of his major specialties."
      }
    ]
  },
  {
    "slug": "dr-mukta-kapila",
    "name": "Dr. Mukta Kapila",
    "specialty": "Obstetrics & Minimal Invasive Gynaecology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "30+ years",
    "image": "assets/upload/Dr. Mukta Kapila.jpeg",
    "isTopDoctor": true,
    "position": "Director & HOD - Obstetrics & Minimal Invasive Gynaecology",
    "degree": "MBBS | DGO | DNB",
    "about": "Dr. Mukta Kapila is a senior obstetrician and gynecologist with 30+ years of experience. A postgraduate of AFMC Pune, she is renowned for her expertise in minimally invasive gynecologic surgery and removal of large fibroids through keyhole techniques. Her department achieves near-zero complication rates with rapid recovery. She is also known for compassionate management of high-risk pregnancies.",
    "medicalProblems": [
      {
        "title": "Fibroids & Ovarian Cysts",
        "description": "Advanced laparoscopic removal with minimal scarring."
      },
      {
        "title": "High-Risk Pregnancy",
        "description": "Maternal and fetal complications."
      },
      {
        "title": "Endometriosis",
        "description": "Minimally invasive diagnosis and treatment."
      },
      {
        "title": "Ectopic Pregnancy",
        "description": "Emergency gynecologic surgical care."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive hysterectomy, fibroid removal and cystectomy."
      },
      {
        "title": "Hysteroscopic Procedures",
        "description": "Scarless uterus-preserving surgery."
      },
      {
        "title": "High-Risk Pregnancy Care",
        "description": "Integrated maternal monitoring and delivery support."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kapila specialize in minimal access surgery?",
        "answer": "Yes, with exceptional expertise in large fibroid removal."
      },
      {
        "question": "Does she manage high-risk pregnancies?",
        "answer": "Yes, with personalized care and monitoring."
      },
      {
        "question": "Does she conduct workshops?",
        "answer": "Yes, she teaches laparoscopy and hysteroscopy nationally and internationally."
      }
    ]
  },
  {
    "slug": "dr-neetu-talwar",
    "name": "Dr. Neetu Talwar",
    "specialty": "Paediatric Pulmonology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "24+ years",
    "image": "assets/upload/Dr. Neetu Talwar.jpg",
    "isTopDoctor": true,
    "position": "Director - Paediatrics & Pediatric Pulmonology",
    "degree": "MBBS | DCH | DNB | FCPS | Fellowship - Pediatric Pulmonology",
    "about": "Dr. Neetu Talwar is one of India\u2019s most experienced pediatric pulmonologists with expertise in flexible and interventional bronchoscopy in children\u2014available at only a handful of centers nationwide. Trained at KEM Hospital Mumbai and Sir Ganga Ram Hospital, she specializes in childhood asthma, allergic disorders, cystic fibrosis, chronic lung diseases and pediatric sleep studies. She frequently organizes national CMEs and workshops.",
    "medicalProblems": [
      {
        "title": "Childhood Asthma",
        "description": "Comprehensive diagnosis and long-term management."
      },
      {
        "title": "Allergic Respiratory Disorders",
        "description": "Allergies, chronic cough and airway hyperreactivity."
      },
      {
        "title": "Chronic Lung Diseases",
        "description": "Cystic fibrosis, bronchiectasis and recurrent infections."
      },
      {
        "title": "Pediatric Sleep Disorders",
        "description": "Sleep apnea and nocturnal breathing issues."
      }
    ],
    "procedures": [
      {
        "title": "Flexible Bronchoscopy",
        "description": "Diagnostic & interventional bronchoscopy for children."
      },
      {
        "title": "Pulmonary Function Tests",
        "description": "Age-appropriate lung assessment."
      },
      {
        "title": "Pediatric Sleep Studies",
        "description": "Polysomnography and sleep disorder evaluation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Talwar perform pediatric bronchoscopy?",
        "answer": "Yes, including advanced interventional procedures."
      },
      {
        "question": "Does she treat childhood asthma?",
        "answer": "Yes, it is one of her core specialties."
      },
      {
        "question": "Is she experienced in cystic fibrosis care?",
        "answer": "Yes, she manages complex chronic lung disorders in children."
      }
    ]
  },
  {
    "slug": "dr-samir-parikh",
    "name": "Dr. Samir Parikh",
    "specialty": "Mental Health & Behavioural Sciences",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "25+ years",
    "image": "assets/upload/Dr. Samir Parikh..jpeg",
    "isTopDoctor": true,
    "position": "Director - Mental Health & Behavioural Sciences",
    "degree": "MBBS | DPM | MD - Psychiatry",
    "about": "Dr. Samir Parikh is one of India\u2019s most influential psychiatrists and Director of the Fortis National Mental Health Program\u2014one of the world\u2019s largest multi-city, multi-centric mental health networks impacting over 15 crore lives. A strong advocate of mental health awareness, he leads a team of 80+ experts and actively contributes to national mental health conversations.",
    "medicalProblems": [
      {
        "title": "Depression & Anxiety",
        "description": "Therapy and medication-based management."
      },
      {
        "title": "Child & Adolescent Mental Health",
        "description": "Behavioural, emotional and developmental concerns."
      },
      {
        "title": "Stress & Relationship Issues",
        "description": "Holistic psychological and psychiatric care."
      },
      {
        "title": "Severe Mental Illness",
        "description": "Schizophrenia, bipolar disorder and complex psychiatric conditions."
      }
    ],
    "procedures": [
      {
        "title": "Psychiatric Evaluation",
        "description": "Comprehensive diagnostic assessment."
      },
      {
        "title": "Therapeutic Counselling",
        "description": "CBT, psychotherapy and behavioural therapy."
      },
      {
        "title": "Medication Management",
        "description": "Safe and evidence-based psychiatric treatment."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Parikh treat anxiety and depression?",
        "answer": "Yes, with evidence-based psychiatric and therapeutic approaches."
      },
      {
        "question": "Does he specialize in child mental health?",
        "answer": "Yes, he has deep expertise in adolescent and school mental health."
      },
      {
        "question": "Does he lead a national mental health program?",
        "answer": "Yes, across 20+ centers impacting millions."
      }
    ]
  },
  {
    "slug": "dr-rashmi-pyasi",
    "name": "Dr. Rashmi Pyasi",
    "specialty": "GI, Minimal Access & Bariatric Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "26+ years",
    "image": "assets/upload/Dr. Rashmi Pyasi.jpg",
    "isTopDoctor": true,
    "position": "Director - GI, Minimal Access & Bariatric Surgery",
    "degree": "MBBS | MS (General Surgery) | FIAGES | FAIS | FALS",
    "about": "Dr. Rashmi Pyasi is a senior surgeon with 26+ years of experience in laparoscopic, bariatric and GI surgery. She is renowned for her expertise in scarless single-incision laparoscopic surgery and has performed over 1600 MIPHs. She also specializes in female surgical disorders, breast disorders, weight-loss surgery, and complex minimally invasive procedures. She is a national trainer, NBE examiner and has published extensively.",
    "medicalProblems": [
      {
        "title": "Gallbladder Diseases",
        "description": "Gallstones and single-incision laparoscopic removal."
      },
      {
        "title": "Colorectal Disorders",
        "description": "Piles, fissures, fistulas and colorectal problems."
      },
      {
        "title": "Obesity & Metabolic Disorders",
        "description": "Surgical weight-loss solutions."
      },
      {
        "title": "Hernias & Abdominal Wall Disorders",
        "description": "Laparoscopic and advanced hernia repair."
      }
    ],
    "procedures": [
      {
        "title": "Single-Incision Laparoscopic Surgery",
        "description": "Scarless gallbladder and abdominal surgeries."
      },
      {
        "title": "Bariatric Surgery",
        "description": "Weight-loss and metabolic surgeries."
      },
      {
        "title": "MIPH (Minimally Invasive Procedure for Hemorrhoids)",
        "description": "Performed over 1600+ advanced MIPH procedures."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Pyasi an expert in single-incision laparoscopy?",
        "answer": "Yes, she is among India's leading surgeons in this field."
      },
      {
        "question": "Does she perform bariatric surgery?",
        "answer": "Yes, she specializes in weight-loss and metabolic surgery."
      },
      {
        "question": "Is she involved in national training programs?",
        "answer": "Yes, she is an NBE examiner and CME organizer."
      }
    ]
  },
  {
    "slug": "dr-sanjat-chiwane",
    "name": "Dr. Sanjat Chiwane",
    "specialty": "Interventional Cardiology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "19+ years",
    "image": "assets/upload/Dr. Sanjat Chiwane.jpeg",
    "isTopDoctor": true,
    "position": "Director - Cardiology",
    "degree": "MBBS | MD - Medicine | DM - Cardiology | FESC | FSCAI",
    "about": "Dr. Sanjat Chiwane is a highly experienced cardiologist with over 19 years of practice in interventional cardiology. He is widely regarded for his expertise in complex cardiac care and internal medicine. With extensive experience across major hospitals, he is recognized as a trusted name for cardiac treatment in Gurgaon.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Diagnosis and interventional management."
      },
      {
        "title": "Heart Rhythm Problems",
        "description": "Evaluation and treatment of arrhythmias."
      },
      {
        "title": "Hypertension & Lifestyle Heart Disease",
        "description": "Long-term cardiac care."
      },
      {
        "title": "Heart Failure",
        "description": "Advanced heart failure diagnosis and care."
      }
    ],
    "procedures": [
      {
        "title": "Angiography & Angioplasty",
        "description": "Interventional treatment of blocked arteries."
      },
      {
        "title": "Device Implantation",
        "description": "Pacemaker and cardiac device implantation."
      },
      {
        "title": "Cardiac Evaluation",
        "description": "Non-invasive and diagnostic cardiac testing."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Chiwane specialize in angioplasty?",
        "answer": "Yes, he is experienced in interventional cardiology."
      },
      {
        "question": "Does he treat hypertension?",
        "answer": "Yes, he offers long-term cardiac management."
      },
      {
        "question": "Is he recognized internationally?",
        "answer": "Yes, he holds global certifications like FESC and FSCAI."
      }
    ]
  },
  {
    "slug": "dr-swarupa-mitra",
    "name": "Dr. Swarupa Mitra",
    "specialty": "Radiation Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "23+ years",
    "image": "assets/upload/Dr. Swarupa Mitra.jpeg",
    "isTopDoctor": true,
    "position": "Director & Unit Head - Radiation Oncology",
    "degree": "MBBS | MD - Radiation Oncology",
    "about": "Dr. Swarupa Mitra is a senior radiation oncologist with 23+ years of experience. She is a global faculty member and has represented India at ASCO, ICRO and UICC. She co-guides PhD research at Ghent University and was nominated to the Government of India's Project Advisory Committee for Health Communication. She is widely respected for her work in cervical cancer awareness.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Radiation therapy and follow-up care."
      },
      {
        "title": "Gynecological Cancers",
        "description": "Cervical, uterine and ovarian malignancies."
      },
      {
        "title": "Head & Neck Cancers",
        "description": "Advanced radiation protocols."
      },
      {
        "title": "Lung & GI Cancers",
        "description": "Precision radiation therapy."
      }
    ],
    "procedures": [
      {
        "title": "IMRT & IGRT",
        "description": "Precision radiation for complex tumors."
      },
      {
        "title": "Stereotactic Body Radiation Therapy",
        "description": "High-precision targeted treatment."
      },
      {
        "title": "Brachytherapy",
        "description": "Internal radiation for gynecologic cancers."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Mitra an international faculty?",
        "answer": "Yes, she has been invited to ASCO and UICC forums."
      },
      {
        "question": "Does she specialize in gynecological cancers?",
        "answer": "Yes, she is widely recognized for cervical cancer work."
      },
      {
        "question": "Is she involved in research?",
        "answer": "Yes, she co-guides PhD research internationally."
      }
    ]
  },
  {
    "slug": "dr-vikram-sharma",
    "name": "Dr. Vikram Sharma",
    "specialty": "Urology & Robotic Urology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "39+ years",
    "image": "assets/upload/Dr. Vikram Sharma.png",
    "isTopDoctor": true,
    "position": "Director - Urology, Andrology & Robotic Urology",
    "degree": "MBBS | MS (General Surgery) | PG Diploma in Urology (London)",
    "about": "Dr. Vikram Sharma is one of India's most senior and pioneering urologists with 39+ years of experience. An innovator in Endourology and Robotic Urology, he introduced GreenLight Laser prostate surgery in India and founded the country\u2019s first dedicated Andrology Centre. He is a visiting professor at USC Los Angeles and is globally recognized for excellence in robotic and laparoscopic urology.",
    "medicalProblems": [
      {
        "title": "Prostate Disorders",
        "description": "BPH, prostatitis and prostate cancer."
      },
      {
        "title": "Kidney & Ureteric Stones",
        "description": "Endourological and laser treatment."
      },
      {
        "title": "Male Sexual Dysfunction",
        "description": "Comprehensive andrology care."
      },
      {
        "title": "Urological Cancers",
        "description": "Prostate, kidney, bladder and testicular cancers."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Urological Surgery",
        "description": "Advanced robotic procedures for prostate and kidney."
      },
      {
        "title": "GreenLight Laser Prostate Surgery",
        "description": "Pioneered in India by Dr. Sharma."
      },
      {
        "title": "Endourological Stone Surgery",
        "description": "Minimally invasive laser and endoscopic treatments."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Sharma a pioneer of robotic urology?",
        "answer": "Yes, he is a leading robotic and endourology expert."
      },
      {
        "question": "Does he treat male infertility?",
        "answer": "Yes, he is among India\u2019s top andrologists."
      },
      {
        "question": "Has he trained internationally?",
        "answer": "Yes, including London and the USA."
      }
    ]
  },
  {
    "slug": "dr-vipul-nanda",
    "name": "Dr. Vipul Nanda",
    "specialty": "Plastic & Reconstructive Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "35+ years",
    "image": "assets/upload/Dr. Vipul Nanda.png",
    "isTopDoctor": true,
    "position": "Director - Plastic & Reconstructive Surgery",
    "degree": "MBBS (AIIMS) | MS (AIIMS) | MCh (PGI Chandigarh) | MRCS (UK)",
    "about": "Dr. Vipul Nanda is one of India\u2019s most renowned plastic and cosmetic surgeons with 35+ years of experience. Trained at AIIMS, PGI Chandigarh and internationally across the UK, Spain, Japan and USA, he is known for precision-driven, natural-looking results. He previously led plastic surgery in Oman and is widely respected for excellence in aesthetic and reconstructive procedures.",
    "medicalProblems": [
      {
        "title": "Cosmetic Concerns",
        "description": "Aesthetic improvement of face and body."
      },
      {
        "title": "Trauma & Reconstructive Needs",
        "description": "Reconstruction after injuries or deformities."
      },
      {
        "title": "Breast Concerns",
        "description": "Enhancement, reduction and reconstruction."
      },
      {
        "title": "Scarring & Skin Deformities",
        "description": "Advanced scar revision and correction."
      }
    ],
    "procedures": [
      {
        "title": "Rhinoplasty",
        "description": "Nose reshaping surgery with high precision."
      },
      {
        "title": "Body Contouring & Liposuction",
        "description": "Sculpting procedures for natural aesthetics."
      },
      {
        "title": "Facelift & Facial Rejuvenation",
        "description": "Anti-aging aesthetic surgeries."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Nanda internationally trained?",
        "answer": "Yes, in the UK, Spain, Japan and USA."
      },
      {
        "question": "Does he specialize in cosmetic surgery?",
        "answer": "Yes, he is one of India\u2019s top cosmetic surgeons."
      },
      {
        "question": "Does he perform rhinoplasty?",
        "answer": "Yes, he is widely recognized for it."
      }
    ]
  },
  {
    "slug": "dr-shuchi-verma",
    "name": "Dr. (Maj) Shuchi Verma",
    "specialty": "Ophthalmology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "20+ years",
    "image": "assets/upload/Dr. (Maj) Shuchi Verma.jpeg",
    "isTopDoctor": true,
    "position": "Principal Consultant - Ophthalmology",
    "degree": "MBBS | MS - Ophthalmology",
    "about": "Dr. Shuchi Verma is a senior ophthalmologist with 20+ years of experience, specializing in cataract surgery, LASIK and medical retina. A former Army Medical Corps officer, she has performed over 10,000 cataract surgeries. She is known for ethical, patient-centric care and has received commendations for her services during Operation Parakram and Operation Vijay.",
    "medicalProblems": [
      {
        "title": "Cataract",
        "description": "Evaluation and advanced lens implantation."
      },
      {
        "title": "Refractive Errors",
        "description": "Spectacle removal using LASIK and PRK."
      },
      {
        "title": "Retina Disorders",
        "description": "Diagnosis and treatment of retinal conditions."
      },
      {
        "title": "Ocular Surface & Dry Eye Problems",
        "description": "Medical and procedural management."
      }
    ],
    "procedures": [
      {
        "title": "Cataract Surgery",
        "description": "Over 10,000 successful phaco surgeries."
      },
      {
        "title": "LASIK & Refractive Surgery",
        "description": "Advanced laser vision correction."
      },
      {
        "title": "Medical Retina Treatments",
        "description": "Laser and medical management of retinal issues."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Verma worked in the Indian Army?",
        "answer": "Yes, she served for 5 years and earned service medals."
      },
      {
        "question": "Does she perform LASIK?",
        "answer": "Yes, she is trained in LASIK and refractive surgery."
      },
      {
        "question": "Is she experienced in cataract surgery?",
        "answer": "Yes, with over 10,000 surgeries completed."
      }
    ]
  },
  {
    "slug": "dr-ajay-kumar",
    "name": "Dr. Ajay Kumar",
    "specialty": "Pulmonology & Sleep Medicine",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "23+ years",
    "image": "assets/upload/Dr. Ajay Kumar.png",
    "isTopDoctor": true,
    "position": "Additional Director - Pulmonology, Critical Care & Sleep Medicine",
    "degree": "MBBS | MD - Respiratory Medicine",
    "about": "Dr. Ajay Kumar is a senior pulmonologist with 23+ years of experience in respiratory medicine, critical care and sleep disorders. He is highly skilled in complex pulmonary interventions including rigid and flexible bronchoscopy, cryobiopsy, EBUS and medical thoracoscopy. He is known for managing difficult asthma, COPD, lung infections, pulmonary embolism and respiratory failure.",
    "medicalProblems": [
      {
        "title": "Chronic Lung Diseases",
        "description": "COPD, ILD and recurrent infections."
      },
      {
        "title": "Sleep Disorders",
        "description": "Sleep apnea and nocturnal breathing abnormalities."
      },
      {
        "title": "Asthma & Allergies",
        "description": "Expert management of mild to severe asthma."
      },
      {
        "title": "Pleural Diseases",
        "description": "Pneumothorax, effusions and pleural complications."
      }
    ],
    "procedures": [
      {
        "title": "Bronchoscopy (Rigid & Flexible)",
        "description": "Foreign body removal, biopsies and airway interventions."
      },
      {
        "title": "EBUS & Cryobiopsy",
        "description": "Advanced lung diagnostics."
      },
      {
        "title": "Medical Thoracoscopy",
        "description": "Minimally invasive pleural surgery."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ajay perform EBUS & Cryobiopsy?",
        "answer": "Yes, he is highly skilled in both."
      },
      {
        "question": "Does he treat severe asthma?",
        "answer": "Yes, including difficult and resistant asthma."
      },
      {
        "question": "Does he manage sleep apnea?",
        "answer": "Yes, he specializes in sleep-related breathing disorders."
      }
    ]
  },
  {
    "slug": "dr-narola-yanger",
    "name": "Dr. Narola Yanger",
    "specialty": "GI, GI Oncology, Minimal Access & Bariatric Surgery",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "19+ years",
    "image": "assets/upload/Dr. Narola Yanger.png",
    "isTopDoctor": true,
    "position": "Principal Consultant - GI, GI Oncology, Minimal Access & Bariatric Surgery",
    "degree": "MBBS | MS (General Surgery)",
    "about": "Dr. Narola Yanger is an accomplished surgeon with nearly 20 years of expertise in GI surgery, GI oncology, bariatric surgery and minimally invasive procedures. Her experience spans premier hospitals in India and abroad, including high-volume bariatric centers in Saudi Arabia. She specializes in laparoscopic GI cancer surgery, head & neck and breast surgery, and laser-based treatments for hemorrhoids, fistulas and varicose veins.",
    "medicalProblems": [
      {
        "title": "GI Cancers",
        "description": "Stomach, colon and esophageal malignancies."
      },
      {
        "title": "Obesity & Metabolic Disorders",
        "description": "Weight-loss surgery and post-bariatric care."
      },
      {
        "title": "Breast, Thyroid & Head-Neck Disorders",
        "description": "Benign and malignant conditions."
      },
      {
        "title": "Anorectal Disorders",
        "description": "Piles, fissures, fistulas and pilonidal sinus."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic GI Cancer Surgery",
        "description": "Precision-driven minimally invasive cancer operations."
      },
      {
        "title": "Bariatric Surgery",
        "description": "Advanced weight-loss procedures."
      },
      {
        "title": "Laser Proctology",
        "description": "Laser treatment for piles, fistulas and varicose veins."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Yanger specialize in GI cancer surgery?",
        "answer": "Yes, she is highly skilled in laparoscopic cancer operations."
      },
      {
        "question": "Does she perform bariatric surgery?",
        "answer": "Yes, she has trained at high-volume global centers."
      },
      {
        "question": "Is she experienced in laser proctology?",
        "answer": "Yes, she uses latest laser techniques."
      }
    ]
  },
  {
    "slug": "dr-naresh-jain",
    "name": "Dr. Naresh Jain",
    "specialty": "Dermatology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "15+ years",
    "image": "assets/upload/Dr. Naresh Jain.jpg",
    "isTopDoctor": true,
    "position": "Senior Consultant - Dermatology",
    "degree": "MBBS | MD (Dermatology, Venereology & Leprology)",
    "about": "Dr. Naresh Jain is a senior dermatologist trained at PGI Chandigarh and AIIMS New Delhi. With 15+ years of experience, he specializes in pediatric dermatology, dermatosurgery, lasers, vitiligo surgery, nail surgery, and aesthetic medicine including Botox and fillers. He is internationally trained at the National Skin Centre, Singapore.",
    "medicalProblems": [
      {
        "title": "Skin Allergies & Eczema",
        "description": "Chronic and acute dermatologic conditions."
      },
      {
        "title": "Pediatric Dermatology",
        "description": "Skin conditions affecting infants and children."
      },
      {
        "title": "Vitiligo & Pigmentation Disorders",
        "description": "Medical and surgical treatment options."
      },
      {
        "title": "Hair & Nail Disorders",
        "description": "Nail surgery, alopecia and scalp issues."
      }
    ],
    "procedures": [
      {
        "title": "Laser Treatments",
        "description": "Laser therapy for scars, pigmentation and rejuvenation."
      },
      {
        "title": "Aesthetic Procedures",
        "description": "Botox, fillers and anti-aging solutions."
      },
      {
        "title": "Dermatosurgery",
        "description": "Vitiligo surgery, mole removal and nail surgery."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Jain trained internationally?",
        "answer": "Yes, he trained at the National Skin Centre, Singapore."
      },
      {
        "question": "Does he specialize in pediatric dermatology?",
        "answer": "Yes, it is one of his major areas of expertise."
      },
      {
        "question": "Does he perform aesthetic treatments?",
        "answer": "Yes, including Botox, fillers and lasers."
      }
    ]
  },
  {
    "slug": "dr-saurbhi-khurana",
    "name": "Dr. Saurbhi Khurana",
    "specialty": "Ophthalmology - Oculoplasty & Periocular Oncology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "18+ years",
    "image": "assets/upload/Dr. Saurbhi Khurana.jpg",
    "isTopDoctor": true,
    "position": "Senior Consultant - Ophthalmology (Oculoplasty)",
    "degree": "MBBS | MD (AIIMS) | FICO (UK) | FAICO (Oculoplasty)",
    "about": "Dr. Saurbhi Khurana is an internationally trained oculoplasty surgeon with 18+ years of experience. She specializes exclusively in oculoplasty, periocular oncology and aesthetic eye surgery. Trained at AIIMS and holding FICO (UK) and FAICO (Oculoplasty), she is one of India\u2019s leading experts in eyelid surgery, orbital tumors, tear duct surgeries and aesthetic oculoplasty.",
    "medicalProblems": [
      {
        "title": "Eyelid Disorders",
        "description": "Ptosis, ectropion, entropion and lid retraction."
      },
      {
        "title": "Orbital Tumors & Trauma",
        "description": "Complex tumors and fractures requiring reconstruction."
      },
      {
        "title": "Tear Duct Blockages",
        "description": "Adult and pediatric epiphora conditions."
      },
      {
        "title": "Aesthetic Concerns",
        "description": "Eyelid bags, moles, cysts and periocular aging."
      }
    ],
    "procedures": [
      {
        "title": "Blepharoplasty",
        "description": "Cosmetic eyelid rejuvenation."
      },
      {
        "title": "Oculoplasty & Reconstruction",
        "description": "Advanced eyelid and orbital surgeries."
      },
      {
        "title": "DCR & Tear Duct Surgery",
        "description": "Treatment for chronic tearing and obstruction."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Khurana internationally certified?",
        "answer": "Yes, she holds FICO (UK) and FAICO (Oculoplasty)."
      },
      {
        "question": "Does she perform aesthetic eye surgeries?",
        "answer": "Yes, including scarless mole removal and blepharoplasty."
      },
      {
        "question": "Does she treat thyroid eye disease?",
        "answer": "Yes, with advanced oculoplastic techniques."
      }
    ]
  },
  {
    "slug": "dr-neha-gupta",
    "name": "Dr. Neha Gupta",
    "specialty": "Infectious Diseases",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "20+ years",
    "image": "assets/upload/Dr. Neha Gupta.jpg",
    "isTopDoctor": true,
    "position": "Consultant - Infectious Diseases",
    "degree": "MD - General Medicine | Infectious Diseases Training (Hinduja Hospital Mumbai | CMC Vellore | Wayne State University, USA)",
    "about": "Dr. Neha Gupta is among the first qualified Infectious Disease specialists in India, with extensive global experience in diagnosing and managing complex infections. She handles infections across specialties including transplant ID, oncology, neurology, nephrology, obstetrics & gynaecology, HIV, drug-resistant TB, fungal diseases and culture-negative fevers. She is also an expert in antibiotic and antifungal stewardship.",
    "medicalProblems": [
      {
        "title": "Fever & Tropical Diseases",
        "description": "COVID-19, dengue, malaria, typhoid, rickettsial infections."
      },
      {
        "title": "TB & Drug-Resistant TB",
        "description": "Advanced diagnostic and treatment expertise."
      },
      {
        "title": "HIV & STDs",
        "description": "Comprehensive management and counselling."
      },
      {
        "title": "Fungal & Resistant Infections",
        "description": "Management of drug-resistant bacteria and fungal diseases."
      },
      {
        "title": "Travel & Vaccination",
        "description": "Travel health advisory and preventive vaccines."
      }
    ],
    "procedures": [
      {
        "title": "Infection Diagnosis & Management",
        "description": "Advanced evaluation of bacterial, viral and fungal diseases."
      },
      {
        "title": "Antibiotic Stewardship",
        "description": "Optimized antibiotic and antifungal treatment strategies."
      },
      {
        "title": "Vaccination Services",
        "description": "Preventive immunization for adults & travellers."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Neha treat drug-resistant TB?",
        "answer": "Yes, she is an expert in MDR and XDR TB management."
      },
      {
        "question": "Does she treat HIV and STDs?",
        "answer": "Yes, she provides comprehensive medical care and counselling."
      },
      {
        "question": "Does she provide travel advisory?",
        "answer": "Yes, including vaccinations and preventive care."
      }
    ]
  },
  {
    "slug": "ms-mimansa-tanwar",
    "name": "Ms. Mimansa Tanwar",
    "specialty": "Clinical Psychology",
    "hospital": "Fortis Memorial Research Institute, Gurgaon",
    "experience": "14+ years",
    "image": "assets/upload/Ms. Mimansa Tanwar.png",
    "isTopDoctor": false,
    "position": "Consultant - Mental Health & Behavioural Sciences",
    "degree": "BA (Hons) Psychology | MA Clinical Psychology | M.Phil Clinical Psychology (RCI Licensed)",
    "about": "Ms. Mimansa Tanwar is a leading clinical psychologist with over 14 years of experience. She heads the Fortis School Mental Health Program and has shaped several national-level initiatives promoting mental well-being in educational institutions. She uses an eclectic evidence-based approach in treating adolescents, couples, families and adults. She is also trained in Dialectical Behaviour Therapy (DBT) from Behavioural Tech Institute, USA.",
    "medicalProblems": [
      {
        "title": "Adolescent & Child Behavioural Issues",
        "description": "Emotional, behavioural and developmental concerns."
      },
      {
        "title": "Relationship & Family Conflicts",
        "description": "Therapy for couples and families."
      },
      {
        "title": "Personality & Emotional Disorders",
        "description": "DBT-based treatment for borderline personality, addictions and eating disorders."
      },
      {
        "title": "Stress, Anxiety & Depression",
        "description": "Holistic evidence-based therapy."
      }
    ],
    "procedures": [
      {
        "title": "Psychotherapy & Counselling",
        "description": "CBT, DBT, family therapy and integrative therapeutic approaches."
      },
      {
        "title": "School Mental Health Programs",
        "description": "Design and implementation of emotional well-being initiatives."
      },
      {
        "title": "Clinical Assessments",
        "description": "Psychological testing and diagnostic evaluations."
      }
    ],
    "faqs": [
      {
        "question": "Is Ms. Mimansa an RCI-licensed psychologist?",
        "answer": "Yes, she holds an M.Phil in Clinical Psychology and is RCI licensed."
      },
      {
        "question": "Does she treat adolescents?",
        "answer": "Yes, adolescent mental health is one of her core areas of expertise."
      },
      {
        "question": "Is she trained in DBT?",
        "answer": "Yes, she received DBT training from Behavioural Tech Institute, USA."
      }
    ]
  }
]
  try {
    for (const doc of doctors) {
      await Doctor.updateOne(
        { slug: doc.slug },   // find by slug
        { $set: doc },        // update everything
        { upsert: true }      // insert if not exists
      );
    }

    res.json({
      message: `${doctors.length} doctors seeded successfully!`
    });
  } catch (err) {
    console.log("Seed Error:", err);
    res.status(500).json({ error: "Seeder Error", details: err.message });
  }
});

// DELETE doctors by hospital name
app.delete("/api/delete-manipal-doctors", async (req, res) => {
  try {
    const hospitalsToDelete = [
      "Manipal Hospitals – Gurugram",
      "Manipal Comprehensive Cancer Centre – North-West Cluster"
    ];

    const result = await Doctor.deleteMany({
      hospital: { $in: hospitalsToDelete }
    });

    return res.json({
      message: "Doctors removed successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Failed to delete doctors" });
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
    "image": "assets/upload/assets/uploads/assets/uploads/medanta.jpg",
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
    "name": "Fortis Memorial Research Institute, Gurgaon",
    "normalizedName": "fortis memorial research",
    "image": "assets/upload/assets/uploads/assets/uploads/fmri.jpg",
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
    "name": "Artemis Hospital, Gurgaon",
    "normalizedName": "artemis",
    "image": "assets/upload/assets/uploads/assets/uploads/artemis.jpg",
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
    "name": "Max Hospital – Saket West | Panchsheel Park | Saket East",
    "normalizedName": "max saket",
    "image": "assets/upload/assets/uploads/assets/uploads/max-saket.jpg",
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
    "name": "Max Hospital – Patparganj",
    "normalizedName": "max patparganj",
    "image": "assets/upload/assets/uploads/assets/uploads/max-patparganj.jpg",
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
    "name": "Amrita Hospital – Faridabad",
    "normalizedName": "amrita faridabad",
    "image": "assets/upload/assets/uploads/assets/uploads/amrita.jpg",
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
    "name": "Metro Heart Institute with Multispeciality",
    "normalizedName": "metro faridabad",
    "image": "assets/upload/assets/uploads/assets/uploads/metro.jpg",
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
    "name": "Paras Health – Gurugram",
    "normalizedName": "paras health gurgaon",
    "image": "assets/upload/assets/uploads/assets/uploads/paras.jpg",
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
    "name": "Asian Institute of Medical Sciences",
    "normalizedName": "asian faridabad",
    "image": "assets/upload/assets/uploads/assets/uploads/asian.jpg",
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
    "name": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "normalizedName": "manipal faridabad",
    "image": "assets/upload/assets/uploads/assets/uploads/manipal.jpg",
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
    const { name, email, phone, message, treatment, country = "", language = "" } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save to DB
    await Contact.create({
      name,
      email,
      phone,
      country,
      language,
      treatment,
      message,
    });

    // EMAIL SETUP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "musaibkm@gmail.com",
        pass: "trdy frzd xxqk wulb", // Use app password
      },
    });

    const mailOptions = {
      from: `"Website Contact" <musaibkm@gmail.com>`,
      replyTo: email,
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
    console.log(err);
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

// ----------------------
//  START SERVER
// ----------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
