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
  "slug": "dr-soumya-khanna",
  "name": "Dr. Soumya Khanna",
  "specialty": "Aesthetic & Reconstructive Breast Surgery",
  "hospital": "Max Hospital – Saket West | Panchsheel Park | Saket East",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Consultant – Clinical Lead, Breast Plastic Surgery & Lymphedema",
  "degree": "MBBS | MS (General Surgery) | MCh (Plastic Surgery, CMC Vellore) | DNB (Plastic Surgery)",
  "about": "Dr. Soumya Khanna is a leading breast reconstruction and aesthetic plastic surgeon with expertise in breast reduction, lymphedema surgery, facial aesthetics, trauma reconstruction and advanced laser procedures. She is internationally trained and works as a senior plastic surgeon at Max Healthcare.",
  "medicalProblems": [
    { "title": "Breast Deformities", "description": "Congenital or post-cancer breast reconstruction." },
    { "title": "Macromastia (Large Breasts)", "description": "Breast reduction for pain and discomfort." },
    { "title": "Lymphedema", "description": "Surgical and conservative management." },
    { "title": "Facial Aesthetic Concerns", "description": "Cosmetic corrections and rejuvenation." }
  ],
  "procedures": [
    { "title": "Breast Reconstruction Surgery", "description": "Aesthetic and reconstructive procedures post-cancer or congenital deformities." },
    { "title": "Breast Reduction & Augmentation", "description": "Shaping, size correction and symmetry procedures." },
    { "title": "Lymphedema Surgery", "description": "Advanced management of limb swelling." },
    { "title": "Facial Cosmetic Surgery", "description": "Rejuvenation and aesthetic enhancement." }
  ],
  "faqs": [
    { "question": "Does Dr. Soumya specialize in breast reconstruction?", "answer": "Yes, she is a leading breast reconstruction and lymphedema surgeon." },
    { "question": "Does she perform facial cosmetic surgeries?", "answer": "Yes, she offers a range of facial aesthetic and rejuvenation procedures." },
    { "question": "Is she associated with Max Healthcare?", "answer": "Yes, she is a Principal Consultant at Max Healthcare." }
  ]
},
{
  "slug": "dr-sunil-choudhary",
  "name": "Dr. Sunil Choudhary",
  "specialty": "Aesthetic & Reconstructive Plastic Surgery",
  "hospital": "Max Hospital – Saket West",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman & Chief – Max Institute of Reconstructive, Aesthetic, Cleft & Craniofacial Surgery (MIRACLES)",
  "degree": "MBBS | MS (General Surgery) | Fellow EBOPRAS | OTDS Accreditation (UK) | Fellowships in UK & New Zealand",
  "about": "Dr. Sunil Choudhary is one of India's most respected plastic surgeons with expertise in aesthetic, reconstructive, craniofacial and microsurgery. With international experience in the UK and New Zealand, he has transformed thousands of lives through advanced plastic surgery techniques.",
  "medicalProblems": [
    { "title": "Facial Deformities", "description": "Cosmetic and reconstructive correction." },
    { "title": "Breast Deformities", "description": "Aesthetic and reconstructive breast surgery." },
    { "title": "Cleft & Craniofacial Disorders", "description": "Congenital and trauma-related issues." },
    { "title": "Body Contouring Needs", "description": "Post-weight loss and aesthetic reshaping." }
  ],
  "procedures": [
    { "title": "Craniofacial Surgery", "description": "Advanced reconstruction for congenital and acquired deformities." },
    { "title": "Aesthetic Breast Surgery", "description": "Augmentation, lift and reconstruction." },
    { "title": "Microsurgery", "description": "Complex reconstructive procedures." },
    { "title": "Body Contouring", "description": "Liposuction, tummy tuck and reshaping." }
  ],
  "faqs": [
    { "question": "Is Dr. Choudhary internationally trained?", "answer": "Yes, he trained extensively in the UK and New Zealand." },
    { "question": "Does he perform craniofacial surgery?", "answer": "Yes, he is one of the pioneers in craniofacial reconstruction." },
    { "question": "Is he a top plastic surgeon in India?", "answer": "Yes, he is consistently recognized among the best in the country." }
  ]
},
{
  "slug": "dr-amina-mobashir",
  "name": "Dr. Amina Mobashir",
  "specialty": "Pulmonology & Allergy",
  "hospital": "Max Hospital – Saket West | Saket Smart",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Pulmonology & Critical Care",
  "degree": "MBBS | DNB (Respiratory Medicine) | IDCCM | EDRM (ERS)",
  "about": "Dr. Amina Mobashir is an accomplished pulmonologist with expertise in respiratory diseases, allergy management and critical care. She has worked with leading hospitals and has received multiple academic awards in the field of respiratory medicine.",
  "medicalProblems": [
    { "title": "Asthma & Allergies", "description": "Diagnosis and long-term management." },
    { "title": "COPD", "description": "Breathlessness and chronic respiratory symptoms." },
    { "title": "Lung Infections", "description": "Pneumonia, TB and respiratory infections." },
    { "title": "Sleep Disorders", "description": "Sleep apnea and breathing-related issues." }
  ],
  "procedures": [
    { "title": "Pulmonary Function Testing", "description": "Assessment of lung capacity and airway disease." },
    { "title": "Bronchoscopy", "description": "Advanced airway diagnostics." },
    { "title": "Allergy Testing", "description": "Skin tests and immunotherapy guidance." },
    { "title": "Critical Care Procedures", "description": "Ventilation and ICU respiratory support." }
  ],
  "faqs": [
    { "question": "Does Dr. Amina treat asthma?", "answer": "Yes, she specializes in asthma and allergy management." },
    { "question": "Is she trained in critical care?", "answer": "Yes, she holds IDCCM certification in intensive care." },
    { "question": "Which hospitals is she associated with?", "answer": "She practices at Max Saket West and Max Saket Smart." }
  ]
},
{
  "slug": "dr-sujoy-bhattacharjee",
  "name": "Dr. Sujoy Bhattacharjee",
  "specialty": "Robotic Joint Replacement & Orthopaedics",
  "hospital": "Max Hospital – Panchsheel Park | Saket East",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Robotic Joint Replacement",
  "degree": "MBBS | MS (Orthopaedics) | MCh (Orthopaedics) | Fellowships (France, UK, USA, Australia, Germany)",
  "about": "Dr. Sujoy Bhattacharjee is a globally recognized robotic joint replacement expert with more than 25,000 joint surgeries and multiple world records. He specializes in cruciate-retaining robotic knee replacement, hip surgery, AI-assisted joint surgery and revision arthroplasty.",
  "medicalProblems": [
    { "title": "Severe Knee Arthritis", "description": "Advanced robotic knee replacement solutions." },
    { "title": "Hip Joint Disorders", "description": "Total hip replacement and revision surgeries." },
    { "title": "Sports Injuries", "description": "Arthroscopy and ligament reconstruction." },
    { "title": "Spinal Trauma & Degeneration", "description": "Evaluation and surgical management." }
  ],
  "procedures": [
    { "title": "Robotic Knee Replacement", "description": "World’s first CR knee replacement with active robot." },
    { "title": "Robotic Partial Knee Replacement", "description": "Precise tissue-preserving surgery." },
    { "title": "Total Hip Replacement", "description": "Advanced implant-based reconstruction." },
    { "title": "AI/AR Guided Joint Surgery", "description": "Modern navigation and precision surgeries." }
  ],
  "faqs": [
    { "question": "Is Dr. Sujoy a robotic surgery specialist?", "answer": "Yes, he is a global leader in robotic joint replacement." },
    { "question": "How many surgeries has he performed?", "answer": "He has performed over 25,000 joint surgeries." },
    { "question": "Does he perform revision surgeries?", "answer": "Yes, he is an expert in complex revision hip and knee surgeries." }
  ]
},
{
  "slug": "dr-sumit-mrig",
  "name": "Dr. Sumit Mrig",
  "specialty": "ENT & Cochlear Implants",
  "hospital": "Max Hospital – Dwarka | Saket Smart | Saket East",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Unit Head – ENT",
  "degree": "MBBS | MS (ENT) | DNB (ENT)",
  "about": "Dr. Sumit Mrig is one of India’s leading ENT surgeons and among the youngest cochlear implant specialists in Asia. With 700+ implants and patients from 8 countries, he is known for complex otology, skull base surgery, snoring solutions, vertigo management and cochlear implant training.",
  "medicalProblems": [
    { "title": "Hearing Loss", "description": "Cochlear, BAHA, Bonebridge solutions." },
    { "title": "Snoring & Sleep Apnea", "description": "Surgical and non-surgical management." },
    { "title": "Vertigo & Balance Disorders", "description": "Comprehensive diagnosis and therapy." },
    { "title": "Salivary Gland Stones", "description": "Sialendoscopy and minimally invasive removal." }
  ],
  "procedures": [
    { "title": "Cochlear Implant Surgery", "description": "700+ implants across pediatric and adult patients." },
    { "title": "Skull Base Surgery", "description": "Complex anterior and lateral skull base operations." },
    { "title": "Advanced Otology Procedures", "description": "Reconstruction and hearing restoration." },
    { "title": "Snoring & Sleep Apnea Surgery", "description": "Airway correction procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Mrig experienced in cochlear implants?", "answer": "Yes, he has performed over 700 cochlear implant surgeries." },
    { "question": "Does he treat vertigo?", "answer": "Yes, vertigo treatment is one of his key areas of expertise." },
    { "question": "Does he practice at multiple Max hospitals?", "answer": "Yes, he practices at Dwarka, Saket Smart and Saket East." }
  ]
},
{
  "slug": "dr-vandana-soni",
  "name": "Dr. Vandana Soni",
  "specialty": "Laparoscopic, Robotic & Bariatric Surgery",
  "hospital": "Max Hospital – Gurugram | Saket East",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Max Institute of Laparoscopic, Robotic & Bariatric Surgery",
  "degree": "MBBS | MS (General Surgery)",
  "about": "Dr. Vandana Soni is a pioneer in laparoscopic and bariatric surgery with over three decades of experience. She has been associated with Sir Ganga Ram Hospital and Max Healthcare, performing advanced minimal access, obesity, hernia, GERD, thyroid, and scarless neck surgeries.",
  "medicalProblems": [
    { "title": "Obesity", "description": "Surgical and metabolic weight-loss solutions." },
    { "title": "Hernia (All Types)", "description": "Advanced laparoscopic and endoscopic repair." },
    { "title": "Gallbladder Disorders", "description": "Laparoscopic cholecystectomy and management." },
    { "title": "Anorectal Problems", "description": "Piles, fissure and fistula management." }
  ],
  "procedures": [
    { "title": "Bariatric Surgery", "description": "Laparoscopic obesity management procedures." },
    { "title": "Scarless Neck Surgery", "description": "Endoscopic thyroid and parathyroid procedures." },
    { "title": "Hernia Repair", "description": "Laparoscopic and endoscopic hernia solutions." },
    { "title": "Gallbladder Surgery", "description": "Minimal access cholecystectomy." }
  ],
  "faqs": [
    { "question": "Does Dr. Soni perform bariatric surgery?", "answer": "Yes, she is a senior expert in obesity and metabolic surgery." },
    { "question": "Does she perform scarless neck surgery?", "answer": "Yes, she specializes in endoscopic thyroid and parathyroid surgery." },
    { "question": "How long has she been practicing?", "answer": "She has over 30 years of surgical experience." }
  ]
},
{
  "slug": "dr-pradeep-chowbey",
  "name": "Dr. Pradeep Chowbey",
  "specialty": "Laparoscopic, Endoscopic & Bariatric Surgery",
  "hospital": "Max Hospital – Saket East",
  "experience": "49+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Group Chairman – Max Institute of Laparoscopic, Endoscopic, Bariatric & Gastrointestinal Surgery",
  "degree": "MBBS | MS | FRCS (London) | FACS | FMAS | FALS | FICS | FAIS | FIMSA | MNAMS",
  "about": "Dr. Pradeep Chowbey is one of the world’s most renowned laparoscopic surgeons with over 98,000 surgeries completed and 20,000+ surgeons trained globally. He pioneered endoscopic hernia repair, VAAFT for fistula, and advanced metabolic & bariatric surgery.",
  "medicalProblems": [
    { "title": "Gallbladder Disorders", "description": "Advanced minimal access surgical solutions." },
    { "title": "Hernias (All Types)", "description": "Expert hernia repair using TEP/TAPP." },
    { "title": "Obesity & Metabolic Syndrome", "description": "Surgical weight-loss solutions." },
    { "title": "Anorectal Conditions", "description": "Advanced techniques like VAAFT & MAFT." }
  ],
  "procedures": [
    { "title": "Endoscopic Hernia Repair", "description": "Globally recognized TEP/TAPP techniques." },
    { "title": "Bariatric Surgery", "description": "Metabolic and weight-loss procedures." },
    { "title": "VAAFT / MAFT", "description": "Minimally invasive fistula treatment." },
    { "title": "Advanced GI Surgery", "description": "Hepato-biliary & pancreatic procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Chowbey internationally recognized?", "answer": "Yes, he is a global pioneer in laparoscopic and bariatric surgery." },
    { "question": "Does he perform advanced fistula surgery?", "answer": "Yes, he introduced VAAFT/MAFT in India." },
    { "question": "How many surgeries has he performed?", "answer": "He has completed nearly 98,300 surgeries." }
  ]
},
{
  "slug": "dr-rayaz-ahmed",
  "name": "Dr. Rayaz Ahmed",
  "specialty": "Haematology & Bone Marrow Transplant",
  "hospital": "Max Hospital – Saket Smart | Saket East",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – Haematology & Bone Marrow Transplant",
  "degree": "MBBS | MD (Pathology) | DM (Hematology, CMC Vellore)",
  "about": "Dr. Rayaz Ahmed is one of India’s leading hematologists with over 1000 bone marrow transplants completed. He manages leukemia, lymphoma, myeloma, aplastic anemia, thalassemia, sickle cell anemia and rare blood disorders.",
  "medicalProblems": [
    { "title": "Leukemia", "description": "AML, ALL, CML, CLL diagnosis and treatment." },
    { "title": "Lymphoma", "description": "Hodgkin and Non-Hodgkin lymphomas." },
    { "title": "Aplastic Anemia", "description": "Stem cell–based treatment options." },
    { "title": "Thalassemia & Sickle Cell", "description": "Advanced transplant-based therapies." }
  ],
  "procedures": [
    { "title": "Autologous BMT", "description": "Self-stem cell transplantation." },
    { "title": "Allogeneic BMT", "description": "MSD, MUD and Haplo transplants." },
    { "title": "Chemotherapy Protocols", "description": "Advanced hematologic cancer treatment." },
    { "title": "Molecular Testing", "description": "Genetic evaluation for blood disorders." }
  ],
  "faqs": [
    { "question": "Has Dr. Rayaz performed BMTs?", "answer": "Yes, he has performed over 1000 transplants." },
    { "question": "Does he treat thalassemia?", "answer": "Yes, thalassemia and sickle cell anemia are key areas of his expertise." },
    { "question": "Is he trained at CMC Vellore?", "answer": "Yes, he completed his DM in Hematology at CMC Vellore." }
  ]
},
{
  "slug": "dr-harit-chaturvedi",
  "name": "Dr. Harit Chaturvedi",
  "specialty": "Surgical Oncology",
  "hospital": "Max Hospital – Saket Smart | Shalimar Bagh | Vaishali | Patparganj | Saket East",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Max Institute of Cancer Care",
  "degree": "MBBS | MS (General Surgery) | MCh (Surgical Oncology)",
  "about": "Dr. Harit Chaturvedi is one of India's most respected cancer surgeons and the chairperson of Max Institute of Cancer Care. With decades of experience, he specializes in breast cancer, thoracic oncology, head & neck cancers and robotic oncological surgery.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Comprehensive surgical and reconstructive management." },
    { "title": "Head & Neck Tumors", "description": "Thyroid, oral, and throat cancers." },
    { "title": "Thoracic Cancers", "description": "Lung and mediastinal tumor management." },
    { "title": "Gastrointestinal Cancers", "description": "Colon, stomach and hepatobiliary cancers." }
  ],
  "procedures": [
    { "title": "Cancer Surgery", "description": "Advanced oncologic resections." },
    { "title": "Robotic Cancer Surgery", "description": "Precision-based minimally invasive tumor removal." },
    { "title": "Head & Neck Surgery", "description": "Microvascular and reconstructive procedures." },
    { "title": "Thoracic Surgery", "description": "Lung & chest oncology procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Harit a surgical oncologist?", "answer": "Yes, he is one of India’s leading surgical oncologists." },
    { "question": "Does he perform robotic cancer surgery?", "answer": "Yes, he is an expert in robotic oncology procedures." },
    { "question": "Is he associated with Max Cancer Care?", "answer": "Yes, he is the Chairman of Max Institute of Cancer Care." }
  ]
},
{
  "slug": "dr-shefali-sardana",
  "name": "Dr. Shefali Sardana",
  "specialty": "Medical Oncology",
  "hospital": "Max Hospital – Saket Smart | Saket East",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Medical Oncology",
  "degree": "MBBS | MD (Medicine) | DNB (Medical Oncology)",
  "about": "Dr. Shefali Sardana is a dedicated medical oncologist specializing in breast, gastrointestinal, gynecologic, thoracic and urologic cancers. She has rich experience across Max Hospitals and Apollo Hospital and is actively involved in clinical research and oncology leadership.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Systemic therapy and long-term management." },
    { "title": "GI & Hepatobiliary Cancers", "description": "Chemotherapy and immunotherapy." },
    { "title": "Gynecologic Cancers", "description": "Ovarian, cervical and endometrial cancers." },
    { "title": "Thoracic Cancers", "description": "Lung and mediastinal tumors." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Advanced systemic cancer treatments." },
    { "title": "Immunotherapy", "description": "Immune-directed cancer therapy." },
    { "title": "Targeted Therapy", "description": "Gene and mutation-guided cancer medication." },
    { "title": "Hormonal Therapy", "description": "Breast and gynecologic cancer management." }
  ],
  "faqs": [
    { "question": "Does Dr. Shefali treat breast cancer?", "answer": "Yes, breast oncology is one of her primary specialities." },
    { "question": "Does she provide immunotherapy?", "answer": "Yes, she offers the latest immunotherapy treatments." },
    { "question": "Is she associated with Max Saket?", "answer": "Yes, she works at Max Smart and Max Saket East." }
  ]
},
{
  "slug": "dr-nagender-sharma",
  "name": "Dr. Nagender Sharma",
  "specialty": "Medical Oncology",
  "hospital": "Max Hospital – Gurugram | Saket Smart | Saket East",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Medical Oncology",
  "degree": "MBBS | MD (Medicine) | DM (Medical Oncology, Cancer Institute Adyar) | DNB (Medical Oncology) | ESMO Certified",
  "about": "Dr. Nagender Sharma is an experienced medical oncologist with expertise across thoracic, breast, GI, genitourinary, gynecologic and head & neck cancers. He has trained at India’s leading cancer institutions and participated as a Co-Principal Investigator in major international oncology trials.",
  "medicalProblems": [
    { "title": "Thoracic & Lung Cancer", "description": "Comprehensive chemotherapy and targeted therapy." },
    { "title": "Breast Cancer", "description": "Advanced systemic and hormonal treatments." },
    { "title": "Gastrointestinal Cancers", "description": "GI and hepatobiliary malignancy care." },
    { "title": "Head & Neck Malignancy", "description": "Systemic therapy for complex cancers." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Evidence-based systemic cancer treatments." },
    { "title": "Immunotherapy", "description": "Checkpoint inhibitors and novel agents." },
    { "title": "Targeted Therapy", "description": "Gene mutation–guided personalized therapy." },
    { "title": "Hormonal Therapy", "description": "Breast and reproductive cancer management." }
  ],
  "faqs": [
    { "question": "Does Dr. Nagender Sharma treat lung and breast cancers?", "answer": "Yes, these are among his primary specialties." },
    { "question": "Is he involved in international research studies?", "answer": "Yes, he is Co-Principal Investigator in TALAPRO-III trial." },
    { "question": "Where does he practice?", "answer": "At Max Hospital Gurugram, Saket Smart, and Saket East." }
  ]
},
{
  "slug": "dr-kanika-batra-modi",
  "name": "Dr. Kanika Batra Modi",
  "specialty": "Gynecologic Oncology & Robotic Surgery",
  "hospital": "Max Hospital – Saket Smart | Saket East",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director & Clinical Lead – Gynae Oncology",
  "degree": "MBBS | DNB-MS | Fellowship in Gynecologic Oncology (RGCIRC) | ESGO Fellow | IGCS Fellow",
  "about": "Dr. Kanika Batra Modi is a highly accomplished gynecologic oncologist and robotic surgeon with global training across Germany, Australia, and the USA. She specializes in advanced minimally invasive cancer surgery, including robotic, laparoscopic and HIPEC procedures.",
  "medicalProblems": [
    { "title": "Cervical Cancer", "description": "Advanced minimally invasive surgical management." },
    { "title": "Ovarian Cancer", "description": "Cytoreductive surgery and HIPEC procedures." },
    { "title": "Endometrial Cancer", "description": "Comprehensive diagnostic and surgical care." },
    { "title": "Vulvar & Vaginal Cancers", "description": "Radical gynecologic oncology management." }
  ],
  "procedures": [
    { "title": "Robotic Cancer Surgery", "description": "Precision oncologic procedures using da Vinci robotic system." },
    { "title": "Laparoscopic Gynae Oncology Surgery", "description": "Minimally invasive cancer surgery." },
    { "title": "HIPEC", "description": "Hyperthermic intraperitoneal chemotherapy for ovarian cancer." },
    { "title": "Complex Gynecological Surgery", "description": "Advanced pelvic cancer resections." }
  ],
  "faqs": [
    { "question": "Does Dr. Kanika perform robotic gynecologic cancer surgery?", "answer": "Yes, she is an expert robotic surgeon and proctor." },
    { "question": "Is she internationally trained?", "answer": "Yes, she has trained in Germany, Sydney, and Mayo Clinic (USA)." },
    { "question": "Does she manage advanced ovarian cancer?", "answer": "Yes, including HIPEC and cytoreduction." }
  ]
},
{
  "slug": "dr-aditi-chaturvedi",
  "name": "Dr. Aditi Chaturvedi",
  "specialty": "Breast Surgical Oncology",
  "hospital": "Max Hospital – Dwarka | Saket Smart | Gurugram | Saket East",
  "experience": "7+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Consultant – Breast and Oncoplastic Surgery",
  "degree": "MBBS | MS (General Surgery, AIIMS) | MCh (Surgical Oncology, Tata Memorial Hospital)",
  "about": "Dr. Aditi Chaturvedi is a highly skilled breast and oncoplastic surgeon with extensive training at Tata Memorial Hospital and AIIMS. She specializes in breast cancer surgery, breast conservation, oncoplasty, and women’s cancer awareness.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Comprehensive breast oncology and surgical care." },
    { "title": "Benign Breast Diseases", "description": "Evaluation and surgical management." },
    { "title": "High-Risk Breast Conditions", "description": "Preventive and risk-reduction strategies." },
    { "title": "Breast Reconstruction Needs", "description": "Oncoplastic and cosmetic breast procedures." }
  ],
  "procedures": [
    { "title": "Breast Cancer Surgery", "description": "Oncoplastic, breast-conserving and radical surgery." },
    { "title": "Sentinel Lymph Node Biopsy", "description": "Minimally invasive nodal assessment." },
    { "title": "Oncoplastic Reconstruction", "description": "Aesthetic reconstruction post tumor removal." },
    { "title": "Chemoport Insertion & Breast Procedures", "description": "Supportive surgical oncology procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Aditi specialize in breast cancer surgery?", "answer": "Yes, she is a specialist in breast surgical oncology and oncoplasty." },
    { "question": "Has she trained internationally?", "answer": "Yes, including training at Memorial Sloan Kettering (USA)." },
    { "question": "Does she offer breast reconstruction?", "answer": "Yes, she is trained in advanced oncoplastic techniques." }
  ]
},
{
  "slug": "dr-rohit-nayyar",
  "name": "Dr. Rohit Nayyar",
  "specialty": "Surgical Oncology",
  "hospital": "Max Hospital – Saket East | Saket Smart | Gurugram",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – Surgical Oncology",
  "degree": "MBBS | MS (General Surgery) | MCh (Surgical Oncology) | Fellowships in USA, France & UK",
  "about": "Dr. Rohit Nayyar is a senior surgical oncologist with expertise in head & neck, breast, thoracic, GI, and gynecologic cancers. With global training at leading institutions such as MSKCC (USA) and Institut Gustave Roussy (France), he brings decades of experience to complex cancer surgeries.",
  "medicalProblems": [
    { "title": "Head & Neck Cancer", "description": "Advanced surgical and reconstructive management." },
    { "title": "Breast Cancer", "description": "Comprehensive surgical oncology care." },
    { "title": "Thoracic & Esophageal Cancer", "description": "Complex chest oncology surgery." },
    { "title": "Gastrointestinal & Pelvic Tumors", "description": "Advanced GI oncology management." }
  ],
  "procedures": [
    { "title": "Head & Neck Cancer Surgery", "description": "Microvascular and reconstructive procedures." },
    { "title": "Breast Cancer Surgery", "description": "Advanced oncoplastic and radical resections." },
    { "title": "Thoracic & Esophageal Surgery", "description": "Minimally invasive and open cancer surgery." },
    { "title": "GI Cancer Surgery", "description": "Colon, rectal, gastric and hepatobiliary tumor resection." }
  ],
  "faqs": [
    { "question": "Is Dr. Rohit experienced in head & neck cancers?", "answer": "Yes, he is a leading specialist in head & neck oncology." },
    { "question": "Has he trained internationally?", "answer": "Yes, in USA, UK, and France." },
    { "question": "Does he treat GI cancers?", "answer": "Yes, GI and esophageal cancers are key areas of expertise." }
  ]
},
{
  "slug": "dr-balbir-singh",
  "name": "Dr. Balbir Singh",
  "specialty": "Interventional Cardiology & Electrophysiology",
  "hospital": "Max Hospital – Patparganj | Saket East",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Group Chairman – Cardiac Sciences & Chief of Interventional Cardiology and Electrophysiology",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | Fellowship, American College of Cardiology",
  "about": "Dr. Balbir Singh is one of India’s foremost cardiologists and a pioneer in electrophysiology and interventional cardiology. With leading positions across India’s top hospitals, he specializes in complex angioplasties, electrophysiology, pacing therapies and advanced cardiac interventions.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Management of blockages and angina." },
    { "title": "Heart Rhythm Disorders", "description": "Arrhythmias requiring EP studies and ablation." },
    { "title": "Heart Failure", "description": "Management including device therapy." },
    { "title": "Cardiac Conduction Disorders", "description": "Pacemakers, ICDs and CRT devices." }
  ],
  "procedures": [
    { "title": "Angioplasty & Stenting", "description": "Treatment of coronary blockages." },
    { "title": "Electrophysiology Studies & Ablation", "description": "Advanced arrhythmia treatment." },
    { "title": "Pacemaker & ICD Implantation", "description": "Device therapy for rhythm disorders." },
    { "title": "Structural Heart Interventions", "description": "Advanced catheter-based cardiac procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Balbir perform electrophysiology procedures?", "answer": "Yes, he is one of India's top electrophysiologists." },
    { "question": "Has he received national honors?", "answer": "Yes, he was awarded the Padma Shri in 2007." },
    { "question": "Is he experienced in complex angioplasties?", "answer": "Yes, he is widely known for complex interventional procedures." }
  ]
},
{
  "slug": "dr-roopa-salwan",
  "name": "Dr. Roopa Salwan",
  "specialty": "Interventional Cardiology",
  "hospital": "Max Hospital – Saket East",
  "experience": "29+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Myocardial Infarction Program & Interventional Cardiology",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | Harvard Business School – Managing Healthcare Delivery",
  "about": "Dr. Roopa Salwan is a senior interventional cardiologist and a national leader in STEMI care. She heads the Max MI Program, the only network in India achieving international standards in door-to-balloon time for primary PCI for 15+ years.",
  "medicalProblems": [
    { "title": "Acute Myocardial Infarction", "description": "Emergency management and primary PCI." },
    { "title": "Coronary Artery Disease", "description": "Complex coronary interventions." },
    { "title": "Structural Heart Disease", "description": "Management of valve and aortic disorders." },
    { "title": "Peripheral Vascular Disease", "description": "Comprehensive vascular and thrombotic care." }
  ],
  "procedures": [
    { "title": "Primary PCI", "description": "Emergency angioplasty for heart attack." },
    { "title": "Complex Coronary Interventions", "description": "Rotablation, IVL, and graft interventions." },
    { "title": "Endovascular Aneurysm Repair", "description": "Aortic and vascular stent-based procedures." },
    { "title": "Structural Heart Interventions", "description": "TAVI and advanced valve procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Roopa specialize in heart attack treatment?", "answer": "Yes, she leads the Max MI program with top-tier outcomes." },
    { "question": "Does she perform complex angioplasty?", "answer": "Yes, including graft, IVL, and multi-vessel interventions." },
    { "question": "Is she awarded nationally?", "answer": "Yes, she has received multiple excellence awards in cardiology." }
  ]
},
{
  "slug": "dr-mitendra-singh-yadav",
  "name": "Dr. Mitendra Singh Yadav",
  "specialty": "Interventional Cardiology",
  "hospital": "Max Hospital – Saket East | Panchsheel Park",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Interventional Cardiology",
  "degree": "MBBS | MD (Medicine) | DNB (Cardiology) | Fellow – European Society of Cardiology",
  "about": "Dr. Mitendra Singh Yadav is an interventional cardiologist with extensive experience in acute MI management, complex coronary interventions, radial procedures and structural heart interventions.",
  "medicalProblems": [
    { "title": "Acute Heart Attack", "description": "Primary PCI and emergency cardiac care." },
    { "title": "Coronary Blockages", "description": "Complex angioplasty and stenting." },
    { "title": "Valve Disorders", "description": "Structural heart procedure evaluation." },
    { "title": "Renal & Peripheral Vascular Disease", "description": "Endovascular interventions." }
  ],
  "procedures": [
    { "title": "Primary PCI", "description": "Emergency angioplasty for myocardial infarction." },
    { "title": "Complex Coronary Interventions", "description": "IVUS, OCT, ROTA and FFR-guided procedures." },
    { "title": "Radial Angioplasty", "description": "Minimally invasive arm-access procedures." },
    { "title": "Structural Heart Interventions", "description": "Advanced valve and septal procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Mitendra treat acute MI?", "answer": "Yes, he specializes in primary PCI and emergency cardiac care." },
    { "question": "Is he skilled in radial angioplasty?", "answer": "Yes, he has extensive experience in radial artery interventions." },
    { "question": "Does he perform advanced imaging-guided angioplasty?", "answer": "Yes, using IVUS, OCT, FFR and rotablation." }
  ]
},
{
  "slug": "dr-rajneesh-malhotra",
  "name": "Dr. Rajneesh Malhotra",
  "specialty": "Cardiac Surgery (CTVS) & Robotic Surgery",
  "hospital": "Max Hospital – Saket East",
  "experience": "33+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman & Head – CTVS",
  "degree": "MBBS | MS (General Surgery) | MCh (Cardiothoracic Surgery) | Fellowships in Sweden, USA",
  "about": "Dr. Rajneesh Malhotra is a senior cardiac surgeon with nearly 3 decades of experience across India and abroad. He specializes in minimally invasive cardiac surgery, robotic cardiac surgery, valve repair, CABG, ECMO, LVAD and heart failure surgery.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Surgical management including CABG." },
    { "title": "Heart Valve Disorders", "description": "Mitral, aortic and tricuspid valve disease." },
    { "title": "Heart Failure", "description": "Advanced surgical options including LVAD." },
    { "title": "Congenital Heart Defects", "description": "Complex pediatric and adult repairs." }
  ],
  "procedures": [
    { "title": "Minimally Invasive CABG", "description": "Small-incision bypass surgery." },
    { "title": "Robotic Cardiac Surgery", "description": "da Vinci robotic-assisted heart procedures." },
    { "title": "Valve Repair & Replacement", "description": "Aortic, mitral and tricuspid valve surgeries." },
    { "title": "ECMO & LVAD Surgery", "description": "Advanced heart failure support." }
  ],
  "faqs": [
    { "question": "Does Dr. Rajneesh perform robotic cardiac surgery?", "answer": "Yes, he is trained internationally in robotic heart surgery." },
    { "question": "Does he handle complex valve cases?", "answer": "Yes, valve repair and replacement are his key specialties." },
    { "question": "Does he perform minimally invasive CABG?", "answer": "Yes, including port-access and small-incision CABG." }
  ]
},
{
  "slug": "dr-sandeep-budhiraja",
  "name": "Dr. Sandeep Budhiraja",
  "specialty": "Internal Medicine",
  "hospital": "Max Hospital – Panchsheel Park | Saket East",
  "experience": "29+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Group Chairman – Internal Medicine & Group Medical Director",
  "degree": "MBBS | MD (Medicine) | DNB | MRCP (UK)",
  "about": "Dr. Sandeep Budhiraja is a senior internal medicine specialist and Group Medical Director at Max Healthcare. He has over 29 years of expertise in internal medicine, immunology, rheumatology, gastroenterology and systemic disease management.",
  "medicalProblems": [
    { "title": "Metabolic & Lifestyle Disorders", "description": "Diabetes, hypertension and thyroid diseases." },
    { "title": "Rheumatologic Conditions", "description": "Arthritis, autoimmune and inflammatory disorders." },
    { "title": "Infectious Diseases", "description": "Comprehensive medical and systemic care." },
    { "title": "Gastrointestinal & Liver Disorders", "description": "GERD, hepatitis and digestive diseases." }
  ],
  "procedures": [
    { "title": "Chronic Disease Management", "description": "Long-term care of medical conditions." },
    { "title": "Advanced Diagnostics", "description": "Investigations for multi-system disorders." },
    { "title": "Immunology-based Therapy", "description": "Management of autoimmune diseases." },
    { "title": "Preventive Medicine", "description": "Holistic screening and lifestyle care." }
  ],
  "faqs": [
    { "question": "Does Dr. Sandeep treat lifestyle diseases?", "answer": "Yes, lifestyle and chronic diseases are his core specialties." },
    { "question": "Is he MRCP certified?", "answer": "Yes, he is a Member of the Royal College of Physicians (UK)." },
    { "question": "Does he manage rheumatologic disorders?", "answer": "Yes, immunology and rheumatology are major focus areas." }
  ]
},
{
  "slug": "dr-dinesh-khullar",
  "name": "Dr. Dinesh Khullar",
  "specialty": "Nephrology & Kidney Transplant",
  "hospital": "Max Hospital – Saket Smart | Saket West",
  "experience": "32+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Group Chairman – Nephrology & Renal Transplant Medicine",
  "degree": "MBBS | MD (Medicine) | DM (Nephrology, PGIMER Chandigarh)",
  "about": "Dr. Dinesh Khullar is one of India’s top nephrologists with 32+ years of experience in renal transplant medicine, kidney diseases, dialysis therapies and critical nephrology care. He has led major transplant programs and has extensive academic contributions.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease (CKD)", "description": "Comprehensive CKD evaluation and management." },
    { "title": "End-Stage Kidney Failure", "description": "Guidance for dialysis and transplant." },
    { "title": "Diabetic Kidney Disease", "description": "Management of diabetic nephropathy." },
    { "title": "Hypertension & Kidney Disorders", "description": "Advanced medical management." }
  ],
  "procedures": [
    { "title": "Kidney Transplant (ABO-Incompatible)", "description": "High-risk and sensitized transplant solutions." },
    { "title": "Peritoneal Dialysis", "description": "Home-based kidney replacement therapy." },
    { "title": "Hemodialysis & Critical Care", "description": "Advanced ICU renal support." },
    { "title": "Transplant Immunotherapy", "description": "Induction and post-transplant treatments." }
  ],
  "faqs": [
    { "question": "Does Dr. Dinesh perform complex kidney transplants?", "answer": "Yes, including ABO-incompatible and high-risk transplants." },
    { "question": "Does he treat diabetic kidney disease?", "answer": "Yes, he is an expert in diabetic nephropathy." },
    { "question": "Is he experienced in dialysis therapies?", "answer": "Yes, including hemodialysis and peritoneal dialysis." }
  ]
},
{
  "slug": "prof-dr-subhash-gupta",
  "name": "Prof (Dr.) Subhash Gupta",
  "specialty": "Liver Transplant & Biliary Sciences",
  "hospital": "Max Hospital – Saket East | Saket West | Vaishali",
  "experience": "36+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – Centre for Liver & Biliary Sciences",
  "degree": "MBBS | MS | Liver Transplant & HPB Surgery (AIIMS)",
  "about": "Prof (Dr.) Subhash Gupta is one of the world’s leading liver transplant surgeons with over 3,000 successful liver transplants. As Chairman of the Centre for Liver & Biliary Sciences at Max, he has pioneered Living Donor Liver Transplant (LDLT) in India and built one of the largest liver transplant programs globally.",
  "medicalProblems": [
    { "title": "Liver Failure", "description": "Advanced evaluation and transplant management." },
    { "title": "Cirrhosis & Chronic Liver Disease", "description": "Comprehensive hepatology and surgical care." },
    { "title": "Liver & Biliary Tumors", "description": "Surgical management of complex hepatobiliary cancers." },
    { "title": "Biliary Disorders", "description": "Reconstruction and advanced biliary surgery." }
  ],
  "procedures": [
    { "title": "Living Donor Liver Transplant", "description": "World-renowned expertise in LDLT." },
    { "title": "Deceased Donor Liver Transplant", "description": "Advanced transplant techniques and post-op care." },
    { "title": "Biliary Reconstruction Surgery", "description": "Complex biliary tract surgical procedures." },
    { "title": "Hepatobiliary Surgery", "description": "Liver tumor resection and bile duct surgery." }
  ],
  "faqs": [
    { "question": "Is Dr. Subhash Gupta a specialist in liver transplant?", "answer": "Yes, he is one of the world’s leading experts in liver transplantation." },
    { "question": "How many liver transplants has he performed?", "answer": "He has experience of over 3,000 liver transplants." },
    { "question": "Does he handle complex biliary disorders?", "answer": "Yes, he specializes in advanced hepatobiliary and biliary reconstruction surgery." }
  ]
},
{
  "slug": "dr-joy-dev-mukherji",
  "name": "Dr. (Col) Joy Dev Mukherji",
  "specialty": "Neurology",
  "hospital": "Max Hospital – Saket East | Saket West",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman & Head – Neurology",
  "degree": "MBBS (Gold Medal) | MD (Medicine) | DM (Neurology, PGI Chandigarh) | FRCP (Edinburgh)",
  "about": "Dr. (Col.) Joy Dev Mukherji is a highly distinguished neurologist with over 30 years of experience. After serving 23 years in the Armed Forces Medical Services, he joined Max Healthcare as a senior neurologist and has expertise in stroke, movement disorders, multiple sclerosis, headaches, and critical care neurology.",
  "medicalProblems": [
    { "title": "Stroke Management", "description": "Acute and long-term neurological rehabilitation." },
    { "title": "Multiple Sclerosis", "description": "Advanced diagnostics and MS treatment." },
    { "title": "Movement Disorders", "description": "Parkinson’s disease and related conditions." },
    { "title": "Chronic Headaches & Migraine", "description": "Comprehensive neurological evaluation." }
  ],
  "procedures": [
    { "title": "Stroke Treatment Protocols", "description": "Thrombolysis and multidisciplinary management." },
    { "title": "Neurodiagnostic Evaluation", "description": "EEG, nerve conduction studies, and imaging guidance." },
    { "title": "MS Treatment Planning", "description": "Immunomodulatory and targeted therapy." },
    { "title": "Neurological Critical Care", "description": "Management of severe neurological emergencies." }
  ],
  "faqs": [
    { "question": "Does Dr. Mukherji treat stroke patients?", "answer": "Yes, stroke evaluation and management are his key specialties." },
    { "question": "Has he served in the Armed Forces?", "answer": "Yes, he served 23 years and held senior clinical roles." },
    { "question": "Does he specialize in Multiple Sclerosis?", "answer": "Yes, he received special MS training in Switzerland." }
  ]
},
{
  "slug": "dr-sanjay-sachdeva",
  "name": "Dr. Sanjay Sachdeva",
  "specialty": "ENT (Ear, Nose & Throat)",
  "hospital": "Max Hospital – Saket East",
  "experience": "39+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman – ENT",
  "degree": "MBBS | DCH | MS (ENT)",
  "about": "Dr. Sanjay Sachdeva is a senior ENT surgeon with nearly four decades of experience in clinical practice, teaching, cochlear implants, skull base surgery, and sleep apnea surgeries. He is widely recognized for his contribution to ENT training, research, and international publications.",
  "medicalProblems": [
    { "title": "Hearing Loss & Cochlear Issues", "description": "Comprehensive evaluation and implant solutions." },
    { "title": "Snoring & Sleep Apnea (OSAS)", "description": "Surgical and non-surgical management." },
    { "title": "Sinus & Nasal Disorders", "description": "Advanced evaluation and endoscopic care." },
    { "title": "Skull Base Conditions", "description": "Complex ENT and cranial junction disorders." }
  ],
  "procedures": [
    { "title": "Cochlear Implant Surgery", "description": "Hearing restoration for severe hearing loss." },
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive nasal and sinus operations." },
    { "title": "Skull Base Surgery", "description": "Advanced ENT-neurosurgical collaborative procedures." },
    { "title": "Snoring & Sleep Apnea Surgery", "description": "Surgical correction of airway obstruction." }
  ],
  "faqs": [
    { "question": "Does Dr. Sachdeva perform cochlear implant surgery?", "answer": "Yes, he is one of India's leading cochlear implant surgeons." },
    { "question": "Is he experienced in skull base surgery?", "answer": "Yes, he specializes in complex skull base procedures." },
    { "question": "Does he treat sleep apnea?", "answer": "Yes, he performs advanced airway and sleep apnea surgeries." }
  ]
},
{
  "slug": "prof-col-dr-bipin-walia",
  "name": "Prof. (Col.) Dr. Bipin Walia",
  "specialty": "Neurosurgery & Spine Surgery",
  "hospital": "Max Hospital – Saket Smart | Saket West",
  "experience": "28+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairman & Head – Neurosurgery & Neurospine",
  "degree": "MBBS | MS (General Surgery, AFMC Pune) | MCh (Neurosurgery, AIIMS Delhi)",
  "about": "Prof. (Col.) Dr. Bipin Walia is one of India’s leading neurosurgeons with deep expertise in spine surgery, disc replacement, image-guided neurosurgery, and brain tumor surgery. He has over 25 years of neurosurgical experience with global recognition in minimally invasive spine procedures.",
  "medicalProblems": [
    { "title": "Spinal Disc Disorders", "description": "Evaluation of disc herniation and degenerative spine disease." },
    { "title": "Brain Tumors", "description": "Management of complex brain lesions." },
    { "title": "Cranial Disorders", "description": "Endoscopic approaches for cranial problems." },
    { "title": "Spinal Tumors", "description": "Minimally invasive spine tumor management." }
  ],
  "procedures": [
    { "title": "Disc Replacement Surgery", "description": "Motion-preserving spine procedures." },
    { "title": "Image-Guided Neurosurgery", "description": "Precision neurosurgical procedures." },
    { "title": "Endoscopic Cranial Surgery", "description": "Minimally invasive cranial interventions." },
    { "title": "Spinal Tumor Surgery", "description": "Advanced endoscopic and minimally invasive techniques." }
  ],
  "faqs": [
    { "question": "Does Dr. Bipin perform disc replacement surgery?", "answer": "Yes, he has extensive experience in motion-preserving spine surgery." },
    { "question": "Is he trained in minimally invasive neurosurgery?", "answer": "Yes, MIS spine and cranial surgeries are his key strengths." },
    { "question": "Does he operate on brain tumors?", "answer": "Yes, he specializes in image-guided brain tumor surgery." }
  ]
},
{
  "slug": "dr-vivek-nangia",
  "name": "Dr. Vivek Nangia",
  "specialty": "Pulmonology",
  "hospital": "Max Hospital – Saket West | Saket Smart",
  "experience": "29+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Vice Chairman & Head – Pulmonology",
  "degree": "MBBS | MD (TB & Respiratory Diseases) | M.Sc. (Infectious Diseases, LSHTM London)",
  "about": "Dr. Vivek Nangia is an internationally acclaimed interventional pulmonologist with expertise in bronchoscopy, thoracoscopy, sleep medicine, infectious diseases, and critical care. He has trained at leading global institutes including Stanford University, Cleveland Clinic, and Royal Brompton Hospital.",
  "medicalProblems": [
    { "title": "Lung Infections & Pneumonia", "description": "Advanced respiratory infection management." },
    { "title": "Asthma & COPD", "description": "Chronic airway disease evaluation and management." },
    { "title": "Sleep Apnea & Sleep Disorders", "description": "Comprehensive sleep medicine solutions." },
    { "title": "Lung Cancer Evaluation", "description": "Interventional pulmonology diagnostics." }
  ],
  "procedures": [
    { "title": "Bronchoscopic Interventions", "description": "Advanced airway and lung procedures." },
    { "title": "Medical Thoracoscopy", "description": "Minimally invasive pleural diagnosis and treatment." },
    { "title": "Sleep Study & Polysomnography", "description": "Diagnosis of sleep disorders." },
    { "title": "Interventional Pulmonology", "description": "Laser therapy, stenting and ablation for lung disease." }
  ],
  "faqs": [
    { "question": "Does Dr. Nangia perform advanced bronchoscopy?", "answer": "Yes, he is a pioneer in interventional pulmonology." },
    { "question": "Does he treat sleep apnea?", "answer": "Yes, he is trained in sleep medicine at Stanford." },
    { "question": "Is he experienced in infectious lung diseases?", "answer": "Yes, he has global training in infectious diseases." }
  ]
},
{
  "slug": "dr-sameer-malhotra",
  "name": "Dr. Sameer Malhotra",
  "specialty": "Mental Health & Behavioural Sciences",
  "hospital": "Max Hospital – Saket West | Saket East | Panchsheel Park",
  "experience": "27+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director – Mental Health & Behavioural Sciences",
  "degree": "MBBS | MD (Psychiatry) | CCST (UK)",
  "about": "Dr. Sameer Malhotra is a leading psychiatrist with over 2 decades of training and clinical experience at India’s top institutions including PGIMER, NIMHANS, and AIIMS. He specializes in anxiety, depression, mood disorders, addiction medicine, geriatric psychiatry, and psychotherapy.",
  "medicalProblems": [
    { "title": "Anxiety & Mood Disorders", "description": "Evidence-based psychiatric evaluation and treatment." },
    { "title": "Depression & Stress Disorders", "description": "Holistic mental health support and therapy." },
    { "title": "Addiction Medicine", "description": "Alcohol, tobacco and drug de-addiction programs." },
    { "title": "Memory & Geriatric Conditions", "description": "Diagnosis and management of dementia and age-related issues." }
  ],
  "procedures": [
    { "title": "Psychotherapy & Counselling", "description": "Individual, marital and family therapy." },
    { "title": "Pharmacotherapy", "description": "Medication management for psychiatric disorders." },
    { "title": "De-addiction Treatment", "description": "Comprehensive alcohol and drug rehabilitation." },
    { "title": "Cognitive & Behavioral Therapy", "description": "CBT, stress management and coping interventions." }
  ],
  "faqs": [
    { "question": "Does Dr. Sameer treat anxiety and depression?", "answer": "Yes, these are among his core areas of expertise." },
    { "question": "Does he offer counselling and psychotherapy?", "answer": "Yes, he provides multiple forms of therapy including CBT." },
    { "question": "Does he handle addiction cases?", "answer": "Yes, he has deep expertise in addiction medicine." }
  ]
},
{
  "slug": "dr-anita-sethi",
  "name": "Dr. Anita Sethi",
  "specialty": "Ophthalmology – Cataract, Lasik & Oculoplasty",
  "hospital": "Max Hospital – Saket West | Panchsheel Park",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Director & HOD – Cataract, Lasik & Oculoplasty",
  "degree": "MBBS | MD (Ophthalmology, AIIMS) | DNB | FRCS (Edinburgh)",
  "about": "Dr. Anita Sethi is a senior ophthalmic surgeon with more than three decades of experience in cataract, refractive surgery, and oculoplasty. She has led ophthalmology departments at leading hospitals and is known for delivering comprehensive, advanced eye care.",
  "medicalProblems": [
    { "title": "Cataract", "description": "Complete evaluation and surgical correction." },
    { "title": "Refractive Errors", "description": "Advanced LASIK and vision correction options." },
    { "title": "Oculoplastic Conditions", "description": "Eyelid, orbit and tear duct disorders." },
    { "title": "Retinal & Ocular Surface Disorders", "description": "Comprehensive medical and surgical management." }
  ],
  "procedures": [
    { "title": "Cataract Surgery", "description": "Phacoemulsification and premium IOL implantation." },
    { "title": "LASIK & Refractive Surgery", "description": "Laser vision correction." },
    { "title": "Oculoplasty Surgery", "description": "Eyelid and orbital reconstructive procedures." },
    { "title": "Corneal & Ocular Surface Procedures", "description": "Advanced anterior segment surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Anita perform LASIK?", "answer": "Yes, she specializes in laser vision correction." },
    { "question": "Is she experienced in oculoplastic surgery?", "answer": "Yes, eyelid and orbital surgeries are her expertise." },
    { "question": "Does she treat cataracts?", "answer": "Yes, she performs advanced cataract surgery with premium lenses." }
  ]
},
{
  "slug": "dr-anil-sharma",
  "name": "Dr. Anil Sharma",
  "specialty": "Laparoscopic, Robotic & Bariatric Surgery",
  "hospital": "Max Hospital – Saket East",
  "experience": "37+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Laparoscopic, Robotic & Bariatric Surgery",
  "degree": "MBBS | MS (General Surgery) | FRCS (Eng) | FRCS (Edin) | FICS",
  "about": "Dr. Anil Sharma is a renowned laparoscopic and bariatric surgeon with over 37 years of surgical experience. He is a pioneer in minimal access surgery and has played a major role in establishing advanced hernia, bariatric, metabolic and scarless surgery programs in India.",
  "medicalProblems": [
    { "title": "Hernia Disorders", "description": "Evaluation and surgical repair of abdominal wall hernias." },
    { "title": "Gallbladder & Biliary Problems", "description": "Gallstones and advanced biliary disease." },
    { "title": "Obesity & Metabolic Disorders", "description": "Bariatric surgical evaluation and treatment." },
    { "title": "Gastrointestinal Conditions", "description": "Upper GI disorders requiring laparoscopic surgery." }
  ],
  "procedures": [
    { "title": "Laparoscopic Hernia Repair", "description": "Advanced and minimally invasive techniques." },
    { "title": "Bariatric & Metabolic Surgery", "description": "Weight-loss and diabetes surgery." },
    { "title": "Single-Incision (Scarless) Surgery", "description": "Cosmetic minimally invasive procedures." },
    { "title": "Laparoscopic Gallbladder Surgery", "description": "Minimally invasive cholecystectomy." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharma perform scarless surgery?", "answer": "Yes, he specializes in single-incision laparoscopic procedures." },
    { "question": "Is he experienced in bariatric surgery?", "answer": "Yes, he is a leading bariatric and metabolic surgeon." },
    { "question": "Does he treat gallbladder conditions?", "answer": "Yes, he performs advanced laparoscopic gallbladder surgery." }
  ]
},
{
  "slug": "dr-aparna-dhar",
  "name": "Dr. Aparna Dhar",
  "specialty": "Molecular Oncology & Cancer Genetics",
  "hospital": "Nanavati Max Hospital | Max Hospital – Saket Smart | Gurugram | Saket East",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Hereditary, Precision Oncology & Genetic Counselling",
  "degree": "MMSC (Medical Genetics, University of Glasgow) | Medical Genetics Fellowship, Mayo Clinic USA",
  "about": "Dr. Aparna Dhar is a leading expert in molecular oncology, hereditary cancer genetics, and precision oncology. With global training at Mayo Clinic, Harvard-affiliated institutions, and the University of Glasgow, she has guided more than 10,000 families in hereditary cancer risk and precision treatment planning.",
  "medicalProblems": [
    { "title": "Hereditary Cancers", "description": "Risk evaluation for breast, ovarian, GI and lung cancers." },
    { "title": "Genetic Mutations & Syndromes", "description": "BRCA, Lynch, and rare cancer syndromes." },
    { "title": "Precision Oncology", "description": "Genomic-guided cancer treatment planning." },
    { "title": "Onco-fertility & Genetic Counselling", "description": "Fertility and family planning support in cancer." }
  ],
  "procedures": [
    { "title": "Genetic Testing & Interpretation", "description": "Comprehensive genomic analysis." },
    { "title": "Precision Oncology Planning", "description": "Molecular-guided treatment decisions." },
    { "title": "Hereditary Cancer Counselling", "description": "Personal and family risk assessment." },
    { "title": "Telegenetics", "description": "Remote genetic counselling services." }
  ],
  "faqs": [
    { "question": "Does Dr. Aparna treat hereditary cancers?", "answer": "Yes, she specializes in hereditary and familial cancers." },
    { "question": "Does she offer genetic testing?", "answer": "Yes, she guides complete genetic evaluation and interpretation." },
    { "question": "Is she internationally trained?", "answer": "Yes, at Mayo Clinic, Harvard-affiliated institutes, and University of Glasgow." }
  ]
},
{
  "slug": "dr-monica-mahajan",
  "name": "Dr. Monica Mahajan",
  "specialty": "Internal Medicine",
  "hospital": "Max Medcentre – Lajpat Nagar | Max Hospital – Panchsheel Park | Saket East",
  "experience": "27+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Director – Internal Medicine",
  "degree": "MBBS | DNB (Medicine) | MNAMS",
  "about": "Dr. Monica Mahajan is a senior Internal Medicine specialist with over 27 years of experience. She is known for her expertise in preventive care, infectious diseases, adult vaccination, global travel medicine, and chronic medical conditions.",
  "medicalProblems": [
    { "title": "Infectious Diseases", "description": "Diagnosis and treatment of common and complex infections." },
    { "title": "Lifestyle & Chronic Diseases", "description": "Hypertension, diabetes and thyroid disorders." },
    { "title": "Travel Medicine", "description": "Vaccination and international travel health evaluation." },
    { "title": "Immunological Conditions", "description": "Adult immunization and systemic disorders." }
  ],
  "procedures": [
    { "title": "Preventive Health Screening", "description": "Comprehensive wellness evaluations." },
    { "title": "Adult Immunization Programs", "description": "Vaccinations for travel and chronic conditions." },
    { "title": "Chronic Disease Management", "description": "Long-term care for lifestyle disorders." },
    { "title": "Infection Management Protocols", "description": "Clinical care for viral, bacterial and travel-related infections." }
  ],
  "faqs": [
    { "question": "Does Dr. Monica specialize in travel medicine?", "answer": "Yes, she is a recognized expert in travel medicine and vaccination." },
    { "question": "Does she treat chronic diseases?", "answer": "Yes, including diabetes, hypertension and thyroid disorders." },
    { "question": "Is she involved in preventive healthcare?", "answer": "Yes, preventive care is one of her major areas of focus." }
  ]
},
{
  "slug": "dr-supriya-bali",
  "name": "Dr. Supriya Bali",
  "specialty": "Internal Medicine",
  "hospital": "Max Medcentre – Lajpat Nagar | Max Hospital – Panchsheel Park | Max Hospital – Saket East",
  "experience": "28+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Internal Medicine",
  "degree": "MBBS | MD (Internal Medicine)",
  "about": "Dr. Supriya Bali is a senior Internal Medicine specialist with over 28 years of clinical experience. She has extensive expertise in infectious diseases, diabetes, adult immunization and long-term medical care. She has trained at Stanford University in Emergency & Internal Medicine and has held senior roles at prominent Indian hospitals.",
  "medicalProblems": [
    { "title": "Infectious Diseases", "description": "Diagnosis and treatment of viral, bacterial and multi-system infections." },
    { "title": "Diabetes Management", "description": "Comprehensive evaluation and long-term control of diabetes." },
    { "title": "Adult Immunization", "description": "Vaccinations for travel, lifestyle and disease prevention." },
    { "title": "Chronic Medical Conditions", "description": "Hypertension, thyroid disorders and metabolic diseases." }
  ],
  "procedures": [
    { "title": "Adult Vaccination Programs", "description": "Comprehensive immunization for adults and travellers." },
    { "title": "Chronic Disease Care", "description": "Long-term management plans for diabetes and hypertension." },
    { "title": "Infection Screening & Treatment", "description": "Protocols for acute and complex infections." },
    { "title": "Preventive Health Assessments", "description": "Full-body checkups and risk evaluation." }
  ],
  "faqs": [
    { "question": "Does Dr. Supriya Bali treat diabetes?", "answer": "Yes, diabetes management is one of her primary specialties." },
    { "question": "Does she offer adult vaccinations?", "answer": "Yes, including travel and routine immunization." },
    { "question": "Has she trained internationally?", "answer": "Yes, she completed an observership at Stanford University, USA." }
  ]
},
{
  "slug": "dr-neeru-gera",
  "name": "Dr. Neeru Gera",
  "specialty": "Endocrinology & Diabetes",
  "hospital": "Max Hospital – Shalimar Bagh | Max Hospital – Panchsheel Park | Max Hospital – Noida Sec 19 | Max Hospital – Saket East",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Endocrinology",
  "degree": "MBBS | MD (Medicine) | DM (Endocrinology)",
  "about": "Dr. Neeru Gera is a senior endocrinologist with over 34 years of experience in managing complex hormonal disorders, diabetes, thyroid diseases, metabolic bone disorders and endocrine-related health issues. She is known for her clinical precision and long-standing expertise across several Max network hospitals.",
  "medicalProblems": [
    { "title": "Diabetes (Type 1 & Type 2)", "description": "Advanced management and long-term care of diabetes." },
    { "title": "Thyroid Disorders", "description": "Evaluation and treatment of hypothyroidism, hyperthyroidism and thyroid nodules." },
    { "title": "PCOD & Hormonal Imbalances", "description": "Comprehensive hormonal evaluation and treatment." },
    { "title": "Metabolic Bone Diseases", "description": "Osteoporosis and calcium–vitamin D related disorders." }
  ],
  "procedures": [
    { "title": "Diabetes Management Plans", "description": "Personalized treatment for blood sugar control." },
    { "title": "Thyroid Function Diagnostic Workup", "description": "Clinical evaluation with advanced hormonal testing." },
    { "title": "Hormonal Therapy", "description": "Treatment for endocrine deficiencies and imbalances." },
    { "title": "Metabolic Disorder Evaluation", "description": "Assessment for bone health and vitamin deficiencies." }
  ],
  "faqs": [
    { "question": "Does Dr. Neeru Gera treat thyroid disorders?", "answer": "Yes, she specializes in all types of thyroid conditions." },
    { "question": "Is she experienced in diabetes management?", "answer": "Yes, she has over 34 years of expertise in diabetes care." },
    { "question": "Does she treat PCOD and hormonal issues?", "answer": "Yes, she provides comprehensive endocrine evaluation and management." }
  ]
},
{
  "slug": "dr-khalid-j-farooqui",
  "name": "Dr. Khalid J Farooqui",
  "specialty": "Endocrinology & Diabetes",
  "hospital": "Max Hospital – Saket Smart | Max Hospital – Gurugram | Max Hospital – Saket East",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Endocrinology & Diabetes",
  "degree": "MBBS | MD (Internal Medicine) | DM (Endocrinology)",
  "about": "Dr. Khalid J Farooqui is an experienced endocrinologist with over 12 years of expertise in diabetes, thyroid disorders, obesity care, metabolic diseases and hormonal imbalance management. He has trained extensively at Medanta Medicity and Sher-I-Kashmir Institute of Medical Sciences, and is known for his evidence-based approach.",
  "medicalProblems": [
    { "title": "Diabetes (Type 1, Type 2 & Gestational)", "description": "Advanced glucose management and long-term care." },
    { "title": "Thyroid Disorders", "description": "Treatment for hypo/hyperthyroidism, thyroiditis and nodules." },
    { "title": "Obesity & Metabolic Syndrome", "description": "Endocrine-based evaluation and weight management plans." },
    { "title": "Pituitary & Adrenal Disorders", "description": "Diagnosis of hormonal deficiencies and excess syndromes." }
  ],
  "procedures": [
    { "title": "Diabetes Control Programs", "description": "Structured treatment with medication, monitoring and lifestyle guidance." },
    { "title": "Hormone Profile Evaluation", "description": "Advanced hormonal testing for endocrine disorders." },
    { "title": "Thyroid Function Testing & Therapy", "description": "Comprehensive thyroid evaluation and treatment." },
    { "title": "Obesity & Metabolic Management", "description": "Endocrine-guided weight and metabolic control therapies." }
  ],
  "faqs": [
    { "question": "Does Dr. Khalid treat thyroid problems?", "answer": "Yes, he specializes in both common and complex thyroid conditions." },
    { "question": "Does he manage Type 1 and Type 2 diabetes?", "answer": "Yes, he provides complete diabetes evaluation and treatment." },
    { "question": "Is he trained in advanced endocrinology?", "answer": "Yes, he holds a DM in Endocrinology and has international memberships." }
  ]
},
{
  "slug": "dr-anupam-goel",
  "name": "Dr. Anupam Goel",
  "specialty": "Interventional Cardiology",
  "hospital": "Max Hospital – Saket East",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Interventional Cardiology",
  "degree": "MBBS | MD (General Medicine) | DM (Cardiology)",
  "about": "Dr. Anupam Goel is a senior Interventional Cardiologist with over 22 years of experience in coronary interventions, acute cardiac care and clinical cardiology. He is known for his expertise in angiography, angioplasty and primary PCI, including radial and femoral approaches. He has been associated with Max Super Speciality Hospital, Saket since 2005.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease (CAD)", "description": "Evaluation and management of blockages in heart arteries." },
    { "title": "Acute Coronary Syndrome", "description": "Emergency treatment for heart attacks and unstable angina." },
    { "title": "Heart Rhythm Disorders", "description": "Management of arrhythmias and conduction abnormalities." },
    { "title": "Hypertension & Lipid Disorders", "description": "Long-term cardiac risk factor control." }
  ],
  "procedures": [
    { "title": "Coronary Angiography", "description": "Diagnostic evaluation of heart arteries through radial or femoral route." },
    { "title": "Coronary Angioplasty (PCI)", "description": "Balloon angioplasty and stenting for blocked arteries." },
    { "title": "Primary Angioplasty for Heart Attack", "description": "Emergency life-saving intervention during acute MI." },
    { "title": "Cardiac Evaluation & Risk Profiling", "description": "Comprehensive cardiac screening and preventive checkups." }
  ],
  "faqs": [
    { "question": "Does Dr. Anupam Goel perform angioplasty?", "answer": "Yes, he specializes in all forms of coronary angioplasty, including emergency PCI." },
    { "question": "Is he experienced in radial angiography?", "answer": "Yes, he routinely performs radial and femoral angiography and angioplasty." },
    { "question": "Does he treat women with heart disease?", "answer": "Yes, he runs the CAD in Women program focused on awareness and treatment." }
  ]
},
{
  "slug": "dr-ashish-jain",
  "name": "Dr. Ashish Jain",
  "specialty": "Pulmonology",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Saket West | Max Hospital – Saket Smart | Max Hospital – Saket East",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director & Head – Respiratory Medicine",
  "degree": "MBBS | MD (Respiratory Medicine)",
  "about": "Dr. Ashish Jain is a senior Pulmonologist with more than 24 years of experience in respiratory medicine. He is an expert in interventional bronchoscopy, thoracoscopy, EBUS, and advanced lung disease management. He is known for treating complex asthma, COPD, lung cancer and respiratory failure cases.",
  "medicalProblems": [
    { "title": "Asthma", "description": "Evaluation and long-term management of chronic and allergic asthma." },
    { "title": "COPD", "description": "Management of chronic obstructive pulmonary disease and emphysema." },
    { "title": "Lung Cancer Evaluation", "description": "Diagnostic bronchoscopy and EBUS for lung tumors." },
    { "title": "Respiratory Failure", "description": "Non-invasive ventilation and advanced respiratory support." }
  ],
  "procedures": [
    { "title": "Interventional Bronchoscopy", "description": "Advanced airway procedures including biopsy and foreign body removal." },
    { "title": "EBUS (Endobronchial Ultrasound)", "description": "Minimally invasive evaluation of lung lesions and lymph nodes." },
    { "title": "Thoracoscopy", "description": "Diagnostic and therapeutic procedures for pleural diseases." },
    { "title": "Pulmonary Function Testing", "description": "Comprehensive lung function assessment." }
  ],
  "faqs": [
    { "question": "Does Dr. Ashish Jain treat asthma and COPD?", "answer": "Yes, he specializes in long-term management of asthma, COPD and chronic lung disease." },
    { "question": "Is he trained in EBUS and advanced bronchoscopy?", "answer": "Yes, he is highly experienced in EBUS and interventional bronchoscopy." },
    { "question": "Does he manage lung cancer cases?", "answer": "Yes, he performs diagnostic bronchoscopy and provides advanced lung cancer evaluation." }
  ]
},
{
  "slug": "dr-ajita-bagai-kakkar",
  "name": "Dr. Ajita Bagai Kakkar",
  "specialty": "Dermatology, Lasers & Aesthetic Medicine",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Dermatology, Lasers & Aesthetic Medicine",
  "degree": "MBBS | MD (Dermatology) | DNB (Dermatology & Venereology)",
  "about": "Dr. Ajita Bagai Kakkar is a senior dermatologist with over 25 years of experience in clinical dermatology, cosmetic dermatology, lasers and aesthetic medicine. She has extensive training from premier institutions including AIIMS, Manipal and international dermatology societies. She is known for her expertise in acne, pigmentation, aesthetic laser procedures and anti-aging treatments.",
  "medicalProblems": [
    { "title": "Acne & Acne Scars", "description": "Comprehensive treatment for acne, scarring and post-acne pigmentation." },
    { "title": "Psoriasis", "description": "Long-term management and advanced therapies for psoriasis." },
    { "title": "Pigmentation Disorders", "description": "Treatment of melasma, sun damage and uneven skin tone." },
    { "title": "Hair Loss & Scalp Disorders", "description": "Evaluation of alopecia, scalp infections and PRP therapy." }
  ],
  "procedures": [
    { "title": "Laser Treatments", "description": "Laser removal of pigmentation, scars, hair, moles and skin tags." },
    { "title": "Aesthetic Procedures", "description": "Chemical peels, anti-aging treatments, Botox and mesotherapy." },
    { "title": "PRP Therapy", "description": "Platelet-rich plasma therapy for skin rejuvenation and hair loss." },
    { "title": "Dermatologic Surgery", "description": "Minor surgeries for cysts, lesions and cosmetic corrections." }
  ],
  "faqs": [
    { "question": "Does Dr. Ajita treat acne and pigmentation?", "answer": "Yes, she is highly experienced in acne, pigmentation and aesthetic treatments." },
    { "question": "Does she perform laser procedures?", "answer": "Yes, she specializes in advanced dermatology lasers for multiple skin concerns." },
    { "question": "Does she offer anti-aging treatments?", "answer": "Yes, she provides fillers, Botox, PRP, mesotherapy and skin rejuvenation therapies." }
  ]
},
{
  "slug": "dr-mukesh-kumar",
  "name": "Dr. Mukesh Kumar",
  "specialty": "Neurology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director & Head – Parkinson's Disease Unit",
  "degree": "MBBS (Gold Medalist) | MD (Medicine) | DNB (Medicine) | DM (Neurology, AIIMS)",
  "about": "Dr. Mukesh Kumar is a leading neurologist with expertise in Parkinson’s disease, movement disorders, Myasthenia Gravis, Deep Brain Stimulation (DBS), and neuro-immunological disorders. He has strong academic credentials including DM Neurology from AIIMS and has contributed to advanced clinical research in ALS, cerebral palsy and stroke.",
  "medicalProblems": [
    { "title": "Parkinson’s Disease", "description": "Comprehensive evaluation and management of motor and non-motor symptoms." },
    { "title": "Myasthenia Gravis", "description": "Diagnosis and long-term treatment of neuromuscular weakness." },
    { "title": "Movement Disorders", "description": "Management of dystonia, tremors, ataxia and gait abnormalities." },
    { "title": "Neuromuscular Disorders", "description": "Evaluation of nerve and muscle diseases causing weakness or fatigue." }
  ],
  "procedures": [
    { "title": "Deep Brain Stimulation (DBS) Programming", "description": "Advanced DBS adjustment and clinical follow-up for Parkinson’s patients." },
    { "title": "Botulinum Toxin Therapy", "description": "Targeted treatment for dystonia, spasticity and movement disorders." },
    { "title": "Electrophysiological Studies", "description": "Nerve conduction studies and EMG for neuromuscular diagnosis." },
    { "title": "Comprehensive Neurological Evaluation", "description": "Full assessment for neurodegenerative and neuromuscular conditions." }
  ],
  "faqs": [
    { "question": "Does Dr. Mukesh Kumar specialize in Parkinson’s disease?", "answer": "Yes, he leads the Parkinson’s Disease Unit and is highly experienced in DBS programming." },
    { "question": "Does he treat movement disorders?", "answer": "Yes, including tremors, dystonia, gait issues and neuromuscular disorders." },
    { "question": "Does he provide Botox therapy for neurological conditions?", "answer": "Yes, he offers Botulinum toxin therapy for dystonia and movement disorders." }
  ]
},
{
  "slug": "dr-raghav-mantri",
  "name": "Dr. Raghav Mantri",
  "specialty": "Aesthetic & Reconstructive Surgery",
  "hospital": "Max Hospital – Saket West | Max Hospital – Gurugram | Max Hospital – Saket East",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director & Clinical Lead – Liposuction & Body Contouring",
  "degree": "MBBS | MS (General Surgery) | MCh (Plastic & Reconstructive Surgery)",
  "about": "Dr. Raghav Mantri is a senior Aesthetic and Reconstructive Plastic Surgeon with over 23 years of experience. He specializes in body contouring, cosmetic surgery, reconstructive microsurgery and trauma reconstruction. He has trained at leading national and international centers and has expertise in advanced techniques of liposuction, breast surgery, migraine surgery and facial aesthetics.",
  "medicalProblems": [
    { "title": "Cosmetic Body Concerns", "description": "Issues related to excess fat, body contouring and lipodystrophy." },
    { "title": "Breast Deformities", "description": "Breast asymmetry, reduction needs and reconstruction post-mastectomy." },
    { "title": "Facial Aesthetic Concerns", "description": "Cosmetic facial irregularities and age-related changes." },
    { "title": "Trauma & Reconstructive Needs", "description": "Post-injury reconstruction of face, limbs and soft tissues." }
  ],
  "procedures": [
    { "title": "Liposuction & Body Contouring", "description": "Advanced sculpting techniques including thigh lift, abdominoplasty and liposuction." },
    { "title": "Breast Reconstruction & Reduction", "description": "Reconstruction post-cancer, cosmetic reshaping and breast reduction surgery." },
    { "title": "Cosmetic Facial Surgery", "description": "Procedures for facial enhancement, contouring and rejuvenation." },
    { "title": "Reconstructive Microsurgery", "description": "Specialized surgery for trauma-related defects and structural restoration." }
  ],
  "faqs": [
    { "question": "Does Dr. Raghav Mantri perform liposuction?", "answer": "Yes, he specializes in liposuction and advanced body contouring surgeries." },
    { "question": "Does he perform breast reconstruction?", "answer": "Yes, he is an expert in breast reconstruction and reduction surgery." },
    { "question": "Does he offer cosmetic facial procedures?", "answer": "Yes, including facial contouring, rejuvenation and aesthetic corrections." }
  ]
},
{
  "slug": "dr-shaiwal-khandelwal",
  "name": "Dr. Shaiwal Khandelwal",
  "specialty": "Thoracic Surgery",
  "hospital": "Max Hospital – Saket West | Max Hospital – Gurugram | Max Hospital – Saket East",
  "experience": "21+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director – Thoracic Surgery",
  "degree": "MBBS (IMS-BHU) | MS (General Surgery, BHU) | Fellowships in Minimally Invasive Thoracic Surgery, VATS & Robotic Thoracic Surgery",
  "about": "Dr. Shaiwal Khandelwal is a distinguished Thoracic Surgeon with over 21 years of experience. He specializes in Robotic Thoracic Surgery, VATS, Uniportal VATS, lung cancer surgery, mediastinal surgeries and complex thoracic reconstructions. Trained internationally at Seoul National University Hospital, Memorial Sloan Kettering (New York) and CCI Shanghai, he is recognized as an expert in advanced minimally invasive thoracic surgery.",
  "medicalProblems": [
    { "title": "Lung Cancer", "description": "Evaluation and minimally invasive surgical management of lung tumors." },
    { "title": "Mediastinal Tumors", "description": "Diagnosis and surgical removal of thymoma, cysts and other mediastinal lesions." },
    { "title": "Pleural Diseases", "description": "Treatment of recurrent effusions, infections and pleural tumors." },
    { "title": "Thoracic Trauma & Structural Disorders", "description": "Management of chest injuries, rib fractures and airway abnormalities." }
  ],
  "procedures": [
    { "title": "Robotic Thoracic Surgery", "description": "Precision-based robotic procedures for lung and mediastinal diseases." },
    { "title": "VATS (Video-Assisted Thoracoscopic Surgery)", "description": "Minimally invasive surgery for lungs and chest cavity." },
    { "title": "Uniportal VATS", "description": "Advanced single-incision thoracic surgery technique." },
    { "title": "Thoracic Oncology Surgery", "description": "Comprehensive tumor resections for lung and chest cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Shaiwal perform robotic thoracic surgery?", "answer": "Yes, he is highly trained in robotic and minimally invasive thoracic surgery." },
    { "question": "Does he treat lung cancer surgically?", "answer": "Yes, he specializes in minimally invasive and advanced lung cancer surgeries." },
    { "question": "Is he trained internationally?", "answer": "Yes, he has undergone specialized training in South Korea, USA and China." }
  ]
},
{
  "slug": "dr-jasmita-popli",
  "name": "Dr. Jasmita Popli",
  "specialty": "Ophthalmology (Cataract, LASIK & Glaucoma)",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Ophthalmology (Cataract, LASIK & Glaucoma Management)",
  "degree": "MBBS | MS (Ophthalmology) | Fellowship in Phacoemulsification & Lasik Surgery",
  "about": "Dr. Jasmita Popli is a senior Ophthalmologist with over 25 years of experience in Cataract Surgery, LASIK, Refractive Procedures, Glaucoma Management and Oculoplastic care. She has served as HOD at St. Stephen’s Hospital and has worked with leading eye hospitals including Centre for Sight, Vasan Eye Care and Max Healthcare. She specializes in premium cataract surgery, advanced refractive correction and glaucoma evaluation.",
  "medicalProblems": [
    { "title": "Cataracts", "description": "Diagnosis and surgical treatment of cataracts including premium IOL options." },
    { "title": "Refractive Errors", "description": "Myopia, hyperopia and astigmatism requiring LASIK/PRK correction." },
    { "title": "Glaucoma", "description": "Screening and long-term management of open- and closed-angle glaucoma." },
    { "title": "Ocular Surface & Lid Disorders", "description": "Treatment of dry eye, chalazion, eyelid lesions and pterygium." }
  ],
  "procedures": [
    { "title": "Phacoemulsification & MICS Cataract Surgery", "description": "Modern stitchless cataract surgery with advanced IOL implantation." },
    { "title": "LASIK & PRK", "description": "Laser vision correction for refractive errors." },
    { "title": "Glaucoma Laser & Medical Therapy", "description": "Laser iridectomy, capsulotomy and long-term glaucoma management." },
    { "title": "Oculoplastic & Lid Surgeries", "description": "Chalazion removal, lid repair and pterygium surgery with grafting." }
  ],
  "faqs": [
    { "question": "Does Dr. Jasmita Popli perform premium cataract surgery?", "answer": "Yes, she specializes in advanced cataract surgery including toric, trifocal and EDOF lenses." },
    { "question": "Does she perform LASIK?", "answer": "Yes, she is extensively trained in LASIK and PRK refractive procedures." },
    { "question": "Does she treat glaucoma patients?", "answer": "Yes, she offers screening, laser procedures and long-term medical management for glaucoma." }
  ]
},
{
  "slug": "dr-kamran-ali",
  "name": "Dr. Kamran Ali",
  "specialty": "Lung Transplant & Thoracic Surgery",
  "hospital": "Max Hospital – Saket East | Max Hospital – Saket Smart | Max Hospital – Saket West",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Thoracic Surgery",
  "degree": "MBBS | DNB (Surgery) | FACS | Fellowships in Thoracic Surgery & Lung Transplant",
  "about": "Dr. Kamran Ali is a highly skilled Lung Transplant and Thoracic Surgeon with experience across top centers in India, South Korea, Austria, Japan and Taiwan. He has previously worked at Medanta, Sir Ganga Ram, Fortis and Yashoda Hospitals. Dr. Ali has international training in advanced thoracic surgery, lung transplant programs and minimally invasive VATS/robotic techniques.",
  "medicalProblems": [
    { "title": "Lung Failure & Transplant Needs", "description": "Assessment and management of advanced lung disease requiring transplant." },
    { "title": "Lung Cancer & Tumors", "description": "Diagnosis and surgical management of thoracic malignancies." },
    { "title": "Pleural Diseases", "description": "Treatment for recurrent pleural effusions, infections and pleural tumors." },
    { "title": "Airway Disorders", "description": "Surgical treatment of airway stenosis and tracheal diseases." }
  ],
  "procedures": [
    { "title": "Lung Transplant Surgery", "description": "Evaluation and surgical management of advanced lung disease." },
    { "title": "VATS (Video-Assisted Thoracoscopic Surgery)", "description": "Minimally invasive thoracic surgery for lungs and mediastinum." },
    { "title": "Robotic Thoracic Surgery", "description": "Precision-based robotic procedures for complex thoracic conditions." },
    { "title": "Thoracic Oncology Surgery", "description": "Surgical removal of lung and mediastinal tumors." }
  ],
  "faqs": [
    { "question": "Does Dr. Kamran Ali perform lung transplant surgeries?", "answer": "Yes, he is trained internationally and specializes in lung transplant surgery." },
    { "question": "Does he perform VATS and robotic thoracic surgery?", "answer": "Yes, he is experienced in advanced VATS and robotic procedures." },
    { "question": "Has he trained internationally?", "answer": "Yes, he has fellowships from South Korea, Austria, Japan and Taiwan." }
  ]
},
{
  "slug": "dr-samit-chaturvedi",
  "name": "Dr. Samit Chaturvedi",
  "specialty": "Urology, Kidney Transplant & Uro-Oncology",
  "hospital": "Max Hospital – Noida Sec 19 | Max Hospital – Saket East",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Director – Urology, Kidney Transplant & Uro-Oncology",
  "degree": "MBBS | MS (General Surgery) | MCh (Urology, SGPGI)",
  "about": "Dr. Samit Chaturvedi is an experienced Urologist and Kidney Transplant surgeon with more than 14 years of expertise in uro-oncology, robotic urology, laser surgeries and renal transplant procedures. He has served in prestigious institutions including SGPGI Lucknow, BLK Hospital, Batra Hospital and PSRI, and specializes in minimally invasive and advanced reconstructive urological surgery.",
  "medicalProblems": [
    { "title": "Kidney Stones & Ureteric Stones", "description": "Diagnosis and laser-based treatment for urinary stones." },
    { "title": "Prostate Enlargement & Prostate Cancer", "description": "Comprehensive evaluation and surgical management." },
    { "title": "Kidney & Bladder Cancer", "description": "Advanced oncological management using minimally invasive techniques." },
    { "title": "Male Urological Disorders", "description": "Management of urinary obstruction, infections and functional disorders." }
  ],
  "procedures": [
    { "title": "Kidney Transplant Surgery", "description": "Evaluation and surgical management of renal transplant." },
    { "title": "Robotic Urological Surgery", "description": "Minimally invasive robotic procedures for urological cancers and reconstruction." },
    { "title": "Laser Stone Surgery (RIRS/PCNL/Holmium)", "description": "Advanced laser treatment for kidney, ureter and bladder stones." },
    { "title": "Uro-Oncology Surgery", "description": "Surgical treatment for cancers of kidney, bladder, prostate and urinary tract." }
  ],
  "faqs": [
    { "question": "Does Dr. Samit perform kidney transplant surgeries?", "answer": "Yes, he has extensive experience in both donor and recipient surgeries." },
    { "question": "Does he specialize in laser stone removal?", "answer": "Yes, he is skilled in advanced RIRS, PCNL and Holmium laser procedures." },
    { "question": "Does he treat prostate cancer?", "answer": "Yes, he provides complete evaluation and surgical treatment for prostate cancer." }
  ]
},
{
  "slug": "dr-jaya-kumar",
  "name": "Dr. Jaya Kumar",
  "specialty": "Pulmonology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park | Max Medcentre – Lajpat Nagar | Max Hospital – Saket Smart | Max Hospital – Saket East",
  "experience": "26+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Pulmonology",
  "degree": "MBBS | MD (Medicine)",
  "about": "Dr. Jaya Kumar is an experienced Pulmonologist with over 26 years in Respiratory Medicine. She specializes in complex lung diseases, interstitial lung disease (ILD), sarcoidosis and chronic respiratory conditions. She is known for her clinical expertise and patient-centered approach across multiple Max Healthcare facilities.",
  "medicalProblems": [
    { "title": "Sarcoidosis", "description": "Comprehensive evaluation and long-term management of sarcoidosis." },
    { "title": "Interstitial Lung Disease (ILD)", "description": "Diagnosis and treatment of fibrotic and inflammatory ILDs." },
    { "title": "Chronic Respiratory Disorders", "description": "Management of asthma, COPD, chronic cough and airway issues." },
    { "title": "Respiratory Infections", "description": "Treatment of pneumonia, bronchitis and post-infection lung complications." }
  ],
  "procedures": [
    { "title": "Pulmonary Function Testing (PFT)", "description": "Complete assessment of lung capacity and airway function." },
    { "title": "High-Resolution Chest Evaluation", "description": "Advanced imaging-based diagnosis of ILD and lung inflammation." },
    { "title": "Chronic Respiratory Care", "description": "Management protocols for asthma, COPD and chronic breathlessness." },
    { "title": "Sarcoidosis Management", "description": "Medical therapy and long-term monitoring of granulomatous lung disease." }
  ],
  "faqs": [
    { "question": "Does Dr. Jaya Kumar treat ILD?", "answer": "Yes, ILD is one of her core areas of specialization." },
    { "question": "Does she manage chronic lung diseases?", "answer": "Yes, she provides treatment for asthma, COPD and long-term airway disorders." },
    { "question": "Is she experienced in sarcoidosis treatment?", "answer": "Yes, she has extensive experience managing sarcoidosis cases." }
  ]
},
{
  "slug": "dr-anurag-singh",
  "name": "Dr. Anurag Singh",
  "specialty": "Oral & Maxillofacial Surgery, Dental Implants",
  "hospital": "Max Hospital – Panchsheel Park | Max Hospital – Saket East",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Director – Oral & Maxillofacial Surgery and Implantology",
  "degree": "BDS | MDS (Maxillofacial Surgery & Implantology)",
  "about": "Dr. Anurag Singh is a highly experienced Oral & Maxillofacial Surgeon and Implantologist with over 24 years of expertise. He specializes in advanced dental implants, jaw reconstruction, TMJ surgery, maxillofacial trauma, cysts and tumors of the jaw, and complex full-mouth rehabilitation procedures.",
  "medicalProblems": [
    { "title": "Impacted Wisdom Teeth", "description": "Surgical removal of complex or infected wisdom teeth." },
    { "title": "Jaw & Facial Bone Injuries", "description": "Management of fractures, trauma and reconstruction." },
    { "title": "Temporomandibular Joint Disorders", "description": "Evaluation and surgical treatment for TMJ pain and dysfunction." },
    { "title": "Jaw Cysts & Tumors", "description": "Diagnosis and surgical management of benign oral/maxillofacial cysts and tumors." }
  ],
  "procedures": [
    { "title": "Dental & Maxillofacial Implants", "description": "Single, multiple and full-mouth implant rehabilitation." },
    { "title": "Zygomatic Implants", "description": "Specialized implants for patients with severe bone loss." },
    { "title": "Orthognathic (Jaw Repositioning) Surgery", "description": "Corrective surgery for jaw alignment and facial symmetry." },
    { "title": "TMJ Surgery & Joint Replacement", "description": "Advanced TMJ arthroscopy and joint reconstruction procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Anurag Singh perform dental implants?", "answer": "Yes, he specializes in implants including advanced zygomatic implants." },
    { "question": "Does he treat jaw fractures?", "answer": "Yes, he has extensive experience in managing maxillofacial trauma." },
    { "question": "Does he perform TMJ surgery?", "answer": "Yes, he provides surgical and reconstructive solutions for TMJ disorders." }
  ]
},
{
  "slug": "ritika-samaddar",
  "name": "Ritika Samaddar",
  "specialty": "Dietetics, Nutrition & Clinical Dietetics",
  "hospital": "Max Hospital – Saket West",
  "experience": "29+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Regional Head – Department of Clinical Nutrition & Dietetics (South Zone)",
  "degree": "M.Sc. Therapeutic Nutrition | UGC-NET | Registered Dietician (IDA)",
  "about": "Ritika Samaddar is one of India’s leading clinical nutritionists with nearly three decades of experience in therapeutic nutrition, bariatric nutrition, metabolic disorders and clinical diet planning. She has been heading the Clinical Nutrition & Dietetics department at Max Healthcare since 2005 and has contributed significantly to nationwide nutrition awareness, research and training programs.",
  "medicalProblems": [
    { "title": "Obesity & Weight Disorders", "description": "Nutritional management of obesity, metabolic syndrome and bariatric patients." },
    { "title": "Diabetes & Metabolic Diseases", "description": "Diet plans for diabetes, pre-diabetes and metabolic dysfunction." },
    { "title": "Gut & Digestive Disorders", "description": "Therapeutic diets for IBS, acidity, liver issues and digestive complications." },
    { "title": "Cardiac & Lifestyle Disorders", "description": "Nutritional therapy for hypertension, cholesterol and cardiovascular risk." }
  ],
  "procedures": [
    { "title": "Therapeutic Diet Planning", "description": "Customized diets for chronic diseases and metabolic conditions." },
    { "title": "Bariatric Nutrition Programs", "description": "Pre- and post-operative diet management for bariatric surgery patients." },
    { "title": "Clinical Nutrition Counseling", "description": "Diet plans for children, adults, elderly and special medical needs." },
    { "title": "Lifestyle & Preventive Nutrition", "description": "Weight management, fitness diets and long-term preventive nutrition." }
  ],
  "faqs": [
    { "question": "Does Ritika Samaddar specialize in bariatric nutrition?", "answer": "Yes, she is a trained bariatric nutritionist with international certification." },
    { "question": "Does she provide therapeutic diet plans?", "answer": "Yes, she designs medical and therapeutic diets for various chronic conditions." },
    { "question": "Does she help with weight-loss diets?", "answer": "Yes, she offers structured weight-loss, metabolic correction and lifestyle nutrition programs." }
  ]
},
{
  "slug": "dr-ritu-ahluwalia",
  "name": "Dr. Ritu Ahluwalia",
  "specialty": "Dental Care",
  "hospital": "Max Hospital – Saket East | Max Hospital – Panchsheel Park",
  "experience": "26+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Dental",
  "degree": "BDS | Certified in Cosmetic Dentistry & Dental Implants",
  "about": "Dr. Ritu Ahluwalia is a senior Dental Surgeon with over 26 years of clinical experience. She has been part of the core team that helped Max Hospital, Saket achieve JCI accreditation for its dental services. Her expertise includes cosmetic dentistry, full-mouth rehabilitation, root canal therapy, crowns and bridges, dentures and smile enhancement procedures.",
  "medicalProblems": [
    { "title": "Tooth Decay & Cavities", "description": "Diagnosis and treatment of decayed or damaged teeth." },
    { "title": "Missing Teeth", "description": "Restoration using dentures, crowns, bridges and implant-supported solutions." },
    { "title": "Cosmetic Dental Concerns", "description": "Smile correction, tooth discoloration and aesthetic enhancements." },
    { "title": "Gum & Oral Issues", "description": "Management of gum disease, oral infections and dental pain." }
  ],
  "procedures": [
    { "title": "Cosmetic Dentistry", "description": "Smile designing, veneers, bonding and aesthetic restorations." },
    { "title": "Root Canal Treatment (RCT)", "description": "Advanced rotary RCT for infected or painful teeth." },
    { "title": "Full Mouth Rehabilitation", "description": "Comprehensive restorative and functional rebuilding of teeth." },
    { "title": "Crowns, Bridges & Dentures", "description": "All-ceramic crowns, fixed bridges and complete/partial dentures." }
  ],
  "faqs": [
    { "question": "Does Dr. Ritu Ahluwalia perform cosmetic dentistry?", "answer": "Yes, she specializes in smile enhancement, veneers and cosmetic restorations." },
    { "question": "Does she perform root canal treatments?", "answer": "Yes, she has extensive experience in advanced and painless RCT procedures." },
    { "question": "Does she offer full mouth rehabilitation?", "answer": "Yes, she performs complete restorative treatments including crowns, bridges and dentures." }
  ]
},
{
  "slug": "dr-himanshu-agarwal",
  "name": "Dr. Himanshu Agarwal",
  "specialty": "Interventional Neurology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Saket East",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Director – Interventional Neurology",
  "degree": "MBBS | MD | DM (Interventional Neuroradiology & Neuroimaging, AIIMS)",
  "about": "Dr. Himanshu Agarwal is a highly skilled Interventional Neurologist with over 10 years of experience in advanced neuro-interventional procedures. He has previously served at AIIMS, Manipal Hospital and Max Healthcare. He specializes in minimally invasive treatments for stroke, aneurysms, AVMs, DAVFs and complex neurovascular conditions. He is the recipient of a Gold Medal from the President of India and has numerous national and international publications.",
  "medicalProblems": [
    { "title": "Stroke & Paralysis", "description": "Emergency and advanced management of ischemic and hemorrhagic stroke." },
    { "title": "Brain Aneurysms", "description": "Diagnosis and minimally invasive treatment of intracranial aneurysms." },
    { "title": "Arteriovenous Malformations (AVMs)", "description": "Endovascular treatment of cranial and spinal AVMs and DAVFs." },
    { "title": "Vascular Brain Disorders", "description": "Management of thrombosis, fistulas and complex neurovascular diseases." }
  ],
  "procedures": [
    { "title": "Mechanical Thrombectomy", "description": "Life-saving endovascular treatment for acute ischemic stroke." },
    { "title": "Aneurysm Coiling & Flow Diversion", "description": "Minimally invasive repair of brain aneurysms." },
    { "title": "Cerebral & Spinal Angiography", "description": "Advanced diagnostic imaging for brain and spine vascular structures." },
    { "title": "Carotid Stenting & Tumor Embolization", "description": "Endovascular intervention for carotid disease and tumor-related vascular control." }
  ],
  "faqs": [
    { "question": "Does Dr. Himanshu treat stroke cases?", "answer": "Yes, he specializes in emergency stroke care including mechanical thrombectomy." },
    { "question": "Does he treat brain aneurysms?", "answer": "Yes, he performs coiling, flow diversion and other minimally invasive procedures." },
    { "question": "Is he trained at AIIMS?", "answer": "Yes, he completed his DM in Interventional Neuroradiology & Neuroimaging from AIIMS, New Delhi." }
  ]
},
{
  "slug": "dr-danish-ahmed",
  "name": "Dr. Danish Ahmed",
  "specialty": "Mental Health & Behavioural Sciences, Psychiatry",
  "hospital": "Max Hospital – Saket East | Max Hospital – Saket West",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Psychiatry",
  "degree": "MBBS | DPM (Psychiatry)",
  "about": "Dr. Danish Ahmed is a skilled psychiatrist with over 12 years of experience in mental health, behavioural sciences and clinical psychiatry. He has trained at the Central Institute of Psychiatry (CIP), Ranchi—one of India's premier mental health institutions. He specializes in mood disorders, anxiety, addiction, personality disorders, child psychiatry and neurodevelopmental issues.",
  "medicalProblems": [
    { "title": "Anxiety Disorders", "description": "Treatment for generalized anxiety, panic disorder and phobias." },
    { "title": "Depression & Mood Disorders", "description": "Management of major depression, bipolar disorder and chronic mood instability." },
    { "title": "Addiction Disorders", "description": "Deaddiction therapy for alcohol, nicotine and substance-use disorders." },
    { "title": "Child & Adolescent Psychiatry", "description": "Treatment for ADHD, autism, behavioural and learning difficulties." }
  ],
  "procedures": [
    { "title": "Psychiatric Evaluation & Diagnosis", "description": "Comprehensive assessment for mental health disorders." },
    { "title": "Medication Management", "description": "Evidence-based treatment plans for psychiatric conditions." },
    { "title": "Psychotherapy & Counselling", "description": "Therapeutic support for emotional and behavioural issues." },
    { "title": "Addiction Treatment Programs", "description": "Structured deaddiction and relapse prevention therapies." }
  ],
  "faqs": [
    { "question": "Does Dr. Danish Ahmed treat anxiety and depression?", "answer": "Yes, he specializes in both anxiety disorders and mood disorders." },
    { "question": "Does he provide treatment for addiction?", "answer": "Yes, he offers clinical management and therapy for alcohol and substance addictions." },
    { "question": "Does he treat children?", "answer": "Yes, he manages childhood behavioural issues, ADHD, autism and learning difficulties." }
  ]
},
{
  "slug": "dr-pragnesh-desai",
  "name": "Dr. Pragnesh Desai",
  "specialty": "Urology, Kidney Transplant & Robotic Surgery",
  "hospital": "Max Hospital – Panchsheel Park | Max Hospital – Saket East",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Urology, Robotics & Renal Transplant",
  "degree": "MBBS | DNB (General Surgery) | M.Ch (Urology, AIIMS New Delhi)",
  "about": "Dr. Pragnesh Desai is an experienced urologist and renal transplant specialist with over 16 years in advanced urological care. He has extensive expertise in robotic and laparoscopic urology, kidney and prostate cancer, vascular urology, and complex renal transplant surgeries. He has worked across leading institutions including AIIMS, PSRI Hospital and Max Healthcare, contributing to high-volume transplant and minimally invasive urology programs.",
  "medicalProblems": [
    { "title": "Kidney & Prostate Cancer", "description": "Comprehensive evaluation and minimally invasive surgical management." },
    { "title": "Kidney Failure & Transplant Care", "description": "Renal transplant assessment and post-transplant management." },
    { "title": "Urological Disorders", "description": "Management of urinary tract obstruction, stones and prostate enlargement." },
    { "title": "Vascular & Robotic Urologic Conditions", "description": "Advanced robotic and vascular urological surgeries." }
  ],
  "procedures": [
    { "title": "Robotic & Laparoscopic Urological Surgery", "description": "Minimally invasive surgery for prostate, kidney and bladder conditions." },
    { "title": "Kidney Transplantation", "description": "Comprehensive transplant procedures including post-operative care." },
    { "title": "Onco-Urology Procedures", "description": "Surgery for kidney, bladder and prostate cancers." },
    { "title": "Endourological Procedures", "description": "Stone removal, ureteroscopy and laser surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Pragnesh Desai perform robotic surgeries?", "answer": "Yes, he specializes in robotic and laparoscopic minimally invasive urological surgeries." },
    { "question": "Does he handle kidney transplant cases?", "answer": "Yes, he has extensive experience in renal transplant surgeries and post-transplant care." },
    { "question": "Does he treat prostate and kidney cancer?", "answer": "Yes, he is highly experienced in onco-urology including prostate, bladder and kidney cancers." }
  ]
},
{
  "slug": "dr-aditya-dutta",
  "name": "Dr. Aditya Dutta",
  "specialty": "Endocrinology & Diabetes",
  "hospital": "Max Hospital – Saket East",
  "experience": "5+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Endocrinology & Diabetes",
  "degree": "MBBS | MD (Medicine) | DM (Endocrinology, PGIMER Chandigarh)",
  "about": "Dr. Aditya Dutta is a young and dynamic endocrinologist trained at premier institutes including PGIMER Chandigarh and VMMC-Safdarjung Hospital, New Delhi. He has special interest in diabetes, growth disorders, thyroid diseases, metabolic bone disorders and complex hormonal conditions. He has published multiple papers in peer-reviewed national and international journals.",
  "medicalProblems": [
    { "title": "Diabetes (Type 1 & Type 2)", "description": "Comprehensive glucose control, insulin therapy and complication management." },
    { "title": "Thyroid Disorders", "description": "Hypothyroidism, hyperthyroidism, thyroid nodules and autoimmune thyroid diseases." },
    { "title": "Hormonal & Growth Disorders", "description": "PCOS, pituitary disorders, adrenal tumors and growth abnormalities." },
    { "title": "Metabolic Bone & Calcium Disorders", "description": "Osteoporosis, parathyroid disorders and vitamin D-related issues." }
  ],
  "procedures": [
    { "title": "Diabetes Management Plans", "description": "Personalized medical therapy, insulin protocols and lifestyle planning." },
    { "title": "Thyroid & Hormonal Evaluation", "description": "Advanced diagnostics for endocrine disorders." },
    { "title": "Metabolic Bone Disorder Treatment", "description": "Osteoporosis management and calcium metabolism therapy." },
    { "title": "PCOS & Reproductive Endocrinology Care", "description": "Hormonal assessment and long-term management plans." }
  ],
  "faqs": [
    { "question": "Does Dr. Aditya Dutta treat diabetes?", "answer": "Yes, he specializes in Type 1, Type 2 and complex diabetes management." },
    { "question": "Does he treat thyroid disorders?", "answer": "Yes, he manages all thyroid-related conditions including autoimmune disorders." },
    { "question": "Does he handle hormonal and growth issues?", "answer": "Yes, he treats PCOS, pituitary, adrenal and growth hormone-related disorders." }
  ]
},
{
  "slug": "dr-shahnawaz-b-kaloo",
  "name": "Dr. Shahnawaz B. Kaloo",
  "specialty": "Radiology, Interventional Radiology",
  "hospital": "Max Hospital – Saket West",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Interventional Radiology",
  "degree": "MBBS | MD (Radiology) | PDCC (Interventional Radiology) | International Fellowship (Seoul National University Hospital)",
  "about": "Dr. Shahnawaz B. Kaloo is a highly skilled Interventional Radiologist with over 14 years of expertise in minimally invasive procedures for liver, oncology, vascular, nephrology and men's and women's health interventions. He has trained internationally in South Korea, Singapore, Austria, Japan and Taiwan, and is a senior faculty member for DrNB and Fellowship training programs.",
  "medicalProblems": [
    { "title": "Liver & Biliary Disorders", "description": "HCC, liver metastasis, biliary obstruction, portal hypertension." },
    { "title": "Oncology Interventions", "description": "Tumor biopsy, thyroid & parathyroid ablation, PICC and chemo-port placement." },
    { "title": "Renal & Dialysis Disorders", "description": "Dialysis access issues, kidney tumors, renal biopsies." },
    { "title": "Varicose Veins & Men's/Women's Health", "description": "Varicocele, fibroids, AVMs, BPH, and venous insufficiency." }
  ],
  "procedures": [
    { "title": "Liver Interventions (RFA, Microwave, TACE, TARE)", "description": "Advanced minimally invasive treatment for liver cancers." },
    { "title": "TIPS & BRTO", "description": "Portal hypertension and variceal bleeding management." },
    { "title": "PTBD & Liver Transplant Interventions", "description": "Biliary drainage and transplant-related procedures." },
    { "title": "Uterine & Prostate Artery Embolisation", "description": "Minimally invasive treatment for fibroids and BPH." }
  ],
  "faqs": [
    { "question": "Does Dr. Kaloo perform liver cancer procedures like TACE or TARE?", "answer": "Yes, he specializes in advanced liver and biliary interventions including TACE, TARE and ablation." },
    { "question": "Does he treat varicocele and fibroids?", "answer": "Yes, he performs embolisation procedures for varicocele, fibroids and AVMs." },
    { "question": "Does he perform dialysis access and kidney interventions?", "answer": "Yes, he performs dialysis catheter placement, fistula salvage and kidney tumor cryoablation." }
  ]
},
{
  "slug": "dr-rashmi-malik",
  "name": "Dr. Rashmi Malik",
  "specialty": "Dermatology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park | Max Hospital – Gurugram",
  "experience": "26+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Dermatology",
  "degree": "MBBS | MD (Dermatology) | Diploma in Dermatology (Royal College of Physicians & Surgeons, Glasgow)",
  "about": "Dr. Rashmi Malik is an experienced dermatologist with over 26 years in clinical dermatology and pediatric dermatology. She has worked extensively in the UK at London and Glasgow University Hospitals before joining Max Healthcare in 2006. She specializes in skin disorders across all age groups, with a special interest in paediatric dermatology and chronic dermatological conditions.",
  "medicalProblems": [
    { "title": "Paediatric Skin Conditions", "description": "Eczema, infections, birthmarks and childhood skin allergies." },
    { "title": "Chronic Skin Disorders", "description": "Psoriasis, dermatitis, vitiligo and urticaria management." },
    { "title": "Hair & Scalp Issues", "description": "Hair fall, dandruff, alopecia and fungal scalp infections." },
    { "title": "Acne & Pigmentation", "description": "Acne, melasma, post-inflammatory pigmentation and scars." }
  ],
  "procedures": [
    { "title": "Skin Allergy Testing", "description": "Patch testing and evaluation for allergic skin reactions." },
    { "title": "Pediatric Dermatology Treatments", "description": "Specialized care for childhood skin disorders." },
    { "title": "Laser & Aesthetic Dermatology", "description": "Laser treatments, pigmentation therapy and rejuvenation." },
    { "title": "Cryotherapy & Minor Procedures", "description": "Wart removal, mole removal and other dermatologic procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Rashmi Malik treat paediatric skin problems?", "answer": "Yes, paediatric dermatology is one of her primary specialties." },
    { "question": "Does she offer laser dermatology treatments?", "answer": "Yes, she provides laser and aesthetic dermatology services." },
    { "question": "Does she handle chronic skin conditions?", "answer": "Yes, she has extensive experience in treating psoriasis, vitiligo, eczema and other long-term conditions." }
  ]
},
{
  "slug": "dr-vikram-kumar",
  "name": "Dr. Vikram Kumar",
  "specialty": "Paediatric Gastroenterology, Hepatology & Liver Transplant",
  "hospital": "Max Hospital – Vaishali | Max Hospital – Saket Smart | Max Hospital – Patparganj | Max Hospital – Saket West | Max Hospital – Saket East",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Consultant – Paediatric Liver Transplantation, Gastroenterology & Hepatology",
  "degree": "MBBS | MD (Paediatrics, AIIMS New Delhi)",
  "about": "Dr. Vikram Kumar is a leading Paediatric Gastroenterologist and Liver Transplant specialist with 19+ years of diverse clinical experience at top institutions like AIIMS, Medanta and Fortis. He has worked in international vaccine trials, contributed to major paediatric liver research, and has published extensively in national and international journals. He is known for his expertise in paediatric liver diseases, GI disorders, liver transplantation and advanced paediatric endoscopic procedures.",
  "medicalProblems": [
    { "title": "Paediatric Liver Diseases", "description": "Hepatitis, biliary atresia, metabolic liver disorders and acute liver failure." },
    { "title": "Paediatric Gastrointestinal Disorders", "description": "Celiac disease, chronic diarrhoea, abdominal pain and nutritional disorders." },
    { "title": "Paediatric Hepatology", "description": "Management of chronic liver disease, jaundice and portal hypertension in children." },
    { "title": "Pre & Post Liver Transplant Care", "description": "Comprehensive evaluation, transplant planning and follow-up." }
  ],
  "procedures": [
    { "title": "Paediatric Endoscopy & Colonoscopy", "description": "Advanced diagnostic and therapeutic GI endoscopic procedures for children." },
    { "title": "Paediatric Liver Transplant Evaluation", "description": "Assessment and preparation for liver transplant in children." },
    { "title": "Liver Biopsy & Hepatology Procedures", "description": "Specialized procedures for accurate liver disease diagnosis." },
    { "title": "GI Therapeutic Procedures", "description": "Treatment for GI bleeds, foreign body removal and polyp removal." }
  ],
  "faqs": [
    { "question": "Does Dr. Vikram Kumar treat paediatric liver diseases?", "answer": "Yes, he specializes in managing complex liver disorders in children including biliary atresia and hepatitis." },
    { "question": "Does he perform paediatric endoscopy?", "answer": "Yes, he is highly trained in paediatric endoscopic and colonoscopic procedures." },
    { "question": "Is he involved in paediatric liver transplant care?", "answer": "Yes, he has extensive experience in paediatric liver transplant evaluation and management." }
  ]
},
{
  "slug": "dr-akshat-malik",
  "name": "Dr. Akshat Malik",
  "specialty": "Surgical Oncology, Head & Neck Oncology, Robotic Surgery",
  "hospital": "Max Hospital – Panchsheel Park | Max Hospital – Saket Smart | Max Hospital – Saket East",
  "experience": "7+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Head & Neck Surgical Oncology & Robotic Surgery",
  "degree": "MBBS | MS (General Surgery) | DNB | M.Ch (Head & Neck Surgery)",
  "about": "Dr. Akshat Malik is a highly specialized Head & Neck Oncosurgeon with advanced training from Tata Memorial Centre (Mumbai), Imperial College NHS Trust (London), Royal Marsden Hospital (London) and international fellowships in Australia and the UK. He is skilled in robotic and minimally-invasive head & neck cancer surgeries, thyroid cancer, oral cancer, skull base procedures and complex neck tumor surgeries.",
  "medicalProblems": [
    { "title": "Head & Neck Cancers", "description": "Oral, throat, larynx, hypopharynx, oropharyngeal and advanced neck cancers." },
    { "title": "Thyroid & Parathyroid Tumors", "description": "Evaluation and surgical management of thyroid cancers and neck masses." },
    { "title": "Skull Base & Paranasal Tumors", "description": "Comprehensive care for deep-seated and rare head & neck tumors." },
    { "title": "Airway & Vocal Cord Disorders", "description": "Surgical intervention for airway obstruction, laryngeal tumors and voice-related disorders." }
  ],
  "procedures": [
    { "title": "Trans-Oral Robotic Surgery (TORS)", "description": "Minimally invasive robotic surgery for throat and oropharyngeal cancers." },
    { "title": "Trans-Oral Laser Surgery", "description": "Laser-assisted precision surgery for selected head & neck lesions." },
    { "title": "Thyroid & Parathyroid Surgery", "description": "Advanced cancer and minimally-invasive thyroid surgeries." },
    { "title": "Skull Base & Neck Tumor Surgery", "description": "Complex tumor resections with reconstruction." }
  ],
  "faqs": [
    { "question": "Does Dr. Akshat Malik perform robotic surgeries?", "answer": "Yes, he is a certified robotic surgeon specializing in TORS and robotic thyroid/head & neck cancer surgery." },
    { "question": "Does he treat thyroid cancer?", "answer": "Yes, he performs advanced thyroid cancer surgeries including minimally invasive approaches." },
    { "question": "Does he manage oral cancer patients?", "answer": "Yes, he has extensive training in oral and oropharyngeal cancer treatment from Tata Memorial Centre." }
  ]
},
{
  "slug": "dr-deepali-garg-mathur",
  "name": "Dr. Deepali Garg Mathur",
  "specialty": "Ophthalmology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park | Max Hospital – Saket East",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Ophthalmology",
  "degree": "MBBS | MS (Ophthalmology) | DNB | MNAMS",
  "about": "Dr. Deepali Garg Mathur is an experienced ophthalmologist with over 17 years of expertise in cataract surgery, LASIK, squint and paediatric ophthalmology. She has trained at premier institutions including Maulana Azad Medical College (MAMC) and has served as Senior Resident with specialized focus on paediatric eye disorders and squint correction. She has been associated with leading eye institutes in Delhi and has multiple research contributions.",
  "medicalProblems": [
    { "title": "Squint & Paediatric Eye Disorders", "description": "Comprehensive treatment for strabismus and childhood vision problems." },
    { "title": "Cataract", "description": "Diagnosis and management of cataracts in adults and children." },
    { "title": "Refractive Errors", "description": "Myopia, hyperopia and astigmatism requiring medical or surgical correction." },
    { "title": "Dry Eye & Ocular Surface Issues", "description": "Management of dry eye, allergies and surface inflammation." }
  ],
  "procedures": [
    { "title": "Paediatric Ophthalmology & Squint Surgery", "description": "Specialized evaluation and surgical correction of squint and childhood visual problems." },
    { "title": "Cataract Surgery", "description": "Phacoemulsification and premium lens implantation." },
    { "title": "LASIK & Refractive Procedures", "description": "Laser vision correction for refractive errors." },
    { "title": "Ocular Surface Procedures", "description": "Management of pterygium, chalazion and minor lid surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Deepali Garg Mathur perform squint surgery?", "answer": "Yes, she is highly experienced in paediatric ophthalmology and squint correction." },
    { "question": "Does she perform cataract surgery?", "answer": "Yes, she is trained in modern cataract surgery with advanced IOL options." },
    { "question": "Does she handle paediatric eye cases?", "answer": "Yes, she specializes in childhood eye diseases, squint and refractive issues." }
  ]
},
{
  "slug": "dr-pankaj-panwar",
  "name": "Dr. Pankaj Panwar",
  "specialty": "Uro-Oncology, Robotic Surgery, Surgical Oncology",
  "hospital": "Max Hospital – Saket East",
  "experience": "—",
  "image": "",
  "isTopDoctor": true,
  "position": "Principal Consultant – Uro-Oncology & Robotic Surgery",
  "degree": "MBBS | MS (General Surgery) | MRCS (Edinburgh) | MCh (Urology, PGIMER Chandigarh) | FRCS (Urology, UK)",
  "about": "Dr. Pankaj Panwar is an internationally trained Uro-Oncologist and Robotic Surgeon with extensive experience in advanced urological cancers, minimally invasive surgeries, robotic procedures and kidney transplant-related surgeries. He has worked at leading centers in the UK including University Hospitals of North Midlands and Guy’s Hospital, London. He has also completed prestigious fellowships in robotic uro-oncology across Europe. He has multiple publications in international journals and is a recipient of numerous global awards and surgical fellowships.",
  "medicalProblems": [
    { "title": "Bladder Cancer", "description": "Diagnosis and surgical management including robotic radical cystectomy." },
    { "title": "Prostate Cancer", "description": "Evaluation, biopsy, staging and robotic radical prostatectomy." },
    { "title": "Kidney Cancer", "description": "Management of renal masses with robotic partial or radical nephrectomy." },
    { "title": "Testicular & Penile Cancer", "description": "Comprehensive surgical care for rare and complex urological cancers." }
  ],
  "procedures": [
    { "title": "Robotic Radical Prostatectomy", "description": "Minimally invasive robotic surgery for prostate cancer." },
    { "title": "Robotic Partial Nephrectomy", "description": "Kidney tumor removal with nephron-sparing techniques." },
    { "title": "Robotic Radical Cystectomy", "description": "Bladder cancer surgery with ileal conduit or neobladder reconstruction." },
    { "title": "Adrenal & Complex Reconstructive Procedures", "description": "Robotic adrenalectomy, ureteric reimplantation and advanced uro-oncology surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Pankaj Panwar specialize in robotic cancer surgery?", "answer": "Yes, he is extensively trained in robotic uro-oncology procedures including prostate, kidney and bladder cancers." },
    { "question": "Does he treat prostate and bladder cancer?", "answer": "Yes, he offers advanced management and robotic surgical treatment for prostate and bladder cancers." },
    { "question": "Does he perform minimally invasive kidney tumor surgery?", "answer": "Yes, he performs robotic partial and radical nephrectomy for kidney cancer." }
  ]
},
{
  "slug": "dr-aman-popli",
  "name": "Dr. Aman Popli",
  "specialty": "Cosmetic Dentistry, Prosthodontics & Implantology",
  "hospital": "Max Hospital – Dwarka | Max Hospital – Panchsheel Park | Max Hospital – Gurugram | Max Hospital – Saket East",
  "experience": "28+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant – Cosmetic Dentistry, Prosthodontics & Implantology",
  "degree": "BDS | MDS (Prosthodontics) | Diplomate, World Congress of Oral Implantology (Japan)",
  "about": "Dr. Aman Popli is a senior Prosthodontist, Cosmetic Dentist and Implantologist with over 28 years of clinical experience. He has been associated with Max Healthcare for over 20 years and has extensive expertise in full mouth rehabilitation, crowns, dentures, implants, aesthetic dentistry and TMJ-related issues. He is a key opinion leader in oral rehabilitation, has trained nationally and internationally, and has held editorial and leadership roles in dental organizations.",
  "medicalProblems": [
    { "title": "Missing Teeth & Tooth Loss", "description": "Implants, dentures and prosthetic rehabilitation for partial or complete tooth loss." },
    { "title": "Cosmetic Dental Issues", "description": "Smile design, veneers, aesthetic restorations and ceramic crowns." },
    { "title": "TMJ Disorders", "description": "Diagnosis and treatment for jaw joint pain, clicking and dysfunction." },
    { "title": "Tooth Decay & Structural Damage", "description": "Restorative treatments for damaged, worn-out or decayed teeth." }
  ],
  "procedures": [
    { "title": "Full Mouth Rehabilitation", "description": "Comprehensive aesthetic and functional reconstruction of the entire dentition." },
    { "title": "Dental Implants & Implant Suprastructures", "description": "Advanced implant placement and prosthetic restorations including overdentures." },
    { "title": "Crown & Bridge Work", "description": "All-ceramic, zirconia and cosmetic crown & bridge restorations." },
    { "title": "Aesthetic Dentistry & Smile Design", "description": "Veneers, laminates and cosmetic enhancements for smile correction." }
  ],
  "faqs": [
    { "question": "Does Dr. Aman Popli perform full mouth rehabilitation?", "answer": "Yes, he has vast experience in comprehensive dental rehabilitation including implants and prosthetics." },
    { "question": "Does he offer cosmetic dentistry services?", "answer": "Yes, he specializes in veneers, smile design and aesthetic restorations." },
    { "question": "Does he treat TMJ-related issues?", "answer": "Yes, he manages jaw joint problems including pain, misalignment and dysfunction." }
  ]
},
{
  "slug": "dr-deepali-bhardwaj",
  "name": "Dr. Deepali Bhardwaj",
  "specialty": "Dermatology",
  "hospital": "Max Hospital – Saket West",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Dermatology",
  "degree": "MBBS | DVDL | MD (IM) | FEADV (Germany) | FAAD (Iran)",
  "about": "Dr. Deepali Bhardwaj is an award-winning dermatologist with extensive experience in clinical dermatology, cosmetic dermatology, lasers, allergy management, anti-ageing treatments and hair restoration. She has served as Honorary Dermatologist at the President Estate Clinic (Rashtrapati Bhawan) and as Visiting Faculty at AIIMS Rishikesh. She is known for her expertise in advanced dermatological procedures, innovative allergy treatments, vitiligo grafting, scar revision, and hair transplantation.",
  "medicalProblems": [
    { "title": "Skin Allergies", "description": "Comprehensive allergy testing and treatment for chronic skin reactions." },
    { "title": "Acne & Acne Scars", "description": "Advanced medical therapy and scar revision using lasers and chemical peels." },
    { "title": "Pigmentation Disorders", "description": "Melasma, freckles and uneven skin tone correction." },
    { "title": "Hair Loss & Scalp Disorders", "description": "FUE hair transplantation and medical hair restoration." }
  ],
  "procedures": [
    { "title": "Laser Treatments", "description": "Laser resurfacing, scar revision, pigmentation and anti-ageing laser procedures." },
    { "title": "Injectables (Botox, Fillers, Threads)", "description": "Non-surgical facial rejuvenation and anti-ageing solutions." },
    { "title": "Vitiligo Surgery (SSTG & Grafting)", "description": "Skin grafting and innovative vitiligo surgical techniques." },
    { "title": "Hair Transplantation", "description": "FUE and strip method hair restoration." }
  ],
  "faqs": [
    { "question": "Does Dr. Deepali treat acne scars?", "answer": "Yes, she specializes in laser resurfacing and scar revision for acne scars." },
    { "question": "Does she perform hair transplantation?", "answer": "Yes, she performs FUE and strip method hair transplant procedures." },
    { "question": "Does she provide anti-ageing treatments?", "answer": "Yes, she offers Botox, fillers, thread lifts and advanced laser anti-ageing treatments." }
  ]
},
{
  "slug": "dr-muzaffer-rashid-shawl",
  "name": "Dr. Muzaffer Rashid Shawl",
  "specialty": "Gastroenterology, Hepatology & Endoscopy",
  "hospital": "Max Hospital – Saket Smart | Max Hospital – Saket East | Max Hospital – Saket West",
  "experience": "7+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Gastroenterology, Hepatology & Endoscopy",
  "degree": "MBBS | MD (Medicine) | DNB (Gastroenterology)",
  "about": "Dr. Muzaffer Rashid Shawl is a Gastroenterologist and Hepatologist with expertise in endoscopy, gastrointestinal tumors, liver diseases and pancreatic disorders. He has previously served as Assistant Professor at HAHC Hospital and has worked across multiple reputed institutes. He has been recognized for academic excellence and has presented award-winning research on chronic kidney disease and liver donor assessments.",
  "medicalProblems": [
    { "title": "Liver Diseases", "description": "Management of fatty liver, hepatitis, liver inflammation and liver-related complications." },
    { "title": "Pancreatic Disorders", "description": "Evaluation and treatment of acute and chronic pancreatitis." },
    { "title": "Gastrointestinal Tumors", "description": "Diagnosis and treatment of cancers of the digestive tract." },
    { "title": "Acid Reflux & Digestive Disorders", "description": "GERD, bloating, indigestion and functional bowel issues." }
  ],
  "procedures": [
    { "title": "Diagnostic & Therapeutic Endoscopy", "description": "Upper GI endoscopy, biopsies and therapeutic interventions." },
    { "title": "Colonoscopy", "description": "Screening and diagnosis for colon diseases and polyps." },
    { "title": "Liver & Pancreas Evaluation", "description": "Advanced liver function assessment and pancreas-related interventions." },
    { "title": "Tumor Evaluation & Biopsy", "description": "Endoscopic diagnosis and guided biopsy for GI tumors." }
  ],
  "faqs": [
    { "question": "Does Dr. Muzaffer treat liver disease?", "answer": "Yes, he treats fatty liver, hepatitis and complex liver conditions." },
    { "question": "Does he perform endoscopy?", "answer": "Yes, he performs diagnostic and therapeutic endoscopy routinely." },
    { "question": "Does he manage pancreatic disorders?", "answer": "Yes, he evaluates and treats both acute and chronic pancreatitis." }
  ]
},
{
  "slug": "dr-upasana-singh",
  "name": "Dr. Upasana Singh",
  "specialty": "Dental Care",
  "hospital": "Max Hospital – Dwarka | Max Hospital – Gurugram | Max Hospital – Saket East",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Dental",
  "degree": "BDS | Certification in Cosmetic Dentistry (New York)",
  "about": "Dr. Upasana Singh is a highly experienced dental surgeon with over 20 years in clinical dentistry. She has been associated with Max Healthcare since 2009 and previously worked at Air Force Station, New Delhi. She specializes in cosmetic dentistry, smile enhancement, teeth whitening and full mouth rehabilitation. Her expertise also includes preventive dental care and restorative procedures.",
  "medicalProblems": [
    { "title": "Cosmetic Dental Issues", "description": "Smile enhancement, discoloration, chipped teeth and aesthetic concerns." },
    { "title": "Tooth Decay & Cavities", "description": "Diagnosis and treatment of dental caries and damaged teeth." },
    { "title": "Missing Teeth", "description": "Rehabilitation with crowns, bridges and dentures." },
    { "title": "Gum & Oral Health Problems", "description": "Management of gingivitis, sensitivity and oral hygiene issues." }
  ],
  "procedures": [
    { "title": "Cosmetic Dentistry", "description": "Smile makeover, veneers and aesthetic restorations." },
    { "title": "Teeth Whitening", "description": "Professional whitening treatments for enhanced smile brightness." },
    { "title": "Full Mouth Rehabilitation", "description": "Restoring function and aesthetics using crowns, bridges and dentures." },
    { "title": "Routine Dental Procedures", "description": "Fillings, scaling, polishing and preventive dental care." }
  ],
  "faqs": [
    { "question": "Does Dr. Upasana Singh specialize in cosmetic dentistry?", "answer": "Yes, she is certified in cosmetic dentistry from New York and performs a wide range of aesthetic dental procedures." },
    { "question": "Does she perform teeth whitening?", "answer": "Yes, she offers professional whitening treatments for brighter smiles." },
    { "question": "Does she offer full mouth rehabilitation?", "answer": "Yes, she provides comprehensive restorative treatments including crowns, bridges and dentures." }
  ]
},
{
  "slug": "dr-swetal-chouhan",
  "name": "Dr. Swetal Chouhan",
  "specialty": "Rheumatology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Gurugram | Max Hospital – Saket Smart | Max Hospital – Saket East",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Rheumatology",
  "degree": "MBBS | DNB (Internal Medicine) | Fellowship in Rheumatology (Max Institute of Medical Sciences) | EULAR Rheumatology Certification",
  "about": "Dr. Swetal Chouhan is a Consultant Rheumatologist with over 11 years of experience in diagnosing and treating autoimmune and inflammatory rheumatic diseases. She has completed two years of fellowship in Rheumatology, received EULAR-accredited training, and has expertise in arthritis, autoimmune disorders, musculoskeletal ultrasound, vasculitis and systemic autoimmune diseases.",
  "medicalProblems": [
    { "title": "Rheumatoid Arthritis", "description": "Diagnosis and long-term management of inflammatory joint disease." },
    { "title": "Spondyloarthritis", "description": "Treatment for ankylosing spondylitis and related inflammatory spine conditions." },
    { "title": "Systemic Lupus Erythematosus (SLE)", "description": "Evaluation and management of autoimmune lupus disorders." },
    { "title": "Vasculitis & Autoimmune Disorders", "description": "Care for complex immune-mediated conditions affecting multiple organs." }
  ],
  "procedures": [
    { "title": "Musculoskeletal Ultrasound", "description": "Ultrasound-based assessment of joints, tendons and inflammatory activity." },
    { "title": "Arthritis Management Plans", "description": "Medical therapy and long-term disease control for arthritis patients." },
    { "title": "Autoimmune Disease Treatment", "description": "Advanced immunotherapy-based treatment for systemic autoimmune conditions." },
    { "title": "Biologic Therapy Initiation", "description": "Evaluation and initiation of biologics for severe rheumatic diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Swetal treat rheumatoid arthritis?", "answer": "Yes, she specializes in the diagnosis and treatment of rheumatoid arthritis." },
    { "question": "Does she perform musculoskeletal ultrasound?", "answer": "Yes, she is trained in musculoskeletal ultrasound for joint evaluation." },
    { "question": "Does she treat autoimmune and vasculitis disorders?", "answer": "Yes, she manages a wide range of autoimmune diseases including vasculitis and lupus." }
  ]
},
{
  "slug": "dr-karandeep-guleria",
  "name": "Dr. Karandeep Guleria",
  "specialty": "Urology, Kidney Transplant, Uro-Oncology, Robotic Surgery",
  "hospital": "Max Hospital – Saket East",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Urology, Kidney Transplant, Robotics & Uro-Oncology",
  "degree": "MBBS | MS (General Surgery) | MCh (Urology & Renal Transplant, ABVIMS & RML) | Fellowship in Uro-Oncology & Robotic Surgery (Vattikuti Foundation, USA)",
  "about": "Dr. Karandeep Guleria is a Urologist and Robotic Surgeon with advanced training in Uro-Oncology, Renal Transplant, Endourology and reconstructive urology. He has trained at leading national and international institutions including the Vattikuti Foundation in the USA. He has received multiple international awards for surgical excellence and research, and has presented his work globally.",
  "medicalProblems": [
    { "title": "Kidney Stones & Urinary Obstruction", "description": "Evaluation and management of stones, obstruction and urinary tract diseases." },
    { "title": "Prostate Disorders", "description": "Diagnosis and treatment of prostate enlargement and prostate cancer." },
    { "title": "Urological Cancers", "description": "Management of kidney, bladder, prostate and testicular cancers." },
    { "title": "Male Fertility & Andrology", "description": "Treatment of men's health issues including infertility and sexual dysfunction." }
  ],
  "procedures": [
    { "title": "Robotic & Laparoscopic Urological Surgeries", "description": "Minimally invasive robotic procedures for prostate, kidney and bladder conditions." },
    { "title": "Renal Transplant Surgery", "description": "Kidney transplant procedures and postoperative care." },
    { "title": "Endourology", "description": "Laser procedures for stones, strictures and urinary tract disorders." },
    { "title": "Reconstructive Urology", "description": "Urethroplasty and complex reconstructive surgeries of the urinary tract." }
  ],
  "faqs": [
    { "question": "Does Dr. Karandeep perform robotic urological surgeries?", "answer": "Yes, he has advanced robotic training and performs minimally invasive urological procedures." },
    { "question": "Does he treat kidney and bladder cancers?", "answer": "Yes, he specializes in uro-oncology and manages all major urological cancers." },
    { "question": "Does he perform kidney transplants?", "answer": "Yes, he is trained in renal transplant surgery and related procedures." }
  ]
},
{
  "slug": "dr-lipy-gupta",
  "name": "Dr. Lipy Gupta",
  "specialty": "Dermatology",
  "hospital": "Max Hospital – Saket West | Max Hospital – Panchsheel Park",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Dermatology, Cosmetology & Laser Medicine",
  "degree": "MBBS | MD (Dermatology, UCMS Delhi)",
  "about": "Dr. Lipy Gupta is an experienced dermatologist and cosmetologist with over 15 years of expertise in treating skin, hair and aesthetic concerns. She has served as Assistant Professor at Dr. RML Hospital & PGIMER and has been associated with Max Healthcare since 2013. Her clinical interest includes acne management, pigmentation correction, hair restoration and advanced anti-ageing treatments.",
  "medicalProblems": [
    { "title": "Acne & Pigmentation", "description": "Treatment for acne, post-acne pigmentation and acne scars." },
    { "title": "Hair Loss Disorders", "description": "Evaluation and procedures for hair fall, alopecia and scalp issues." },
    { "title": "Skin Allergies & Dermatitis", "description": "Management of allergic reactions, eczema and chronic skin irritation." },
    { "title": "Ageing & Skin Rejuvenation", "description": "Non-surgical anti-ageing treatments for fine lines and dull skin." }
  ],
  "procedures": [
    { "title": "Laser Treatments", "description": "Laser therapy for pigmentation, skin rejuvenation and scar reduction." },
    { "title": "Botox & Fillers", "description": "Aesthetic procedures for wrinkle reduction and facial contouring." },
    { "title": "Thread Lift", "description": "Non-surgical facial lifting and tightening procedures." },
    { "title": "Chemical Peels", "description": "Peels for acne, glow enhancement and pigmentation control." }
  ],
  "faqs": [
    { "question": "Does Dr. Lipy Gupta treat acne and acne scars?", "answer": "Yes, she specializes in acne management, pigmentation and scar correction." },
    { "question": "Does she perform laser and anti-ageing procedures?", "answer": "Yes, she offers lasers, Botox, fillers and advanced rejuvenation treatments." },
    { "question": "Does she treat hair fall?", "answer": "Yes, she manages hair loss disorders and provides hair restoration therapies." }
  ]
},
{
  "slug": "dr-mukesh-kumar",
  "name": "Dr. Mukesh Kumar",
  "specialty": "Liver Transplant & Biliary Sciences",
  "hospital": "Max Hospital – Saket West",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Centre for Liver & Biliary Sciences",
  "degree": "MBBS | MS (General Surgery) | DrNB (Surgical Gastroenterology) | Fellowships in HPB & Liver Transplant Surgery (Max Healthcare & Seoul National University, South Korea)",
  "about": "Dr. Mukesh Kumar is a skilled Liver Transplant and HPB (Hepato-Pancreato-Biliary) surgeon with advanced training from Seoul National University Hospital, South Korea, and Max Hospital, Delhi. He has extensive experience in living and deceased donor liver transplantation, complex HPB surgeries, robotic and laparoscopic procedures, and pediatric liver transplant surgeries. He has been part of major national and international conferences and has multiple scientific publications.",
  "medicalProblems": [
    { "title": "Liver Failure", "description": "Evaluation and management of acute and chronic liver failure requiring transplant." },
    { "title": "Liver Cirrhosis & Portal Hypertension", "description": "Comprehensive care for cirrhosis, complications and portal pressure disorders." },
    { "title": "HPB Cancers", "description": "Management of liver, pancreas and biliary tract cancers." },
    { "title": "Gallbladder & Biliary Disorders", "description": "Treatment for gallstones, biliary obstruction and congenital biliary conditions." }
  ],
  "procedures": [
    { "title": "Living & Deceased Donor Liver Transplantation", "description": "Complete transplant evaluation, surgery and postoperative care." },
    { "title": "Robotic & Laparoscopic HPB Surgeries", "description": "Minimally invasive surgeries for hepatobiliary and pancreatic diseases." },
    { "title": "Whipple Surgery", "description": "Advanced pancreatic surgery for cancer and complex lesions." },
    { "title": "Pediatric Liver Transplant", "description": "Specialized transplant and biliary atresia surgeries for children." }
  ],
  "faqs": [
    { "question": "Does Dr. Mukesh Kumar perform liver transplants?", "answer": "Yes, he specializes in living and deceased donor liver transplantation." },
    { "question": "Does he perform robotic liver surgery?", "answer": "Yes, he is trained in robotic and laparoscopic HPB & donor surgeries." },
    { "question": "Does he treat liver and pancreatic cancers?", "answer": "Yes, he manages a wide range of HPB cancers with advanced surgical care." }
  ]
},
{
  "slug": "dr-shakuntala-naglot",
  "name": "Dr. Shakuntala Naglot",
  "specialty": "ENT (Ear, Nose & Throat)",
  "hospital": "Max Hospital – Dwarka | Max Hospital – Saket East",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – ENT",
  "degree": "MBBS | MS (ENT, Lady Hardinge Medical College)",
  "about": "Dr. Shakuntala Naglot is an experienced ENT specialist with over 16 years of clinical experience. She completed her MBBS and MS in ENT from Lady Hardinge Medical College, New Delhi, followed by senior residency training. She has expertise in managing ear diseases, pediatric ENT conditions and routine ENT surgeries with a patient-focused approach.",
  "medicalProblems": [
    { "title": "Ear Infections & Hearing Issues", "description": "Management of chronic ear infections, hearing loss and ear discharge." },
    { "title": "Throat & Voice Disorders", "description": "Treatment for tonsillitis, hoarseness, sore throat and swallowing issues." },
    { "title": "Nasal & Sinus Problems", "description": "Deviated septum, sinusitis, nasal blockage and allergy-related issues." },
    { "title": "Pediatric ENT Conditions", "description": "Specialised care for ENT issues in children including adenoids and tonsils." }
  ],
  "procedures": [
    { "title": "Ear Surgeries", "description": "Ear drum repair, middle ear procedures and microsurgery for hearing improvement." },
    { "title": "Pediatric ENT Procedures", "description": "Tonsillectomy, adenoidectomy and management of childhood ENT disorders." },
    { "title": "Endoscopic Sinus Surgery", "description": "Minimally invasive surgery for sinusitis and nasal obstruction." },
    { "title": "Microlaryngeal Surgery", "description": "Surgery for voice disorders and vocal cord abnormalities." }
  ],
  "faqs": [
    { "question": "Does Dr. Shakuntala treat children's ENT problems?", "answer": "Yes, she has expertise in pediatric ENT issues including tonsils and adenoids." },
    { "question": "Does she perform ear surgeries?", "answer": "Yes, she performs a variety of ear-related surgical procedures." },
    { "question": "Does she treat sinus and nasal problems?", "answer": "Yes, she manages sinusitis, allergies and nasal blockages including endoscopic procedures." }
  ]
},
{
  "slug": "dr-vaishali-paliwal",
  "name": "Dr. Vaishali Paliwal",
  "specialty": "Gynaecologic Oncology",
  "hospital": "Max Hospital – Saket East",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Gynaecologic Oncology",
  "degree": "MBBS | MS (Obstetrics & Gynaecology, MAMC Delhi) | MCh (Gynaecologic Oncology, Tata Memorial Centre) | MRCOG (UK) | ESGO Certification | Fellowships in Minimal Access & Robotic Surgery",
  "about": "Dr. Vaishali Paliwal is a dedicated Gynaecologic Oncologist trained at India’s top cancer institute, Tata Memorial Centre, Mumbai. She specializes in advanced cancer surgeries, minimally invasive (laparoscopic & robotic) gynecologic oncology, HIPEC, and PIPAC procedures. She has contributed to surgical innovations including the Bakri Balloon technique in pelvic exenteration and has been part of major oncology trials at TMC. With extensive national and international training, she brings expertise in comprehensive women’s cancer care.",
  "medicalProblems": [
    { "title": "Cervical Cancer", "description": "Evaluation and surgical management of early and advanced cervical cancers." },
    { "title": "Ovarian Cancer", "description": "Diagnosis, staging and treatment of ovarian malignancies." },
    { "title": "Endometrial & Uterine Cancers", "description": "Comprehensive care for endometrial cancer with minimally invasive approaches." },
    { "title": "Gynecologic Pre-cancer Lesions", "description": "Management of CIN, complex ovarian masses and high-risk lesions." }
  ],
  "procedures": [
    { "title": "Gynaecologic Cancer Surgeries", "description": "Radical hysterectomy, staging procedures and tumor debulking surgeries." },
    { "title": "Minimal Access Surgery (Laparoscopic & Robotic)", "description": "Advanced minimally invasive surgery for gynecologic cancers." },
    { "title": "HIPEC", "description": "Hyperthermic Intraperitoneal Chemotherapy for advanced ovarian cancer." },
    { "title": "PIPAC Procedure", "description": "Pressurised Intra-Peritoneal Aerosolised Chemotherapy for recurrent peritoneal cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Vaishali Paliwal perform robotic gynecologic cancer surgeries?", "answer": "Yes, she is trained in robotic and laparoscopic oncology procedures." },
    { "question": "Does she treat ovarian and cervical cancers?", "answer": "Yes, she specializes in the complete surgical management of women’s cancers." },
    { "question": "Does she perform HIPEC and PIPAC procedures?", "answer": "Yes, she is trained in HIPEC and PIPAC for advanced and recurrent cancers." }
  ]
},
{
  "slug": "somya-shrivastava",
  "name": "Somya Shrivastava",
  "specialty": "Dietetics, Nutrition & Dietetics",
  "hospital": "Max Hospital – Saket East | Max Hospital – Saket West",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Dietetics & Clinical Nutrition",
  "degree": "B.Sc (Home Science, Lady Irwin College) | M.Sc (Food & Nutrition, M.H. College of Science & Home Science) | Certifications in Critical Care Nutrition, Sports Nutrition, Diabetes Education & Pediatric Nutrition | Trained Bariatric Nutritionist",
  "about": "Somya Shrivastava is a senior clinical nutritionist with over 19 years of experience in therapeutic nutrition, bariatric nutrition, sports nutrition, and critical care dietary management. She has been associated with Max Healthcare for more than 12 years and has contributed extensively to clinical research, national and international presentations, bariatric programs, and public health nutrition initiatives. She is known for creating customized diet plans for chronic diseases, weight management and metabolic disorders.",
  "medicalProblems": [
    { "title": "Obesity & Weight Management", "description": "Bariatric nutrition, weight loss planning and metabolic health improvement." },
    { "title": "Diabetes & Metabolic Disorders", "description": "Diet plans tailored for blood sugar control and insulin resistance." },
    { "title": "Pediatric Nutrition", "description": "Nutritional care for children including deficiencies and special needs diets." },
    { "title": "Critical Care Nutrition", "description": "Therapeutic diets for ICU patients and chronic illness recovery." }
  ],
  "procedures": [
    { "title": "Personalized Diet Plans", "description": "Condition-specific nutrition plans for lifestyle diseases and long-term health." },
    { "title": "Bariatric Nutrition Support", "description": "Pre- and post-bariatric surgery nutrition guidance." },
    { "title": "Sports Nutrition Planning", "description": "Nutrition strategies for athletes and fitness-focused individuals." },
    { "title": "Clinical Nutrition Counseling", "description": "Therapeutic nutrition for cardiac, renal, hepatic and metabolic conditions." }
  ],
  "faqs": [
    { "question": "Does Somya Shrivastava specialize in bariatric nutrition?", "answer": "Yes, she is a trained bariatric nutritionist with expertise in pre- and post-surgery dietary care." },
    { "question": "Does she provide diet plans for diabetes?", "answer": "Yes, she offers customized nutrition programs for diabetes and metabolic syndrome." },
    { "question": "Does she offer pediatric nutrition guidance?", "answer": "Yes, she is certified in pediatric nutrition and provides child-specific diet plans." }
  ]
},
{
  "slug": "dr-vivek-vasudeo",
  "name": "Dr. Vivek Vasudeo",
  "specialty": "Urology & Robotic Surgery",
  "hospital": "Max Hospital – Saket East",
  "experience": "5+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Urology & Robotic Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Urology) | Fellowship in Uro-Oncology & Robotic Surgery",
  "about": "Dr. Vivek Vasudeo is a skilled urologist and robotic surgeon with extensive experience in uro-oncology and minimally invasive procedures. He has trained and worked at leading institutes including Rajiv Gandhi Cancer Institute & Research Centre and Sardar Patel Medical College. His expertise includes robotic prostate, kidney, and bladder cancer surgeries, advanced endourology, reconstructive urology, and complex oncological procedures.",
  "medicalProblems": [
    { "title": "Prostate Disorders", "description": "Management of prostate cancer, BPH and prostate-related conditions." },
    { "title": "Kidney & Bladder Tumors", "description": "Evaluation and treatment of urological cancers through minimally invasive surgery." },
    { "title": "Ureteric & Urinary Tract Issues", "description": "Treatment for strictures, stones and reconstructive urinary conditions." },
    { "title": "Male Reproductive & Sexual Health", "description": "Andrology-related disorders, infertility and men’s urological health." }
  ],
  "procedures": [
    { "title": "Robotic Prostatectomy", "description": "Robot-assisted radical prostate removal including Retzius-sparing technique." },
    { "title": "Robotic Kidney Surgeries", "description": "Partial and radical nephrectomy for kidney tumors." },
    { "title": "Robotic Cystectomy", "description": "Bladder cancer surgery with ileal conduit or neobladder reconstruction." },
    { "title": "Advanced Endourology", "description": "Fusion prostate biopsy, ureteroscopy, laser stone removal and other minimally invasive procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Vivek Vasudeo perform robotic prostate cancer surgery?", "answer": "Yes, he specializes in robot-assisted radical prostatectomy, including advanced techniques." },
    { "question": "Does he perform surgery for kidney and bladder cancers?", "answer": "Yes, he is trained in robotic and minimally invasive surgeries for urological cancers." },
    { "question": "Does he offer advanced endourological procedures?", "answer": "Yes, he performs fusion biopsies, stone surgeries and reconstructive procedures." }
  ]
},
{
  "slug": "dr-shefali-yadav",
  "name": "Dr. Shefali Yadav",
  "specialty": "Paediatric Cardiology",
  "hospital": "Max Hospital – Saket East",
  "experience": "5+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant – Paediatric Cardiology",
  "degree": "MBBS | MD (Paediatrics, MAMC Delhi) | DNB (Paediatrics) | DrNB (Paediatric Cardiology, Medanta)",
  "about": "Dr. Shefali Yadav is a dedicated Paediatric Cardiologist trained at leading institutes including Medanta – The Medicity and Maulana Azad Medical College. She has extensive experience in diagnosing and managing congenital and acquired heart diseases in infants, children and adolescents. She has presented clinical research at major international paediatric cardiology conferences and has special expertise in fetal echocardiography, paediatric heart failure, and cardiac catheterisation.",
  "medicalProblems": [
    { "title": "Congenital Heart Defects", "description": "Evaluation and management of structural heart diseases in newborns and children." },
    { "title": "Paediatric Cardiomyopathies", "description": "Diagnosis and treatment of dilated, hypertrophic and restrictive cardiomyopathies." },
    { "title": "Paediatric Pulmonary Hypertension", "description": "Comprehensive management of high blood pressure in the lungs of children." },
    { "title": "Paediatric Heart Failure", "description": "Advanced care for heart weakness and functional issues in young patients." }
  ],
  "procedures": [
    { "title": "Cardiac Catheterisation", "description": "Diagnostic and therapeutic catheter-based procedures in paediatric patients." },
    { "title": "Fetal Echocardiography", "description": "Heart evaluation of unborn babies for early detection of congenital anomalies." },
    { "title": "Echocardiographic Evaluation", "description": "Advanced echo imaging for newborns, infants and children." },
    { "title": "Interventional Paediatric Cardiology Support", "description": "Assistance and planning for device closures, angioplasty and stenting." }
  ],
  "faqs": [
    { "question": "Does Dr. Shefali Yadav treat congenital heart defects?", "answer": "Yes, she specializes in diagnosing and managing congenital heart diseases in children." },
    { "question": "Does she perform fetal echocardiography?", "answer": "Yes, she is trained in fetal echo for early detection of structural heart issues." },
    { "question": "Does she manage paediatric heart failure and cardiomyopathies?", "answer": "Yes, she has expertise in handling complex paediatric cardiac conditions." }
  ]
},
{
  "slug": "dr-pradeep-atter",
  "name": "Dr. Pradeep Atter",
  "specialty": "Interventional Pain Management",
  "hospital": "Max Hospital – Saket West",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant – Interventional Pain Management",
  "degree": "MBBS | MD (Anaesthesiology) | DM (Pain Medicine, AIIMS Rishikesh)",
  "about": "Dr. Pradeep Atter is a highly trained interventional pain specialist with advanced expertise in minimally invasive spine interventions, cancer pain management, neuromodulation, regenerative therapies, and chronic pain disorders. Trained at AIIMS Rishikesh, he has presented his research internationally and has been part of major national pain conferences. He is skilled in cutting-edge procedures including radiofrequency ablation, vertebroplasty/kyphoplasty, sympathetic neurolysis, and intrathecal pump therapies.",
  "medicalProblems": [
    { "title": "Chronic Spine Pain", "description": "Back pain, disc problems, sciatica, facet joint pain and spinal degeneration." },
    { "title": "Neuropathic Pain", "description": "Nerve pain including CRPS, trigeminal neuralgia and neuropathies." },
    { "title": "Cancer Pain", "description": "Advanced pain-relief interventions for oncology patients." },
    { "title": "Headache & Migraine", "description": "Interventional treatments for severe and chronic migraine conditions." }
  ],
  "procedures": [
    { "title": "Minimally Invasive Spine Procedures", "description": "DiscFX, biaculoplasty, vertebroplasty, kyphoplasty and radiofrequency rhizotomy." },
    { "title": "Neuromodulation & Nerve Procedures", "description": "Peripheral neuromodulation, trigeminal RFA, sympathetic blocks and stellate ganglion procedures." },
    { "title": "Cancer Pain Interventions", "description": "Celiac plexus neurolysis, intrathecal drug delivery systems, and neuroablative therapies." },
    { "title": "Regenerative Therapies", "description": "Adipose stem cell, bone marrow aspirate concentrate and growth factor treatments." }
  ],
  "faqs": [
    { "question": "Does Dr. Pradeep Atter treat chronic back and spine pain?", "answer": "Yes, he specializes in minimally invasive procedures for chronic spine and nerve pain." },
    { "question": "Does he manage cancer-related pain?", "answer": "Yes, he performs advanced neurolytic and intrathecal therapies for cancer pain." },
    { "question": "Does he offer migraine and headache treatments?", "answer": "Yes, he provides interventional options including BOTOX and nerve ablation techniques." }
  ]
},
{
  "slug": "dr-shiveta-mattoo",
  "name": "Dr. Shiveta Mattoo",
  "specialty": "Internal Medicine",
  "hospital": "Max Hospital – Saket West | Max Hospital – Saket East",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Attending Consultant – Internal Medicine",
  "degree": "MBBS | DNB (Internal Medicine) | PGDMCH (IGNOU) | PGDHA (YMCA)",
  "about": "Dr. Shiveta Mattoo is an experienced Internal Medicine specialist with over 14 years of clinical expertise. She has worked extensively across multiple specialties including Endocrinology, Gastroenterology, Emergency Medicine, and General Internal Medicine at Max Healthcare. Her approach integrates evidence-based medicine with preventive care, focusing on diabetes, thyroid disorders, infectious diseases, and chronic medical conditions.",
  "medicalProblems": [
    { "title": "Diabetes & Metabolic Disorders", "description": "Comprehensive evaluation and long-term management of Type 1 & Type 2 diabetes." },
    { "title": "Thyroid Disorders", "description": "Management of hypothyroidism, hyperthyroidism and autoimmune thyroid conditions." },
    { "title": "Infectious Diseases", "description": "Diagnosis and treatment of viral, bacterial and seasonal infections." },
    { "title": "Gastrointestinal Conditions", "description": "Management of gastritis, liver disorders and digestive health issues." }
  ],
  "procedures": [
    { "title": "Chronic Disease Management", "description": "Long-term care plans for diabetes, thyroid diseases, hypertension and metabolic disorders." },
    { "title": "Emergency & Acute Care", "description": "Stabilisation and treatment of acute medical emergencies." },
    { "title": "Preventive Health Care", "description": "Screening, vaccinations and lifestyle-based preventive interventions." },
    { "title": "Infectious Disease Treatment", "description": "Care for fever, respiratory infections and viral illnesses." }
  ],
  "faqs": [
    { "question": "Does Dr. Shiveta Mattoo treat diabetes?", "answer": "Yes, she provides comprehensive diabetes management and follow-up care." },
    { "question": "Does she manage thyroid problems?", "answer": "Yes, she has expertise in the diagnosis and treatment of all thyroid disorders." },
    { "question": "Does she provide preventive health consultations?", "answer": "Yes, she offers preventive screenings, vaccinations and wellness plans." }
  ]
},
{
  "slug": "ms-rashi-sahai",
  "name": "Ms. Rashi Sahai",
  "specialty": "Clinical Psychology",
  "hospital": "Max Hospital – Saket West | Max Medcentre – Lajpat Nagar | Max Hospital – Panchsheel Park | Max Hospital – Saket East",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Clinical Psychologist",
  "degree": "BA (Hons) Applied Psychology | MA Clinical Psychology | M.Phil Clinical Psychology",
  "about": "Ms. Rashi Sahai is an experienced clinical psychologist with expertise in psychological assessments, psychotherapy, counselling, and mental health intervention across all age groups. She has worked with leading national mental health institutions including NIMHANS, Sir Ganga Ram Hospital and various multi-speciality hospitals. Her approach integrates evidence-based therapies with compassionate, patient-centered care, addressing emotional, behavioral, developmental and clinical conditions.",
  "medicalProblems": [
    { "title": "Anxiety & Stress Disorders", "description": "Assessment and therapy for generalized anxiety, panic attacks and stress-related issues." },
    { "title": "Depression & Mood Disorders", "description": "Psychological evaluation and treatment of depression and mood disturbances." },
    { "title": "Child & Adolescent Behavioural Issues", "description": "Management of ADHD, learning difficulties, behavioral and developmental concerns." },
    { "title": "Relationship & Adjustment Problems", "description": "Counselling for interpersonal conflicts, adjustment issues and emotional wellbeing." }
  ],
  "procedures": [
    { "title": "Psychological Assessments", "description": "Cognitive, developmental, behavioral and personality testing." },
    { "title": "Psychotherapy & Counselling", "description": "Evidence-based therapies including CBT, mindfulness-based therapy and supportive counselling." },
    { "title": "Child & Adolescent Therapy", "description": "Behaviour modification, developmental assessments and family counselling." },
    { "title": "Stress & Emotional Health Management", "description": "Therapeutic programmes for stress, anxiety and emotional resilience." }
  ],
  "faqs": [
    { "question": "Does Ms. Rashi Sahai treat anxiety and depression?", "answer": "Yes, she provides evidence-based psychotherapy for anxiety, depression and related conditions." },
    { "question": "Does she offer psychological assessments?", "answer": "Yes, she conducts comprehensive assessments for cognitive, emotional and behavioral concerns." },
    { "question": "Does she work with children and adolescents?", "answer": "Yes, she has experience in managing childhood behavioural problems, ADHD and learning difficulties." }
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
