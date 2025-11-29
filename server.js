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
  "slug": "dr-meenakshi-jain",
  "name": "Dr. Meenakshi Jain",
  "specialty": "Internal Medicine",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "26+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director & HOD – Internal Medicine",
  "degree": "MD (Medicine) | MBBS (Maulana Azad Medical College) | PG Diploma in Diabetes (UK) | Master Class in Diabetes (Royal College of Physicians UK)",
  "about": "Dr. Meenakshi Jain is a senior internal medicine specialist with over 26 years of clinical experience. She has led the Internal Medicine departments at Max Hospitals and specializes in diabetes, hypertension, geriatric care, metabolic disorders and preventive healthcare.",
  "medicalProblems": [
    { "title": "Diabetes Management", "description": "Comprehensive care for Type 1, Type 2 and gestational diabetes." },
    { "title": "Hypertension & Heart Disease", "description": "Management of high blood pressure and cardiac risk factors." },
    { "title": "Thyroid & Metabolic Disorders", "description": "Diagnosis and treatment of metabolic and hormonal imbalances." },
    { "title": "Geriatric Health Issues", "description": "Holistic care for elderly patients with chronic conditions." }
  ],
  "procedures": [
    { "title": "Diabetes Care Programmes", "description": "Customized treatment for adult and adolescent diabetes." },
    { "title": "Preventive Health Screening", "description": "Comprehensive medical checkups and lifestyle management." },
    { "title": "Cardio-Metabolic Management", "description": "Integrated treatment of heart and metabolic diseases." },
    { "title": "Chronic Disease Management", "description": "Long-term care for lifestyle and systemic diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Meenakshi Jain treat diabetes?", "answer": "Yes, she specializes in diabetes care for adults and pregnant women." },
    { "question": "Does she handle hypertension?", "answer": "Yes, she has deep experience in treating hypertension and related complications." },
    { "question": "Does she provide preventive health care?", "answer": "Yes, she focuses on holistic preventive and lifestyle-based healthcare." }
  ]
},
{
  "slug": "dr-kanika-gupta",
  "name": "Dr. Kanika Gupta",
  "specialty": "Surgical Oncology – Gynae & Robotic Surgery",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj | Max Hospital – Vaishali",
  "experience": "39+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – Surgical Oncology (Gynae & Robotic Surgery)",
  "degree": "MBBS | MS (Obstetrics & Gynaecology) | Fellowship in Gynae Cancer Surgery (Prof. Neville Hacker) | Pelvic Endoscopy Training (Germany) | Gynae Cancer Training (MD Anderson, USA)",
  "about": "Dr. Kanika Gupta is one of India’s most senior and respected gynae cancer surgeons with nearly four decades of experience. She specializes in complex robotic and laparoscopic surgeries for gynecologic cancers and has performed numerous live surgeries at national and international workshops.",
  "medicalProblems": [
    { "title": "Ovarian Cancer", "description": "Diagnosis and surgical management of ovarian tumors." },
    { "title": "Cervical & Uterine Cancer", "description": "Advanced surgical treatment of cervical and endometrial cancers." },
    { "title": "Vulvar & Vaginal Cancers", "description": "Treatment of lower genital tract malignancies." },
    { "title": "Pre-Cancerous Gynaecological Conditions", "description": "Management of high-risk and pre-cancer lesions." }
  ],
  "procedures": [
    { "title": "Robotic Gynae Cancer Surgery", "description": "Precision robotic procedures for complex gynae malignancies." },
    { "title": "Laparoscopic Gynae Oncology Surgery", "description": "Minimal access surgery for cancers of the uterus, cervix and ovary." },
    { "title": "Cytoreductive Surgery & HIPEC", "description": "Advanced cancer debulking for ovarian and uterine cancers." },
    { "title": "Preventive Gynae Cancer Surgery", "description": "Risk-reducing and prophylactic procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Kanika Gupta specialize in robotic gynae cancer surgery?", "answer": "Yes, she is a leading expert in robotic and laparoscopic oncologic surgery." },
    { "question": "Does she treat ovarian and uterine cancer?", "answer": "Yes, she performs advanced surgical procedures for these cancers." },
    { "question": "Does she handle recurrent or complex gynae cancers?", "answer": "Yes, she has extensive experience in complicated and recurrent cancer surgeries." }
  ]
},
{
  "slug": "dr-manoj-johar",
  "name": "Dr. Manoj Johar",
  "specialty": "Aesthetic & Reconstructive Surgery",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – Aesthetic & Reconstructive Surgery",
  "degree": "MCh (Plastic Surgery) | MS (General Surgery) | Fellow – Uppsala University Sweden | Fellow of International College of Surgeons | Laser Training – Harvard (USA), UK & Israel",
  "about": "Dr. Manoj K. Johar is a renowned Plastic, Aesthetic and Reconstructive Surgeon with over three decades of experience in cosmetic surgery, laser aesthetics, reconstructive surgeries and anti-ageing medicine. He is internationally trained and known for patient-focused treatment planning and precision-driven results.",
  "medicalProblems": [
    { "title": "Cosmetic Concerns", "description": "Aesthetic issues related to face, body and anti-ageing." },
    { "title": "Reconstructive Defects", "description": "Post-trauma, burn and congenital deformity corrections." },
    { "title": "Skin & Laser Issues", "description": "Laser treatments for scars, pigmentation, ageing and hair." },
    { "title": "Microsurgical Requirements", "description": "Complex reconstruction using microsurgery techniques." }
  ],
  "procedures": [
    { "title": "Cosmetic & Laser Aesthetic Surgery", "description": "Face, body and skin-enhancing cosmetic procedures." },
    { "title": "Reconstructive & Microsurgery", "description": "Rebuilding tissues after trauma, burns or disease." },
    { "title": "Anti-Ageing Treatments", "description": "Regenerative and aesthetic medicine for youth enhancement." },
    { "title": "Laser-Based Procedures", "description": "Advanced laser work for scars, pigmentation and rejuvenation." }
  ],
  "faqs": [
    { "question": "Does Dr. Johar perform cosmetic surgery?", "answer": "Yes, he specializes in cosmetic and laser aesthetic surgery." },
    { "question": "Does he handle reconstructive cases?", "answer": "Yes, he is experienced in trauma, burn and congenital reconstructive surgery." },
    { "question": "Is he internationally trained in lasers?", "answer": "Yes, he has undergone extensive laser training in the USA, UK and Israel." }
  ]
},
{
  "slug": "dr-vivek-mangla",
  "name": "Dr. Vivek Mangla",
  "specialty": "GI & HPB Surgical Oncology",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – GI & HPB Surgical Oncology",
  "degree": "MCh (GI Surgery – AIIMS) | MS (Surgery – MAMC) | MBBS (MAMC) | FALS (HPB) | FACRSI | FAIS",
  "about": "Dr. Vivek Mangla is a leading GI and Hepatopancreatobiliary surgical oncologist with extensive expertise in gastrointestinal cancers, pancreatic surgery, liver surgery and advanced laparoscopic/robotic oncologic procedures. He has served at Ganga Ram Hospital, ILBS and AIIMS.",
  "medicalProblems": [
    { "title": "Gastrointestinal Cancers", "description": "Stomach, intestine and colorectal cancers." },
    { "title": "Pancreatic Tumors", "description": "Management of benign and malignant pancreatic diseases." },
    { "title": "Liver & Biliary Disorders", "description": "Cancers and complex HPB diseases." },
    { "title": "Esophagus & Upper GI Diseases", "description": "Tumors and surgical GI conditions." }
  ],
  "procedures": [
    { "title": "GI Cancer Surgery", "description": "Surgical management of stomach, colorectal and small bowel cancers." },
    { "title": "HPB Surgery", "description": "Advanced liver, pancreas and bile duct surgeries." },
    { "title": "Robotic & Laparoscopic Oncology", "description": "Minimally invasive GI cancer procedures." },
    { "title": "Colorectal Surgery", "description": "Specialized surgery for rectal and colon tumors." }
  ],
  "faqs": [
    { "question": "Does Dr. Mangla perform pancreatic cancer surgery?", "answer": "Yes, he specializes in complex pancreatic and HPB surgeries." },
    { "question": "Does he offer minimally invasive cancer surgery?", "answer": "Yes, he performs laparoscopic and robotic GI oncologic procedures." },
    { "question": "Does he treat GI cancers?", "answer": "Yes, he manages all gastrointestinal cancers including liver and colorectal." }
  ]
},
{
  "slug": "dr-vivek-kumar",
  "name": "Dr. Vivek Kumar",
  "specialty": "Neurology",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "28+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director & Head – Neurology",
  "degree": "DM (Neurology – SGPGI Lucknow) | MD (Medicine – GSVM Kanpur) | MBBS (MLB Medical College Jhansi)",
  "about": "Dr. Vivek Kumar is a highly respected neurologist known for his pioneering contribution to stroke care and his role in developing Max Healthcare's Neurology Department. He has decades of clinical experience in treating complex neurological disorders.",
  "medicalProblems": [
    { "title": "Stroke", "description": "Emergency and long-term treatment of ischemic and hemorrhagic strokes." },
    { "title": "Epilepsy", "description": "Diagnosis and treatment of seizure disorders." },
    { "title": "Parkinson's Disease", "description": "Management of movement and degenerative neurological disorders." },
    { "title": "Headache & Migraine", "description": "Treatment for chronic headache syndromes." }
  ],
  "procedures": [
    { "title": "Stroke Management", "description": "Acute, preventive and rehabilitative stroke care." },
    { "title": "Epilepsy Treatment", "description": "Medical management and long-term follow-up of epilepsy." },
    { "title": "Movement Disorder Management", "description": "Advanced therapies for Parkinson’s disease." },
    { "title": "Neurological Evaluation", "description": "Comprehensive assessment of neurological symptoms." }
  ],
  "faqs": [
    { "question": "Does Dr. Vivek Kumar treat stroke?", "answer": "Yes, he leads advanced stroke care services and specializes in stroke management." },
    { "question": "Does he manage epilepsy?", "answer": "Yes, he has extensive experience in treating seizure disorders." },
    { "question": "Does he treat Parkinson’s disease?", "answer": "Yes, he provides comprehensive care for degenerative movement disorders." }
  ]
},
{
  "slug": "dr-kumud-rai",
  "name": "Dr. Kumud Rai",
  "specialty": "Vascular Surgery",
  "hospital": "Max Hospital – Saket Smart | Max Hospital – Gurugram | Max Hospital – Saket East",
  "experience": "41+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – Vascular Surgery",
  "degree": "MBBS (AFMC Pune) | MS (Surgery – Pune University) | Vascular Surgery Training – Erasmus University Hospital, Rotterdam",
  "about": "Dr. (Col.) Kumud Rai is one of India’s most experienced vascular and endovascular surgeons. With over 25 years in vascular surgery, he has led major departments in the Armed Forces and Max Healthcare. He is a former President of the Vascular Society of India and has trained numerous vascular surgeons.",
  "medicalProblems": [
    { "title": "Aortic Aneurysms", "description": "Management of thoracic and abdominal aneurysms." },
    { "title": "Varicose Veins", "description": "Laser and RFA treatment for swollen and painful veins." },
    { "title": "Peripheral Artery Disease", "description": "Treatment of blocked or narrowed limb arteries." },
    { "title": "Dialysis Access Issues", "description": "AV fistula, grafts and vascular access problems." }
  ],
  "procedures": [
    { "title": "Endovascular Aneurysm Repair (EVAR)", "description": "Minimally invasive repair of aortic aneurysms." },
    { "title": "Peripheral Bypass & Stenting", "description": "Open and endovascular procedures for limb-saving circulation." },
    { "title": "Laser & RFA for Varicose Veins", "description": "Minimally invasive varicose vein treatment." },
    { "title": "Carotid Endarterectomy", "description": "Surgery for carotid artery stenosis and stroke prevention." }
  ],
  "faqs": [
    { "question": "Does Dr. Kumud Rai treat varicose veins?", "answer": "Yes, he specializes in laser and RFA treatment for varicose veins." },
    { "question": "Does he perform endovascular aneurysm repair?", "answer": "Yes, he is highly experienced in EVAR and open aneurysm surgeries." },
    { "question": "Does he manage vascular access for dialysis?", "answer": "Yes, he routinely performs AV fistula and graft procedures." }
  ]
},
{
  "slug": "dr-vaibhav-mishra",
  "name": "Dr. Vaibhav Mishra",
  "specialty": "Cardiac Surgery (CTVS)",
  "hospital": "Max Hospital – Patparganj",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director – CTVS",
  "degree": "MCh (Cardiothoracic Surgery) | MS (Surgery) | MBBS",
  "about": "Dr. Vaibhav Mishra is an accomplished cardiothoracic and vascular surgeon with extensive international experience across New Zealand and Australia. He has led CTVS departments and specializes in advanced cardiac procedures including minimally invasive cardiac surgery, valve repair, aortic surgery and beating-heart bypass.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages in heart arteries requiring bypass surgery." },
    { "title": "Heart Valve Disorders", "description": "Conditions affecting mitral, aortic and other heart valves." },
    { "title": "Aortic Aneurysms", "description": "Aneurysms and aortic root conditions requiring surgical repair." },
    { "title": "Congenital & Structural Heart Issues", "description": "Complex heart defects and structural abnormalities." }
  ],
  "procedures": [
    { "title": "Beating Heart Bypass Surgery", "description": "Total arterial bypass without stopping the heart." },
    { "title": "Minimally Invasive Cardiac Surgery", "description": "Small-incision heart surgeries with faster recovery." },
    { "title": "Aortic Root & Arch Surgery", "description": "Repair and reconstruction of the aortic root/arch." },
    { "title": "Valve Repair & Replacement", "description": "Mitral and aortic valve reconstruction or replacement." }
  ],
  "faqs": [
    { "question": "Does Dr. Vaibhav specialize in bypass surgery?", "answer": "Yes, he is known for beating heart and total arterial bypass surgeries." },
    { "question": "Does he perform minimally invasive cardiac surgery?", "answer": "Yes, he is trained internationally in advanced minimally invasive cardiac procedures." },
    { "question": "Has he worked abroad?", "answer": "Yes, he has worked and trained in New Zealand and Australia." }
  ]
},
{
  "slug": "dr-l-tomar",
  "name": "Dr. L. Tomar",
  "specialty": "Orthopaedics & Joint Replacement",
  "hospital": "Max Hospital – Patparganj",
  "experience": "33+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director & Unit Head – Orthopaedics & Joint Replacement",
  "degree": "MCh (Ortho – University of Dundee) | MS (Ortho) | Fellow ICS (USA) | Fellowship AO Davos (Switzerland)",
  "about": "Dr. L. Tomar is a senior orthopaedic and joint replacement surgeon with over 30 years of experience and more than 10,000 joint replacement surgeries. He is internationally trained in the UK, Australia, Germany and the USA and is known for his expertise in complex joint replacements and revision surgeries.",
  "medicalProblems": [
    { "title": "Knee Arthritis", "description": "Pain, stiffness and degeneration of knee joints." },
    { "title": "Hip Arthritis", "description": "Mobility loss and severe hip degeneration." },
    { "title": "Sports & Ligament Injuries", "description": "ACL tears, meniscus injuries and joint instability." },
    { "title": "Spine Disorders", "description": "Disc prolapse, canal stenosis and spine fractures." }
  ],
  "procedures": [
    { "title": "Total Knee Replacement", "description": "Primary, complex and revision TKR procedures." },
    { "title": "Total Hip Replacement", "description": "Advanced hip replacement including revision surgeries." },
    { "title": "Arthroscopy", "description": "ACL reconstruction and meniscus surgeries." },
    { "title": "Spine Surgery", "description": "Surgery for disc issues, stenosis and trauma." }
  ],
  "faqs": [
    { "question": "Does Dr. Tomar perform revision knee replacement?", "answer": "Yes, he is an expert in complex and revision joint replacement surgeries." },
    { "question": "Does he handle arthroscopy procedures?", "answer": "Yes, he specializes in ACL reconstruction and meniscus surgeries." },
    { "question": "Is he internationally trained?", "answer": "Yes, he trained in the UK, USA, Germany, Switzerland and Australia." }
  ]
},
{
  "slug": "dr-naresh-agarwal",
  "name": "Dr. Naresh Agarwal",
  "specialty": "Gastroenterology, Hepatology & Endoscopy",
  "hospital": "Max Hospital – Shalimar Bagh | Max Hospital – Patparganj",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director – Gastroenterology",
  "degree": "DM (Gastroenterology – Delhi University) | MD (Medicine) | MBBS",
  "about": "Dr. Naresh Agarwal is an experienced gastroenterologist and hepatologist with extensive work across leading institutions like SGPGI Lucknow, GB Pant Hospital and Yashoda Hospitals. He specializes in digestive, liver and pancreatic diseases and has published widely in national and international journals.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Fatty liver, hepatitis, cirrhosis and liver failure." },
    { "title": "Gastrointestinal Disorders", "description": "Acidity, IBS, IBD, abdominal pain and diarrheal diseases." },
    { "title": "Pancreatic Disorders", "description": "Pancreatitis and cystic pancreatic diseases." },
    { "title": "Celiac Disease", "description": "Diagnosis and long-term management of gluten intolerance." }
  ],
  "procedures": [
    { "title": "Upper GI Endoscopy", "description": "Diagnostic and therapeutic endoscopic procedures." },
    { "title": "Colonoscopy", "description": "Screening and evaluation of colon disorders." },
    { "title": "ERCP", "description": "Biliary and pancreatic duct procedures." },
    { "title": "Liver Disease Management", "description": "Treatment of acute and chronic liver conditions." }
  ],
  "faqs": [
    { "question": "Does Dr. Naresh Agarwal treat liver diseases?", "answer": "Yes, he specializes in hepatology and manages fatty liver, hepatitis and cirrhosis." },
    { "question": "Is he experienced in endoscopy?", "answer": "Yes, he performs a wide range of diagnostic and therapeutic endoscopies." },
    { "question": "Has he published research?", "answer": "Yes, he has over 21 publications in reputed journals." }
  ]
},
{
  "slug": "dr-dilip-bhalla",
  "name": "Dr. Dilip Bhalla",
  "specialty": "Nephrology & Kidney Transplant",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Nephrology",
  "degree": "DM (Nephrology – PGI Chandigarh) | DNB (Nephrology) | MD (Medicine) | MBBS",
  "about": "Dr. Dilip Bhalla is a senior nephrologist with more than 34 years of experience in nephrology, kidney transplant care and critical renal management. He heads the nephrology unit at Max Patparganj and leads its DNB nephrology training programme.",
  "medicalProblems": [
    { "title": "Kidney Failure", "description": "Management of acute and chronic renal failure." },
    { "title": "Dialysis Needs", "description": "Haemodialysis, peritoneal dialysis and dialysis access issues." },
    { "title": "Kidney Transplant Care", "description": "High-risk and cadaveric transplant management." },
    { "title": "Critical Care Nephrology", "description": "Renal support in ICU and complex infections." }
  ],
  "procedures": [
    { "title": "Kidney Transplantation", "description": "Pre and post-transplant evaluation and management." },
    { "title": "Dialysis", "description": "Haemodialysis, CAPD and dialysis catheter management." },
    { "title": "Renal ICU Care", "description": "Specialized nephrology support in critical care." },
    { "title": "Renal Biopsy", "description": "Diagnosis of kidney diseases through biopsy procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Bhalla handle kidney transplants?", "answer": "Yes, he specializes in high-risk and cadaveric kidney transplant care." },
    { "question": "Does he manage dialysis patients?", "answer": "Yes, he oversees dialysis and long-term renal failure management." },
    { "question": "Does he treat critical kidney issues?", "answer": "Yes, he is an expert in critical care nephrology." }
  ]
},
{
  "slug": "dr-vivek-bindal",
  "name": "Dr. Vivek Bindal",
  "specialty": "Minimal Access, Bariatric & Robotic Surgery",
  "hospital": "Max Hospital – Patparganj | Max Hospital – Vaishali",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director & Head – Minimal Access, Bariatric & Robotic Surgery",
  "degree": "FACS | Indo-US Fellowship (Robotic & Bariatric Surgery – Duke University) | Indo-US Fellowship (Robotic GI Surgery – University of Illinois Chicago) | MRCS (Glasgow) | FNB (Minimal Access Surgery) | DNB (General Surgery) | MS (General Surgery) | MBBS",
  "about": "Dr. Vivek Bindal is one of India’s leading robotic, bariatric and minimal access surgeons with global training and extensive academic contributions. He has performed landmark robotic surgeries, trained clinicians internationally and established the Indian chapter of the Clinical Robotic Surgery Association.",
  "medicalProblems": [
    { "title": "Obesity & Metabolic Disorders", "description": "Conditions requiring bariatric and metabolic surgery." },
    { "title": "Gastrointestinal Disorders", "description": "Complex GI issues requiring laparoscopic or robotic intervention." },
    { "title": "Hernias", "description": "Simple and complex abdominal wall and inguinal hernias." },
    { "title": "Gallbladder & Biliary Disorders", "description": "Cholelithiasis, gallbladder infections and bile duct disease." }
  ],
  "procedures": [
    { "title": "Robotic Bariatric Surgery", "description": "Sleeve gastrectomy, gastric bypass and metabolic surgeries." },
    { "title": "Robotic & Laparoscopic Hernia Surgery", "description": "Advanced abdominal wall and inguinal hernia repairs." },
    { "title": "GI Robotic Surgery", "description": "Robotic procedures for stomach, intestine and hepatobiliary diseases." },
    { "title": "Advanced Laparoscopy", "description": "Minimal access procedures for GI and metabolic disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Bindal perform bariatric surgery?", "answer": "Yes, he is one of India’s leading bariatric and metabolic surgeons." },
    { "question": "Does he specialize in robotic surgery?", "answer": "Yes, he has international fellowships in robotic surgery and has trained surgeons worldwide." },
    { "question": "Does he treat hernias?", "answer": "Yes, he performs complex robotic and laparoscopic hernia surgeries." }
  ]
},
{
  "slug": "dr-ashish-gautam",
  "name": "Dr. Ashish Gautam",
  "specialty": "General, Laparoscopic & Robotic Surgery",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director – General, Laparoscopic & Robotic Surgery",
  "degree": "FACS | FALS | FIAGES | MS (General Surgery) | MBBS",
  "about": "Dr. Ashish Gautam is a highly experienced surgeon specializing in robotic, gastrointestinal, bariatric and advanced laparoscopic surgeries. With over two decades of experience, he has led surgical departments and performed thousands of complex GI and minimally invasive procedures.",
  "medicalProblems": [
    { "title": "Gallbladder Diseases", "description": "Gallstones, bile duct infections and cholecystitis." },
    { "title": "Hernias", "description": "Ventral, inguinal, umbilical and recurrent hernias." },
    { "title": "Digestive System Disorders", "description": "Stomach, intestine and colorectal conditions requiring surgery." },
    { "title": "Obesity-Related Disorders", "description": "Conditions requiring metabolic or bariatric interventions." }
  ],
  "procedures": [
    { "title": "Robotic GI Surgery", "description": "Robotic surgeries for gastrointestinal conditions." },
    { "title": "Advanced Laparoscopic Surgery", "description": "Minimal invasive treatment for GI and abdominal diseases." },
    { "title": "Bariatric Surgery", "description": "Weight loss surgeries including sleeve gastrectomy." },
    { "title": "Laser Varicose Vein Surgery", "description": "Laser treatments for varicose veins." }
  ],
  "faqs": [
    { "question": "Does Dr. Gautam perform robotic surgery?", "answer": "Yes, he is extensively trained in robotic-assisted GI and bariatric surgeries." },
    { "question": "Does he handle complex hernia surgeries?", "answer": "Yes, he specializes in minimally invasive and robotic hernia repairs." },
    { "question": "Does he perform bariatric surgery?", "answer": "Yes, he performs metabolic and bariatric surgical procedures." }
  ]
},
{
  "slug": "dr-vikas-goswami",
  "name": "Dr. Vikas Goswami",
  "specialty": "Medical Oncology",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Medical Oncology (Head & Neck, GI, Urology, Musculoskeletal, Breast & Gynecology)",
  "degree": "DNB (Medical Oncology) | MD (Internal Medicine) | MBBS",
  "about": "Dr. Vikas Goswami is a senior medical oncologist with over two decades of experience treating solid tumors and hematological cancers. He specializes in gastrointestinal, breast, lung, uro-oncology and head & neck cancers with expertise in precision oncology, immunotherapy and targeted therapy.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Comprehensive medical management of breast malignancies." },
    { "title": "Lung Cancer", "description": "Targeted and immunotherapy for lung tumors." },
    { "title": "Gastrointestinal Cancers", "description": "Stomach, colon, liver and pancreatic cancers." },
    { "title": "Hematological Cancers", "description": "Leukemia, lymphoma and myeloma treatment." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Advanced and personalized medical cancer treatment." },
    { "title": "Targeted Therapy", "description": "Precision cancer therapy based on molecular profiling." },
    { "title": "Immunotherapy", "description": "Immune-based cancer treatments for advanced malignancies." },
    { "title": "Precision Oncology", "description": "Genetic and biomarker-based cancer treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Goswami treat gastrointestinal cancers?", "answer": "Yes, he has extensive experience in GI and hepatobiliary cancers." },
    { "question": "Does he specialize in immunotherapy?", "answer": "Yes, he offers advanced immunotherapy for multiple cancer types." },
    { "question": "Does he treat breast cancer?", "answer": "Yes, breast cancer is one of his primary specialties." }
  ]
},
{
  "slug": "dr-p-kar",
  "name": "Dr. P. Kar",
  "specialty": "Gastroenterology, Hepatology & Endoscopy",
  "hospital": "Max Hospital – Patparganj | Max Hospital – Vaishali",
  "experience": "44+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Gastroenterology",
  "degree": "PhD (Biosciences) | DM (Gastroenterology – AIIMS) | MD (Medicine) | MBBS",
  "about": "Dr. P. Kar is one of India’s most senior gastroenterologists with over four decades of experience. He has taught at AIIMS and MAMC, contributed extensively to research in liver and digestive diseases, and published widely in national and international journals.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Hepatitis, cirrhosis, liver failure and autoimmune liver diseases." },
    { "title": "Digestive Disorders", "description": "Acidity, IBS, IBD and functional GI problems." },
    { "title": "Pancreatic Conditions", "description": "Acute and chronic pancreatitis." },
    { "title": "Gastrointestinal Bleeding", "description": "Evaluation and treatment of upper and lower GI bleeds." }
  ],
  "procedures": [
    { "title": "Endoscopy", "description": "Upper GI endoscopy for diagnosis and treatment." },
    { "title": "Colonoscopy", "description": "Evaluation and treatment of colon diseases." },
    { "title": "Liver Disease Management", "description": "Medical and endoscopic management of liver conditions." },
    { "title": "Pancreatic Evaluation", "description": "Management of acute and chronic pancreatitis." }
  ],
  "faqs": [
    { "question": "Is Dr. Kar experienced in liver diseases?", "answer": "Yes, he is a liver disease expert with decades of clinical and research experience." },
    { "question": "Does he perform endoscopy?", "answer": "Yes, he conducts diagnostic and therapeutic endoscopic procedures." },
    { "question": "Has he published research?", "answer": "Yes, his work is widely published and cited in global medical journals." }
  ]
},
{
  "slug": "dr-manoj-k-tayal",
  "name": "Dr. Manoj K. Tayal",
  "specialty": "Radiation Oncology",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director – Radiation Oncology",
  "degree": "MD (Radiotherapy) | MBBS",
  "about": "Dr. Manoj K. Tayal is an experienced radiation oncologist specializing in advanced radiation therapies including IMRT, IGRT, VMAT, SBRT and brachytherapy. He has led radiation oncology departments at Medanta Hospital and has significant experience in treating complex cancers with high-precision radiation.",
  "medicalProblems": [
    { "title": "Head & Neck Cancers", "description": "Advanced radiation treatment for ENT cancers." },
    { "title": "Breast Cancer", "description": "Comprehensive radiation therapy for breast malignancies." },
    { "title": "Gynecological Cancers", "description": "Radiation management of cervical and uterine cancers." },
    { "title": "Thoracic & Lung Cancers", "description": "Precision radiation for lung and mediastinal tumors." }
  ],
  "procedures": [
    { "title": "IMRT", "description": "Intensity-modulated radiation therapy for targeted treatment." },
    { "title": "IGRT", "description": "Image-guided precision radiation therapy." },
    { "title": "SBRT & SRS", "description": "High-dose stereotactic treatments for tumors." },
    { "title": "Brachytherapy", "description": "Internal radiation therapy for gynecologic and other cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Tayal perform IMRT and IGRT?", "answer": "Yes, he specializes in advanced radiation techniques including IMRT, IGRT, VMAT and SBRT." },
    { "question": "Does he treat head & neck cancers?", "answer": "Yes, he is highly experienced in radiation therapy for head and neck malignancies." },
    { "question": "Does he offer brachytherapy?", "answer": "Yes, he performs brachytherapy for gynecological and other cancers." }
  ]
},
{
  "slug": "dr-sameer-khatri",
  "name": "Dr. Sameer Khatri",
  "specialty": "Medical Oncology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director – Medical Oncology",
  "degree": "DNB (Medical Oncology) | MD (Internal Medicine) | MBBS",
  "about": "Dr. Sameer Khatri is a senior medical oncologist with extensive experience in treating solid tumors, hematological malignancies and delivering advanced therapies including immunotherapy, targeted therapy and precision oncology. He has led oncology departments and conducted multiple clinical trials.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Advanced medical treatment for breast malignancies." },
    { "title": "Lung Cancer", "description": "Immunotherapy and targeted therapy for lung tumors." },
    { "title": "Gastrointestinal Cancers", "description": "Management of stomach, colon, pancreatic and liver cancers." },
    { "title": "Haematological Cancers", "description": "Treatment of leukemia, lymphoma and myeloma." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Systemic treatment for solid and blood cancers." },
    { "title": "Targeted Therapy", "description": "Molecular-targeted cancer treatment." },
    { "title": "Immunotherapy", "description": "Immune-based cancer treatment solutions." },
    { "title": "Precision Oncology", "description": "Cancer treatment based on genetic markers." }
  ],
  "faqs": [
    { "question": "Does Dr. Khatri specialize in immunotherapy?", "answer": "Yes, he has extensive experience in immunotherapy for advanced cancers." },
    { "question": "Does he treat gastrointestinal cancers?", "answer": "Yes, he specializes in GI and hepatobiliary cancers." },
    { "question": "Is he involved in clinical trials?", "answer": "Yes, he has served as Principal Investigator in multiple oncology trials." }
  ]
},
{
  "slug": "dr-shyam-kukreja",
  "name": "Dr. Shyam Kukreja",
  "specialty": "Paediatrics (PED)",
  "hospital": "Max Hospital – Patparganj",
  "experience": "45+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director & Head of Department – Paediatrics",
  "degree": "MBBS | MD (Paediatrics)",
  "about": "Dr. Shyam Kukreja is a senior paediatrician with over 45 years of clinical experience. He has served in leading hospitals across Delhi and is known for his expertise in complete child healthcare, growth, development and paediatric medicine.",
  "medicalProblems": [
    { "title": "Newborn & Infant Care", "description": "Vaccinations, development monitoring and neonatal issues." },
    { "title": "Childhood Infections", "description": "Fever, viral infections, respiratory and stomach illnesses." },
    { "title": "Growth & Development Issues", "description": "Nutritional deficiencies, delayed milestones and growth monitoring." },
    { "title": "Paediatric Chronic Diseases", "description": "Asthma, allergies and long-term paediatric conditions." }
  ],
  "procedures": [
    { "title": "Vaccination & Immunization", "description": "Complete vaccination programmes for children." },
    { "title": "Paediatric Evaluation", "description": "Growth charts, developmental assessments and health checks." },
    { "title": "Management of Infections", "description": "Treatment of common and complex paediatric infections." },
    { "title": "Child Nutrition Counselling", "description": "Diet, immunity and growth optimisation programmes." }
  ],
  "faqs": [
    { "question": "Does Dr. Kukreja treat newborns?", "answer": "Yes, he specializes in newborn and infant care." },
    { "question": "Does he provide vaccinations?", "answer": "Yes, he manages complete paediatric vaccination schedules." },
    { "question": "Does he treat paediatric infections?", "answer": "Yes, he has extensive experience in managing childhood infections." }
  ]
},
{
  "slug": "dr-deepak-lahoti",
  "name": "Dr. Deepak Lahoti",
  "specialty": "Gastroenterology, Hepatology & Endoscopy",
  "hospital": "Max Hospital – Patparganj",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Gastroenterology",
  "degree": "DM (Gastroenterology – GB Pant Hospital) | MD (Medicine – RML Hospital) | MBBS (MAMC)",
  "about": "Dr. Deepak Lahoti is one of India's most respected gastroenterologists with over four decades of experience. He has served as Associate Professor at GB Pant Hospital and Senior Gastroenterologist at multiple premier institutions in Delhi. He is known for expertise in advanced GI endoscopy, liver diseases and complex digestive disorders.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Hepatitis, fatty liver, cirrhosis and alcohol-related liver issues." },
    { "title": "Digestive Disorders", "description": "Acidity, gastritis, IBS, IBD and abdominal pain." },
    { "title": "Pancreatic Disorders", "description": "Pancreatitis and pancreatic insufficiency." },
    { "title": "Esophagus & Stomach Disorders", "description": "Ulcers, GERD and swallowing difficulties." }
  ],
  "procedures": [
    { "title": "Endoscopy", "description": "Upper GI endoscopy for diagnosis and treatment." },
    { "title": "Colonoscopy", "description": "Evaluation of colon diseases and polyps." },
    { "title": "ERCP", "description": "Endoscopic procedure for bile duct and pancreatic duct diseases." },
    { "title": "Liver Disease Management", "description": "Comprehensive management of acute and chronic liver disease." }
  ],
  "faqs": [
    { "question": "Does Dr. Lahoti specialize in liver diseases?", "answer": "Yes, he is an expert in hepatology and advanced GI disorders." },
    { "question": "Does he perform endoscopy and colonoscopy?", "answer": "Yes, he is highly experienced in therapeutic GI endoscopy." },
    { "question": "Is he a member of national societies?", "answer": "Yes, including ISG, INASL, SGEI and DAI." }
  ]
},
{
  "slug": "dr-nitin-leekha",
  "name": "Dr. Nitin Leekha",
  "specialty": "Surgical Oncology",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Surgical Oncology",
  "degree": "MCh (Surgical Oncology – RCC Thiruvananthapuram) | MS (General Surgery – MAMC) | MBBS (UCMS) | FACS | FMAS | Fellow – ESSO",
  "about": "Dr. Nitin Leekha is a highly skilled surgical oncologist with international training across India, Europe and Asia. He specializes in advanced cancer surgeries including GI, breast, thoracic, gynecologic and urologic cancers, along with robotic and minimally invasive cancer procedures.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Surgical management of early and advanced breast cancer." },
    { "title": "Head & Neck Cancers", "description": "Thyroid, oral cavity and throat cancer surgery." },
    { "title": "Gastrointestinal Cancers", "description": "Stomach, colon, rectal and liver cancers." },
    { "title": "Thoracic Cancers", "description": "Lung and mediastinal tumor surgeries." }
  ],
  "procedures": [
    { "title": "Robotic Cancer Surgery", "description": "Advanced robotic procedures for complex cancers." },
    { "title": "Minimally Invasive Cancer Surgery", "description": "Laparoscopic and VATS oncology procedures." },
    { "title": "HIPEC & Peritoneal Surgery", "description": "Specialized procedures for advanced abdominal cancers." },
    { "title": "Onco-Reconstructive Surgery", "description": "Functional and cosmetic reconstruction post-cancer surgery." }
  ],
  "faqs": [
    { "question": "Does Dr. Leekha perform robotic cancer surgery?", "answer": "Yes, he specializes in robotic and minimally invasive oncology procedures." },
    { "question": "Does he treat GI cancers?", "answer": "Yes, including stomach, colon and rectal cancers." },
    { "question": "Does he manage complex thoracic and head & neck cancers?", "answer": "Yes, he has extensive national and international training in these areas." }
  ]
},
{
  "slug": "dr-p-k-mishra",
  "name": "Dr. (Prof.) P. K. Mishra",
  "specialty": "Surgical Gastroenterology",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Surgical Gastroenterology",
  "degree": "PhD (GI Surgery – AIIMS) | MS (LHMC & RML) | PG Diploma (Anaesthesia – MAMC) | MBBS (MAMC)",
  "about": "Dr. (Prof.) P. K. Mishra is a veteran surgical gastroenterologist with over 35 years of experience. He has served as Director Professor at GIPMER (GB Pant Hospital) and has extensive experience in GI surgery, GI oncology and hepatopancreatobiliary procedures. He has over 100+ national lectures and numerous publications.",
  "medicalProblems": [
    { "title": "GI Cancers", "description": "Esophageal, stomach, pancreatic, liver and colorectal cancers." },
    { "title": "Hepatobiliary Disorders", "description": "Gallbladder, bile duct and liver diseases." },
    { "title": "Intestinal Disorders", "description": "Small and large bowel diseases requiring surgery." },
    { "title": "Advanced GI Conditions", "description": "Complex abdominal and peritoneal diseases." }
  ],
  "procedures": [
    { "title": "GI Oncologic Surgery", "description": "Cancer surgeries of the entire gastrointestinal tract." },
    { "title": "Hepato-Pancreato-Biliary Surgery", "description": "Liver, pancreas and bile duct surgeries." },
    { "title": "Advanced Laparoscopic GI Surgery", "description": "Minimal access procedures for GI diseases." },
    { "title": "Complex Abdominal Surgery", "description": "Treatment of advanced GI and abdominal disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Mishra treat GI cancers?", "answer": "Yes, he is a senior expert in surgical oncology for GI cancers." },
    { "question": "Does he perform HPB surgery?", "answer": "Yes, he is highly experienced in liver, pancreas and bile duct surgeries." },
    { "question": "Has he published research?", "answer": "Yes, he has written textbooks and over 60+ medical publications." }
  ]
},
{
  "slug": "dr-praveen-kumar-pandey",
  "name": "Dr. Praveen Kumar Pandey",
  "specialty": "Pulmonology",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Director – Pulmonology",
  "degree": "MD (Respiratory Diseases – JNMC AMU) | MBBS (JNMC AMU)",
  "about": "Dr. Praveen Kumar Pandey is a senior pulmonologist with over 24 years of experience. He specializes in respiratory critical care, interventional pulmonology, sleep disorders and advanced lung disease. He has led pulmonary departments and conducted multiple clinical trials.",
  "medicalProblems": [
    { "title": "Asthma & Allergy", "description": "Diagnosis and long-term management of respiratory allergies." },
    { "title": "COPD & Smoking Disorders", "description": "Chronic respiratory obstruction caused by smoking or pollutants." },
    { "title": "Respiratory Infections", "description": "Pneumonia, TB, bronchitis and viral lung infections." },
    { "title": "Sleep Disorders", "description": "Sleep apnea and respiratory-related sleep issues." }
  ],
  "procedures": [
    { "title": "Bronchoscopy", "description": "Diagnostic and therapeutic airway procedures." },
    { "title": "Interventional Pulmonology", "description": "Advanced lung interventions including stenting and biopsies." },
    { "title": "Sleep Study & Sleep Medicine", "description": "Evaluation and treatment of sleep apnea." },
    { "title": "Critical Care Management", "description": "Lung support in ICU and severe respiratory diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Pandey treat asthma and COPD?", "answer": "Yes, he specializes in chronic respiratory diseases." },
    { "question": "Does he perform bronchoscopy?", "answer": "Yes, he is trained in advanced interventional pulmonology." },
    { "question": "Does he treat sleep apnea?", "answer": "Yes, he has specialized training in sleep medicine." }
  ]
},
{
  "slug": "dr-surveen-ghumman-sindhu",
  "name": "Dr. Surveen Ghumman Sindhu",
  "specialty": "Infertility & IVF",
  "hospital": "Max Medcentre – Lajpat Nagar | BLK Max Hospital | Max Hospital – Saket Smart | Max Hospital – Panchsheel Park | Max Hospital – Gurugram | Max Hospital – Patparganj",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director & HOD – IVF, Low Egg Reserve, Egg Preservation & Male Infertility",
  "degree": "MD (Obstetrics & Gynaecology) | MBBS | FICOG | FMAS | FICMCH",
  "about": "Dr. Surveen Ghumman Sindhu is one of India’s most accomplished IVF and infertility specialists with over 32 years of experience. She has served as faculty in top medical colleges and headed departments at leading IVF centres. She is renowned for managing complex infertility, recurrent IVF failures, male infertility and fertility preservation.",
  "medicalProblems": [
    { "title": "Female Infertility", "description": "Low egg reserve, hormonal imbalance and ovulation issues." },
    { "title": "Male Infertility", "description": "Azoospermia, low sperm count and motility issues." },
    { "title": "Recurrent IVF Failure", "description": "Advanced evaluation and corrective treatment." },
    { "title": "Recurrent Pregnancy Loss", "description": "Repeated miscarriages and implantation failures." }
  ],
  "procedures": [
    { "title": "IVF & ICSI", "description": "Advanced fertility treatment for male and female infertility." },
    { "title": "Egg Freezing", "description": "Fertility preservation for medical or personal reasons." },
    { "title": "Donor & Surrogacy Programs", "description": "Expert management of donor cycles and surrogacy." },
    { "title": "Embryology & IVF Lab Quality Control", "description": "Advanced lab practices ensuring high success rates." }
  ],
  "faqs": [
    { "question": "Does Dr. Surveen treat low egg reserve?", "answer": "Yes, she specializes in treating women with low ovarian reserve." },
    { "question": "Does she offer egg freezing?", "answer": "Yes, she is an expert in fertility preservation and egg freezing." },
    { "question": "Does she handle recurrent IVF failures?", "answer": "Yes, she is well-known for managing complex IVF failure cases." }
  ]
},
{
  "slug": "dr-neeraj-goyal",
  "name": "Dr. Neeraj Goyal",
  "specialty": "General Surgery, Laparoscopic / Minimal Access Surgery, Robotic Surgery",
  "hospital": "Max Hospital – Patparganj",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Laparoscopic, Laser, Robotic & General Surgery",
  "degree": "FAIS | FIAGES | MS (General Surgery) | MBBS",
  "about": "Dr. Neeraj Goyal is an experienced general and laparoscopic surgeon with expertise in robotic surgery, laser proctology and advanced minimally invasive procedures. He has held leadership roles in multiple institutions and is known for his innovative work with laser treatments and hernia repair.",
  "medicalProblems": [
    { "title": "Piles & Fistula", "description": "Laser proctology treatments for hemorrhoids and fistulas." },
    { "title": "Gallbladder Disorders", "description": "Gallstones and gallbladder inflammation." },
    { "title": "Hernias", "description": "Ventral, inguinal and recurrent hernia conditions." },
    { "title": "General Surgical Conditions", "description": "Appendicitis, abdominal pain, soft tissue swellings." }
  ],
  "procedures": [
    { "title": "Laser Piles Surgery", "description": "Minimally invasive laser treatment for hemorrhoids." },
    { "title": "Laparoscopic Hernia Repair", "description": "Mesh-based and fully resorbable mesh hernia surgeries." },
    { "title": "Robotic Surgery", "description": "Advanced robotic minimally invasive procedures." },
    { "title": "Laparoscopic Gallbladder Removal", "description": "Safe and scar-minimal cholecystectomy." }
  ],
  "faqs": [
    { "question": "Does Dr. Neeraj Goyal perform laser surgery for piles?", "answer": "Yes, he is highly experienced in laser proctology." },
    { "question": "Does he offer robotic surgery?", "answer": "Yes, he performs robotic and advanced laparoscopic surgeries." },
    { "question": "Does he treat hernias?", "answer": "Yes, including complex and recurrent hernias using modern mesh technology." }
  ]
},
{
  "slug": "dr-shailesh-chandra-sahay",
  "name": "Dr. Shailesh Chandra Sahay",
  "specialty": "Urology, Kidney Transplant, Robotic Surgery",
  "hospital": "Max Hospital – Patparganj",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Urology",
  "degree": "MCh (Urology – AIIMS) | MS (General Surgery – MAMC) | MBBS",
  "about": "Dr. Shailesh Chandra Sahay is a leading urologist with expertise in laparoscopic and robotic surgeries for uro-oncology, prostate disease, renal stones and complex urological disorders. He has performed over 7500 urological procedures and is known for advanced minimally invasive treatments.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Management of stones using laser and endoscopic techniques." },
    { "title": "Prostate Disorders", "description": "BPH and prostate enlargement treatments." },
    { "title": "Kidney & Bladder Cancer", "description": "Surgical and minimally invasive cancer management." },
    { "title": "Uro-Gynecological Disorders", "description": "Vesicovaginal fistula and pelvic floor conditions." }
  ],
  "procedures": [
    { "title": "PCNL & RIRS", "description": "Laser-based kidney stone removal." },
    { "title": "TURP & HoLEP", "description": "Advanced prostate surgeries." },
    { "title": "Robotic Uro-Onco Surgery", "description": "Robotic kidney, prostate and bladder cancer surgeries." },
    { "title": "Laparoscopic Pyeloplasty", "description": "Minimally invasive reconstruction of ureteropelvic junction obstruction." }
  ],
  "faqs": [
    { "question": "Does Dr. Sahay treat kidney stones?", "answer": "Yes, he is an expert in laser and endoscopic stone surgery." },
    { "question": "Does he perform robotic surgeries?", "answer": "Yes, especially for prostate, kidney and bladder cancers." },
    { "question": "Does he treat prostate enlargement?", "answer": "Yes, with advanced Holmium Laser Enucleation (HoLEP)." }
  ]
},
{
  "slug": "dr-satyendra-katewa",
  "name": "Dr. Satyendra Katewa",
  "specialty": "Paediatric Oncology, Hemato-Oncology, Bone Marrow Transplant",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Hemato-Oncology & Bone Marrow Transplant",
  "degree": "DNB (Paediatrics) | Fellowship (Paediatric Hemato-Oncology & BMT – Toronto & SGRH) | MBBS",
  "about": "Dr. Satyendra Katewa is a highly specialized paediatric hemato-oncologist and bone marrow transplant expert with global training in Canada and India. He has led BMT and paediatric oncology departments across multiple major hospitals and is known for handling complex leukemia, lymphoma and bone marrow transplant cases.",
  "medicalProblems": [
    { "title": "Leukemia (ALL & AML)", "description": "Advanced treatment protocols for blood cancers in children." },
    { "title": "Lymphoma", "description": "Hodgkin and Non-Hodgkin lymphoma management." },
    { "title": "Bone Marrow Failure", "description": "Aplastic anemia, myelodysplasia and immune disorders." },
    { "title": "Pediatric Tumors", "description": "Solid tumors including neuroblastoma and sarcoma." }
  ],
  "procedures": [
    { "title": "Bone Marrow Transplant", "description": "Autologous, allogeneic and haploidentical BMT." },
    { "title": "Cellular Therapy", "description": "Advanced immunotherapy including T-cell treatments." },
    { "title": "High-Risk Cancer Protocols", "description": "Treatment for complex pediatric cancers." },
    { "title": "Transfusion & Supportive Care", "description": "Advanced pediatric hematology care." }
  ],
  "faqs": [
    { "question": "Does Dr. Katewa perform bone marrow transplants?", "answer": "Yes, including haploidentical and mismatched BMT." },
    { "question": "Does he treat leukemia and lymphoma?", "answer": "Yes, he specializes in paediatric hemato-oncology." },
    { "question": "Is he internationally trained?", "answer": "Yes, with fellowship training from SickKids Hospital, Toronto." }
  ]
},
{
  "slug": "dr-tripti-saxena",
  "name": "Dr. Tripti Saxena",
  "specialty": "Radiation Oncology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Radiation Oncology",
  "degree": "MD (Radiation Oncology) | MBBS | MBA (Hospital Administration)",
  "about": "Dr. Tripti Saxena is a senior radiation oncologist with expertise in advanced radiation therapies including SRS, SBRT, IMRT, IGRT, TBI and TSET. She has worked at premier cancer hospitals and has extensive clinical experience in treating complex cancers using precision technology.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Advanced targeted radiation for breast malignancies." },
    { "title": "Brain Tumors", "description": "Stereotactic radiosurgery and precision radiation therapy." },
    { "title": "Lung & Thoracic Cancers", "description": "Gated radiation for moving lung tumors." },
    { "title": "Head & Neck Cancers", "description": "IMRT/IGRT-based treatment for complex tumor sites." }
  ],
  "procedures": [
    { "title": "SRS & SBRT", "description": "High-precision radiation for brain and body tumors." },
    { "title": "IMRT & IGRT", "description": "Advanced radiation with minimal side effects." },
    { "title": "Brachytherapy", "description": "Internal radiation therapy for specific cancers." },
    { "title": "Total Body & Total Skin Radiation", "description": "TBI and TSET for specialized cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Tripti perform SRS/SBRT?", "answer": "Yes, she specializes in high-precision stereotactic radiation therapy." },
    { "question": "Does she treat breast cancer?", "answer": "Yes, especially left-breast cancer with DIBH technique." },
    { "question": "Does she treat brain and lung tumors?", "answer": "Yes, using advanced radiosurgery and gated radiation technology." }
  ]
},
{
  "slug": "dr-amit-kumar-srivastava",
  "name": "Dr. Amit Kumar Srivastava",
  "specialty": "Orthopaedics & Joint Replacement, Arthroscopy & Sports Injury",
  "hospital": "Max Hospital – Patparganj",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Joint Replacement, Arthroscopy & Sports Injury",
  "degree": "MS (Orthopaedics) | MBBS | Fellowship in Arthroplasty | Fellowship in Arthroscopy & Sports Injury | AO Advanced Trauma Fellowship (Austria) | DipSICOT (Sweden)",
  "about": "Dr. Amit Kumar Srivastava is an experienced orthopaedic and joint replacement surgeon with a strong background in arthroscopy, sports injury management and revision joint surgeries. He has received multiple international fellowships and is recognized for his advanced surgical skills.",
  "medicalProblems": [
    { "title": "Knee Arthritis", "description": "Severe knee pain and degeneration." },
    { "title": "Hip Joint Disorders", "description": "Arthritis, fractures and mobility issues." },
    { "title": "Sports Injuries", "description": "Ligament tears, meniscus injuries and soft tissue trauma." },
    { "title": "Cartilage Damage", "description": "Cartilage defects and wear-and-tear conditions." }
  ],
  "procedures": [
    { "title": "Knee/Hip/Shoulder Arthroplasty", "description": "Joint replacement procedures for degenerative joints." },
    { "title": "Arthroscopic Surgery", "description": "Minimally invasive procedures for sports injuries." },
    { "title": "Revision Joint Replacement", "description": "Corrective surgeries for failed implants." },
    { "title": "Cartilage Preservation Surgery", "description": "Advanced cartilage repair and regeneration." }
  ],
  "faqs": [
    { "question": "Does Dr. Srivastava perform arthroscopic surgeries?", "answer": "Yes, he specializes in arthroscopy and sports injury management." },
    { "question": "Does he handle joint replacement revision cases?", "answer": "Yes, he performs complex revision arthroplasty procedures." },
    { "question": "Is he internationally trained?", "answer": "Yes, with fellowships completed in Austria, Sweden and India." }
  ]
},
{
  "slug": "dr-priyanka-aggarwal",
  "name": "Dr. Priyanka Aggarwal",
  "specialty": "Pulmonology",
  "hospital": "Max Hospital – Patparganj | Max Hospital – Noida Sec 19",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Pulmonology",
  "degree": "MBBS (MAMC) | MD (Respiratory Medicine) | European Diploma in Respiratory Medicine",
  "about": "Dr. Priyanka Aggarwal is a highly trained pulmonologist with more than 18 years of focused experience. She has received specialized training in respiratory allergies in Vienna and is known for her expertise in asthma, allergies, sleep medicine and interventional pulmonology.",
  "medicalProblems": [
    { "title": "Respiratory Allergies", "description": "Chronic cough, allergic rhinitis and airway inflammation." },
    { "title": "Asthma", "description": "Evaluation and long-term asthma management." },
    { "title": "Sleep Disorders", "description": "Sleep apnea and nocturnal breathing issues." },
    { "title": "Lung Diseases", "description": "Respiratory infections, COPD and chronic lung conditions." }
  ],
  "procedures": [
    { "title": "Bronchoscopy", "description": "Diagnostic airway endoscopy." },
    { "title": "EBUS (Endobronchial Ultrasound)", "description": "Ultrasound-guided TBNA for accurate lung diagnosis." },
    { "title": "Allergy Testing", "description": "Identification of respiratory allergies." },
    { "title": "Sleep Study", "description": "Diagnosis and treatment of sleep apnea." }
  ],
  "faqs": [
    { "question": "Does Dr. Priyanka treat respiratory allergies?", "answer": "Yes, she has specialized training in respiratory allergy management." },
    { "question": "Does she perform bronchoscopy?", "answer": "Yes, including EBUS-guided procedures." },
    { "question": "Does she evaluate sleep disorders?", "answer": "Yes, she specializes in sleep medicine and sleep apnea diagnosis." }
  ]
},
{
  "slug": "dr-parinita-kalita",
  "name": "Dr. Parinita Kalita",
  "specialty": "Obstetrics & Gynaecology, Robotic Surgery, Gynaecologic Laparoscopy",
  "hospital": "Max Hospital – Patparganj",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Obstetrics & Gynaecology",
  "degree": "DNB (Obstetrics & Gynaecology) | MD (Gynaecology) | MBBS",
  "about": "Dr. Parinita Kalita is a senior gynaecologist with over 22 years of experience in deliveries, high-risk pregnancies and advanced gynaecological surgeries. She is known for her expertise in minimally invasive and robotic gynaecology.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Pregnancy complications requiring expert monitoring." },
    { "title": "Infertility", "description": "Evaluation and treatment of infertility issues." },
    { "title": "Uterine Disorders", "description": "Fibroids, heavy bleeding and adenomyosis." },
    { "title": "Ovarian Cysts", "description": "Diagnosis and laparoscopic removal of cysts." }
  ],
  "procedures": [
    { "title": "Normal & Cesarean Delivery", "description": "Safe maternal care for childbirth." },
    { "title": "Laparoscopic Surgery", "description": "Keyhole surgery for gynaecological conditions." },
    { "title": "Robotic Gynaecology Surgery", "description": "Advanced precision-assisted gynaecological procedures." },
    { "title": "Hysterectomy", "description": "Surgical removal of the uterus using minimally invasive techniques." }
  ],
  "faqs": [
    { "question": "Does Dr. Parinita treat high-risk pregnancies?", "answer": "Yes, she specializes in high-risk obstetric care." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, including minimally invasive gynaecological procedures." },
    { "question": "Does she manage infertility?", "answer": "Yes, she provides comprehensive infertility evaluation and treatment." }
  ]
},
{
  "slug": "dr-monisha-gupta",
  "name": "Dr. Monisha Gupta",
  "specialty": "Gynaecologic Oncology, Surgical Oncology, Robotic Surgery",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Robotic & Laparoscopic Gynae-Oncology Surgery",
  "degree": "Fellowship (Gynae Oncology – Tata Memorial Hospital) | MS (Gynaecology) | MBBS",
  "about": "Dr. Monisha Gupta is a gynecologic oncologist trained at Tata Memorial Hospital. She specializes in robotic and laparoscopic cancer surgeries for cervical, ovarian, endometrial and vulvar cancers. She is known for performing highly advanced fertility-sparing and cytoreductive procedures.",
  "medicalProblems": [
    { "title": "Cervical Cancer", "description": "Diagnosis and surgical treatment of cervical malignancies." },
    { "title": "Ovarian Cancer", "description": "Management including HIPEC and cytoreductive surgery." },
    { "title": "Endometrial Cancer", "description": "Robotic-assisted surgical management." },
    { "title": "Vulvar Disorders", "description": "Reconstructive and cancer surgeries." }
  ],
  "procedures": [
    { "title": "Robotic Cancer Surgery", "description": "Precision robotic procedures for gynae cancers." },
    { "title": "Laparoscopic Gynae Oncology Surgery", "description": "Minimally invasive cancer management." },
    { "title": "Cytoreductive Surgery & HIPEC", "description": "Advanced treatment for ovarian cancers." },
    { "title": "Fertility-Sparing Cancer Surgery", "description": "Cancer treatment preserving reproductive potential." }
  ],
  "faqs": [
    { "question": "Does Dr. Monisha perform robotic cancer surgeries?", "answer": "Yes, she specializes in robotic and laparoscopic oncology." },
    { "question": "Does she treat ovarian and cervical cancer?", "answer": "Yes, including advanced cases requiring HIPEC." },
    { "question": "Does she perform fertility-sparing procedures?", "answer": "Yes, for selected ovarian and cervical cancers." }
  ]
},
{
  "slug": "dr-deepak-arora",
  "name": "Dr. Deepak Arora",
  "specialty": "Orthopaedics & Joint Replacement",
  "hospital": "Max Hospital – Patparganj",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Orthopaedics & Joint Replacement",
  "degree": "MS (Orthopaedics) | MBBS | Fellowship in Arthroplasty & Arthroscopy",
  "about": "Dr. Deepak Arora is an orthopaedic surgeon with expertise in trauma, joint replacement surgeries and arthroscopy. He is trained at premier institutions including Sancheti Institute and has handled complex orthopaedic cases.",
  "medicalProblems": [
    { "title": "Joint Pain & Arthritis", "description": "Degenerative joint conditions of knee, hip and shoulder." },
    { "title": "Trauma & Fractures", "description": "Advanced management of bone injuries." },
    { "title": "Ligament Injuries", "description": "ACL, PCL and shoulder ligament injuries." },
    { "title": "Sports Injuries", "description": "Soft tissue injuries and meniscus tears." }
  ],
  "procedures": [
    { "title": "Joint Replacement Surgery", "description": "Knee, hip and shoulder replacement." },
    { "title": "Arthroscopy", "description": "Keyhole surgery for ligament and meniscus issues." },
    { "title": "Trauma Surgery", "description": "Management of fractures and dislocations." },
    { "title": "Reconstruction Surgery", "description": "Corrective surgeries for joint deformities." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora perform knee replacement?", "answer": "Yes, he performs primary and revision knee arthroplasty." },
    { "question": "Does he manage trauma cases?", "answer": "Yes, he specializes in fracture and trauma management." },
    { "question": "Does he perform arthroscopy?", "answer": "Yes, including knee and shoulder arthroscopy." }
  ]
},
{
  "slug": "dr-gaurav-govil",
  "name": "Dr. Gaurav Govil",
  "specialty": "Orthopaedics & Joint Replacement",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Consultant – Orthopaedics & Joint Replacement",
  "degree": "MS (Orthopaedics) | MBBS | AO Trauma Trained",
  "about": "Dr. Gaurav Govil is a senior orthopaedic surgeon with extensive experience in knee and hip replacement, complex trauma, arthroscopy and spine procedures. He has contributed to major conferences and medical societies.",
  "medicalProblems": [
    { "title": "Advanced Knee & Hip Arthritis", "description": "Degenerative joint diseases requiring surgical care." },
    { "title": "Complex Trauma", "description": "Severe fractures and accident-related injuries." },
    { "title": "Spine Disorders", "description": "Degenerative spine issues needing surgical intervention." },
    { "title": "Cartilage Damage", "description": "Sports and age-related cartilage problems." }
  ],
  "procedures": [
    { "title": "Knee & Hip Replacement", "description": "Primary and revision arthroplasty procedures." },
    { "title": "Complex Trauma Surgery", "description": "Pelvic and acetabular fracture repair." },
    { "title": "Arthroscopic Surgery", "description": "Knee and shoulder arthroscopy." },
    { "title": "Spine Fixation", "description": "Stabilization and corrective spine surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Govil perform joint replacement?", "answer": "Yes, he specializes in knee and hip replacement surgeries." },
    { "question": "Does he treat complex trauma?", "answer": "Yes, especially pelvic-acetabular injuries." },
    { "question": "Does he perform arthroscopy?", "answer": "Yes, for knee and shoulder joints." }
  ]
},
{
  "slug": "dr-prachi-jain",
  "name": "Dr. Prachi Jain",
  "specialty": "Paediatric Oncology, Hemato-Oncology, Medical Oncology",
  "hospital": "Max Hospital – Noida Sec 19 | Max Medcentre – Meerut | Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Paediatric Hemato-Oncology & Medical Oncology",
  "degree": "FNB (Paediatric Hemato-Oncology) | IAP Fellowship | MD (Paediatrics) | MBBS",
  "about": "Dr. Prachi Jain is a pediatric hemato-oncologist with expertise in childhood cancers, blood disorders, bone marrow transplant and immunodeficiency diseases. She has received numerous gold medals for academic excellence.",
  "medicalProblems": [
    { "title": "Childhood Cancers", "description": "Leukemia, lymphoma and solid tumors." },
    { "title": "Blood Disorders", "description": "Anemia, bleeding disorders and thalassemia." },
    { "title": "Immunodeficiency Disorders", "description": "Primary immune disorders in children." },
    { "title": "Pediatric Tumors", "description": "Brain tumors, sarcoma and neuroblastoma." }
  ],
  "procedures": [
    { "title": "Chemotherapy for Children", "description": "Safe and monitored cancer treatment." },
    { "title": "Bone Marrow Transplant", "description": "Advanced transplant procedures for pediatric cases." },
    { "title": "Transfusion Therapy", "description": "Supportive care for blood disorders." },
    { "title": "Pain & Palliative Care", "description": "Symptom relief for advanced illnesses." }
  ],
  "faqs": [
    { "question": "Does Dr. Prachi treat leukemia in children?", "answer": "Yes, she specializes in childhood leukemia management." },
    { "question": "Does she perform bone marrow transplants?", "answer": "Yes, for selected pediatric cases." },
    { "question": "Does she treat immunodeficiency disorders?", "answer": "Yes, she has expertise in managing childhood immunologic disorders." }
  ]
},
{
  "slug": "dr-meena-nihalani",
  "name": "Dr. Meena Nihalani",
  "specialty": "ENT (Ear Nose Throat)",
  "hospital": "Max Hospital – Patparganj",
  "experience": "7+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – ENT",
  "degree": "MRCS (UK) | DO-HNS (UK) | MS (ENT) | MBBS",
  "about": "Dr. Meena Nihalani is an ENT specialist trained in the UK with experience across Fortis Noida, Cardiff University Hospital and other reputed institutions. She specializes in sinus surgery, snoring management and advanced ENT care.",
  "medicalProblems": [
    { "title": "Sinusitis", "description": "Chronic sinus infections and blockage." },
    { "title": "Snoring & Sleep Issues", "description": "Airway obstruction leading to snoring and sleep apnea." },
    { "title": "Ear Disorders", "description": "Hearing loss, infections and balance issues." },
    { "title": "Throat & Voice Problems", "description": "Hoarseness, tonsillitis and swallowing difficulties." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive sinus treatment." },
    { "title": "Snoring Surgery", "description": "Procedures to open airway obstruction." },
    { "title": "Ear Microsurgery", "description": "Advanced surgical treatment for ear diseases." },
    { "title": "Tonsil & Adenoid Surgery", "description": "Surgery for chronic throat infections." }
  ],
  "faqs": [
    { "question": "Does Dr. Meena treat sinusitis?", "answer": "Yes, she specializes in advanced endoscopic sinus surgery." },
    { "question": "Does she manage snoring problems?", "answer": "Yes, including surgical and non-surgical options." },
    { "question": "Is she UK-trained?", "answer": "Yes, she holds MRCS and DO-HNS qualifications from the UK." }
  ]
},
{
  "slug": "dr-alok-narang",
  "name": "Dr. Alok Narang",
  "specialty": "Surgical Oncology, Gastrointestinal & Hepatobiliary Oncology",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Surgical Oncology",
  "degree": "MS (General Surgery) | MBBS | Surgical Oncology Training – RGCI",
  "about": "Dr. Alok Narang is a surgical oncologist specializing in gastrointestinal and hepatobiliary cancers. He has extensive experience in cancer surgeries, including complex pancreatic, liver, stomach and colorectal tumor management.",
  "medicalProblems": [
    { "title": "GI Cancers", "description": "Stomach, colon, rectum and intestinal cancers." },
    { "title": "Hepato-Pancreato-Biliary Cancers", "description": "Liver, pancreas and bile duct malignancies." },
    { "title": "Esophageal Cancer", "description": "Tumors requiring advanced surgical care." },
    { "title": "Abdominal Tumors", "description": "Complex malignancies of abdominal organs." }
  ],
  "procedures": [
    { "title": "GI Onco-Surgery", "description": "Cancer surgeries of the stomach, colon and rectum." },
    { "title": "HPB Surgery", "description": "Liver, pancreas and bile duct surgeries." },
    { "title": "Minimally Invasive Cancer Surgery", "description": "Laparoscopic tumor removal." },
    { "title": "Onco-Reconstructive Surgery", "description": "Reconstructive procedures after cancer surgery." }
  ],
  "faqs": [
    { "question": "Does Dr. Narang treat pancreatic cancer?", "answer": "Yes, he is experienced in advanced pancreatic surgeries." },
    { "question": "Does he perform laparoscopic cancer surgery?", "answer": "Yes, for GI and abdominal tumors." },
    { "question": "Does he manage colorectal cancers?", "answer": "Yes, including complex rectal cancer surgeries." }
  ]
},
{
  "slug": "dr-anita-aggarwal",
  "name": "Dr. Anita Aggarwal",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Obstetrics & Gynaecology",
  "degree": "MD (Obstetrics & Gynaecology – Rohtak Medical College) | MBBS | Research Fellow (UCLA)",
  "about": "Dr. Anita Aggarwal is a senior gynaecologist with over 25 years of experience. She has specialised training from UCLA, California and has served as unit head and senior consultant at leading hospitals. She focuses on high-risk pregnancies, infertility, reproductive endocrinology and adolescent gynaecology.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Expert care for complicated pregnancies." },
    { "title": "Infertility", "description": "Diagnosis and treatment of fertility issues." },
    { "title": "Hormonal Disorders", "description": "PCOS, irregular periods and endocrine imbalances." },
    { "title": "Menopause Issues", "description": "Management of menopausal symptoms and women’s health." }
  ],
  "procedures": [
    { "title": "Normal & Cesarean Delivery", "description": "Comprehensive obstetric care." },
    { "title": "Hysterectomy", "description": "Surgical management of uterine problems." },
    { "title": "Fertility Procedures", "description": "Advanced infertility treatments." },
    { "title": "Laparoscopic Gynaecology", "description": "Minimally invasive gynaecological surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Anita treat high-risk pregnancies?", "answer": "Yes, she specializes in managing high-risk obstetric cases." },
    { "question": "Does she treat infertility?", "answer": "Yes, including reproductive hormonal disorders." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, she is trained in minimally invasive gynaecology." }
  ]
},
{
  "slug": "dr-niti-aggarwal",
  "name": "Dr. Niti Aggarwal",
  "specialty": "Endocrinology & Diabetes",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Endocrinology & Diabetes",
  "degree": "DNB (Endocrinology) | MD (Medicine) | MBBS",
  "about": "Dr. Niti Aggarwal is a senior endocrinologist with over 13 years of focused experience in endocrinology & metabolism. Having trained at PGIMER Chandigarh and Apollo Hospital, she specializes in diabetes, pituitary disorders and metabolic bone diseases.",
  "medicalProblems": [
    { "title": "Diabetes", "description": "Comprehensive management of Type 1, Type 2 and gestational diabetes." },
    { "title": "Thyroid Disorders", "description": "Hypothyroidism, hyperthyroidism and thyroid nodules." },
    { "title": "Pituitary Disorders", "description": "Hormonal imbalance and pituitary gland dysfunction." },
    { "title": "Bone Metabolism Disorders", "description": "Osteoporosis and metabolic bone diseases." }
  ],
  "procedures": [
    { "title": "Diabetes Management Plans", "description": "Lifestyle, insulin and advanced medical therapy." },
    { "title": "Endocrine Hormone Evaluation", "description": "Comprehensive hormonal investigations." },
    { "title": "Thyroid Treatment", "description": "Medication and long-term management of thyroid diseases." },
    { "title": "Bone Health Treatment", "description": "Osteoporosis treatment & metabolic bone disorder care." }
  ],
  "faqs": [
    { "question": "Does Dr. Niti treat pituitary disorders?", "answer": "Yes, she specializes in pituitary hormone-related diseases." },
    { "question": "Does she treat thyroid issues?", "answer": "Yes, including all thyroid hormonal disorders." },
    { "question": "Does she provide diabetes management for all ages?", "answer": "Yes, she treats both Type 1 and Type 2 diabetes." }
  ]
},
{
  "slug": "dr-prabhjot-kaur",
  "name": "Dr. Prabhjot Kaur",
  "specialty": "Paediatrics",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Paediatrics",
  "degree": "MD (Paediatrics) | MBBS | ECFMG Certified (USA)",
  "about": "Dr. Prabhjot Kaur is an experienced paediatrician with expertise in paediatric endocrinology, paediatric genetics and general paediatric care. She has managed complex neonatal, cardiology and nephrology cases during her extensive clinical experience.",
  "medicalProblems": [
    { "title": "Paediatric Endocrine Disorders", "description": "Growth disorders, puberty issues and hormonal imbalance." },
    { "title": "Neonatal Care", "description": "Care for newborn illnesses and complications." },
    { "title": "Genetic Disorders", "description": "Evaluation and management of paediatric genetic syndromes." },
    { "title": "General Paediatric Conditions", "description": "Fever, infections, allergies and routine child care." }
  ],
  "procedures": [
    { "title": "Paediatric Diagnostics", "description": "Hormonal and genetic evaluation for children." },
    { "title": "Neonatal Care Protocols", "description": "Specialised newborn care." },
    { "title": "Vaccination Programs", "description": "Complete immunisation and counselling." },
    { "title": "Chronic Disease Management", "description": "Long-term follow-up for paediatric conditions." }
  ],
  "faqs": [
    { "question": "Does Dr. Prabhjot treat growth disorders?", "answer": "Yes, she specializes in paediatric endocrine issues." },
    { "question": "Does she handle newborn complications?", "answer": "Yes, she has extensive neonatal experience." },
    { "question": "Does she treat genetic disorders?", "answer": "Yes, including paediatric genetic abnormalities." }
  ]
},
{
  "slug": "dr-mala-bhattacharya",
  "name": "Dr. Mala Bhattacharya",
  "specialty": "ENT (Ear Nose Throat)",
  "hospital": "Max Hospital – Patparganj",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – ENT",
  "degree": "MBBS | MS (ENT)",
  "about": "Dr. Mala Bhattacharya is an ENT specialist with over 20 years of experience in ENT and Head & Neck Surgery. She is skilled in sinus surgery, skull base procedures, cochlear implants and complex otological surgeries.",
  "medicalProblems": [
    { "title": "Sinus Disorders", "description": "Chronic sinusitis and nasal blockage." },
    { "title": "Hearing Loss", "description": "Middle ear and inner ear disorders." },
    { "title": "Throat & Voice Disorders", "description": "Hoarseness, swallowing issues and infections." },
    { "title": "Head & Neck Diseases", "description": "Cysts, swellings and tumors of the head & neck region." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive sinus treatment." },
    { "title": "Skull Base Surgery", "description": "Advanced ENT surgeries for skull base diseases." },
    { "title": "Cochlear Implants", "description": "Hearing restoration procedures." },
    { "title": "Otological Surgeries", "description": "Surgery for chronic ear infections and hearing restoration." }
  ],
  "faqs": [
    { "question": "Does Dr. Mala treat sinus problems?", "answer": "Yes, she specializes in endoscopic sinus surgery." },
    { "question": "Does she perform cochlear implants?", "answer": "Yes, she performs advanced hearing implant surgeries." },
    { "question": "Does she treat ear and throat infections?", "answer": "Yes, she provides comprehensive ENT care." }
  ]
},
{
  "slug": "dr-neetu-gagneja",
  "name": "Dr. Neetu Gagneja",
  "specialty": "Eye Care / Ophthalmology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Ophthalmology",
  "degree": "MBBS | DNB (Ophthalmology)",
  "about": "Dr. Neetu Gagneja is an ophthalmologist with expertise in cataract surgery, glaucoma, medical retina and dry eye management. She has trained at Aravind Eye Hospital, University of Michigan and multiple reputed institutions.",
  "medicalProblems": [
    { "title": "Cataract", "description": "Clouding of the eye lens affecting vision." },
    { "title": "Glaucoma", "description": "Increased eye pressure leading to optic nerve damage." },
    { "title": "Retinal Disorders", "description": "Diabetic retinopathy, macular degeneration and more." },
    { "title": "Dry Eye Disease", "description": "Irritation, burning and reduced tear production." }
  ],
  "procedures": [
    { "title": "Cataract Surgery (Phaco & SICS)", "description": "Advanced cataract removal procedures." },
    { "title": "YAG Laser", "description": "Treatment for after-cataract and PCO." },
    { "title": "Glaucoma Management", "description": "Medical and laser treatment." },
    { "title": "Retina Diagnostics", "description": "OCT, retina evaluation and laser procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Neetu perform cataract surgery?", "answer": "Yes, she specializes in advanced phaco and SICS cataract surgery." },
    { "question": "Does she treat glaucoma?", "answer": "Yes, she manages glaucoma with medical and laser options." },
    { "question": "Does she treat dry eyes?", "answer": "Yes, with comprehensive assessment and treatment plans." }
  ]
},
{
  "slug": "dr-manju-keshari",
  "name": "Dr. Manju Keshari",
  "specialty": "Dermatology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "21+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Dermatology",
  "degree": "MD (Dermatology & Venereology) | MBBS",
  "about": "Dr. Manju Keshari is an experienced dermatologist specializing in acne, hair disorders, aesthetic dermatology and laser procedures. She has worked at several reputed hospitals and brings over 20 years of clinical expertise.",
  "medicalProblems": [
    { "title": "Acne & Acne Scars", "description": "Pimples, inflammation and scar reduction." },
    { "title": "Hair Loss & Dandruff", "description": "Alopecia and scalp disorders." },
    { "title": "Eczema & Allergies", "description": "Skin irritation, dryness and allergic reactions." },
    { "title": "Pigmentation Disorders", "description": "Melasma, uneven skin tone and hyperpigmentation." }
  ],
  "procedures": [
    { "title": "Chemical Peels", "description": "Skin resurfacing and pigmentation treatment." },
    { "title": "Laser Procedures", "description": "Scar reduction and hair removal lasers." },
    { "title": "PRP Therapy", "description": "Hair regrowth using platelet-rich plasma." },
    { "title": "Aesthetic Treatments", "description": "Skin rejuvenation, glow treatments and anti-ageing care." }
  ],
  "faqs": [
    { "question": "Does Dr. Manju treat acne scars?", "answer": "Yes, she performs advanced scar reduction treatments." },
    { "question": "Does she offer hair fall treatment?", "answer": "Yes, including PRP and dermatological therapies." },
    { "question": "Does she perform aesthetic procedures?", "answer": "Yes, she offers a range of cosmetic dermatology treatments." }
  ]
},
{
  "slug": "dr-sharad-maheshwari",
  "name": "Dr. Sharad Maheshwari",
  "specialty": "ENT (Ear Nose Throat)",
  "hospital": "Max Hospital – Patparganj",
  "experience": "39+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – ENT",
  "degree": "MS (ENT) | MBBS | Fellow of International College of Surgeons",
  "about": "Dr. Sharad Maheshwari is a senior ENT surgeon with over 30 years of experience in micro ear surgery, cochlear implants, skull base surgery and tracheal laser procedures. He is extensively trained internationally.",
  "medicalProblems": [
    { "title": "Chronic Ear Diseases", "description": "Hearing loss, infections and perforated eardrum." },
    { "title": "Sinus & Nasal Disorders", "description": "Sinusitis, nasal polyps and congestion." },
    { "title": "Throat Disorders", "description": "Voice issues, swallowing difficulty and infections." },
    { "title": "Airway Disorders", "description": "Tracheal obstruction and breathing issues." }
  ],
  "procedures": [
    { "title": "Micro Ear Surgery", "description": "Advanced procedures to restore hearing." },
    { "title": "Cochlear Implant Surgery", "description": "Hearing implant procedures." },
    { "title": "Endoscopic Sinus Surgery", "description": "Treatment of complex sinus conditions." },
    { "title": "Laser Tracheal Surgery", "description": "Laser treatment for airway obstructions." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharad perform cochlear implants?", "answer": "Yes, he is highly experienced in cochlear implant surgeries." },
    { "question": "Does he treat tracheal disorders?", "answer": "Yes, with expertise in laser tracheal surgery." },
    { "question": "Does he perform micro ear surgery?", "answer": "Yes, he has decades of experience." }
  ]
},
{
  "slug": "dr-vikash-moond",
  "name": "Dr. Vikash Moond",
  "specialty": "Liver Transplant & HPB Surgery",
  "hospital": "Max Hospital – Shalimar Bagh | Max Hospital – Patparganj",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Liver Transplant & HPB Surgery",
  "degree": "MCh (GI Surgery & Liver Transplant – AIIMS) | MS (General Surgery – PGIMER) | MBBS",
  "about": "Dr. Vikash Moond is a specialist in liver transplant, GI oncology and hepatobiliary surgery. Trained at AIIMS and Max Saket, he is experienced in living donor and cadaveric liver transplants, robotic GI surgery and complex HPB procedures.",
  "medicalProblems": [
    { "title": "Liver Failure", "description": "Acute and chronic liver disease requiring transplant." },
    { "title": "Liver & Bile Duct Cancers", "description": "Advanced cancers of the liver, pancreas and biliary system." },
    { "title": "Pancreatic Disorders", "description": "Tumors, pancreatitis and cystic conditions." },
    { "title": "GI Tumors", "description": "Stomach, small intestine and colorectal malignancies." }
  ],
  "procedures": [
    { "title": "Living Donor Liver Transplant", "description": "Advanced liver transplant surgery." },
    { "title": "Cadaveric Liver Transplant", "description": "Transplant using donor liver grafts." },
    { "title": "Robotic GI Surgery", "description": "Minimally invasive robotic procedures." },
    { "title": "HPB Surgery", "description": "Liver, pancreas and bile duct surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Moond perform liver transplants?", "answer": "Yes, including living donor and cadaveric transplants." },
    { "question": "Does he perform robotic GI surgeries?", "answer": "Yes, he specializes in robotic and laparoscopic GI oncology." },
    { "question": "Does he treat pancreatic cancer?", "answer": "Yes, through advanced HPB surgical interventions." }
  ]
},
{
  "slug": "dr-nitish-rai",
  "name": "Dr. Nitish Rai",
  "specialty": "Interventional Cardiology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Interventional Cardiology",
  "degree": "DM (Cardiology – AIIMS) | MD (PGIMS) | MBBS (UCMS)",
  "about": "Dr. Nitish Rai is an interventional cardiologist trained at AIIMS with expertise in complex coronary interventions, imaging-guided angioplasty, pacemaker implantation and structural heart procedures.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages in heart arteries causing chest pain." },
    { "title": "Heart Rhythm Disorders", "description": "Arrhythmias and conduction abnormalities." },
    { "title": "Heart Failure", "description": "Weak heart function and cardiac insufficiency." },
    { "title": "Hypertension & Cardiac Risk", "description": "High blood pressure and cardiovascular risks." }
  ],
  "procedures": [
    { "title": "Coronary Angiography", "description": "Imaging the heart arteries." },
    { "title": "Angioplasty & Stenting", "description": "Opening blocked arteries with stents." },
    { "title": "Pacemaker & ICD Implantation", "description": "Implant procedures for rhythm disorders." },
    { "title": "IVUS/OCT Guided PCI", "description": "Precision imaging-guided interventions." }
  ],
  "faqs": [
    { "question": "Does Dr. Nitish perform angioplasties?", "answer": "Yes, including complex PCI with advanced techniques." },
    { "question": "Does he implant pacemakers?", "answer": "Yes, including ICD and CRT-D devices." },
    { "question": "Does he treat heart failure?", "answer": "Yes, with evidence-based cardiac therapy." }
  ]
},
{
  "slug": "dr-meenakshi-sharma",
  "name": "Dr. Meenakshi Sharma",
  "specialty": "Infertility & IVF, Obstetrics & Gynaecology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – IVF & Obstetrics",
  "degree": "MD (Obs & Gynae – AIIMS) | MBBS (AIIMS)",
  "about": "Dr. Meenakshi Sharma is an infertility and IVF specialist with more than 23 years of experience. She has worked at AIIMS and major Delhi hospitals and specializes in high-risk obstetrics, reproductive endocrinology, IVF failures and endoscopic gynaecology.",
  "medicalProblems": [
    { "title": "Female Infertility", "description": "Hormonal issues, PCOS and ovulation disorders." },
    { "title": "High-Risk Pregnancy", "description": "Pregnancy complications requiring close monitoring." },
    { "title": "Reproductive Endocrine Disorders", "description": "Hormonal imbalance affecting fertility." },
    { "title": "PCOS", "description": "Polycystic ovary syndrome and metabolic issues." }
  ],
  "procedures": [
    { "title": "IVF & IUI", "description": "Complete fertility treatment options." },
    { "title": "Laparoscopic Gynaecology", "description": "Keyhole surgery for gynae conditions." },
    { "title": "High-Risk Delivery", "description": "Maternal and fetal risk management." },
    { "title": "Ovulation Induction", "description": "Treatment for anovulation and infertility." }
  ],
  "faqs": [
    { "question": "Does Dr. Meenakshi treat infertility?", "answer": "Yes, including IVF, IUI and hormonal infertility." },
    { "question": "Does she handle high-risk pregnancies?", "answer": "Yes, with extensive experience at AIIMS." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, for infertility and gynecological issues." }
  ]
},
{
  "slug": "dr-gita-gangadharan-shrivastav",
  "name": "Dr. Gita Gangadharan Shrivastav",
  "specialty": "ENT (Ear Nose Throat)",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "32+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – ENT",
  "degree": "FRCS (ENT – UK) | MS (ENT – MAMC) | MBBS (MAMC)",
  "about": "Dr. Gita Gangadharan Shrivastav is a highly experienced ENT surgeon with international training in the UK. She specializes in nasal disorders, endoscopic nasal surgery, ear surgeries, hearing restoration and voice-related treatments.",
  "medicalProblems": [
    { "title": "Nasal Disorders", "description": "Sinusitis, nasal obstruction and allergies." },
    { "title": "Ear Problems", "description": "Hearing loss, ear infections and perforated eardrum." },
    { "title": "Throat & Voice Disorders", "description": "Hoarseness, voice changes and swallowing issues." },
    { "title": "Head & Neck Lesions", "description": "Tumors, cysts and neck swellings." }
  ],
  "procedures": [
    { "title": "Nasal Endoscopic Surgery", "description": "Advanced minimally invasive nasal procedures." },
    { "title": "Ear Surgery", "description": "Hearing restoration and middle ear surgery." },
    { "title": "Head & Neck Surgery", "description": "Surgical management of head and neck diseases." },
    { "title": "Voice & Throat Procedures", "description": "Voice correction and throat surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Gita perform endoscopic nasal surgery?", "answer": "Yes, she is highly experienced in nasal endoscopic procedures." },
    { "question": "Does she treat hearing loss?", "answer": "Yes, through advanced ear surgeries and treatments." },
    { "question": "Does she treat voice disorders?", "answer": "Yes, including hoarseness and vocal cord issues." }
  ]
},
{
  "slug": "dr-ashima-srivastava",
  "name": "Dr. Ashima Srivastava",
  "specialty": "Clinical Psychology, Mental Health & Behavioural Sciences",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "27+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Clinical Psychologist (Child & Adult), Developmental & Behavioural Therapist",
  "degree": "PhD (Child Mental Health) | MPhil (Clinical Psychology)",
  "about": "Dr. Ashima Srivastava is a renowned Clinical Psychologist with extensive expertise in child, adolescent and adult mental health. She is known for her developmental and behavioural therapy, neuropsychological assessment and new therapeutic techniques for autism spectrum disorders.",
  "medicalProblems": [
    { "title": "Child & Adolescent Psychology Issues", "description": "Behavioural, emotional and developmental concerns." },
    { "title": "Developmental Disorders", "description": "Autism, ADHD and neuro-developmental challenges." },
    { "title": "Adult Mental Health Issues", "description": "Stress, anxiety, depression and emotional difficulties." },
    { "title": "Neuropsychological Disorders", "description": "Cognitive, memory and behavioural disorders." }
  ],
  "procedures": [
    { "title": "Behaviour Therapy", "description": "Structured therapy for children and adults." },
    { "title": "Neuropsychological Assessment", "description": "Evaluation of cognitive and behavioural functioning." },
    { "title": "Autism Intervention (ADOS-2)", "description": "Certified diagnostic and behavioural programs." },
    { "title": "Counselling & Psychotherapy", "description": "Individual mental health therapy sessions." }
  ],
  "faqs": [
    { "question": "Does Dr. Ashima treat children with autism?", "answer": "Yes, she is certified in ADOS-2 and trained for autism management." },
    { "question": "Does she offer therapy for adults?", "answer": "Yes, she treats stress, anxiety, depression and emotional issues." },
    { "question": "Does she provide neuropsychological evaluations?", "answer": "Yes, for children, adolescents and adults." }
  ]
},
{
  "slug": "dr-anurag-tandon",
  "name": "Dr. Anurag Tandon",
  "specialty": "ENT (Ear Nose Throat)",
  "hospital": "Max Hospital – Panchsheel Park | Max Hospital – Vaishali | Max Hospital – Noida Sec 19 | Max Hospital – Patparganj",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – ENT",
  "degree": "MS (ENT) | DLO | MBBS",
  "about": "Dr. Anurag Tandon is a senior ENT specialist with extensive experience across ENT, otolaryngology and head & neck care. He has held academic positions and specializes in treating a wide range of ear, nose and throat disorders.",
  "medicalProblems": [
    { "title": "Sinus Disorders", "description": "Chronic sinusitis, allergies and nasal blockage." },
    { "title": "Ear Conditions", "description": "Hearing loss, infections and tinnitus." },
    { "title": "Throat Problems", "description": "Tonsillitis, hoarseness and swallowing issues." },
    { "title": "Head & Neck Issues", "description": "ENT-related tumors, swelling and infections." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive sinus treatment." },
    { "title": "Ear Microsurgery", "description": "Procedures to treat chronic ear conditions." },
    { "title": "Tonsil & Adenoid Surgery", "description": "Surgery for chronic throat infections." },
    { "title": "ENT Laser Procedures", "description": "Advanced laser treatment for ENT issues." }
  ],
  "faqs": [
    { "question": "Does Dr. Anurag treat sinus problems?", "answer": "Yes, he specializes in sinus disorders and endoscopic procedures." },
    { "question": "Does he treat ear-related issues?", "answer": "Yes, including infections and hearing problems." },
    { "question": "Does he perform tonsil surgeries?", "answer": "Yes, he performs tonsil and adenoid surgeries." }
  ]
},
{
  "slug": "dr-chayan-vermani",
  "name": "Dr. Chayan Vermani",
  "specialty": "Interventional Cardiology",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Interventional Cardiology",
  "degree": "DM (Cardiology – AIIMS) | MD (MAMC) | MBBS (UCMS)",
  "about": "Dr. Chayan Vermani is an interventional cardiologist trained at AIIMS, specializing in coronary interventions, complex angioplasties, cardiac imaging, pacemaker implantation and critical cardiac care.",
  "medicalProblems": [
    { "title": "Heart Blockages", "description": "Coronary artery disease and chest pain." },
    { "title": "Arrhythmias", "description": "Heart rhythm abnormalities and palpitations." },
    { "title": "Heart Failure", "description": "Weak heart function and fluid overload." },
    { "title": "Hypertension & Cardiac Risks", "description": "High blood pressure and cardiac risk management." }
  ],
  "procedures": [
    { "title": "Coronary Angiography", "description": "Diagnostic imaging of heart arteries." },
    { "title": "Angioplasty & Stenting", "description": "Opening blocked arteries using stents." },
    { "title": "Pacemaker & ICD Implantation", "description": "Treatment for rhythm disorders." },
    { "title": "Imaging Guided PCI (IVUS/OCT)", "description": "Precision-guided coronary interventions." }
  ],
  "faqs": [
    { "question": "Does Dr. Chayan perform angioplasty?", "answer": "Yes, he specializes in complex coronary interventions." },
    { "question": "Does he implant pacemakers?", "answer": "Yes, including ICD and CRT-D devices." },
    { "question": "Does he manage heart failure?", "answer": "Yes, with advanced cardiac care." }
  ]
},
{
  "slug": "dr-priya-agarwal",
  "name": "Dr. Priya Agarwal",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Obstetrics & Gynaecology",
  "degree": "MS (Obstetrics & Gynaecology) | MBBS",
  "about": "Dr. Priya Agarwal is a skilled gynaecologist with experience in women’s health, obstetrics and gynaecological oncology. She deals with a wide range of women’s health conditions and provides compassionate maternity and gynaecology care.",
  "medicalProblems": [
    { "title": "Pregnancy Care", "description": "Routine and high-risk pregnancy management." },
    { "title": "Gynaecological Tumors", "description": "Evaluation and treatment of gynae-oncology cases." },
    { "title": "Menstrual Disorders", "description": "Irregular periods, PCOS, heavy bleeding." },
    { "title": "Infertility Issues", "description": "Hormonal and structural infertility problems." }
  ],
  "procedures": [
    { "title": "Normal & Cesarean Delivery", "description": "Complete maternity care and delivery services." },
    { "title": "Laparoscopic Gynaecology", "description": "Minimal access gynae procedures." },
    { "title": "Cancer Screening", "description": "Pap smear, colposcopy and preventive care." },
    { "title": "Infertility Treatment", "description": "Basic fertility treatments and evaluation." }
  ],
  "faqs": [
    { "question": "Does Dr. Priya provide pregnancy care?", "answer": "Yes, including normal and cesarean deliveries." },
    { "question": "Does she treat infertility?", "answer": "Yes, including hormonal and gynecological causes." },
    { "question": "Does she perform laparoscopic surgery?", "answer": "Yes, for gynaecological conditions." }
  ]
},
{
  "slug": "dr-ankur-bhatia",
  "name": "Dr. Ankur Bhatia",
  "specialty": "Aesthetic & Reconstructive Surgery",
  "hospital": "Max Hospital – Patparganj",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Plastic, Aesthetic & Reconstructive Surgery",
  "degree": "MCh (Plastic Surgery – CMC Ludhiana) | MS (General Surgery) | MBBS",
  "about": "Dr. Ankur Bhatia is a plastic and reconstructive surgeon with specialization in hand and microsurgery. His expertise includes cancer reconstruction, replantation, gynecomastia surgery and aesthetic procedures.",
  "medicalProblems": [
    { "title": "Birth Defects & Trauma Injuries", "description": "Complex reconstructive requirements." },
    { "title": "Hand Injuries", "description": "Tendon, nerve and digital injuries." },
    { "title": "Aesthetic Concerns", "description": "Cosmetic corrections and body contouring." },
    { "title": "Cancer Reconstruction", "description": "Restorative surgeries after tumor removal." }
  ],
  "procedures": [
    { "title": "Microsurgery", "description": "Precision surgeries using advanced techniques." },
    { "title": "Hand Surgery", "description": "Reconstruction for injury and deformities." },
    { "title": "Replantation Surgery", "description": "Reattachment of amputated parts." },
    { "title": "Gynecomastia Surgery", "description": "Male chest reduction." }
  ],
  "faqs": [
    { "question": "Does Dr. Ankur perform microsurgery?", "answer": "Yes, he is trained in advanced hand & microsurgery." },
    { "question": "Does he treat trauma injuries?", "answer": "Yes, including replantation and reconstructive procedures." },
    { "question": "Does he offer cosmetic treatments?", "answer": "Yes, including aesthetic and reconstructive surgeries." }
  ]
},
{
  "slug": "dr-shailesh-gupta",
  "name": "Dr. Shailesh Gupta",
  "specialty": "Laparoscopic, Bariatric & Robotic Surgery",
  "hospital": "Max Hospital – Patparganj",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Minimal Access, Bariatric & Robotic Surgery",
  "degree": "MS (General Surgery) | FMAS | FIAGES | Post Doctoral Fellowship (AWR & Robotic Surgery)",
  "about": "Dr. Shailesh Gupta is a specialist in advanced laparoscopic, bariatric, robotic and abdominal wall reconstruction (AWR) surgery. He is experienced in complex hernia repairs, minimal access GI surgery and metabolic surgery.",
  "medicalProblems": [
    { "title": "Obesity", "description": "Weight-related conditions requiring bariatric intervention." },
    { "title": "Hernias", "description": "Inguinal, ventral and incisional hernias." },
    { "title": "Gallbladder Disorders", "description": "Gallstones and gallbladder inflammation." },
    { "title": "GI Surgical Conditions", "description": "Tumors, reflux disease and intestinal issues." }
  ],
  "procedures": [
    { "title": "Bariatric Surgery", "description": "Sleeve gastrectomy and gastric bypass." },
    { "title": "Robotic Surgery", "description": "Minimally invasive robotic interventions." },
    { "title": "Advanced Laparoscopic Surgery", "description": "Hernia repair, gallbladder & GI procedures." },
    { "title": "AWR Surgery", "description": "Abdominal wall reconstruction surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Shailesh perform bariatric surgery?", "answer": "Yes, including sleeve gastrectomy and gastric bypass." },
    { "question": "Does he perform robotic surgery?", "answer": "Yes, he is trained in advanced robotic procedures." },
    { "question": "Does he treat hernias?", "answer": "Yes, including complex abdominal wall hernias." }
  ]
},
{
  "slug": "dr-abeer-hasan",
  "name": "Dr. Abeer Hasan",
  "specialty": "Dental Care",
  "hospital": "Max Hospital – Patparganj",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Dental Care",
  "degree": "BDS",
  "about": "Dr. Abeer Hasan is an experienced dentist specializing in general dentistry, cosmetic dental procedures, pain management and preventive dental care for all age groups.",
  "medicalProblems": [
    { "title": "Dental Caries", "description": "Cavities and tooth decay." },
    { "title": "Gum Disease", "description": "Gingivitis and periodontal issues." },
    { "title": "Tooth Fractures", "description": "Cracked or broken teeth." },
    { "title": "Cosmetic Dental Issues", "description": "Smile correction and aesthetic concerns." }
  ],
  "procedures": [
    { "title": "Root Canal Treatment", "description": "Saving infected teeth with endodontic therapy." },
    { "title": "Crowns & Bridges", "description": "Restoration of damaged or missing teeth." },
    { "title": "Cosmetic Dentistry", "description": "Teeth whitening, veneers and smile design." },
    { "title": "Preventive Dentistry", "description": "Scaling, polishing and dental hygiene care." }
  ],
  "faqs": [
    { "question": "Does Dr. Abeer perform root canals?", "answer": "Yes, she has expertise in endodontic procedures." },
    { "question": "Does she treat gum diseases?", "answer": "Yes, including cleaning and periodontal care." },
    { "question": "Does she offer cosmetic dentistry?", "answer": "Yes, including whitening and smile enhancement." }
  ]
},
{
  "slug": "dr-vaishakhi-rustagi",
  "name": "Dr. Vaishakhi Rustagi",
  "specialty": "Paediatric Endocrinology",
  "hospital": "Max Hospital – Shalimar Bagh | Max Hospital – Patparganj",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Paediatric Endocrinology",
  "degree": "Fellowship (Paediatric Endocrinology) | MD (Paediatrics)",
  "about": "Dr. Vaishakhi Rustagi is a paediatric endocrinologist trained internationally at CHOP, USA. She specializes in growth disorders, diabetes in children, thyroid problems and hormonal issues in childhood.",
  "medicalProblems": [
    { "title": "Growth Disorders", "description": "Short height, failure to thrive and IUGR." },
    { "title": "Thyroid Disorders", "description": "Congenital and acquired thyroid issues." },
    { "title": "Type 1 Diabetes", "description": "Childhood diabetes management." },
    { "title": "Puberty Disorders", "description": "Precocious or delayed puberty." }
  ],
  "procedures": [
    { "title": "Hormonal Evaluation", "description": "Endocrine testing for children." },
    { "title": "Growth Assessment", "description": "Monitoring growth patterns." },
    { "title": "Insulin Therapy for Children", "description": "Comprehensive diabetic care." },
    { "title": "Thyroid Management", "description": "Corrective treatment for thyroid dysfunction." }
  ],
  "faqs": [
    { "question": "Does Dr. Vaishakhi treat short height issues?", "answer": "Yes, she specializes in growth disorders." },
    { "question": "Does she treat Type 1 diabetes?", "answer": "Yes, she manages diabetes in children." },
    { "question": "Does she treat puberty disorders?", "answer": "Yes, including early and delayed puberty." }
  ]
},
{
  "slug": "dr-mily-ray",
  "name": "Dr. Mily Ray",
  "specialty": "Paediatric Cardiology",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Paediatric Cardiology",
  "degree": "FNB (Paediatric Cardiology) | MD (Paediatrics) | MBBS",
  "about": "Dr. Mily Ray is a paediatric cardiologist trained in India and Australia. She specializes in fetal cardiology, congenital heart disorders, paediatric cardiac imaging and general paediatric cardiology.",
  "medicalProblems": [
    { "title": "Congenital Heart Disease", "description": "Heart defects present at birth." },
    { "title": "Arrhythmias in Children", "description": "Abnormal heart rhythms." },
    { "title": "Pediatric Chest Pain", "description": "Evaluation of heart-related symptoms in children." },
    { "title": "Fetal Heart Abnormalities", "description": "Prenatal cardiac complications." }
  ],
  "procedures": [
    { "title": "Fetal Echocardiography", "description": "Heart evaluation before birth." },
    { "title": "Pediatric Echocardiography", "description": "Non-invasive imaging for heart diagnosis." },
    { "title": "Cardiac Screening", "description": "Routine cardiac evaluation in children." },
    { "title": "Holter Monitoring", "description": "24-hour rhythm monitoring." }
  ],
  "faqs": [
    { "question": "Does Dr. Mily treat congenital heart disease?", "answer": "Yes, she specializes in CHD and pediatric cardiology." },
    { "question": "Does she perform fetal echocardiography?", "answer": "Yes, she is trained in fetal heart imaging." },
    { "question": "Does she treat arrhythmias in children?", "answer": "Yes, she evaluates and manages pediatric arrhythmias." }
  ]
},
{
  "slug": "dr-manpreet-sethi",
  "name": "Dr. Manpreet Sethi",
  "specialty": "Paediatric Endocrinology",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Vaishali | Max Hospital – Patparganj",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Paediatric Endocrinologist",
  "degree": "GRIPMER Fellowship (Paediatric Endocrinology) | DNB (Paediatrics) | DCH | MBBS",
  "about": "Dr. Manpreet Sethi is a senior paediatric endocrinologist with over 14 years of specialized experience. She treats childhood growth disorders, diabetes, obesity, puberty issues, PCOD, thyroid conditions and adolescent hormonal problems.",
  "medicalProblems": [
    { "title": "Childhood Growth Disorders", "description": "Short height, delayed growth and IUGR." },
    { "title": "Type 1 Diabetes in Children", "description": "Insulin-dependent diabetes management." },
    { "title": "Childhood Obesity", "description": "Obesity and metabolic disorders." },
    { "title": "Puberty Disorders", "description": "Precocious, delayed puberty and hormonal imbalance." }
  ],
  "procedures": [
    { "title": "Growth Assessment", "description": "Evaluation of height, weight and bone age." },
    { "title": "Diabetes Management in Children", "description": "Insulin therapy and lifestyle guidance." },
    { "title": "Hormonal Treatment", "description": "PCOD, thyroid and puberty-related care." },
    { "title": "Endocrine Testing", "description": "Extensive hormone evaluation." }
  ],
  "faqs": [
    { "question": "Does Dr. Manpreet treat short height issues?", "answer": "Yes, she specializes in childhood growth disorders." },
    { "question": "Does she treat puberty disorders?", "answer": "Yes, including early and delayed puberty." },
    { "question": "Does she treat hormonal issues in adolescent girls?", "answer": "Yes, including PCOD, irregular periods and hirsutism." }
  ]
},
{
  "slug": "dr-anusuya-sharma",
  "name": "Dr. Anusuya Sharma",
  "specialty": "Dental Care",
  "hospital": "Max Hospital – Patparganj",
  "experience": "37+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Dental Care",
  "degree": "IBOMS | MDS | BDS",
  "about": "Dr. Anusuya Sharma is a highly experienced dental surgeon with over 30 years of expertise in oral and maxillofacial care. She has served as Professor and HOD at Sharda University and has extensive experience in managing complex dental and facial pathologies.",
  "medicalProblems": [
    { "title": "Dental Infections", "description": "Management of tooth infections and gum diseases." },
    { "title": "Maxillofacial Trauma", "description": "Fractures and injuries of facial bones." },
    { "title": "Oral Pathologies", "description": "Diagnosis and treatment of oral diseases." },
    { "title": "Missing Teeth", "description": "Restoration using implants and prosthetics." }
  ],
  "procedures": [
    { "title": "Dental Implants", "description": "Replacement of missing teeth with implants." },
    { "title": "Maxillofacial Surgery", "description": "Surgical management of jaw and facial bones." },
    { "title": "Tooth Restoration", "description": "Crowns, fillings and cosmetic dental procedures." },
    { "title": "Tooth Extraction", "description": "Removal of damaged or infected teeth." }
  ],
  "faqs": [
    { "question": "Does Dr. Anusuya perform dental implants?", "answer": "Yes, she is highly experienced in implant dentistry." },
    { "question": "Does she treat facial trauma?", "answer": "Yes, she specializes in maxillofacial trauma management." },
    { "question": "Does she treat oral diseases?", "answer": "Yes, she manages a wide range of oral and maxillofacial pathologies." }
  ]
},
{
  "slug": "dr-vijay-lakshmi-thakur",
  "name": "Dr. Vijay Lakshmi Thakur",
  "specialty": "Dental Care, Maxillofacial Surgery & Implantology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Dental Care & Implantology",
  "degree": "BDS | Clinical Associate (MAIDS)",
  "about": "Dr. Vijay Lakshmi Thakur is an experienced dental surgeon specializing in preventive dentistry, restorative procedures, prosthodontics and oral pathology. She has worked with MAIDS and has over 8 years of experience at Max Healthcare.",
  "medicalProblems": [
    { "title": "Dental Infections", "description": "Tooth decay, cavities and gum infections." },
    { "title": "Aesthetic Dental Issues", "description": "Smile correction and cosmetic dentistry." },
    { "title": "Periodontal Disease", "description": "Gum disease and bone loss management." },
    { "title": "Oral Pathologies", "description": "Diagnosis of oral lesions and diseases." }
  ],
  "procedures": [
    { "title": "Cosmetic Dentistry", "description": "Smile design, veneers and whitening." },
    { "title": "Restorative Dentistry", "description": "Fillings, crowns and bridges." },
    { "title": "Periodontal Treatment", "description": "Scaling, root planing and gum treatment." },
    { "title": "Pain Management", "description": "Diagnosis and treatment of dental pain." }
  ],
  "faqs": [
    { "question": "Does Dr. Vijay Lakshmi handle cosmetic dentistry?", "answer": "Yes, she specializes in cosmetic and aesthetic procedures." },
    { "question": "Does she manage gum diseases?", "answer": "Yes, she provides periodontal and preventive treatments." },
    { "question": "Does she treat oral pathologies?", "answer": "Yes, including screening and diagnosis of oral diseases." }
  ]
},
{
  "slug": "dr-priyamvada-tyagi",
  "name": "Dr. Priyamvada Tyagi",
  "specialty": "Endocrinology & Diabetes",
  "hospital": "Max Hospital – Patparganj",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Endocrinology",
  "degree": "DM (Endocrinology – SGPGIMS) | MD (Paediatrics) | MBBS",
  "about": "Dr. Priyamvada Tyagi is an experienced endocrinologist trained at SGPGIMS. She specializes in diabetes, thyroid disorders, pediatric endocrinology and metabolic diseases.",
  "medicalProblems": [
    { "title": "Diabetes Mellitus", "description": "Type 1, Type 2 and gestational diabetes." },
    { "title": "Thyroid Disorders", "description": "Hypothyroidism, hyperthyroidism and thyroiditis." },
    { "title": "Hormonal Imbalances", "description": "PCOS, menstrual irregularities and metabolic issues." },
    { "title": "Paediatric Endocrine Disorders", "description": "Growth, puberty and congenital hormone issues." }
  ],
  "procedures": [
    { "title": "Diabetes Management", "description": "Glucose control, insulin therapy and monitoring." },
    { "title": "Thyroid Evaluation", "description": "Hormonal testing and ultrasound-based assessment." },
    { "title": "Hormonal Therapy", "description": "Treatment for endocrine imbalances." },
    { "title": "Endocrine Testing", "description": "Comprehensive hormone panel evaluations." }
  ],
  "faqs": [
    { "question": "Does Dr. Priyamvada treat thyroid disorders?", "answer": "Yes, she specializes in all thyroid-related conditions." },
    { "question": "Does she treat pediatric endocrine issues?", "answer": "Yes, including growth and puberty disorders." },
    { "question": "Does she manage PCOS?", "answer": "Yes, she provides hormonal and metabolic treatment for PCOS." }
  ]
},
{
  "slug": "dr-swati-upadhyay",
  "name": "Dr. Swati Upadhyay",
  "specialty": "Neonatology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Neonatology | Head of Department",
  "degree": "DNB (Neonatology) | MD (Pediatrics) – Gold Medalist | MBBS",
  "about": "Dr. Swati Upadhyay is a leading neonatologist with extensive expertise in managing premature babies, high-risk newborns, neonatal intensive care, and advanced ventilation techniques. She heads the Neonatology Department at Max Patparganj.",
  "medicalProblems": [
    { "title": "Premature Babies", "description": "Care for extremely low birth weight and preterm newborns." },
    { "title": "Neonatal Respiratory Issues", "description": "Ventilation, HFOV and respiratory support." },
    { "title": "High-Risk Newborns", "description": "Management of critical newborn conditions." },
    { "title": "Neonatal Infections", "description": "Sepsis, jaundice and metabolic disorders." }
  ],
  "procedures": [
    { "title": "Neonatal Resuscitation", "description": "Advanced resuscitation and antenatal counselling." },
    { "title": "Ventilation Support", "description": "Conventional and advanced HFOV ventilation." },
    { "title": "Therapeutic Hypothermia", "description": "Cooling therapy for birth asphyxia." },
    { "title": "NICU Procedures", "description": "Central lines, dialysis and exchange transfusion." }
  ],
  "faqs": [
    { "question": "Does Dr. Swati treat premature babies?", "answer": "Yes, she specializes in extremely low birth weight infants." },
    { "question": "Does she manage neonatal ventilation?", "answer": "Yes, including HFOV and advanced respiratory support." },
    { "question": "Does she manage high-risk newborns?", "answer": "Yes, she leads NICU care for critical newborns." }
  ]
},
{
  "slug": "dr-avesh",
  "name": "Dr. Avesh",
  "specialty": "Gastroenterology, Hepatology & Endoscopy",
  "hospital": "Max Hospital – Patparganj",
  "experience": "—",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant – Gastroenterology",
  "degree": "DrNB (Gastroenterology) | DNB (General Medicine) | MBBS",
  "about": "Dr. Avesh is a gastroenterologist with advanced training in digestive diseases, liver disorders and therapeutic endoscopy. He has worked across multiple leading medical institutions and specializes in hepatobiliary and pancreatic diseases.",
  "medicalProblems": [
    { "title": "Liver Disorders", "description": "Hepatitis, fatty liver and cirrhosis." },
    { "title": "Pancreatic Diseases", "description": "Acute and chronic pancreatitis." },
    { "title": "GI Diseases", "description": "Acidity, ulcers, IBS and IBD." },
    { "title": "Biliary Disorders", "description": "Gallbladder and bile duct conditions." }
  ],
  "procedures": [
    { "title": "Endoscopy", "description": "Diagnostic and therapeutic upper GI endoscopy." },
    { "title": "Colonoscopy", "description": "Evaluation of colon and rectum." },
    { "title": "ERCP", "description": "Advanced procedure for bile duct and pancreatic issues." },
    { "title": "Liver Evaluation", "description": "Diagnosis and management of liver disease." }
  ],
  "faqs": [
    { "question": "Does Dr. Avesh treat liver disease?", "answer": "Yes, he specializes in hepatology and liver disorders." },
    { "question": "Does he perform ERCP?", "answer": "Yes, he performs diagnostic and therapeutic ERCP." },
    { "question": "Does he treat pancreatic issues?", "answer": "Yes, including pancreatitis and ductal diseases." }
  ]
},
{
  "slug": "dr-aamir-iqbal",
  "name": "Dr. Aamir Iqbal",
  "specialty": "Minimal Access, Bariatric & Robotic Surgery",
  "hospital": "Max Medcentre – Meerut | Max Hospital – Patparganj",
  "experience": "—",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant – Minimal Access, Bariatric & Robotic Surgery",
  "degree": "FNB (Minimal Access Surgery) | MS (General Surgery) | MBBS",
  "about": "Dr. Aamir Iqbal is a minimally invasive, bariatric and robotic surgeon with experience across leading national and international centers. He specializes in hernia surgeries, bariatric procedures and advanced robotic techniques.",
  "medicalProblems": [
    { "title": "Hernias", "description": "Inguinal, ventral, umbilical and recurrent hernias." },
    { "title": "Gallbladder Disease", "description": "Gallstones and gallbladder inflammation." },
    { "title": "Obesity", "description": "Management through bariatric surgical options." },
    { "title": "Anorectal Disorders", "description": "Fistula, fissure and hemorrhoids." }
  ],
  "procedures": [
    { "title": "Robotic Surgery", "description": "Advanced robotic-assisted surgeries." },
    { "title": "Laparoscopic Hernia Repair", "description": "Minimally invasive hernia treatment." },
    { "title": "Bariatric Surgery", "description": "Weight-loss surgeries for obesity management." },
    { "title": "Gallbladder Removal", "description": "Laparoscopic cholecystectomy." }
  ],
  "faqs": [
    { "question": "Does Dr. Aamir perform robotic surgery?", "answer": "Yes, he is trained in advanced robotic and laparoscopic surgery." },
    { "question": "Does he operate on hernias?", "answer": "Yes, including all types of abdominal hernias." },
    { "question": "Does he perform bariatric surgery?", "answer": "Yes, he treats obesity through modern bariatric techniques." }
  ]
},
{
  "slug": "dr-apurva-tomar",
  "name": "Dr. Apurva Tomar",
  "specialty": "Paediatric Neurology",
  "hospital": "Max Hospital – Patparganj | Max Hospital – Vaishali",
  "experience": "—",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Consultant – Paediatric Neurology",
  "degree": "DM (Paediatric Neurology – AIIMS) | MD (Paediatrics) | MBBS",
  "about": "Dr. Apurva Tomar is a paediatric neurologist trained at AIIMS with expertise in epilepsy, developmental disorders, neurometabolic diseases, paediatric stroke and neuromuscular disorders. She is known for managing complex neurological conditions in children.",
  "medicalProblems": [
    { "title": "Paediatric Epilepsy", "description": "Seizures, recurrent seizures and treatment-resistant epilepsy." },
    { "title": "Developmental Disorders", "description": "Autism, ADHD, language and developmental delays." },
    { "title": "Neurometabolic Disorders", "description": "Genetic and metabolic neurological diseases." },
    { "title": "Paediatric Stroke", "description": "Diagnosis and management of childhood stroke." }
  ],
  "procedures": [
    { "title": "Neurological Evaluation", "description": "Comprehensive assessment of the nervous system." },
    { "title": "EEG & Neurodiagnostics", "description": "Brain-wave monitoring for seizure disorders." },
    { "title": "Developmental Assessment", "description": "Evaluation of cognitive, speech and behavioral development." },
    { "title": "Neuromuscular Testing", "description": "Investigation for neuromuscular and degenerative diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Apurva treat epilepsy in children?", "answer": "Yes, she specializes in paediatric epilepsy management." },
    { "question": "Does she treat developmental disorders?", "answer": "Yes, including autism, ADHD and developmental delays." },
    { "question": "Does she treat paediatric stroke?", "answer": "Yes, she manages acute and chronic stroke conditions in children." }
  ]
},
{
  "slug": "dr-anamika-chaudhary",
  "name": "Dr. Anamika Chaudhary",
  "specialty": "Internal Medicine",
  "hospital": "Max Hospital – Patparganj",
  "experience": "—",
  "image": "",
  "isTopDoctor": false,
  "position": "Attending Consultant – Internal Medicine",
  "degree": "MBBS | MD (Internal Medicine) | Fellowship in Nephrology (Max Saket)",
  "about": "Dr. Anamika Chaudhary is an internal medicine specialist with expertise in diabetes, hypertension, thyroid disorders, infectious diseases and nephrology. She is known for her comprehensive diagnostic approach and evidence-based treatment.",
  "medicalProblems": [
    { "title": "Diabetes Mellitus", "description": "Management of Type 1, Type 2 and uncontrolled diabetes." },
    { "title": "Hypertension", "description": "Evaluation and treatment of high blood pressure." },
    { "title": "Thyroid Abnormalities", "description": "Hypothyroidism, hyperthyroidism and thyroiditis." },
    { "title": "Infectious Diseases", "description": "Acute and chronic infections including viral, bacterial and parasitic." }
  ],
  "procedures": [
    { "title": "Comprehensive Medical Evaluation", "description": "Diagnosis and long-term management of chronic conditions." },
    { "title": "Diabetes & Thyroid Profiling", "description": "Blood tests and hormonal assessments." },
    { "title": "Renal Assessment", "description": "Evaluation for kidney issues and nephrology support." },
    { "title": "Infection Management", "description": "Treatment plans for common and complex infections." }
  ],
  "faqs": [
    { "question": "Does Dr. Anamika treat diabetes?", "answer": "Yes, she specializes in diabetes and metabolic disorders." },
    { "question": "Does she treat thyroid diseases?", "answer": "Yes, she manages both hypo and hyperthyroidism." },
    { "question": "Does she treat infectious diseases?", "answer": "Yes, including acute and chronic infections." }
  ]
},
{
  "slug": "dr-puja-prasad",
  "name": "Dr. Puja Prasad",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Max Hospital – Patparganj",
  "experience": "9+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Visiting Consultant – Obstetrics & Gynaecology",
  "degree": "MS (Obs & Gynae) | MBBS | PG Diploma (Mother & Child Health) | FMAS | DMAS | Fellowship in IVF & Infertility",
  "about": "Dr. Puja Prasad is an obstetrician and gynaecologist with experience in high-risk pregnancies, infertility, IVF, laparoscopic surgery and preventive women’s health. She also runs her own clinic and has worked with leading IVF centres.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Comprehensive care for complicated pregnancies." },
    { "title": "Infertility", "description": "Evaluation and treatment including IVF." },
    { "title": "Gynaecological Disorders", "description": "Fibroids, ovarian cysts, PCOS and menstrual issues." },
    { "title": "Recurrent Miscarriages", "description": "Workup and treatment for repeated pregnancy loss." }
  ],
  "procedures": [
    { "title": "Normal & Cesarean Delivery", "description": "Full-spectrum obstetric care." },
    { "title": "Hysteroscopy & Laparoscopy", "description": "Minimally invasive women’s surgery." },
    { "title": "IVF & Fertility Treatments", "description": "Complete fertility evaluation and assisted conception." },
    { "title": "Preventive Gynaecology", "description": "Cancer screening, colposcopy and cryocautery." }
  ],
  "faqs": [
    { "question": "Does Dr. Puja treat high-risk pregnancies?", "answer": "Yes, she specializes in managing complicated pregnancies." },
    { "question": "Does she provide IVF treatment?", "answer": "Yes, she has formal training and experience in IVF & infertility." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, including hysteroscopy and minimally invasive procedures." }
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
