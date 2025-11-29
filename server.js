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
 const doctors =[{
  "slug": "dr-manjinder-sandhu",
  "name": "Dr. (Col) Manjinder Sandhu",
  "specialty": "Interventional Cardiology",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director - Cardiology",
  "degree": "MBBS | MD - Medicine | DNB | DM - Cardiology",
  "about": "Dr. (Col) Manjinder Sandhu is a renowned interventional cardiologist with over 35 years of clinical excellence. After a distinguished career in the Indian Army Medical Corps, he transitioned to civilian practice. He is highly skilled in complex angioplasty techniques such as IVUS, OCT, Rotablation, and Laser Angioplasty, as well as structural heart interventions including TAVR and MitraClip. A fellow of major international cardiac societies, he has authored several scientific papers and mentored young cardiologists for over two decades.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages in heart arteries requiring stenting or intervention." },
    { "title": "Structural Heart Diseases", "description": "Valve diseases treated with TAVR, MitraClip and advanced procedures." },
    { "title": "Complex Coronary Lesions", "description": "Calcified and difficult-to-treat arterial blockages." },
    { "title": "Heart Failure & Rhythm Disorders", "description": "Comprehensive management of cardiac dysfunction." }
  ],
  "procedures": [
    { "title": "Complex Angioplasty", "description": "IVUS, OCT, Rotablation and Laser-assisted angioplasty." },
    { "title": "Structural Heart Procedures", "description": "TAVR, MitraClip and transcatheter valve interventions." },
    { "title": "Coronary Stenting", "description": "Advanced stent placement for blocked heart arteries." }
  ],
  "faqs": [
    { "question": "Does Dr. Sandhu perform complex angioplasty?", "answer": "Yes, he is an expert in IVUS, OCT, Rotablation, and laser angioplasty." },
    { "question": "Is he experienced in structural heart procedures?", "answer": "Yes, he specializes in TAVR, MitraClip and minimally invasive valve therapy." },
    { "question": "Does he have military medical experience?", "answer": "Yes, he served with distinction in the Indian Army Medical Corps." }
  ]
},
{
  "slug": "dr-amit-javed",
  "name": "Dr. (Prof.) Amit Javed",
  "specialty": "GI, Bariatric & GI Onco Surgery",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director & HOD - LAP GI, GI Onco, Bariatric & MIS Surgery",
  "degree": "MBBS | MS - General Surgery (PGI Chandigarh) | MCh - GI Surgery (AIIMS) | FACS (USA)",
  "about": "Dr. Amit Javed is an internationally trained GI, GI Onco, and Bariatric surgeon with over 25 years of experience. He has previously worked at UCSF (USA), MSKCC New York, and GB Pant Hospital. Known for performing 1000+ surgeries annually, he is highly skilled in minimal access, robotic, cancer, and advanced hepatobiliary surgeries. He is an avid researcher with over 50 publications and has pioneered several innovative surgical techniques. Humble and patient-centric, he mentors numerous surgeons across India.",
  "medicalProblems": [
    { "title": "Gastrointestinal Cancers", "description": "Esophagus, stomach, pancreas, liver, colon cancers." },
    { "title": "Severe Obesity", "description": "Bariatric and metabolic surgery for weight loss." },
    { "title": "Gallbladder & Liver Diseases", "description": "Stones, tumors and hepatobiliary disorders." },
    { "title": "Complex GI Disorders", "description": "Reflux disease, hernias, colorectal issues." }
  ],
  "procedures": [
    { "title": "Laparoscopic GI Surgery", "description": "Keyhole surgeries for GI and hepatobiliary diseases." },
    { "title": "Bariatric Surgery", "description": "Weight loss procedures including sleeve, bypass and revision surgery." },
    { "title": "GI Cancer Surgery", "description": "Advanced minimally invasive and robotic cancer operations." }
  ],
  "faqs": [
    { "question": "Is Dr. Javed internationally trained?", "answer": "Yes, he has worked at UCSF and MSKCC New York." },
    { "question": "Does he specialize in bariatric surgery?", "answer": "Yes, he performs advanced metabolic and weight loss surgeries." },
    { "question": "Does he perform robotic surgeries?", "answer": "Yes, he is an expert in robotic GI and cancer surgery." }
  ]
},
{
  "slug": "dr-anil-mandhani",
  "name": "Dr. Anil Mandhani",
  "specialty": "Urology & Uro-Oncology",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman - Urology",
  "degree": "MBBS | MS - Surgery | MCh - Urology | DNB - Urology | Fellowship - Robotic Urology (Cornell, New York)",
  "about": "Dr. Anil Mandhani is one of India’s most respected urologists with over 35 years of experience. He has served at SGPGIMS Lucknow as well as top corporate hospitals. His expertise spans robotic uro-oncology, renal transplant, prostate surgery, and complex urological conditions. He has performed over 550+ robotic surgeries and 1000+ kidney transplants. Known for ethical, evidence-based care, he has authored impactful research and received numerous national and international awards.",
  "medicalProblems": [
    { "title": "Kidney & Ureter Disorders", "description": "Stones, strictures, tumors, and advanced urological conditions." },
    { "title": "Prostate Diseases", "description": "BPH, prostate cancer, and complex prostate concerns." },
    { "title": "Urological Cancers", "description": "Kidney, bladder, prostate and testicular cancers." },
    { "title": "Kidney Failure", "description": "Conditions requiring transplant surgery." }
  ],
  "procedures": [
    { "title": "Robotic Uro-Oncology", "description": "Robotic prostatectomy, cystectomy, and kidney surgeries." },
    { "title": "Kidney Transplant", "description": "Living and deceased donor renal transplantation." },
    { "title": "Advanced Endourology", "description": "Laser and minimally invasive kidney stone management." }
  ],
  "faqs": [
    { "question": "Is Dr. Mandhani an expert in robotic surgery?", "answer": "Yes, he has performed more than 550 robotic surgeries." },
    { "question": "Does he perform kidney transplants?", "answer": "Yes, he has performed over 1000 kidney transplants." },
    { "question": "Is he a researcher?", "answer": "Yes, he has several award-winning research contributions." }
  ]
},
{
  "slug": "dr-ankur-bahl",
  "name": "Dr. Ankur Bahl",
  "specialty": "Medical Oncology",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director - Medical Oncology",
  "degree": "MBBS | MD - Medicine | DM - Medical Oncology",
  "about": "Dr. Ankur Bahl is a leading medical oncologist with over 15 years of experience. An alumnus of Maulana Azad Medical College and AIIMS, he specializes in immunotherapy, targeted therapy, chemotherapy, hormonal therapy, and palliative care. He has authored landmark Indian studies on targeted therapy and leukemia. A pioneer in oncology education platforms, he leads national tumor boards and master classes, and has mentored numerous oncology trainees.",
  "medicalProblems": [
    { "title": "Solid Tumors", "description": "Breast, lung, colon, ovarian and other cancers." },
    { "title": "Blood Cancers", "description": "Leukemia, lymphoma, myeloma and related malignancies." },
    { "title": "Metastatic Cancers", "description": "Advanced stage cancers requiring systemic therapy." },
    { "title": "Genetic & Immunologic Tumors", "description": "Cancers treated with immunotherapy and targeted therapy." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Advanced drug therapy for cancer management." },
    { "title": "Immunotherapy", "description": "Immune-based treatments for solid and blood cancers." },
    { "title": "Targeted Therapy", "description": "Precision medicine for genetically-driven cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Bahl specialize in immunotherapy?", "answer": "Yes, he is highly experienced in modern immuno-oncology treatments." },
    { "question": "Has he led major research studies?", "answer": "Yes, he is lead author of landmark Indian cancer data sets." },
    { "question": "Does he train oncology students?", "answer": "Yes, he mentors national and international oncology fellows." }
  ]
},
{
  "slug": "dr-arvind-khurana",
  "name": "Dr. Arvind Kumar Khurana",
  "specialty": "Gastroenterology",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director - Gastroenterology",
  "degree": "MBBS | MD - Medicine | DNB | DM - Gastroenterology | FRCP (Ireland)",
  "about": "Dr. Arvind Khurana is one of India’s most respected gastroenterologists with over 35 years of experience and more than 1,50,000 endoscopic procedures. He has performed over 25,000 CBD stone removals, 2,000 metallic stents, 2,000 PEG placements, and 900 PTBD procedures. He is renowned for advanced pancreaticobiliary endoscopy and neonatal/pediatric endoscopy. He frequently presents research, leads conferences, and contributes significantly to gastroenterology education.",
  "medicalProblems": [
    { "title": "Pancreatic & Biliary Diseases", "description": "Pancreatitis, CBD stones, cholangitis and strictures." },
    { "title": "Gastrointestinal Bleeding", "description": "Emergency and interventional endoscopic control." },
    { "title": "Esophageal & Stomach Disorders", "description": "Reflux, strictures and motility disorders." },
    { "title": "Liver Diseases", "description": "Hepatitis, cirrhosis and liver-related GI complications." }
  ],
  "procedures": [
    { "title": "Advanced Endoscopy", "description": "Diagnostic and therapeutic GI endoscopy." },
    { "title": "ERCP & Biliary Stenting", "description": "CBD stone removal, metallic stenting and pancreatic interventions." },
    { "title": "PEG & PTBD", "description": "Percutaneous feeding tubes and drainage procedures." }
  ],
  "faqs": [
    { "question": "Has Dr. Khurana performed large volumes of endoscopies?", "answer": "Yes, over 1,50,000 procedures." },
    { "question": "Does he perform pediatric endoscopy?", "answer": "Yes, he is skilled in pediatric and neonatal endoscopy." },
    { "question": "Is he a researcher?", "answer": "Yes, he has published and presented several significant studies." }
  ]
},
{
  "slug": "dr-atul-kumar-mittal",
  "name": "Dr. Atul Kumar Mittal",
  "specialty": "ENT (Ear, Nose & Throat)",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director - ENT",
  "degree": "MBBS | MS - ENT",
  "about": "Dr. Atul Kumar Mittal is a highly respected ENT surgeon with over 30 years of clinical and surgical excellence. As Principal Director of ENT at Fortis Gurgaon, he performs more than 800 surgeries annually. His expertise includes endoscopic sinus and skull base surgery, balloon sinuplasty, adenoidectomy, sleep surgery, thyroid and laryngeal surgery, and cochlear implantation. He is known for his precision, leadership, and contributions to ENT research and CMEs.",
  "medicalProblems": [
    { "title": "Chronic Sinusitis", "description": "Long-standing sinus infections requiring endoscopic treatment." },
    { "title": "Sleep Apnea & Snoring", "description": "Airway obstruction causing breathing issues during sleep." },
    { "title": "Thyroid & Laryngeal Disorders", "description": "Voice, airway and thyroid gland-related ENT issues." },
    { "title": "Pediatric ENT Issues", "description": "Adenoid, tonsil, ear infections and airway issues in children." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus & Skull Base Surgery", "description": "Minimally invasive surgery for chronic sinus and skull base problems." },
    { "title": "Balloon Sinuplasty", "description": "Advanced treatment for sinus blockage with minimal downtime." },
    { "title": "Sleep & Airway Surgery", "description": "Surgery for snoring, OSA, and airway correction." },
    { "title": "Cochlear Implant Surgery", "description": "Hearing restoration procedure for severe hearing loss." }
  ],
  "faqs": [
    { "question": "Does Dr. Mittal specialize in sinus surgery?", "answer": "Yes, he is an expert in endoscopic sinus and skull base surgery." },
    { "question": "Does he perform sleep apnea surgery?", "answer": "Yes, he performs advanced sleep and airway surgeries." },
    { "question": "Is he experienced in cochlear implants?", "answer": "Yes, he has extensive experience with cochlear implantation." }
  ]
},
{
  "slug": "dr-balkar-singh",
  "name": "Dr. Balkar Singh",
  "specialty": "Anaesthesiology",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director - Anaesthesiology",
  "degree": "MBBS | MD - Anaesthesiology",
  "about": "Dr. Balkar Singh is a senior anaesthesiologist with over 27 years of experience across major hospitals in India, Nigeria, and Saudi Arabia. He has deep expertise in difficult airway management, critical care anaesthesia, and perioperative safety. He previously served as Head of Department at Primus Hospital (Nigeria) and Senior Consultant at Max Hospital Saket. He is recognized for his precision, leadership, and patient-focused care.",
  "medicalProblems": [
    { "title": "Difficult Airway Conditions", "description": "Complex airway cases requiring advanced anaesthetic management." },
    { "title": "High-Risk Surgical Cases", "description": "Anaesthesia for critical cardiac, neuro, trauma and transplant surgeries." },
    { "title": "Pain & Sedation Management", "description": "Acute and chronic pain requiring anaesthetic expertise." }
  ],
  "procedures": [
    { "title": "General & Regional Anaesthesia", "description": "Anaesthesia for all types of surgeries including high-risk cases." },
    { "title": "Difficult Airway Management", "description": "Specialized airway procedures for complex situations." },
    { "title": "Critical Care Anaesthesia", "description": "Anaesthetic support for ICU and life-threatening emergencies." }
  ],
  "faqs": [
    { "question": "Does Dr. Balkar Singh manage difficult airways?", "answer": "Yes, he is highly experienced in difficult airway management." },
    { "question": "Has he worked internationally?", "answer": "Yes, in Nigeria and Saudi Arabia besides top Indian hospitals." },
    { "question": "Does he handle high-risk surgeries?", "answer": "Yes, he routinely manages anaesthesia for complex surgeries." }
  ]
},
{
  "slug": "dr-gourdas-choudhuri",
  "name": "Dr. (Prof.) Gourdas Choudhuri",
  "specialty": "Gastroenterology & Hepatobiliary Sciences",
  "hospital": "Fortis Memorial Research Institute, Gurgaon",
  "experience": "42+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman - Gastroenterology & Hepatobiliary Sciences",
  "degree": "MBBS | MD - Medicine | DM - Gastroenterology | FACG | FICP | FAMS | FRCPI",
  "about": "Dr. (Prof.) Gourdas Choudhuri is a nationally eminent gastroenterologist with over 42 years of experience. He is the first in India to introduce Endoscopic Ultrasound (EUS) and ESWL for biliary stones. Previously heading SGPGIMS Lucknow, he transformed it into one of India's top GI centers. With over 200 scientific publications, multiple awards, and leadership roles in national societies, he is globally recognized for liver and digestive disease care and advanced endoscopy.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Cirrhosis, hepatitis, fatty liver and chronic liver disorders." },
    { "title": "Pancreatic Disorders", "description": "Acute and chronic pancreatitis, pancreatic tumors." },
    { "title": "Biliary Tract Diseases", "description": "Bile duct stones, strictures, and cholangitis." },
    { "title": "GI Cancers", "description": "Stomach, esophageal, pancreatic, and colorectal cancers." }
  ],
  "procedures": [
    { "title": "Endoscopic Ultrasound (EUS)", "description": "Advanced imaging for pancreas, bile ducts, and GI lesions." },
    { "title": "ESWL for Biliary Stones", "description": "Shockwave lithotripsy for bile duct stone removal." },
    { "title": "Advanced Therapeutic Endoscopy", "description": "EGD, ERCP, colonoscopy and pancreaticobiliary interventions." }
  ],
  "faqs": [
    { "question": "Did Dr. Choudhuri introduce EUS in India?", "answer": "Yes, he was the first to bring EUS to India." },
    { "question": "Is he involved in research?", "answer": "Yes, he has over 200 scientific publications." },
    { "question": "Does he treat complex liver diseases?", "answer": "Yes, he is a national leader in hepatology and complex GI care." }
  ]
}]



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
