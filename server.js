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
  "slug": "dr-n-k-pandey",
  "name": "Dr. N. K. Pandey",
  "specialty": "Robotic, Laparoscopic & Advanced Surgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman & Managing Director, Chief – Robotic, Laparoscopic & Advanced Surgery",
  "degree": "MBBS | FRCS (Edinburgh) | FRCS (Glasgow) | FICS | FACS (Edinburgh)",
  "about": "Dr. N. K. Pandey is an internationally acclaimed surgeon known for his expertise in robotic, laparoscopic, abdominal, and thoracic surgeries. With over four decades of experience, he has held prestigious positions including Executive Director at Escorts Hospital, President of the Association of Surgeons of India (2010), and Governor of the American College of Surgeons. He is a renowned surgical tutor, examiner, and a global leader in minimally invasive surgery.",
  "medicalProblems": [
    { "title": "Advanced Laparoscopic Conditions", "description": "Minimally invasive solutions for abdominal and thoracic diseases." },
    { "title": "Thoracic Disorders", "description": "Video-assisted thoracoscopic (VATS) management of chest diseases." },
    { "title": "Robotic Surgery Needs", "description": "Precision-based robotic treatment for complex surgical cases." }
  ],
  "procedures": [
    { "title": "Robotic Surgery", "description": "Advanced robotic-assisted procedures for precision outcomes." },
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive abdominal and thoracic surgeries." },
    { "title": "Thoracoscopic Surgery", "description": "Video-assisted thoracoscopic surgeries (VATS)." }
  ],
  "faqs": [
    { "question": "Is Dr. Pandey experienced in robotic surgery?", "answer": "Yes, he is one of India’s pioneers in robotic and advanced laparoscopic surgeries." },
    { "question": "Has he held international positions?", "answer": "Yes, he has served in multiple global surgical bodies including the American College of Surgeons." },
    { "question": "Does he perform thoracic surgeries?", "answer": "Yes, he is an expert in thoracic and abdominal minimally invasive surgeries." }
  ]
},
{
  "slug": "dr-anita-kant",
  "name": "Dr. Anita Kant",
  "specialty": "Gynaecology & Obstetrics",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – OBG Services & Robotic Surgery",
  "degree": "MBBS | MD | FICS | FICOG | PGDMLS",
  "about": "Dr. Anita Kant is a leading gynecologist with over 40 years of experience in high-risk obstetrics, gynecologic surgeries, robotic procedures, and women’s health. A University Gold Medalist, she is widely regarded as one of the best gynecologists in Faridabad and Delhi NCR. She has multiple research publications and has served as a DNB teacher and guide since 2005.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancies", "description": "Special care for complicated and high-risk maternity cases." },
    { "title": "Gynae Endoscopy Issues", "description": "Evaluation and treatment via minimally invasive techniques." },
    { "title": "Gynecologic Conditions", "description": "Management of PCOS, fibroids, endometriosis, infertility, and menopause." }
  ],
  "procedures": [
    { "title": "Robotic Gynecologic Surgery", "description": "Precision-based robotic procedures for complex cases." },
    { "title": "Gynecological Endoscopy", "description": "Laparoscopic and hysteroscopic surgeries." },
    { "title": "Obstetric Care", "description": "Comprehensive maternal and childbirth care." }
  ],
  "faqs": [
    { "question": "Is Dr. Kant experienced in high-risk pregnancies?", "answer": "Yes, she is a specialist in handling high-risk obstetric cases." },
    { "question": "Does she perform robotic surgeries?", "answer": "Yes, she leads robotic gynecologic surgery at AIMS." },
    { "question": "Is she a DNB-certified teacher?", "answer": "Yes, she has been a DNB teacher and guide since 2005." }
  ]
},
{
  "slug": "dr-arvind-gupta",
  "name": "Dr. (Brig) Arvind Gupta",
  "specialty": "Mother & Child Care",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Paediatrics and Neonatology",
  "degree": "MBBS | MD (Pediatrics)",
  "about": "Dr. (Brig) Arvind Gupta is one of the most respected pediatricians in Delhi NCR with more than 40 years of service, including 26 years in the Armed Forces. He has served as Medical Director of Military Hospital Jammu, SEMO of Command Hospital Chandimandir, and Professor of Pediatrics at AFMC Pune. With unmatched experience in child development, immunization, and adolescent health, he is known for his compassionate approach.",
  "medicalProblems": [
    { "title": "General Pediatric Illnesses", "description": "Treatment of infections, fevers, allergies, and growth concerns." },
    { "title": "Newborn & Neonatal Conditions", "description": "Specialized care for newborn babies and premature infants." },
    { "title": "Adolescent Health Issues", "description": "Guidance on growth, mental health, immunity, and lifestyle." }
  ],
  "procedures": [
    { "title": "Immunization", "description": "Complete vaccination programs for children of all ages." },
    { "title": "Growth Evaluation", "description": "Monitoring milestones and developmental assessments." },
    { "title": "Nutrition Guidance", "description": "Diet planning for infants, toddlers, and adolescents." }
  ],
  "faqs": [
    { "question": "Is Dr. Gupta experienced in child development?", "answer": "Yes, he specializes in growth, development, and adolescent health." },
    { "question": "Has he served in the Armed Forces?", "answer": "Yes, he served for 26 years in high-ranking medical leadership roles." },
    { "question": "Does he provide immunization?", "answer": "Yes, he offers comprehensive vaccination services." }
  ]
},
{
  "slug": "dr-puneet-gupta",
  "name": "Dr. Puneet Gupta",
  "specialty": "Oncology Services",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "28+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Oncology Services",
  "degree": "MBBS | MD (Radiation Therapy) | DNB (Radiation Therapy) | DM (Medical Oncology) | MBA (Hospital Administration)",
  "about": "Dr. Puneet Gupta is a highly distinguished oncologist known for pioneering advances in cancer care across India. With nearly three decades of experience, he has introduced India’s first DNB Medical Oncology program, diplomas in psychology and nursing oncology, and multiple innovative cancer treatments. His research has been presented globally, and he is an expert in Synchronous Chemo-RT, targeted immunotherapy, and monoclonal antibody therapy.",
  "medicalProblems": [
    { "title": "Cancer Diagnosis & Staging", "description": "Accurate evaluation of all types of cancers." },
    { "title": "Blood Cancers", "description": "Expert management of leukemia, lymphoma, and myeloma." },
    { "title": "Solid Tumors", "description": "Treatment of breast, lung, GI, and gynecologic cancers." }
  ],
  "procedures": [
    { "title": "Chemotherapy & Immunotherapy", "description": "Targeted, personalized, and advanced cancer treatments." },
    { "title": "Dendritic Cell Therapy", "description": "Immune-boosting cancer treatment for advanced cases." },
    { "title": "Synchronous Chemo-RT", "description": "Combined chemotherapy and radiation for improved outcomes." }
  ],
  "faqs": [
    { "question": "Is Dr. Gupta a pioneer in oncology?", "answer": "Yes, he introduced multiple 'firsts' in oncology treatments and training in India." },
    { "question": "Does he treat advanced cancers?", "answer": "Yes, he specializes in complex and late-stage cancers." },
    { "question": "Does he practice immunotherapy?", "answer": "Yes, he is an expert in chemo-targeted immunotherapy." }
  ]
},
{
  "slug": "dr-durgatosh-pandey",
  "name": "Dr. Durgatosh Pandey",
  "specialty": "Surgical Oncology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "28+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Surgical Oncology",
  "degree": "MBBS | MS (Surgery) | DNB (Surgery) | M.Ch (Surgical Oncology) | EPHM (IIM Calcutta)",
  "about": "Dr. Durgatosh Pandey is one of India’s most accomplished Surgical Oncologists with more than 28 years of experience across leading institutions including Tata Memorial Centre, AIIMS Delhi, BHU, and Artemis Hospital. Known for precision in thoracic, GI, HPB, and complex cancer surgeries, he has 100+ publications and has trained hundreds of oncologists nationwide.",
  "medicalProblems": [
    { "title": "Thoracic Cancers", "description": "Expertise in lung, esophageal, and mediastinal tumors." },
    { "title": "GI & HPB Cancers", "description": "Advanced surgeries for pancreatic, liver, and gastrointestinal cancers." },
    { "title": "Complex Abdominal Cancers", "description": "High-volume experience in challenging cancer cases." }
  ],
  "procedures": [
    { "title": "Thoracic Oncology Surgery", "description": "Lung, esophageal, and chest surgeries." },
    { "title": "GI & HPB Surgical Oncology", "description": "Liver, pancreas, bile duct, and GI cancer surgeries." },
    { "title": "Advanced Cancer Reconstruction", "description": "Reconstruction and high-complexity oncologic procedures." }
  ],
  "faqs": [
    { "question": "Has Dr. Pandey worked at Tata Memorial?", "answer": "Yes, he served as Professor & Deputy Director at Tata Memorial Centre, Varanasi." },
    { "question": "Does he specialize in thoracic cancers?", "answer": "Yes, he is known for thoracic and HPB oncology surgeries." },
    { "question": "Does he have international training?", "answer": "Yes, including hepatobiliary surgery from Singapore and thoracic surgery from Johns Hopkins." }
  ]
},
{
  "slug": "dr-pranjit-bhowmik",
  "name": "Dr. Pranjit Bhowmik",
  "specialty": "Internal Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Internal Medicine (Unit I)",
  "degree": "MBBS | MD (Medicine)",
  "about": "Dr. Pranjit Bhowmik is a leading Internal Medicine specialist in Faridabad with more than 35 years of experience. Known for his accurate diagnosis and evidence-based treatments, he has served in senior medical positions across top hospitals including Holy Family Hospital, Escorts Hospital, Sunflag Hospital, and Metro Hospital.",
  "medicalProblems": [
    { "title": "Chronic Diseases", "description": "Management of diabetes, hypertension, thyroid, and heart-related conditions." },
    { "title": "Infectious Diseases", "description": "Treatment of viral, bacterial, and seasonal infections." },
    { "title": "Lifestyle Disorders", "description": "Holistic care for obesity, cholesterol, and metabolic syndrome." }
  ],
  "procedures": [
    { "title": "Internal Medicine Evaluation", "description": "Detailed clinical assessment and treatment planning." },
    { "title": "Chronic Disease Management", "description": "Long-term monitoring and treatment for multi-system diseases." },
    { "title": "Preventive Health Check-ups", "description": "Comprehensive screening for early disease prevention." }
  ],
  "faqs": [
    { "question": "Is Dr. Bhowmik experienced?", "answer": "Yes, he has over 35 years of experience in Internal Medicine." },
    { "question": "What conditions does he treat?", "answer": "He treats chronic diseases, infections, and lifestyle disorders." },
    { "question": "Is he available for online consultations?", "answer": "Yes, video consultations are available daily." }
  ]
},
{
  "slug": "dr-ramesh-chandna",
  "name": "Dr. Ramesh Chandna",
  "specialty": "Blood Bank & Laboratory Services",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "33+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Safety, Quality, Laboratory Services & Blood Bank",
  "degree": "MBBS | MD (Medical Microbiology) | PGDHHM",
  "about": "Dr. Ramesh Chandna is a distinguished expert in laboratory medicine, medical microbiology, and healthcare quality systems with 33+ years of experience. He is a certified Lead Auditor for ISO 9000, EMS, OHSAS, NABH Assessor, and ISO 31000 Risk Management specialist. He is highly respected for establishing quality and safety protocols in clinical laboratories and blood banks.",
  "medicalProblems": [
    { "title": "Infection Control Challenges", "description": "Hospital-acquired infection evaluation and prevention." },
    { "title": "Laboratory Quality Issues", "description": "Ensuring accuracy and reliability in lab diagnostics." },
    { "title": "Blood Safety Concerns", "description": "Advanced standards in donor screening and blood bank operations." }
  ],
  "procedures": [
    { "title": "Lab Quality Audits", "description": "Systematic evaluation using international safety protocols." },
    { "title": "Blood Bank Management", "description": "Safe collection, processing, and testing of blood." },
    { "title": "Microbiology Testing", "description": "Advanced diagnostic microbiology procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Chandna experienced?", "answer": "Yes, he has 33+ years of experience in lab medicine and safety systems." },
    { "question": "Is he certified in quality auditing?", "answer": "Yes, he is trained in ISO 9000, 14000, 18000, NABH, and ISO 31000." },
    { "question": "Does he lead lab services at AIMS?", "answer": "Yes, he heads safety, quality, labs, and the blood bank." }
  ]
},
{
  "slug": "dr-subrat-akhoury",
  "name": "Dr. Subrat Akhoury",
  "specialty": "Cath Lab & Interventional Cardiology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Cath Lab & Interventional Cardiologist and Head",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | FSCAI (USA)",
  "about": "Dr. Subrat Akhoury is a leading interventional cardiologist with over 20 years of experience in complex cardiac procedures. Having trained at top institutions like Safdarjung Hospital and Apollo Hospital, he specializes in angioplasty, pacemakers, and adult cardiac interventions.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Diagnosis and treatment of blocked heart arteries." },
    { "title": "Arrhythmias", "description": "Management of irregular heartbeat and conduction disorders." },
    { "title": "Peripheral Artery Disease", "description": "Treatment of carotid and limb artery blockages." }
  ],
  "procedures": [
    { "title": "Angioplasty & Stenting", "description": "Coronary, carotid, and peripheral angioplasty." },
    { "title": "Pacemaker Implantation", "description": "Single, dual-chamber, and advanced cardiac devices." },
    { "title": "Cardiac Interventions", "description": "Advanced catheter-based heart treatments." }
  ],
  "faqs": [
    { "question": "Does Dr. Akhoury perform angioplasties?", "answer": "Yes, he specializes in all types of angioplasty procedures." },
    { "question": "Is he FSCAI certified?", "answer": "Yes, he is a Fellow of the Society for Cardiovascular Angiography & Interventions (USA)." },
    { "question": "Does he treat complex cardiac cases?", "answer": "Yes, he handles complex and high-risk cardiac interventions." }
  ]
},
{
  "slug": "dr-ved-prakash",
  "name": "Dr. Ved Prakash",
  "specialty": "Bariatric & Metabolic Surgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – General, Minimal Invasive, Bariatric & Robotic Surgery",
  "degree": "MBBS | MS (Surgery)",
  "about": "Dr. Ved Prakash is a highly skilled surgeon specializing in bariatric, metabolic, and minimally invasive surgery. With more than 25 years of experience and several international fellowships, he is recognized as one of the best laparoscopic and bariatric surgeons in Faridabad.",
  "medicalProblems": [
    { "title": "Obesity & Weight-Loss Issues", "description": "Surgical and metabolic solutions for severe obesity." },
    { "title": "Hernia Problems", "description": "All types of hernia evaluation and surgical repair." },
    { "title": "Colorectal Disorders", "description": "Management of benign and malignant colorectal diseases." }
  ],
  "procedures": [
    { "title": "Bariatric Surgery", "description": "Weight-loss procedures including sleeve gastrectomy & bypass." },
    { "title": "Advanced Laparoscopic Surgery", "description": "Minimally invasive GI, endocrine, and thoracic procedures." },
    { "title": "Robotic Surgery", "description": "Precision robotic treatments for complex surgical issues." }
  ],
  "faqs": [
    { "question": "Does Dr. Prakash perform bariatric surgery?", "answer": "Yes, he is a specialist in metabolic and bariatric surgery." },
    { "question": "Does he have international training?", "answer": "Yes, including advanced laparoscopic and colorectal surgeries." },
    { "question": "Does he treat hernias?", "answer": "Yes, he manages all types of hernia and abdominal surgical issues." }
  ]
},
{
  "slug": "dr-amit-chaudhary",
  "name": "Dr. Amit Chaudhary",
  "specialty": "Cardiac Surgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – CTVS",
  "degree": "MS (Surgery) | MRCS (UK) | M.Ch (Cardiothoracic & Vascular Surgery)",
  "about": "Dr. Amit Chaudhary is a distinguished cardiac surgeon with over 18 years of experience in advanced cardiac and minimally invasive heart surgeries. He trained at prestigious institutions including King George Medical College, SGPGI Lucknow, and the Royal Liverpool Children’s Hospital, UK. His expertise includes TAVI, LVAD, ECMO, heart transplant, and complex cardiovascular repairs.",
  "medicalProblems": [
    { "title": "Heart Valve Disorders", "description": "Evaluation and surgical repair/replacement of valves." },
    { "title": "Congenital Heart Defects", "description": "Surgical correction of complex pediatric and adult congenital diseases." },
    { "title": "Advanced Heart Failure", "description": "Management through LVAD, ECMO, and transplant procedures." }
  ],
  "procedures": [
    { "title": "Minimal Invasive Cardiac Surgery", "description": "Keyhole surgeries for faster recovery and less pain." },
    { "title": "TAVI", "description": "Transcatheter aortic valve implantation." },
    { "title": "Heart Transplant & LVAD", "description": "Advanced treatments for end-stage heart failure." }
  ],
  "faqs": [
    { "question": "Does Dr. Chaudhary perform minimally invasive heart surgery?", "answer": "Yes, he specializes in minimally invasive and advanced cardiac procedures." },
    { "question": "Is he trained internationally?", "answer": "Yes, including training in the UK at Royal Liverpool Children’s Hospital." },
    { "question": "Does he perform TAVI?", "answer": "Yes, he is an expert in TAVI and endovascular cardiac procedures." }
  ]
},
{
  "slug": "dr-amit-miglani",
  "name": "Dr. Amit Miglani",
  "specialty": "Gastroenterology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Gastroenterology",
  "degree": "MBBS | MD (Medicine) | DM (Gastroenterology)",
  "about": "Dr. Amit Miglani is a leading gastroenterologist with over 18 years of experience in gastroenterology, hepatology, and advanced therapeutic endoscopy. He has performed more than 40,000 endoscopic procedures, 7,000 interventional procedures, and 6,000 ERCP and EUS procedures. Known for excellence in treating complex hepatobiliary and pancreatic conditions, he is widely respected for his advanced interventional skills.",
  "medicalProblems": [
    { "title": "Liver & Hepatobiliary Disorders", "description": "Management of fatty liver, hepatitis, cirrhosis, and biliary diseases." },
    { "title": "Pancreatic Disorders", "description": "Evaluation and treatment of chronic and acute pancreatitis." },
    { "title": "Gastrointestinal Diseases", "description": "Treatment of acidity, ulcers, IBS, IBD, and GI bleeding." }
  ],
  "procedures": [
    { "title": "ERCP & EUS", "description": "Advanced endoscopic procedures for biliary and pancreatic diseases." },
    { "title": "Therapeutic Endoscopy", "description": "Interventions including stenting, polypectomy, and bleeding control." },
    { "title": "POEM Procedure", "description": "Minimally invasive endoscopic treatment for achalasia cardia." }
  ],
  "faqs": [
    { "question": "Is Dr. Miglani experienced in ERCP?", "answer": "Yes, he has performed over 6,000 ERCP procedures." },
    { "question": "Does he treat liver diseases?", "answer": "Yes, he specializes in hepatology and complex hepatobiliary cases." },
    { "question": "Is he an interventional endoscopy expert?", "answer": "Yes, he is highly skilled in advanced therapeutic endoscopy and EUS." }
  ]
},
{
  "slug": "dr-ajit-pratap-singh",
  "name": "Dr. Ajit Pratap Singh",
  "specialty": "Advanced Imaging & Radiology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Imaging & Radiology",
  "degree": "MBBS (Gold Medalist) | DMRD | MD (Radio Diagnosis)",
  "about": "Dr. Ajit Pratap Singh is a distinguished radiologist with more than 18 years of experience in advanced diagnostic imaging. He has previously worked at renowned hospitals including Fortis Escorts, Rockland Hospital, Metro Hospital, and Batra Hospital. His expertise spans ultrasound, CT scans, CT angiography, color Doppler, FNAC, and teleradiology.",
  "medicalProblems": [
    { "title": "Abdominal & Pelvic Disorders", "description": "High-resolution USG and CT imaging for abdominal diseases." },
    { "title": "Vascular Disorders", "description": "Color Doppler and CT angiography for blood vessel evaluation." },
    { "title": "Cancer Detection", "description": "Imaging evaluation for tumor detection and staging." }
  ],
  "procedures": [
    { "title": "CT Angiography", "description": "Advanced vascular imaging for arteries and veins." },
    { "title": "Ultrasound & Doppler", "description": "High-precision ultrasound and color Doppler evaluations." },
    { "title": "FNAC", "description": "Ultrasound-guided fine needle aspiration cytology." }
  ],
  "faqs": [
    { "question": "Is Dr. Ajit experienced in CT angiography?", "answer": "Yes, he specializes in CT angiography and advanced CT applications." },
    { "question": "Does he perform FNAC?", "answer": "Yes, he performs ultrasound-guided FNAC procedures." },
    { "question": "Is he a gold medalist?", "answer": "Yes, he completed MBBS with a gold medal." }
  ]
},
{
  "slug": "dr-ajit-thakur",
  "name": "Dr. Ajit Thakur",
  "specialty": "Critical Care Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Critical Care",
  "degree": "MBBS | MD (Medicine) | IDCCM | IFCCM",
  "about": "Dr. Ajit Thakur is a highly accomplished intensivist with over 18 years of experience in advanced critical care. He has served in premier hospitals including Escorts Heart Institute, Columbia Asia, and Holy Family Hospital. Known for his leadership in ICU management, he is a designated teacher for ISCCM and NBE programs and is respected for his excellence in hemodynamic monitoring, ventilatory support, and emergency critical interventions.",
  "medicalProblems": [
    { "title": "Severe Infections & Sepsis", "description": "Advanced ICU management for life-threatening infections." },
    { "title": "Respiratory Failure", "description": "Ventilator support and lung-protective strategies." },
    { "title": "Cardiac & Hemodynamic Instability", "description": "Critical monitoring and stabilization of high-risk patients." }
  ],
  "procedures": [
    { "title": "Mechanical Ventilation", "description": "Advanced ventilatory support for respiratory failure." },
    { "title": "Hemodynamic Monitoring", "description": "Bedside 2D-Echo and ultrasound-guided interventions." },
    { "title": "Critical Care Procedures", "description": "Bronchoscopy, airway management, and ultrasound-guided procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Thakur trained in advanced critical care?", "answer": "Yes, he holds IDCCM and IFCCM with extensive ICU experience." },
    { "question": "Does he manage life-threatening conditions?", "answer": "Yes, he specializes in complex and critically ill patients." },
    { "question": "Is he involved in teaching?", "answer": "Yes, he is a designated teacher for ISCCM and NBE programs." }
  ]
},
{
  "slug": "dr-deepak-kumar-mishra",
  "name": "Dr. Deepak Kumar Mishra",
  "specialty": "Orthopaedics & Joint Replacement",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "26+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Orthopaedics & Robotic Joint Replacement Surgery (Unit I)",
  "degree": "MBBS | MS (Orthopaedics) | MRCSEd (UK) | MCh Ortho (UK) | FICS Ortho (USA)",
  "about": "Dr. Deepak Kumar Mishra is a renowned orthopaedic and joint replacement surgeon with over 26 years of experience. He specializes in primary and revision knee and hip replacement surgeries, arthroscopy, and limb reconstruction. Having trained in the UK with prestigious fellowships, he is known for his precision, advanced surgical techniques, and compassionate patient care.",
  "medicalProblems": [
    { "title": "Knee Arthritis", "description": "Advanced evaluation and treatment of degenerative knee diseases." },
    { "title": "Hip Joint Disorders", "description": "Management of hip arthritis, AVN, deformities, and injuries." },
    { "title": "Sports & Ligament Injuries", "description": "Arthroscopy and minimally invasive solutions for joint injuries." }
  ],
  "procedures": [
    { "title": "Knee Replacement Surgery", "description": "Primary, revision, and unicompartmental knee replacement." },
    { "title": "Hip Replacement Surgery", "description": "Total and revision hip replacement using modern implants." },
    { "title": "Arthroscopic Surgery", "description": "Keyhole procedures for ligament and cartilage injuries." }
  ],
  "faqs": [
    { "question": "Does Dr. Mishra specialize in knee replacement?", "answer": "Yes, he is an expert in primary and revision knee replacement surgeries." },
    { "question": "Has he trained internationally?", "answer": "Yes, he trained in the UK and holds MRCSEd and MCh Ortho." },
    { "question": "Does he perform arthroscopy?", "answer": "Yes, he is experienced in all types of sports and ligament injury arthroscopies." }
  ]
},
{
  "slug": "dr-divesh-arora",
  "name": "Dr. Divesh Arora",
  "specialty": "Anesthesia",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Anesthesia & OT Services",
  "degree": "MBBS (AFMC) | MD (Anesthesia) | IDRA | FICA | PGDMLS | PG Certificate in Hospital Management",
  "about": "Dr. Divesh Arora is a senior anesthesiologist with over 22 years of experience across leading hospitals like Safdarjung, Fortis Vasant Kunj, and Artemis Hospital. He is an expert in anesthesia for transplant, thoracic, bariatric, pediatric, and joint replacement surgeries. Known for his excellence in regional anesthesia and ultrasound-guided procedures, he is also a NABH assessor and a gold medalist.",
  "medicalProblems": [
    { "title": "High-Risk Surgical Cases", "description": "Anesthesia planning for complex and critical surgeries." },
    { "title": "Pain & Airway Management", "description": "Expert management of airway and peri-operative pain." },
    { "title": "Transplant & Thoracic Anesthesia Needs", "description": "Specialized anesthesia support for high-risk organ and thoracic procedures." }
  ],
  "procedures": [
    { "title": "Ultrasound-Guided Regional Anesthesia", "description": "Precision nerve blocks for pain control and surgeries." },
    { "title": "Transplant & Thoracic Anesthesia", "description": "Advanced anesthesia care for complex surgical cases." },
    { "title": "Pediatric & Bariatric Anesthesia", "description": "Tailored anesthesia solutions for children and bariatric patients." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora handle transplant anesthesia?", "answer": "Yes, he is highly experienced in anesthesia for transplant and thoracic surgeries." },
    { "question": "Is he trained in regional anesthesia?", "answer": "Yes, he holds an IDRA and is an expert in ultrasound-guided regional anesthesia." },
    { "question": "Is he a NABH assessor?", "answer": "Yes, he is a certified NABH assessor." }
  ]
},
{
  "slug": "dr-manav-manchanda",
  "name": "Dr. Manav Manchanda",
  "specialty": "Pulmonary Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Respiratory, Critical Care & Sleep Medicine",
  "degree": "MBBS | MD | DNB (Critical Care) | IDCC (Critical Care) | EDRM",
  "about": "Dr. Manav Manchanda is a leading pulmonologist with over 18 years of experience in respiratory medicine, sleep disorders, and critical care. Since joining AIMS in 2010, he has been instrumental in developing one of the region’s best respiratory and sleep medicine units. He is known for his expertise in complex respiratory diseases, sleep apnea, asthma, COPD, and ICU-based respiratory care.",
  "medicalProblems": [
    { "title": "Asthma & COPD", "description": "Comprehensive care for chronic airway diseases." },
    { "title": "Sleep Disorders", "description": "Diagnosis and treatment of sleep apnea and insomnia." },
    { "title": "Respiratory Failure", "description": "Critical care management including ventilator support." }
  ],
  "procedures": [
    { "title": "Pulmonary Function Testing (PFT)", "description": "Detailed evaluation of lung capacity and airway health." },
    { "title": "Sleep Study (Polysomnography)", "description": "Diagnosis of sleep apnea and sleep-related breathing disorders." },
    { "title": "Bronchoscopy", "description": "Diagnostic and therapeutic airway examination." }
  ],
  "faqs": [
    { "question": "Does Dr. Manchanda treat sleep apnea?", "answer": "Yes, he is an expert in sleep medicine and sleep apnea management." },
    { "question": "Does he handle ICU respiratory cases?", "answer": "Yes, he leads critical care and manages severe respiratory failures." },
    { "question": "Is he trained in critical care medicine?", "answer": "Yes, he holds DNB and IDCC in Critical Care." }
  ]
},
{
  "slug": "dr-lalit-mohan-parashar",
  "name": "Dr. Lalit Mohan Parashar",
  "specialty": "ENT",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director (Visiting) – ENT",
  "degree": "MBBS | MS (ORL)",
  "about": "Dr. Lalit Mohan Parashar is one of the most respected ENT surgeons with over 34 years of experience. He is known for his surgical expertise in endoscopic sinus surgery, cochlear implants, sleep apnea surgery, and minimally invasive ear, nose, and throat procedures. He has received multiple prestigious awards, including the President's Appreciation Award, DMA Awards, and Medical Education Award 2019.",
  "medicalProblems": [
    { "title": "Sinus & Nasal Disorders", "description": "Chronic sinusitis, nasal blockage, septal deviation, and allergies." },
    { "title": "Hearing & Ear Problems", "description": "Hearing loss, infections, balance issues, and middle ear disorders." },
    { "title": "Sleep Apnea & Snoring", "description": "Evaluation and surgical correction of obstructive sleep apnea." }
  ],
  "procedures": [
    { "title": "Functional Endoscopic Sinus Surgery (FESS)", "description": "Endoscopic treatment for sinus and nasal problems." },
    { "title": "Cochlear Implant Surgery", "description": "Hearing restoration surgery for profound hearing loss." },
    { "title": "Coblation Tonsillectomy & Sleep Apnea Surgery", "description": "Advanced coblation-assisted ENT surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Parashar perform cochlear implants?", "answer": "Yes, he is experienced in advanced cochlear implant surgery." },
    { "question": "Is he specialized in sinus surgery?", "answer": "Yes, he is an expert in endoscopic sinus surgery (FESS)." },
    { "question": "Has he received awards?", "answer": "Yes, he has received multiple national awards including the DMA President’s Appreciation Award." }
  ]
},
{
  "slug": "dr-mukesh-pandey",
  "name": "Dr. Mukesh Pandey",
  "specialty": "Neurosurgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Neurosurgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Neurosurgery)",
  "about": "Dr. Mukesh Pandey is a senior neurosurgeon with more than 22 years of experience and over 3000 neurosurgical procedures to his credit. His expertise includes aneurysm surgery, brain hemorrhage, complex brain tumors, keyhole spine surgery, surgeries for epilepsy and Parkinson’s disease. He has held senior neurosurgical positions at Sarvodaya Hospital, Fortis Hospital Shalimar Bagh, and AIMS. He is a gold medalist and has been awarded 'Best Neurosurgeon in India' by the Indian Medical Association.",
  "medicalProblems": [
    { "title": "Brain Tumors", "description": "Surgical management of benign and malignant brain tumors." },
    { "title": "Spine Disorders", "description": "Minimally invasive treatments for spine tumors, injuries, and degenerative diseases." },
    { "title": "Neurological Emergencies", "description": "Expert care for brain hemorrhage, aneurysm rupture, and trauma." }
  ],
  "procedures": [
    { "title": "Aneurysm Surgery", "description": "Advanced surgical repair of cerebral aneurysms." },
    { "title": "Keyhole Spine Surgery", "description": "Minimally invasive procedures for spine disorders." },
    { "title": "Endoscopic Brain Surgery", "description": "Minimally invasive endoscopic procedures for brain diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Pandey perform spine surgeries?", "answer": "Yes, he specializes in minimally invasive and keyhole spine surgery." },
    { "question": "Has he performed aneurysm surgeries?", "answer": "Yes, he has extensive experience in aneurysm and hemorrhage surgeries." },
    { "question": "Is he award-winning?", "answer": "Yes, he has received multiple awards including a Gold Medal and the 'Best Neurosurgeon in India' award." }
  ]
},
{
  "slug": "dr-pankaj-kumar-hans",
  "name": "Dr. Pankaj Kumar Hans",
  "specialty": "General, Laparoscopic, Bariatric & Robotic Surgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head (Unit II) – General, Laparoscopic, Bariatric, Laser & Robotic Surgery",
  "degree": "MBBS | MS (General Surgery) | FMBS | FALS | FEHS | FIASGO",
  "about": "Dr. Pankaj Kumar Hans is a leading surgeon with more than 20 years of experience and over 20,000 successful surgeries. He specializes in hernia, gallbladder, gastrointestinal surgery, bariatric surgery, metabolic surgery, laser procedures, and robotic surgery. He has received advanced international training in China, Greece, and India and is the only certified Allurion Swallowable Gastric Balloon physician in Faridabad. His expertise includes complex GI surgeries, bariatric procedures, and advanced laparoscopic interventions.",
  "medicalProblems": [
    { "title": "Hernia Disorders", "description": "Treatment for all types of hernias including complex and recurrent cases." },
    { "title": "Gallbladder & GI Diseases", "description": "Management of gallstones, appendicitis, GI perforations, and tumors." },
    { "title": "Obesity & Metabolic Disorders", "description": "Bariatric solutions including gastric bypass and sleeve gastrectomy." }
  ],
  "procedures": [
    { "title": "Bariatric & Metabolic Surgery", "description": "Weight loss surgeries such as gastric bypass and sleeve gastrectomy." },
    { "title": "Advanced Laparoscopic Surgery", "description": "Minimally invasive surgeries for GI, hernia, and abdominal disorders." },
    { "title": "Laser & Robotic Surgery", "description": "Precision surgeries for piles, fistula, varicose veins, and GI issues." }
  ],
  "faqs": [
    { "question": "Does Dr. Hans perform bariatric surgery?", "answer": "Yes, he is extensively trained in bariatric and metabolic surgeries." },
    { "question": "Does he conduct robotic surgeries?", "answer": "Yes, he is experienced in robotic and advanced laparoscopic procedures." },
    { "question": "Is he certified for Allurion gastric balloon?", "answer": "Yes, he is Faridabad’s only certified Allurion Balloon physician." }
  ]
},
{
  "slug": "dr-p-s-ahuja",
  "name": "Dr. P. S. Ahuja",
  "specialty": "Preventive Health Check-Ups",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "13+ years (Preventive Health Leadership)",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Preventive Health & Corporate Relations",
  "degree": "MBBS | ADHA",
  "about": "Dr. P. S. Ahuja is a senior leader in preventive healthcare with more than 13 years of leadership in preventive health programs at AIMS. He is a family physician, core member of hospital management, Chairperson of the Renal Transplant Committee, and Director for Sports at the institute. He is known for promoting preventive health, lifestyle modification, early screening, and corporate wellness programs.",
  "medicalProblems": [
    { "title": "Lifestyle Disorders", "description": "Management and prevention of diabetes, hypertension, obesity, and metabolic issues." },
    { "title": "Preventive Screening Needs", "description": "Guidance on early detection of diseases through health check-ups." },
    { "title": "Corporate Health Issues", "description": "Employee wellness assessment and preventive health strategies." }
  ],
  "procedures": [
    { "title": "Preventive Health Check-Ups", "description": "Comprehensive body check-ups for early detection of health risks." },
    { "title": "Lifestyle Modification Counseling", "description": "Guidance to prevent chronic diseases through habit change." },
    { "title": "Corporate Wellness Programs", "description": "Health evaluations and wellness solutions for companies." }
  ],
  "faqs": [
    { "question": "Does Dr. Ahuja specialize in preventive health?", "answer": "Yes, he heads preventive health programs at AIMS for over 13 years." },
    { "question": "Does he offer lifestyle modification guidance?", "answer": "Yes, he focuses heavily on lifestyle improvement and disease prevention." },
    { "question": "Does he lead corporate health programs?", "answer": "Yes, he directs corporate wellness and preventive health initiatives." }
  ]
},
{
  "slug": "dr-rajiv-kumar-sethia",
  "name": "Dr. Rajiv Kumar Sethia",
  "specialty": "Urology & Kidney Transplant",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Urology, Kidney Transplant & Robotic Surgery",
  "degree": "MBBS | MS (Surgery) | DNB (Urology) | Fellow – Kidney Transplant | Fellowship – Minimal Access Urology",
  "about": "Dr. Rajiv Kumar Sethia is one of the leading urologists in Faridabad with more than 20 years of experience in urology, robotic surgery, and kidney transplantation. He has previously worked at Medanta, Fortis, Metro Hospitals and trained extensively in minimally invasive urology and transplant surgery. He is recognized for his expertise in kidney stones, prostate diseases, urinary tract disorders, and robotic/endourological procedures.",
  "medicalProblems": [
    { "title": "Kidney Stone Diseases", "description": "Evaluation and treatment of renal, ureteric, and bladder stones." },
    { "title": "Prostate Disorders", "description": "Management of prostate enlargement and related urinary issues." },
    { "title": "Urinary Tract Disorders", "description": "Treatment for UTIs, bladder dysfunction, and urethral conditions." }
  ],
  "procedures": [
    { "title": "Holmium Laser Surgery", "description": "Laser treatment for prostate enlargement and urinary stones." },
    { "title": "Kidney Transplant", "description": "Comprehensive donor and recipient transplant procedures." },
    { "title": "Robotic & Laparoscopic Urology", "description": "Minimally invasive surgeries for urological diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Sethia perform kidney transplants?", "answer": "Yes, he is extensively trained and experienced in renal transplantation." },
    { "question": "Does he treat kidney stones?", "answer": "Yes, he is an expert in laser treatment and endourology for stones." },
    { "question": "Is he trained in robotic surgery?", "answer": "Yes, he specializes in robotic and minimally invasive urology." }
  ]
},
{
  "slug": "dr-sangram-keshari-sahoo",
  "name": "Dr. Sangram Keshari Sahoo",
  "specialty": "Surgical Oncology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Surgical Oncology",
  "degree": "MBBS | DrNB (Surgical Oncology) | DNB (General Surgery) | FICS (USA) | FIAMS | MNAMS | FAIS | FIAGES | FMAS | FALS (HPB)",
  "about": "Dr. Sangram Keshari Sahoo is a versatile and superspecialist oncologist with advanced training in open, minimally invasive, and oncoplastic cancer surgeries. With over 20 years of experience, he is known for organ-preserving cancer surgeries guided by international protocols and multidisciplinary tumor board planning. His expertise covers thoracic, GI, HPB, breast, gynec, bone and soft tissue cancers, sentinel node mapping, HIPEC, VATS, and advanced minimally access onco-surgeries.",
  "medicalProblems": [
    { "title": "Breast & Gynecologic Cancers", "description": "Comprehensive evaluation and surgical treatment." },
    { "title": "GI & HPB Cancers", "description": "Advanced surgeries for pancreatic, liver, stomach, and colorectal cancers." },
    { "title": "Head, Neck & Thoracic Cancers", "description": "Minimally invasive and radical cancer surgeries." }
  ],
  "procedures": [
    { "title": "HIPEC & CRS", "description": "Advanced peritoneal cancer treatment procedures." },
    { "title": "VATS", "description": "Video-assisted thoracic oncologic surgeries." },
    { "title": "Oncoplastic Reconstruction", "description": "Function-preserving cancer surgeries with reconstruction." }
  ],
  "faqs": [
    { "question": "Does Dr. Sahoo perform minimally invasive cancer surgery?", "answer": "Yes, he specializes in VATS, MAS, PIPEC, and advanced minimal access oncology surgeries." },
    { "question": "Does he treat GI and HPB cancers?", "answer": "Yes, he is highly experienced in gastrointestinal and hepatobiliary cancer surgeries." },
    { "question": "Is he involved in research?", "answer": "Yes, he has numerous publications and award-winning scientific presentations." }
  ]
},
{
  "slug": "dr-smriti-pandey",
  "name": "Dr. Smriti Pandey",
  "specialty": "Dental & Paediatric Dentistry",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Patient Care & Dental Services",
  "degree": "BDS | MDS (Paediatric Dentistry)",
  "about": "Dr. Smriti Pandey is a highly skilled dentist with more than 20 years of clinical experience, specializing in pediatric dentistry, cosmetic dentistry, orthodontics, and dental implants. She is known for her gentle approach, advanced techniques, and commitment to creating beautiful and healthy smiles. She has worked as Senior Lecturer and currently leads Dental Services at AIMS.",
  "medicalProblems": [
    { "title": "Dental Cavities & Gum Diseases", "description": "Comprehensive dental evaluation and treatment." },
    { "title": "Pediatric Dental Issues", "description": "Specialized care for children including fillings, root canals, and preventive treatments." },
    { "title": "Cosmetic Dental Problems", "description": "Solutions for smile enhancement, alignment, and aesthetic corrections." }
  ],
  "procedures": [
    { "title": "Dental Implants", "description": "Permanent tooth replacement using modern implant systems." },
    { "title": "Orthodontics & Braces", "description": "Teeth alignment treatments for children and adults." },
    { "title": "Root Canal & Restorative Dentistry", "description": "Pain-relief treatments and tooth preservation procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Smriti handle pediatric dentistry?", "answer": "Yes, she is an MDS specialist in pediatric dentistry." },
    { "question": "Does she perform cosmetic dental procedures?", "answer": "Yes, she is experienced in cosmetic, aesthetic, and smile correction treatments." },
    { "question": "Does she provide implant services?", "answer": "Yes, she offers advanced dental implant procedures." }
  ]
},
{
  "slug": "dr-sagar-gupta",
  "name": "Dr. Sagar Gupta",
  "specialty": "Kidney Diseases & Transplant Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Kidney Diseases & Transplant Medicine",
  "degree": "MBBS | Residency (Internal Medicine, USA) | Fellowship in Nephrology | Fellowship in Hypertension | Fellowship in Kidney & Pancreas Transplantation (Washington University, USA) | ABIM Certified",
  "about": "Dr. Sagar Gupta is one of the top nephrologists and kidney transplant specialists in Faridabad with over 14 years of global experience. Trained at Washington University, St. Louis—one of the world’s leading medical institutions—he holds American Board of Internal Medicine (ABIM) certification in both Internal Medicine and Nephrology. He specializes in kidney transplantation, AKI, CKD, glomerular diseases, hemodialysis, peritoneal dialysis, and transplant immunology. He has previously served at Metro Heart Institute and Max Super Specialty Hospital.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease (CKD)", "description": "Long-term evaluation and treatment of declining kidney function." },
    { "title": "Acute Kidney Injury (AKI)", "description": "Emergency and critical care for sudden kidney failure." },
    { "title": "Glomerulonephritis & Autoimmune Disorders", "description": "Diagnosis and treatment of immune-related kidney diseases." }
  ],
  "procedures": [
    { "title": "Kidney Transplantation", "description": "Complete pre- and post-transplant evaluation and surgical coordination." },
    { "title": "Hemodialysis & Peritoneal Dialysis", "description": "Advanced dialysis therapies including emergency and home hemodialysis." },
    { "title": "Kidney Biopsy", "description": "Ultrasound-guided biopsy for accurate diagnosis of kidney diseases." }
  ],
  "faqs": [
    { "question": "Is Dr. Sagar Gupta US-trained?", "answer": "Yes, he trained at Washington University, USA, in nephrology and transplant medicine." },
    { "question": "Does he perform kidney transplants?", "answer": "Yes, he specializes in kidney and pancreas transplantation." },
    { "question": "Is he American Board certified?", "answer": "Yes, he is ABIM-certified in Internal Medicine and Nephrology." }
  ]
},
{
  "slug": "dr-uma-rani",
  "name": "Dr. Uma Rani",
  "specialty": "Blood Bank & Laboratory Services",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Pathology",
  "degree": "MBBS | MD (Pathology) | MBA (BITS Pilani)",
  "about": "Dr. Uma Rani is an accomplished pathologist with over 23 years of experience in managing and operating pathology laboratories and blood banks. She has worked in leading government and private institutions including Govt. Medical College Chandigarh, RML Hospital New Delhi, Apollo Clinic, and SRL Diagnostics. She specializes in histopathology, cytopathology, hematology, and quality-controlled lab systems. Since 2010, she has been leading the Pathology Department at AIMS.",
  "medicalProblems": [
    { "title": "Blood & Tissue Diagnostics", "description": "Accurate lab diagnostics for blood disorders and tissue diseases." },
    { "title": "Cancer & Biopsy Evaluation", "description": "Histopathology and cytology for tumor diagnosis." },
    { "title": "Laboratory Quality Control", "description": "Ensuring accuracy and safety in lab reporting and operations." }
  ],
  "procedures": [
    { "title": "Biopsy & Histopathology", "description": "Microscopic evaluation for disease and cancer diagnosis." },
    { "title": "Cytopathology", "description": "FNAC, PAP smears, and body fluid cytology." },
    { "title": "Hematology Diagnostics", "description": "Advanced tests for anemia, leukemia, and blood disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Uma Rani specialize in pathology?", "answer": "Yes, she is an expert in histopathology, cytopathology, and hematology." },
    { "question": "Does she manage blood bank services?", "answer": "Yes, she has extensive experience in blood bank operations and quality control." },
    { "question": "Does she have experience in corporate labs?", "answer": "Yes, she has worked with SRL and Apollo Clinic laboratories." }
  ]
},
{
  "slug": "dr-amit-bangia",
  "name": "Dr. Amit Bangia",
  "specialty": "Dermatology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Dermatology",
  "degree": "MBBS | MD (Skin & VD) – Gold Medalist",
  "about": "Dr. Amit Bangia is a senior dermatologist with over 18 years of experience in treating a wide range of skin, hair, and nail disorders. A Gold Medalist in MD Dermatology, he is known for his expertise in clinical dermatology, aesthetic treatments, dermatosurgery, and laser procedures. He has won multiple national and international awards for academic excellence, including the prestigious Dr. Ferdinand Handa Award.",
  "medicalProblems": [
    { "title": "Skin Disorders", "description": "Treatment for acne, eczema, psoriasis, fungal infections, and allergies." },
    { "title": "Hair & Scalp Problems", "description": "Management of hair fall, dandruff, alopecia, and scalp conditions." },
    { "title": "Cosmetic Skin Concerns", "description": "Solutions for pigmentation, anti-aging, scars, and appearance enhancement." }
  ],
  "procedures": [
    { "title": "Laser Treatments", "description": "Laser hair removal, pigmentation correction, and scar treatment." },
    { "title": "Aesthetic Procedures", "description": "Botox, fillers, chemical peels, and skin rejuvenation." },
    { "title": "Dermatosurgery", "description": "Mole removal, skin tag removal, and minor skin surgeries." }
  ],
  "faqs": [
    { "question": "Is Dr. Bangia a Gold Medalist?", "answer": "Yes, he received a Gold Medal in MD Dermatology." },
    { "question": "Does he perform cosmetic dermatology?", "answer": "Yes, he specializes in lasers, fillers, Botox, and aesthetic treatments." },
    { "question": "Does he treat chronic skin diseases?", "answer": "Yes, he manages psoriasis, eczema, acne, vitiligo, and other chronic conditions." }
  ]
},
{
  "slug": "dr-anshumali-misra",
  "name": "Dr. Anshumali Misra",
  "specialty": "Plastic Surgery | Diabetic Foot & Wound Management | Rhinoplasty",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "21+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Head – Plastic Surgery",
  "degree": "MBBS | DNB (General Surgery) | MCh (Plastic Surgery)",
  "about": "Dr. Anshumali Misra is a highly experienced plastic, reconstructive, and cosmetic surgeon with over 21 years of experience, including 9 years as a superspecialist. An alumnus of the prestigious department of Burns, Plastic & Maxillofacial Surgery, he has extensive expertise in advanced reconstructive surgeries, diabetic foot management, cosmetic procedures, and rhinoplasty. He has presented multiple award-winning papers in national and international conferences.",
  "medicalProblems": [
    { "title": "Diabetic Foot Conditions", "description": "Management of chronic wounds, infections, and diabetic foot complications." },
    { "title": "Cosmetic Facial Concerns", "description": "Aesthetic improvement for nasal deformities and facial structures." },
    { "title": "Reconstructive Needs", "description": "Treatment for trauma, burns, chronic wounds, and soft tissue defects." }
  ],
  "procedures": [
    { "title": "Rhinoplasty", "description": "Cosmetic and functional nasal reshaping." },
    { "title": "Plastic & Reconstructive Surgery", "description": "Restoration of form and function for traumatic or congenital defects." },
    { "title": "Diabetic Foot Surgery", "description": "Advanced wound care and surgical correction for diabetic foot complications." }
  ],
  "faqs": [
    { "question": "Does Dr. Misra specialize in rhinoplasty?", "answer": "Yes, he is highly experienced in cosmetic and reconstructive rhinoplasty." },
    { "question": "Does he treat diabetic foot conditions?", "answer": "Yes, he specializes in wound management and diabetic foot reconstruction." },
    { "question": "Has he received awards?", "answer": "Yes, including the Best Paper Award at NABICON and the Urgo Case Award in 2021." }
  ]
},
{
  "slug": "dr-banwari-lal",
  "name": "Dr. Banwari Lal",
  "specialty": "Internal Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Internal Medicine (Unit-II)",
  "degree": "MBBS | MD (Internal Medicine) | MRCP (UK) | EDIC | IDCCM",
  "about": "Dr. Banwari Lal is a senior Internal Medicine specialist with more than 20 years of experience in managing complex medical disorders. With advanced international qualifications including MRCP (UK) and EDIC (Critical Care), he is known for his expertise in chronic disease management, infectious diseases, metabolic disorders, and critical care. His approach focuses on accurate diagnosis, evidence-based treatment, and compassionate patient care.",
  "medicalProblems": [
    { "title": "Chronic Lifestyle Disorders", "description": "Management of diabetes, hypertension, thyroid issues, and obesity." },
    { "title": "Infectious Diseases", "description": "Diagnosis and treatment of acute and chronic infections." },
    { "title": "Critical Care Conditions", "description": "Expertise in ICU-based management and acute medical emergencies." }
  ],
  "procedures": [
    { "title": "Comprehensive Medical Evaluation", "description": "Full assessment of chronic and acute medical issues." },
    { "title": "Critical Care Management", "description": "Treatment of life-threatening conditions and multi-organ involvement." },
    { "title": "Preventive Health Planning", "description": "Guidance on disease prevention and long-term health maintenance." }
  ],
  "faqs": [
    { "question": "Is Dr. Banwari Lal internationally certified?", "answer": "Yes, he holds the MRCP (UK), EDIC, and IDCCM credentials." },
    { "question": "Does he treat diabetes and hypertension?", "answer": "Yes, he specializes in chronic lifestyle and metabolic disorders." },
    { "question": "Does he provide video consultations?", "answer": "Yes, he offers both in-person and online consultations." }
  ]
},
{
  "slug": "dr-gaganpal-singh",
  "name": "Dr. Gaganpal Singh",
  "specialty": "Cardiac Anesthesia",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & HOD – Cardiac Anaesthesia",
  "degree": "MBBS | MD (Anaesthesiology) | FNB (Cardiac Anaesthesia)",
  "about": "Dr. Gaganpal Singh is an expert cardiac anesthesiologist with over 10 years of specialized experience in cardiac anesthesia, cardiac transplant, ECMO, and LVAD support. Trained at Max Hospital, Saket, he is skilled in managing high-risk cardiac surgical cases and performs advanced perioperative cardiac care including Transesophageal Echocardiography (TEE).",
  "medicalProblems": [
    { "title": "High-Risk Cardiac Conditions", "description": "Anesthesia support for critical cardiac surgeries." },
    { "title": "Heart Failure & Transplant Cases", "description": "Specialized care during heart transplant, LVAD, and ECMO procedures." },
    { "title": "Perioperative Cardiac Management", "description": "Expert monitoring for complex heart surgeries." }
  ],
  "procedures": [
    { "title": "Cardiac Anesthesia", "description": "Anesthesia for CABG, valve repair, transplant, and structural heart surgeries." },
    { "title": "Transesophageal Echocardiography (TEE)", "description": "Advanced imaging for cardiac monitoring during surgery." },
    { "title": "ECMO & LVAD Support", "description": "Perioperative management of advanced cardiac support devices." }
  ],
  "faqs": [
    { "question": "Does Dr. Gaganpal Singh manage heart transplant anesthesia?", "answer": "Yes, he has extensive experience in transplant and LVAD anesthesia." },
    { "question": "Is he trained in TEE?", "answer": "Yes, he specializes in perioperative transesophageal echocardiography." },
    { "question": "Does he handle ECMO cases?", "answer": "Yes, he is experienced in ECMO and advanced cardiac support." }
  ]
},
{
  "slug": "dr-lk-jha",
  "name": "Dr. L. K. Jha",
  "specialty": "Cardiology (Coronary Angioplasty & Angiography)",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Head (Unit-II) – Cardiology",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | FNB (Interventional Cardiology) | FSCAI | FACC | FESC",
  "about": "Dr. L. K. Jha is a highly experienced interventional cardiologist with over 15 years of clinical expertise. He has performed more than 10,000 coronary angiograms and over 1,000 angioplasties, including 100+ primary angioplasties for acute heart attacks. Trained at leading cardiac centers such as SGPGIMS and Fortis Escorts Heart Institute, he specializes in coronary angioplasty, peripheral angioplasty, cardiac pacing, electrophysiology, and advanced interventional techniques. He is known for managing acute coronary syndromes and cardiac emergencies with excellent outcomes.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Diagnosis and treatment of blocked heart arteries." },
    { "title": "Heart Attack & Acute Coronary Syndrome", "description": "Emergency management and primary angioplasty." },
    { "title": "Peripheral Artery Disease", "description": "Treatment for blockages in carotid, renal, and limb arteries." }
  ],
  "procedures": [
    { "title": "Coronary Angiography", "description": "Imaging test to diagnose blockages in heart arteries." },
    { "title": "Coronary Angioplasty & Stenting", "description": "Opening blocked arteries using minimally invasive methods." },
    { "title": "Rotablation & IVL", "description": "Advanced techniques for treating hard and calcified artery blockages." }
  ],
  "faqs": [
    { "question": "Has Dr. Jha performed many angioplasties?", "answer": "Yes, he has performed more than 1,000 angioplasties, including primary angioplasty." },
    { "question": "Does he treat peripheral artery disease?", "answer": "Yes, he performs carotid, renal, and peripheral angioplasties." },
    { "question": "Is he internationally certified?", "answer": "Yes, he is a Fellow of SCAI, ACC, and ESC, with multiple global certifications." }
  ]
},
{
  "slug": "dr-minakshi-manchanda",
  "name": "Dr. Minakshi Manchanda",
  "specialty": "Psychiatry",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Psychiatry",
  "degree": "MBBS | MD (Psychiatry)",
  "about": "Dr. Minakshi Manchanda is an experienced psychiatrist with over 16 years of expertise in treating mental health conditions. She previously worked at Lady Hardinge Medical College as a Senior Resident for 3 years and served as a Consultant at ESI Hospital before joining AIMS in 2011. She specializes in schizophrenia, mood disorders, and a wide range of psychiatric illnesses.",
  "medicalProblems": [
    { "title": "Schizophrenia", "description": "Comprehensive management of psychotic disorders." },
    { "title": "Mood Disorders", "description": "Treatment for depression, bipolar disorder, and emotional imbalances." },
    { "title": "Anxiety & Stress Disorders", "description": "Evaluation and therapy for chronic stress and anxiety disorders." }
  ],
  "procedures": [
    { "title": "Psychiatric Evaluation", "description": "Detailed assessment of mental health conditions." },
    { "title": "Medication Management", "description": "Tailored psychiatric medicines for mental health disorders." },
    { "title": "Counseling & Therapy", "description": "Supportive therapy for emotional and behavioral concerns." }
  ],
  "faqs": [
    { "question": "Does Dr. Minakshi treat schizophrenia?", "answer": "Yes, she specializes in schizophrenia and mood disorders." },
    { "question": "Does she offer therapy and counseling?", "answer": "Yes, she provides counseling along with medication management." },
    { "question": "How long has she been practicing?", "answer": "She has more than 16 years of experience in psychiatry." }
  ]
},
{
  "slug": "dr-neha-kapoor",
  "name": "Dr. Neha Kapoor",
  "specialty": "Neurology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Head – Neurology",
  "degree": "MBBS | MD (Medicine) | DM (Neurology)",
  "about": "Dr. Neha Kapoor is a leading neurologist in Faridabad with extensive training from AIIMS, New Delhi. She specializes in stroke, epilepsy, dementia, demyelinating disorders, Parkinson’s disease, and complex neurological conditions. She has presented multiple research papers and served in reputed institutions including Jaypee Hospital and AIIMS.",
  "medicalProblems": [
    { "title": "Stroke", "description": "Acute and long-term management of ischemic and hemorrhagic stroke." },
    { "title": "Epilepsy", "description": "Diagnosis and treatment of seizure disorders." },
    { "title": "Dementia", "description": "Management of memory disorders including Alzheimer's disease." }
  ],
  "procedures": [
    { "title": "EEG & Epilepsy Monitoring", "description": "Diagnostic evaluation for seizure disorders." },
    { "title": "Stroke Evaluation", "description": "Advanced neurological examination for stroke risk and recovery." },
    { "title": "Neurological Rehabilitation", "description": "Therapies for chronic neurological conditions." }
  ],
  "faqs": [
    { "question": "Does Dr. Neha treat Parkinson’s Disease?", "answer": "Yes, she specializes in movement disorders including Parkinsonism." },
    { "question": "Is she trained at AIIMS?", "answer": "Yes, she completed her DM Neurology from AIIMS, New Delhi." },
    { "question": "Does she treat dementia?", "answer": "Yes, dementia and memory disorders are part of her expertise." }
  ]
},
{
  "slug": "dr-pramod-arora",
  "name": "Dr. Pramod K. Arora",
  "specialty": "Nuclear Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "32+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Nuclear Medicine",
  "degree": "MBBS | DRM",
  "about": "Dr. Pramod K. Arora is a senior specialist in nuclear medicine with over 32 years of experience in molecular imaging, radionuclide therapy, and diagnostic nuclear imaging. His expertise includes PET scans, SPECT imaging, thyroid scans, and cancer theranostics.",
  "medicalProblems": [
    { "title": "Thyroid Disorders", "description": "Radioactive iodine scans for hyperthyroidism and thyroid cancer." },
    { "title": "Cancer Imaging", "description": "PET-CT and molecular imaging for cancer staging." },
    { "title": "Bone & Organ Scans", "description": "Nuclear scans for bone infection, fractures, and organ function." }
  ],
  "procedures": [
    { "title": "PET-CT", "description": "Advanced molecular imaging for cancer detection." },
    { "title": "SPECT Imaging", "description": "Functional studies for heart, brain, and organs." },
    { "title": "Radionuclide Therapy", "description": "Therapeutic procedures for thyroid cancer and other conditions." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora perform PET scans?", "answer": "Yes, he specializes in PET-CT and nuclear imaging." },
    { "question": "Is radionuclide therapy available?", "answer": "Yes, he performs therapeutic nuclear medicine procedures." },
    { "question": "Does he treat thyroid disorders?", "answer": "Yes, he offers nuclear thyroid scans and iodine therapy." }
  ]
},
{
  "slug": "dr-shilpa-gupta",
  "name": "Dr. Shilpa Gupta",
  "specialty": "Pathology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Pathology",
  "degree": "MBBS | MD (Pathology)",
  "about": "Dr. Shilpa Gupta is an experienced pathologist with expertise in cytopathology, histopathology, hematology, and immunohistochemistry. She has worked with leading hospitals including PGIMS Rohtak, Hindu Rao Hospital, SRL Ranbaxy Labs, and brings strong diagnostic leadership to AIMS.",
  "medicalProblems": [
    { "title": "Blood Disorders", "description": "Diagnostic evaluation of anemia, leukemia, and clotting disorders." },
    { "title": "Cancer Screening", "description": "Biopsy and cytology for early cancer detection." },
    { "title": "Infectious Diseases", "description": "Accurate lab-based diagnosis of infections." }
  ],
  "procedures": [
    { "title": "Biopsy Evaluation", "description": "Detailed examination of tissue samples." },
    { "title": "Cytopathology", "description": "Microscopic evaluation of cells for disease detection." },
    { "title": "Immunohistochemistry", "description": "Advanced diagnostic testing for cancer." }
  ],
  "faqs": [
    { "question": "Does Dr. Shilpa handle cancer biopsies?", "answer": "Yes, she is highly experienced in histopathology and IHC." },
    { "question": "Does she manage blood reports?", "answer": "Yes, hematology diagnosis is one of her core specialties." },
    { "question": "How many years has she worked?", "answer": "She has over 18 years of diagnostic experience." }
  ]
},
{
  "slug": "dr-sunil-kumar-choudhary",
  "name": "Dr. Sunil Kumar Choudhary",
  "specialty": "Knee & Shoulder Joint Replacement Surgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Head – Orthopaedics (Unit II)",
  "degree": "FRCS (Trauma & Orth) | MRCS | DNB (Ortho) | MS (Ortho) | MBBS",
  "about": "Dr. Sunil Kumar Choudhary is an internationally trained orthopaedic surgeon specializing in knee and shoulder surgeries. With more than 22 years of experience, he received advanced training in the UK, mastering navigation-based knee replacements, complex shoulder procedures, revision surgeries, and sports injury treatments.",
  "medicalProblems": [
    { "title": "Knee Arthritis", "description": "Management of severe knee pain and joint degeneration." },
    { "title": "Shoulder Instability", "description": "Treatment for dislocations and rotator cuff problems." },
    { "title": "Sports Injuries", "description": "ACL tears, ligament injuries, and soft tissue repair." }
  ],
  "procedures": [
    { "title": "Total & Partial Knee Replacement", "description": "Advanced knee joint replacement procedures." },
    { "title": "Shoulder Arthroscopy", "description": "Minimally invasive shoulder surgery." },
    { "title": "Revision Joint Surgery", "description": "Redo surgeries for failed joint replacements." }
  ],
  "faqs": [
    { "question": "Does Dr. Choudhary perform shoulder surgeries?", "answer": "Yes, he specializes in advanced shoulder arthroscopy and replacements." },
    { "question": "Is he internationally trained?", "answer": "Yes, he has trained extensively in the UK in both knee and shoulder surgery." },
    { "question": "Does he perform robotic or navigation surgeries?", "answer": "Yes, he is experienced in navigation and kinematic knee replacement." }
  ]
},
{
  "slug": "dr-sunil-rana",
  "name": "Dr. Sunil Rana",
  "specialty": "Internal Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director & Head – Internal Medicine (Unit III)",
  "degree": "MBBS | MD (Internal Medicine) | PG Diploma in Endocrinology | PG Diploma in Cardiology | Fellowship in Endocrinology",
  "about": "Dr. Sunil Rana is a highly experienced internal medicine specialist with more than 19 years of clinical service. He is known for his compassionate approach and expertise in diabetes, thyroid disorders, hypertension, infectious diseases, lifestyle diseases, and chronic conditions affecting adults.",
  "medicalProblems": [
    { "title": "Diabetes", "description": "Comprehensive diabetes management and counseling." },
    { "title": "Thyroid Disorders", "description": "Evaluation and treatment of hypothyroidism and hyperthyroidism." },
    { "title": "Hypertension", "description": "Managing high blood pressure and related complications." }
  ],
  "procedures": [
    { "title": "Chronic Disease Management", "description": "Long-term care for diabetes, hypertension, and lifestyle diseases." },
    { "title": "Infection Management", "description": "Treatment of viral, bacterial, and seasonal infections." },
    { "title": "Preventive Health Evaluation", "description": "Screening for lifestyle and age-related diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Rana treat diabetes?", "answer": "Yes, diabetes management is one of his core specialties." },
    { "question": "Does he treat thyroid disorders?", "answer": "Yes, he has additional training in endocrinology." },
    { "question": "Does he handle chronic diseases?", "answer": "Yes, including hypertension, COPD, asthma, and more." }
  ]
},
{
  "slug": "dr-sumit-chakravarty",
  "name": "Dr. Sumit Chakravarty",
  "specialty": "Paediatrics & Neonatology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Paediatrics & Neonatology & Head – NICU",
  "degree": "MBBS | DNB (Paediatrics) | Clinical Fellowship in Neonatology | Neonatal Research Training (Australia)",
  "about": "Dr. Sumit Chakravarty is an expert neonatologist with over 12 years of specialized experience, including advanced neonatal training in Australia and clinical work at Fortis Memorial Research Institute. He specializes in managing high-risk newborns, premature babies, and neonatal emergencies.",
  "medicalProblems": [
    { "title": "Premature Babies", "description": "Advanced NICU care for preterm newborns." },
    { "title": "High-Risk Newborn Conditions", "description": "Management of respiratory, cardiac, and metabolic issues." },
    { "title": "Neonatal Infections", "description": "Diagnosis and treatment of newborn infections." }
  ],
  "procedures": [
    { "title": "Neonatal ECHO", "description": "Ultrasound evaluation of newborn heart function." },
    { "title": "NICU Care", "description": "Critical care for premature and medically fragile infants." },
    { "title": "Neonatal Resuscitation", "description": "Life-saving emergency care for newborns." }
  ],
  "faqs": [
    { "question": "Does Dr. Sumit treat premature babies?", "answer": "Yes, he specializes in managing preterm and high-risk newborns." },
    { "question": "Has he trained internationally?", "answer": "Yes, he completed 2 years of neonatal training in Australia." },
    { "question": "Does he provide neonatal ECHO?", "answer": "Yes, he performs neonatal cardiac evaluations." }
  ]
},
{
  "slug": "dr-suneel-ahuja",
  "name": "Dr. Suneel Ahuja",
  "specialty": "ENT",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director (Visiting) – ENT",
  "degree": "MBBS | MS (ENT)",
  "about": "Dr. Suneel Ahuja is a veteran ENT specialist with over 34 years of practice. He has served as an ENT Consultant at Escorts Hospital for 20 years and as Senior Consultant at ASIAN Hospital for 5 years. He is deeply involved in social healthcare activities.",
  "medicalProblems": [
    { "title": "Sinus Problems", "description": "Treatment for sinusitis and nasal blockages." },
    { "title": "Hearing Disorders", "description": "Management of ear infections and hearing loss." },
    { "title": "Throat & Voice Issues", "description": "Evaluation of vocal problems and throat infections." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive sinus procedures." },
    { "title": "Ear Microsurgery", "description": "Surgical treatment for middle ear conditions." },
    { "title": "Tonsil & Adenoid Surgery", "description": "Removal of inflamed tonsils and adenoids." }
  ],
  "faqs": [
    { "question": "Does Dr. Ahuja treat sinus issues?", "answer": "Yes, he has extensive experience in treating sinusitis." },
    { "question": "Is he experienced in ENT surgery?", "answer": "Yes, he has over three decades of ENT surgical experience." },
    { "question": "Is he available for video consultations?", "answer": "Yes, on Mon, Wed & Fri between 12–2 PM." }
  ]
},
{
  "slug": "dr-vijay-sharma",
  "name": "Dr. Vijay Sharma",
  "specialty": "Paediatric Neurology & Child Development",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Head – Paediatric Neurology & Child Development",
  "degree": "MBBS | MD (Paediatrics) | MRCP (UK) | FRCPCH (UK) | MSc Child Health",
  "about": "Dr. Vijay Sharma is a senior paediatric neurologist with over 30 years of experience. After completing his MD in India, he trained in the UK and served as a Senior Consultant for 18 years in Paediatric Neurology. He specializes in autism, ADHD, epilepsy, cerebral palsy, developmental delays, and rare neurological disorders in children.",
  "medicalProblems": [
    { "title": "Autism & ADHD", "description": "Evaluation and treatment for behavioral and developmental disorders." },
    { "title": "Epilepsy in Children", "description": "Management of seizures and neurological conditions." },
    { "title": "Cerebral Palsy", "description": "Comprehensive care for motor and developmental disabilities." }
  ],
  "procedures": [
    { "title": "Developmental Assessment", "description": "Evaluation of cognitive and motor milestones." },
    { "title": "Pediatric EEG", "description": "Electrical brain activity monitoring for seizures." },
    { "title": "Neurometabolic Evaluation", "description": "Diagnosis of rare neurological conditions." }
  ],
  "faqs": [
    { "question": "Does Dr. Vijay treat autism and ADHD?", "answer": "Yes, he specializes in developmental and behavioral disorders." },
    { "question": "Was he trained in the UK?", "answer": "Yes, he completed 5 years of consultant training and 18 years as a UK Consultant." },
    { "question": "Does he treat epilepsy in children?", "answer": "Yes, pediatric epilepsy management is one of his core specialties." }
  ]
},
{
  "slug": "dr-amit-pandey-pt",
  "name": "Dr. Amit Pandey (PT)",
  "specialty": "Physiotherapy",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head of Department – Physiotherapy",
  "degree": "BPT | MPT (Sports Medicine) | DCPTOT | MIAP",
  "about": "Dr. Amit Pandey is a senior physiotherapist with over 14 years of experience specializing in sports injuries, complex trauma rehabilitation, spine rehabilitation, and joint replacement recovery. He has worked with top hospitals, sports academies, Bollywood celebrities, and national politicians.",
  "medicalProblems": [
    { "title": "Sports Injuries", "description": "Rehabilitation for ligament tears, sprains, and muscle injuries." },
    { "title": "Post-Surgery Rehab", "description": "Recovery programs for knee, hip, and shoulder surgeries." },
    { "title": "Spine Conditions", "description": "Rehabilitation for spine injuries and chronic back pain." }
  ],
  "procedures": [
    { "title": "Sports Physiotherapy", "description": "Specialized care for athletes and active individuals." },
    { "title": "Joint Replacement Rehab", "description": "Recovery for knee, hip, and shoulder replacement patients." },
    { "title": "Manual Therapy & Mobilization", "description": "Hands-on therapy for pain relief and improved mobility." }
  ],
  "faqs": [
    { "question": "Does Dr. Amit treat sports injuries?", "answer": "Yes, he specializes in sports medicine and athletic rehab." },
    { "question": "Does he offer post-surgery rehab?", "answer": "Yes, he handles rehabilitation after knee, hip, and shoulder surgeries." },
    { "question": "Has he worked with celebrities?", "answer": "Yes, he has treated Bollywood personalities and national leaders." }
  ]
},
{
  "slug": "dr-brajesh-kumar-mishra",
  "name": "Dr. Brajesh Kumar Mishra",
  "specialty": "Emergency & Trauma Care",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head & Consultant – Emergency & Trauma Centre",
  "degree": "MBBS | CCEBDM | AFIH (Associate Fellow of Industrial Health)",
  "about": "Dr. Brajesh Kumar Mishra is a highly skilled emergency and trauma specialist with more than 22 years of experience in handling life-threatening medical situations. As the Head of the Emergency & Trauma Centre at AIMS, he is an expert in managing cardiac emergencies, trauma cases, resuscitation, and critical stabilization using BLS and ACLS protocols. His quick decision-making and patient-centered approach make him a trusted emergency care expert.",
  "medicalProblems": [
    { "title": "Trauma Injuries", "description": "Immediate management of road accidents, fractures, and trauma-related emergencies." },
    { "title": "Cardiac Emergencies", "description": "Rapid assessment and life-saving interventions for heart attacks and arrhythmias." },
    { "title": "Emergency Medical Conditions", "description": "Critical management of strokes, respiratory failure, poisoning, and shock." }
  ],
  "procedures": [
    { "title": "BLS & ACLS Resuscitation", "description": "Life-saving interventions for cardiac and respiratory arrest." },
    { "title": "Trauma Stabilization", "description": "Immediate care for polytrauma and severe injuries." },
    { "title": "Emergency Critical Care", "description": "Stabilization and rapid intervention during critical emergencies." }
  ],
  "faqs": [
    { "question": "Does Dr. Mishra handle cardiac emergencies?", "answer": "Yes, he is trained in ACLS and specializes in emergency cardiac care." },
    { "question": "Is he experienced in trauma care?", "answer": "Yes, he has over 22 years of experience in managing major trauma cases." },
    { "question": "What is his area of expertise?", "answer": "Emergency medicine, trauma management, BLS, ACLS, and critical care." }
  ]
},
{
  "slug": "dt-komal-malik",
  "name": "Dt. Komal Malik",
  "specialty": "Dietician & Clinical Nutrition",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head – Dietetics",
  "degree": "M.Sc (Food Science & Nutrition) | B.Sc (Home Science) | Certified Diabetes Educator | Six Sigma Green Belt | Executive Diploma in Food Quality Control",
  "about": "Dt. Komal Malik is a senior clinical dietician with more than 18 years of experience in therapeutic nutrition, metabolic disorders, weight management, and clinical diet planning. She has served as Head Dietician at prestigious hospitals including Max Smart Super Specialty Hospital, Sri Balaji Action Medical Institute, and Columbia Asia Hospital. She specializes in designing individualized nutrition care plans, lifestyle modification, diabetes management, and preventive nutrition.",
  "medicalProblems": [
    { "title": "Diabetes & Metabolic Disorders", "description": "Customized diet plans to control blood sugar and metabolic health." },
    { "title": "Obesity & Weight Management", "description": "Structured diet programs for weight loss and fitness goals." },
    { "title": "Therapeutic Diet Needs", "description": "Diet planning for kidney disease, liver disorders, cardiac issues, and gastrointestinal problems." }
  ],
  "procedures": [
    { "title": "Clinical Diet Planning", "description": "Personalized diet charts based on medical conditions." },
    { "title": "Nutrition Assessment", "description": "Analyzing dietary habits, nutrient deficiencies, and lifestyle patterns." },
    { "title": "Diabetes & Weight Counseling", "description": "Diet counseling for diabetes, obesity, and metabolic disorders." }
  ],
  "faqs": [
    { "question": "Does Dt. Komal help with weight loss?", "answer": "Yes, she specializes in weight management and therapeutic dieting." },
    { "question": "Is she a certified diabetes educator?", "answer": "Yes, she is certified from SitaRam Bhartiya Hospital, Delhi." },
    { "question": "Does she handle clinical diet cases?", "answer": "Yes, she manages diets for kidney, liver, heart, and GI disorders." }
  ]
},
{
  "slug": "dr-ruchi-singh",
  "name": "Dr. Ruchi Singh",
  "specialty": "Radiation Oncology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "HOD & Senior Consultant – Radiation Oncology",
  "degree": "MBBS | MD (Radiotherapy)",
  "about": "Dr. Ruchi Singh is a highly accomplished radiation oncologist with over 13 years of experience in treating complex cancers using advanced radiotherapy techniques including IMRT, IGRT, SBRT, SRT, DIBH, and brachytherapy. Having worked at leading institutions such as Fortis Noida, Max Patparganj, LNJP, Medanta, and Safdarjung Hospital, she brings extensive expertise in treating gynecological, breast, head & neck, urological, and neuro-oncological cancers. She has won multiple awards including the IP Gujral Best Paper Award and holds top positions in academic excellence.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Advanced radiotherapy including DIBH techniques." },
    { "title": "Cervical & Gynecologic Cancers", "description": "Comprehensive radiotherapy and brachytherapy treatment." },
    { "title": "Head & Neck Cancers", "description": "Precision radiotherapy for oral cavity, larynx, nasopharynx tumors." }
  ],
  "procedures": [
    { "title": "IMRT & IGRT", "description": "High-precision radiation therapy with minimal side effects." },
    { "title": "SBRT & SRS", "description": "Targeted high-dose radiation for tumors in brain, spine, and body." },
    { "title": "Brachytherapy", "description": "Internal radiation therapy for gynecologic and other cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Singh treat breast cancer?", "answer": "Yes, she specializes in advanced breast cancer radiotherapy including DIBH." },
    { "question": "Does she perform brachytherapy?", "answer": "Yes, she has extensive expertise in gynecologic and cervical cancer brachytherapy." },
    { "question": "Is she experienced in advanced technologies like SBRT?", "answer": "Yes, she routinely performs SBRT, SRS, IMRT, IGRT, and image-guided treatments." }
  ]
},
{
  "slug": "dr-amrita-razdan-kaul",
  "name": "Dr. Amrita Razdan Kaul",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Obstetrics & Gynaecology",
  "degree": "MBBS | DGO | DNB | FICOG",
  "about": "Dr. Amrita Razdan Kaul is a dedicated and patient-focused obstetrician and gynecologist with more than 14 years of clinical experience across leading hospitals such as Saket City Hospital, Sarvodaya Hospital, and AIMS. She is highly regarded for her compassionate approach, clinical excellence, and expertise in high-risk pregnancies, laparoscopic gynecological surgeries, and women’s reproductive health.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Comprehensive management of complicated and high-risk maternal conditions." },
    { "title": "Menstrual & Hormonal Disorders", "description": "Diagnosis and treatment of irregular cycles, PCOS, and hormonal issues." },
    { "title": "Gynecological Conditions", "description": "Management of fibroids, ovarian cysts, endometriosis, and infertility concerns." }
  ],
  "procedures": [
    { "title": "Laparoscopic Gynecologic Surgery", "description": "Minimally invasive procedures for faster recovery." },
    { "title": "Normal & High-Risk Deliveries", "description": "Safe and expert obstetric care for all types of pregnancies." },
    { "title": "Gynecologic Screening", "description": "Pap smear, breast examination, and preventive women’s health tests." }
  ],
  "faqs": [
    { "question": "Does Dr. Amrita handle high-risk pregnancies?", "answer": "Yes, she specializes in managing complicated and high-risk obstetrics." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, she performs minimally invasive gynecologic procedures." },
    { "question": "Is she experienced?", "answer": "She has over 14 years of clinical experience across top hospitals." }
  ]
},
{
  "slug": "dr-bhuvana-vijayakanthi",
  "name": "Dr. Bhuvana Vijayakanthi",
  "specialty": "Cardiac & CTVS Anesthesia",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Cardiac Anesthesia",
  "degree": "MBBS | MD (Anaesthesiology)",
  "about": "Dr. Bhuvana Vijayakanthi is an accomplished cardiac anesthesia specialist with more than 10 years of clinical experience at renowned cardiac centers in Delhi-NCR. She completed her MBBS from Stanley Medical College, MD in Anesthesiology from SMS Medical College Jaipur, and senior residency in Cardiac Anesthesia at AIIMS, New Delhi. She is also an American Heart Association certified BLS & ACLS instructor and has international training in echocardiography from New York.",
  "medicalProblems": [
    { "title": "Cardiac Surgery Anesthesia", "description": "Expert anesthesia care for cardiac bypass, valve surgery, and complex heart procedures." },
    { "title": "Heart Failure & ECMO Support", "description": "Anesthesia and critical support for heart transplant and ECMO cases." },
    { "title": "High-Risk Surgical Patients", "description": "Perioperative management of critically ill cardiac patients." }
  ],
  "procedures": [
    { "title": "Transesophageal Echocardiography (TEE)", "description": "Advanced imaging during cardiac surgery for precision and safety." },
    { "title": "ECMO Management", "description": "Support for patients needing extracorporeal membrane oxygenation." },
    { "title": "Cardiac Life Support Training", "description": "BLS & ACLS training and emergency airway management." }
  ],
  "faqs": [
    { "question": "Does Dr. Bhuvana handle cardiac transplant anesthesia?", "answer": "Yes, she has expertise in anesthesia for cardiac transplant and ECMO support." },
    { "question": "Is she an AHA-certified instructor?", "answer": "Yes, she is a certified BLS and ACLS instructor." },
    { "question": "Where did she train?", "answer": "She trained at prestigious institutes including AIIMS New Delhi and Maimonides Medical Center, New York." }
  ]
},
{
  "slug": "dr-gagan-sharma",
  "name": "Dr. Gagan Sharma",
  "specialty": "CT Angiography & Cardiac CT",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & HOD – Imaging & Radiology",
  "degree": "MBBS | MD (Radiodiagnosis)",
  "about": "Dr. Gagan Sharma is a senior radiologist with more than 17 years of experience in advanced imaging and radiology across premier medical institutions such as SGPGIMS Lucknow, Dr. B.R. Ambedkar Medical College Bangalore, Trinity Hospital, St. Philomena’s Hospital, and major hospitals in Faridabad. He specializes in CT Angiography, Cardiac CT, fetal imaging, ultrasonography, and anomaly scans. He holds prestigious FMF (London) certifications in advanced fetal echo and anomaly scan.",
  "medicalProblems": [
    { "title": "Cardiac & Vascular Disorders", "description": "Imaging for coronary artery disease, aneurysms, and vascular abnormalities." },
    { "title": "Fetal Development Concerns", "description": "High-precision fetal scans for anomaly detection and fetal heart evaluation." },
    { "title": "Neurological & Abdominal Issues", "description": "CT and ultrasound imaging for brain, abdomen, and soft tissue disorders." }
  ],
  "procedures": [
    { "title": "CT Angiography", "description": "Detailed imaging of heart and blood vessels for diagnosis." },
    { "title": "Cardiac CT Scan", "description": "Non-invasive evaluation of coronary arteries and cardiac structure." },
    { "title": "Ultrasound & Doppler", "description": "Fetal scans, obstetric imaging, and vascular Doppler examinations." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharma perform fetal scans?", "answer": "Yes, he is certified by FMF London in fetal anomaly and fetal echo scans." },
    { "question": "Is he experienced in Cardiac CT?", "answer": "Yes, he has extensive expertise in CT Angiography and Cardiac CT." },
    { "question": "Where has he worked earlier?", "answer": "He has served at SGPGIMS Lucknow, major Bangalore hospitals, and leading hospitals in Faridabad." }
  ]
},
{
  "slug": "dr-hamid-raihan",
  "name": "Dr. Hamid Raihan",
  "specialty": "Dental Care",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Head – Dental Services",
  "degree": "BDS | MHA",
  "about": "Dr. Hamid Raihan is a senior dental expert with over 10 years of experience, specializing in dental implants and advanced dental procedures. He serves as the Head of Dental Services at AIMS and is known for his expertise in managing medically compromised dental patients. He is also the author of the book 'High Yield Dental MCQs' and co-author of 'Management of Medically Compromised Dental Patients'.",
  "medicalProblems": [
    { "title": "Tooth Decay & Cavities", "description": "Diagnosis and restorative treatments to preserve natural teeth." },
    { "title": "Gum Diseases", "description": "Treatment for gingivitis, periodontitis, and gum infections." },
    { "title": "Missing Teeth", "description": "Implant-based solutions for long-term tooth replacement." }
  ],
  "procedures": [
    { "title": "Dental Implants", "description": "Permanent replacement for missing teeth using titanium implants." },
    { "title": "Root Canal Therapy", "description": "Treatment to save severely infected or damaged teeth." },
    { "title": "Cosmetic Dentistry", "description": "Smile correction treatments including veneers and whitening." }
  ],
  "faqs": [
    { "question": "Does Dr. Raihan perform implants?", "answer": "Yes, he specializes in implant dentistry and tooth replacement procedures." },
    { "question": "Is he experienced with complex dental cases?", "answer": "Yes, he is known for managing medically compromised patients and complex dental conditions." },
    { "question": "Has he authored any dental books?", "answer": "Yes, he has authored and co-authored books used by dental students and professionals." }
  ]
},
{
  "slug": "dr-meghana-phadke-sultania",
  "name": "Dr. Meghana Phadke Sultania",
  "specialty": "Pediatrics & Adolescent Health",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Head (Unit III) – Pediatrics",
  "degree": "MBBS | DNB (Paediatrics) | MNAMS | EUTEACH Certification | EULAR Training",
  "about": "Dr. Meghana Phadke Sultania is a dedicated pediatrician with over 13 years of experience in child and adolescent healthcare. She has trained at prominent institutions such as Lilavati Hospital, Mumbai and ESIC Okhla, New Delhi. She specializes in growth and development, adolescent health issues, allergies, asthma, rheumatology-related disorders, and preventive pediatrics including vaccinations and nutrition counseling.",
  "medicalProblems": [
    { "title": "Growth & Development Issues", "description": "Evaluation and treatment for delayed milestones and developmental concerns." },
    { "title": "Adolescent Health Problems", "description": "Management of puberty concerns, acne, stress, mood changes, and hormonal issues." },
    { "title": "Pediatric Asthma & Allergy", "description": "Treatment for breathing difficulties, allergies, and long-term asthma care." }
  ],
  "procedures": [
    { "title": "Vaccinations", "description": "Complete immunization schedules for babies, children, and adolescents." },
    { "title": "Nutritional Counseling", "description": "Diet and nutrition guidance for healthy growth and immunity." },
    { "title": "Pediatric Infection Management", "description": "Treatment for childhood infections and fever-related illnesses." }
  ],
  "faqs": [
    { "question": "Does Dr. Meghana treat adolescent health issues?", "answer": "Yes, she specializes in hormonal issues, puberty concerns, mental health support, and adolescent counseling." },
    { "question": "Does she offer vaccination services?", "answer": "Yes, she provides complete vaccination for all age groups." },
    { "question": "Is she experienced?", "answer": "Yes, she has more than 13 years of pediatric and neonatal experience." }
  ]
},
{
  "slug": "dr-aakib-hamid-charag",
  "name": "Dr. Aakib Hamid Charag",
  "specialty": "Urology & Kidney Transplant",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Urology & Kidney Transplant",
  "degree": "DNB (Genitourinary Surgery) | MS (General Surgery) | MBBS",
  "about": "Dr. Aakib Hamid Charag is an accomplished urologist and kidney transplant specialist with over 10 years of clinical experience. He has worked at reputed institutions such as Sheri Kashmir Institute of Medical Sciences, PGIMER & Dr. RML Hospital (Delhi), and Yashoda Superspeciality Hospital, Hyderabad. His expertise spans endourology, laparoscopy, uro-oncology, and renal transplant surgery, supported by numerous international publications.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Diagnosis and minimally invasive treatment for urinary stones." },
    { "title": "Prostate Disorders", "description": "Management of enlarged prostate, prostate cancer, and urinary issues." },
    { "title": "Urinary Tract Diseases", "description": "Treatment for UTIs, strictures, bladder issues, and obstructive uropathy." }
  ],
  "procedures": [
    { "title": "Endourology Procedures", "description": "Laser stone removal, URS, PCNL, and minimally invasive stone surgery." },
    { "title": "Laparoscopic Urology", "description": "Advanced keyhole surgeries for kidney and urinary tract conditions." },
    { "title": "Renal Transplant Surgery", "description": "Comprehensive kidney transplant surgical care." }
  ],
  "faqs": [
    { "question": "Does Dr. Aakib specialize in kidney transplant?", "answer": "Yes, he is trained and experienced in renal transplant surgery." },
    { "question": "Does he treat kidney stones with laser?", "answer": "Yes, he performs laser-based minimally invasive stone removal." },
    { "question": "Has he published research?", "answer": "Yes, he has multiple international scientific publications." }
  ]
},
{
  "slug": "dr-arushi-agarwal",
  "name": "Dr. Arushi Agarwal",
  "specialty": "Paediatric Hematology & Oncology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Pediatric Hematologist & Oncologist",
  "degree": "MBBS | MD (Pediatrics) | DNB Pediatrics | FNB Pediatric Hematology & Oncology",
  "about": "Dr. Arushi Agarwal is one of the best Pediatric Hematologists and Oncologists in Delhi-NCR and the pioneer of this department in Faridabad. She has over 10 years of experience, including 5+ years dedicated to pediatric cancers and blood disorders. Trained at the prestigious Rajiv Gandhi Cancer Institute & Research Center and UCMS-GTB Hospital, she is committed to providing affordable and evidence-based treatment for leukemia, lymphoma, anemias, thalassemia, and pediatric blood disorders.",
  "medicalProblems": [
    { "title": "Childhood Anemia", "description": "Treatment for nutritional, autoimmune, aplastic, and sickle cell anemia." },
    { "title": "Blood Disorders", "description": "Management of thalassemia, hemoglobinopathies, platelet disorders, and ITP." },
    { "title": "Childhood Cancers", "description": "Expert care for leukemia (ALL, AML, CML) and lymphomas." }
  ],
  "procedures": [
    { "title": "Chemotherapy for Children", "description": "Safe administration of pediatric chemotherapy with supportive care." },
    { "title": "Bone Marrow Evaluation", "description": "Diagnostic assessment for leukemia and hematological disorders." },
    { "title": "Thalassemia & Hemoglobinopathy Care", "description": "Comprehensive long-term disease management." }
  ],
  "faqs": [
    { "question": "Does Dr. Arushi treat childhood leukemia?", "answer": "Yes, she specializes in treating ALL, AML, and CML." },
    { "question": "Does she treat thalassemia?", "answer": "Yes, she provides long-term management for thalassemia and hemoglobinopathies." },
    { "question": "Is she award-winning?", "answer": "Yes, she has received multiple awards including Best Resident and Best Oncology Oral Presentation." }
  ]
},
{
  "slug": "dr-aishwarya-sinha",
  "name": "Dr. Aishwarya Sinha",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Obs & Gynae (Unit-II)",
  "degree": "MBBS | MS (Obs/Gynae) Gold Medalist",
  "about": "Dr. Aishwarya Sinha is an accomplished Senior Consultant in Obstetrics, Gynaecology & Robotic Surgery with over 17 years of clinical experience. An MS Gold Medalist, she has a strong academic background and rich teaching experience with MBBS and DNB students. She specializes in high-risk pregnancy, minimally invasive gynecologic surgeries, robotic procedures, infertility care, and laparoscopic gynecology.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Management of complicated and high-risk maternal conditions." },
    { "title": "Infertility Issues", "description": "Evaluation and management of couples trying to conceive." },
    { "title": "Gynecologic Disorders", "description": "Treatment for fibroids, cysts, endometriosis, PCOS, and menstrual disorders." }
  ],
  "procedures": [
    { "title": "Robotic Gynecologic Surgery", "description": "Advanced minimally invasive procedures for complex conditions." },
    { "title": "Laparoscopic Surgery", "description": "Keyhole surgeries for uterus, ovaries, and reproductive tract issues." },
    { "title": "Pregnancy & Delivery Care", "description": "Comprehensive antenatal care and safe childbirth support." }
  ],
  "faqs": [
    { "question": "Does Dr. Aishwarya perform robotic surgeries?", "answer": "Yes, she specializes in robotic gynecologic procedures." },
    { "question": "Does she handle high-risk pregnancies?", "answer": "Yes, she provides expert care for complicated pregnancies." },
    { "question": "Is she a gold medalist?", "answer": "Yes, she received a Gold Medal in MS (Obs/Gynae)." }
  ]
},
{
  "slug": "dr-pallavi-purwar",
  "name": "Dr. Pallavi Purwar",
  "specialty": "Thoracic Surgery",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Visiting Consultant – Thoracic Surgery",
  "degree": "MBBS | MS (PGI Chandigarh) | Doctorate in Thoracic Surgery",
  "about": "Dr. Pallavi Purwar is a highly skilled and accomplished thoracic surgeon with extensive experience from India's top institutions including Sir Ganga Ram Hospital, Safdarjung Hospital, National Institute of TB & Respiratory Diseases, and Tata Memorial Centre. She specializes in lung cancer, bronchiectasis, tracheal stenosis, aspergilloma, chest wall tumors, and complex thoracic surgeries. She has earned multiple national awards for her research and clinical excellence.",
  "medicalProblems": [
    { "title": "Lung Cancer & Tumors", "description": "Diagnosis and surgical treatment for early and advanced lung cancers." },
    { "title": "Chest Diseases", "description": "Management of infections like tuberculosis, mucormycosis, and abscess." },
    { "title": "Airway Disorders", "description": "Treatment of tracheal stenosis and airway obstructions." }
  ],
  "procedures": [
    { "title": "Thoracoscopic Surgery (VATS)", "description": "Minimally invasive chest surgery for faster recovery." },
    { "title": "Lung Resections", "description": "Surgical management of lung cancers and bronchiectasis." },
    { "title": "Esophageal & Mediastinal Surgery", "description": "Treatment for esophageal tumors and mediastinal masses." }
  ],
  "faqs": [
    { "question": "Does Dr. Pallavi treat lung cancer?", "answer": "Yes, she specializes in surgical management of lung tumors." },
    { "question": "Does she perform VATS?", "answer": "Yes, she is experienced in minimally invasive thoracic surgeries." },
    { "question": "Has she won awards?", "answer": "Yes, she has received multiple national awards for research and clinical work." }
  ]
},
{
  "slug": "dr-siddhi-goel",
  "name": "Dr. Siddhi Goel",
  "specialty": "Ophthalmology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant & Head (Unit-II) – Ophthalmology",
  "degree": "MBBS | MD (AIIMS, Gold Medalist) | DNB | FICO | ICO (Cornea & External Disease)",
  "about": "Dr. Siddhi Goel is a highly accomplished ophthalmologist specializing in cornea, cataract, and refractive surgeries. An AIIMS Gold Medalist with more than 10 years of experience, she has worked in top institutions including RP Centre, AIIMS. She has over 22 PubMed-indexed publications and multiple national awards for her research on advanced corneal surgeries.",
  "medicalProblems": [
    { "title": "Cataract & Vision Problems", "description": "Diagnosis and surgical treatment of cataract, refractive errors, and presbyopia." },
    { "title": "Corneal Diseases", "description": "Management of corneal infections, keratoplasty, and corneal dystrophies." },
    { "title": "Glaucoma & Eye Disorders", "description": "Screening and treatment for glaucoma, dry eyes, and eye trauma." }
  ],
  "procedures": [
    { "title": "Phacoemulsification & MICS", "description": "Advanced micro-incision cataract surgery." },
    { "title": "Refractive Surgery (LASIK, ICL)", "description": "Vision correction through laser and implantable lenses." },
    { "title": "Corneal Transplant", "description": "Keratoplasty and corneal reconstruction." }
  ],
  "faqs": [
    { "question": "Is Dr. Siddhi a Gold Medalist?", "answer": "Yes, she is an AIIMS Gold Medalist in Ophthalmology." },
    { "question": "Does she perform LASIK?", "answer": "Yes, she performs advanced LASIK and ICL procedures." },
    { "question": "Does she treat corneal disorders?", "answer": "Yes, she specializes in cornea and external eye diseases." }
  ]
},
{
  "slug": "dr-saurabh-gupta",
  "name": "Dr. Saurabh Gupta",
  "specialty": "Pain Medicine",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "7+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Pain Medicine",
  "degree": "MBBS | MD | FIDM",
  "about": "Dr. Saurabh Gupta is a dedicated Pain Medicine specialist with 7+ years of experience across leading hospitals including Safdarjung Hospital, ESIC Medical College, and Guru Gobind Singh Hospital. He specializes in USG and fluoroscopy-guided procedures for spine, joint, and nerve-related pain. He received the Indian Health Award (IHA) in 2016 for his contributions to pain management.",
  "medicalProblems": [
    { "title": "Back & Neck Pain", "description": "Targeted treatment for chronic and acute spine pain." },
    { "title": "Joint Pain", "description": "Management of knee, ankle, and shoulder pain." },
    { "title": "Nerve Pain Disorders", "description": "Treatment for neuropathic pain, fibromyalgia, and headaches." }
  ],
  "procedures": [
    { "title": "USG-Guided Injections", "description": "Precision-guided treatment for spine and joint pain." },
    { "title": "Fluoroscopic Pain Procedures", "description": "Advanced image-guided pain relief therapies." },
    { "title": "Migraine & Headache Management", "description": "Specialized treatment for chronic headache disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Saurabh treat spine pain?", "answer": "Yes, he specializes in spine and musculoskeletal pain." },
    { "question": "Does he use ultrasound guidance?", "answer": "Yes, he performs USG-guided and fluoroscopic pain treatments." },
    { "question": "Has he won awards?", "answer": "Yes, he received the Indian Health Award in 2016." }
  ]
},
{
  "slug": "dr-upasana-khanna",
  "name": "Dr. Upasana Khanna",
  "specialty": "Ophthalmology",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Ophthalmology",
  "degree": "FAEH | DOMS | MBBS",
  "about": "Dr. Upasana Khanna is a highly skilled ophthalmologist trained at the prestigious Aravind Eye Hospital (TVL). She specializes in cataract surgeries, anterior segment diseases, and oculoplasty. With extensive experience in complex orbital and eyelid disorders, she offers world-class eye care supported by strong clinical training and expertise.",
  "medicalProblems": [
    { "title": "Cataract", "description": "Evaluation and surgical management using advanced phaco techniques." },
    { "title": "Anterior Segment Disorders", "description": "Treatment of corneal diseases, infections, and structural abnormalities." },
    { "title": "Oculoplasty Issues", "description": "Management of eyelid deformities, orbital diseases, and trauma." }
  ],
  "procedures": [
    { "title": "Cataract Surgery", "description": "Phacoemulsification and advanced lens implantation." },
    { "title": "Oculoplasty Procedures", "description": "Surgeries for eyelid, orbit, and lacrimal system conditions." },
    { "title": "Corneal Treatments", "description": "Management of corneal injury, infection, and degeneration." }
  ],
  "faqs": [
    { "question": "Is Dr. Upasana trained at Aravind Eye Hospital?", "answer": "Yes, she completed advanced fellowship at Aravind Eye Hospital, TVL." },
    { "question": "Does she perform cataract surgeries?", "answer": "Yes, she specializes in advanced cataract surgery." },
    { "question": "Does she handle oculoplasty cases?", "answer": "Yes, she has extensive experience in orbital and eyelid surgeries." }
  ]
},
{
  "slug": "ms-sonia-rai-vaid",
  "name": "Ms. Sonia Rai Vaid",
  "specialty": "Lactation Counselling & Childbirth Education",
  "hospital": "Asian Institute of Medical Sciences",
  "experience": "7+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Maternal & Child Wellness Consultant",
  "degree": "Advanced Certified Lactation Professional | Childbirth Educator | Birth Doula | Prenatal Yoga Teacher",
  "about": "Ms. Sonia Rai Vaid is a maternal and child wellness expert with over 7 years of experience supporting and educating families globally. She has worked as a visiting Lactation Counsellor at Moolchand Hospital and Phoenix Hospital, Delhi. She specializes in breastfeeding support, childbirth education, prenatal wellness, and maternal fitness, helping mothers navigate pregnancy, delivery, and postpartum health.",
  "medicalProblems": [
    { "title": "Breastfeeding Challenges", "description": "Support for latching issues, low milk supply, pain, and positioning." },
    { "title": "Newborn Care Concerns", "description": "Guidance for newborn feeding, sleep, and early parenthood needs." },
    { "title": "Pregnancy Wellness", "description": "Counseling for prenatal fitness, childbirth preparation, and postpartum recovery." }
  ],
  "procedures": [
    { "title": "Lactation Counselling", "description": "Personalized breastfeeding assistance and education." },
    { "title": "Childbirth Education", "description": "Antental classes covering labor, delivery, and newborn care." },
    { "title": "Prenatal & Postnatal Fitness", "description": "Safe exercise programs for pregnancy and postpartum recovery." }
  ],
  "faqs": [
    { "question": "Does Ms. Sonia help with breastfeeding?", "answer": "Yes, she specializes in lactation counselling and infant feeding support." },
    { "question": "Does she offer prenatal classes?", "answer": "Yes, she conducts childbirth education and prenatal yoga sessions." },
    { "question": "Is she certified?", "answer": "Yes, she holds multiple certifications including ACLP, Birth Doula, and CBE." }
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
    "image": "assets/uploads/medanta.jpg",
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
    "image": "assets/uploads/fmri.jpg",
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
    "image": "assets/uploads/artemis.jpg",
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
    "image": "assets/uploads/max-saket.jpg",
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
    "image": "assets/uploads/max-patparganj.jpg",
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
    "image": "assets/uploads/amrita.jpg",
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
    "image": "assets/uploads/metro.jpg",
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
    "image": "assets/uploads/paras.jpg",
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
    "image": "assets/uploads/asian.jpg",
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
    "image": "assets/uploads/manipal.jpg",
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
