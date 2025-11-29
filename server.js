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
  "slug": "dr-purshotam-lal",
  "name": "Dr. Purshotam Lal",
  "specialty": "Cardiology & CTVS",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "40+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Metro Group of Hospitals & Director – Interventional Cardiology",
  "degree": "MD | AB (USA) | FRCP (C) | FACM | FICC | FACC | FSCAI (USA)",
  "about": "Dr. Purshotam Lal is a globally renowned interventional cardiologist credited with introducing the highest number of cardiac procedures in India. He has performed several world-firsts, including the first Heart Hole (ASD) closure and the first nonsurgical aortic valve replacement using a core valve. With over 20 groundbreaking interventional procedures introduced in India, he is recognised as a pioneer in angioplasty, stenting, valvuloplasty, and coronary atherectomy. Dr. Lal's work in Metro Coronary Screening is the largest such series globally with more than 11,000 successful cases.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages, heart attack prevention and advanced interventions." },
    { "title": "Valve Disorders", "description": "Expert in nonsurgical valve procedures and complex valvuloplasty." },
    { "title": "Congenital Heart Defects", "description": "Specialist in ASD, VSD and PDA closure without surgery." },
    { "title": "Complex Cardiac Conditions", "description": "High-risk cardiac cases requiring advanced interventional techniques." }
  ],
  "procedures": [
    { "title": "Angioplasty & Stenting", "description": "Largest number of angioplasties performed by a single operator in India." },
    { "title": "ASD / VSD / PDA Closure", "description": "World-first Heart Hole Closure performed in 1992." },
    { "title": "Aortic Valve Replacement", "description": "First in the world to perform Core Valve replacement without surgery." },
    { "title": "Rotablation & Atherectomy", "description": "Introduced multiple atherectomy techniques in India." }
  ],
  "faqs": [
    { "question": "Is Dr. Purshotam Lal a pioneer in interventional cardiology?", "answer": "Yes, he has introduced more than 20 cardiac procedures in India and performed several world-first interventions." },
    { "question": "Does he perform nonsurgical valve procedures?", "answer": "Yes, he performed the world’s first nonsurgical aortic valve replacement with a core valve." },
    { "question": "What is Metro Coronary Screening?", "answer": "A unique 5-minute coronary screening method introduced by Dr. Lal, performed on over 11,000 patients." }
  ]
},
{
  "slug": "dr-neeraj-jain",
  "name": "Dr. Neeraj Jain",
  "specialty": "Interventional Cardiology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Medical Director & Director – Interventional Cardiology",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | FACC",
  "about": "Dr. Neeraj Jain is one of the most respected interventional cardiologists in Faridabad with over 23 years of experience. He has managed more than 50,000 heart patients, performed thousands of angiographies, and over 15,000 cardiac procedures including 10,000+ angioplasties with stenting. He also has extensive expertise in treating international patients with complex heart diseases.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages, heart attack, angioplasty and stenting." },
    { "title": "Heart Rhythm Disorders", "description": "Pacemakers, ICD, CRT and electrophysiology-related treatments." },
    { "title": "Structural Heart Disease", "description": "ASD, VSD, PDA closure without surgery." },
    { "title": "Heart Failure", "description": "Advanced cardiac support and device therapy." }
  ],
  "procedures": [
    { "title": "Angioplasty & Stenting", "description": "Performed over 10,000 angioplasties successfully." },
    { "title": "Coronary Angiography", "description": "Thousands of radial and femoral angiographies performed." },
    { "title": "Device Implantation", "description": "Pacemakers, ICD, CRT, BIVI implantation." },
    { "title": "ASD / VSD / PDA Closure", "description": "Expert in non-surgical closure of structural heart defects." }
  ],
  "faqs": [
    { "question": "How many heart patients has Dr. Neeraj treated?", "answer": "He has treated over 50,000 heart patients." },
    { "question": "Is he experienced in angioplasty?", "answer": "Yes, he has performed more than 10,000 angioplasties." },
    { "question": "Does he treat international patients?", "answer": "Yes, he has treated over 1,000 international patients." }
  ]
},
{
  "slug": "dr-praveen-bansal",
  "name": "Dr. Praveen Kumar Bansal",
  "specialty": "Medical Oncology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Oncology Services",
  "degree": "MBBS | MD (Gold Medalist) | DM (Medical Oncology)",
  "about": "Dr. Praveen Bansal is a senior medical oncologist with more than 25 years of experience in treating hematological and solid organ cancers in both adults and children. Before joining Metro Group, he served as Director of Medical Oncology at Asian Institute of Medical Sciences and has worked with top cancer centers including Dharamshilla Cancer Hospital and Medanta Hospital. He is known for his expertise in chemotherapy, immunotherapy, targeted therapy, and bone marrow transplant.",
  "medicalProblems": [
    { "title": "Hematological Malignancies", "description": "Leukemia, lymphoma, and myeloma." },
    { "title": "Solid Tumors", "description": "Breast, lung, liver, colon, and gynecological cancers." },
    { "title": "Pediatric Cancers", "description": "All childhood cancers including leukemia and lymphomas." },
    { "title": "Advanced Cancer Management", "description": "Immunotherapy, targeted therapy and palliative oncology." }
  ],
  "procedures": [
    { "title": "Bone Marrow Transplant", "description": "Expert in autologous and allogeneic transplants." },
    { "title": "Chemotherapy", "description": "Standard and high-dose chemotherapy protocols." },
    { "title": "Targeted Therapy", "description": "Advanced molecular targeted treatments." },
    { "title": "Immunotherapy", "description": "Checkpoint inhibitors and novel immuno-oncology treatments." }
  ],
  "faqs": [
    { "question": "Does Dr. Bansal treat pediatric cancers?", "answer": "Yes, he has extensive experience in treating both pediatric and adult cancers." },
    { "question": "Is he experienced in bone marrow transplant?", "answer": "Yes, he specializes in BMT for hematological malignancies." },
    { "question": "Does he offer immunotherapy?", "answer": "Yes, he provides advanced immunotherapy and targeted cancer treatments." }
  ]
},
{
  "slug": "dr-sumant-gupta",
  "name": "Dr. Sumant Gupta",
  "specialty": "Medical Oncology, Hematology & Bone Marrow Transplant",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Additional Medical Director & Director – Metro Cancer Institute",
  "degree": "MBBS | MD (Medicine) | DM (Medical Oncology)",
  "about": "Dr. Sumant Gupta is an accomplished oncologist with specialized training from the renowned Cancer Institute (WIA), Chennai, and AIIMS Delhi. He has expertise in hematological cancers, bone marrow transplant, and solid tumor management. He is credited with performing the first-ever bone marrow transplant in Faridabad and has authored over 20 international and national research papers. Dr. Gupta has received awards including the TYSA Young Scholar Award (2015).",
  "medicalProblems": [
    { "title": "Blood Cancers", "description": "Leukemia, lymphoma, myeloma." },
    { "title": "Solid Organ Tumors", "description": "Breast, lung, GI, liver and gynecological malignancies." },
    { "title": "Pediatric Oncology", "description": "Cancer care for children and adolescents." },
    { "title": "Bone Marrow Failure Disorders", "description": "Aplastic anemia and related conditions." }
  ],
  "procedures": [
    { "title": "Bone Marrow Transplant", "description": "Performed the first BMT in Faridabad." },
    { "title": "Chemotherapy", "description": "Standard, adjuvant and neoadjuvant chemotherapy." },
    { "title": "Immunotherapy", "description": "Checkpoint inhibitors, cellular therapies." },
    { "title": "Targeted Therapy", "description": "Precision oncological treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Sumant perform Bone Marrow Transplants?", "answer": "Yes, he is the first to perform BMT in Faridabad." },
    { "question": "What cancers does he treat?", "answer": "He treats all major hematological and solid tumors in adults and children." },
    { "question": "Is he an award-winning oncologist?", "answer": "Yes, he received the TYSA Young Scholar Award for Best DM Oncology Fellow." }
  ]
},
{
  "slug": "dr-vikash-kumar",
  "name": "Dr. Vikash Kumar",
  "specialty": "Radiation Oncology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Radiation Oncology",
  "degree": "MBBS | MD (Radiotherapy) | Fellowships in Precision Radiotherapy",
  "about": "Dr. Vikash Kumar is an eminent Radiation Oncologist with extensive experience in advanced radiotherapy technologies. Having served at top institutes like Asian Institute of Medical Sciences, BLK Cancer Centre, Jaypee Hospital and Medanta, he is known for precision radiotherapy, IMRT, IGRT, SBRT and stereotactic treatments. His dedication to cancer care is reflected through numerous fellowships, research contributions and leadership roles in radiation oncology.",
  "medicalProblems": [
    { "title": "Head & Neck Cancers", "description": "Comprehensive radiotherapy-based treatment." },
    { "title": "Brain Tumors", "description": "Advanced stereotactic radiosurgery and radiotherapy." },
    { "title": "Breast Cancer", "description": "Precision radiotherapy, organ-sparing techniques." },
    { "title": "Thoracic & Abdominal Tumors", "description": "Radiation treatment for lung, liver, pancreas and GI cancers." }
  ],
  "procedures": [
    { "title": "IMRT / IGRT", "description": "Highly accurate, image-guided radiotherapy." },
    { "title": "SBRT / SRS", "description": "Stereotactic treatments for tumors requiring high precision." },
    { "title": "Brachytherapy", "description": "Internal radiation for gynecologic and prostate cancers." },
    { "title": "Precision Radiotherapy", "description": "Fellowship-trained advanced cancer radiotherapy." }
  ],
  "faqs": [
    { "question": "Does Dr. Vikash specialize in precision radiotherapy?", "answer": "Yes, he has specialized fellowships and expertise in precision radiotherapy techniques." },
    { "question": "Does he treat brain tumors?", "answer": "Yes, he is skilled in stereotactic radiosurgery and advanced CNS radiotherapy." },
    { "question": "Is he experienced across multiple cancer centers?", "answer": "Yes, he has served in leading cancer institutes across India." }
  ]
},
{
  "slug": "dr-ritesh-mongha",
  "name": "Dr. Ritesh Mongha",
  "specialty": "Urology, Kidney Transplant & Robotic Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Senior Consultant – Urology, Kidney Transplant & Robotic Surgery",
  "degree": "MBBS | MS (Surgery) | DNB (General Surgery) | MCh (Urology)",
  "about": "Dr. Ritesh Mongha is a leading urologist and renal transplant surgeon with nearly two decades of experience across prestigious institutions including Apollo Hospital (Delhi), Fortis Hospital and SSKM Hospital (Kolkata). He has performed more than 10,000 endourological and laparoscopic urological procedures, including over 1000 prostate surgeries and 2000+ RIRS procedures. His expertise spans robotic surgery, laparoscopic oncology, urethral reconstruction and complex renal transplants.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Laser RIRS, PCNL, URS for all types of stones." },
    { "title": "Prostate Enlargement", "description": "Laser prostatectomy and minimally invasive surgeries." },
    { "title": "Urethral Strictures", "description": "Buccal mucosa grafting and complex reconstruction." },
    { "title": "Uro-Oncology", "description": "Cancers of kidney, adrenal, prostate, bladder and ureter." }
  ],
  "procedures": [
    { "title": "Laser Prostate Surgery", "description": "Over 1000+ laser prostate procedures performed." },
    { "title": "RIRS & Endourology", "description": "More than 2000 RIRS procedures for kidney stones." },
    { "title": "Robotic Urology", "description": "Robotic nephrectomy, prostatectomy and complex reconstruction." },
    { "title": "Renal Transplant", "description": "Experienced in 700+ renal transplants." }
  ],
  "faqs": [
    { "question": "Does Dr. Mongha perform laser prostate surgery?", "answer": "Yes, he leads one of India's busiest laser urology units." },
    { "question": "Is he experienced in robotic surgeries?", "answer": "Yes, he is skilled in robotic urological oncology and reconstruction." },
    { "question": "Does he perform kidney transplants?", "answer": "Yes, with experience in over 700 transplants." }
  ]
},
{
  "slug": "dr-shailendra-lalwani",
  "name": "Dr. Shailendra Lalwani",
  "specialty": "Liver Transplant, HPB & GI Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Liver Transplant, HPB & GI Surgery",
  "degree": "MBBS | MS (General Surgery) | DNB (Surgical Gastroenterology) | Training – King's College Hospital, London (HPB & Liver Transplant)",
  "about": "Dr. Shailendra Lalwani is a renowned liver transplant and HPB surgeon with 25+ years of experience and over 2500 successful liver transplant surgeries. He has performed more than 15,000 complex GI and HPB surgeries, including adult and pediatric liver transplants, combined liver-kidney transplants, and advanced hepatobiliary cancer surgeries. Trained at King's College Hospital, London, he is known for his precision, surgical innovation, and leadership in liver transplant programs across major hospitals.",
  "medicalProblems": [
    { "title": "Liver Failure", "description": "Management and surgical treatment for acute and chronic liver disease." },
    { "title": "Liver & Biliary Cancers", "description": "Surgical treatment for hepatocellular carcinoma and cholangiocarcinoma." },
    { "title": "Gastrointestinal Cancers", "description": "Treatment for colorectal, stomach, and pancreatic cancers." },
    { "title": "Portal Hypertension", "description": "Advanced shunt and transplant-based treatments." }
  ],
  "procedures": [
    { "title": "Liver Transplant", "description": "Living and deceased donor transplants; pediatric and adult." },
    { "title": "HPB Surgery", "description": "Pancreatic, liver, gallbladder, and bile duct surgeries." },
    { "title": "Robotic Gastrointestinal Surgery", "description": "Minimally invasive robotic and laparoscopic GI procedures." },
    { "title": "GI Oncology Surgery", "description": "Advanced cancer surgeries for GI and hepatobiliary tumors." }
  ],
  "faqs": [
    { "question": "Has Dr. Lalwani performed liver transplants internationally?", "answer": "Yes, he performed the first liver transplant of Sudan and East Africa." },
    { "question": "Does he treat pediatric liver conditions?", "answer": "Yes, he specializes in pediatric liver transplants." },
    { "question": "Is he trained internationally?", "answer": "Yes, he received advanced liver transplant training at King’s College Hospital, London." }
  ]
},
{
  "slug": "dr-lalit-sehgal",
  "name": "Dr. Lalit Sehgal",
  "specialty": "Liver Transplant Anaesthesia & Critical Care",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – General & Liver Transplant Anaesthesia, Liver & Oncology ICU",
  "degree": "MBBS | MD (Anesthesiology) | DNB (Anesthesiology) | PG Certification in Hospital Management | MBA (Healthcare Services)",
  "about": "Dr. Lalit Sehgal is a senior anesthesiologist and critical care expert with over 24 years of experience. He specializes in liver transplant anesthesia, oncology critical care, and surgical intensive care. He has played a key role in establishing liver transplant programs at major hospitals including ILBS Delhi, Fortis Noida, Manipal Dwarka, Rajiv Gandhi Cancer Institute, and hospitals in Sudan. Known for his leadership and excellence in perioperative management, he has been honoured for contributions in teaching and training.",
  "medicalProblems": [
    { "title": "Liver Transplant Critical Care", "description": "Expert care for pre and post-liver transplant patients." },
    { "title": "Oncology ICU Care", "description": "Critical care for cancer surgeries and complications." },
    { "title": "High-Risk Surgical Anaesthesia", "description": "Safe anesthesia for complex and high-risk patients." },
    { "title": "Multi-Organ Failure", "description": "Advanced ICU management and life-support systems." }
  ],
  "procedures": [
    { "title": "Liver Transplant Anaesthesia", "description": "Advanced anesthesia for adult and pediatric liver transplants." },
    { "title": "Critical Care Management", "description": "Ventilation, organ support and emergency ICU procedures." },
    { "title": "Onco-Surgical Anaesthesia", "description": "Anaesthesia for complex cancer surgeries." },
    { "title": "Advanced Monitoring", "description": "Hemodynamic & neurological monitoring in critical patients." }
  ],
  "faqs": [
    { "question": "Does Dr. Sehgal specialize in liver transplant anesthesia?", "answer": "Yes, he is one of India’s top experts in liver transplant anaesthesia and SICU." },
    { "question": "Has he set up liver transplant programs?", "answer": "Yes, he has established multiple successful programs in India and abroad." },
    { "question": "Does he handle oncology critical care?", "answer": "Yes, he heads liver and oncology ICU services." }
  ]
},
{
  "slug": "dr-vishal-khurana",
  "name": "Dr. Vishal Khurana",
  "specialty": "Gastroenterology & Hepatobiliary Sciences",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Gastroenterology & Hepatobiliary Sciences",
  "degree": "MBBS | MD (Medicine) | DM (Gastroenterology) | MNAMS",
  "about": "Dr. Vishal Khurana is a highly skilled gastroenterologist trained at prestigious institutes including BHU and IPGMER. With over 13 years of experience, he specializes in advanced endoscopy, hepatobiliary disorders, pancreatic diseases, and gastrointestinal oncology. He has multiple international publications, including in The Lancet and Journal of Pancreas, and has won several awards for academic excellence.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Fatty liver, hepatitis, cirrhosis and liver failure." },
    { "title": "Pancreatic Disorders", "description": "Pancreatitis, pancreatic tumors and chronic pancreatic disease." },
    { "title": "GI Cancers", "description": "Esophageal, stomach, colorectal and pancreatic cancers." },
    { "title": "IBD & Functional Disorders", "description": "Ulcerative colitis, Crohn’s disease, IBS and motility disorders." }
  ],
  "procedures": [
    { "title": "Upper GI Endoscopy", "description": "Diagnostic and therapeutic endoscopy." },
    { "title": "ERCP & EUS", "description": "Advanced bile duct and pancreatic interventions." },
    { "title": "Colonoscopy", "description": "Cancer screening, polyp removal and GI bleeding management." },
    { "title": "Advanced Endoscopic Procedures", "description": "EMR, hemostasis, stricture dilation, hemoclip and APC." }
  ],
  "faqs": [
    { "question": "Is Dr. Khurana experienced in ERCP & EUS?", "answer": "Yes, he is highly skilled in advanced endoscopic procedures." },
    { "question": "Does he treat liver and pancreatic diseases?", "answer": "Yes, he specializes in hepatobiliary and pancreatic disorders." },
    { "question": "Has he published scientific research?", "answer": "Yes, he has numerous publications in major international journals." }
  ]
},
{
  "slug": "dr-himanshu-arora",
  "name": "Dr. Himanshu Arora",
  "specialty": "Neuro Surgery & Spine",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Neuro Surgery & Spine (Unit-I)",
  "degree": "MBBS | DNB (General Surgery) | DNB (Neurosurgery) | Fellowship in Spine Surgery (London, UK)",
  "about": "Dr. Himanshu Arora is a distinguished neurosurgeon with over 5,000 successful neuro and spine surgeries. With training and a spine fellowship from London, he specializes in minimally invasive brain and spine surgery, endoscopic spine procedures, complex neurotrauma, neuro-oncology, and stereotactic surgery. He actively participates in national and international conferences and is known for his precision, ethical practice, and clinical excellence.",
  "medicalProblems": [
    { "title": "Brain Tumors", "description": "Surgical management of benign and malignant brain tumors." },
    { "title": "Spine Disorders", "description": "Slip disc, spinal stenosis, deformities and instability." },
    { "title": "Head Injury & Trauma", "description": "Comprehensive neurosurgical and critical care management." },
    { "title": "Movement Disorders", "description": "DBS for Parkinson’s disease and other disorders." }
  ],
  "procedures": [
    { "title": "Minimally Invasive Spine Surgery", "description": "Endoscopic and keyhole spine procedures." },
    { "title": "Brain Tumor Surgery", "description": "Microscopic and stereotactic tumor excision." },
    { "title": "Endoscopic Neurosurgery", "description": "Endonasal and cranial base endoscopic procedures." },
    { "title": "Endovascular Neurointervention", "description": "Stroke and aneurysm-based endovascular treatments." }
  ],
  "faqs": [
    { "question": "How many surgeries has Dr. Arora performed?", "answer": "He has successfully performed over 5,000 neuro and spine surgeries." },
    { "question": "Does he specialize in minimally invasive spine surgery?", "answer": "Yes, he is trained in advanced endoscopic and keyhole spine surgeries." },
    { "question": "Has he trained internationally?", "answer": "Yes, he completed a prestigious Spine Surgery Fellowship in London, UK." }
  ]
},
{
  "slug": "dr-arun-kumar-singh",
  "name": "Dr. Arun Kumar C. Singh",
  "specialty": "Endocrinology & Diabetology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Endocrinology & Diabetology",
  "degree": "MBBS | MD (Internal Medicine) | DM (Endocrinology)",
  "about": "Dr. Arun Kumar C. Singh is a highly accomplished endocrinologist and diabetologist with training from premier institutes including Grant Medical College Mumbai, Maulana Azad Medical College, and AIIMS New Delhi. He specializes in treating complex hormonal and metabolic disorders including diabetes, thyroid diseases, adrenal and pituitary disorders. With experience across top hospitals in India and Singapore, he is known for his analytical approach and excellence in endocrine care.",
  "medicalProblems": [
    { "title": "Diabetes Mellitus", "description": "Type 1, Type 2 and advanced diabetes management." },
    { "title": "Thyroid Disorders", "description": "Hypothyroidism, hyperthyroidism, thyroiditis and nodules." },
    { "title": "Hormonal Imbalances", "description": "Adrenal, pituitary, reproductive and metabolic disorders." },
    { "title": "Obesity & Metabolic Syndrome", "description": "Weight management and metabolic correction therapies." }
  ],
  "procedures": [
    { "title": "Diabetes Management", "description": "Insulin therapy, CGM, advanced care." },
    { "title": "Endocrine Diagnostics", "description": "Hormone profiling and metabolic evaluations." },
    { "title": "Thyroid Disorder Treatment", "description": "Medical management and long-term care." },
    { "title": "Metabolic Therapy", "description": "Lifestyle and pharmacological management." }
  ],
  "faqs": [
    { "question": "Does Dr. Singh treat complex diabetes cases?", "answer": "Yes, he specializes in advanced and uncontrolled diabetes management." },
    { "question": "Is he trained from AIIMS?", "answer": "Yes, he completed DM Endocrinology from AIIMS New Delhi." },
    { "question": "Does he manage thyroid disorders?", "answer": "Yes, he is an expert in all types of thyroid diseases." }
  ]
},
{
  "slug": "dr-midur-kumar-sharma",
  "name": "Dr. Midur Kumar Sharma",
  "specialty": "Laparoscopic, Bariatric & Robotic Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Laparoscopic, Bariatric, Metabolic & Robotic Surgery (Unit-I)",
  "degree": "MBBS | MS (General Surgery) | MCLS",
  "about": "Dr. Midur Kumar Sharma is a skilled laparoscopic and bariatric surgeon with extensive experience in advanced minimally invasive surgeries, single-incision laparoscopy, robotic surgery, laser-assisted treatments and metabolic surgery. He has served at several reputed institutions including MMIMSR Ambala, Alchemist Hospital Gurugram, Sarvodaya Hospital and Asian Hospital.",
  "medicalProblems": [
    { "title": "Obesity & Metabolic Disorders", "description": "Bariatric and metabolic surgery solutions." },
    { "title": "Hernias", "description": "Laparoscopic repair of all types of hernias." },
    { "title": "Anorectal Diseases", "description": "Laser treatment for fissures, fistulas and piles." },
    { "title": "Gallbladder & Appendix Issues", "description": "Advanced laparoscopic removal procedures." }
  ],
  "procedures": [
    { "title": "Laparoscopic Bariatric Surgery", "description": "Weight-loss surgeries including sleeve gastrectomy and bypass." },
    { "title": "Single Incision Laparoscopic Surgery (SILS)", "description": "Minimally invasive single-port procedures." },
    { "title": "Laser Anorectal Surgery", "description": "Laser treatment for hemorrhoids, fistulas and pilonidal sinus." },
    { "title": "Robotic Surgery", "description": "Advanced robotic GI and metabolic procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharma perform bariatric surgery?", "answer": "Yes, he specializes in bariatric and metabolic surgeries." },
    { "question": "What anorectal surgeries does he perform?", "answer": "Laser fistula, fissure and piles surgeries." },
    { "question": "Is he experienced in robotic surgery?", "answer": "Yes, he is trained in advanced robotic procedures." }
  ]
},
{
  "slug": "dr-ashok-dhar",
  "name": "Dr. Ashok Kr. Dhar",
  "specialty": "Orthopaedics & Joint Replacement",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Orthopaedics & Joint Replacement (Unit-I)",
  "degree": "MBBS | MS (Orthopaedics)",
  "about": "Dr. Ashok Kr. Dhar is a veteran orthopaedic surgeon with over 30,000 successful surgeries. He specializes in complex trauma, hip, knee, and shoulder replacement surgeries, minimally invasive orthopaedic procedures, and revision joint replacement. His experience includes leadership roles in Fortis Escorts Hospital, Sarvodaya Hospital, and international work under the Ministry of Health (Saudi Arabia).",
  "medicalProblems": [
    { "title": "Joint Arthritis", "description": "Knee, hip and shoulder degeneration." },
    { "title": "Complex Trauma", "description": "Acetabular and periarticular fractures." },
    { "title": "Sports Injuries", "description": "Ligament, tendon and cartilage injuries." },
    { "title": "Spine & Orthopaedic Disorders", "description": "Chronic pain, fractures and deformities." }
  ],
  "procedures": [
    { "title": "Joint Replacement Surgery", "description": "Knee, hip and shoulder replacements." },
    { "title": "Revision Arthroplasty", "description": "Correction of failed or damaged joint implants." },
    { "title": "Minimally Invasive Ortho Surgery", "description": "Advanced small-incision surgeries." },
    { "title": "Trauma Surgery", "description": "Fixation of fractures and complex injuries." }
  ],
  "faqs": [
    { "question": "Has Dr. Dhar performed many surgeries?", "answer": "Yes, he has performed over 30,000 orthopaedic surgeries." },
    { "question": "Does he specialize in joint replacements?", "answer": "Yes, he is an expert in hip, knee and shoulder replacement." },
    { "question": "Does he handle complex trauma cases?", "answer": "Yes, including acetabular and periarticular fractures." }
  ]
},
{
  "slug": "dr-puneet-nagpal",
  "name": "Dr. Puneet Nagpal",
  "specialty": "Radiation Oncology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Head – Radiation Oncology (Unit-II)",
  "degree": "MBBS | MD (Radiation Oncology) | PGDCR",
  "about": "Dr. Puneet Nagpal is an experienced Radiation Oncologist with expertise in advanced radiotherapy modalities, precision radiation techniques and comprehensive cancer management. He has served at leading institutions including Action Cancer Hospital, PGIMER Chandigarh and Max Hospital Shalimar Bagh. His clinical expertise includes IMRT, IGRT, SBRT and image-guided cancer treatments.",
  "medicalProblems": [
    { "title": "Head & Neck Cancers", "description": "Comprehensive radiation treatment for ENT cancers." },
    { "title": "Breast Cancer", "description": "Advanced radiotherapy for early and advanced breast cancer." },
    { "title": "Gynecological Cancers", "description": "Brachytherapy and external radiation treatment." },
    { "title": "Thoracic & Abdominal Tumors", "description": "Radiation care for lung, pancreas and GI malignancies." }
  ],
  "procedures": [
    { "title": "IMRT / IGRT / VMAT", "description": "State-of-the-art precision radiation treatments." },
    { "title": "SBRT", "description": "High-precision stereotactic body radiation therapy." },
    { "title": "Brachytherapy", "description": "Internal radiation treatment for selected cancers." },
    { "title": "Stereotactic Radiosurgery", "description": "Focused radiation for brain and spine tumors." }
  ],
  "faqs": [
    { "question": "Does Dr. Nagpal specialize in IMRT/IGRT?", "answer": "Yes, he is extensively trained in precision radiotherapy." },
    { "question": "Does he perform brachytherapy?", "answer": "Yes, especially for gynecological and prostate cancers." },
    { "question": "Which hospitals has he worked at?", "answer": "Action Cancer Hospital, PGIMER Chandigarh and Max Hospital Shalimar Bagh." }
  ]
},
{
  "slug": "dr-meenu-pujani",
  "name": "Dr. Meenu Pujani",
  "specialty": "Hematology, Histopathology & Cytopathology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Lab Services & Blood Bank Incharge",
  "degree": "MBBS | MD (Pathology)",
  "about": "Dr. Meenu Pujani is an expert in hematology, histopathology and cytopathology, serving as Director of Lab Services and Blood Bank Incharge at Metro Hospital. With an MBBS from PGIMS Rohtak and an MD from S.N. Medical College Agra, she has extensive diagnostic experience and has completed senior residency at Lady Hardinge Medical College. She has over 35 publications and is a trained internal auditor for ISO 15189.",
  "medicalProblems": [
    { "title": "Hematological Disorders", "description": "Blood cancers, anemia, clotting disorders and immunological conditions." },
    { "title": "Tissue Pathology", "description": "Cancer diagnosis through histopathology." },
    { "title": "Cytology", "description": "FNAC, fluid cytology and cancer screening." },
    { "title": "Blood Banking", "description": "Blood component management and transfusion safety." }
  ],
  "procedures": [
    { "title": "Bone Marrow Examination", "description": "Diagnostic evaluation for blood cancers and disorders." },
    { "title": "Histopathology Reporting", "description": "Biopsy examination for cancer diagnosis." },
    { "title": "Cytopathology", "description": "FNAC, PAP smear and cytology diagnostics." },
    { "title": "Blood Bank Management", "description": "Quality-controlled transfusion medicine services." }
  ],
  "faqs": [
    { "question": "Does Dr. Pujani handle blood bank services?", "answer": "Yes, she is the Blood Bank Incharge at Metro Hospital." },
    { "question": "Does she perform pathology reporting?", "answer": "Yes, she leads histopathology, cytology and hematology services." },
    { "question": "Does she have research publications?", "answer": "Yes, she has 35+ national and international publications." }
  ]
},
{
  "slug": "dr-arun-pandey",
  "name": "Dr. Arun Pandey",
  "specialty": "Surgical Oncology & Robotic Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "9+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & HOD – Surgical Oncology & Robotic Surgery (Unit-I)",
  "degree": "MBBS | MS (General Surgery) | M.Ch (Surgical Oncology, Gold Medal) | UICC Fellowship – HPB Surgery (MSKCC, New York)",
  "about": "Dr. Arun Pandey is a highly skilled surgical oncologist specializing in minimally invasive, robotic and advanced cancer surgeries. He has performed over 2,000 complex cancer surgeries and has expertise in HPB cancers, thoracic oncology, breast cancer, gynecologic cancer, and peritoneal surface malignancies. His international fellowship at Memorial Sloan Kettering Cancer Center, New York, further strengthens his specialization in HPB and advanced oncological procedures.",
  "medicalProblems": [
    { "title": "HPB Cancers", "description": "Liver, pancreas and biliary tract tumors." },
    { "title": "Breast & Gynecologic Cancers", "description": "Surgical treatment for breast and female reproductive cancers." },
    { "title": "Thoracic Cancers", "description": "Lung cancer, mediastinal masses and esophageal tumors." },
    { "title": "GI & Colorectal Cancers", "description": "Stomach, colon and rectal cancer surgeries." }
  ],
  "procedures": [
    { "title": "Robotic Cancer Surgery", "description": "High-precision minimally invasive robotic operations." },
    { "title": "HIPEC / PIPAC", "description": "Peritoneal cancer treatments." },
    { "title": "Limb Salvage Surgery", "description": "Bone and soft tissue tumor removal while preserving limbs." },
    { "title": "Minimally Invasive Cancer Surgery", "description": "Laparoscopic and thoracoscopic oncological procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Pandey perform robotic surgery?", "answer": "Yes, he specializes in robotic cancer surgery." },
    { "question": "What cancers does he treat?", "answer": "He treats HPB, thoracic, GI, gynecologic, breast and bone cancers." },
    { "question": "Is he internationally trained?", "answer": "Yes, he completed an HPB Fellowship at MSKCC, New York." }
  ]
},
{
  "slug": "dr-danish-jamal",
  "name": "Dr. Danish Jamal",
  "specialty": "Pulmonology, Interventional Pulmonology & Sleep Medicine",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD (Unit-I) – Pulmonology",
  "degree": "MBBS | MD (Pulmonary Medicine) | FERS | FCCP",
  "about": "Dr. Danish Jamal is a leading pulmonologist specializing in advanced respiratory diseases, interventional pulmonology and sleep medicine. With rich experience from Saudi Arabia, Sarvodaya Hospital, and King Fahad Hospital, he is extensively trained in EBUS, bronchoscopy, thoracoscopy and critical pulmonary care. He is known for treating severe asthma, ILD, COPD, TB and complex lung disorders.",
  "medicalProblems": [
    { "title": "Asthma & COPD", "description": "Comprehensive management including advanced therapy." },
    { "title": "Tuberculosis & MDR-TB", "description": "Treatment for drug-sensitive and resistant TB." },
    { "title": "Interstitial Lung Disease (ILD)", "description": "Diagnosis and long-term management of ILD." },
    { "title": "Sleep Disorders", "description": "Sleep apnea, snoring and sleep-related breathing disorders." }
  ],
  "procedures": [
    { "title": "Bronchoscopy", "description": "Diagnostic and interventional bronchoscopy." },
    { "title": "EBUS", "description": "Endobronchial ultrasound for lymph node assessment." },
    { "title": "Thoracoscopy", "description": "Minimally invasive pleural procedures." },
    { "title": "Lung Cancer Procedures", "description": "Interventional pulmonology for airway tumors." }
  ],
  "faqs": [
    { "question": "Does Dr. Danish perform EBUS?", "answer": "Yes, he is skilled in advanced EBUS procedures." },
    { "question": "Does he treat sleep apnea?", "answer": "Yes, he specializes in sleep medicine and snoring disorders." },
    { "question": "Does he handle ILD cases?", "answer": "Yes, he is experienced in diagnosing and treating ILD." }
  ]
},
{
  "slug": "dr-komal-meena",
  "name": "Dr. Komal Meena",
  "specialty": "Periodontics, Oral Implantology & Laser Dentistry",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD – Dentistry",
  "degree": "BDS | MDS (Periodontics & Oral Implantology) | Fellowship in Medical Cosmetology | Associate Fellowship (Laser Dentistry – WCLI USA)",
  "about": "Dr. Komal Meena is an accomplished dental specialist with 18+ years of experience in periodontics, implantology and advanced laser dentistry. She has led dental departments at multiple institutions and has expertise in cosmetic dentistry, implant surgery, periodontal regeneration and laser-assisted procedures. She is also trained in corticobasal implantology and has several research publications and academic contributions.",
  "medicalProblems": [
    { "title": "Gum Diseases", "description": "Periodontitis, gingivitis and gum infections." },
    { "title": "Missing Teeth", "description": "Dental implant-based restorations." },
    { "title": "Oral Cosmetic Issues", "description": "Gum contouring and smile enhancement." },
    { "title": "Oral Infections", "description": "Comprehensive diagnosis and treatment of dental infections." }
  ],
  "procedures": [
    { "title": "Dental Implants", "description": "Single, multiple and full-mouth implant systems." },
    { "title": "Laser Dentistry", "description": "Laser gum surgeries and soft tissue procedures." },
    { "title": "Periodontal Surgery", "description": "Gum flap surgeries and regenerative procedures." },
    { "title": "Cosmetic Dentistry", "description": "Smile design, gum contouring and advanced esthetic procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Komal perform implant surgeries?", "answer": "Yes, she is an expert in oral implantology." },
    { "question": "Is she trained in laser dentistry?", "answer": "Yes, she holds an Associate Fellowship in Laser Dentistry (WCLI, USA)." },
    { "question": "Does she provide cosmetic dental treatments?", "answer": "Yes, including smile design and gum reshaping." }
  ]
},
{
  "slug": "dr-loveleen-mangla",
  "name": "Dr. Loveleen Mangla",
  "specialty": "Respiratory Diseases, Critical Care & Sleep Medicine",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD (Unit-II) – Respiratory & Sleep Medicine",
  "degree": "DNB (Respiratory Diseases) | PDCC (Interventional Pulmonology) | FSM (Sleep Medicine) | EDRM | FAPSR",
  "about": "Dr. Loveleen Mangla is a distinguished pulmonologist specializing in interventional pulmonology, critical care, sleep disorders and advanced respiratory diagnostics. With experience from SGPGI Lucknow, Fortis Vasant Kunj and Delhi Heart & Lung Hospital, he is known for performing over 100 lung cryobiopsies—an achievement attained by very few specialists globally. He has multiple research publications in national and international journals.",
  "medicalProblems": [
    { "title": "Interstitial Lung Disease (ILD)", "description": "Cryobiopsy-based diagnosis and management." },
    { "title": "Severe Asthma & COPD", "description": "Advanced inhalation, biologics and ventilation support." },
    { "title": "Sleep Disorders", "description": "Sleep apnea, snoring and sleep-related breathing disorders." },
    { "title": "Lung Infections", "description": "Pneumonia, TB, fungal and post-transplant infections." }
  ],
  "procedures": [
    { "title": "Lung Cryobiopsy", "description": "Performed over 100 advanced cryobiopsies." },
    { "title": "Bronchoscopy", "description": "Diagnostic and interventional bronchoscopy." },
    { "title": "EBUS & Thoracoscopy", "description": "Procedures for lymph node and pleural evaluation." },
    { "title": "Sleep Studies", "description": "Polysomnography and sleep disorder treatment." }
  ],
  "faqs": [
    { "question": "Is Dr. Mangla experienced in cryobiopsy?", "answer": "Yes, he has performed over 100 lung cryobiopsies." },
    { "question": "Does he treat sleep apnea?", "answer": "Yes, he specializes in sleep medicine and respiratory sleep disorders." },
    { "question": "Does he manage ILD?", "answer": "Yes, he is an expert in diagnosing and treating ILD." }
  ]
},
{
  "slug": "dr-lucky-kharbanda",
  "name": "Dr. Lucky Kharbanda",
  "specialty": "Ophthalmology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD – Ophthalmology",
  "degree": "MBBS | MS (Ophthalmology)",
  "about": "Dr. Lucky Kharbanda is an accomplished ophthalmologist with extensive experience across leading hospitals including Centre for Sight, Sarvodaya Hospital and government medical institutions. She specializes in cataract surgeries, glaucoma, retinal disorders, ocular trauma, uveitis and anterior segment surgeries. Her expertise includes topical anesthesia cataract surgery (MICS), making the procedure pain-free and highly precise.",
  "medicalProblems": [
    { "title": "Cataracts", "description": "Age-related and secondary cataracts requiring surgical management." },
    { "title": "Glaucoma", "description": "Management of elevated eye pressure and optic nerve health." },
    { "title": "Retinal Disorders", "description": "Diabetic retinopathy, macular issues and retinal infections." },
    { "title": "Ocular Trauma", "description": "Injuries, foreign bodies and corneal trauma treatment." }
  ],
  "procedures": [
    { "title": "Phacoemulsification / MICS Cataract Surgery", "description": "Topical anesthesia cataract surgery with no injection." },
    { "title": "Glaucoma Surgery", "description": "Pressure-reducing surgical interventions." },
    { "title": "Anterior Segment Surgery", "description": "Corneal and lens-related surgical procedures." },
    { "title": "Retinal Procedures", "description": "Laser therapy, anti-VEGF injections and diabetic eye care." }
  ],
  "faqs": [
    { "question": "Does Dr. Kharbanda perform micro-incision cataract surgery?", "answer": "Yes, she specializes in MICS under topical anesthesia." },
    { "question": "Does she treat glaucoma?", "answer": "Yes, she offers both medical and surgical glaucoma care." },
    { "question": "Does she manage retinal diseases?", "answer": "Yes, including diabetic retinopathy and macular disorders." }
  ]
},
{
  "slug": "dr-sanjay-kumar-agrawal",
  "name": "Dr. Sanjay Kumar Agrawal",
  "specialty": "Urology & Renal Transplant",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD – Urology & Renal Transplant",
  "degree": "MBBS | MS (General Surgery) | M.Ch (Urology)",
  "about": "Dr. Sanjay Kumar Agrawal is a highly skilled urologist with expertise in endourology, reconstructive urology and andrology. Trained at SMS Medical College, he has worked in reputed centers including Kulkarni Endoscopic Surgical Centre and Medanta – The Medicity. He is known for managing complex urological disorders using advanced minimally invasive and reconstructive surgical techniques.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Laser treatment for stones including RIRS, PCNL and URS." },
    { "title": "Prostate Enlargement", "description": "Management of BPH and prostate-related disorders." },
    { "title": "Urethral Stricture", "description": "Reconstructive urology and urethroplasty." },
    { "title": "Male Infertility & Andrology", "description": "Evaluation and treatment of reproductive and sexual disorders." }
  ],
  "procedures": [
    { "title": "Endourological Surgeries", "description": "PCNL, RIRS, URS and laser stone removal." },
    { "title": "Reconstructive Urology", "description": "Urethroplasty and complex urethral repairs." },
    { "title": "Prostate Surgeries", "description": "TURP and laser prostatectomy." },
    { "title": "Renal Transplant", "description": "Kidney transplant surgical management and care." }
  ],
  "faqs": [
    { "question": "Does Dr. Agrawal perform reconstructive urology?", "answer": "Yes, he specializes in complex urethral reconstruction." },
    { "question": "Is he trained in endourology?", "answer": "Yes, with extensive experience at leading surgical centers." },
    { "question": "Does he perform renal transplants?", "answer": "Yes, he heads the Urology & Renal Transplant department." }
  ]
},
{
  "slug": "dr-vineeta-kharb",
  "name": "Dr. Vineeta Kharb",
  "specialty": "Obstetrics, Gynaecology, IVF & Robotic Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD (Unit-I) – Obstetrics, Gynaecology, IVF & Robotic Surgery",
  "degree": "MBBS | MS (OBG) | FICOLE | FMAS | FNB (Reproductive Medicine)",
  "about": "Dr. Vineeta Kharb is an expert in infertility management, advanced ART techniques, minimally invasive gynecologic surgery and high-risk pregnancy care. With specialized fellowships from Ruby Hall Clinic Pune and World Laparoscopy Hospital, she has authored multiple publications and contributed to reputed medical textbooks. She is recognized for her expertise in IVF, reproductive endocrinology and complex gynecological surgeries.",
  "medicalProblems": [
    { "title": "Infertility", "description": "Male and female infertility evaluation and IVF/ICSI treatment." },
    { "title": "High-Risk Pregnancy", "description": "Maternal-fetal medicine and advanced obstetric care." },
    { "title": "Gynecological Disorders", "description": "Fibroids, ovarian cysts, endometriosis and PCOS." },
    { "title": "Urogenital Problems", "description": "Pelvic pain, menstrual disorders and reproductive issues." }
  ],
  "procedures": [
    { "title": "IVF / ICSI / IMSI", "description": "Advanced ART techniques for infertility." },
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive gynecologic procedures." },
    { "title": "Robotic Surgery", "description": "Precision robotic-assisted gynecologic surgeries." },
    { "title": "Hysteroscopy", "description": "Evaluation and treatment of intrauterine pathologies." }
  ],
  "faqs": [
    { "question": "Does Dr. Vineeta specialize in IVF?", "answer": "Yes, she is an expert in infertility and reproductive medicine." },
    { "question": "Is she trained in laparoscopy and robotics?", "answer": "Yes, she holds multiple advanced laparoscopic and robotic fellowships." },
    { "question": "Does she manage high-risk pregnancies?", "answer": "Yes, she specializes in maternal and fetal medicine." }
  ]
},
{
  "slug": "dr-niti-chadha-negi",
  "name": "Dr. Niti Chadha Negi",
  "specialty": "Cardiac Electrophysiology & Cardiology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant – Cardiology & Head – Cardiac Electrophysiology Unit",
  "degree": "MD | DM | CCDS | CEPS (Electrophysiology)",
  "about": "Dr. Niti Chadha Negi is a leading cardiac electrophysiologist with over 15 years of experience in treating complex heart rhythm disorders. She specializes in EP studies, radiofrequency ablation, 3D mapping, atrial fibrillation ablation, and implantation of cardiac devices including pacemakers, ICDs and CRT. She is internationally certified and is an invited faculty at major cardiac electrophysiology conferences.",
  "medicalProblems": [
    { "title": "Arrhythmias", "description": "Atrial fibrillation, SVT, VT and conduction abnormalities." },
    { "title": "Heart Rhythm Disorders", "description": "Bradycardia, tachycardia and electrical issues in heart." },
    { "title": "Heart Failure with Rhythm Issues", "description": "Management with CRT and device-based therapy." },
    { "title": "Syncope & Palpitations", "description": "Evaluation through EP studies and monitoring." }
  ],
  "procedures": [
    { "title": "Electrophysiology (EP) Study", "description": "Diagnostic evaluation of heart’s electrical pathways." },
    { "title": "Radiofrequency Ablation", "description": "Treatment for arrhythmias using thermal energy." },
    { "title": "3D RFA & AF Ablation", "description": "Advanced mapping for atrial fibrillation." },
    { "title": "Pacemaker / ICD / CRT Implantation", "description": "Device-based rhythm management." }
  ],
  "faqs": [
    { "question": "Does Dr. Niti perform AF ablation?", "answer": "Yes, she specializes in AF and complex arrhythmia ablations." },
    { "question": "Is she certified in electrophysiology?", "answer": "Yes, she holds CEPS and CCDS certifications." },
    { "question": "Does she implant cardiac devices?", "answer": "Yes, she performs pacemaker, ICD and CRT implantations." }
  ]
},
{
  "slug": "dt-rashi-tantia",
  "name": "Dt. Rashi Tantia",
  "specialty": "Diet & Nutrition",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "HOD – Dietetics",
  "degree": "B.Sc (HSC) | PG Diploma in Dietetics & Public Health Nutrition | Certified Diabetes Educator",
  "about": "Dt. Rashi Tantia is an experienced clinical nutritionist with expertise in therapeutic diet planning, weight management, clinical nutrition for IPD patients and dietary counseling. She has 13 years of experience and also manages Food & Beverage services at the hospital. She is known for individualized diet plans tailored to medical conditions.",
  "medicalProblems": [
    { "title": "Diabetes & Metabolic Disorders", "description": "Medical nutrition therapy for diabetes and obesity." },
    { "title": "Heart Diseases", "description": "Therapeutic diets for cardiac patients." },
    { "title": "Kidney Disorders", "description": "Renal diets for CKD, dialysis and electrolyte issues." },
    { "title": "Weight Management", "description": "Personalized weight loss and nutrition planning." }
  ],
  "procedures": [
    { "title": "Therapeutic Diet Planning", "description": "Condition-specific diet management for inpatients." },
    { "title": "Nutrition Counseling", "description": "One-on-one OPD consultations and diet guidance." },
    { "title": "Diabetes Education", "description": "Diet and lifestyle training for diabetic patients." },
    { "title": "Hospital Nutrition Management", "description": "F&B and dietary service supervision." }
  ],
  "faqs": [
    { "question": "Does Dt. Rashi plan diets for IPD patients?", "answer": "Yes, she specializes in therapeutic diets for inpatients." },
    { "question": "Does she offer weight loss programs?", "answer": "Yes, she provides customized weight management plans." },
    { "question": "Is she a certified diabetes educator?", "answer": "Yes, she is certified in diabetes nutrition management." }
  ]
},
{
  "slug": "dr-pavan-kharbanda",
  "name": "Dr. Pavan Kharbanda",
  "specialty": "Internal Medicine",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD – Internal Medicine",
  "degree": "MBBS | MD (Internal Medicine)",
  "about": "Dr. Pavan Kharbanda is a senior physician with nearly two decades of clinical experience in internal medicine, diabetes management and critical care. He has worked at leading institutions including Fortis Escorts Hospital, Apollo Hospital and QRG Central Hospital. His expertise spans complex medical disorders, critical care, lifestyle diseases and emergency management.",
  "medicalProblems": [
    { "title": "Diabetes & Hypertension", "description": "Comprehensive management of metabolic and lifestyle disorders." },
    { "title": "Infectious Diseases", "description": "Fever, viral infections, respiratory and gastrointestinal illnesses." },
    { "title": "Cardio-Metabolic Disorders", "description": "Management of heart-related risk factors and systemic diseases." },
    { "title": "Critical Illness", "description": "Emergency care and ICU management." }
  ],
  "procedures": [
    { "title": "Critical Care Management", "description": "ICU-based treatment and emergency medical care." },
    { "title": "Chronic Disease Management", "description": "Long-term care for diabetes, thyroid, hypertension." },
    { "title": "Comprehensive Medical Evaluation", "description": "Full medical checkups and diagnostic evaluations." },
    { "title": "Cardiac Monitoring Support", "description": "Management of patients with cardiac comorbidities." }
  ],
  "faqs": [
    { "question": "Does Dr. Pavan manage diabetes?", "answer": "Yes, he is an expert in diabetes and chronic disease management." },
    { "question": "Does he handle emergency cases?", "answer": "Yes, he has extensive experience in ICU and emergency medicine." },
    { "question": "Is he experienced in cardiac care?", "answer": "Yes, he has served as Senior Registrar in cardiology departments." }
  ]
},
{
  "slug": "dr-rahul-kumar",
  "name": "Dr. Rahul Kumar",
  "specialty": "Neuro & Spine Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Head – Neuro & Spine Surgery (Unit-II)",
  "degree": "MBBS | MS (General Surgery) | M.Ch (Neurosurgery) | Fellowship in Minimally Invasive Spine Surgery",
  "about": "Dr. Rahul Kumar is an accomplished neuro and spine surgeon known for his expertise in brain tumors, spine disorders, minimally invasive surgeries, and complex craniovertebral junction procedures. He is skilled in neuro-oncology, endoscopic spine surgery, scoliosis and deformity correction, functional neurosurgery and pediatric neurosurgery. With experience across Artemis, Max and Fortis hospitals, he is recognized for high precision neurosurgical outcomes.",
  "medicalProblems": [
    { "title": "Brain Tumors", "description": "Benign and malignant brain tumor management." },
    { "title": "Spine Disorders", "description": "Slip disc, sciatica, cervical and lumbar spondylosis." },
    { "title": "Spinal Deformities", "description": "Scoliosis, kyphosis and congenital deformities." },
    { "title": "Movement Disorders", "description": "Parkinson's disease, dystonia and spasticity." }
  ],
  "procedures": [
    { "title": "Minimally Invasive Spine Surgery", "description": "Endoscopic and micro-invasive spine procedures." },
    { "title": "Brain Tumor Surgery", "description": "Microscopic, endoscopic and stereotactic tumor removal." },
    { "title": "Functional Neurosurgery", "description": "DBS, Baclofen pump insertion and movement disorder surgeries." },
    { "title": "Endovascular Procedures", "description": "Aneurysm coiling, flow diverters and vascular interventions." }
  ],
  "faqs": [
    { "question": "Does Dr. Rahul perform minimally invasive spine surgery?", "answer": "Yes, he is fellowship-trained in minimally invasive spine procedures." },
    { "question": "Does he treat brain tumors?", "answer": "Yes, he specializes in neuro-oncology and tumor surgeries." },
    { "question": "Does he handle spinal deformities?", "answer": "Yes, including scoliosis and kyphosis correction." }
  ]
},
{
  "slug": "dr-sachin-arora",
  "name": "Dr. Sachin Arora",
  "specialty": "Nuclear Medicine",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "HOD & Sr. Consultant – Nuclear Medicine",
  "degree": "MBBS | DRM | DNB | FEBNM | FANMB",
  "about": "Dr. Sachin Arora is a leading nuclear medicine expert specializing in PET-CT imaging, molecular diagnostics and radionuclide therapies. With experience across Jaslok Hospital, BLK Hospital, Royal Hospital Muscat and multiple imaging centers, he is known for precision diagnostics and advanced nuclear imaging techniques. His expertise aids in accurate cancer staging and treatment planning.",
  "medicalProblems": [
    { "title": "Cancer Diagnosis", "description": "PET-CT imaging for accurate detection and staging." },
    { "title": "Thyroid Disorders", "description": "Evaluation and radioactive iodine therapies." },
    { "title": "Bone & Infection Scans", "description": "Functional imaging for bone and inflammatory disorders." },
    { "title": "Neurological Conditions", "description": "Brain imaging for dementia, epilepsy and movement disorders." }
  ],
  "procedures": [
    { "title": "PET-CT Scan", "description": "Advanced molecular imaging for cancer and metabolic diseases." },
    { "title": "Radionuclide Therapy", "description": "Therapy for thyroid cancer and select tumors." },
    { "title": "SPECT Imaging", "description": "Functional organ imaging." },
    { "title": "Thyroid Uptake Scan", "description": "Diagnostic evaluation for thyroid diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora specialize in PET-CT?", "answer": "Yes, he is highly experienced in PET-CT and molecular imaging." },
    { "question": "Does he provide radionuclide therapy?", "answer": "Yes, for thyroid cancer and specific tumors." },
    { "question": "Does he perform SPECT scans?", "answer": "Yes, he is trained in all nuclear imaging modalities." }
  ]
},
{
  "slug": "dr-vipasha-brajpuriya",
  "name": "Dr. Vipasha Brajpuriya",
  "specialty": "ENT (Ear, Nose & Throat)",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant & HOD – ENT",
  "degree": "MBBS | MS (ENT)",
  "about": "Dr. Vipasha Brajpuriya is an experienced ENT specialist with 16+ years of expertise in treating ear, nose, throat, thyroid and voice disorders. She has worked at Batra Hospital, BLK Hospital and Accord Hospital. Known for her compassionate care, she specializes in sinus diseases, hearing disorders, balance issues, allergies and throat conditions.",
  "medicalProblems": [
    { "title": "Ear Disorders", "description": "Hearing loss, discharge, ringing and congenital issues." },
    { "title": "Nose & Sinus Issues", "description": "Allergies, polyps, blockage and smell disorders." },
    { "title": "Throat & Voice Problems", "description": "Swallowing issues, thyroid problems, laryngeal diseases." },
    { "title": "Head & Neck Concerns", "description": "Infections, trauma and congenital ENT conditions." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive surgery for sinus diseases." },
    { "title": "Ear Surgeries", "description": "Tympanoplasty, mastoidectomy and ossicular reconstruction." },
    { "title": "Thyroid & Head-Neck Surgery", "description": "Thyroidectomy and neck mass removal." },
    { "title": "Microlaryngeal Surgery", "description": "Voice and vocal cord disorder surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Vipasha treat sinus diseases?", "answer": "Yes, she specializes in allergies, sinusitis and nasal polyps." },
    { "question": "Does she perform ear surgeries?", "answer": "Yes, including tympanoplasty and mastoid surgery." },
    { "question": "Does she treat thyroid disorders?", "answer": "Yes, she handles thyroid-related ENT issues." }
  ]
},
{
  "slug": "dr-arvind-singhal",
  "name": "Dr. Arvind Singhal",
  "specialty": "Interventional Cardiology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant – Cardiology",
  "degree": "MBBS | MD (Medicine) | DNB (Cardiology) | FESC | FSCAI",
  "about": "Dr. Arvind Singhal is a highly experienced interventional cardiologist specializing in complex coronary angioplasties. He has performed more than 8,000 coronary angiographies and 4,000 angioplasties. With expertise in both radial and femoral approaches, he delivers safe and advanced cardiac interventions. His academic leadership includes teaching roles at ESI Medical College.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Heart blockages, angina and heart attack prevention." },
    { "title": "Heart Failure", "description": "Management of reduced heart function and risk factors." },
    { "title": "Arrhythmias", "description": "Diagnosis and management of irregular heartbeat." },
    { "title": "Hypertension & Lipid Disorders", "description": "Comprehensive cardiac risk management." }
  ],
  "procedures": [
    { "title": "Coronary Angiography", "description": "Performed 8,000+ angiographies through radial and femoral routes." },
    { "title": "Coronary Angioplasty (PTCA)", "description": "Performed 4,000+ angioplasties including complex cases." },
    { "title": "Primary Angioplasty", "description": "Emergency angioplasty for heart attacks." },
    { "title": "Cardiac Catheterization", "description": "Advanced diagnostic cardiac catheter procedures." }
  ],
  "faqs": [
    { "question": "How many angioplasties has Dr. Singhal performed?", "answer": "He has performed more than 4,000 angioplasties." },
    { "question": "Is he experienced in radial angiography?", "answer": "Yes, he performs both radial and femoral route angiographies." },
    { "question": "Does he manage complex coronary cases?", "answer": "Yes, he specializes in complex and primary angioplasties." }
  ]
},
{
  "slug": "dr-asheesh-malhotra",
  "name": "Dr. Asheesh Malhotra",
  "specialty": "Nephrology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant – Nephrology",
  "degree": "MBBS | MD (Medicine) | DM (Nephrology)",
  "about": "Dr. Asheesh Malhotra is a highly skilled nephrologist specializing in kidney transplants, dialysis therapies, renal failure management and complex kidney disorders. With extensive training at CMC Ludhiana and Army Hospital (R&R), he has served as Senior Consultant at ESIC Medical College and other reputed institutions. His expertise includes hemodialysis, peritoneal dialysis, kidney biopsy and transplant care.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease", "description": "Long-term management of CKD and renal complications." },
    { "title": "Acute Kidney Injury", "description": "Emergency and critical renal care." },
    { "title": "Kidney Stones & UTIs", "description": "Diagnosis and medical management." },
    { "title": "Glomerular Diseases", "description": "Autoimmune and inflammatory kidney disorders." }
  ],
  "procedures": [
    { "title": "Hemodialysis & CRRT", "description": "Advanced dialysis modalities for acute and chronic cases." },
    { "title": "Peritoneal Dialysis", "description": "CAPD/APD treatments for home-based dialysis." },
    { "title": "Kidney Transplant", "description": "Evaluation, surgery assistance and post-transplant care." },
    { "title": "Kidney Biopsy", "description": "Native and graft kidney biopsy for diagnosis." }
  ],
  "faqs": [
    { "question": "Does Dr. Malhotra handle kidney transplants?", "answer": "Yes, he specializes in transplant management and post-care." },
    { "question": "Does he perform biopsies?", "answer": "Yes, he performs native and graft kidney biopsies." },
    { "question": "Is he experienced in dialysis therapies?", "answer": "Yes, he is an expert in hemodialysis, CRRT and peritoneal dialysis." }
  ]
},
{
  "slug": "dr-kiranmayi-atla",
  "name": "Dr. Kiranmayi Atla",
  "specialty": "Plastic Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant – Plastic Surgery",
  "degree": "MBBS | MS (General Surgery) | M.Ch (Plastic Surgery)",
  "about": "Dr. Kiranmayi Atla is a distinguished plastic surgeon with 17 years of expertise in aesthetic and reconstructive surgery. She specializes in liposuction, body contouring, aesthetic breast surgeries, rhinoplasty, maxillofacial surgery, microsurgery and burn reconstruction. With extensive experience across PGIMER Chandigarh, QRG Hospital, Apollo Hospitals and Accord Hospital, she is known for precision-driven surgical outcomes and excellence in cosmetic and reconstructive procedures.",
  "medicalProblems": [
    { "title": "Cosmetic Concerns", "description": "Face, breast and body aesthetic issues." },
    { "title": "Reconstructive Needs", "description": "Post-trauma, post-surgical and cancer-related defects." },
    { "title": "Burn Injuries", "description": "Acute burn management and post-burn reconstruction." },
    { "title": "Hand & Maxillofacial Problems", "description": "Hand injuries, facial trauma and deformities." }
  ],
  "procedures": [
    { "title": "Liposuction & Body Contouring", "description": "Targeted fat removal and body reshaping." },
    { "title": "Aesthetic Breast Surgery", "description": "Breast lift, augmentation and reduction." },
    { "title": "Rhinoplasty", "description": "Nasal reshaping and functional correction." },
    { "title": "Microsurgery & Reconstruction", "description": "Flap surgeries, reimplantations and complex repairs." }
  ],
  "faqs": [
    { "question": "Does Dr. Kiranmayi perform cosmetic surgeries?", "answer": "Yes, including liposuction, rhinoplasty and breast surgeries." },
    { "question": "Does she treat burn cases?", "answer": "Yes, she is highly experienced in acute and post-burn reconstruction." },
    { "question": "Does she perform hand and maxillofacial surgery?", "answer": "Yes, she is trained in both hand and facial reconstructive procedures." }
  ]
},
{
  "slug": "dr-ruchi-vohra",
  "name": "Dr. Ruchi Vohra",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "29+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Sr. Consultant – Obstetrics & Gynaecology",
  "degree": "MBBS | MS (Obstetrics & Gynaecology)",
  "about": "Dr. Ruchi Vohra is a senior obstetrician and gynecologist with nearly three decades of experience. Trained at MLN Medical College Allahabad, she specializes in pregnancy care, gynecological disorders, menopausal health and minimally invasive gynecologic procedures. She is known for her compassionate patient care and extensive experience in women’s health.",
  "medicalProblems": [
    { "title": "Pregnancy Care", "description": "Normal and high-risk pregnancy management." },
    { "title": "Menstrual Disorders", "description": "PCOD, heavy bleeding, irregular cycles." },
    { "title": "Gynecologic Infections", "description": "Pelvic infections and reproductive health." },
    { "title": "Menopause Issues", "description": "Hormonal changes and post-menopausal care." }
  ],
  "procedures": [
    { "title": "Normal & Cesarean Delivery", "description": "Safe maternal and fetal management." },
    { "title": "Hysterectomy", "description": "Surgical management of uterine conditions." },
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive gynecologic procedures." },
    { "title": "Infertility Evaluation", "description": "Hormonal testing and preliminary fertility care." }
  ],
  "faqs": [
    { "question": "Does Dr. Ruchi handle high-risk pregnancies?", "answer": "Yes, she has extensive experience in high-risk obstetrics." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, she performs minimally invasive gynecologic surgeries." },
    { "question": "Does she treat PCOD and menstrual problems?", "answer": "Yes, she is experienced in managing hormonal and menstrual disorders." }
  ]
},
{
  "slug": "dr-shruti-khatana",
  "name": "Dr. Shruti Khatana",
  "specialty": "Oral & Maxillofacial Surgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant – Dentistry",
  "degree": "BDS | MDS (Oral & Maxillofacial Surgery)",
  "about": "Dr. Shruti Khatana is a highly accomplished Oral & Maxillofacial Surgeon with advanced training from AIIMS Delhi, NHS UK and Kidwai Memorial Institute of Oncology. She specializes in maxillofacial trauma, oral cancer surgeries, head and neck oncology, facial reconstruction, dental implants and complex jaw surgeries. She has numerous national and international accolades for academic excellence and clinical expertise.",
  "medicalProblems": [
    { "title": "Oral Cancer & Tumors", "description": "Diagnosis and surgical management of oral malignancies." },
    { "title": "Facial Trauma", "description": "Management of fractures and facial injuries." },
    { "title": "Jaw Disorders", "description": "TMJ issues and corrective jaw surgeries." },
    { "title": "Dental Infections", "description": "Cysts, abscesses and wisdom tooth complications." }
  ],
  "procedures": [
    { "title": "Maxillofacial Trauma Surgery", "description": "Fracture fixation and facial reconstruction." },
    { "title": "Oral Oncology Surgery", "description": "Cancer excision and reconstruction." },
    { "title": "Dental Implants", "description": "Implant placement and full-mouth rehabilitation." },
    { "title": "Orthognathic Surgery", "description": "Corrective jaw surgery for alignment and function." }
  ],
  "faqs": [
    { "question": "Does Dr. Khatana treat facial trauma?", "answer": "Yes, she is trained in high-complexity trauma and reconstruction." },
    { "question": "Does she perform oral cancer surgeries?", "answer": "Yes, she has specialized fellowships in oral oncology." },
    { "question": "Is she internationally trained?", "answer": "Yes, at NHS UK and Kidwai Memorial Institute." }
  ]
},
{
  "slug": "dr-shorav-bhatnagar",
  "name": "Dr. Shorav Bhatnagar",
  "specialty": "Radiology & Interventional Radiology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Sr. Consultant – Radiology",
  "degree": "MBBS | DNB (Radiodiagnosis) | PDCC (HPB Interventional Radiology)",
  "about": "Dr. Shorav Bhatnagar is an expert radiologist specializing in diagnostic and interventional radiology with extensive experience across ILBS Delhi, QRG Hospital, Sarvodaya Hospital and ADViR Diagnostic Centre. He is known for advanced liver and biliary interventions, image-guided procedures and high-end radiological diagnostics. He has received multiple international awards and fellowships for research and innovations.",
  "medicalProblems": [
    { "title": "Liver & Biliary Disorders", "description": "Blocked ducts, strictures and liver disease imaging." },
    { "title": "Vascular Disorders", "description": "Aneurysms, thrombosis and vascular malformations." },
    { "title": "Tumors & Cancers", "description": "Precision imaging and image-guided interventions." },
    { "title": "Abdominal & Thoracic Diseases", "description": "Ultrasound, CT and MRI-based diagnosis." }
  ],
  "procedures": [
    { "title": "Interventional Radiology", "description": "Minimally invasive procedures for liver, kidney and vascular diseases." },
    { "title": "Biopsy & Drainage", "description": "Ultrasound and CT-guided procedures." },
    { "title": "Advanced Imaging (CT/MRI)", "description": "Comprehensive body imaging." },
    { "title": "Endobiliary RF Ablation", "description": "Restoring biliary stent patency using RF technology." }
  ],
  "faqs": [
    { "question": "Does Dr. Shorav perform IR procedures?", "answer": "Yes, he specializes in advanced interventional radiology." },
    { "question": "Does he handle liver/biliary interventions?", "answer": "Yes, he has PDCC training from ILBS Delhi." },
    { "question": "Has he won international awards?", "answer": "Yes, including awards from Korean Congress of Radiology." }
  ]
},
{
  "slug": "dr-abhinav-debanath",
  "name": "Dr. Abhinav Debanath",
  "specialty": "Neurosurgery",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Neurosurgery",
  "degree": "MBBS | MS (General Surgery) | M.Ch (Neurosurgery) | DrNB (Neurosurgery)",
  "about": "Dr. Abhinav Debanath is a skilled neurosurgeon experienced in cranial and spinal surgeries, endoscopic skull base procedures, neurotrauma and endovascular interventions. He has worked at Max Hospital Saket, YCM Hospital Pune and other leading institutes, assisting in advanced neuronavigation, O-Arm–guided spine surgeries and vascular neurosurgery. His expertise includes brain tumors, spinal disorders, skull base surgery and minimally invasive neurosurgical procedures.",
  "medicalProblems": [
    { "title": "Brain Tumors", "description": "Gliomas, meningiomas and skull base tumors." },
    { "title": "Spinal Disorders", "description": "Slip disc, cervical/lumbar spondylosis and spinal stenosis." },
    { "title": "Neurovascular Conditions", "description": "Aneurysms, AVMs and vascular malformations." },
    { "title": "Neurotrauma", "description": "Head injury, spine injury and emergency neurosurgery." }
  ],
  "procedures": [
    { "title": "Minimally Invasive Spine Surgery", "description": "Discectomy, fusion and decompression." },
    { "title": "Endoscopic Skull Base Surgery", "description": "Pituitary tumors and CSF leak repair." },
    { "title": "Endovascular Procedures", "description": "Aneurysm coiling and flow diverter placement." },
    { "title": "Cranial Neurosurgery", "description": "Tumors, hemorrhage evacuation and trauma surgery." }
  ],
  "faqs": [
    { "question": "Does Dr. Debanath perform minimally invasive spine surgery?", "answer": "Yes, he is trained in MIS and endoscopic spine techniques." },
    { "question": "Does he treat brain tumors?", "answer": "Yes, including skull base and complex cranial tumors." },
    { "question": "Is he trained in endovascular neurosurgery?", "answer": "Yes, he has assisted in aneurysm coiling and vascular procedures." }
  ]
},
{
  "slug": "dr-khushboo-jha",
  "name": "Dr. Khushboo Jha",
  "specialty": "Dermatology, Laser & Aesthetic Medicine",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Dermatology",
  "degree": "MBBS | MD (Dermatology) | Fellowship in Aesthetic Medicine (USA)",
  "about": "Dr. Khushboo Jha is a specialist dermatologist with advanced training in laser and aesthetic medicine from Los Angeles, New York and AAAM Texas. She is skilled in hair transplant (modified FUE), laser treatments, anti-aging procedures, pigmentation management, acne scar therapy, fillers, Botox and cosmetic dermatology. She combines global expertise with precise clinical care to deliver natural aesthetic results.",
  "medicalProblems": [
    { "title": "Acne & Scars", "description": "Advanced acne and post-acne scar management." },
    { "title": "Pigmentation", "description": "Melasma, freckles and uneven skin tone." },
    { "title": "Hair Loss", "description": "Medical treatment and hair transplant solutions." },
    { "title": "Skin Allergies", "description": "Dermatitis, eczema and allergic skin reactions." }
  ],
  "procedures": [
    { "title": "Hair Transplant (FUE)", "description": "Modified FUE hair transplant technique." },
    { "title": "Laser Hair Reduction", "description": "Advanced laser systems for painless hair removal." },
    { "title": "CO2 Laser", "description": "Skin resurfacing for scars and rejuvenation." },
    { "title": "Botox & Fillers", "description": "Anti-aging and facial contouring procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Jha perform hair transplants?", "answer": "Yes, she specializes in FUE hair transplantation." },
    { "question": "Does she do laser resurfacing?", "answer": "Yes, she performs CO2 laser and advanced laser procedures." },
    { "question": "Does she offer anti-aging treatments?", "answer": "Yes, including Botox, fillers and thread lifts." }
  ]
},
{
  "slug": "dr-muzzafar-hakeem",
  "name": "Dr. Muzzafar Mohi-Ud-Din Hakeem",
  "specialty": "Neurology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Neurology",
  "degree": "MBBS | Post Graduate (Internal Medicine) | DrNB (Neurology)",
  "about": "Dr. Muzzafar Mohi-Ud-Din Hakeem is a neurologist skilled in diagnosing and managing neurological emergencies and chronic disorders. With extensive training at Batra Hospital, GIPMER New Delhi and GMC Srinagar, he is experienced in stroke management, neuro-electrophysiology, headache medicine and movement disorder care. He provides comprehensive neurological evaluation and emergency neuro care.",
  "medicalProblems": [
    { "title": "Stroke & Paralysis", "description": "Emergency stroke care and thrombolysis." },
    { "title": "Headache & Migraine", "description": "Advanced management of chronic headaches." },
    { "title": "Movement Disorders", "description": "Parkinson’s disease, tremors and dystonia." },
    { "title": "Neuropathy & Seizures", "description": "Evaluation and long-term management." }
  ],
  "procedures": [
    { "title": "Lumbar Puncture", "description": "Diagnostic CSF analysis." },
    { "title": "Botox for Neurological Disorders", "description": "For blepharospasm and facial spasms." },
    { "title": "Nerve Conduction Studies", "description": "NCV, EMG and electrophysiological evaluation." },
    { "title": "Neuroimaging Interpretation", "description": "CT/MRI reading for accurate diagnosis." }
  ],
  "faqs": [
    { "question": "Does Dr. Hakeem treat stroke cases?", "answer": "Yes, including acute thrombolysis." },
    { "question": "Does he perform neurological Botox?", "answer": "Yes, for movement disorders and spasms." },
    { "question": "Does he interpret EMG/NCV?", "answer": "Yes, he is trained in electrophysiology interpretation." }
  ]
},
{
  "slug": "dr-sharad-kumar-anand",
  "name": "Dr. Sharad Kumar Anand",
  "specialty": "Cardiac Anaesthesia",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Cardiac Anaesthesia",
  "degree": "MBBS | MD (Anaesthesia)",
  "about": "Dr. Sharad Kumar Anand is a senior cardiac anesthesiologist with over two decades of experience in managing anesthesia for complex cardiac surgeries including CABG (on and off pump), valve repair, valve replacement and congenital heart surgeries. He has served as HOD of Cardiac Anaesthesia at Delhi Heart & Lung Institute and Yashoda Hospital. He is highly skilled in ventilation strategies, cath-lab anesthesia and perioperative cardiac care.",
  "medicalProblems": [
    { "title": "Cardiac Surgery Care", "description": "Anaesthesia support for complex cardiac surgeries." },
    { "title": "Critical Care Needs", "description": "Management of ventilator and hemodynamics in critical patients." },
    { "title": "Congenital Heart Diseases", "description": "Anaesthesia for pediatric and adult congenital heart repairs." },
    { "title": "High-risk Surgeries", "description": "Anaesthesia for high-risk and multi-organ compromised patients." }
  ],
  "procedures": [
    { "title": "Cardiac Anaesthesia", "description": "CABG, valve surgeries and congenital heart procedures." },
    { "title": "Cath-Lab Anaesthesia", "description": "Support for angioplasty, TAVR and device closures." },
    { "title": "Ventilator Management", "description": "Advanced respiratory and ICU management." },
    { "title": "General Anaesthesia", "description": "Anaesthesia for general and laparoscopic surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Anand handle CABG anesthesia?", "answer": "Yes, he has years of expertise in CABG and valve surgeries." },
    { "question": "Does he manage pediatric cardiac anesthesia?", "answer": "Yes, he handles congenital cardiac cases as well." },
    { "question": "Does he manage cath-lab procedures?", "answer": "Yes, including angioplasty and TAVR." }
  ]
},
{
  "slug": "dr-shreya-garg",
  "name": "Dr. Shreya Garg",
  "specialty": "Facial Plastic Surgery & ENT",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "4+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Facial Plastic & ENT Surgery",
  "degree": "MBBS | MS (ENT) | Fellowships (UK & Brazil)",
  "about": "Dr. Shreya Garg is a Facial Plastic and ENT surgeon with advanced training from the UK and Brazil. Her expertise includes rhinoplasty, facial rejuvenation, periorbital surgery, ENT surgery, cochlear implants and facial reconstruction. With training at AIIMS Delhi, MAMC and UMC/Otoface Brazil, she integrates global surgical techniques with a patient-first approach.",
  "medicalProblems": [
    { "title": "Facial Cosmetic Concerns", "description": "Nasal shape issues, aging face, eyelid concerns." },
    { "title": "ENT Disorders", "description": "Sinusitis, throat disorders and hearing loss." },
    { "title": "Pediatric ENT", "description": "Adenoid, tonsils and airway issues in children." },
    { "title": "Facial Trauma", "description": "Fractures, deformities and reconstructive needs." }
  ],
  "procedures": [
    { "title": "Rhinoplasty", "description": "Cosmetic and functional nose surgery." },
    { "title": "Facial Rejuvenation", "description": "Anti-aging surgical and minimally invasive techniques." },
    { "title": "Cochlear Implant Surgery", "description": "Hearing restoration surgeries." },
    { "title": "ENT Surgeries", "description": "Sinus surgery, tonsillectomy and airway procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Shreya perform rhinoplasty?", "answer": "Yes, she specializes in both cosmetic and functional rhinoplasty." },
    { "question": "Does she perform facial rejuvenation?", "answer": "Yes, including periorbital and facial cosmetic procedures." },
    { "question": "Does she manage ENT disorders?", "answer": "Yes, she treats sinus, hearing and throat conditions." }
  ]
},
{
  "slug": "dr-shilakha-chaman",
  "name": "Dr. Shilakha Chaman",
  "specialty": "Paediatrics",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "9+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Paediatrics",
  "degree": "MBBS | MD (Paediatrics)",
  "about": "Dr. Shilakha Chaman is an experienced pediatrician specializing in child growth, nutrition, vaccination, neonatology and management of common childhood diseases. With training from GMC Jammu and GMC Srinagar, she has worked at several reputed hospitals including Max Noida, Metro Hospital, SSB Hospital and Sharda University. She provides comprehensive care for infants, children and adolescents.",
  "medicalProblems": [
    { "title": "Growth & Development Issues", "description": "Delayed milestones and developmental disorders." },
    { "title": "General Infections", "description": "Cough, cold, fever, flu and gastrointestinal infections." },
    { "title": "Pediatric Asthma & Allergy", "description": "Management of recurrent cough, wheezing and allergies." },
    { "title": "Child Nutrition", "description": "Diet planning and nutrition for children and teens." }
  ],
  "procedures": [
    { "title": "Vaccinations", "description": "Complete immunization for newborns to adolescents." },
    { "title": "Neonatal Care", "description": "Newborn examination and growth monitoring." },
    { "title": "Asthma Management", "description": "Nebulization and long-term asthma therapy." },
    { "title": "Dehydration Treatment", "description": "ORS, IV fluids and acute care." }
  ],
  "faqs": [
    { "question": "Does Dr. Shilakha handle infant care?", "answer": "Yes, she is experienced in neonatology and newborn care." },
    { "question": "Does she provide vaccinations?", "answer": "Yes, complete vaccination services are available." },
    { "question": "Does she treat childhood asthma?", "answer": "Yes, including allergies and recurrent cough." }
  ]
},
{
  "slug": "dr-alka-goyal",
  "name": "Dr. Alka Goyal",
  "specialty": "Anaesthesia & Critical Care",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Anaesthesia",
  "degree": "MBBS | Senior Residency – AIIMS Delhi & PGI Chandigarh",
  "about": "Dr. Alka Goyal is an experienced consultant in anaesthesia with extensive exposure to critical care, ICU management and anesthesia for high-risk surgeries. She has worked at leading hospitals including AIIMS Delhi, PGI Chandigarh, QRG Health City and several medical colleges. She is proficient in anesthesia for general, laparoscopic, orthopedic and emergency procedures, along with ventilator and ICU management.",
  "medicalProblems": [
    { "title": "Preoperative Evaluation", "description": "Assessment and optimization before surgery." },
    { "title": "Pain & Anaesthesia Needs", "description": "Anesthesia administration for surgeries and procedures." },
    { "title": "Critical Care Conditions", "description": "Ventilator support, shock and multi-organ care." },
    { "title": "Emergency Surgical Cases", "description": "Rapid and safe anesthesia support for emergencies." }
  ],
  "procedures": [
    { "title": "General Anaesthesia", "description": "Anesthesia for major and minor surgeries." },
    { "title": "Regional Anaesthesia", "description": "Spinal, epidural and nerve blocks." },
    { "title": "ICU & Ventilator Management", "description": "Advanced respiratory and critical care support." },
    { "title": "Perioperative Care", "description": "Monitoring and stabilization during surgery." }
  ],
  "faqs": [
    { "question": "Does Dr. Alka provide anesthesia for laparoscopic surgeries?", "answer": "Yes, she has experience in anesthesia for laparoscopic and open procedures." },
    { "question": "Does she manage ICU patients?", "answer": "Yes, she has extensive critical care experience at AIIMS & PGI." },
    { "question": "Does she perform regional anesthesia?", "answer": "Yes, she is skilled in nerve blocks, spinal and epidural anesthesia." }
  ]
},
{
  "slug": "chakshita-mangla",
  "name": "Chakshita Mangla",
  "specialty": "Clinical Psychology",
  "hospital": "Metro Heart Institute with Multispeciality",
  "experience": "5+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Clinical Psychologist",
  "degree": "M.A (Clinical Psychology) | M.Phil (Clinical Psychology)",
  "about": "Chakshita Mangla is a trained Clinical Psychologist specializing in emotional well-being, behavioral disorders, relationship issues, anxiety, stress and psychological assessments. With professional experience at Red Cross De-addiction Centre and Ahmedabad Mental Health Hospital, she brings an evidence-based and empathetic approach to mental health care. Her research focuses on mindfulness, interpersonal relationships and adolescent emotional competence.",
  "medicalProblems": [
    { "title": "Anxiety & Stress", "description": "Therapy for stress, worry, panic and emotional overwhelm." },
    { "title": "Depression & Mood Issues", "description": "Management through psychotherapy and behavioral techniques." },
    { "title": "Relationship Issues", "description": "Counseling for families, couples and individuals." },
    { "title": "Adolescent Concerns", "description": "Emotional development, behavioral issues and confidence-building." }
  ],
  "procedures": [
    { "title": "Psychotherapy", "description": "CBT, mindfulness-based therapy and talk therapy." },
    { "title": "Psychological Assessments", "description": "IQ tests, personality assessments and diagnostic evaluations." },
    { "title": "Stress Management Therapy", "description": "Relaxation training and coping strategies." },
    { "title": "De-addiction Counseling", "description": "Support for substance-use & behavioral addictions." }
  ],
  "faqs": [
    { "question": "Does Chakshita Mangla provide therapy for anxiety?", "answer": "Yes, she specializes in anxiety and stress management." },
    { "question": "Does she conduct psychological assessments?", "answer": "Yes, including IQ, personality and diagnostic evaluations." },
    { "question": "Does she work with adolescents?", "answer": "Yes, she has expertise in adolescent mental health and behavior." }
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
