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

  medicalProblems: [{
    title: { type: String },
    description: { type: String }
  }],

  procedures: [{
    title: { type: String },
    description: { type: String }
  }],

  faqs: [{
    question: { type: String },
    answer: { type: String }
  }]
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


app.get("/admin/seed-doctor", async (req, res) => {
  const doctors =[
{
  "slug": "dr-alka-kriplani",
  "name": "Dr. Alka Kriplani",
  "specialty": "Obstetrics & Gynecology",
  "hospital": "Paras Health – Gurugram",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson – Obstetrics & Gynecology",
  "degree": "MD | FRCOG | FAMS | FICOG | FICMCH | FIMSA | FCLS",
  "about": "Dr. Alka Kriplani is an eminent and highly respected gynecologist with over four decades of experience. Formerly a senior leader at AIIMS, New Delhi, she is known for her unparalleled expertise in high-risk pregnancy, reproductive endocrinology, gynecological endoscopy, and women’s healthcare. She is a celebrated academician and researcher, widely recognized for her contributions to women's health, medical education, and clinical advancements.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Comprehensive care for complicated and high-risk pregnancies." },
    { "title": "Reproductive Endocrine Disorders", "description": "Management of hormonal disorders affecting women’s reproductive health." },
    { "title": "Gynecological Disorders", "description": "Treatment of menstrual, uterine, hormonal, and menopause-related issues." }
  ],
  "procedures": [
    { "title": "Gynecological Endoscopy", "description": "Advanced laparoscopic and hysteroscopic procedures." },
    { "title": "High-Risk Pregnancy Care", "description": "Specialized monitoring and management for complex pregnancies." },
    { "title": "Reproductive Health Procedures", "description": "Hormonal therapies and reproductive system interventions." }
  ],
  "faqs": [
    { "question": "Is Dr. Alka Kriplani experienced in high-risk pregnancies?", "answer": "Yes, she is one of India's most trusted specialists for high-risk and complicated pregnancies." },
    { "question": "Does she perform gynecological endoscopic procedures?", "answer": "Yes, she is highly skilled in laparoscopic and hysteroscopic surgery." },
    { "question": "Has she received national recognition?", "answer": "Yes, she has received multiple awards including the Padma Shri and Dr. B.C. Roy Award." }
  ]
},
{
  "slug": "dr-mv-padma-srivastava",
  "name": "Dr. M. V. Padma Srivastava",
  "specialty": "Neurology",
  "hospital": "Paras Health – Gurugram",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson – Neurology",
  "degree": "MBBS | MD (AIIMS) | DM (AIIMS) | MAMS | FAMS | FRCP | FNA",
  "about": "Padma Shri Dr. (Prof.) M.V. Padma Srivastava is a globally acclaimed neurologist and a pioneer in stroke medicine, Alzheimer’s disease, and cerebrovascular sciences. She established one of India’s first hyperacute stroke thrombolysis programs and has shaped national stroke guidelines. With a distinguished career as former HOD Neurology at AIIMS, New Delhi, she continues to advance neuroscience care across India.",
  "medicalProblems": [
    { "title": "Stroke (Acute & Chronic)", "description": "Management of ischemic stroke, thrombolysis, and stroke prevention." },
    { "title": "Alzheimer’s Disease", "description": "Diagnosis and treatment of memory loss and neurodegenerative disorders." },
    { "title": "Cerebrovascular Disorders", "description": "Treatment of blood vessel disorders affecting the brain." }
  ],
  "procedures": [
    { "title": "Stroke Thrombolysis", "description": "Hyperacute management for ischemic stroke." },
    { "title": "Neurological Evaluation", "description": "Comprehensive assessment for brain and nerve disorders." },
    { "title": "Cognitive Disorders Management", "description": "Treatment for dementia, Alzheimer’s and memory loss." }
  ],
  "faqs": [
    { "question": "Does Dr. Padma specialize in stroke treatment?", "answer": "Yes, she is a national pioneer in stroke thrombolysis and vascular neurology." },
    { "question": "Does she treat Alzheimer’s disease?", "answer": "Yes, she is a leading expert in Alzheimer's and cognitive disorders." },
    { "question": "Has she worked at AIIMS?", "answer": "Yes, she served as HOD of Neurology and Chief of Neurosciences at AIIMS." }
  ]
},
{
  "slug": "dr-r-ranga-rao",
  "name": "Dr. (Col) R. Ranga Rao",
  "specialty": "Medical Oncology",
  "hospital": "Paras Health – Gurugram",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Oncology",
  "degree": "DM (Oncology) | MD (Internal Medicine) | MBBS",
  "about": "Dr. (Col.) R. Ranga Rao is a highly respected senior oncologist with over 30 years of experience treating solid cancers. Trained at Cancer Institute Adyar and international centers such as MD Anderson Cancer Center (USA), he is known for his work in chemotherapy, targeted therapy, palliative oncology, and establishing cancer centers across India.",
  "medicalProblems": [
    { "title": "Solid Tumors", "description": "Diagnosis and treatment of breast, lung, colon and other solid organ cancers." },
    { "title": "Advanced Cancers", "description": "Management of metastatic and recurrent cancers." },
    { "title": "Palliative Oncology", "description": "Symptom relief and quality-of-life focused cancer care." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Advanced and personalized cancer chemotherapy regimens." },
    { "title": "Targeted Therapy", "description": "Precision medicine for specific tumor genetics." },
    { "title": "Palliative Care Interventions", "description": "Pain management and supportive therapies." }
  ],
  "faqs": [
    { "question": "Does Dr. Rao treat all major solid cancers?", "answer": "Yes, he specializes in a wide range of solid organ cancers." },
    { "question": "Has he trained internationally?", "answer": "Yes, including at MD Anderson Cancer Center, USA." },
    { "question": "Has he received awards?", "answer": "Yes, multiple lifetime achievement awards in oncology." }
  ]
},
{
  "slug": "dr-rajnish-monga",
  "name": "Dr. Rajnish Monga",
  "specialty": "Gastroenterology",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Gastroenterology",
  "degree": "MBBS | MD | DM",
  "about": "Dr. Rajnish Monga is an accomplished gastroenterologist with over 20 years of extensive experience in treating complex gastrointestinal, pancreatic, and colonic diseases. Known for his clinical excellence and research contributions, he serves as Chairman of Gastro Sciences at Paras Health.",
  "medicalProblems": [
    { "title": "Acute Pancreatitis", "description": "Treatment of severe and recurrent pancreatitis." },
    { "title": "Pancreatic Disorders", "description": "Management of pancreatic cysts, tumors, and chronic disease." },
    { "title": "Colonic Diseases", "description": "Treatment of colitis, IBS, polyps, and other colon conditions." }
  ],
  "procedures": [
    { "title": "Endoscopic Procedures", "description": "Diagnostic and therapeutic endoscopy for GI conditions." },
    { "title": "ERCP", "description": "Biliary and pancreatic duct evaluation and treatment." },
    { "title": "EUS", "description": "Endoscopic ultrasound for detailed GI imaging." }
  ],
  "faqs": [
    { "question": "Does Dr. Monga treat pancreatitis?", "answer": "Yes, he specializes in advanced management of pancreatic diseases." },
    { "question": "Does he perform ERCP?", "answer": "Yes, he is skilled in ERCP and other advanced endoscopic procedures." },
    { "question": "Is he experienced in colon disorders?", "answer": "Yes, he manages a wide spectrum of colonic diseases." }
  ]
},
{
  "slug": "dr-sushant-srivastava",
  "name": "Dr. Sushant Srivastava",
  "specialty": "Cardiothoracic & Vascular Surgery (CTVS)",
  "hospital": "Paras Health – Gurugram",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson – CTVS",
  "degree": "MS (General Surgery) | M.Ch (CTVS, AIIMS)",
  "about": "Dr. Sushant Srivastava is a nationally renowned cardiothoracic, vascular and heart-lung transplant surgeon with more than 30 years of experience and over 15,000 complex surgeries. A pioneer in cardiac innovations, he was part of India’s first heart transplant team at AIIMS and introduced breakthrough procedures such as India’s first stitch-less valve implantation and North India's first awake CABG. His expertise spans heart transplants, LVAD implantation, valve repairs, aortic reconstruction, congenital heart surgeries, and minimally invasive cardiac procedures.",
  "medicalProblems": [
    { "title": "Valvular Heart Disease", "description": "Treatment of stenosis, regurgitation and complex valve disorders." },
    { "title": "Coronary Artery Disease", "description": "Surgical treatment of severe blockages requiring bypass surgery." },
    { "title": "Aortic Aneurysms", "description": "Management of thoracic and abdominal aortic aneurysms." },
    { "title": "Heart Failure", "description": "Advanced surgical support including LVAD and transplant." }
  ],
  "procedures": [
    { "title": "Heart Transplant Surgery", "description": "Transplantation for end-stage heart failure patients." },
    { "title": "Beating Heart CABG", "description": "Coronary bypass without stopping the heart." },
    { "title": "Valve Repairs & Replacements", "description": "Including pioneering stitch-less valve implantation." },
    { "title": "Aortic Aneurysm Repair", "description": "Hybrid, open, and endovascular aortic surgery." },
    { "title": "Minimally Invasive Cardiac Surgery", "description": "Small-incision cardiac procedures including awake surgeries." }
  ],
  "faqs": [
    { "question": "Is Dr. Sushant a heart transplant surgeon?", "answer": "Yes, he has extensive experience and was part of India’s first heart transplant team." },
    { "question": "Does he perform minimally invasive CABG?", "answer": "Yes, he pioneered North India's first awake CABG surgery." },
    { "question": "Does he treat aortic aneurysms?", "answer": "Yes, he specializes in hybrid and endovascular aortic surgeries." }
  ]
},
{
  "slug": "dr-vs-mehta",
  "name": "Dr. V. S. Mehta",
  "specialty": "Neurosurgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Neurosurgery",
  "degree": "MBBS | MS (General Surgery) | M.Ch (Neurosurgery, AIIMS)",
  "about": "Dr. V.S. Mehta is one of India’s most distinguished neurosurgeons, a Padma Shri awardee, and former Chief of Neurosciences at AIIMS, New Delhi. With decades of surgical leadership, he is renowned for pioneering neurosurgical advancements and managing highly complex brain and spine disorders. His expertise includes brain stem surgeries, brachial plexus surgery, and brain tumor management. He is widely respected for his contributions to India’s neurosurgical excellence.",
  "medicalProblems": [
    { "title": "Brain Tumors", "description": "Treatment of benign and malignant tumors of the brain." },
    { "title": "Brachial Plexus Injury", "description": "Reconstruction and nerve repair for severe nerve injuries." },
    { "title": "Brain Stem Disorders", "description": "Management of complex and delicate brain stem pathologies." }
  ],
  "procedures": [
    { "title": "Brain Tumor Surgery", "description": "Micro-neurosurgery and minimally invasive tumor removal." },
    { "title": "Brachial Plexus Surgery", "description": "Advanced nerve reconstruction surgeries." },
    { "title": "Complex Skull Base Surgery", "description": "Surgery for deep-seated tumors and brain stem lesions." }
  ],
  "faqs": [
    { "question": "Is Dr. Mehta a Padma Shri awardee?", "answer": "Yes, he has been awarded the Padma Shri for contribution to neurosurgery." },
    { "question": "Does he treat brain tumors?", "answer": "Yes, he is among India’s top specialists for brain tumor surgery." },
    { "question": "Has he worked at AIIMS?", "answer": "Yes, he served as Head of Neurosurgery at AIIMS, New Delhi." }
  ]
},
{
  "slug": "dr-abhay-kapoor",
  "name": "Dr. Abhay Kapoor",
  "specialty": "Interventional Radiology",
  "hospital": "Paras Health – Gurugram",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Interventional Radiology",
  "degree": "FVIR (Medanta) | MD (INHS Asvini) | MBBS (KEM Hospital)",
  "about": "Dr. Abhay Kapoor is a leading interventional radiology specialist with nearly two decades of experience. He has served at premier institutions including KEM Hospital Mumbai, Bombay Hospital, INHS Asvini, GB Pant Hospital Delhi, and Medanta Gurugram. He is credited with performing India’s first same-day TARE procedure and the country's first cryoablation for malignant breast lesions. His expertise includes minimally invasive cancer treatments and liver tumor interventions.",
  "medicalProblems": [
    { "title": "Liver Cancer", "description": "Management of primary and metastatic liver tumors." },
    { "title": "Vascular Disorders", "description": "Minimally invasive treatment of blocked or abnormal vessels." },
    { "title": "Tumor Ablation Needs", "description": "Thermal ablation for tumors in various organs." }
  ],
  "procedures": [
    { "title": "TACE & TARE", "description": "Trans-arterial chemoembolization and radioembolization for liver cancer." },
    { "title": "RFA & MWA", "description": "Radiofrequency and microwave ablation for tumors." },
    { "title": "Cryoablation", "description": "Minimally invasive freezing technique for tumor destruction." }
  ],
  "faqs": [
    { "question": "Does Dr. Abhay Kapoor treat liver cancer?", "answer": "Yes, he specializes in TACE, TARE, and tumor ablation techniques." },
    { "question": "Has he performed breakthrough procedures?", "answer": "Yes, including India's first same-day TARE and first cryoablation for breast malignancy." },
    { "question": "Is he an expert in tumor ablation?", "answer": "Yes, he is highly experienced in RFA, MWA, and cryoablation." }
  ]
},
{
  "slug": "dr-manmohan-singh",
  "name": "Dr. (Prof.) Manmohan Singh",
  "specialty": "Neurosurgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Vice Chairperson – Neurosurgery",
  "degree": "MBBS | MS (Surgery) | M.Ch (Neurosurgery)",
  "about": "Dr. (Prof.) Manmohan Singh is a distinguished neurosurgeon with over 25 years of experience. Former Professor of Neurosurgery and Head of the Gamma Knife Centre at AIIMS, he is widely recognized as a leading expert in neurovascular surgery, skull base surgery, and cavernous sinus tumor management. He is also experienced in advanced radiosurgery and deep brain stimulation for movement disorders.",
  "medicalProblems": [
    { "title": "Skull Base Tumors", "description": "Diagnosis and treatment of complex skull base pathologies." },
    { "title": "Brain Stem Disorders", "description": "Advanced surgical management for delicate brain stem lesions." },
    { "title": "Cavernous Sinus Tumors", "description": "Expert evaluation and surgical treatment of cavernous sinus masses." }
  ],
  "procedures": [
    { "title": "Skull Base Surgery", "description": "Complex surgical procedures for deep-seated brain tumors." },
    { "title": "Gamma Knife Radiosurgery", "description": "Precision radiation treatment for brain disorders." },
    { "title": "Deep Brain Stimulation", "description": "Surgical treatment for Parkinson’s and movement disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Manmohan Singh specialize in skull base surgery?", "answer": "Yes, he is one of India’s top experts in skull base and cavernous sinus surgeries." },
    { "question": "Did he work at AIIMS?", "answer": "Yes, he served as Professor of Neurosurgery and Head of the Gamma Knife Centre." },
    { "question": "Does he offer radiosurgery?", "answer": "Yes, he is highly skilled in Gamma Knife radiosurgery." }
  ]
},
{
  "slug": "dr-amit-bhushan-sharma",
  "name": "Dr. Amit Bhushan Sharma",
  "specialty": "Interventional Cardiology",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Unit Head – Cardiology",
  "degree": "DM Cardiology | Fellowships in Interventional Cardiology, Electrophysiology & Pediatric Device Procedures",
  "about": "Dr. Amit Bhushan Sharma is an accomplished interventional cardiologist known for pioneering multiple structural heart procedures in India. With fellowships from Mount Sinai School of Medicine (New York) and Michigan State University, he has expertise in TAVR, ASD closure, pacemaker implantation, and complex structural interventions. He was the first in India to perform valve replacement without surgery and the first to implant the largest ASD device in the country.",
  "medicalProblems": [
    { "title": "Valve Disorders", "description": "Aortic and mitral valve disease requiring minimally invasive interventions." },
    { "title": "Cardiac Rhythm Disorders", "description": "Management of arrhythmias requiring pacemakers or EP evaluation." },
    { "title": "Congenital Heart Defects", "description": "ASD, VSD and structural heart abnormalities." }
  ],
  "procedures": [
    { "title": "TAVR/TAVI", "description": "Minimally invasive aortic valve replacement." },
    { "title": "ASD Device Closure", "description": "Structural intervention to correct atrial septal defects." },
    { "title": "Leadless Pacemaker Implantation", "description": "Advanced pacemaker procedures requiring no leads." }
  ],
  "faqs": [
    { "question": "Does Dr. Amit specialize in TAVR?", "answer": "Yes, he is one of India’s pioneers in TAVR procedures." },
    { "question": "Is he trained in the US?", "answer": "Yes, he trained at Mount Sinai, New York and Michigan State University." },
    { "question": "Does he treat congenital heart problems?", "answer": "Yes, including ASD closures and pediatric device procedures." }
  ]
},
{
  "slug": "dr-amitava-sengupta",
  "name": "Dr. Amitava Sengupta",
  "specialty": "Paediatrics & Neonatology",
  "hospital": "Paras Health – Gurugram",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Paediatrics & Neonatology",
  "degree": "Fellowship Neonatology (Netherlands) | FNNF | MICP | DCH | MBBS",
  "about": "Dr. Amitava Sengupta is a veteran neonatologist with over four decades of experience in neonatal intensive care and pediatric medicine. He has pioneered NICU development across top hospitals in Delhi-NCR and has trained numerous pediatricians as national faculty. His leadership in national conferences, workshops and NNF programs has helped elevate newborn care standards in India.",
  "medicalProblems": [
    { "title": "High-Risk Newborn Care", "description": "Management of premature, critically ill and extremely low birth weight babies." },
    { "title": "Neonatal Respiratory Disorders", "description": "Advanced NICU treatment for respiratory distress and lung immaturity." },
    { "title": "Pediatric Growth & Development Disorders", "description": "Evaluation and management of developmental issues in children." }
  ],
  "procedures": [
    { "title": "NICU Care", "description": "Comprehensive neonatal intensive care for critically ill newborns." },
    { "title": "Ventilation & Life Support", "description": "Advanced respiratory support for premature infants." },
    { "title": "Neonatal Screening", "description": "Early detection of metabolic and congenital disorders." }
  ],
  "faqs": [
    { "question": "Is Dr. Sengupta specialized in neonatology?", "answer": "Yes, he has over 40 years of experience in newborn and NICU care." },
    { "question": "Does he treat premature babies?", "answer": "Yes, he is highly skilled in managing extremely premature and critical newborns." },
    { "question": "Is he active in academic teaching?", "answer": "Yes, he regularly leads national programs, workshops and CMEs." }
  ]
},
{
  "slug": "dr-ankur-garg",
  "name": "Dr. Ankur Garg",
  "specialty": "Liver Transplant, HPB & GI Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Group Director & HOD – Liver Transplant",
  "degree": "MBBS | MS (General Surgery) | MCh (HPB Surgery & Liver Transplant) | Fellow – European Board of Surgery (FEBS)",
  "about": "Dr. Ankur Garg is a globally acclaimed liver transplant and HPB surgeon with over 25 years of experience. With more than 2,500 liver transplants and 1,500+ complex HPB and GI surgeries, he is recognized as one of India’s top experts in liver transplantation and hepatobiliary cancer care. Currently serving as Group Director of Liver Transplant and GI Surgery at Paras Health, Dr. Garg is known for his precision, compassionate approach, and expertise in advanced liver transplant techniques.",
  "medicalProblems": [
    { "title": "End-Stage Liver Disease", "description": "Evaluation and management of advanced liver failure requiring transplant." },
    { "title": "Liver & GI Cancers", "description": "Treatment of liver cancer, pancreatic cancer, bile duct cancer and GI tumors." },
    { "title": "Acute Liver Failure", "description": "Emergency treatment and transplant evaluation for sudden liver failure." },
    { "title": "Bile Duct Injuries", "description": "Advanced surgical repair for bile duct strictures and injuries." }
  ],
  "procedures": [
    { "title": "Living Donor Liver Transplant (LDLT)", "description": "Transplant procedures using a healthy living donor." },
    { "title": "ABO-Incompatible Liver Transplant", "description": "Specialized liver transplant across blood group mismatch." },
    { "title": "Pediatric & Dual Lobe Liver Transplant", "description": "Transplants for infants and complex dual-lobe donor procedures." },
    { "title": "Cadaveric Liver Transplant", "description": "Transplantation using deceased donor organs." },
    { "title": "Complex Liver Resections", "description": "Advanced surgery for liver tumors, cysts, and abnormalities." },
    { "title": "HPB Cancer Surgery", "description": "Surgery for cancers of the liver, pancreas, and biliary tract." }
  ],
  "faqs": [
    { "question": "How many liver transplants has Dr. Ankur Garg performed?", "answer": "He has performed over 2,500 liver transplants and 1,500+ HPB surgeries." },
    { "question": "Does Dr. Garg perform pediatric liver transplants?", "answer": "Yes, he specializes in pediatric and dual-lobe liver transplants." },
    { "question": "Is he trained in complex liver cancer surgery?", "answer": "Yes, he is an expert in advanced HPB and GI cancer surgeries." }
  ]
},
{
  "slug": "dr-arunesh-kumar",
  "name": "Dr. Arunesh Kumar",
  "specialty": "Pulmonology & Respiratory Medicine",
  "hospital": "Paras Health – Gurugram",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Pulmonology",
  "degree": "MBBS (Hons.) | DNB | MRCP (UK) | MRCP Respiratory Medicine (UK) | CCST (UK) | FRCP (London)",
  "about": "Dr. Arunesh Kumar is an internationally trained pulmonologist with over 23 years of experience in India and the UK. Trained at one of Europe’s largest respiratory centers in Leeds, he has deep expertise in lung cancer, advanced respiratory diagnostics, interventional bronchoscopy, thoracoscopy, EBUS TBNA, and severe asthma treatment. As a UK-trained NHS consultant, he brings global clinical excellence combined with compassionate patient care.",
  "medicalProblems": [
    { "title": "Lung Cancer", "description": "Diagnosis, staging and advanced treatment for primary and metastatic lung cancer." },
    { "title": "Severe Asthma", "description": "Management of steroid-resistant and biologic therapy–eligible asthma." },
    { "title": "Interstitial Lung Disease (ILD)", "description": "Evaluation and treatment of fibrosis and chronic lung diseases." },
    { "title": "Sleep Apnea & Sleep Disorders", "description": "Diagnosis and management of sleep-related breathing issues." }
  ],
  "procedures": [
    { "title": "Interventional Bronchoscopy", "description": "Advanced bronchoscopy for diagnosis and therapeutic interventions." },
    { "title": "EBUS TBNA", "description": "Minimally invasive biopsy for lung cancer staging." },
    { "title": "Thoracoscopy", "description": "Procedure for pleural diseases and fluid drainage." },
    { "title": "Pulmonary Function Testing", "description": "Comprehensive assessment of lung capacity and function." }
  ],
  "faqs": [
    { "question": "Is Dr. Arunesh trained in the UK?", "answer": "Yes, he has spent years working as a consultant in leading NHS hospitals." },
    { "question": "Does he treat lung cancer?", "answer": "Yes, he specializes in lung cancer diagnosis and advanced interventions." },
    { "question": "Does he perform EBUS TBNA?", "answer": "Yes, he has performed over 3,000 EBUS TBNA procedures." }
  ]
},
{
  "slug": "dr-arvind-mehra",
  "name": "Dr. Arvind Mehra",
  "specialty": "Orthopaedics & Trauma Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director & HOD – Orthopaedics",
  "degree": "MCh | ALSSE | MS | MBBS",
  "about": "Dr. Arvind Mehra is a highly respected orthopedic surgeon with 20+ years of experience in complex trauma, joint disorders, spine surgery, fractures, and pediatric orthopedics. He has performed over 20,000 successful surgeries, specializing in minimally invasive and stitch-less corrective techniques for deformity correction and limb-length discrepancies.",
  "medicalProblems": [
    { "title": "Complex Fractures", "description": "Comprehensive management of traumatic bone injuries." },
    { "title": "Joint Disorders", "description": "Treatment of knee, hip, and shoulder joint diseases." },
    { "title": "Pediatric Orthopedic Conditions", "description": "Management of deformities and developmental bone issues." }
  ],
  "procedures": [
    { "title": "Joint Replacement Surgery", "description": "Knee, hip, and shoulder replacement procedures." },
    { "title": "Spine Surgery", "description": "Minimally invasive spine procedures for disc and nerve problems." },
    { "title": "Deformity Correction", "description": "Stitch-less correction for limb length and bone deformities." }
  ],
  "faqs": [
    { "question": "Does Dr. Mehra perform joint replacements?", "answer": "Yes, he specializes in knee, hip, and shoulder replacements." },
    { "question": "Does he treat pediatric orthopedic problems?", "answer": "Yes, he is experienced in deformity correction and limb-length treatments." },
    { "question": "Is he experienced in trauma surgery?", "answer": "Yes, he has performed over 20,000 trauma and orthopedic surgeries." }
  ]
},
{
  "slug": "dr-bharat-kukreti",
  "name": "Dr. Bharat B. Kukreti",
  "specialty": "Cardiology",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Unit Head – Cardiology",
  "degree": "DM Cardiology (AIIMS) | MD Medicine | MBBS",
  "about": "Dr. Bharat B. Kukreti is a highly accomplished cardiologist known for his expertise in advanced coronary interventions, device closures for congenital heart defects, and electrophysiology procedures. With training from AIIMS and over two decades of clinical experience, he is respected for his precision, patient-centered approach, and contributions to interventional cardiology research.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Diagnosis and treatment of blockages and heart attack management." },
    { "title": "Congenital Heart Defects", "description": "ASD, VSD and structural heart abnormalities." },
    { "title": "Arrhythmias & Rhythm Disorders", "description": "Evaluation of abnormal heart rhythms requiring EPS and RF ablation." }
  ],
  "procedures": [
    { "title": "Coronary Angiography & Angioplasty", "description": "PTCA with stent placement for blocked arteries." },
    { "title": "ASD & VSD Device Closure", "description": "Minimally invasive structural heart procedures." },
    { "title": "AICD & Aortic Stent Grafting", "description": "Advanced device implantation for heart rhythm and aortic diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Kukreti specialize in angioplasty?", "answer": "Yes, he is highly experienced in PTCA and coronary interventions." },
    { "question": "Does he treat congenital heart defects?", "answer": "Yes, he performs device closures for ASD and VSD." },
    { "question": "Has he received national awards?", "answer": "Yes, he has won notable awards including the Dr. Naveen C Nanda Young Investigator Award." }
  ]
},
{
  "slug": "dr-indu-bansal-aggarwal",
  "name": "Dr. Indu Bansal Aggarwal",
  "specialty": "Radiation Oncology",
  "hospital": "Paras Health – Gurugram",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Group Director & HOD – Radiation Oncology",
  "degree": "MD (Radiation Oncology) | Diploma in Hospital Management | MBBS",
  "about": "Dr. Indu Bansal Aggarwal is a senior radiation oncologist with over 25 years of experience and international training from MD Anderson Cancer Center, Houston. She specializes in pediatric tumors, head and neck cancers, and radiation oncology in young adults. A compassionate clinician, she is also a strong advocate for cancer awareness and patient support.",
  "medicalProblems": [
    { "title": "Pediatric Cancers", "description": "Radiation treatment for tumors in children and young adults." },
    { "title": "Head & Neck Cancer", "description": "Advanced radiation therapy for complex tumors." },
    { "title": "Solid Tumors", "description": "Radiation treatment for breast, lung, brain, and GI cancers." }
  ],
  "procedures": [
    { "title": "Advanced Radiation Therapy", "description": "Precision radiation using state-of-the-art technology." },
    { "title": "Intensity-Modulated Radiotherapy (IMRT)", "description": "Targeted radiation minimizing damage to healthy tissue." },
    { "title": "Image-Guided Radiotherapy (IGRT)", "description": "High accuracy radiation for difficult tumor locations." }
  ],
  "faqs": [
    { "question": "Does Dr. Indu treat pediatric cancers?", "answer": "Yes, she specializes in radiation therapy for pediatric tumors." },
    { "question": "Has she trained internationally?", "answer": "Yes, including training at MD Anderson Cancer Center, USA." },
    { "question": "Does she perform advanced radiation techniques?", "answer": "Yes, she is proficient in IMRT, IGRT and other modern techniques." }
  ]
},
{
  "slug": "dr-mandeep-singh",
  "name": "Dr. Mandeep Singh",
  "specialty": "Plastic, Cosmetic & Reconstructive Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Plastic Surgery",
  "degree": "MBBS | MS | DNB (Plastic Surgery)",
  "about": "Dr. Mandeep Singh is a board-certified plastic surgeon with more than 20 years of experience in cosmetic, reconstructive, and aesthetic surgery. Having trained across India and the USA, he is skilled in a full spectrum of cosmetic procedures, trauma reconstruction, burn management, and advanced aesthetic enhancements. He is known for delivering natural, safe, and aesthetic results with high patient satisfaction.",
  "medicalProblems": [
    { "title": "Cosmetic Concerns", "description": "Aesthetic correction for face, body, and skin concerns." },
    { "title": "Reconstructive Needs", "description": "Treatment of trauma, burns, scars, and congenital abnormalities." },
    { "title": "Breast & Body Contouring Issues", "description": "Management of body shape concerns requiring cosmetic surgery." }
  ],
  "procedures": [
    { "title": "Cosmetic Surgery", "description": "Rhinoplasty, liposuction, facelift, tummy tuck, breast enhancement." },
    { "title": "Reconstructive Surgery", "description": "Post-trauma reconstruction, burn surgery, and congenital corrections." },
    { "title": "Aesthetic Procedures", "description": "Laser treatments, Botox, fillers, scar revision, and anti-aging therapies." }
  ],
  "faqs": [
    { "question": "Does Dr. Mandeep perform cosmetic surgery?", "answer": "Yes, he specializes in a wide range of cosmetic and aesthetic procedures." },
    { "question": "Is he trained internationally?", "answer": "Yes, he has received advanced training in India and the USA." },
    { "question": "Does he treat reconstructive cases?", "answer": "Yes, including trauma, burns, and congenital deformities." }
  ]
},
{
  "slug": "dr-nitin-jain",
  "name": "Dr. Nitin Jain",
  "specialty": "Critical Care & Intensive Care Medicine",
  "hospital": "Paras Health – Gurugram",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Critical Care",
  "degree": "EDIC | MD | MBBS",
  "about": "Dr. Nitin Jain is a highly experienced critical care specialist with over 18 years in intensive care medicine. Trained in ECMO and lung transplantation at Toronto General Hospital, he has served as faculty at premier institutes like UCMS, ILBS, and Manipal, and worked as Senior Consultant at Fortis Gurgaon. He is known for managing complex ICU cases, multi-organ failure, sepsis, trauma, and advanced ventilatory support.",
  "medicalProblems": [
    { "title": "Sepsis & Multi-Organ Failure", "description": "Advanced ICU management for critically ill patients." },
    { "title": "Respiratory Failure", "description": "Management requiring ventilatory and ECMO support." },
    { "title": "Post-Surgical & Trauma Care", "description": "Critical care for polytrauma and major surgeries." }
  ],
  "procedures": [
    { "title": "ECMO", "description": "Life-saving extracorporeal membrane oxygenation support." },
    { "title": "Advanced Ventilation", "description": "Mechanical ventilation for respiratory and neurological failure." },
    { "title": "Critical Care Ultrasound", "description": "Point-of-care diagnosis in ICU patients." }
  ],
  "faqs": [
    { "question": "Is Dr. Jain trained in ECMO?", "answer": "Yes, he received ECMO and lung transplant training in Toronto, Canada." },
    { "question": "Does he treat multi-organ failure?", "answer": "Yes, he is highly experienced in complex ICU management." },
    { "question": "Is he an academic teacher?", "answer": "Yes, he teaches DNB and IDCCM students." }
  ]
},
{
  "slug": "dr-pn-gupta",
  "name": "Dr. P. N. Gupta",
  "specialty": "Nephrology & Kidney Transplant",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Nephrology",
  "degree": "DNB (Nephrology) | MD | MBBS | Fellowship in Kidney Transplantation",
  "about": "Dr. P. N. Gupta is a leading nephrologist with over 15 years of experience and more than 800 kidney transplants supervised. He has extensive expertise in chronic kidney disease, dialysis care, renal failure management, and transplant medicine. As a visiting fellow at Johns Hopkins Hospital, USA, he brings global expertise to advanced renal care.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease (CKD)", "description": "Comprehensive management of early to advanced CKD." },
    { "title": "Kidney Failure", "description": "Treatment of end-stage renal disease requiring dialysis or transplant." },
    { "title": "Transplant Care", "description": "Pre- and post-kidney transplant evaluation and management." }
  ],
  "procedures": [
    { "title": "Kidney Transplantation", "description": "Expert management of donor and recipient transplant procedures." },
    { "title": "Hemodialysis & Peritoneal Dialysis", "description": "Renal replacement therapy for kidney failure." },
    { "title": "Renal Biopsy", "description": "Diagnostic biopsy to identify underlying kidney diseases." }
  ],
  "faqs": [
    { "question": "How many kidney transplants has Dr. Gupta managed?", "answer": "He has supervised over 800 kidney transplants." },
    { "question": "Is he trained internationally?", "answer": "Yes, he was a visiting fellow at Johns Hopkins Hospital, USA." },
    { "question": "Does he manage CKD patients?", "answer": "Yes, he specializes in all stages of CKD and renal failure." }
  ]
},
{
  "slug": "dr-rajesh-kumar",
  "name": "Dr. Rajesh Kumar",
  "specialty": "Internal Medicine",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Internal Medicine",
  "degree": "MD (Medicine) | MBBS",
  "about": "Dr. Rajesh Kumar is a highly skilled internal medicine specialist with over 15 years of clinical experience. He excels in managing infectious diseases, vector-borne illnesses, chronic medical conditions, and emergency care. As a certified ACLS trainer, he is also committed to preventive healthcare and lifestyle medicine for long-term well-being.",
  "medicalProblems": [
    { "title": "Infectious Diseases", "description": "Management of dengue, malaria, typhoid, and viral illnesses." },
    { "title": "Chronic Medical Conditions", "description": "Treatment of diabetes, hypertension, thyroid disorders, and metabolic diseases." },
    { "title": "General Medical Care", "description": "Routine health evaluation and preventive medicine." }
  ],
  "procedures": [
    { "title": "Emergency Procedures", "description": "Lumbar puncture, ventilatory support, IV therapy, catheter management." },
    { "title": "Preventive Health Checkups", "description": "Lifestyle, metabolic and risk evaluation screenings." },
    { "title": "Infection Control Treatments", "description": "Advanced management for severe infections and sepsis." }
  ],
  "faqs": [
    { "question": "Does Dr. Rajesh treat dengue and malaria?", "answer": "Yes, he specializes in infectious and vector-borne diseases." },
    { "question": "Is he an ACLS trainer?", "answer": "Yes, he trains healthcare providers in emergency cardiac care." },
    { "question": "Does he focus on preventive health?", "answer": "Yes, he strongly advocates preventive medicine and long-term wellness." }
  ]
},
{
  "slug": "dr-sumit-bhatia",
  "name": "Dr. Sumit Bhatia",
  "specialty": "Gastroenterology",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Gastroenterology",
  "degree": "MD (Internal Medicine) | DM (Medical Gastroenterology) | Fellowships in Advanced Endoscopy & EUS",
  "about": "Dr. Sumit Bhatia is a highly accomplished gastroenterologist with extensive national and international training. He specializes in inflammatory bowel disease, ERCP, EUS, and therapeutic endoscopy. With advanced fellowships from Berenson International, Beth Israel Hospital (Harvard Medical School, USA), Medanta Gurugram, and Asan Medical Center Korea, he is recognized for his precision and expertise in advanced endoscopic procedures.",
  "medicalProblems": [
    { "title": "Inflammatory Bowel Disease", "description": "Management of Crohn’s disease and ulcerative colitis." },
    { "title": "Pancreatic & Biliary Disorders", "description": "Treatment for pancreatitis, gallstones and bile duct diseases." },
    { "title": "Gastrointestinal Disorders", "description": "Evaluation of acid reflux, IBS, bleeding, and digestive issues." }
  ],
  "procedures": [
    { "title": "ERCP", "description": "Endoscopic procedure for pancreatic and biliary disorders." },
    { "title": "EUS", "description": "Endoscopic ultrasound for advanced GI diagnostics." },
    { "title": "Therapeutic Endoscopy", "description": "Polyps removal, bleeding control and interventional procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Bhatia trained internationally?", "answer": "Yes, including training at Harvard (Beth Israel), Korea and Medanta." },
    { "question": "Does he perform ERCP & EUS?", "answer": "Yes, he is highly experienced in both advanced GI procedures." },
    { "question": "Does he treat IBD?", "answer": "Yes, he specializes in Crohn's disease and ulcerative colitis." }
  ]
},
{
  "slug": "dr-vaibhaw-kumar",
  "name": "Dr. Vaibhaw Kumar",
  "specialty": "Liver Transplant & HPB Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Liver Transplant",
  "degree": "MBBS | MS (Surgery) | MCh (HPB Surgery & Liver Transplant) | FALS",
  "about": "Dr. Vaibhaw Kumar is a highly accomplished liver transplant and HPB surgeon with over 15 years of expertise. Trained at ILBS under leading national and international faculty, he has played a key role in establishing one of India’s largest public-sector liver transplant units. With experience in more than 2,000 liver transplants and complex HPB surgeries, he is known for exceptional surgical precision, clinical excellence, and compassionate patient care.",
  "medicalProblems": [
    { "title": "End-Stage Liver Disease", "description": "Management of advanced liver failure requiring transplant." },
    { "title": "Liver Cancer", "description": "Treatment of hepatocellular carcinoma and metastatic liver tumors." },
    { "title": "Pancreatic & Biliary Disorders", "description": "Surgical management of pancreatic tumors, bile duct injuries, and gallbladder diseases." }
  ],
  "procedures": [
    { "title": "Living Donor Liver Transplant (LDLT)", "description": "Advanced transplant procedures using partial liver grafts from living donors." },
    { "title": "Cadaveric Liver Transplant", "description": "Transplantation using deceased donor organs for eligible patients." },
    { "title": "Complex HPB Surgeries", "description": "Surgery for pancreatic, bile duct, liver tumors and GI cancers." }
  ],
  "faqs": [
    { "question": "How many liver transplants has Dr. Vaibhaw performed?", "answer": "He has been part of more than 2,000 liver transplants and complex HPB surgeries." },
    { "question": "Where was he trained?", "answer": "He received advanced HPB and liver transplant training at ILBS, Delhi." },
    { "question": "Does he operate on bile duct injuries?", "answer": "Yes, he specializes in complex HPB surgeries including bile duct reconstruction." }
  ]
},
{
  "slug": "dr-vivek-logani",
  "name": "Dr. Vivek Logani",
  "specialty": "Orthopaedics – Joint Replacement & Robotics",
  "hospital": "Paras Health – Gurugram",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Orthopaedics",
  "degree": "MBBS | MS (Orthopaedics) | DNB (Orthopaedics) | MNAMS",
  "about": "Dr. Vivek Logani is a leading orthopedic surgeon with over 23 years of experience, specializing in joint replacement, revision arthroplasty, and robotic-assisted knee and hip procedures. With more than 8,000 joint replacements and over 400 revision surgeries, he is one of India’s pioneers in computer navigation and robotics. He performs 100% of knee replacements with navigation and is deeply involved in research, implant design, and advanced arthroplasty technologies.",
  "medicalProblems": [
    { "title": "Knee Arthritis", "description": "Management of severe knee pain requiring partial or total knee replacement." },
    { "title": "Hip Joint Disorders", "description": "Treatment for arthritis, AVN, fractures and hip degeneration." },
    { "title": "Shoulder & Elbow Disorders", "description": "Management of degeneration, trauma and joint dysfunction." }
  ],
  "procedures": [
    { "title": "Robotic Knee Replacement", "description": "Precision knee replacement using robotic and navigation systems." },
    { "title": "Hip Replacement Surgery", "description": "Total and partial hip arthroplasty with advanced techniques." },
    { "title": "Revision Joint Replacement", "description": "Complex re-operations for failed or problematic implants." }
  ],
  "faqs": [
    { "question": "Does Dr. Logani use robotics for joint replacement?", "answer": "Yes, he is among India’s earliest adopters of robotic and computer-navigated joint replacement." },
    { "question": "How many joint replacements has he performed?", "answer": "He has performed over 8,000 joint replacements and 400 revision surgeries." },
    { "question": "Does he perform partial knee replacements?", "answer": "Yes, including unicondylar knee replacements with high precision." }
  ]
},
{
  "slug": "dr-seema-sharma",
  "name": "Dr. Seema Sharma",
  "specialty": "Obstetrics & Gynecology",
  "hospital": "Paras Health – Gurugram",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Obstetrics & Gynecology",
  "degree": "MS (Obs & Gyne) | Fellowship in Minimal Access Surgery | MBBS",
  "about": "Dr. Seema Sharma is a highly experienced obstetrician and gynecologist with more than 22 years of expertise in high-risk pregnancy care, infertility management, and advanced laparoscopic surgery. Known for her precise decision-making in critical situations, she is dedicated to providing safe, evidence-based women’s healthcare with compassion and skill.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Specialized care for pregnancy complications and maternal risk factors." },
    { "title": "Infertility Issues", "description": "Evaluation and treatment for conception challenges and hormonal disorders." },
    { "title": "Gynecological Conditions", "description": "Management of uterine, ovarian, menstrual and reproductive issues." }
  ],
  "procedures": [
    { "title": "Laparoscopic Gynecologic Surgery", "description": "Minimally invasive surgeries for fibroids, cysts, endometriosis." },
    { "title": "Infertility Treatments", "description": "Ovulation induction, hormonal therapy and reproductive counseling." },
    { "title": "Pregnancy Care", "description": "Comprehensive antenatal, intranatal and postnatal care." }
  ],
  "faqs": [
    { "question": "Does Dr. Seema handle high-risk pregnancies?", "answer": "Yes, she specializes in managing complex pregnancy conditions." },
    { "question": "Is she trained in minimally invasive surgery?", "answer": "Yes, she holds a Fellowship in Minimal Access Surgery." },
    { "question": "Does she treat infertility?", "answer": "Yes, she offers comprehensive infertility evaluation and treatment." }
  ]
},
{
  "slug": "dr-vikash-goyal",
  "name": "Dr. Vikash Goyal",
  "specialty": "Cardiology",
  "hospital": "Paras Health – Gurugram",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Cardiology",
  "degree": "DM Cardiology | MD (Medicine) – Gold Medalist | MBBS",
  "about": "Dr. Vikash Goyal is an interventional and preventive cardiology expert with over 8 years of experience. Having performed more than 10,000 angiographies and 6,000 angioplasties, he specializes in complex coronary interventions, TAVI, valve treatments, and pediatric cardiology. A gold medalist and trained at premier institutes like Jayadeva Institute and Fortis Escorts, he is known for precision, patient education, and advanced cardiac care.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Diagnosis and treatment of blockages and heart attack risk." },
    { "title": "Heart Valve Disorders", "description": "Advanced catheter-based treatments for valve diseases." },
    { "title": "Pediatric Cardiac Conditions", "description": "Management of congenital defects and pediatric interventions." }
  ],
  "procedures": [
    { "title": "Angiography & Angioplasty (PTCA)", "description": "Interventions for blocked coronary arteries." },
    { "title": "TAVI", "description": "Transcatheter Aortic Valve Implantation for valve replacement without open surgery." },
    { "title": "Complex Coronary Interventions", "description": "Specialized angioplasties for chronic total occlusions and bifurcation lesions." }
  ],
  "faqs": [
    { "question": "How many angioplasties has Dr. Goyal performed?", "answer": "He has performed over 6,000 angioplasties and 10,000 angiographies." },
    { "question": "Does he perform TAVI?", "answer": "Yes, he is trained in advanced valve interventions like TAVI." },
    { "question": "Does he treat pediatric heart issues?", "answer": "Yes, he has expertise in pediatric cardiology." }
  ]
},
{
  "slug": "dr-amitabh-malik",
  "name": "Dr. Amitabh Malik",
  "specialty": "ENT, Head & Neck Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief & HOD – ENT",
  "degree": "MBBS | MS (ENT) | F.A.G.E",
  "about": "Dr. Amitabh Malik is a senior ENT and Head & Neck surgeon with over 25 years of expertise. He specializes in micro ear surgery, micro laryngeal procedures, endoscopic sinus surgery, pediatric ENT and black fungus treatment. Known for precision and excellence, he has performed thousands of successful ENT surgeries and has a strong interest in cochlear implants.",
  "medicalProblems": [
    { "title": "Sinus & Nasal Disorders", "description": "Treatment for sinusitis, nasal blockage and polyps." },
    { "title": "Ear Conditions", "description": "Management of hearing loss, ear discharge, perforation and infections." },
    { "title": "Throat & Voice Problems", "description": "Treatment for vocal cord disorders, hoarseness and airway obstruction." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive surgical treatment for sinus diseases." },
    { "title": "Micro Ear Surgery", "description": "Advanced procedures for ear repair and hearing improvement." },
    { "title": "Micro Laryngeal Surgery", "description": "Voice and vocal cord surgeries using micro techniques." }
  ],
  "faqs": [
    { "question": "Does Dr. Malik perform sinus surgery?", "answer": "Yes, he is an expert in advanced endoscopic sinus surgery." },
    { "question": "Does he treat pediatric ENT cases?", "answer": "Yes, he is highly experienced in pediatric ENT surgeries." },
    { "question": "Does he perform cochlear implants?", "answer": "Yes, he has a strong interest and expertise in cochlear implantation." }
  ]
},
{
  "slug": "dr-anurag-khaitan",
  "name": "Dr. Anurag Khaitan",
  "specialty": "Urology & Renal Sciences",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief & HOD – Urology",
  "degree": "MBBS | MS (PGI Chandigarh) | DNB (Genitourinary Surgery) | MCh (Urology, AIIMS)",
  "about": "Dr. Anurag Khaitan is a highly recognized urologist with deep expertise in robotic surgery, prostate cancer management, reconstructive urology, and complex genitourinary procedures. With prestigious training from AIIMS, PGI Chandigarh and PGI Rohtak, he leads Renal Sciences at Paras Health and is respected for his surgical precision, compassionate care, and excellence in minimally invasive urology.",
  "medicalProblems": [
    { "title": "Prostate Cancer", "description": "Evaluation and treatment of early and advanced prostate malignancies." },
    { "title": "Kidney & Urinary Tract Disorders", "description": "Management of stones, infections, urinary obstruction, and renal masses." },
    { "title": "Reconstructive Urology Needs", "description": "Treatment of urethral strictures, trauma reconstruction, and congenital abnormalities." }
  ],
  "procedures": [
    { "title": "Robotic Urological Surgery", "description": "Precision robotic procedures for prostate, kidney and urinary tract surgeries." },
    { "title": "Laser Prostate Surgery", "description": "Minimally invasive treatment for enlarged prostate and urinary obstruction." },
    { "title": "Urological Cancer Surgery", "description": "Advanced surgical management for prostate, bladder, and kidney cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Khaitan perform robotic surgery?", "answer": "Yes, he is highly experienced in robotic urological procedures." },
    { "question": "Does he treat prostate cancer?", "answer": "Yes, he is a specialist in prostate cancer surgeries including robotic prostatectomy." },
    { "question": "Is he trained at AIIMS?", "answer": "Yes, he completed his MCh in Urology at AIIMS New Delhi." }
  ]
},
{
  "slug": "dr-manish-mannan",
  "name": "Dr. Manish Mannan",
  "specialty": "Paediatrics & Neonatology",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head of Department – Paediatrics & Neonatology",
  "degree": "MBBS | DCH | Senior Research Fellowship (ICMR)",
  "about": "Dr. (Maj) Manish Mannan is a leading pediatrician with over 20 years of experience. Trained at the Army Hospital (R&R), AIIMS New Delhi, and Sitaram Bhartia, he has served the Indian Army Medical Corps for 5 years. He has contributed to multiple national and international research projects with ICMR, WHO, USAID and INCLEN. He specializes in general pediatrics, newborn care, growth & development, and parenting counselling.",
  "medicalProblems": [
    { "title": "General Pediatric Illnesses", "description": "Management of infections, fever, allergies, and routine childhood disorders." },
    { "title": "Newborn Care", "description": "Specialized management for newborn health, growth, feeding, and screening." },
    { "title": "Growth & Development Disorders", "description": "Evaluation of developmental delays, nutrition and behavioral challenges." }
  ],
  "procedures": [
    { "title": "Immunization & Vaccination", "description": "Complete vaccination schedules as per international guidelines." },
    { "title": "Developmental Assessments", "description": "Screening for cognitive, motor, language and social milestones." },
    { "title": "Newborn & Pediatric Evaluation", "description": "Routine newborn checkups, feeding guidance, and pediatric care." }
  ],
  "faqs": [
    { "question": "Has Dr. Mannan worked with the Indian Army?", "answer": "Yes, he served 5 years in the Army Medical Corps." },
    { "question": "Does he handle newborn care?", "answer": "Yes, he is experienced in neonatal and pediatric care across all age groups." },
    { "question": "Is he involved in research?", "answer": "Yes, he has contributed to ICMR, WHO, USAID and national pediatric programs." }
  ]
},
{
  "slug": "dr-meenakshi-sharma",
  "name": "Dr. Meenakshi Sharma",
  "specialty": "General, Minimal Access, GI & Bariatric Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "26+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief & HOD – General, Minimal Access, GI & Bariatric Surgery",
  "degree": "MBBS | MS | DNB (Surgery)",
  "about": "Dr. Meenakshi Sharma is a renowned surgeon with over 26 years of expertise in hernia surgery, minimal access surgery, bariatric procedures, and trauma surgery. She is extensively trained with fellowships from the Cleveland Clinic (USA) and the University of Ulm (Germany). Known for her precision and advanced laparoscopic skills, she leads the Hernia & Minimal Access Surgery division at Paras Hospitals.",
  "medicalProblems": [
    { "title": "Hernias", "description": "Management of umbilical, inguinal, ventral and incisional hernias." },
    { "title": "Gastrointestinal Disorders", "description": "Treatment for gallbladder disease, reflux, GI pain and digestive problems." },
    { "title": "Obesity & Metabolic Disorders", "description": "Surgical options for extreme obesity and metabolic syndrome." }
  ],
  "procedures": [
    { "title": "Laparoscopic Hernia Repair", "description": "Minimally invasive surgeries for all types of hernias." },
    { "title": "Bariatric Surgery", "description": "Weight loss surgeries including sleeve gastrectomy and gastric bypass." },
    { "title": "Advanced Laparoscopic Procedures", "description": "Gallbladder, appendectomy, abdominal wall reconstruction and GI surgeries." }
  ],
  "faqs": [
    { "question": "Is Dr. Meenakshi an expert in hernia surgery?", "answer": "Yes, she specializes in all types of hernias with minimal access techniques." },
    { "question": "Has she trained internationally?", "answer": "Yes, she completed fellowships at Cleveland Clinic (USA) and Ulm University (Germany)." },
    { "question": "Does she perform bariatric surgery?", "answer": "Yes, she specializes in obesity and advanced GI surgeries." }
  ]
},
{
  "slug": "dr-sageer-aazaz",
  "name": "Dr. Sageer Aazaz",
  "specialty": "Dental & Implantology",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head of Department – Dental Services",
  "degree": "BDS (CCI Germany) | MDS (Implantology & Periodontics) | Nobel Fellow (Sweden)",
  "about": "Dr. Sageer Aazaz is a highly respected dental implant specialist with over 20 years of experience. Trained extensively in Germany under world-renowned implantologist Dr. Thomas, he has performed more than 7,000 implant and full-mouth rehabilitation procedures. He also established Gurgaon's first multidisciplinary corporate dental department and is known for his precision, advanced implant techniques, and aesthetic dental restorations.",
  "medicalProblems": [
    { "title": "Missing Teeth", "description": "Complete solutions through implants and full mouth rehabilitation." },
    { "title": "Gum Disease", "description": "Management of periodontal infections, bleeding gums and bone loss." },
    { "title": "Dental Decay & Infection", "description": "Treatment of tooth decay, cavities and root infections." }
  ],
  "procedures": [
    { "title": "Dental Implants", "description": "Single, multiple and full-mouth implants using advanced systems." },
    { "title": "Full Mouth Rehabilitation", "description": "Restoration of function and aesthetics with prosthetics and implants." },
    { "title": "Periodontal Surgery", "description": "Advanced gum treatments, regenerative procedures and laser therapy." }
  ],
  "faqs": [
    { "question": "How many implants has Dr. Sageer performed?", "answer": "He has performed over 7,000 dental implant procedures." },
    { "question": "Is he internationally trained?", "answer": "Yes, he trained in Germany and is a Nobel Fellow from Sweden." },
    { "question": "Does he perform full mouth rehabilitation?", "answer": "Yes, he specializes in advanced full-mouth solutions." }
  ]
},
{
  "slug": "dr-rr-dutta",
  "name": "Dr. R. R. Dutta",
  "specialty": "Internal Medicine",
  "hospital": "Paras Health – Gurugram",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head of Department – Internal Medicine",
  "degree": "MBBS | MD (Medicine)",
  "about": "Dr. R. R. Dutta is a senior internal medicine specialist with over two decades of experience. He is widely respected for his expertise in bone marrow and stem cell transplantation, along with his excellence in managing complex medical disorders. Known for his clinical precision, research contributions and compassionate patient care, he leads Internal Medicine at Paras Health with distinction.",
  "medicalProblems": [
    { "title": "Chronic Medical Conditions", "description": "Management of diabetes, hypertension, thyroid disorders and metabolic diseases." },
    { "title": "Infectious Diseases", "description": "Treatment for viral, bacterial and parasitic infections." },
    { "title": "Bone Marrow & Stem Cell Disorders", "description": "Evaluation and care for hematological and immunological diseases." }
  ],
  "procedures": [
    { "title": "Bone Marrow Transplant Support", "description": "Management and evaluation of patients undergoing transplant procedures." },
    { "title": "Internal Medicine Procedures", "description": "IV therapy, ventilatory support, central line care and diagnostics." },
    { "title": "Preventive Health Checkups", "description": "Early detection and management of lifestyle and chronic diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Dutta handle bone marrow cases?", "answer": "Yes, he specializes in bone marrow and stem cell–related conditions." },
    { "question": "Is he experienced in internal medicine?", "answer": "Yes, he has over 20 years of extensive experience." },
    { "question": "Does he perform preventive health evaluations?", "answer": "Yes, he focuses strongly on preventive and lifestyle medicine." }
  ]
},
{
  "slug": "dr-anu-daber",
  "name": "Dr. Anu Daber",
  "specialty": "Rheumatology & Clinical Immunology",
  "hospital": "Paras Health – Gurugram",
  "experience": "10,000+ patients treated",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Rheumatology & Clinical Immunology",
  "degree": "MBBS | MD | DNB | DM (Rheumatology & Clinical Immunology) | MRCP (Edinburgh)",
  "about": "Dr. Anu Daber is one of the leading rheumatologists in North India, known for her gold-medalist academic excellence and extensive experience in treating over 10,000 patients with arthritis, autoimmune diseases, and complex rheumatologic conditions. Trained at prestigious institutes including AIIMS Delhi, JIPMER Puducherry, and KMC Manipal, she is among the few specialists in India with both DM Rheumatology and postdoctoral fellowship training. She is also certified by the Royal College of Physicians (UK), British Society of Rheumatology, and has completed the EULAR rheumatology course from Switzerland. Dr. Daber is highly skilled in adult and pediatric rheumatology and has expertise in minimally invasive procedures including joint injections, biopsies, and soft-tissue interventions.",
  "medicalProblems": [
    { "title": "Arthritis (RA, OA, Spondyloarthritis)", "description": "Comprehensive treatment for all forms of joint inflammation and degenerative arthritis." },
    { "title": "Autoimmune Diseases", "description": "Management of SLE, Sjögren's syndrome, vasculitis, and connective tissue disorders." },
    { "title": "Pediatric Rheumatology", "description": "Evaluation and treatment of juvenile arthritis and primary immunodeficiency disorders." }
  ],
  "procedures": [
    { "title": "Intra-Articular Injections", "description": "Steroid, viscosupplementation, and biologic injections for joint relief." },
    { "title": "Soft Tissue & Nerve Biopsies", "description": "Muscle, skin, nerve, and lip biopsies for diagnostic evaluation." },
    { "title": "Carpal Tunnel & Intralesional Injections", "description": "Minimally invasive procedures for pain and inflammation management." }
  ],
  "faqs": [
    { "question": "Does Dr. Anu treat autoimmune diseases?", "answer": "Yes, she specializes in all autoimmune and connective tissue disorders." },
    { "question": "Is she trained internationally?", "answer": "Yes, she is MRCP-certified, trained through EULAR Switzerland, and certified by the British Society of Rheumatology." },
    { "question": "Does she treat children with rheumatologic disorders?", "answer": "Yes, she has extensive training in both adult and pediatric rheumatology." }
  ]
},
{
  "slug": "dr-ashutosh-goyal",
  "name": "Dr. Ashutosh Goyal",
  "specialty": "Endocrinology & Diabetes",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Endocrinology",
  "degree": "MBBS | MD (Medicine) | DNB (Endocrinology) | MRCP (UK) | SCE (Endocrinology & Diabetes)",
  "about": "Dr. Ashutosh Goyal is a leading endocrinologist with more than 15 years of expertise. He completed DNB Endocrinology from Sir Ganga Ram Hospital, New Delhi, and holds the prestigious MRCP (UK) and Specialty Certificate in Endocrinology & Diabetes. With numerous national and international publications, he is known for treating complex endocrine disorders with precision and evidence-based care.",
  "medicalProblems": [
    { "title": "Diabetes Management", "description": "Comprehensive care for Type 1, Type 2 and gestational diabetes." },
    { "title": "Thyroid Disorders", "description": "Management of hypothyroidism, hyperthyroidism, thyroid nodules and autoimmune thyroiditis." },
    { "title": "Hormonal & Metabolic Disorders", "description": "Treatment for PCOS, obesity, pituitary disorders, adrenal diseases and metabolic abnormalities." }
  ],
  "procedures": [
    { "title": "Endocrine Evaluation", "description": "Comprehensive hormonal assessment for endocrine disorders." },
    { "title": "Diabetes Optimization", "description": "Insulin therapy, CGM monitoring and advanced diabetes care." },
    { "title": "Thyroid & Metabolic Screening", "description": "Thyroid imaging, metabolic health checkups and risk profiling." }
  ],
  "faqs": [
    { "question": "Is Dr. Goyal MRCP certified?", "answer": "Yes, he holds MRCP (UK) and SCE in Endocrinology & Diabetes." },
    { "question": "Does he treat PCOS?", "answer": "Yes, he specializes in managing PCOS and hormonal disorders." },
    { "question": "Does he manage complex endocrine cases?", "answer": "Yes, he is highly experienced in advanced endocrine and metabolic diseases." }
  ]
},
{
  "slug": "dr-ekta-nigam",
  "name": "Dr. Ekta Nigam",
  "specialty": "Dermatology & Cosmetology",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Dermatology & Cosmetology",
  "degree": "MBBS | MD (Dermatology, Venereology & Leprosy)",
  "about": "Dr. Ekta Nigam is a highly accomplished dermatologist and cosmetologist with extensive experience in aesthetic dermatology and clinical skin care. She has trained over 200 professionals in cosmetic dermatology and has been recognized for excellence in dermatology as well as for her contributions as a mentor and judge at high-profile events such as the Mr & Mrs New Delhi pageant.",
  "medicalProblems": [
    { "title": "Skin Disorders", "description": "Management of acne, pigmentation, eczema, psoriasis and chronic skin diseases." },
    { "title": "Hair & Scalp Issues", "description": "Treatment for hair fall, dandruff, alopecia and scalp infections." },
    { "title": "Cosmetic Skin Concerns", "description": "Anti-aging, scar treatment, aesthetic improvement and skin rejuvenation." }
  ],
  "procedures": [
    { "title": "Laser Treatments", "description": "Laser hair reduction, pigmentation treatment and skin resurfacing." },
    { "title": "Aesthetic Dermatology Procedures", "description": "Botox, fillers, chemical peels, PRP and non-surgical facial rejuvenation." },
    { "title": "Dermatosurgery", "description": "Mole removal, wart treatment and minor skin procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Ekta specialize in cosmetic dermatology?", "answer": "Yes, she has trained over 200 individuals in aesthetic dermatology." },
    { "question": "Does she perform laser treatments?", "answer": "Yes, she is skilled in advanced dermatological laser technology." },
    { "question": "Does she treat psoriasis?", "answer": "Yes, psoriasis management is one of her key specialties." }
  ]
},
{
  "slug": "dr-madhuri-jaitley",
  "name": "Dr. Madhuri Jaitley",
  "specialty": "Nephrology",
  "hospital": "Paras Health – Gurugram",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Nephrology",
  "degree": "MBBS | MD | DNB (Nephrology)",
  "about": "Dr. Madhuri Jaitley is an enthusiastic and highly skilled nephrologist with expertise in renal sciences, hemodialysis, renal transplant, and electrolyte imbalance management. With a strong academic foundation (MBBS, MD and DNB Nephrology), she is committed to delivering high-quality kidney care through clinical excellence, interventional skills and compassionate patient handling.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease", "description": "Early and advanced-stage CKD diagnosis and management." },
    { "title": "Acute Kidney Injury (AKI)", "description": "Critical care management of sudden kidney failure." },
    { "title": "Electrolyte Imbalances", "description": "Treatment of sodium, potassium and acid-base disorders." }
  ],
  "procedures": [
    { "title": "Hemodialysis", "description": "Dialysis treatment for renal failure patients." },
    { "title": "Renal Transplant Support", "description": "Pre- and post-transplant evaluation and monitoring." },
    { "title": "Interventional Nephrology", "description": "Vascular access, kidney biopsy and related procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Jaitley manage CKD?", "answer": "Yes, she provides comprehensive CKD management." },
    { "question": "Does she handle dialysis cases?", "answer": "Yes, she is experienced in hemodialysis and renal replacement therapy." },
    { "question": "Is she trained in interventional nephrology?", "answer": "Yes, she performs vascular access and diagnostic renal procedures." }
  ]
},
{
  "slug": "dr-manpreet-sodhi",
  "name": "Dr. Manpreet Sodhi",
  "specialty": "Obstetrics & Gynecology",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Obstetrics & Gynecology",
  "degree": "Fellowship in ART & IVF | Ultrasound Training (WHO recognized) | Short-term Laparoscopy Training (AIIMS) | MBBS | MD (Obs & Gyne)",
  "about": "Dr. Manpreet Sodhi is a highly skilled obstetrician and gynecologist known for her expertise in painless labor, infertility management, ART/IVF, and advanced gynecological interventions. She is trained at top institutes including Safdarjung Hospital, Batra Hospital, Southend IVF (ICOG/FOBSI), and Randhawa Ultrasonology Centre (affiliated with Jefferson University Hospital, USA). With advanced training in minimally invasive gynecology at AIIMS, she specializes in high-risk pregnancies, infertility, adolescent gynecology, and maternal medicine.",
  "medicalProblems": [
    { "title": "Infertility & IVF Issues", "description": "Comprehensive evaluation and treatment for infertility and ART/IVF procedures." },
    { "title": "High-Risk Pregnancy", "description": "Management of complex and medically challenging pregnancies." },
    { "title": "Gynecological Disorders", "description": "Treatment for PCOS, fibroids, endometriosis, hormonal issues and menstrual disorders." }
  ],
  "procedures": [
    { "title": "IVF & Assisted Reproduction", "description": "Advanced ART procedures including IVF, IUI and ovulation induction." },
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive gynecological procedures for cysts, fibroids and endometriosis." },
    { "title": "Ultrasound-Guided Interventions", "description": "Fetal and gynecological ultrasound for accurate diagnosis and treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Manpreet specialize in IVF?", "answer": "Yes, she has a fellowship in ART & IVF under ICOG/FOBSI." },
    { "question": "Does she treat high-risk pregnancies?", "answer": "Yes, she has extensive experience in high-risk obstetrics and maternal medicine." },
    { "question": "Is she trained in laparoscopy?", "answer": "Yes, she has specialized training in minimally invasive gynecology from AIIMS." }
  ]
},
{
  "slug": "dr-naveen-satija",
  "name": "Dr. Naveen Satija",
  "specialty": "General, Minimal Access, GI & Bariatric Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – General & Laparoscopic Surgery",
  "degree": "MBBS | MS | DNB (Surgery)",
  "about": "Dr. Naveen Satija is a distinguished laparoscopic and GI surgeon with extensive experience in minimally invasive surgeries across Delhi-NCR. He specializes in laparoscopic hernia repair, hemorrhoids and fistula management, trauma surgery, and GI procedures. With FIAGES and FALS fellowships, Dr. Satija is known for precision-based surgical care and excellence in patient outcomes.",
  "medicalProblems": [
    { "title": "Hernias", "description": "Treatment of inguinal, umbilical, ventral and incisional hernias." },
    { "title": "Gastrointestinal Disorders", "description": "Management of gallstones, appendicitis, piles, fistula, fissures and reflux." },
    { "title": "Trauma Surgery Needs", "description": "Expert handling of trauma-related emergency and elective surgeries." }
  ],
  "procedures": [
    { "title": "Laparoscopic Hernia Surgery", "description": "Minimally invasive hernia repair for faster recovery." },
    { "title": "GI & Colorectal Surgery", "description": "Piles, fistula, fissure and gallbladder surgeries with minimally invasive techniques." },
    { "title": "Bariatric Surgery Assistance", "description": "Advanced surgical support for obesity-related weight-loss procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Satija perform laparoscopic surgery?", "answer": "Yes, he is extensively trained in minimal access surgery." },
    { "question": "Does he treat piles and fistula?", "answer": "Yes, he specializes in minimally invasive treatment for anorectal conditions." },
    { "question": "Is he trained in advanced laparoscopy?", "answer": "Yes, he holds FIAGES and FALS certifications." }
  ]
},
{
  "slug": "dr-preeti-singh",
  "name": "Dr. Preeti Singh",
  "specialty": "Psychiatry & Clinical Psychology",
  "hospital": "Paras Health – Gurugram",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Psychiatry & Clinical Psychology",
  "degree": "Doctorate in Clinical Psychology | Masters & Bachelors in Psychology",
  "about": "Dr. Preeti Singh is a renowned clinical psychologist and mental health expert, trained at NIMHANS, Bangalore—India’s premier neuro-psychiatric institute. With 23+ years of experience, she specializes in psychotherapy, psychometric testing, trauma therapy, and biofeedback. A pioneer in NCR, she introduced advanced Biofeedback Therapy at Paras Hospital and is certified in Cognitive Behavioral Therapy, Psychodynamic Therapy, Mindfulness, and Brainspotting for PTSD.",
  "medicalProblems": [
    { "title": "Anxiety, Depression & Stress Disorders", "description": "Comprehensive management of mood and stress-related conditions." },
    { "title": "Child & Adolescent Mental Health", "description": "Behavioral issues, ADHD, learning disabilities and emotional health." },
    { "title": "Addiction & Substance Abuse", "description": "Treatment for adult and adolescent addiction, screen addiction and alcohol dependence." }
  ],
  "procedures": [
    { "title": "Psychotherapy", "description": "CBT, psychodynamic therapy, mindfulness and trauma-focused therapy." },
    { "title": "Biofeedback Therapy", "description": "Advanced therapy for headaches, anxiety, psychosomatic disorders and stress." },
    { "title": "Psychometric Testing", "description": "IQ testing, personality profiling, neuropsychological assessment and diagnostic evaluation." }
  ],
  "faqs": [
    { "question": "Does Dr. Preeti treat children?", "answer": "Yes, she is experienced in pediatric and adolescent mental health." },
    { "question": "Is she a certified CBT therapist?", "answer": "Yes, she holds certification in CBT, psychodynamic therapy and mindfulness." },
    { "question": "Does she treat PTSD?", "answer": "Yes, she is certified in Brainspotting Therapy for PTSD and trauma." }
  ]
},
{
  "slug": "dr-rahul-kumar",
  "name": "Dr. Rahul Kumar",
  "specialty": "Orthopaedics – Sports Injury & Arthroscopy",
  "hospital": "Paras Health – Gurugram",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Orthopaedics",
  "degree": "MBBS | MS (Orthopaedics)",
  "about": "Dr. Rahul Kumar is a fellowship-trained sports injury and arthroscopy surgeon with over 12 years of experience. He specializes in knee, shoulder, and ankle arthroscopy, along with joint replacement surgeries. Having independently performed more than 2,500 knee and shoulder surgeries, Dr. Kumar has trained in Germany and London and previously worked at the Sports Injury Centre, Safdarjung Hospital. He brings advanced expertise in managing complex sports injuries, ligament tears, cartilage problems, and joint reconstruction.",
  "medicalProblems": [
    { "title": "Sports Injuries", "description": "ACL, PCL, meniscus tears, shoulder dislocation, and ankle injuries." },
    { "title": "Joint Degeneration", "description": "Arthritis and cartilage damage affecting knee, shoulder, and hip joints." },
    { "title": "Ligament & Tendon Disorders", "description": "Management of ligament tears, tendonitis, and shoulder rotator cuff injuries." }
  ],
  "procedures": [
    { "title": "Knee Arthroscopy", "description": "Minimally invasive surgery for ligament and meniscus injuries." },
    { "title": "Shoulder Arthroscopy", "description": "Advanced repair for dislocations, labral tears, and rotator cuff issues." },
    { "title": "Joint Replacement Surgery", "description": "Knee, hip, and shoulder replacement for advanced degeneration." }
  ],
  "faqs": [
    { "question": "Does Dr. Rahul specialize in sports injuries?", "answer": "Yes, he is fellowship-trained in sports injury and arthroscopy." },
    { "question": "How many surgeries has he performed?", "answer": "He has independently conducted over 2,500 knee and shoulder surgeries." },
    { "question": "Does he perform ligament reconstruction?", "answer": "Yes, he specializes in ACL, PCL, and complex ligament reconstruction." }
  ]
},
{
  "slug": "dr-rajsrinivas-parthasarathy",
  "name": "Dr. Rajsrinivas Parthasarathy",
  "specialty": "Neurointervention & Stroke Care",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Neurointervention",
  "degree": "MBBS | MRCP (UK)",
  "about": "Dr. Rajsrinivas Parthasarathy is a highly accomplished neurointervention specialist with extensive international training in Canada, the UK, and India. He holds fellowships from Medanta, the University of Alberta Hospital, and is certified by the General Medical Council (UK). As an expert in stroke intervention, aneurysm management, and cerebrovascular diseases, he has contributed to leading books such as '100 Interesting Case Studies in Neurointervention' and has chaired multiple national and international conferences.",
  "medicalProblems": [
    { "title": "Stroke & Cerebrovascular Diseases", "description": "Management of ischemic stroke, intracranial blockages, and brain vessel disorders." },
    { "title": "Aneurysms & Vascular Malformations", "description": "Treatment for brain aneurysms, AVMs, and vascular abnormalities." },
    { "title": "Carotid & Intracranial Disease", "description": "Management of carotid stenosis and intracranial arterial disease." }
  ],
  "procedures": [
    { "title": "Mechanical Thrombectomy", "description": "Emergency clot removal in acute ischemic stroke." },
    { "title": "Coiling & Stenting", "description": "Endovascular treatment for aneurysms and arterial blockages." },
    { "title": "Neuroangiography", "description": "Advanced imaging of brain blood vessels for diagnosis and planning." }
  ],
  "faqs": [
    { "question": "Does Dr. Rajsrinivas treat stroke?", "answer": "Yes, he is highly experienced in hyperacute stroke intervention and thrombectomy." },
    { "question": "Is he internationally trained?", "answer": "Yes, with training in Canada, the UK, and top Indian centers." },
    { "question": "Does he perform aneurysm coiling?", "answer": "Yes, he specializes in coiling, stenting, and AVM treatment." }
  ]
},
{
  "slug": "dr-rakesh-tiwari",
  "name": "Dr. Rakesh Tiwari",
  "specialty": "Paediatrics & Neonatology",
  "hospital": "Paras Health – Gurugram",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & Unit Head – Paediatrics & Neonatology",
  "degree": "MBBS | MD (Pediatrics)",
  "about": "Dr. Rakesh Tiwari is a senior pediatrician and neonatologist with over 22 years of experience. A national faculty member in Development Supportive Care, he has conducted multiple workshops across India. He handles complex newborn and pediatric cases, including critical care, growth monitoring, developmental issues, and vaccination for newborns to adolescents up to 18 years.",
  "medicalProblems": [
    { "title": "Newborn & Infant Care", "description": "Management of premature babies, jaundice, feeding issues, and critical neonatal conditions." },
    { "title": "Pediatric Illnesses", "description": "Treatment of infections, allergies, fevers, asthma, and digestive problems." },
    { "title": "Growth & Development Disorders", "description": "Monitoring milestones, nutrition, behavior, and developmental delays." }
  ],
  "procedures": [
    { "title": "Neonatal Intensive Care", "description": "Care for high-risk and critically ill newborns." },
    { "title": "Vaccination Programs", "description": "Complete immunization for children as per global standards." },
    { "title": "Growth & Development Assessment", "description": "Screening for physical, behavioral, and cognitive development." }
  ],
  "faqs": [
    { "question": "Does Dr. Tiwari treat premature babies?", "answer": "Yes, he specializes in neonatal intensive care and high-risk newborns." },
    { "question": "Does he work with older children?", "answer": "Yes, he treats children from birth to 18 years." },
    { "question": "Is he involved in national pediatric programs?", "answer": "Yes, he is a national faculty member in Development Supportive Care." }
  ]
},
{
  "slug": "dr-ram-chander-jiloha",
  "name": "Dr. Ram Chander Jiloha",
  "specialty": "Psychiatry",
  "hospital": "Paras Health – Gurugram",
  "experience": "50+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Psychiatry",
  "degree": "MBBS | MD (Psychiatry) | WHO Fellowships (USA & Canada)",
  "about": "Dr. R. C. Jiloha is one of India’s most senior and respected psychiatrists with over 50 years of clinical, academic, and research experience. He served as Director Professor & Head of Psychiatry at MAMC and GB Pant Hospital. A WHO fellow in Addiction Psychiatry (UCLA) and Child Psychiatry (UBC, Canada), he established the MD Psychiatry program at MAMC, started the MPhil Clinical Psychology program at IHBAS, trained more than 100 MD Psychiatry students, and authored 250+ research papers and 8 books.",
  "medicalProblems": [
    { "title": "Schizophrenia & Bipolar Disorder", "description": "Advanced psychiatric care for severe mental illnesses." },
    { "title": "Child & Adolescent Psychiatry", "description": "Management of ADHD, behavioral issues, emotional disorders and academic difficulties." },
    { "title": "Addiction Disorders", "description": "Treatment for alcohol dependence, drug addiction, and behavioral addictions." }
  ],
  "procedures": [
    { "title": "Pharmacotherapy", "description": "Medication-based treatment for psychiatric disorders." },
    { "title": "Psychotherapy", "description": "Counseling and therapy for emotional and behavioral issues." },
    { "title": "Behavior Therapy", "description": "Structured behavioral interventions for anxiety, phobias, and OCD." }
  ],
  "faqs": [
    { "question": "Is Dr. Jiloha trained internationally?", "answer": "Yes, with WHO fellowships in the USA and Canada." },
    { "question": "Does he treat complex psychiatric cases?", "answer": "Yes, he specializes in severe psychiatric, developmental and addiction disorders." },
    { "question": "How many research works has he published?", "answer": "He has 250+ papers and 8 books to his credit." }
  ]
},
{
  "slug": "dr-nainika-goel",
  "name": "Dr. Nainika Goel",
  "specialty": "Dermatology & Cosmetology",
  "hospital": "Paras Health – Gurugram",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Dermatology & Cosmetology",
  "degree": "MBBS | MD | DNB (Dermatology, Venereology & Leprosy)",
  "about": "Dr. Nainika Goel is an experienced dermatologist specializing in dermatology, dermatosurgery, and aesthetic dermatology. With qualifications from premier institutes like MAMC, GMCH, and Medanta, she offers advanced, personalized skin, hair, and nail treatments. Her expertise spans clinical dermatology, anti-ageing therapies, laser procedures, and cosmetic enhancements. She is known for her empathetic, patient-centered approach and continuous pursuit of innovation through fellowships and advanced hands-on training.",
  "medicalProblems": [
    { "title": "Clinical Dermatology", "description": "Treatment for acne, eczema, psoriasis, fungal infections and STDs." },
    { "title": "Hair & Scalp Disorders", "description": "Management of hair fall, dandruff and scalp conditions." },
    { "title": "Skin Ageing & Aesthetic Concerns", "description": "Solutions for wrinkles, pigmentation, scars, and facial rejuvenation." }
  ],
  "procedures": [
    { "title": "Laser Treatments", "description": "Advanced laser therapies for pigmentation, scars, and rejuvenation." },
    { "title": "Dermatosurgery", "description": "Skin, hair and nail surgical procedures." },
    { "title": "Aesthetic Treatments", "description": "Anti-ageing procedures, injectables and cosmetic enhancements." }
  ],
  "faqs": [
    { "question": "Does Dr. Goel perform laser treatments?", "answer": "Yes, she is trained in advanced laser and aesthetic dermatology." },
    { "question": "Does she handle hair and nail surgeries?", "answer": "Yes, she specializes in dermatosurgery including hair and nail procedures." },
    { "question": "Where did she complete her dermatology training?", "answer": "She completed MD and DNB Dermatology from GMCH Chandigarh and holds fellowships from Medanta and Shivani Skin Clinic." }
  ]
},
{
  "slug": "dr-nandini-baruah",
  "name": "Dr. Nandini Baruah",
  "specialty": "Dermatology & Cosmetology",
  "hospital": "Paras Health – Gurugram",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Dermatology & Cosmetology",
  "degree": "DDVL | Fellowship in Cutaneous Surgery (AIIMS) | Fellowship in Cosmetic Surgery (Safdarjung Hospital)",
  "about": "Dr. Nandini Baruah is a highly skilled dermatologist with over 18 years of experience managing a wide range of dermatological and cosmetic conditions. With fellowships from premier institutes like AIIMS and Safdarjung Hospital, she specializes in aesthetic medicine, facial rejuvenation, laser procedures, vitiligo treatment, hair restoration, and advanced cosmetic surgeries including Botox, fillers, and thread lifts.",
  "medicalProblems": [
    { "title": "Dermatological Disorders", "description": "Treatment for acne, eczema, psoriasis, vitiligo and pigmentation." },
    { "title": "Hair & Scalp Conditions", "description": "Management of hair fall, dandruff and hair restoration needs." },
    { "title": "Cosmetic Skin Concerns", "description": "Aesthetic corrections for scars, burns, aging and facial rejuvenation." }
  ],
  "procedures": [
    { "title": "Laser Procedures", "description": "Advanced laser treatments for pigmentation, acne scars and rejuvenation." },
    { "title": "Cosmetic Surgery", "description": "Botox, fillers, thread lifts and facial contouring procedures." },
    { "title": "Hair Transplantation", "description": "Surgical and minimally invasive hair restoration treatments." }
  ],
  "faqs": [
    { "question": "Does Dr. Baruah perform cosmetic procedures?", "answer": "Yes, including Botox, fillers, thread lifts and rejuvenation treatments." },
    { "question": "Is she trained in cutaneous surgery?", "answer": "Yes, she completed a fellowship at AIIMS, New Delhi." },
    { "question": "Does she treat vitiligo?", "answer": "Yes, she provides advanced clinical and procedural treatments for vitiligo." }
  ]
},
{
  "slug": "dr-nadeem-u-rehman",
  "name": "Dr. Nadeem U Rehman",
  "specialty": "Cardiology",
  "hospital": "Paras Health – Gurugram",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Cardiology",
  "degree": "MBBS | MD (General Medicine) | DNB (Medicine) | DM (Cardiology) | DrNB (Cardiology)",
  "about": "Dr. Nadeem U Rehman is a compassionate interventional cardiologist with extensive training from Sri Jayadeva Institute of Cardiovascular Sciences, one of India’s highest-volume cardiac centers. He has performed thousands of angioplasties, complex interventions such as Rotablation, IVL, CHIP cases, structural heart procedures (TAVR, MitraClip), congenital heart defect closures, electrophysiology devices, and peripheral vascular interventions. He is also actively involved in research with multiple publications in top-tier journals.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Management of blockages, angina, and heart attack prevention." },
    { "title": "Structural Heart Disorders", "description": "Valve diseases including aortic stenosis and mitral regurgitation." },
    { "title": "Heart Failure & Rhythm Disorders", "description": "Treatment for heart failure, arrhythmias and device therapy needs." }
  ],
  "procedures": [
    { "title": "Coronary Interventions", "description": "Primary angioplasty, rotablation, IVL, CTO and complex PCI." },
    { "title": "Structural Heart Procedures", "description": "TAVR, MitraClip, balloon valvuloplasty and congenital defect closures." },
    { "title": "Device Implantation", "description": "Pacemakers, ICDs, CRT-P/CRT-D and electrophysiological procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Rehman perform complex angioplasties?", "answer": "Yes, he specializes in Rotablation, IVL, CTO and CHIP procedures." },
    { "question": "Is he trained in TAVR?", "answer": "Yes, he has expertise in TAVR, MitraClip and structural heart interventions." },
    { "question": "Does he treat congenital heart conditions?", "answer": "Yes, including ASD, VSD, PDA closures and coarctation stenting." }
  ]
},
{
  "slug": "dr-pooja-anand",
  "name": "Dr. Pooja Anand",
  "specialty": "Neurology",
  "hospital": "Paras Health – Gurugram",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Neurology",
  "degree": "MBBS (Gold Medallist) | MD Medicine | DM Neurology (AIIMS) | SCE Neurology (UK)",
  "about": "Dr. Pooja Anand is a highly accomplished neurologist with exceptional academic achievements including DM Neurology from AIIMS, MD Medicine from MAMC, and Gold Medal in MBBS. She also holds an SCE in Neurology from the Royal College of Physicians, UK. Awarded the National Young Scholar Winner (2023–24), she has strong interests in neuroimmunology, epilepsy, movement disorders, and dementia.",
  "medicalProblems": [
    { "title": "Epilepsy & Seizure Disorders", "description": "Diagnosis and management of epilepsy and recurrent seizures." },
    { "title": "Movement Disorders", "description": "Management of Parkinson’s disease, tremors and dystonia." },
    { "title": "Neuroimmunology Disorders", "description": "Care for multiple sclerosis, autoimmune encephalitis and related illnesses." }
  ],
  "procedures": [
    { "title": "EEG & Epilepsy Monitoring", "description": "Advanced diagnostics for seizure disorders." },
    { "title": "Neurodiagnostic Evaluations", "description": "NCV, EMG and nerve conduction studies." },
    { "title": "Cognitive & Dementia Assessments", "description": "Evaluation of memory loss and cognitive decline." }
  ],
  "faqs": [
    { "question": "Is Dr. Pooja trained at AIIMS?", "answer": "Yes, she completed her DM Neurology from AIIMS, New Delhi." },
    { "question": "Does she treat epilepsy?", "answer": "Yes, she specializes in epilepsy and seizure disorders." },
    { "question": "Has she received national awards?", "answer": "Yes, she was awarded as a National Young Scholar Winner in Neurology." }
  ]
},
{
  "slug": "dr-prachi-gupta",
  "name": "Dr. Prachi Gupta",
  "specialty": "Obstetrics & Gynecology",
  "hospital": "Paras Health – Gurugram",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Obstetrics & Gynecology",
  "degree": "MBBS | MS (Obs & Gyne) | ICOG Fellowship in Gynecological Endoscopy | MRCOG Part 1 | CIMP Certified | ISCCP Certified Colposcopy Training",
  "about": "Dr. Prachi Gupta is a distinguished obstetrician and gynecologist with over 13 years of experience in managing high-risk pregnancies, infertility, gynecological surgeries, and women’s health. Trained at SMS Medical College and mentored by Padmashri Dr. Alka Kriplani at Paras Hospitals, she has extensive expertise in laparoscopic surgery, colposcopy, cancer prevention, and reproductive health. She has worked with leading institutions like Safdarjung Hospital, VMMC, and W Pratiksha Hospital. Dr. Gupta is known for her expertise in painless deliveries, family planning, and minimally invasive gynecology.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Comprehensive care for complex and high-risk maternal cases." },
    { "title": "Infertility & Reproductive Disorders", "description": "Evaluation and treatment including IUI, hormonal issues, and cycle management." },
    { "title": "Gynecological Disorders", "description": "Management of PCOS, fibroids, endometriosis, menstrual disorders, and infections." }
  ],
  "procedures": [
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive procedures including hysterectomy, cystectomy and myomectomy." },
    { "title": "Colposcopy", "description": "Diagnosis and management of cervical abnormalities and pre-cancer lesions." },
    { "title": "Painless Delivery", "description": "Epidural-assisted normal delivery ensuring comfort and safety." }
  ],
  "faqs": [
    { "question": "Does Dr. Gupta specialize in infertility?", "answer": "Yes, she is trained in infertility care and gynecologic endoscopy." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, she is extensively trained in minimally invasive gynecologic surgery." },
    { "question": "Is she certified in colposcopy?", "answer": "Yes, she completed ISCCP-certified colposcopy training at Safdarjung Hospital." }
  ]
},
{
  "slug": "dr-raghav-bansal",
  "name": "Dr. Raghav Bansal",
  "specialty": "Liver Transplant & GI Surgery",
  "hospital": "Paras Health – Gurugram",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Liver Transplant",
  "degree": "MBBS | MS (General Surgery) | DrNB Surgical Gastroenterology | Fellowship in Liver Transplant & HPB Surgery",
  "about": "Dr. Raghav Bansal is an experienced surgical gastroenterologist and liver transplant surgeon with more than a decade of expertise. He has trained at several prestigious centers across India and has extensive experience managing complex liver, GI, and GI-oncology cases. His clinical interests include minimal access GI oncology, transplant oncology, and advanced HPB surgeries.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Management of cirrhosis, liver failure, and chronic liver diseases." },
    { "title": "GI Cancers", "description": "Treatment for stomach, liver, pancreas, and colorectal cancers." },
    { "title": "HPB Disorders", "description": "Management of hepatobiliary and pancreatic system diseases." }
  ],
  "procedures": [
    { "title": "Liver Transplantation", "description": "Adult, pediatric, cadaveric, and living donor transplants." },
    { "title": "GI Onco Surgery", "description": "Advanced cancer surgeries with minimally invasive techniques." },
    { "title": "HPB Surgery", "description": "Complex surgeries of liver, pancreas, and biliary tract." }
  ],
  "faqs": [
    { "question": "Does Dr. Bansal perform liver transplants?", "answer": "Yes, he has extensive experience in adult and pediatric liver transplantation." },
    { "question": "Is he trained in GI oncology?", "answer": "Yes, he specializes in minimal access and transplant oncology." },
    { "question": "Does he treat pancreatic cancers?", "answer": "Yes, he is skilled in advanced HPB and pancreatic surgeries." }
  ]
},
{
  "slug": "dr-devanshee-aakash-shah",
  "name": "Dr. Devanshee Aakash Shah",
  "specialty": "Medical Oncology",
  "hospital": "Paras Health – Gurugram",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Consultant – Oncology",
  "degree": "MBBS | MD (General Medicine) | DM (Medical Oncology) | eDiploma – Harvard Medical School",
  "about": "Dr. Devanshee Aakash Shah is an accomplished medical oncologist trained at India’s premier cancer center, Tata Memorial Hospital, where she also served as Assistant Professor. She has expertise in treating lung, breast, head & neck cancers, and hematological malignancies. With multiple international publications, ASH awards, and roles as invited faculty at major oncology conferences, she is committed to evidence-based, personalized cancer care.",
  "medicalProblems": [
    { "title": "Solid Tumors", "description": "Treatment for breast, lung, head & neck and GI cancers." },
    { "title": "Blood Cancers", "description": "Management of leukemia, lymphoma, and myeloma." },
    { "title": "Advanced & Refractory Cancers", "description": "Specialized care using immunotherapy and targeted treatments." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Standard and advanced drug protocols customized to patient needs." },
    { "title": "Immunotherapy", "description": "Cutting-edge immune-based treatments for various cancers." },
    { "title": "Targeted Therapy", "description": "Personalized cancer treatment based on molecular profiling." }
  ],
  "faqs": [
    { "question": "Is Dr. Devanshee trained at Tata Memorial?", "answer": "Yes, she completed DM Oncology and served as Assistant Professor there." },
    { "question": "Does she treat blood cancers?", "answer": "Yes, she manages leukemia, lymphoma and other hematological conditions." },
    { "question": "Has she won international awards?", "answer": "Yes, including the ASH Abstract Achievement Award 2023." }
  ]
},
{
  "slug": "dr-shipra-gupta",
  "name": "Dr. Shipra Gupta",
  "specialty": "Medical Oncology",
  "hospital": "Paras Health – Gurugram",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Consultant – Oncology",
  "degree": "MBBS | MD Radiation Oncology | DNB Radiation Oncology | DrNB Medical Oncology",
  "about": "Dr. Shipra Gupta is a compassionate medical oncologist with over a decade of experience treating breast, lung, GI, gynecological, and head & neck cancers. She strongly believes in personalized cancer care combining medical expertise with empathy. A Gold Medalist and multiple award winner, she is also trained in palliative care and involved in academic oncology through research publications and national/international conferences.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Comprehensive treatment for early and advanced breast cancer." },
    { "title": "Gynecological & GI Cancers", "description": "Management of ovarian, cervical, uterine, stomach, and colorectal cancers." },
    { "title": "Lung & Head–Neck Cancers", "description": "Diagnosis and treatment of thoracic and upper aerodigestive cancers." }
  ],
  "procedures": [
    { "title": "Chemotherapy & Targeted Therapy", "description": "Cancer-specific drug treatments based on tumor biology." },
    { "title": "Immunotherapy", "description": "Latest immune-modulating treatments for select cancers." },
    { "title": "Palliative & Supportive Care", "description": "Pain management, symptom relief and quality-of-life improvement." }
  ],
  "faqs": [
    { "question": "Does Dr. Shipra specialize in breast cancer?", "answer": "Yes, she has a strong focus on breast and gynecological cancers." },
    { "question": "Is she trained in both radiation and medical oncology?", "answer": "Yes, she has MD, DNB Radiation Oncology and DrNB Medical Oncology." },
    { "question": "Does she offer palliative care?", "answer": "Yes, she is certified in palliative and terminal care from AIIMS." }
  ]
},
{
  "slug": "dr-amit-jha",
  "name": "Dr. Amit Jha",
  "specialty": "Anesthesiology",
  "hospital": "Paras Health – Gurugram",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & Head – Anesthesiology",
  "degree": "MBBS | MD (Anesthesiology)",
  "about": "Dr. Amit Jha is a nationally recognized anesthesiologist with over 15 years of experience. He has contributed to more than 1,500 liver transplants and thousands of GI and HPB surgeries, playing a critical role in peri-operative care, critical care, and transplant anesthesia. Dr. Jha is known for his precision, clinical expertise, and excellence in managing complex surgical anesthesia.",
  "medicalProblems": [
    { "title": "Pre-operative Assessment", "description": "Comprehensive evaluation before major and high-risk surgeries." },
    { "title": "Critical Care Management", "description": "Support for respiratory, cardiac, and hemodynamic stability." },
    { "title": "Transplant Anesthesia", "description": "Peri-operative care for liver transplant and major abdominal surgeries." }
  ],
  "procedures": [
    { "title": "General & Regional Anesthesia", "description": "Safe and advanced anesthesia techniques for all surgeries." },
    { "title": "Transplant Anesthesia", "description": "Specialized anesthesia for liver and GI transplants." },
    { "title": "Airway & Pain Management", "description": "Advanced airway procedures and postoperative pain control." }
  ],
  "faqs": [
    { "question": "Has Dr. Jha worked on liver transplant cases?", "answer": "Yes, he has contributed to more than 1,500 liver transplants." },
    { "question": "Does he manage complex anesthesia cases?", "answer": "Yes, he is experienced in high-risk and critical surgeries." },
    { "question": "Is he the head of anesthesiology?", "answer": "Yes, he leads the Anesthesiology Department at Paras Health." }
  ]
}
];
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
