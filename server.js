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


// 🔥 NEW: AdminUser Schema for basic authentication
const AdminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema); 



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


const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  story: { type: String, required: true },
  treatment: { type: String },
  image: { type: String }, // optional profile image
  createdAt: { type: Date, default: Date.now }
});

const Review= mongoose.model("Review", ReviewSchema);

const VideoTestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true }, // YouTube URL or Cloud storage URL
  createdAt: { type: Date, default: Date.now }
});

const VideoReview= mongoose.model("VideoTestimonial", VideoTestimonialSchema);


app.post("/add-review", async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- 🔥 NEW: Admin Login Endpoint ---
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = await AdminUser.findOne({ username });

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password (In production, use bcrypt.compare)
    if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Success: Return a simple token (in a real app, this would be a JWT)
    // We will use a simple, consistent token here for frontend validation
    const token = 'MOCK_ADMIN_TOKEN_12345'; 
    res.json({ success: true, token, user: { username: user.username, role: user.role } });
});

/*
|--------------------------------------------------------------------------
| POST VIDEO TESTIMONIAL
|--------------------------------------------------------------------------
*/
app.post("/add-video", async (req, res) => {
  try {
    const video = await VideoReview.create(req.body);
    res.status(201).json({
      success: true,
      message: "Video testimonial added successfully",
      data: video,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL REVIEWS
|--------------------------------------------------------------------------
*/
app.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL VIDEO TESTIMONIALS
|--------------------------------------------------------------------------
*/
app.get("/videos", async (req, res) => {
  try {
    const videos = await VideoReview.find().sort({ createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



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
    "slug": "dr-ashwani-kumar-sharma",
    "name": "Dr. Ashwani Kumar Sharma",
    "specialty": "Surgical Oncology & Robotic Cancer Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "18+ years",
    "image": "Dr_Anand_Kumar_Chopra_(1).webp",
    "isTopDoctor": false,
    "position": "Vice Chairman \u2013 Manipal Comprehensive Cancer Centre & Onco Robotic Surgeries",
    "degree": "MBBS | MS | DNB",
    "about": "Dr. Ashwani Kumar Sharma is a highly skilled surgical oncologist with over 18 years of experience, specializing in advanced robotic and minimally invasive cancer surgeries. He performs complex procedures involving cancers of the oesophagus, lung, stomach, pancreas, colorectal region, urology, gynaecology, thyroid, and head & neck. He is proficient in VATS, CRS+HIPEC, and advanced breast cancer surgeries. Dr. Sharma is a lifetime member of leading surgical associations and has received multiple Best Paper Awards for his scientific contributions.",
    "medicalProblems": [
      {
        "title": "Gastrointestinal Cancers",
        "description": "Advanced surgical treatment for esophageal, stomach, pancreatic, and colorectal malignancies."
      },
      {
        "title": "Thoracic & Lung Cancers",
        "description": "Robotic and minimally invasive surgery for lung and mediastinal tumors."
      },
      {
        "title": "Breast & Gynecologic Cancers",
        "description": "Precision-based surgery for breast, ovarian, cervical, and uterine cancers."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Cancer Surgery",
        "description": "Minimally invasive robotic procedures for high-precision cancer treatment."
      },
      {
        "title": "CRS + HIPEC",
        "description": "Cytoreductive surgery with hyperthermic intraperitoneal chemotherapy."
      },
      {
        "title": "VATS",
        "description": "Video-assisted thoracoscopic surgery for thoracic cancers."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sharma perform robotic cancer surgeries?",
        "answer": "Yes, he specializes in advanced robotic surgeries across multiple cancer types."
      },
      {
        "question": "Does he treat gastrointestinal cancers?",
        "answer": "Yes, he is an expert in GI cancer surgeries including oesophagus, stomach, and colorectal cancers."
      },
      {
        "question": "Is he associated with medical research?",
        "answer": "Yes, he has multiple national and international publications and award-winning research."
      }
    ]
  },
  {
    "slug": "dr-sunil-singh",
    "name": "Dr. (Col) Sunil Singh",
    "specialty": "Anaesthesiology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "40+ years",
    "image": "dr-pranshul-consultant-orthopaedics.png",
    "isTopDoctor": false,
    "position": "Consultant & Head of Department \u2013 Anaesthesiology",
    "degree": "MBBS | MD",
    "about": "Dr. (Col) Sunil Singh is a veteran anaesthesiologist with over four decades of clinical, academic, and army medical experience. He specializes in trauma care, arthroplasty anaesthesia, minimal-access surgery anaesthesia, bariatric anaesthesia, neuro & spine anaesthesia, and high-risk pregnancy anaesthesia. A decorated officer, he has been awarded the prestigious Commendation Medal by the Indian Army for his exemplary service.",
    "medicalProblems": [
      {
        "title": "High-Risk Surgical Anaesthesia",
        "description": "Specialized anaesthesia plans for complex and high-risk surgeries."
      },
      {
        "title": "Trauma Cases",
        "description": "Critical care and acute intervention for trauma and emergency procedures."
      },
      {
        "title": "Perioperative Pain Management",
        "description": "Ensuring safe and comfortable post-operative recovery."
      }
    ],
    "procedures": [
      {
        "title": "Anaesthesia for Minimal Access Surgery",
        "description": "Advanced anaesthesia support for laparoscopic and robotic procedures."
      },
      {
        "title": "Bariatric Anaesthesia",
        "description": "Safe anaesthetic management for obesity-related surgeries."
      },
      {
        "title": "Neuro & Spine Anaesthesia",
        "description": "Specialized care for surgeries involving the central nervous system."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sunil handle high-risk patients?",
        "answer": "Yes, he is highly experienced in managing high-risk surgeries and critical patients."
      },
      {
        "question": "Does he have army medical experience?",
        "answer": "Yes, he served 26 years in the Indian Army and received commendations for excellence."
      },
      {
        "question": "Does he provide pain management?",
        "answer": "Yes, he manages perioperative and postoperative pain."
      }
    ]
  },
  {
    "slug": "dr-abhishek-gupta",
    "name": "Dr. Abhishek Gupta",
    "specialty": "Pediatric Intensive Care & Emergency",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "10+ years",
    "image": "pediatrician-in-gurugram-dr-abhishek-gupta.png",
    "isTopDoctor": false,
    "position": "HOD & Consultant \u2013 Pediatric Intensive Care",
    "degree": "MBBS | MD (Pediatrics & Neonatology) | Fellowship in Pediatric Critical Care (IDPCCM)",
    "about": "Dr. Abhishek Gupta is one of the leading pediatric intensivists in Gurugram, specializing in pediatric critical care, emergency medicine, and neonatal intensive care. He is highly experienced in complex pediatric procedures including central lines, bronchoscopies, arterial lines, HFOV, NAVA ventilation, ECMO assistance, and transplant-related critical care.",
    "medicalProblems": [
      {
        "title": "Pediatric Emergencies",
        "description": "Management of trauma, respiratory distress, infections, and shock."
      },
      {
        "title": "Newborn Critical Care",
        "description": "Specialized treatment for premature and critically ill newborns."
      },
      {
        "title": "Childhood Illnesses",
        "description": "Fever, allergies, asthma, respiratory infections, stomach issues, and viral infections."
      }
    ],
    "procedures": [
      {
        "title": "Pediatric Bronchoscopy",
        "description": "Advanced airway evaluation and management in children."
      },
      {
        "title": "Neonatal & Pediatric Ventilation",
        "description": "HFOV, NIV, NAVA, and advanced respiratory support."
      },
      {
        "title": "Emergency Pediatric Procedures",
        "description": "Central line, arterial line, ICD insertion, E-FAST."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Abhishek treat newborns?",
        "answer": "Yes, he specializes in neonatology and pediatric intensive care."
      },
      {
        "question": "Does he handle pediatric emergencies?",
        "answer": "Yes, he is extensively trained in pediatric emergency medicine."
      },
      {
        "question": "Does he perform bronchoscopies?",
        "answer": "Yes, he is skilled in pediatric bronchoscopy procedures."
      }
    ]
  },
  {
    "slug": "dr-amita-shah",
    "name": "Dr. Amita Shah",
    "specialty": "Obstetrics & Gynaecology, Laparoscopic & Robotic Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "30+ years",
    "image": "dr-amitabha-ghosh-consultant.png",
    "isTopDoctor": true,
    "position": "Chairman & Head \u2013 Obstetrics & Gynaecology",
    "degree": "MBBS | MD (Gold Medalist) | Advanced Laparoscopy & Hysteroscopy Certifications",
    "about": "Dr. Amita Shah is a renowned OB-GYN with nearly three decades of expertise in advanced laparoscopic surgery, robotic gynecological procedures, high-risk obstetrics, reproductive endocrinology, and adolescent & menopausal care. A Gold Medalist from KGMC, she has delivered over 10,000 babies and performed more than 5,000 advanced gynecological surgeries.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Comprehensive care for complex and high-risk obstetric cases."
      },
      {
        "title": "Endometriosis & Fibroids",
        "description": "Advanced laparoscopic and robotic treatment for pelvic disorders."
      },
      {
        "title": "Infertility",
        "description": "Diagnosis and treatment for reproductive challenges."
      }
    ],
    "procedures": [
      {
        "title": "3D & Robotic Laparoscopic Surgery",
        "description": "State-of-the-art minimally invasive gynecologic surgeries."
      },
      {
        "title": "Hysteroscopy",
        "description": "Diagnosis and treatment of uterine conditions."
      },
      {
        "title": "High-Risk Delivery",
        "description": "Expert management of high-risk pregnancies and childbirth."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Amita perform robotic surgeries?",
        "answer": "Yes, she is highly skilled in robotic and 3D laparoscopic surgeries."
      },
      {
        "question": "Does she treat endometriosis?",
        "answer": "Yes, she specializes in minimally invasive treatment for endometriosis."
      },
      {
        "question": "Does she handle high-risk pregnancies?",
        "answer": "Yes, she is an expert in complex and high-risk obstetrics."
      }
    ]
  },
  {
    "slug": "dr-amitabha-ghosh",
    "name": "Dr. Amitabha Ghosh",
    "specialty": "Internal Medicine",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "dr-amitabha-ghosh-consultant.png",
    "isTopDoctor": false,
    "position": "HOD & Consultant \u2013 Internal Medicine",
    "degree": "MBBS | DNB (General Medicine)",
    "about": "Dr. Amitabha Ghosh is a senior internal medicine specialist known for his expertise in adult medicine, chronic disease management, infection control, metabolic disorders, hypertension, and preventive health. He is widely quoted in major news platforms for his medical insights and public health advocacy.",
    "medicalProblems": [
      {
        "title": "Infectious Diseases",
        "description": "Diagnosis and treatment of viral, bacterial, and seasonal infections."
      },
      {
        "title": "Chronic Diseases",
        "description": "Management of diabetes, hypertension, thyroid disorders, and obesity."
      },
      {
        "title": "Respiratory Illnesses",
        "description": "Treatment for asthma, bronchitis, and post-COVID complications."
      }
    ],
    "procedures": [
      {
        "title": "Chronic Disease Management",
        "description": "Comprehensive long-term treatment plans for lifestyle diseases."
      },
      {
        "title": "Preventive Health Screening",
        "description": "Health checks and risk assessment for long-term wellbeing."
      },
      {
        "title": "Infection Management",
        "description": "Treatment for viral fevers, respiratory infections, and seasonal illnesses."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ghosh treat chronic diseases?",
        "answer": "Yes, he is an expert in managing diabetes, hypertension, and lifestyle diseases."
      },
      {
        "question": "Has he been featured in the media?",
        "answer": "Yes, he is frequently quoted in leading national publications."
      },
      {
        "question": "Does he treat post-COVID issues?",
        "answer": "Yes, he manages long-COVID symptoms and respiratory complications."
      }
    ]
  },
  {
    "slug": "dr-brajesh-kumar-mishra",
    "name": "Dr. Brajesh Kumar Mishra",
    "specialty": "Cardiology & Cardiac Electrophysiology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "24+ years",
    "image": "heart-doctor-in-gurgaon-dr-brajesh-kumar-mishra.webp",
    "isTopDoctor": false,
    "position": "HOD & Consultant \u2013 Cardiology",
    "degree": "MBBS | MD (Medicine) | DNB (Cardiology) | Cardiac EP Fellowship",
    "about": "Dr. Brajesh Kumar Mishra is one of Gurugram\u2019s most experienced cardiologists with expertise in interventional cardiology, electrophysiology, pacing therapies, radial procedures, and complex coronary interventions. He has trained at Medanta and Mount Sinai, New York, and has contributed to several research papers in cardiology.",
    "medicalProblems": [
      {
        "title": "Heart Disease",
        "description": "Diagnosis and treatment for coronary artery disease, arrhythmia, and hypertension."
      },
      {
        "title": "Heart Rhythm Disorders",
        "description": "Advanced care for atrial fibrillation, SVT, and ventricular arrhythmias."
      },
      {
        "title": "Heart Failure",
        "description": "Comprehensive management for chronic and acute heart failure."
      }
    ],
    "procedures": [
      {
        "title": "Angiography & Angioplasty",
        "description": "Coronary and complex interventional procedures (PTCA)."
      },
      {
        "title": "Pacemaker & ICD/CRTD",
        "description": "Implantation of device therapy for heart rhythm disorders."
      },
      {
        "title": "Electrophysiology Studies & Ablations",
        "description": "Treatment of abnormal heart rhythms."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mishra perform angioplasty?",
        "answer": "Yes, he specializes in complex coronary angioplasty and radial interventions."
      },
      {
        "question": "Does he treat arrhythmias?",
        "answer": "Yes, he is an expert in electrophysiology and ablation therapies."
      },
      {
        "question": "Is he experienced in device implantation?",
        "answer": "Yes, he regularly performs pacemaker, ICD, and CRTD procedures."
      }
    ]
  },
  {
    "slug": "dr-ks-brar",
    "name": "Dr. Brig (Prof) KS Brar VSM**",
    "specialty": "Adult & Pediatric Endocrinology & Diabetology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "32+ years",
    "image": "best-diabetes-doctor-in-delhi-dr-brig-(prof)-ks-brar-vsm.webp",
    "isTopDoctor": true,
    "position": "HOD & Consultant \u2013 Adult & Pediatric Endocrinology & Diabetology",
    "degree": "MBBS | MD | DNB | FCCP | FSASMS | MNAMS | Fellowship in Endocrinology (AIIMS)",
    "about": "Brig (Prof) KS Brar is one of India\u2019s most distinguished endocrinologists with over 32 years of experience in treating diabetes, thyroid disorders, hormonal imbalances, metabolic bone disease, adrenal disorders, and pediatric endocrinology. He is a double recipient of the prestigious Vishisht Seva Medal (VSM) awarded by the President of India.",
    "medicalProblems": [
      {
        "title": "Diabetes Mellitus",
        "description": "Advanced management of Type 1, Type 2, and complicated diabetes."
      },
      {
        "title": "Thyroid Disorders",
        "description": "Treatment for hypothyroidism, hyperthyroidism, nodules, and thyroiditis."
      },
      {
        "title": "Hormonal Problems",
        "description": "Pediatric and adult hormonal disorders, puberty issues, adrenal and pituitary diseases."
      }
    ],
    "procedures": [
      {
        "title": "Diabetes Management",
        "description": "Comprehensive lifestyle and medication-based diabetes control."
      },
      {
        "title": "Hormonal Evaluation",
        "description": "Advanced endocrine testing and diagnostic evaluation."
      },
      {
        "title": "Bone Health Assessment",
        "description": "Osteoporosis and metabolic bone disease assessment and treatment."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Brar treat children?",
        "answer": "Yes, he specializes in both adult and pediatric endocrinology."
      },
      {
        "question": "Has he received national awards?",
        "answer": "Yes, he received VSM twice for outstanding service."
      },
      {
        "question": "Does he treat thyroid problems?",
        "answer": "Yes, he is an expert in all thyroid-related disorders."
      }
    ]
  },
  {
    "slug": "dr-is-mehta",
    "name": "Dr. I S Mehta",
    "specialty": "Dental Medicine & Orthodontics",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "46+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "HOD \u2013 Dental Medicine",
    "degree": "BDS | IMZ Implant Course (Holland)",
    "about": "Dr. I. S. Mehta is one of India\u2019s most experienced dental specialists with expertise spanning orthodontics, pedodontics, implantology, surgical dentistry, and full-mouth rehabilitation. With 46 years of experience, he is known for his precise diagnostic skills and compassionate patient care.",
    "medicalProblems": [
      {
        "title": "Orthodontic Issues",
        "description": "Treatment for misaligned teeth and bite irregularities."
      },
      {
        "title": "Pediatric Dental Issues",
        "description": "Complete dental care for children."
      },
      {
        "title": "Tooth Loss & Gum Disease",
        "description": "Implants, dentures, and surgical correction."
      }
    ],
    "procedures": [
      {
        "title": "Implant Dentistry",
        "description": "Advanced implants and full-mouth rehabilitation."
      },
      {
        "title": "Orthodontics",
        "description": "Braces and alignment correction."
      },
      {
        "title": "Surgical Dentistry",
        "description": "Complex extractions and oral surgical procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mehta do implants?",
        "answer": "Yes, he is trained in IMZ implantology from Holland."
      },
      {
        "question": "Does he treat children?",
        "answer": "Yes, he is experienced in pedodontics."
      },
      {
        "question": "Is he associated with any institutions?",
        "answer": "Yes, he has served as honorary dentist for major Indian forces."
      }
    ]
  },
  {
    "slug": "dr-jatin-yadav",
    "name": "Dr. Jatin Yadav",
    "specialty": "Cardiothoracic & Vascular Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "10+ years",
    "image": "Dr__Sahil_Yadav_(1).webp",
    "isTopDoctor": false,
    "position": "HOD & Consultant \u2013 Cardiothoracic Vascular Surgery",
    "degree": "MBBS | DNB (CTVS)",
    "about": "Dr. Jatin Yadav is a highly skilled cardiothoracic and vascular surgeon with expertise in CABG, valve repair & replacement, minimally invasive cardiac surgery, aortic dissection repair, TAVI/TAVR, and ECMO support. He trained at Fortis Escorts Heart Institute and is known for his precision and patient-centric approach.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Treatment for blockages, ischemia, and cardiac failure."
      },
      {
        "title": "Heart Valve Disease",
        "description": "Repair and replacement of aortic, mitral, and tricuspid valves."
      },
      {
        "title": "Aortic Aneurysm & Dissection",
        "description": "Open and endovascular repair."
      }
    ],
    "procedures": [
      {
        "title": "CABG",
        "description": "Coronary artery bypass grafting including minimally invasive MIDCAB."
      },
      {
        "title": "Valve Repair & Replacement",
        "description": "Advanced surgical and minimally invasive valve procedures."
      },
      {
        "title": "TEVAR/EVAR",
        "description": "Endovascular stenting for aortic disease."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Jatin perform minimally invasive surgeries?",
        "answer": "Yes, he specializes in minimally invasive and robotic cardiac surgeries."
      },
      {
        "question": "Does he perform TAVI/TAVR?",
        "answer": "Yes, he is experienced in structural heart interventions."
      },
      {
        "question": "Does he treat aortic aneurysms?",
        "answer": "Yes, he performs both open and endovascular aortic surgeries."
      }
    ]
  },
  {
    "slug": "dr-mriganka-sekhar-sharma",
    "name": "Dr. Mriganka Sekhar Sharma",
    "specialty": "General, Bariatric & Minimally Invasive Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "dr-mriganka-sekhar-sharma-consultant.png",
    "isTopDoctor": false,
    "position": "HOD \u2013 General, Bariatric & Minimally Invasive Surgery",
    "degree": "MBBS | MS | FACS | Fellowship in Bariatric & Upper GI Surgery",
    "about": "Dr. Mriganka Sekhar Sharma is an expert in bariatric, metabolic, and minimally invasive GI surgery. Trained at Cleveland Clinic (USA), he specializes in obesity surgery, upper GI surgery, and advanced laparoscopic procedures. He is widely recognized for his expertise in minimally invasive techniques.",
    "medicalProblems": [
      {
        "title": "Obesity & Metabolic Syndrome",
        "description": "Advanced bariatric evaluation and treatment."
      },
      {
        "title": "Upper GI Disorders",
        "description": "Surgical treatment for stomach, esophagus, and intestine disorders."
      },
      {
        "title": "Hernias & Gallbladder Issues",
        "description": "Minimally invasive treatment for hernias and gallbladder disease."
      }
    ],
    "procedures": [
      {
        "title": "Bariatric Surgery",
        "description": "Weight-loss surgeries including sleeve gastrectomy and gastric bypass."
      },
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive GI and general surgical procedures."
      },
      {
        "title": "Upper GI Surgery",
        "description": "Surgical treatment for GERD, gastric disorders, and metabolic conditions."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mriganka perform bariatric surgery?",
        "answer": "Yes, he is a fellowship-trained expert in bariatric and metabolic surgery."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, he trained at Cleveland Clinic, USA."
      },
      {
        "question": "Does he offer minimally invasive GI surgery?",
        "answer": "Yes, he specializes in laparoscopic and minimally invasive procedures."
      }
    ]
  },
  {
    "slug": "dr-prasanthi-ganji",
    "name": "Dr. Prasanthi Ganji",
    "specialty": "Emergency Medicine",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "10+ years",
    "image": "dr-pranshul-consultant-orthopaedics.png",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Emergency Medicine",
    "degree": "MBBS | MEM",
    "about": "Dr. Prasanthi Ganji is a renowned Emergency Medicine Specialist with extensive experience in managing critical emergencies, trauma cases, and life-saving procedures. She completed her MBBS from Sree Balaji Medical College, Chennai, and MEM from George Washington University (Meenakshi Mission Hospital, Madurai). She is proficient in emergency procedures including cannulation, venipuncture, catheterization, pericardiocentesis, tracheostomy, pleural and peritoneal tapping, chest drain insertion, and bladder irrigation. She serves as Course Director and Head of Emergency at Manipal Hospitals, Gurugram.",
    "medicalProblems": [
      {
        "title": "Trauma & Accidents",
        "description": "Immediate evaluation and stabilization of trauma patients."
      },
      {
        "title": "Pediatric & Adult Emergencies",
        "description": "Expert management of life-threatening emergencies across all age groups."
      },
      {
        "title": "Cardiac & Respiratory Emergencies",
        "description": "Management of cardiac arrest, shock, asthma attacks, and acute respiratory distress."
      }
    ],
    "procedures": [
      {
        "title": "Emergency Life-Saving Procedures",
        "description": "Pericardiocentesis, tracheostomy, pleural tapping, and catheterization."
      },
      {
        "title": "Chest Drain Insertion",
        "description": "TROCHAR-assisted chest tube placement for pneumothorax and effusion."
      },
      {
        "title": "Advanced Airway Management",
        "description": "Airway stabilization in critical scenarios."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Prasanthi treat pediatric emergencies?",
        "answer": "Yes, she is skilled in managing both pediatric and adult emergency cases."
      },
      {
        "question": "Is she certified in life support?",
        "answer": "Yes, she holds BLS, ACLS, and PALS certifications from AHA, USA."
      },
      {
        "question": "Does she perform emergency surgical procedures?",
        "answer": "Yes, she performs major emergency procedures including pericardiocentesis and TROCHAR chest drain insertion."
      }
    ]
  },
  {
    "slug": "dr-romi-singh",
    "name": "Dr. Romi Singh",
    "specialty": "Anaesthesiology & Critical Care",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "12+ years",
    "image": "",
    "isTopDoctor": false,
    "position": "HOD & Consultant \u2013 Anaesthesiology and Critical Care",
    "degree": "MBBS | DNB (Anaesthesiology)",
    "about": "Dr. Romi Singh is a highly experienced anaesthesiologist and critical care specialist with over 12 years of expertise. She specializes in perioperative care, pain management, airway management, critical patient care, and high-risk anaesthesia. She conducts thorough pre-operative assessments, administers anaesthesia, monitors patients throughout the procedure, and ensures safe postoperative recovery. She is admired for her patient-centric approach and clinical excellence.",
    "medicalProblems": [
      {
        "title": "Critical Care Patients",
        "description": "Management of patients requiring advanced life support."
      },
      {
        "title": "Pain Disorders",
        "description": "Postoperative and chronic pain management solutions."
      },
      {
        "title": "High-Risk Anaesthesia",
        "description": "Anaesthesia for high-risk surgeries across specialties."
      }
    ],
    "procedures": [
      {
        "title": "Percutaneous Tracheostomy",
        "description": "Performed for long-term airway management."
      },
      {
        "title": "Ultrasound-Guided Procedures",
        "description": "Critical care interventions using ultrasound guidance."
      },
      {
        "title": "Ventilator Management",
        "description": "Handling invasive and non-invasive ventilation in ICU patients."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Romi handle critical ICU cases?",
        "answer": "Yes, she is highly experienced in managing multi-specialty critical patients."
      },
      {
        "question": "Does she provide pain management?",
        "answer": "Yes, she offers advanced pain management for surgical and non-surgical conditions."
      },
      {
        "question": "Is she trained in emergency airway procedures?",
        "answer": "Yes, she performs percutaneous tracheostomy and advanced airway interventions."
      }
    ]
  },
  {
    "slug": "dr-vikas-choudhary",
    "name": "Dr. Vikas Choudhary",
    "specialty": "Radiation Oncology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "14+ years",
    "image": "radiation-oncologist-in-delhi-dr-vikas-choudhary.webp",
    "isTopDoctor": true,
    "position": "HOD & Consultant \u2013 Radiation Oncology",
    "degree": "MBBS | DNB (Radiation Oncology) | MNAMS",
    "about": "Dr. Vikas Choudhary is a leading Radiation Oncologist in Gurugram with over 14 years of experience and more than 2500+ radiation treatments performed. He specializes in precision radiation techniques such as IMRT, IGRT, VMAT, SBRT, SRS, Adaptive RT, DIBH, and all forms of Brachytherapy. He manages cancers of the breast, head & neck, CNS, prostate, thoracic, GI, GU, gynecologic, and pediatric oncology. He is fluent in multiple languages, enabling effective communication with diverse patient groups.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Advanced radiation therapy with minimal side effects."
      },
      {
        "title": "Head & Neck Cancer",
        "description": "Precision-guided radiation treatment for complex tumors."
      },
      {
        "title": "Prostate & CNS Tumors",
        "description": "Modern techniques like VMAT, SBRT, and SRS for targeted treatment."
      }
    ],
    "procedures": [
      {
        "title": "IMRT & IGRT",
        "description": "High-precision radiation treatments for complex cancers."
      },
      {
        "title": "SBRT & SRS",
        "description": "Focused radiation for brain, spine, liver, and lung lesions."
      },
      {
        "title": "Brachytherapy",
        "description": "Internal radiation for gynecological and prostate cancers."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vikas perform advanced radiation techniques?",
        "answer": "Yes, he specializes in IMRT, IGRT, VMAT, SBRT, and SRS."
      },
      {
        "question": "Does he treat pediatric cancers?",
        "answer": "Yes, he is experienced in pediatric radiation oncology."
      },
      {
        "question": "Does he follow international guidelines?",
        "answer": "Yes, he adheres strictly to evidence-based global cancer protocols."
      }
    ]
  },
  {
    "slug": "dr-vikram-barua-kaushik",
    "name": "Dr. Vikram Barua Kaushik",
    "specialty": "Urology & Renal Transplant",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "dr-vikram-barua-kaushik-best-urologist-in-gurgaon_.webp",
    "isTopDoctor": true,
    "position": "HOD & Consultant \u2013 Urology & Renal Transplant Surgery",
    "degree": "MBBS | MS (General Surgery) | DNB (Urology) | FRCS | FACS",
    "about": "Dr. Vikram Barua Kaushik is a distinguished Urologist and Renal Transplant Surgeon with over 20 years of expertise. He specializes in endourology, prostate diseases, kidney transplants, uro-oncology, reconstructive urology, and minimally invasive laparoscopic/robotic surgeries. He is known for advanced procedures including robotic radical prostatectomy, laparoscopic donor nephrectomy, complex stone surgeries, and reconstructive urology.",
    "medicalProblems": [
      {
        "title": "Prostate Enlargement",
        "description": "Comprehensive management including minimally invasive and robotic procedures."
      },
      {
        "title": "Kidney Stones",
        "description": "Laser, endoscopic, and laparoscopic stone removal solutions."
      },
      {
        "title": "Kidney Cancer & Urological Cancers",
        "description": "Advanced cancer management including robotic and laparoscopic surgeries."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Prostatectomy",
        "description": "Minimally invasive robotic surgery for prostate cancer."
      },
      {
        "title": "Kidney Transplant",
        "description": "End-to-end management of donor and recipient procedures."
      },
      {
        "title": "Endourology",
        "description": "URS, PCNL, RIRS, and other modern stone surgeries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kaushik perform robotic surgeries?",
        "answer": "Yes, he specializes in robotic and laparoscopic urological surgeries."
      },
      {
        "question": "Does he treat prostate diseases?",
        "answer": "Yes, he is a leading expert in prostate disease management."
      },
      {
        "question": "Does he perform kidney transplants?",
        "answer": "Yes, he has extensive experience in renal transplant surgery."
      }
    ]
  },
  {
    "slug": "dr-vishal-jain",
    "name": "Dr. Vishal Jain",
    "specialty": "Neonatology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "12+ years",
    "image": "dr-jyoti-sharma-sr-consultant.png",
    "isTopDoctor": true,
    "position": "HOD & Consultant \u2013 Neonatology",
    "degree": "MBBS | MD (Pediatrics) | Fellowship in Neonatology (NNF)",
    "about": "Dr. Vishal Jain is a highly skilled Neonatologist with expertise in preterm care, newborn nutrition, neonatal ventilation, and high-risk newborn management. He completed his MBBS from Sikkim Manipal University, MD Pediatrics from DY Patil Medical College, and Fellowship in Neonatology from Sir Ganga Ram Hospital. He is known for handling critical newborn cases with utmost precision and compassion.",
    "medicalProblems": [
      {
        "title": "Preterm Babies",
        "description": "Specialized care for premature infants requiring intensive monitoring."
      },
      {
        "title": "Newborn Respiratory Issues",
        "description": "High-frequency and conventional ventilation support."
      },
      {
        "title": "Newborn Nutrition & Development",
        "description": "Guidance on optimal feeding and growth monitoring."
      }
    ],
    "procedures": [
      {
        "title": "Neonatal Ventilation",
        "description": "Advanced respiratory care using HFNC and mechanical ventilation."
      },
      {
        "title": "Vaccination",
        "description": "Complete vaccination guidance for newborns."
      },
      {
        "title": "Neonatal Critical Care",
        "description": "NICU management for critically ill infants."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vishal handle preterm babies?",
        "answer": "Yes, he specializes in managing premature and critically ill newborns."
      },
      {
        "question": "Does he offer newborn nutrition guidance?",
        "answer": "Yes, he provides specialized neonatal nutrition plans."
      },
      {
        "question": "Is he trained in neonatal ventilation?",
        "answer": "Yes, he is an expert in both conventional and high-frequency ventilation."
      }
    ]
  },
  {
    "slug": "dr-aishwarya-devaraj",
    "name": "Dr. Aishwarya Devaraj",
    "specialty": "Dermatology, Venereology & Leprosy",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "10+ years",
    "image": "best-dermatologist-in-gurgaon-dr-aishwarya-devaraj.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Dermatology, Venereology & Leprosy",
    "degree": "MBBS | MD",
    "about": "Dr. Aishwarya Devaraj is a highly respected dermatologist known for her holistic and patient-centric approach. She specializes in acne management, pigmentation disorders, autoimmune skin diseases, hair and nail issues, and aesthetic dermatology. She promotes long-term skin health through lifestyle guidance and customized treatment plans. She has received multiple awards including a University Gold Medal and recognition at national dermatology conferences.",
    "medicalProblems": [
      {
        "title": "Acne & Pigmentation",
        "description": "Expert care for acne from mild to severe, scarring, and pigmentation issues."
      },
      {
        "title": "Autoimmune Skin Disorders",
        "description": "Management of pemphigus, dermatitis, and drug reactions."
      },
      {
        "title": "Hair & Nail Problems",
        "description": "Treatment for alopecia, brittle nails, and scalp conditions."
      }
    ],
    "procedures": [
      {
        "title": "Aesthetic Treatments",
        "description": "Fillers, injectables, PRP, and laser-based skin rejuvenation."
      },
      {
        "title": "Anti-Aging Procedures",
        "description": "Guided treatments preserving natural facial harmony."
      },
      {
        "title": "Dermatologic Procedures",
        "description": "Biopsies, excisions, and advanced skin treatments."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Aishwarya treat severe acne?",
        "answer": "Yes, she treats all grades of acne and their complications."
      },
      {
        "question": "Does she perform aesthetic procedures?",
        "answer": "Yes, she offers anti-aging, fillers, toxin treatments, and laser therapies."
      },
      {
        "question": "Does she treat autoimmune skin diseases?",
        "answer": "Yes, she manages complex dermatological autoimmune conditions."
      }
    ]
  },
  {
    "slug": "dr-amit-deepta-goswami",
    "name": "Dr. Amit Deepta Goswami",
    "specialty": "General, Bariatric & Minimally Invasive Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "15+ years",
    "image": "dr-amit-deepta-goswami-consultant.png",
    "isTopDoctor": false,
    "position": "Consultant \u2013 General, Bariatric & Minimally Invasive Surgery",
    "degree": "MBBS | MS (Surgery) | FIAGES | FCLS | FNB",
    "about": "Dr. Amit Deepta Goswami is one of the most trusted General and Bariatric Surgeons in Gurugram. He is experienced in laparoscopic surgery, bariatric procedures, GI surgery, and advanced minimally invasive surgeries. Known for his empathetic communication and patient-friendly counseling, he ensures customized treatment plans for every patient. He is actively involved in academic research and has been widely featured in medical journals and digital media for his expertise.",
    "medicalProblems": [
      {
        "title": "Obesity & Weight Issues",
        "description": "Surgical and non-surgical bariatric solutions."
      },
      {
        "title": "Gallbladder & Hernia Issues",
        "description": "Advanced minimally invasive surgical treatment."
      },
      {
        "title": "GI Disorders",
        "description": "Management of abdominal, intestinal, and gastrointestinal concerns."
      }
    ],
    "procedures": [
      {
        "title": "Bariatric Surgery",
        "description": "Sleeve gastrectomy, gastric bypass, and metabolic surgeries."
      },
      {
        "title": "Laparoscopic Surgery",
        "description": "Advanced minimally invasive procedures for GI and general surgery."
      },
      {
        "title": "Hernia Repair",
        "description": "TAPP, TEP, and other laparoscopic hernia procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Amit perform bariatric surgery?",
        "answer": "Yes, he is highly experienced in bariatric and metabolic surgeries."
      },
      {
        "question": "Does he perform laparoscopic surgeries?",
        "answer": "Yes, he specializes in advanced minimally invasive procedures."
      },
      {
        "question": "Does he treat GI disorders?",
        "answer": "Yes, he treats gallbladder, hernia, intestinal, and abdominal issues."
      }
    ]
  },
  {
    "slug": "dr-anand-kumar-chopra",
    "name": "Dr. Anand Kumar Chopra",
    "specialty": "Anaesthesiology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "Dr_Anand_Kumar_Chopra_(1).webp",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Anaesthesiology",
    "degree": "MBBS | MD (Gold Medalist)",
    "about": "Dr. Anand Kumar Chopra is a highly accomplished anesthesiologist specializing in obstetric, pediatric, geriatric, neuro, onco, bariatric, and regional anesthesia. He is known for his exceptional communication skills, patient-centered approach, and strong decision-making abilities. He ensures patient safety before, during, and after surgery and actively participates in academic events and CME programs to stay updated.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy Anaesthesia",
        "description": "Safe anaesthesia for complex obstetric cases."
      },
      {
        "title": "Neuro & Spine Surgery Anaesthesia",
        "description": "Specialized anaesthesia for brain and spine surgeries."
      },
      {
        "title": "Trauma Care",
        "description": "Emergency anesthesia for trauma and critical care cases."
      }
    ],
    "procedures": [
      {
        "title": "Regional Anaesthesia",
        "description": "Spinal, epidural, and nerve block procedures."
      },
      {
        "title": "Bariatric Anaesthesia",
        "description": "Safe management of anesthesia for obesity-related surgeries."
      },
      {
        "title": "Minimal Access Surgery Anaesthesia",
        "description": "Advanced anesthesia for laparoscopic surgeries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Anand provide anesthesia for high-risk cases?",
        "answer": "Yes, he is experienced in high-risk and critical anesthesia cases."
      },
      {
        "question": "Does he perform regional anesthesia?",
        "answer": "Yes, he is skilled in spinal, epidural, and nerve block techniques."
      },
      {
        "question": "Is he a Gold Medalist?",
        "answer": "Yes, he received a Gold Medal during his MD."
      }
    ]
  },
  {
    "slug": "dr-anubhav-gulati",
    "name": "Dr. Anubhav Gulati",
    "specialty": "Orthopaedics & Joint Replacement",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "19+ years",
    "image": "dr-anubhav-gulati-consultant-orthopaedics.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Orthopaedics & Joint Replacement",
    "degree": "MBBS | MS (Orthopaedics)",
    "about": "Dr. Anubhav Gulati is a highly experienced Orthopaedic and Joint Replacement Surgeon with training in India and Oman. He specializes in trauma care, joint replacement, arthroscopy, and reconstruction surgeries. He has extensive expertise in fracture fixation, ACL reconstruction, rotator cuff repair, spinal procedures, deformity correction, and complex trauma management. Known for his patient-first approach, he has gained immense trust and recognition in Gurugram.",
    "medicalProblems": [
      {
        "title": "Joint Pain & Arthritis",
        "description": "Comprehensive management for knee, hip, and shoulder pain."
      },
      {
        "title": "Fractures & Trauma",
        "description": "Treatment of complex fractures and post-traumatic deformities."
      },
      {
        "title": "Sports Injuries",
        "description": "ACL tears, shoulder injuries, ligament issues, and more."
      }
    ],
    "procedures": [
      {
        "title": "Joint Replacement Surgery",
        "description": "Knee, hip, and shoulder replacement procedures."
      },
      {
        "title": "Arthroscopy",
        "description": "Minimally invasive procedures for joints including ACL reconstruction."
      },
      {
        "title": "Fracture Fixation",
        "description": "Bone fixation using nails, plates, screws, and AO techniques."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Anubhav perform ACL surgery?",
        "answer": "Yes, he is highly experienced in arthroscopic ACL reconstruction."
      },
      {
        "question": "Does he handle trauma cases?",
        "answer": "Yes, he is an expert in complex trauma and fracture surgeries."
      },
      {
        "question": "Does he perform joint replacements?",
        "answer": "Yes, he performs knee, hip, and shoulder replacement surgeries."
      }
    ]
  },
  {
    "slug": "dr-apurva-sharma",
    "name": "Dr. Apurva Sharma",
    "specialty": "Neurology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "12+ years",
    "image": "neurologist-in-gurugram-dr-apurva-sharma.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Neurology",
    "degree": "MBBS | MD (Medicine) | DM (Neurology \u2013 AIIMS)",
    "about": "Dr. Apurva Sharma is a leading neurologist in Gurugram specializing in stroke, epilepsy, migraine, dementia, neuromuscular disorders, and neurocritical care. A graduate of AIIMS Delhi, he is known for his accurate diagnosis, surgical interventions for neurological conditions, compassionate patient counseling, and multidisciplinary treatment approach. He actively educates patients through media on neurological health.",
    "medicalProblems": [
      {
        "title": "Stroke & Paralysis",
        "description": "Early diagnosis and advanced stroke management."
      },
      {
        "title": "Headache & Migraine",
        "description": "Comprehensive care for chronic headaches and migraine."
      },
      {
        "title": "Neurological Disorders",
        "description": "Epilepsy, dementia, neuropathy, and neuromuscular diseases."
      }
    ],
    "procedures": [
      {
        "title": "Neurological Interventions",
        "description": "Advanced treatments for stroke, seizures, and neurological disorders."
      },
      {
        "title": "Aneurysm & Tumor Management",
        "description": "Collaborative care for surgical neurological cases."
      },
      {
        "title": "Neuro-Rehabilitation Guidance",
        "description": "Recovery planning for stroke and paralysis patients."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Apurva treat stroke patients?",
        "answer": "Yes, he is an expert in stroke management and recovery."
      },
      {
        "question": "Does he handle complex neurological cases?",
        "answer": "Yes, he treats epilepsy, dementia, neuromuscular diseases, and more."
      },
      {
        "question": "Does he educate patients through media?",
        "answer": "Yes, he regularly appears on media platforms for public awareness."
      }
    ]
  },
  {
    "slug": "dr-ashish-dagar",
    "name": "Dr. Ashish Dagar",
    "specialty": "Spine Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "8 years",
    "image": "dr-ashish-dagar-spine-surgery.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Spine Surgery",
    "degree": "MBBS | MS (Orthopaedics) | DNB (Orthopaedics) | Fellowship in MIS & Endoscopic Spine Surgery",
    "about": "Dr. Ashish Dagar is a highly skilled Spine Surgeon with extensive expertise in cervical, dorsal, and lumbosacral spine disorders. He is renowned for performing complex procedures such as ACDF, ACCF, disc replacement, and minimally invasive endoscopic spine surgeries. With fellowships from top global institutions in South Korea and France, he offers patient-centric, technologically advanced spine care.",
    "medicalProblems": [
      {
        "title": "Cervical Spine Disorders",
        "description": "Neck pain, cervical disc issues, nerve compression."
      },
      {
        "title": "Lumbar & Lumbosacral Diseases",
        "description": "Sciatica, lumbar disc prolapse, spinal stenosis."
      },
      {
        "title": "Spine Trauma & Deformity",
        "description": "Fractures, scoliosis, kyphosis, post-traumatic spine conditions."
      }
    ],
    "procedures": [
      {
        "title": "ACDF & ACCF",
        "description": "Advanced cervical spine fusion and decompression surgeries."
      },
      {
        "title": "Endoscopic Spine Surgery",
        "description": "Minimally invasive procedures for faster recovery."
      },
      {
        "title": "Spinal Fixation & Decompression",
        "description": "Posterior and anterior approaches for spine stabilization."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ashish perform minimally invasive spine surgery?",
        "answer": "Yes, he specializes in MIS and endoscopic spine procedures."
      },
      {
        "question": "Does he treat slipped disc?",
        "answer": "Yes, he treats cervical, dorsal, and lumbar disc issues."
      },
      {
        "question": "Is he experienced in complex spine cases?",
        "answer": "Yes, he is known for handling complex spinal deformities and trauma cases."
      }
    ]
  },
  {
    "slug": "dr-ayush-dhingra",
    "name": "Dr. Ayush Dhingra",
    "specialty": "Gastroenterology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-ayush-dhigra-consultant.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Gastroenterology",
    "degree": "MBBS | MD (Internal Medicine) | DNB (Gastroenterology)",
    "about": "Dr. Ayush Dhingra is a highly experienced Gastroenterologist and Therapeutic GI Endoscopist. He is skilled in advanced diagnostic and therapeutic endoscopic procedures including ERCP, EUS, polypectomy, balloon dilatation, and GI bleeding control. He follows ethical, evidence-based medical practice and is known for his expertise in treating complex gastrointestinal, liver, and pancreatic diseases.",
    "medicalProblems": [
      {
        "title": "Gastrointestinal Disorders",
        "description": "Acid reflux, ulcers, IBS, gastritis, abdominal pain."
      },
      {
        "title": "Liver Diseases",
        "description": "Hepatitis, jaundice, fatty liver, cirrhosis."
      },
      {
        "title": "Pancreatic & Bowel Issues",
        "description": "Pancreatitis, polyps, inflammatory bowel disease."
      }
    ],
    "procedures": [
      {
        "title": "Diagnostic Endoscopy",
        "description": "Upper GI endoscopy and colonoscopy."
      },
      {
        "title": "Therapeutic Endoscopy",
        "description": "Polypectomy, GI bleed management, balloon dilatation."
      },
      {
        "title": "ERCP & EUS",
        "description": "Advanced procedures for biliary and pancreatic disorders."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ayush treat liver diseases?",
        "answer": "Yes, he is trained in managing all liver-related conditions."
      },
      {
        "question": "Is he experienced in endoscopy?",
        "answer": "Yes, he is skilled in both diagnostic and therapeutic endoscopy."
      },
      {
        "question": "Does he manage IBS and acidity?",
        "answer": "Yes, he provides comprehensive treatment for functional bowel disorders."
      }
    ]
  },
  {
    "slug": "dr-bandana-mishra",
    "name": "Dr. Bandana Mishra",
    "specialty": "Pulmonology & Respiratory Medicine",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "16 years",
    "image": "dr-bandana-mishra-pulmonologist-in-gurgaon.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Pulmonology & Respiratory Medicine",
    "degree": "MBBS | MD (TB & Respiratory Medicine)",
    "about": "Dr. Bandana Mishra is a senior pulmonologist with over 16 years of experience and more than 5000 bronchoscopies performed. She is highly experienced in critical care, interventional pulmonology, sleep medicine, allergy care, and advanced thoracoscopy. She is widely recognized for her expertise in managing complex lung diseases, asthma, COPD, tuberculosis, and ICU patients.",
    "medicalProblems": [
      {
        "title": "Asthma & COPD",
        "description": "Comprehensive management of chronic airway diseases."
      },
      {
        "title": "Sleep Disorders",
        "description": "Sleep apnea, snoring, polysomnography-based assessments."
      },
      {
        "title": "Pulmonary Infections",
        "description": "Tuberculosis, pneumonia, bronchitis, lung infections."
      }
    ],
    "procedures": [
      {
        "title": "Bronchoscopy",
        "description": "Diagnostic and therapeutic bronchoscopic procedures."
      },
      {
        "title": "Pleural Procedures",
        "description": "Thoracoscopy, pleural tapping, advanced ICU interventions."
      },
      {
        "title": "Sleep Study (Polysomnography)",
        "description": "Diagnosis and evaluation of sleep-related disorders."
      }
    ],
    "faqs": [
      {
        "question": "Does she treat tuberculosis?",
        "answer": "Yes, she specializes in advanced TB management."
      },
      {
        "question": "Does she perform bronchoscopy?",
        "answer": "Yes, she has performed over 5000 bronchoscopies."
      },
      {
        "question": "Is she experienced in ICU pulmonary care?",
        "answer": "Yes, she is extensively trained in critical care and ventilatory management."
      }
    ]
  },
  {
    "slug": "dr-deep-divanshu-lall",
    "name": "Dr. Deep Divanshu Lall",
    "specialty": "Pain & Palliative Care",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-sandeep-kumar-mandal-consultant-nephrology.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Pain & Palliative Care",
    "degree": "MBBS | MD | FIAPM | Fellowship in Pain Medicine",
    "about": "Dr. Deep Divanshu Lall is a specialist in chronic and cancer-related pain management, known for his compassionate approach and advanced interventional skills. He is trained in minimally invasive procedures, neuropathic pain management, and palliative care. His holistic and patient-centered approach has made him a trusted expert in pain medicine.",
    "medicalProblems": [
      {
        "title": "Chronic Pain",
        "description": "Back pain, joint pain, nerve pain, musculoskeletal issues."
      },
      {
        "title": "Cancer Pain",
        "description": "Advanced management of pain related to cancer."
      },
      {
        "title": "Neuropathic Pain",
        "description": "Pain caused by nerve damage or dysfunction."
      }
    ],
    "procedures": [
      {
        "title": "Minimally Invasive Pain Interventions",
        "description": "Targeted treatments for chronic and cancer pain."
      },
      {
        "title": "Spine Interventions",
        "description": "Procedures for back and nerve-related pain."
      },
      {
        "title": "Palliative Care",
        "description": "Holistic approach to improving patient comfort."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Lall treat cancer pain?",
        "answer": "Yes, he specializes in chronic and cancer-related pain."
      },
      {
        "question": "Does he perform minimally invasive procedures?",
        "answer": "Yes, he is trained in advanced interventional pain techniques."
      },
      {
        "question": "Does he manage neuropathic pain?",
        "answer": "Yes, he is known for expertise in neuropathic pain care."
      }
    ]
  },
  {
    "slug": "dr-dixit-garg",
    "name": "Dr. Dixit Garg",
    "specialty": "Interventional Cardiology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "best-cardiologist-in-gurgaon-dr-dixit-garg.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Interventional Cardiology",
    "degree": "MBBS | DNB (Medicine) | DNB (Cardiology)",
    "about": "Dr. Dixit Garg is a renowned Interventional Cardiologist known for his expertise in coronary angioplasty, complex lesions, pacemaker implantation, and advanced cardiac care. He is recognized for his holistic and patient-first approach, treating a wide range of cardiac conditions with precision and empathy.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Blockages, heart attacks, angina, chest pain."
      },
      {
        "title": "Arrhythmias",
        "description": "Irregular heartbeat, palpitations, conduction disorders."
      },
      {
        "title": "Heart Failure",
        "description": "Management of acute and chronic heart failure."
      }
    ],
    "procedures": [
      {
        "title": "Coronary Angioplasty",
        "description": "Stenting and opening blocked heart arteries."
      },
      {
        "title": "Pacemaker Procedures",
        "description": "PPI, ICD, CRT device implantation."
      },
      {
        "title": "Echocardiography",
        "description": "Adult and pediatric heart imaging."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Dixit treat heart blockage?",
        "answer": "Yes, he specializes in angioplasty and coronary interventions."
      },
      {
        "question": "Does he implant pacemakers?",
        "answer": "Yes, he performs all major device-based cardiac procedures."
      },
      {
        "question": "Can he treat arrhythmias?",
        "answer": "Yes, he provides advanced arrhythmia management."
      }
    ]
  },
  {
    "slug": "dr-gargi-taneja",
    "name": "Dr. Gargi Taneja",
    "specialty": "Dermatology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-shalini-garwin-bliss-dietitian.webp",
    "isTopDoctor": true,
    "position": "Associate Consultant \u2013 Dermatology",
    "degree": "MBBS | MD Dermatology, Venereology & Leprosy",
    "about": "Dr. Gargi Taneja is a patient-focused dermatologist from AIIMS Rishikesh known for her expertise in diagnosing and treating a wide range of skin, hair, and nail disorders. She is skilled in lasers, peels, aesthetic procedures, and minor dermatological surgeries. Her communication skills and clinical depth make her a trusted dermatologist in Gurgaon.",
    "medicalProblems": [
      {
        "title": "Skin Disorders",
        "description": "Psoriasis, eczema, infections, allergies."
      },
      {
        "title": "Hair & Scalp Issues",
        "description": "Hair fall, dandruff, alopecia."
      },
      {
        "title": "Pigmentation & Acne",
        "description": "Pigmentation disorders, acne, scars."
      }
    ],
    "procedures": [
      {
        "title": "Laser Treatments",
        "description": "Hair reduction, pigmentation, scar treatment."
      },
      {
        "title": "Aesthetic Dermatology",
        "description": "Botox, fillers, peels, PRP, thread lifts."
      },
      {
        "title": "Minor Dermatologic Surgery",
        "description": "Mole removal, wart removal, RF ablation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gargi treat acne?",
        "answer": "Yes, she specializes in acne and acne scar treatment."
      },
      {
        "question": "Does she perform aesthetic procedures?",
        "answer": "Yes, including Botox, fillers, and PRP."
      },
      {
        "question": "Does she provide laser treatments?",
        "answer": "Yes, she is trained in multiple advanced laser therapies."
      }
    ]
  },
  {
    "slug": "dr-gunjan-sachdeva",
    "name": "Dr. Gunjan Sachdeva",
    "specialty": "ENT Surgery & Allergy",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "Dr__Sahil_Yadav_(1).webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 ENT Surgery & Allergy",
    "degree": "MBBS | MS (ENT) | Fellowship in Cochlear Implant Surgery | Fellowship in Rhinology & Advanced Endoscopic Sinus Surgery",
    "about": "Dr. Gunjan Sachdeva is a reputed ENT specialist with advanced training from AIIMS, Mumbai, and Singapore. She excels in cochlear implants, endoscopic sinus surgeries, BAHA procedures, and a wide range of ENT surgical interventions. She is known for her meticulous approach and multi-disciplinary collaboration for optimal patient care.",
    "medicalProblems": [
      {
        "title": "Sinus & Nasal Disorders",
        "description": "Sinusitis, nasal polyps, allergies."
      },
      {
        "title": "Hearing Loss",
        "description": "Middle ear diseases, cochlear implant evaluation."
      },
      {
        "title": "Throat & Voice Issues",
        "description": "Hoarseness, tonsillitis, adenoid problems."
      }
    ],
    "procedures": [
      {
        "title": "Cochlear Implant Surgery",
        "description": "Advanced hearing restoration procedure."
      },
      {
        "title": "FESS",
        "description": "Endoscopic sinus surgery for sinus disorders."
      },
      {
        "title": "ENT Surgeries",
        "description": "Tonsillectomy, septoplasty, mastoidectomy, laryngeal surgery."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gunjan perform cochlear implant surgery?",
        "answer": "Yes, she is fellowship-trained in cochlear implants."
      },
      {
        "question": "Does she treat sinus problems?",
        "answer": "Yes, she specializes in advanced sinus surgeries."
      },
      {
        "question": "Does she handle voice disorders?",
        "answer": "Yes, she performs microlaryngeal and related procedures."
      }
    ]
  },
  {
    "slug": "dr-gurdeep-avinash-ratra",
    "name": "Dr. Gurdeep Avinash Ratra",
    "specialty": "Orthopaedics & Joint Replacement",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-gurdeep-avinash-ratra-consultant-orthopaedics.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Orthopaedics & Joint Replacement",
    "degree": "MBBS | MS (Orthopaedics) | Fellowship in Joint Replacement (Germany) | Fellowship in Sports Medicine (Austria) | Shoulder Replacement Training (France)",
    "about": "Dr. Gurdeep Avinash Ratra is an experienced orthopaedic surgeon specializing in joint replacement, sports medicine, and shoulder reconstruction. With international fellowships and advanced training, he offers world-class care for knee, hip, and shoulder conditions. His empathetic approach and commitment to clinical excellence make him a preferred orthopaedic surgeon in Gurgaon.",
    "medicalProblems": [
      {
        "title": "Joint Disorders",
        "description": "Arthritis, joint pain, sports injuries."
      },
      {
        "title": "Bone & Trauma Conditions",
        "description": "Fractures, osteoporosis, complex trauma."
      },
      {
        "title": "Shoulder Conditions",
        "description": "Rotator cuff tear, instability, shoulder arthritis."
      }
    ],
    "procedures": [
      {
        "title": "Joint Replacement",
        "description": "Hip, knee, and shoulder replacement surgeries."
      },
      {
        "title": "Sports Medicine Procedures",
        "description": "Ligament repair, shoulder stabilization."
      },
      {
        "title": "Trauma Surgeries",
        "description": "Fracture fixation and reconstructive procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gurdeep perform knee replacement?",
        "answer": "Yes, he is trained in advanced joint replacement surgeries."
      },
      {
        "question": "Does he treat sports injuries?",
        "answer": "Yes, he has fellowship training in sports medicine from Austria."
      },
      {
        "question": "Is he experienced in shoulder surgery?",
        "answer": "Yes, he has specialized shoulder replacement training from France."
      }
    ]
  },
  {
    "slug": "dr-ila-jalote",
    "name": "Dr. Ila Jalote",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "11 years",
    "image": "Dr__Sahil_Yadav_(1).webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Obstetrics & Gynaecology",
    "degree": "MBBS (Gold Medallist) | MS (Obstetrics & Gynaecology) | MRCOG (UK) | FACOG (USA) | FMAS | DMAS | Fellowship in Infertility | Diploma in Gynaecological Endoscopy",
    "about": "Dr. Ila Jalote is a highly acclaimed gynaecologist with expertise in high-risk pregnancy, advanced laparoscopic gynaecology, infertility management, and painless delivery. A gold medallist with multiple fellowships from India, Germany, and the UK, she is known for her precision, compassion, and patient-centered care.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Comprehensive care for pregnancies with complications."
      },
      {
        "title": "Infertility",
        "description": "Evaluation and treatment of infertility conditions."
      },
      {
        "title": "Gynaecological Disorders",
        "description": "Fibroids, cysts, endometriosis, menstrual problems."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgeries",
        "description": "TLH, myomectomy, cystectomy, minimally invasive procedures."
      },
      {
        "title": "Hysteroscopic Procedures",
        "description": "Operative hysteroscopy for diagnostic and therapeutic purposes."
      },
      {
        "title": "Normal & Painless Delivery",
        "description": "Safe delivery and pregnancy management."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ila manage high-risk pregnancy?",
        "answer": "Yes, she specializes in high-risk obstetrics."
      },
      {
        "question": "Does she perform laparoscopic surgery?",
        "answer": "Yes, she is trained in advanced minimally invasive procedures."
      },
      {
        "question": "Does she treat infertility?",
        "answer": "Yes, she holds a fellowship in infertility and ART."
      }
    ]
  },
  {
    "slug": "dr-itee-chowdhury",
    "name": "Dr. Itee Chowdhury",
    "specialty": "Anaesthesiology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "27 years",
    "image": "dr-itee-chowdhury-best-onco-anaesthesiologist-in-gurugram.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Anaesthesiology",
    "degree": "MBBS | DA | DNB (Anaesthesiology)",
    "about": "Dr. Itee Chowdhury is a senior onco-anaesthesiologist with 27 years of extensive experience in cancer anaesthesia, robotic anaesthesia, neuroanaesthesia, thoracic procedures, and complex airway management. With multiple international presentations and over 35 research publications, she is recognized globally for her expertise and academic contributions.",
    "medicalProblems": [
      {
        "title": "Cancer Surgery Anaesthesia",
        "description": "Safe anaesthesia for major onco-surgical procedures."
      },
      {
        "title": "Difficult Airway",
        "description": "Expertise in complex airway management and bronchoscopy."
      },
      {
        "title": "High-Risk Anaesthesia",
        "description": "Anaesthesia for thoracic, hepatic, and neuro procedures."
      }
    ],
    "procedures": [
      {
        "title": "Onco-Anaesthesia",
        "description": "Anaesthesia for major cancer surgeries."
      },
      {
        "title": "Robotic Anaesthesia",
        "description": "Anaesthesia support for robotic surgeries."
      },
      {
        "title": "Critical Airway Management",
        "description": "Advanced bronchoscopy and airway procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Itee handle cancer surgery anaesthesia?",
        "answer": "Yes, she is highly experienced in onco-anaesthesia."
      },
      {
        "question": "Does she manage difficult airways?",
        "answer": "Yes, she is skilled in advanced airway procedures."
      },
      {
        "question": "Is she involved in academic work?",
        "answer": "Yes, with over 35 publications and international recognition."
      }
    ]
  },
  {
    "slug": "dr-jyoti-sharma",
    "name": "Dr. Jyoti Sharma",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-jyoti-sharma-sr-consultant.png",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Obstetrics & Gynaecology",
    "degree": "MBBS | MS (Obstetrics & Gynaecology) | DGO",
    "about": "Dr. Jyoti Sharma is a Consultant Obstetrician and Gynaecologist known for her patient-centered approach in managing pregnancy care, women\u2019s health, menstrual issues, cervical cancer awareness, and pregnancy-related conditions. She actively contributes medical insights through published articles and health awareness stories in Times of India, Healthsite, and other leading platforms.",
    "medicalProblems": [
      {
        "title": "Pregnancy Care",
        "description": "Antenatal care, pregnancy symptoms, and safe maternal health support."
      },
      {
        "title": "Gynaecological Issues",
        "description": "Management of menstrual problems, PCOS, and cervical conditions."
      },
      {
        "title": "Women\u2019s Health Disorders",
        "description": "Stress-related health issues and preventive women\u2019s health care."
      }
    ],
    "procedures": [
      {
        "title": "Normal & High-Risk Pregnancy Care",
        "description": "Comprehensive care for expecting mothers."
      },
      {
        "title": "Gynaecological Procedures",
        "description": "Diagnosis and management of female reproductive conditions."
      },
      {
        "title": "Preventive Screenings",
        "description": "Counseling for cervical cancer, breast health, and women\u2019s wellness."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Jyoti manage pregnancy-related issues?",
        "answer": "Yes, she provides complete antenatal and pregnancy care."
      },
      {
        "question": "Does she treat cervical health problems?",
        "answer": "Yes, she provides preventive and diagnostic guidance for cervical health."
      },
      {
        "question": "Is she active in women health awareness?",
        "answer": "Yes, she contributes to multiple national health platforms."
      }
    ]
  },
  {
    "slug": "dr-karuna",
    "name": "Dr. Karuna",
    "specialty": "Internal Medicine",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Internal Medicine",
    "degree": "MBBS | MD (Internal Medicine) | DNB (Internal Medicine) | MIMA | CCDM",
    "about": "Dr. Karuna is a Consultant in Internal Medicine & Diabetes Management with extensive experience treating hypertension, thyroid disorders, diabetes, metabolic diseases, and infections. She is a certified diabetologist from the Royal College of General Practitioners (NHS England) and has contributed several research papers published in BMJ and Journal of NeuroVirology.",
    "medicalProblems": [
      {
        "title": "Diabetes & Metabolic Disorders",
        "description": "Management of diabetes, fatty liver, dyslipidemia, and metabolic syndrome."
      },
      {
        "title": "Hypertension & Thyroid Disorders",
        "description": "Comprehensive care for chronic medical conditions."
      },
      {
        "title": "Infectious Diseases",
        "description": "Management of viral, bacterial, and systemic infections."
      }
    ],
    "procedures": [
      {
        "title": "Diabetes Management",
        "description": "Lifestyle, medication, and long-term glycemic control plans."
      },
      {
        "title": "Chronic Disease Management",
        "description": "Treatment of thyroid, BP, and metabolic conditions."
      },
      {
        "title": "Infection Treatment Protocols",
        "description": "Evidence-based treatment for bacterial and viral infections."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Karuna treat diabetes?",
        "answer": "Yes, she is a certified diabetologist with expertise in metabolic disorders."
      },
      {
        "question": "Does she manage thyroid disorders?",
        "answer": "Yes, she treats hypothyroidism, hyperthyroidism, and related issues."
      },
      {
        "question": "Is she experienced in infectious diseases?",
        "answer": "Yes, she has clinical experience across multiple specialties including infections."
      }
    ]
  },
  {
    "slug": "dr-leena-sharma",
    "name": "Dr. Leena Sharma",
    "specialty": "Dental Medicine",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "dr-leena-sharma-senior-consultant-dental-medicine.jpeg",
    "isTopDoctor": true,
    "position": "Senior Consultant \u2013 Dental Medicine",
    "degree": "BDS",
    "about": "Dr. Leena Sharma is a highly experienced Dental Medicine Specialist with over 20 years of expertise in cosmetic dentistry, restorative dentistry, implant surgery, and preventive oral healthcare. She is known for her gentle approach, advanced aesthetic skills, and commitment to patient education.",
    "medicalProblems": [
      {
        "title": "Dental Cavities & Pain",
        "description": "Diagnosis and treatment of tooth decay and sensitivity."
      },
      {
        "title": "Gum & Oral Health Issues",
        "description": "Management of gingivitis, periodontal disease, and oral infections."
      },
      {
        "title": "Cosmetic Dental Concerns",
        "description": "Smile correction, discoloration, and aesthetic alignment issues."
      }
    ],
    "procedures": [
      {
        "title": "Cosmetic Dentistry",
        "description": "Smile makeovers, veneers, whitening, and aesthetic restoration."
      },
      {
        "title": "Implant & Restorative Procedures",
        "description": "Crowns, bridges, implants, and oral rehabilitation."
      },
      {
        "title": "Preventive Dental Care",
        "description": "Routine cleaning, screenings, and decay prevention."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Leena perform cosmetic dentistry?",
        "answer": "Yes, she specializes in cosmetic and aesthetic dental procedures."
      },
      {
        "question": "Does she perform implant surgery?",
        "answer": "Yes, she is skilled in implant and restorative treatments."
      },
      {
        "question": "Does she provide preventive dental care?",
        "answer": "Yes, she emphasizes early prevention and oral hygiene."
      }
    ]
  },
  {
    "slug": "dr-manjiri-deshpande",
    "name": "Dr. Manjiri Ajay Deshpande",
    "specialty": "Lactation & Birth Preparation",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "15+ years",
    "image": "Dr__Sahil_Yadav_(1).webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Lactation",
    "degree": "BAMS | IBCLC | CCCE | CLE | DFB | IAIM",
    "about": "Dr. Manjiri Deshpande is a leading Lactation Consultant with more than 15 years of experience in holistic maternal and child wellness. She specializes in breastfeeding support, gentle birthing, prenatal yoga, Lamaze classes, infant massage, and birth preparation, helping mothers through every stage of pregnancy and postpartum care.",
    "medicalProblems": [
      {
        "title": "Breastfeeding Challenges",
        "description": "Latching issues, low milk supply, and breastfeeding pain."
      },
      {
        "title": "Prenatal & Postnatal Support",
        "description": "Holistic guidance for pregnancy and postpartum recovery."
      },
      {
        "title": "Newborn Care Issues",
        "description": "Infant feeding, colic, and bonding challenges."
      }
    ],
    "procedures": [
      {
        "title": "Lactation Counseling",
        "description": "Evidence-based breastfeeding support and guidance."
      },
      {
        "title": "Birth Preparation Programs",
        "description": "Lamaze, Garbha Sanskar, prenatal yoga, and doula support."
      },
      {
        "title": "Infant Massage & Care",
        "description": "Instruction in IAIM-certified infant massage techniques."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Manjiri help with breastfeeding issues?",
        "answer": "Yes, she is an internationally certified lactation consultant."
      },
      {
        "question": "Does she teach birth preparation?",
        "answer": "Yes, she provides Lamaze, prenatal yoga, and gentle birthing guidance."
      },
      {
        "question": "Does she offer infant massage training?",
        "answer": "Yes, she is IAIM-certified in infant massage instruction."
      }
    ]
  },
  {
    "slug": "dr-mohit-saxena",
    "name": "Dr. Mohit Saxena",
    "specialty": "Medical Oncology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "10+ years",
    "image": "dr-mohit-saxena-cancer-specialist-in-gurugram.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Medical Oncology",
    "degree": "MBBS | MD (General Medicine) | DM (Medical Oncology)",
    "about": "Dr. Mohit Saxena is a renowned Medical Oncologist with over 10 years of experience in treating solid tumors, hematological cancers, and complex oncology cases. He develops personalized, evidence-based treatment plans including chemotherapy, immunotherapy, targeted therapy, and precision oncology. He is known for his compassionate and holistic cancer care approach.",
    "medicalProblems": [
      {
        "title": "Solid Tumors",
        "description": "Breast, lung, GI, liver, GUT, pancreatic, and gynecological cancers."
      },
      {
        "title": "Haematological Cancers",
        "description": "Leukemia, lymphoma, myeloma, and related disorders."
      },
      {
        "title": "Advanced Cancer Management",
        "description": "Stage-wise planning, precision therapy, and supportive care."
      }
    ],
    "procedures": [
      {
        "title": "Chemotherapy & Immunotherapy",
        "description": "IV, oral, intrathecal, and targeted treatments."
      },
      {
        "title": "Precision Medicine",
        "description": "Gene-based, personalized oncology approaches."
      },
      {
        "title": "Cancer Treatment Planning",
        "description": "Evaluation, staging, and multidisciplinary care."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mohit treat all major cancers?",
        "answer": "Yes, he treats solid tumors, hematological cancers, and rare malignancies."
      },
      {
        "question": "Does he provide immunotherapy?",
        "answer": "Yes, he specializes in immunotherapy and targeted therapies."
      },
      {
        "question": "Does he work with multidisciplinary teams?",
        "answer": "Yes, he collaborates with surgeons, radiation oncologists, and specialists."
      }
    ]
  },
  {
    "slug": "dr-np-singh",
    "name": "Dr. N. P. Singh",
    "specialty": "Paediatrics",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "25 years",
    "image": "",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Paediatrics",
    "degree": "MBBS | MD (Pediatrics)",
    "about": "Dr. N. P. Singh is a senior Paediatric Consultant with 25 years of experience, having served as HOD and Unit Head at major hospitals in Delhi and Patna. He specializes in immunology, vaccinology, paediatric care, neonatology, and childhood disease management, and is an author of multiple academic books.",
    "medicalProblems": [
      {
        "title": "Paediatric Illnesses",
        "description": "Fever, infections, respiratory and digestive diseases."
      },
      {
        "title": "Immunology & Vaccination",
        "description": "Expert in immunization schedules and immune-related issues."
      },
      {
        "title": "Newborn Care",
        "description": "Growth monitoring, neonatal conditions, and developmental care."
      }
    ],
    "procedures": [
      {
        "title": "Vaccination Programs",
        "description": "Complete immunization for children and adolescents."
      },
      {
        "title": "Paediatric Condition Management",
        "description": "Treatment of common and complex child health conditions."
      },
      {
        "title": "Neonatal Care",
        "description": "Early life care, feeding guidance, and screening."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Singh specialize in vaccination?",
        "answer": "Yes, he is a national trainer and expert in immunology and vaccinology."
      },
      {
        "question": "Does he treat newborns?",
        "answer": "Yes, he manages neonatal and paediatric conditions."
      },
      {
        "question": "Is he involved in academic work?",
        "answer": "Yes, he is an author and DNB examiner."
      }
    ]
  },
  {
    "slug": "dr-nitika-kaur",
    "name": "Dr. Nitika Kaur",
    "specialty": "Dental Medicine",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-nitika-kaur-consultant-dental-medicine.jpeg",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Dental Medicine",
    "degree": "BDS | Certified in Endodontics",
    "about": "Dr. Nitika Kaur is a Dental Medicine Consultant known for providing comprehensive dental care ranging from general dentistry to advanced cosmetic and restorative procedures. She is appreciated for her gentle approach, patient education, and preventive dentistry expertise.",
    "medicalProblems": [
      {
        "title": "Dental Decay & Cavities",
        "description": "Diagnosis and treatment of pain, decay, and oral infections."
      },
      {
        "title": "Aesthetic Concerns",
        "description": "Teeth whitening, smile design, and cosmetic improvements."
      },
      {
        "title": "Restorative Issues",
        "description": "Treatment for damaged or missing teeth."
      }
    ],
    "procedures": [
      {
        "title": "Root Canal Therapy",
        "description": "Endodontic treatment for infected or painful teeth."
      },
      {
        "title": "Cosmetic Dentistry",
        "description": "Smile designing, whitening, and restorations."
      },
      {
        "title": "Full Mouth Rehabilitation",
        "description": "Comprehensive restoration of oral structure and function."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Nitika perform root canals?",
        "answer": "Yes, she is certified in endodontics and performs RCTs."
      },
      {
        "question": "Does she offer cosmetic treatments?",
        "answer": "Yes, she provides multiple cosmetic and restorative procedures."
      },
      {
        "question": "Does she treat children and adults?",
        "answer": "Yes, she offers dental care for all age groups."
      }
    ]
  },
  {
    "slug": "dr-nitin-shrivastava",
    "name": "Dr. Nitin Shrivastava",
    "specialty": "Urology & Kidney Transplant",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "15+ years",
    "image": "dr-nitin-shrivastava-best-doctor-for-urology-diseases-in-gurgaon.webp",
    "isTopDoctor": true,
    "position": "Lead Consultant \u2013 Urology",
    "degree": "MBBS | MS | MCLS | MCh (Urology) | FRCS",
    "about": "Dr. Nitin Shrivastava is a leading Urologist specializing in kidney transplant, robotic surgery, endourology, male infertility, and urological cancers. With international training at Oxford University and AIIMS, he is known for high surgical precision, outstanding outcomes, and extensive research contributions.",
    "medicalProblems": [
      {
        "title": "Kidney & Urinary Disorders",
        "description": "Stones, infections, urinary obstruction, and renal conditions."
      },
      {
        "title": "Male Infertility",
        "description": "Diagnosis and management of infertility and hormone-related issues."
      },
      {
        "title": "Urological Cancers",
        "description": "Kidney, bladder, prostate, and testicular cancers."
      }
    ],
    "procedures": [
      {
        "title": "Robotic & Laparoscopic Surgery",
        "description": "Advanced minimally invasive urological surgeries."
      },
      {
        "title": "Kidney Transplant Surgery",
        "description": "Comprehensive transplant evaluation and procedures."
      },
      {
        "title": "Endourology Procedures",
        "description": "Laser stone surgery, ureteroscopy, and reconstructive procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Nitin perform kidney transplant?",
        "answer": "Yes, he specializes in kidney transplant surgery."
      },
      {
        "question": "Does he treat infertility?",
        "answer": "Yes, he is an expert in male infertility and andrology."
      },
      {
        "question": "Does he perform robotic urology?",
        "answer": "Yes, he is internationally trained in robotic surgery."
      }
    ]
  },
  {
    "slug": "dr-pranshul-bishnoi",
    "name": "Dr. Pranshul Bishnoi",
    "specialty": "Orthopaedics & Joint Replacement",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-pranshul-consultant-orthopaedics.png",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Orthopaedics & Joint Replacement",
    "degree": "MBBS | DNB (Orthopaedics) | ATLS | FIFA Diploma (Sports Medicine)",
    "about": "Dr. Pranshul Bishnoi is an Orthopaedic Surgeon specializing in trauma care, joint replacement, and sports medicine. He is trained under global orthopedic programs such as ATLS and FIFA Sports Medicine and is a member of NASS and the Indian Arthroscopy Society.",
    "medicalProblems": [
      {
        "title": "Orthopaedic Injuries",
        "description": "Fractures, ligament tears, sports injuries."
      },
      {
        "title": "Joint Disorders",
        "description": "Arthritis, stiffness, mobility limitations."
      },
      {
        "title": "Spine-Related Issues",
        "description": "Back pain, disc problems, and degenerative spine conditions."
      }
    ],
    "procedures": [
      {
        "title": "Joint Replacement Surgeries",
        "description": "Hip, knee, and other joint replacement procedures."
      },
      {
        "title": "Sports Medicine Procedures",
        "description": "Ligament repair, arthroscopy, and athlete care."
      },
      {
        "title": "Trauma Surgery",
        "description": "Fracture fixation and emergency orthopaedic care."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Pranshul treat sports injuries?",
        "answer": "Yes, he holds a FIFA diploma in sports medicine."
      },
      {
        "question": "Does he perform joint replacement?",
        "answer": "Yes, he performs hip and knee replacement surgeries."
      },
      {
        "question": "Does he treat spine-related pain?",
        "answer": "Yes, he manages multiple degenerative and injury-related spine conditions."
      }
    ]
  },
  {
    "slug": "dr-priyanka-garg",
    "name": "Dr. Priyanka Garg",
    "specialty": "Anaesthesiology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "dr-mriganka-sekhar-sharma-consultant.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Anaesthesiology",
    "degree": "MBBS | DA | DNB",
    "about": "Dr. Priyanka Garg is an accomplished Anaesthesiologist with over 20 years of experience across leading Indian hospitals. She specializes in robotic, transplant, neuro, thoracic, critical care, emergency anaesthesia, and advanced pain management. Her expertise includes crisis handling, airway management, and postoperative care.",
    "medicalProblems": [
      {
        "title": "Anaesthesia for Complex Surgeries",
        "description": "Robotic, neuro, thoracic, transplant, and emergency cases."
      },
      {
        "title": "Acute & Chronic Pain",
        "description": "Pain relief, nerve blocks, and palliative pain care."
      },
      {
        "title": "Critical Care Support",
        "description": "Airway management and ICU-level anaesthesia care."
      }
    ],
    "procedures": [
      {
        "title": "Anaesthesia Planning",
        "description": "Custom anaesthesia plans for surgery and comorbid conditions."
      },
      {
        "title": "Pain Management Procedures",
        "description": "Ultrasound-guided nerve blocks and chronic pain interventions."
      },
      {
        "title": "Emergency Response",
        "description": "Advanced airway, resuscitation, and critical care procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Priyanka handle robotic surgery anaesthesia?",
        "answer": "Yes, she is highly experienced in robotic and minimally invasive surgery anaesthesia."
      },
      {
        "question": "Does she treat chronic pain?",
        "answer": "Yes, she performs nerve blocks and chronic pain interventions."
      },
      {
        "question": "Is she involved in academic teaching?",
        "answer": "Yes, she has mentored DNB students for nearly a decade."
      }
    ]
  },
  {
    "slug": "dr-puneet-kant-arora",
    "name": "Dr. Puneet Kant Arora",
    "specialty": "Neurosurgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "best-neurosurgeon-in-delhi-dr-puneet-kant-arora.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Neurosurgery",
    "degree": "MBBS | MS (General Surgery) | MCh (Neurosurgery)",
    "about": "Dr. Puneet Kant Arora is a highly accomplished neurosurgeon with advanced expertise in minimally invasive spine surgery, brain tumor surgery, vascular neurosurgery, skull base surgery, deep brain stimulation, and endoscopic neurosurgery. He is widely recognized for treating complex head and spine injuries and neuropathic pain using modern techniques.",
    "medicalProblems": [
      {
        "title": "Brain & Spine Tumors",
        "description": "Management of complex brain tumors, pituitary tumors, and spinal tumors."
      },
      {
        "title": "Neurological Injuries",
        "description": "Treatment of severe head injuries, spine trauma, and hydrocephalus."
      },
      {
        "title": "Movement & Nerve Disorders",
        "description": "Deep brain stimulation and management of neuropathic pain and spasticity."
      }
    ],
    "procedures": [
      {
        "title": "Minimally Invasive Spine Surgery",
        "description": "Advanced MIS procedures for spinal tumors and disc issues."
      },
      {
        "title": "Endoscopic Brain & Skull Base Surgery",
        "description": "Endoscopic and transnasal approaches to pituitary and skull base tumors."
      },
      {
        "title": "Functional Neurosurgery",
        "description": "Deep brain stimulation, epilepsy surgery, and spasticity management."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Puneet perform minimally invasive spine surgery?",
        "answer": "Yes, he specializes in MIS procedures for spinal tumors and spine disorders."
      },
      {
        "question": "Is he experienced in brain tumor surgery?",
        "answer": "Yes, he performs complex brain tumor and skull base surgeries."
      },
      {
        "question": "Does he treat neuropathic pain?",
        "answer": "Yes, he manages chronic neuropathic pain with advanced neurosurgical techniques."
      }
    ]
  },
  {
    "slug": "dr-ritu-mann",
    "name": "Dr. Ritu Mann",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "8+ years",
    "image": "dr-amitabha-ghosh-consultant.png",
    "isTopDoctor": true,
    "position": "Associate Consultant \u2013 Obstetrics & Gynaecology",
    "degree": "MBBS | MS | DNB | FMAS",
    "about": "Dr. Ritu Mann is an experienced Obstetrician and Gynaecologist specializing in high-risk obstetrics, adolescent gynaecology, menopause management, reproductive health, and minimally invasive laparoscopic surgery. A gold medallist and AIIMS-trained clinician, she delivers compassionate and evidence-based women\u2019s healthcare.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Comprehensive monitoring and management of complex pregnancies."
      },
      {
        "title": "Gynaecological Disorders",
        "description": "Adolescent, reproductive, and menopausal health issues."
      },
      {
        "title": "Sexual & Reproductive Health",
        "description": "Counseling and treatment for fertility and hormonal concerns."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive procedures for gynaecological conditions."
      },
      {
        "title": "Obstetric Management",
        "description": "Normal, high-risk, and complex deliveries."
      },
      {
        "title": "Preventive Screenings",
        "description": "Cervical cancer screening, Pap smear, and women's wellness exams."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ritu handle high-risk pregnancies?",
        "answer": "Yes, she specializes in advanced high-risk obstetric care."
      },
      {
        "question": "Does she perform laparoscopic surgeries?",
        "answer": "Yes, she is FMAS-certified in minimally invasive surgery."
      },
      {
        "question": "Does she manage adolescent health issues?",
        "answer": "Yes, she provides complete adolescent gynaecology services."
      }
    ]
  },
  {
    "slug": "dr-salil-yadav",
    "name": "Dr. Salil Yadav",
    "specialty": "General Surgery & Robotic Surgery",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "Dr__Sahil_Yadav_(1).webp",
    "isTopDoctor": false,
    "position": "Consultant \u2013 General, Minimal Access & Robotic Surgery",
    "degree": "MBBS | MS",
    "about": "Dr. Salil Yadav is a specialist in general, laparoscopic, minimal access, and robotic surgery. He performs colorectal surgery, breast disease management, bariatric surgery, hernia repair, thoracoscopic procedures, and advanced laser treatments for anorectal diseases. He is known for his precision, compassionate care, and patient-focused surgical outcomes.",
    "medicalProblems": [
      {
        "title": "Abdominal & Digestive Disorders",
        "description": "Hernia, gallbladder, colorectal and intestinal diseases."
      },
      {
        "title": "Breast Conditions",
        "description": "Benign and malignant breast disease evaluation and surgery."
      },
      {
        "title": "Anorectal Diseases",
        "description": "Hemorrhoids, fistula, fissures, and pilonidal sinus issues."
      }
    ],
    "procedures": [
      {
        "title": "Robotic & Laparoscopic Surgery",
        "description": "Minimally invasive abdominal and colorectal surgeries."
      },
      {
        "title": "Bariatric Surgery",
        "description": "Sleeve gastrectomy, RYGB, MGB and other metabolic surgeries."
      },
      {
        "title": "Laser Proctology",
        "description": "Laser treatment for piles, fistula (VAAFT), and anorectal issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Salil perform robotic surgery?",
        "answer": "Yes, he specializes in robotic and minimal access procedures."
      },
      {
        "question": "Does he treat hemorrhoids and fistulas?",
        "answer": "Yes, he performs laser and minimally invasive anorectal procedures."
      },
      {
        "question": "Does he offer bariatric surgery?",
        "answer": "Yes, he performs advanced obesity and metabolic surgeries."
      }
    ]
  },
  {
    "slug": "dr-sandeep-harkar",
    "name": "Dr. Sandeep Harkar",
    "specialty": "Urology & Renal Transplant",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "18+ years",
    "image": "dr-sandeep-harkar-urology-specialist-in-gurgaon.webp",
    "isTopDoctor": true,
    "position": "Principal Consultant \u2013 Urology",
    "degree": "MBBS | MS | DNB",
    "about": "Dr. Sandeep Harkar is a respected Urologist and Renal Transplant specialist with over 18 years of experience. He excels in endourology, laparoscopic surgery, robotic urology, kidney transplantation, reconstructive urology, and uro-oncology. Known for his advanced surgical precision and compassionate care, he is among the leading urologists in Gurugram.",
    "medicalProblems": [
      {
        "title": "Kidney & Urinary Disorders",
        "description": "Stone disease, infections, obstruction, and renal dysfunction."
      },
      {
        "title": "Urological Cancers",
        "description": "Bladder, prostate, kidney, and testicular cancers."
      },
      {
        "title": "Male Urological Conditions",
        "description": "Prostate enlargement, urinary retention, and infertility issues."
      }
    ],
    "procedures": [
      {
        "title": "Kidney Transplant & Nephrectomy",
        "description": "Advanced renal transplant and surgical kidney care."
      },
      {
        "title": "Robotic & Laparoscopic Urology",
        "description": "High-precision minimally invasive procedures using robotic systems."
      },
      {
        "title": "Endourology Techniques",
        "description": "RIRS, ESWL, and laser surgeries for stones and strictures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Harkar perform robotic surgeries?",
        "answer": "Yes, he is trained in advanced da Vinci robotic urology."
      },
      {
        "question": "Does he specialize in kidney transplantation?",
        "answer": "Yes, he has extensive transplant experience from leading centers."
      },
      {
        "question": "Does he manage urological cancers?",
        "answer": "Yes, he treats prostate, bladder, and kidney tumors."
      }
    ]
  },
  {
    "slug": "dr-sandeep-mandal",
    "name": "Dr. Sandeep Kumar Mandal",
    "specialty": "Nephrology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-sandeep-kumar-mandal-consultant-nephrology.png",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Nephrology",
    "degree": "MBBS | MD (Internal Medicine) | DNB (Nephrology)",
    "about": "Dr. Sandeep Kumar Mandal is a Consultant Nephrologist experienced in treating kidney diseases, electrolyte imbalances, hypertension-related kidney damage, dialysis care, and transplant patient management. He has authored educational content to raise awareness on kidney health and chronic kidney disease.",
    "medicalProblems": [
      {
        "title": "Chronic Kidney Disease",
        "description": "Evaluation and management of CKD at all stages."
      },
      {
        "title": "Hypertension-related Kidney Issues",
        "description": "Kidney complications arising from long-term hypertension."
      },
      {
        "title": "Electrolyte & Renal Disorders",
        "description": "Management of sodium, potassium, and fluid imbalance conditions."
      }
    ],
    "procedures": [
      {
        "title": "Dialysis Management",
        "description": "Care for hemodialysis and peritoneal dialysis patients."
      },
      {
        "title": "Kidney Disease Evaluation",
        "description": "Comprehensive renal assessments and treatment planning."
      },
      {
        "title": "Transplant Support",
        "description": "Pre- and post-transplant nephrology care."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mandal treat chronic kidney disease?",
        "answer": "Yes, he has extensive experience in CKD evaluation and management."
      },
      {
        "question": "Does he handle dialysis patients?",
        "answer": "Yes, he manages both hemodialysis and peritoneal dialysis patients."
      },
      {
        "question": "Does he educate patients on renal health?",
        "answer": "Yes, he has authored multiple awareness articles on kidney health."
      }
    ]
  },
  {
    "slug": "dr-sanjay-kapoor",
    "name": "Dr. Sanjay Kapoor",
    "specialty": "Robotic Joint Replacement & Orthopaedics",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "20+ years",
    "image": "best-orthopedist-in-gurgaon-dr-sanjay-kapoor.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Robotic Joint Replacement & Orthopaedics",
    "degree": "MBBS | D-Ortho | MS Ortho | MCh Ortho",
    "about": "Dr. Sanjay Kapoor is a leading Orthopaedic Surgeon specializing in robotic joint replacement surgery, complex trauma care, arthroscopy, regenerative medicine, and minimally invasive orthopedic procedures. With over two decades of experience, he is known for his precision and advanced robotic-assisted knee and hip surgeries.",
    "medicalProblems": [
      {
        "title": "Arthritis & Joint Pain",
        "description": "Knee, hip, and joint degeneration causing chronic pain."
      },
      {
        "title": "Sports & Ligament Injuries",
        "description": "ACL, meniscus, and ligament tears requiring arthroscopy."
      },
      {
        "title": "Trauma & Fractures",
        "description": "Complex fractures and orthopedic trauma requiring surgery."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Joint Replacement",
        "description": "AI/AR-based robotic knee and hip surgeries for high precision."
      },
      {
        "title": "Arthroscopic Surgery",
        "description": "Minimally invasive procedures for ligament repairs."
      },
      {
        "title": "Regenerative Therapies",
        "description": "Stem cell, PRP, and cartilage regeneration treatments."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kapoor perform robotic joint surgeries?",
        "answer": "Yes, he is certified in advanced robotic joint replacement."
      },
      {
        "question": "Does he treat sports injuries?",
        "answer": "Yes, he performs arthroscopic ligament repair and sports procedures."
      },
      {
        "question": "Does he manage arthritis with regenerative medicine?",
        "answer": "Yes, he uses PRP, stem cells, and regenerative treatments."
      }
    ]
  },
  {
    "slug": "dt-shalini-bliss",
    "name": "Dr. Shalini Garwin Bliss",
    "specialty": "Dietetics & Nutrition",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-shalini-garwin-bliss-dietitian.webp",
    "isTopDoctor": true,
    "position": "Associate Manager \u2013 Dietetics",
    "degree": "MSc in Food & Human Nutrition",
    "about": "Dt. Shalini Garwin Bliss is a senior dietitian known for her expertise in clinical nutrition, metabolic health, gastrointestinal diets, public health nutrition, and lifestyle disease management. She has been featured in major media outlets for her insights on digestive health, immunity, fasting diets, eating disorders, and diet planning.",
    "medicalProblems": [
      {
        "title": "Digestive & Gut Disorders",
        "description": "Customized diets for ulcerative colitis, IBS, acidity, and indigestion."
      },
      {
        "title": "Lifestyle & Metabolic Diseases",
        "description": "Nutritional care for obesity, diabetes, PCOS, and heart health."
      },
      {
        "title": "Eating Disorders",
        "description": "Counseling and meal planning for behavioral and nutritional recovery."
      }
    ],
    "procedures": [
      {
        "title": "Clinical Diet Planning",
        "description": "Custom diets for medical, metabolic, and chronic conditions."
      },
      {
        "title": "Therapeutic Nutrition",
        "description": "Disease-specific nutritional interventions."
      },
      {
        "title": "Nutritional Counseling",
        "description": "Lifestyle modification and food behavior guidance."
      }
    ],
    "faqs": [
      {
        "question": "Does Dt. Shalini treat digestive issues?",
        "answer": "Yes, she specializes in gastrointestinal and gut-health diets."
      },
      {
        "question": "Does she help with weight management?",
        "answer": "Yes, she prepares customized plans for weight loss and metabolic health."
      },
      {
        "question": "Is she featured in media for nutrition topics?",
        "answer": "Yes, she appears regularly in national media for nutrition insights."
      }
    ]
  },
  {
    "slug": "dr-shaloo-bhasin-gagneja",
    "name": "Dr. Shaloo Bhasin Gagneja",
    "specialty": "Rheumatology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "15+ years",
    "image": "best-rheumatologist-in-gurugram-dr-shaloo-bhasin-gagneja.png",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Rheumatology",
    "degree": "MBBS | DNB (Medicine) | Clinical Fellowship (Rheumatology, NUH Singapore)",
    "about": "Dr. Shaloo Bhasin Gagneja is one of the leading Rheumatologists in Gurugram with over 15 years of extensive experience. She specializes in rheumatoid arthritis, lupus, systemic sclerosis, gout, fibromyalgia, vasculitis, and advanced musculoskeletal ultrasonography. She is widely recognized for performing ultrasound-guided procedures and joint injections with high accuracy.",
    "medicalProblems": [
      {
        "title": "Autoimmune Joint Disorders",
        "description": "Rheumatoid arthritis, lupus, gout, and connective tissue diseases."
      },
      {
        "title": "Musculoskeletal Pain",
        "description": "Fibromyalgia, osteoarthritis, soft tissue disorders."
      },
      {
        "title": "Vasculitis & Systemic Issues",
        "description": "Inflammatory vascular diseases and systemic rheumatologic conditions."
      }
    ],
    "procedures": [
      {
        "title": "Ultrasound-Guided Joint Injections",
        "description": "Precise diagnostic and therapeutic injections."
      },
      {
        "title": "Musculoskeletal Ultrasound",
        "description": "Advanced imaging for joint, tendon, and soft-tissue evaluation."
      },
      {
        "title": "Autoimmune Disease Therapy",
        "description": "Biologics, DMARDs, and targeted treatments for rheumatic diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Shaloo perform ultrasound-guided procedures?",
        "answer": "Yes, she is trained internationally in musculoskeletal ultrasound."
      },
      {
        "question": "Does she treat rheumatoid arthritis and lupus?",
        "answer": "Yes, she is an expert in autoimmune and connective tissue diseases."
      },
      {
        "question": "Is she active in research and conferences?",
        "answer": "Yes, she has multiple publications and speaks at national conferences."
      }
    ]
  },
  {
    "slug": "dr-shweta-sharma",
    "name": "Dr. Shweta Sharma",
    "specialty": "Psychology & Counseling",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "dr-mriganka-sekhar-sharma-consultant.png",
    "isTopDoctor": false,
    "position": "Consultant \u2013 Psychology & Counseling",
    "degree": "Diploma (Guidance & Counseling) | MA (Clinical Psychology) | M.Phil (Medical & Social Psychology)",
    "about": "Dr. Shweta Sharma is a Consultant Psychologist specializing in clinical psychology, counseling, behavioral assessments, and psychological rehabilitation. She has extensive experience in personality disorders, juvenile behavioral issues, emotional wellness, and mental health therapy.",
    "medicalProblems": [
      {
        "title": "Anxiety & Stress Disorders",
        "description": "Therapy for anxiety, stress, and emotional instability."
      },
      {
        "title": "Behavioral & Developmental Issues",
        "description": "Child and adolescent behavioral concerns and juvenile delinquency evaluation."
      },
      {
        "title": "Relationship & Adjustment Issues",
        "description": "Counseling for marriage, relationships, and psychosocial wellbeing."
      }
    ],
    "procedures": [
      {
        "title": "Psychological Assessments",
        "description": "Rorschach, personality tests, behavioral assessments."
      },
      {
        "title": "Individual & Family Counseling",
        "description": "Therapy sessions for emotional and social wellbeing."
      },
      {
        "title": "Rehabilitation Support",
        "description": "Psychological care for chronic illness and emotional trauma."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Shweta treat anxiety?",
        "answer": "Yes, she offers therapy for anxiety and stress disorders."
      },
      {
        "question": "Does she handle juvenile behavioral issues?",
        "answer": "Yes, she has published and presented research in this area."
      },
      {
        "question": "Does she provide family counseling?",
        "answer": "Yes, she provides therapy for families and couples."
      }
    ]
  },
  {
    "slug": "dr-uddhavesh-paithankar",
    "name": "Dr. Uddhavesh M Paithankar",
    "specialty": "Gastroenterology",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "",
    "image": "gastrologist-in-gurgaon-dr-uddhavesh-m-paithankar.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Gastroenterology",
    "degree": "MBBS | MD Medicine | MRCP (UK) | DNB Gastroenterology",
    "about": "Dr. Uddhavesh M Paithankar is an experienced gastroenterologist with expertise in digestive, liver, pancreatic, and intestinal diseases. He specializes in endoscopy, colonoscopy, ERCP, endoscopic ultrasound, and metal stent placement for cancer palliation. His care philosophy is rooted in compassion and patient education.",
    "medicalProblems": [
      {
        "title": "Digestive Disorders",
        "description": "Acidity, reflux, IBS, stomach pain, and ulcer issues."
      },
      {
        "title": "Liver & Pancreatic Diseases",
        "description": "Hepatitis, fatty liver, pancreatitis, and bile duct disorders."
      },
      {
        "title": "Intestinal Problems",
        "description": "Colitis, Crohn\u2019s disease, and chronic bowel conditions."
      }
    ],
    "procedures": [
      {
        "title": "Endoscopy & Colonoscopy",
        "description": "Upper GI and lower GI diagnostic procedures."
      },
      {
        "title": "ERCP & EUS",
        "description": "Advanced endoscopic procedures for pancreatic and biliary issues."
      },
      {
        "title": "Metal Stenting",
        "description": "Stent placement for cancer-related obstructions."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Uddhavesh perform ERCP?",
        "answer": "Yes, he is skilled in ERCP and endoscopic ultrasound."
      },
      {
        "question": "Does he treat liver diseases?",
        "answer": "Yes, he manages fatty liver, hepatitis, and other liver disorders."
      },
      {
        "question": "Does he handle cancer-related GI blockages?",
        "answer": "Yes, he performs metal stenting for palliation."
      }
    ]
  },
  {
    "slug": "dt-ashish-rani",
    "name": "Dt. Ashish Rani",
    "specialty": "Nutrition & Dietetics",
    "hospital": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "experience": "12+ years",
    "image": "dr-ashish-dagar-spine-surgery.webp",
    "isTopDoctor": true,
    "position": "Consultant \u2013 Nutrition & Dietetics",
    "degree": "MSc (Dietetics & Food Service Mgmt) | DNHE | Critical Care Nutrition Certification",
    "about": "Dt. Ashish Rani is an expert clinical dietitian with over 12 years of experience, specializing in renal, cardiac, diabetic, liver, antenatal, postnatal, gluten-free, transplant-related, and lifestyle nutrition. She serves as Head of Department and is known for her evidence-based diet planning and multidisciplinary care approach.",
    "medicalProblems": [
      {
        "title": "Lifestyle Diseases",
        "description": "PCOD, obesity, diabetes, and heart-related nutritional issues."
      },
      {
        "title": "Organ-specific Diet Needs",
        "description": "Renal, liver, and cardiac diet planning for complex patients."
      },
      {
        "title": "Critical Care Nutrition",
        "description": "Specialized diet planning for ICU and high-risk patients."
      }
    ],
    "procedures": [
      {
        "title": "Diet Planning for Multi-disease Patients",
        "description": "Customized diet plans for renal, liver, diabetic, and cardiac patients."
      },
      {
        "title": "Clinical & Therapeutic Nutrition",
        "description": "Nutrition management for hospital inpatients and OPD patients."
      },
      {
        "title": "Lifestyle Modification Counseling",
        "description": "Weight loss, hormonal balance, and nutrition coaching."
      }
    ],
    "faqs": [
      {
        "question": "Does Dt. Ashish handle renal and cardiac diets?",
        "answer": "Yes, she is experienced in managing complex renal and cardiac cases."
      },
      {
        "question": "Does she counsel for weight management?",
        "answer": "Yes, she prepares personalized diet plans for weight loss and gain."
      },
      {
        "question": "Is she experienced in critical care nutrition?",
        "answer": "Yes, she is certified in enteral and parenteral nutrition."
      }
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

app.get('/admin/seed-login', async (req, res) => {
   try {
   

    console.log("🔥 MongoDB Connected");

    const username = "admin";
    const password = "admin123"; // You can change this

    // Check if admin already exists
    const existing =  AdminUser.findOne({ username });

    if (existing) {
      console.log("✔ Admin already exists. Skipping.");
      console.log(existing);
      process.exit(0);
    }

    // Create admin
    const admin = await AdminUser.create({
      username,
      password,
      role: "admin",
    });

    console.log("🎉 Admin User Created Successfully:");
    console.log(admin);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
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



/**
 * @route GET /api/doctors/update-images
 * @desc Bulk update doctor images
 * @query data=[{ "name": "...", "image": "..." }, ...]
 */
app.get("/update-images", async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'data' is required. Pass an array of objects."
      });
    }

    // Parse JSON array coming from query string
    let doctorsToUpdate;
    try {
      doctorsToUpdate = JSON.parse(data);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in 'data' query parameter"
      });
    }

    const results = [];
    const errors = [];

    for (const doc of doctorsToUpdate) {
      const { name, image } = doc;

      if (!name || !image) {
        errors.push({ name, message: "Missing name or image" });
        continue;
      }

      const updated = await Doctor.findOneAndUpdate(
        { name: name.trim() },
        { image },
        { new: true }
      );

      if (!updated) {
        errors.push({ name, message: "Doctor not found" });
      } else {
        results.push(updated);
      }
    }

    res.json({
      success: true,
      message: "Bulk update completed",
      updated: results,
      errors
    });

  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
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
