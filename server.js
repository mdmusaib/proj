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
    "name": "Dr. A. S. Soin",
    "designation": "Chairman - Liver Transplant Surgery",
    "department": "Liver Transplant",
    "qualification": "MBBS, MS (General Surgery), FRCS (Surgery)",
    "experience": "38+ years",
    "about": "Has performed over 2500 liver transplants with a 95% success rate. Leads India's largest and most successful liver transplant program. Over 12,000 complex liver, gall bladder, and bile duct surgeries.",
    "specializations": [
      "Hepatocellular Carcinoma",
      "Liver Transplant",
      "Liver Surgeries",
      "Choledochal Cyst",
      "Portal Hypertension"
    ],
    "milestones": [
      "First successful cadaveric liver transplant in India (1998)",
      "First successful live donor left lobe transplant (1999)",
      "First successful combined liver-kidney transplant (1999)",
      "Padma Shri (2010)",
      "Limca Book Records (2007\u20132010)",
      "Swastha Bharat Samman (2011)"
    ],
    "medicalProblems": [
      {
        "title": "Liver Cirrhosis",
        "description": ""
      },
      {
        "title": "Liver Failure",
        "description": ""
      },
      {
        "title": "Liver Cancer (Hepatocellular Carcinoma)",
        "description": ""
      },
      {
        "title": "Bile Duct Cancer",
        "description": ""
      },
      {
        "title": "Portal Hypertension",
        "description": ""
      },
      {
        "title": "Gallbladder Diseases",
        "description": ""
      },
      {
        "title": "Congenital Liver Diseases",
        "description": ""
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplant (Living & Cadaveric)",
        "description": ""
      },
      {
        "title": "Complex Liver Resection",
        "description": ""
      },
      {
        "title": "Bile Duct Reconstruction",
        "description": ""
      },
      {
        "title": "Portal Hypertension Surgery",
        "description": ""
      },
      {
        "title": "Choledochal Cyst Surgery",
        "description": ""
      },
      {
        "title": "Gallbladder and Hepatobiliary Surgeries",
        "description": ""
      }
    ],
    "faqs": [
      {
        "question": "What is the success rate of liver transplants by Dr. Soin?",
        "answer": "He maintains one of the highest success rates in India at around 95%."
      },
      {
        "question": "How long is the liver transplant recovery?",
        "answer": "Most patients recover within 6\u201312 weeks depending on overall health."
      },
      {
        "question": "When is liver transplant recommended?",
        "answer": "When liver fails to perform essential functions despite medications."
      }
    ]
  },
  {
    "name": "Dr. Ashok Kumar Vaid",
    "designation": "Chairman - Cancer Institute",
    "department": "Cancer Care",
    "qualification": "MBBS, MD (General Medicine), DM (Medical Oncology)",
    "experience": "41+ years",
    "about": "Started one of the largest stem cell transplant programs in North India. Conducted over 40 major clinical research studies. Conferred Padma Shri in 2009.",
    "specializations": [
      "Organ-Specific Cancer Treatment",
      "Medical Oncology",
      "Leukemia",
      "Lymphoma",
      "Solid Tumors"
    ],
    "milestones": [
      "Padma Shri Award (2009)",
      "Chikitsa Shiromani Award (2007)"
    ],
    "medicalProblems": [
      {
        "title": "Blood Cancers (Leukemias, Lymphomas)",
        "description": ""
      },
      {
        "title": "Breast Cancer",
        "description": ""
      },
      {
        "title": "Lung Cancer",
        "description": ""
      },
      {
        "title": "Gastrointestinal Cancers",
        "description": ""
      },
      {
        "title": "Genetic Cancers",
        "description": ""
      },
      {
        "title": "Immune System Cancers",
        "description": ""
      }
    ],
    "procedures": [
      {
        "title": "Chemotherapy",
        "description": ""
      },
      {
        "title": "Immunotherapy",
        "description": ""
      },
      {
        "title": "Stem Cell (Bone Marrow) Transplant",
        "description": ""
      },
      {
        "title": "Targeted Therapy",
        "description": ""
      },
      {
        "title": "Precision Oncology",
        "description": ""
      },
      {
        "title": "Dendritic Cell Therapy",
        "description": ""
      }
    ],
    "faqs": [
      {
        "question": "Does chemotherapy always cause hair loss?",
        "answer": "Not always. It depends on the type of chemotherapy drugs used."
      },
      {
        "question": "What is targeted therapy?",
        "answer": "A treatment that focuses on specific cancer genes or proteins."
      },
      {
        "question": "What is the success rate of stem cell transplant?",
        "answer": "Varies by disease type but Dr. Vaid\u2019s program is among India\u2019s most successful."
      }
    ]
  },
  {
    "name": "Dr. Ashok Rajgopal",
    "designation": "Group Chairman - Orthopaedics",
    "department": "Orthopaedics",
    "qualification": "MBBS, MS (Orthopaedics), MCh (Orthopaedics), FRCS",
    "experience": "49+ years",
    "about": "Internationally renowned orthopedic surgeon with 39,000+ knee replacements and 60,000+ arthroscopic surgeries. Pioneer in minimally invasive knee replacement.",
    "specializations": [
      "Knee Replacement Surgery",
      "Joint Replacement",
      "Arthroscopic Ligament Surgery",
      "Hip Surgery",
      "Robotic Surgery"
    ],
    "milestones": [
      "Padma Shri (2014)",
      "Dr. B C Roy Award (2014)",
      "Lifetime Achievement Awards (2016)"
    ],
    "medicalProblems": [
      {
        "title": "Osteoarthritis",
        "description": ""
      },
      {
        "title": "Rheumatoid Arthritis",
        "description": ""
      },
      {
        "title": "Knee Joint Damage",
        "description": ""
      },
      {
        "title": "Hip Joint Degeneration",
        "description": ""
      },
      {
        "title": "Sports Injuries",
        "description": ""
      },
      {
        "title": "Ligament Tears",
        "description": ""
      }
    ],
    "procedures": [
      {
        "title": "Total Knee Replacement",
        "description": ""
      },
      {
        "title": "Minimally Invasive Knee Replacement",
        "description": ""
      },
      {
        "title": "Hip Replacement",
        "description": ""
      },
      {
        "title": "Arthroscopic ACL/PCL Reconstruction",
        "description": ""
      },
      {
        "title": "Robotic Knee Surgery",
        "description": ""
      }
    ],
    "faqs": [
      {
        "question": "How long does knee replacement last?",
        "answer": "Modern implants last 20\u201325 years with proper care."
      },
      {
        "question": "Is robotic knee surgery better?",
        "answer": "It improves precision, reduces pain, and speeds recovery."
      },
      {
        "question": "How soon can one walk after knee surgery?",
        "answer": "Most patients walk within 24\u201348 hours."
      }
    ]
  },
  {
    "name": "Dr. Deepak Sarin",
    "designation": "Chairman - Head & Neck Onco Surgery",
    "department": "Cancer Care",
    "qualification": "MBBS, MS (ENT), DNB, Fellowship in Head & Neck Onco Surgery",
    "experience": "31+ years",
    "about": "Established multiple Head & Neck Oncology departments across India. Expert in oral cancer, thyroid surgery, robotic and laser surgeries.",
    "specializations": [
      "Oral Cancer Surgery",
      "Thyroid & Parathyroid Surgery",
      "Reconstructive Surgery",
      "Laser & Robotic Surgery"
    ],
    "milestones": [
      "Chandler Society Award (USA)",
      "Mukut Sahariya Award"
    ],
    "medicalProblems": [
      {
        "title": "Oral Cancer",
        "description": ""
      },
      {
        "title": "Thyroid Cancer",
        "description": ""
      },
      {
        "title": "Throat Cancer",
        "description": ""
      },
      {
        "title": "Salivary Gland Tumors",
        "description": ""
      },
      {
        "title": "Parathyroid Disorders",
        "description": ""
      },
      {
        "title": "Head & Neck Masses",
        "description": ""
      }
    ],
    "procedures": [
      {
        "title": "Oral Cancer Resection",
        "description": ""
      },
      {
        "title": "Thyroidectomy",
        "description": ""
      },
      {
        "title": "Parathyroid Surgery",
        "description": ""
      },
      {
        "title": "Laser Tumor Removal",
        "description": ""
      },
      {
        "title": "Robotic Head & Neck Surgery",
        "description": ""
      },
      {
        "title": "Complex Reconstruction",
        "description": ""
      }
    ],
    "faqs": [
      {
        "question": "Is thyroid surgery safe?",
        "answer": "With modern techniques and an expert surgeon, it is very safe with minimal complications."
      },
      {
        "question": "Can oral cancer be treated?",
        "answer": "Yes\u2014early-stage oral cancer has high cure rates."
      },
      {
        "question": "Is robotic surgery better for head & neck cancers?",
        "answer": "Yes, it gives better precision, less pain, and faster recovery."
      }
    ]
  },
  {
    "name": "Dr. Gagan Gautam",
    "designation": "Chairman \u2013 Uro Oncology & Robotic Surgery",
    "department": "Renal Care",
    "qualification": "MBBS, MS (General Surgery), MCh (Urology)",
    "experience": "26+ years",
    "about": "One of India\u2019s most advanced robotic uro-oncology surgeons. Expert in prostate, kidney, bladder, and male reproductive cancers.",
    "specializations": [
      "Prostate Cancer",
      "Kidney Cancer",
      "Urinary Bladder Cancer",
      "Penile Cancer",
      "Testicular Cancer",
      "Adrenal Tumors"
    ],
    "milestones": [
      "CEO Award (2018)",
      "Agra Urology Club Awards (3 times)",
      "Urology Gold Medal (AIIMS)"
    ],
    "medicalProblems": [
      {
        "title": "Prostate Enlargement & Cancer",
        "description": ""
      },
      {
        "title": "Kidney Tumors",
        "description": ""
      },
      {
        "title": "Urinary Bladder Cancer",
        "description": ""
      },
      {
        "title": "Testicular Swelling/Cancer",
        "description": ""
      },
      {
        "title": "Penile Tumors",
        "description": ""
      },
      {
        "title": "Urinary Tract Obstruction",
        "description": ""
      }
    ],
    "procedures": [
      {
        "title": "Robotic Prostatectomy",
        "description": ""
      },
      {
        "title": "Robotic Partial Nephrectomy",
        "description": ""
      },
      {
        "title": "Robotic Cystectomy",
        "description": ""
      },
      {
        "title": "Urological Cancer Surgery",
        "description": ""
      },
      {
        "title": "Endoscopic Tumor Removal",
        "description": ""
      },
      {
        "title": "Minimally Invasive Uro Surgery",
        "description": ""
      }
    ],
    "faqs": [
      {
        "question": "Is robotic surgery safe for prostate cancer?",
        "answer": "Yes, it offers excellent precision with less bleeding and faster recovery."
      },
      {
        "question": "How long is hospitalization after robotic kidney surgery?",
        "answer": "Usually 2\u20133 days."
      },
      {
        "question": "Can bladder cancer be cured?",
        "answer": "Early detection has high success rates; advanced cases may need robotic cystectomy."
      }
    ]
  },
  {
    "slug": "dr-kumud-kumar-handa",
    "name": "Dr. Kumud Kumar Handa",
    "specialty": "ENT, Head & Neck Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "36+ years",
    "image": "assets/uploads/",
    "isTopDoctor": true,
    "position": "Chairman - ENT and Head & Neck Surgery",
    "degree": "DNB - ENT | MS - ENT | MBBS",
    "about": "Dr. K. K. Handa is a renowned laryngologist, voice surgeon, and cochlear implant specialist with more than 36 years of experience. Formerly Associate Professor at AIIMS, he has been leading the ENT & Head Neck Surgery department at Medanta since 2009. He is known as one of India's foremost experts in voice and laser surgery, cochlear implants, sinus surgery, and head & neck surgery.",
    "medicalProblems": [
      {
        "title": "Voice Disorders",
        "description": "Problems affecting vocal cords such as hoarseness, nodules, polyps, or paralysis."
      },
      {
        "title": "Hearing Loss",
        "description": "Mild to profound hearing impairment requiring evaluation and cochlear implants."
      },
      {
        "title": "Sinusitis",
        "description": "Chronic or recurrent sinus infections causing blockage and breathing issues."
      },
      {
        "title": "Throat & Head-Neck Tumors",
        "description": "Benign or malignant growths requiring advanced surgical treatment."
      }
    ],
    "procedures": [
      {
        "title": "Voice Surgery",
        "description": "Microscopic and laser-based surgery for vocal cord problems."
      },
      {
        "title": "Cochlear Implant Surgery",
        "description": "Hearing restoration using implanted auditory devices."
      },
      {
        "title": "Endoscopic Sinus Surgery",
        "description": "Minimally invasive procedure to clear sinus pathways."
      },
      {
        "title": "Microscopic Ear Surgery",
        "description": "Surgical correction of hearing issues caused by middle ear diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Handa perform cochlear implant surgery?",
        "answer": "Yes, he is among the most experienced cochlear implant surgeons in India."
      },
      {
        "question": "What is Dr. Handa\u2019s specialization?",
        "answer": "He specializes in laryngology, voice surgery, laser surgery, cochlear implants, and sinus surgery."
      },
      {
        "question": "Has he been associated with AIIMS?",
        "answer": "Yes, he served as Associate Professor at AIIMS for 13 years."
      }
    ]
  },
  {
    "slug": "dr-praveen-chandra",
    "name": "Dr. Praveen Chandra",
    "specialty": "Cardiac Care",
    "hospital": "Medanta - The Medicity",
    "experience": "36+ years",
    "image": "assets/uploads/dr-praveen-chandra.png",
    "isTopDoctor": true,
    "position": "Chairman - Cardiology",
    "degree": "FACC | FAPSIC | FESC | FSCAI | DM - Cardiology | MBBS | MD - General Medicine",
    "about": "Dr. Praveen Chandra is one of India\u2019s leading interventional cardiologists, known for pioneering angioplasty procedures and performing India's first Percutaneous Aortic Valve Implantation (TAVI). Awarded Padma Shri in 2016, he has authored 100+ research papers and introduced several innovative cardiac devices and technologies in India.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Blockages in coronary arteries leading to chest pain and heart attack risk."
      },
      {
        "title": "Valve Disorders",
        "description": "Aortic, mitral, and tricuspid valve diseases requiring advanced catheter-based treatment."
      },
      {
        "title": "Heart Rhythm Disorders",
        "description": "Irregular heartbeats requiring imaging, medication, or interventions."
      },
      {
        "title": "Acute Myocardial Infarction",
        "description": "Emergency condition requiring immediate angioplasty."
      }
    ],
    "procedures": [
      {
        "title": "TAVI (Aortic Valve Replacement)",
        "description": "Non-surgical replacement of diseased aortic valve."
      },
      {
        "title": "TMVR (Mitral Valve Replacement)",
        "description": "Percutaneous mitral valve intervention without open surgery."
      },
      {
        "title": "Angioplasty & Stenting",
        "description": "Restoring blood flow in blocked heart arteries."
      },
      {
        "title": "Percutaneous MitraClip",
        "description": "Minimally invasive repair for leaking mitral valve."
      }
    ],
    "faqs": [
      {
        "question": "What is Dr. Chandra most known for?",
        "answer": "Performing India\u2019s first TAVI and pioneering many interventional cardiology techniques."
      },
      {
        "question": "Does he treat heart attack cases?",
        "answer": "Yes, he is an expert in emergency angioplasty for acute MI patients."
      },
      {
        "question": "Has he received a national award?",
        "answer": "Yes, he received the Padma Shri in 2016."
      }
    ]
  },
  {
    "slug": "dr-praveen-khilnani",
    "name": "Dr. Praveen Khilnani",
    "specialty": "Paediatric Care",
    "hospital": "Medanta - The Medicity",
    "experience": "45+ years",
    "image": "assets/uploads/",
    "isTopDoctor": true,
    "position": "Chairman - Pediatrics, Pediatric Pulmonology & Critical Care",
    "degree": "MD - Paediatrics | MBBS",
    "about": "Dr. Praveen Khilnani is a US board-certified pediatrician and India's pioneer in pediatric critical care. With over four decades of experience, he is the only Indian to receive the prestigious Master of Critical Care Medicine (MCCM) award. He is known for expertise in pediatric pulmonology, critical care, neonatal bronchoscopy, and treating critically ill infants.",
    "medicalProblems": [
      {
        "title": "Pediatric Respiratory Disorders",
        "description": "Asthma, pneumonia, chronic cough, and lung infections in children."
      },
      {
        "title": "Neonatal & Pediatric Emergencies",
        "description": "Critical illnesses requiring intensive care support."
      },
      {
        "title": "Congenital Lung Diseases",
        "description": "Inherited or structural lung issues in newborns and children."
      },
      {
        "title": "Severe Infections in Children",
        "description": "Life-threatening infections needing critical care."
      }
    ],
    "procedures": [
      {
        "title": "Pediatric Bronchoscopy",
        "description": "Diagnostic and therapeutic airway procedure for children."
      },
      {
        "title": "Mechanical Ventilation Support",
        "description": "Critical care support for severely ill infants and children."
      },
      {
        "title": "Pediatric Intensive Care Management",
        "description": "Advanced ICU treatment for life-threatening conditions."
      },
      {
        "title": "Pulmonary Function Testing",
        "description": "Assessment of lung health in pediatric patients."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Khilnani certified in the US?",
        "answer": "Yes, he is a US board-certified pediatrician and intensivist."
      },
      {
        "question": "Does he specialize in pediatric critical care?",
        "answer": "Yes, he is a pioneer and leading authority in pediatric critical care in India."
      },
      {
        "question": "What awards has he received?",
        "answer": "He received the MCCM award and multiple recognitions in pediatric medicine."
      }
    ]
  },
  {
    "slug": "dr-rajesh-rajput",
    "name": "Dr. Rajesh Rajput",
    "specialty": "Endocrinology & Diabetes",
    "hospital": "Medanta - The Medicity",
    "experience": "31+ years",
    "image": "assets/uploads/dr-rajesh-rajput.png",
    "isTopDoctor": true,
    "position": "Director - Endocrinology & Diabetes",
    "degree": "FACE | MBBS | MD - Medicine | DM - Endocrinology | FRSSDI",
    "about": "Dr. Rajesh Rajput is a leading endocrinologist with more than 25 years of clinical experience and over 180 scientific publications. Former Head of Endocrinology at PGIMS Rohtak, he specializes in diabetes, thyroid disorders, obesity, PCOD, and metabolic bone diseases. He has received multiple oration awards and is known for his contribution to endocrine research and guidelines.",
    "medicalProblems": [
      {
        "title": "Diabetes (Type 1, Type 2, Complicated)",
        "description": "Comprehensive diabetes management including pregnancy and childhood diabetes."
      },
      {
        "title": "Thyroid Disorders",
        "description": "Hyperthyroidism, hypothyroidism, thyroid nodules, and autoimmune thyroid disease."
      },
      {
        "title": "PCOD & Menstrual Disorders",
        "description": "Hormonal imbalance affecting reproductive health."
      },
      {
        "title": "Obesity & Metabolic Syndrome",
        "description": "Weight and metabolism-related endocrine problems."
      }
    ],
    "procedures": [
      {
        "title": "Diabetes Management Protocols",
        "description": "Customized plans for sugar control and complication prevention."
      },
      {
        "title": "Thyroid Disorder Treatment",
        "description": "Medical and hormonal therapy for thyroid imbalance."
      },
      {
        "title": "Obesity & Hormone Therapy",
        "description": "Endocrine treatments for weight and metabolic issues."
      },
      {
        "title": "Bone Density & Metabolic Bone Disease Treatment",
        "description": "Therapy for osteoporosis and bone metabolism disorders."
      }
    ],
    "faqs": [
      {
        "question": "What conditions does Dr. Rajput treat?",
        "answer": "Diabetes, thyroid disorders, obesity, hormonal issues, PCOD, and bone diseases."
      },
      {
        "question": "Does he treat diabetes in pregnancy?",
        "answer": "Yes, he specializes in managing diabetes across all age groups including pregnancy."
      },
      {
        "question": "How experienced is he academically?",
        "answer": "He has over 180 research publications and multiple national awards."
      }
    ]
  },
  {
    "slug": "dr-rajesh-parakh",
    "name": "Dr. Rajiv Parakh",
    "specialty": "Peripheral Vascular & Endovascular Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "44+ years",
    "image": "assets/uploads/",
    "isTopDoctor": true,
    "position": "Chairman - Peripheral Vascular & Endovascular Surgery",
    "degree": "MBBS | MS - General Surgery | FRCS - Surgery",
    "about": "Dr. Rajiv Parakh is a pioneer in vascular and endovascular surgery in India. Trained in the UK, he established one of India's earliest independent vascular surgery departments in 1990. He is Vice President of the International Society for Vascular Surgery and has led multiple global vascular teaching and intervention programs.",
    "medicalProblems": [
      {
        "title": "Peripheral Artery Disease",
        "description": "Blockages in leg arteries causing pain, ulcers, and reduced blood flow."
      },
      {
        "title": "Varicose Veins",
        "description": "Enlarged veins requiring laser or glue-based treatment."
      },
      {
        "title": "Aneurysms",
        "description": "Bulging arteries such as aortic aneurysm requiring EVAR."
      },
      {
        "title": "Vascular Malformations",
        "description": "Abnormal vascular growths requiring embolisation."
      }
    ],
    "procedures": [
      {
        "title": "Peripheral Angioplasty",
        "description": "Opening blocked arteries in legs or arms."
      },
      {
        "title": "Varicose Vein Treatment (EVLT / RFA / Venaseal)",
        "description": "Laser, radiofrequency, or glue closure procedures."
      },
      {
        "title": "EVAR (Endovascular Aneurysm Repair)",
        "description": "Minimally invasive repair of aortic aneurysm."
      },
      {
        "title": "Carotid Artery Surgery",
        "description": "Open or stent-based treatment of carotid blockages."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Parakh treat varicose veins?",
        "answer": "Yes, he performs EVLT, RFA, and Venaseal for varicose veins."
      },
      {
        "question": "Is he experienced in EVAR?",
        "answer": "Yes, he is among India\u2019s most experienced specialists in EVAR and complex aneurysm repair."
      },
      {
        "question": "What is his global recognition?",
        "answer": "He is Vice President of the International Society for Vascular Surgery."
      }
    ]
  },
  {
    "slug": "dr-rajiva-gupta",
    "name": "Dr. Rajiva Gupta",
    "specialty": "Rheumatology & Clinical Immunology",
    "hospital": "Medanta - The Medicity",
    "experience": "38+ years",
    "image": "assets/uploads/dr-rajiva-gupta.png",
    "isTopDoctor": true,
    "position": "Chairman - Clinical Immunology & Rheumatology",
    "degree": "DNB - General Medicine | MD - General Medicine | MBBS | FRCP - Rheumatology | MRCP - Rheumatology and Clinical Immunology",
    "about": "Dr. Rajiva Gupta, Chairman of Clinical Immunology & Rheumatology at Medanta, completed his higher training in the UK and is a member of the Royal College of Physicians. He is a fellow of the Royal College of Physicians in Glasgow and Edinburgh, with over 15 national and international medical associations to his credit.",
    "medicalProblems": [
      {
        "title": "Rheumatoid Arthritis",
        "description": "A chronic inflammatory disorder affecting joints, causing pain and stiffness."
      },
      {
        "title": "Ankylosing Spondylitis",
        "description": "Arthritis affecting the spine and sacroiliac joints leading to chronic back pain."
      },
      {
        "title": "Systemic Autoimmune Diseases",
        "description": "Immune system attacks healthy tissues causing multi-organ inflammation."
      },
      {
        "title": "Immunodeficiency Disorders",
        "description": "Conditions where the immune system is weakened or incomplete."
      }
    ],
    "procedures": [
      {
        "title": "Immunotherapy",
        "description": "Targeted treatments to regulate or suppress immune system activity."
      },
      {
        "title": "Biologic Therapies",
        "description": "Advanced injectable medications for autoimmune conditions."
      },
      {
        "title": "Joint Injections",
        "description": "Steroid and biologic injections to reduce joint inflammation."
      },
      {
        "title": "Disease-Modifying Antirheumatic Drug (DMARD) Therapy",
        "description": "Treatment to slow progression of rheumatic diseases."
      }
    ],
    "faqs": [
      {
        "question": "What conditions does Dr. Gupta specialize in?",
        "answer": "He specializes in rheumatoid arthritis, ankylosing spondylitis, autoimmune diseases, and clinical immunology."
      },
      {
        "question": "Where did Dr. Gupta receive higher training?",
        "answer": "He completed his higher training in the United Kingdom."
      },
      {
        "question": "Is immunotherapy available?",
        "answer": "Yes, Dr. Gupta offers advanced immunotherapy and biologic treatments."
      }
    ]
  },
  {
    "slug": "dr-rakesh-kumar-khazanchi",
    "name": "Dr. Rakesh Kumar Khazanchi",
    "specialty": "Plastic, Aesthetic and Reconstructive Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "50+ years",
    "image": "assets/uploads/dr-rakesh-kumar-khazanchi.png",
    "isTopDoctor": true,
    "position": "Chairman - Aesthetic, Plastic & Reconstructive Surgery",
    "degree": "MBBS | MCh - Plastic Surgery | MS - General Surgery | Fellowship - Surgery",
    "about": "Dr. Rakesh Kumar Khazanchi is a leading plastic, aesthetic, and reconstructive surgeon with over 50 years of surgical experience. He specializes in reconstructive microsurgery, vascular malformations, cosmetic surgery, and replantation surgeries. He has overseen 22 research projects and authored over 60 research papers.",
    "medicalProblems": [
      {
        "title": "Cosmetic Concerns",
        "description": "Issues involving appearance enhancement such as facial reshaping, contouring, and aesthetic reconstruction."
      },
      {
        "title": "Reconstructive Defects",
        "description": "Defects arising from trauma, cancer surgery, or congenital abnormalities."
      },
      {
        "title": "Vascular Malformations",
        "description": "Abnormal clusters of blood vessels causing pain, swelling, and cosmetic concerns."
      },
      {
        "title": "Limb or Digit Amputation",
        "description": "Severed body parts requiring complex replantation microsurgery."
      }
    ],
    "procedures": [
      {
        "title": "Cosmetic Surgery",
        "description": "Includes facelifts, rhinoplasty, liposuction, breast surgeries, and body contouring."
      },
      {
        "title": "Reconstructive Microsurgery",
        "description": "Advanced tissue transfer surgeries using microsurgical techniques."
      },
      {
        "title": "Vascular Malformation Correction",
        "description": "Surgical and laser treatments for vascular abnormalities."
      },
      {
        "title": "Replantation Surgery",
        "description": "Microsurgical reattachment of amputated parts."
      }
    ],
    "faqs": [
      {
        "question": "What does Dr. Khazanchi specialize in?",
        "answer": "He specializes in cosmetic surgery, reconstructive microsurgery, vascular malformations, and replantation surgeries."
      },
      {
        "question": "How experienced is Dr. Khazanchi?",
        "answer": "He has over five decades of expertise in plastic and reconstructive surgery."
      },
      {
        "question": "Are cosmetic surgeries safe?",
        "answer": "Yes, when performed by experienced specialists with advanced facilities, cosmetic procedures are safe."
      }
    ]
  },
  {
    "slug": "dr-randeep-guleria",
    "name": "Dr. Randeep Guleria",
    "specialty": "Internal Medicine, Pulmonology & Sleep Medicine",
    "hospital": "Medanta - The Medicity",
    "experience": "42+ years",
    "image": "assets/uploads/dr-randeep-guleria.png",
    "isTopDoctor": true,
    "position": "Chairman - Institute of Internal Medicine & Respiratory & Sleep Medicine",
    "degree": "MBBS | DM - Pulmonary Medicine | MD - General Medicine",
    "about": "Dr. Randeep Guleria, former Director of AIIMS New Delhi, is an internationally renowned pulmonologist and internal medicine expert. He is the first DM in Pulmonary Medicine, Sleep Medicine, and Critical Care in India. He is a Padma Shri awardee and Dr. B.C. Roy Award recipient, contributing extensively to national health policy and COVID-19 strategy.",
    "medicalProblems": [
      {
        "title": "Sleep Disorders",
        "description": "Conditions like sleep apnea leading to poor sleep quality and fatigue."
      },
      {
        "title": "Chronic Respiratory Diseases",
        "description": "Includes asthma, COPD, pulmonary fibrosis, and chronic bronchitis."
      },
      {
        "title": "Metabolic Syndrome",
        "description": "Cluster of factors like hypertension, diabetes, and obesity increasing cardiovascular risk."
      },
      {
        "title": "Critical Care Conditions",
        "description": "Severe cases requiring ventilatory support and intensive monitoring."
      }
    ],
    "procedures": [
      {
        "title": "Interventional Pulmonology",
        "description": "Advanced airway procedures such as bronchoscopy and lung biopsies."
      },
      {
        "title": "Sleep Study Evaluation",
        "description": "Diagnosis of sleep apnea and other sleep-related disorders."
      },
      {
        "title": "Ventilator & Critical Care Management",
        "description": "Comprehensive care for patients in ICU and emergency conditions."
      },
      {
        "title": "Pulmonary Function Testing",
        "description": "Tests evaluating lung capacity and efficiency."
      }
    ],
    "faqs": [
      {
        "question": "What awards has Dr. Guleria received?",
        "answer": "He is a Padma Shri awardee, Dr. B.C. Roy Award recipient, and has received multiple national honors."
      },
      {
        "question": "Does he treat sleep apnea?",
        "answer": "Yes, Dr. Guleria specializes in diagnosing and treating various sleep disorders."
      },
      {
        "question": "Is critical care treatment available?",
        "answer": "Yes, advanced ICU and pulmonary critical care services are offered."
      }
    ]
  },
  {
    "slug": "dr-randhir-sud",
    "name": "Dr. Randhir Sud",
    "specialty": "Gastroenterology & GI Endoscopy",
    "hospital": "Medanta - The Medicity",
    "experience": "47+ years",
    "image": "assets/uploads/dr-randhir-sud.png",
    "isTopDoctor": true,
    "position": "Chairman - Gastroenterology",
    "degree": "DM - Gastroenterology | MD - General Medicine | FASGE | Fellowship - Gastroenterology | FRCP | FISG | MBBS | FSGEI | MSGEI",
    "about": "Padma Shri awardee Dr. Randhir Sud is credited with pioneering GI Endoscopy therapy in India. With over four decades of excellence, he has advanced treatments for GI cancers, endoscopic surgeries, and liver diseases. A gold medalist and globally recognized expert, he has trained thousands of specialists worldwide.",
    "medicalProblems": [
      {
        "title": "GI Cancers",
        "description": "Cancers of the stomach, colon, pancreas, and esophagus."
      },
      {
        "title": "Liver & Hepatic Disorders",
        "description": "Conditions like cirrhosis, hepatitis, and fatty liver disease."
      },
      {
        "title": "Digestive Disorders",
        "description": "Acid reflux, ulcers, inflammatory bowel disease, and functional GI issues."
      },
      {
        "title": "Bleeding GI Tract",
        "description": "Internal bleeding requiring endoscopic evaluation."
      }
    ],
    "procedures": [
      {
        "title": "GI Endoscopy",
        "description": "Diagnostic and therapeutic procedures for digestive system diseases."
      },
      {
        "title": "Endoscopic Oncology",
        "description": "Endoscopic removal of tumors and cancer treatment."
      },
      {
        "title": "Colonoscopy",
        "description": "Evaluation for polyps, bleeding, and colon cancers."
      },
      {
        "title": "Advanced Hepatology Procedures",
        "description": "Management of liver diseases using modern techniques."
      }
    ],
    "faqs": [
      {
        "question": "What is Dr. Sud known for?",
        "answer": "He is recognized for pioneering GI Endoscopy therapy in India."
      },
      {
        "question": "Does he treat GI cancers?",
        "answer": "Yes, he specializes in advanced treatment of GI and hepatic cancers."
      },
      {
        "question": "Are endoscopic surgeries available?",
        "answer": "Yes, a complete range of advanced endoscopic procedures is available."
      }
    ]
  },
  {
    "slug": "dr-sabhyata-gupta",
    "name": "Dr. Sabhyata Gupta",
    "specialty": "Gynaecology & Gynae Oncology",
    "hospital": "Medanta - The Medicity",
    "experience": "38+ years",
    "image": "assets/uploads/dr-sabhyata-gupta.png",
    "isTopDoctor": true,
    "position": "Chairperson - Department of Gynecology & Gynae Oncology",
    "degree": "MBBS | MD - Gynaecology",
    "about": "Dr. Sabhyata Gupta is the first gynecologist in India to perform robotic gynecological surgery for both cancerous and benign conditions. A pioneer in gynae oncology, advanced laparoscopy, and robotic surgery, she has trained numerous specialists and contributed extensively to national and international medical literature.",
    "medicalProblems": [
      {
        "title": "Gynae Cancers",
        "description": "Cancers of uterus, cervix, ovaries, fallopian tubes, vagina, and vulva."
      },
      {
        "title": "Endometriosis & Fibroids",
        "description": "Painful gynecological conditions requiring advanced surgical treatment."
      },
      {
        "title": "Ovarian Cysts",
        "description": "Fluid-filled sacs requiring laparoscopy or medical management."
      },
      {
        "title": "Pelvic Floor Disorders",
        "description": "Conditions affecting bladder, uterus, and pelvic muscles."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Gynaecological Surgery",
        "description": "Precision robotic surgery for cancerous and benign conditions."
      },
      {
        "title": "Advanced Laparoscopy",
        "description": "Minimally invasive procedures for complex gynecological diseases."
      },
      {
        "title": "Hysteroscopy",
        "description": "Endoscopic evaluation and treatment of uterine disorders."
      },
      {
        "title": "HIPEC",
        "description": "Heated chemotherapy for advanced gynecologic cancers."
      }
    ],
    "faqs": [
      {
        "question": "What makes Dr. Sabhyata Gupta unique?",
        "answer": "She is the first in India to perform robotic gynecologic surgery and is a leading expert in gynae oncology."
      },
      {
        "question": "Does she perform minimally invasive laparoscopy?",
        "answer": "Yes, she specializes in advanced gynae laparoscopy and robotics."
      },
      {
        "question": "Does she treat cancer patients?",
        "answer": "Yes, she is a specialist in all gynecological cancers."
      }
    ]
  },
  {
    "slug": "dr-ss-baijal",
    "name": "Dr. S. S. Baijal",
    "specialty": "Diagnostic & Interventional Radiology",
    "hospital": "Medanta - The Medicity",
    "experience": "44+ years",
    "image": "assets/uploads/",
    "isTopDoctor": true,
    "position": "Chairman - Diagnostic and Interventional Radiology",
    "degree": "MBBS | MD - Radiology | Fellowship - Gastrointestinal & Interventional Radiology | Fellowship - Vascular Interventional Radiology",
    "about": "Dr. Sanjay Saran Baijal is an accomplished expert in Diagnostic and Interventional Radiology with advanced international training from the University of Texas, USA, and Nagoya University Hospital, Japan. He specializes in minimally invasive procedures and is a leading figure in gastrointestinal and vascular interventional radiology.",
    "medicalProblems": [
      {
        "title": "Gastrointestinal Diseases",
        "description": "Imaging and minimally invasive treatments for GI tract disorders."
      },
      {
        "title": "Vascular Disorders",
        "description": "Blockages, aneurysms, and vascular abnormalities treated through interventional techniques."
      },
      {
        "title": "Liver & Kidney Tumors",
        "description": "Non-surgical tumor treatments via ablation or embolisation."
      },
      {
        "title": "Bleeding Disorders",
        "description": "Management through interventional radiology procedures."
      }
    ],
    "procedures": [
      {
        "title": "Interventional Radiology",
        "description": "Minimally invasive procedures using imaging guidance."
      },
      {
        "title": "Radiofrequency Ablation",
        "description": "Targeted destruction of tumors."
      },
      {
        "title": "Embolisation Procedures",
        "description": "Blocking abnormal blood flow to treat tumors or bleeding."
      },
      {
        "title": "GI Radiology",
        "description": "Advanced diagnostic & interventional procedures for gastrointestinal diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Baijal perform minimally invasive procedures?",
        "answer": "Yes, he specializes in a wide range of minimally invasive interventional radiology procedures."
      },
      {
        "question": "Where did Dr. Baijal receive international training?",
        "answer": "He trained at the University of Texas, USA and Nagoya University Hospital, Japan."
      },
      {
        "question": "Is he an expert in tumor ablation?",
        "answer": "Yes, he performs radiofrequency ablation and embolisation for tumors."
      }
    ]
  },
  {
    "slug": "dr-sudhir-dubey",
    "name": "Dr. Sudhir Dubey",
    "specialty": "Endoportal & Minimally Invasive Neurosurgery",
    "hospital": "Medanta - The Medicity",
    "experience": "30+ years",
    "image": "assets/uploads/dr-sudhir-dubey.png",
    "isTopDoctor": true,
    "position": "Chairman - Endoportal Minimal Invasive Neuro Surgery",
    "degree": "MBBS | MCh - Neurosurgery",
    "about": "Dr. Sudhir Dubey is an internationally awarded neurosurgeon with over 10,000 neurosurgical procedures to his name. A pioneer in endoscopic and minimally invasive brain, skull base, and spine surgery, he is the only Indian to receive the prestigious Young Neurosurgeon's Award by the World Federation of Neurosurgical Societies.",
    "medicalProblems": [
      {
        "title": "Brain Tumors",
        "description": "Pituitary tumors, skull base tumors, and complex brain lesions."
      },
      {
        "title": "Spine Disorders",
        "description": "Spinal disc issues, nerve compression, and spine instability."
      },
      {
        "title": "Pituitary Disorders",
        "description": "Tumors and hormonal dysfunction requiring minimally invasive surgery."
      },
      {
        "title": "Cranial Injuries",
        "description": "Traumatic injuries requiring intervention and reconstruction."
      }
    ],
    "procedures": [
      {
        "title": "Endoportal Brain Surgery",
        "description": "Minimally invasive brain surgery through endoscopic access."
      },
      {
        "title": "Endoscopic Endonasal Skull Base Surgery",
        "description": "Scarless surgery through the nasal passage for skull base tumors."
      },
      {
        "title": "Minimally Invasive Spine Surgery",
        "description": "Small-incision procedures for spine disorders."
      },
      {
        "title": "Percutaneous Spine Procedures",
        "description": "Needle-based spine treatments for pain and nerve compression."
      }
    ],
    "faqs": [
      {
        "question": "How many surgeries has Dr. Dubey performed?",
        "answer": "He has performed over 10,000 neurosurgical operations."
      },
      {
        "question": "Is he internationally recognized?",
        "answer": "Yes, he received the Young Neurosurgeon's Award by WFNS."
      },
      {
        "question": "Does he specialize in minimally invasive neurosurgery?",
        "answer": "Yes, he is a pioneer in endoscopic and minimally invasive brain and spine surgery."
      }
    ]
  },
  {
    "slug": "dr-vijay-vohra",
    "name": "Dr. Vijay Vohra",
    "specialty": "Critical Care & Transplant Anaesthesia",
    "hospital": "Medanta - The Medicity",
    "experience": "53+ years",
    "image": "assets/uploads/dr-vijay-vohra.png",
    "isTopDoctor": true,
    "position": "Chairman - Critical Care",
    "degree": "MBBS | MD | FRCA | Clinical Fellowship in Liver Transplant",
    "about": "Dr. Vijay Vohra is one of India's most experienced anesthesiologists with over 53 years in liver transplant anaesthesia and critical care. He has led anaesthesia teams in India\u2019s first liver transplant milestones and has trained intensivists and anaesthetists across 26 centres worldwide.",
    "medicalProblems": [
      {
        "title": "Liver Failure",
        "description": "Critical support for liver transplant patients."
      },
      {
        "title": "Severe Organ Dysfunction",
        "description": "Ventilator and ICU management for multi-organ failure."
      },
      {
        "title": "Post-Transplant Care",
        "description": "Monitoring and stabilizing transplant recipients."
      },
      {
        "title": "Critical Illnesses",
        "description": "Life-threatening conditions requiring ICU-level intervention."
      }
    ],
    "procedures": [
      {
        "title": "Transplant Anaesthesia",
        "description": "Anaesthesia management for liver transplant surgeries."
      },
      {
        "title": "Critical Care Management",
        "description": "Advanced ICU care and multi-organ support."
      },
      {
        "title": "Hemodynamic Monitoring",
        "description": "Advanced monitoring including bloodless transplant protocols."
      },
      {
        "title": "Coagulation Management",
        "description": "Special protocols for transplant patients."
      }
    ],
    "faqs": [
      {
        "question": "How experienced is Dr. Vohra in liver transplant anaesthesia?",
        "answer": "He has managed over 1500 liver transplants."
      },
      {
        "question": "Has Dr. Vohra contributed to medical research?",
        "answer": "Yes, he has been a reviewer for several major anaesthesia and hepatology journals."
      },
      {
        "question": "Does he train other doctors?",
        "answer": "Yes, he has trained anaesthetists and intensivists from over 26 centers."
      }
    ]
  },
  {
    "slug": "dr-aditya-aggarwal",
    "name": "Dr. Aditya Aggarwal",
    "specialty": "Aesthetic, Plastic & Reconstructive Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "34+ years",
    "image": "assets/uploads/dr-aditya-aggarwal.png",
    "isTopDoctor": true,
    "position": "Vice Chairman - Aesthetic, Plastic & Reconstructive Surgery",
    "degree": "MBBS | MS - General Surgery | DrNB - Plastic Surgery | MCh - Plastic Surgery",
    "about": "Dr. Aditya Aggarwal is a globally recognized plastic surgeon specializing in cosmetic surgery, reconstructive microsurgery, breast reconstruction, and facial reanimation. With international fellowships across Taiwan, Japan, UK, and Germany, he has led innovations in complex reconstructive techniques. He has served as President of IAAPS (2023\u20132024) and is a visiting professor at global conferences.",
    "medicalProblems": [
      {
        "title": "Cosmetic Concerns",
        "description": "Facial enhancement, body contouring, and aesthetic corrections."
      },
      {
        "title": "Breast Deformities",
        "description": "Reconstruction after mastectomy, asymmetry correction."
      },
      {
        "title": "Facial Nerve Palsy",
        "description": "Loss of facial muscle control requiring reanimation."
      },
      {
        "title": "Trauma & Burn Deformities",
        "description": "Reconstructive surgery for injuries and burns."
      }
    ],
    "procedures": [
      {
        "title": "Cosmetic Surgery",
        "description": "Rhinoplasty, liposuction, breast augmentation, facelifts, and body contouring."
      },
      {
        "title": "Reconstructive Microsurgery",
        "description": "Complex reconstructions using microvascular techniques."
      },
      {
        "title": "Breast Reconstruction",
        "description": "Post-mastectomy reconstruction and aesthetic corrections."
      },
      {
        "title": "Facial Reanimation Surgery",
        "description": "Restoration of facial movements in nerve palsy."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Aggarwal specialize in cosmetic surgery?",
        "answer": "Yes, he is an expert in rhinoplasty, body contouring, breast surgery, and facial aesthetics."
      },
      {
        "question": "Does he perform reconstructive microsurgery?",
        "answer": "Yes, he is internationally recognized for complex microsurgical reconstructions."
      },
      {
        "question": "Has he received awards?",
        "answer": "Yes, multiple awards including APSICON Visiting Professorship and Gold Medal in MCh."
      }
    ]
  },
  {
    "slug": "dr-attique-vasdev",
    "name": "Dr. Attique Vasdev",
    "specialty": "Orthopaedics",
    "hospital": "Medanta - The Medicity",
    "experience": "33+ years",
    "image": "assets/uploads/dr-attique-vasdev.png",
    "isTopDoctor": true,
    "position": "Vice Chairman - Orthopaedics (Knee Unit)",
    "degree": "MBBS | MS - Orthopaedics | Fellowship - Arthroplasty Trauma | Fellowship - Trauma System Development",
    "about": "Dr. Attique Vasdev is a senior orthopaedic surgeon with expertise in knee replacement, ligament reconstruction, and sports injury management. Trained in India, Germany, and Israel, he has been with Medanta since its inception and has contributed significantly to joint replacement research with multiple national and international publications.",
    "medicalProblems": [
      {
        "title": "Knee Arthritis",
        "description": "Degenerative joint disease requiring surgical or non-surgical management."
      },
      {
        "title": "Sports Injuries",
        "description": "ACL tears, meniscus injuries, and ligament sprains."
      },
      {
        "title": "Ligament Tears",
        "description": "Injuries requiring arthroscopic reconstruction."
      },
      {
        "title": "Joint Degeneration",
        "description": "Wear and tear of joints due to age or trauma."
      }
    ],
    "procedures": [
      {
        "title": "Knee Replacement Surgery",
        "description": "Partial and total knee replacement procedures."
      },
      {
        "title": "Sports Injury Management",
        "description": "Treating ligament tears and joint injuries in athletes."
      },
      {
        "title": "Ligament Reconstruction",
        "description": "Arthroscopic reconstruction of knee ligaments."
      },
      {
        "title": "Trauma Surgery",
        "description": "Advanced treatment for bone and joint trauma."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vasdev specialize in knee replacement?",
        "answer": "Yes, he has extensive experience in all types of knee replacement surgeries."
      },
      {
        "question": "Does he treat sports injuries?",
        "answer": "Yes, he specializes in sports injuries and ligament reconstructions."
      },
      {
        "question": "Where did he receive fellowship training?",
        "answer": "He trained in Israel and Germany in trauma systems and joint replacement."
      }
    ]
  },
  {
    "slug": "dr-sushila-kataria",
    "name": "Dr. Sushila Kataria",
    "specialty": "Internal Medicine",
    "hospital": "Medanta - The Medicity",
    "experience": "28+ years",
    "image": "assets/uploads/dr-sushila-kataria.png",
    "isTopDoctor": true,
    "position": "Vice Chairman - Internal Medicine",
    "degree": "MBBS | MD - Medicine | Postgraduate Diploma - Medico Legal Systems",
    "about": "Dr. Sushila Kataria is a senior Internal Medicine specialist with over 25 years of experience and currently serves as Vice Chairman at Medanta. She has been actively involved in dengue prevention, hand hygiene awareness, and anemia treatment programs. During COVID-19, she played a critical role in managing severe cases including the initial Italian patients, contributing significantly to state and national task forces. Her research has been published in NEJM and cited by WHO. She also mentors numerous national and international medical students.",
    "medicalProblems": [
      {
        "title": "COVID & Post-COVID Complications",
        "description": "Management of acute and long-term complications."
      },
      {
        "title": "Metabolic Disorders",
        "description": "Diabetes, obesity, cholesterol issues."
      },
      {
        "title": "Lifestyle Diseases",
        "description": "Hypertension, cardiac risk factors, preventive care."
      },
      {
        "title": "Infectious Diseases",
        "description": "Dengue, viral fevers, malaria, TB."
      },
      {
        "title": "HIV",
        "description": "Comprehensive HIV management and counselling."
      },
      {
        "title": "Fever of Unknown Origin",
        "description": "Detailed evaluation of unexplained fevers."
      },
      {
        "title": "Multisystem Diseases",
        "description": "Complex diseases involving multiple organs."
      }
    ],
    "procedures": [
      {
        "title": "Adult Vaccination",
        "description": "Vaccinations for adults and high-risk patients."
      },
      {
        "title": "Infection Management",
        "description": "Management of viral, bacterial, and parasitic infections."
      },
      {
        "title": "Chronic Disease Management",
        "description": "Long-term care for diabetes, BP, metabolic diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kataria treat COVID and post-COVID cases?",
        "answer": "Yes, she is one of the leading specialists managing COVID and long-COVID complications."
      },
      {
        "question": "Does she manage lifestyle diseases?",
        "answer": "Yes, she specializes in diabetes, hypertension, and metabolic disorders."
      },
      {
        "question": "Has her research been internationally recognized?",
        "answer": "Yes, her work has been published in NEJM and cited by WHO."
      }
    ]
  },
  {
    "slug": "dr-nitin-sood",
    "name": "Dr. Nitin Sood",
    "specialty": "Hemato Oncology & Bone Marrow Transplant",
    "hospital": "Medanta - The Medicity",
    "experience": "28+ years",
    "image": "assets/uploads/dr-nitin-sood.png",
    "isTopDoctor": true,
    "position": "Vice Chairman \u2013 Hemato Oncology & Bone Marrow Transplant",
    "degree": "MBBS | MD - General Medicine | DNB - Medicine | CCT - Clinical Hematology | MRCP - Medicine | FRC - Pathology | MRCPath - Hematology",
    "about": "Dr. Nitin Sood is a senior hematologist with expertise in blood cancers, bone marrow transplant, bleeding disorders, thalassemia, sickle cell disease, and clotting disorders. After completing his medical training in India, he moved to the UK for advanced training in Clinical Hematology. He has been associated with leading medical organizations and has received multiple awards for his contributions in hematology and oncology.",
    "medicalProblems": [
      {
        "title": "Leukemia",
        "description": "Blood cancers requiring advanced treatment."
      },
      {
        "title": "Lymphoma & Myeloma",
        "description": "Diagnosis and treatment of lymphatic and plasma cell cancers."
      },
      {
        "title": "Myelodysplastic Syndromes",
        "description": "Bone marrow-related disorders."
      },
      {
        "title": "Bleeding & Clotting Disorders",
        "description": "Hemophilia, thrombosis, platelet disorders."
      },
      {
        "title": "Thalassemia & Sickle Cell Disease",
        "description": "Comprehensive care for genetic blood disorders."
      },
      {
        "title": "Aplastic Anemia",
        "description": "Bone marrow failure management."
      }
    ],
    "procedures": [
      {
        "title": "Bone Marrow Transplant",
        "description": "BMT for blood cancers and bone marrow disorders."
      },
      {
        "title": "Stem Cell Transplantation",
        "description": "Autologous and allogeneic transplant procedures."
      },
      {
        "title": "Advanced Hematology Diagnostics",
        "description": "Evaluation of blood and marrow diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sood perform bone marrow transplants?",
        "answer": "Yes, he is a leading specialist in BMT and stem cell transplantation."
      },
      {
        "question": "Does he treat blood cancers?",
        "answer": "Yes, leukemia, lymphoma, myeloma, and related conditions."
      },
      {
        "question": "Where did he receive international training?",
        "answer": "He trained extensively in the UK in Clinical Hematology."
      }
    ]
  },
  {
    "slug": "dr-anand-jaiswal",
    "name": "Dr. Anand Jaiswal",
    "specialty": "Respiratory & Sleep Medicine",
    "hospital": "Medanta - The Medicity",
    "experience": "42+ years",
    "image": "assets/uploads/dr-anand-jaiswal.png",
    "isTopDoctor": true,
    "position": "Senior Director - Respiratory & Sleep Medicine",
    "degree": "MBBS | MD - Tuberculosis and Respiratory Diseases",
    "about": "Dr. Anand Jaiswal is a senior pulmonologist with over 42 years of experience in TB, asthma, COPD, and respiratory diseases. A WHO fellow in TB research, he has contributed to major national and international clinical trials and has served as chairperson and faculty at global conferences. He completed his MD from V.P. Chest Institute with a gold medal and has been part of leading research initiatives in respiratory medicine.",
    "medicalProblems": [
      {
        "title": "COPD",
        "description": "Chronic lung disease affecting breathing."
      },
      {
        "title": "Asthma",
        "description": "Allergy and breathing-related respiratory issues."
      },
      {
        "title": "Pulmonary Tuberculosis",
        "description": "Diagnosis and treatment of TB."
      },
      {
        "title": "Sleep Disorders",
        "description": "Issues like sleep apnea and disturbed breathing during sleep."
      }
    ],
    "procedures": [
      {
        "title": "Bronchoscopy",
        "description": "Endoscopic examination of airways."
      },
      {
        "title": "TB Management",
        "description": "Advanced TB diagnosis and treatment."
      },
      {
        "title": "Pulmonary Function Testing",
        "description": "Lung tests for asthma, COPD, and airflow issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Jaiswal specialize in TB?",
        "answer": "Yes, he is a WHO-trained expert in TB research and treatment."
      },
      {
        "question": "Is he experienced in asthma and COPD?",
        "answer": "Yes, he has decades of experience managing chronic lung diseases."
      },
      {
        "question": "Does he perform bronchoscopy?",
        "answer": "Yes, he performs diagnostic and therapeutic bronchoscopy."
      }
    ]
  },
  {
    "slug": "dr-kanchan-kaur",
    "name": "Dr. Kanchan Kaur",
    "specialty": "Breast Services",
    "hospital": "Medanta - The Medicity",
    "experience": "25+ years",
    "image": "assets/uploads/dr-kanchan-kaur.png",
    "isTopDoctor": true,
    "position": "Senior Director - Breast Services",
    "degree": "MBBS | MS - General Surgery | MRCS - Edinburgh",
    "about": "Dr. Kanchan Kaur is a renowned oncoplastic breast surgeon with extensive experience in breast cancer management and breast reconstruction. With over 3000 sentinel node biopsies, she is trained at internationally acclaimed breast centers. She actively works in breast cancer awareness, early detection programs, and community health initiatives. She brought the innovative \u2018discovering hands\u2019 program to India and leads the Pink Prana breast cancer support group.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Diagnosis and treatment of breast malignancies."
      },
      {
        "title": "Benign Breast Diseases",
        "description": "Lumps, infections, fibroadenomas, etc."
      },
      {
        "title": "Breast Pain & Hormonal Issues",
        "description": "Evaluation of non-cancerous breast concerns."
      }
    ],
    "procedures": [
      {
        "title": "Breast Cancer Surgeries",
        "description": "Lumpectomy, mastectomy, reconstruction."
      },
      {
        "title": "Sentinel Node Biopsies",
        "description": "Over 3000 procedures performed."
      },
      {
        "title": "Oncoplastic Breast Surgery",
        "description": "Combining cancer surgery with cosmetic reconstruction."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kaur perform breast cancer surgeries?",
        "answer": "Yes, she specializes in all breast cancer and reconstructive surgeries."
      },
      {
        "question": "What is her expertise in sentinel node biopsies?",
        "answer": "She has performed more than 3000 sentinel node biopsies."
      },
      {
        "question": "Is she active in breast cancer awareness?",
        "answer": "Yes, she leads multiple community awareness and early detection programs."
      }
    ]
  },
  {
    "slug": "dr-bharat-gopal",
    "name": "Dr. Bharat Gopal",
    "specialty": "Interventional Pulmonology",
    "hospital": "Medanta - The Medicity",
    "experience": "30+ years",
    "image": "assets/uploads/dr-bharat-gopal.png",
    "isTopDoctor": true,
    "position": "Senior Director \u2013 Interventional Pulmonology",
    "degree": "MBBS | MD - Tuberculosis & Respiratory Diseases | DNB - Respiratory Diseases | MRCP - Respiratory | Multiple Fellowships in Respiratory & Cardiopulmonary Medicine",
    "about": "Dr. Bharat Gopal is a pioneer in interventional pulmonology in India, especially in EBUS and cryobiopsy techniques. With over 25 years of experience, he has trained internationally at leading centers and has contributed to national guidelines on COPD, asthma, pneumonia, and bronchoscopy. He founded the Pulmo-Pathshala training platform and has over 30 scientific publications. He is recognized with major honors including Young Scientist Award and IMA\u2019s Vashisht Chikitsak Award.",
    "medicalProblems": [
      {
        "title": "Interstitial Lung Disease (ILD)",
        "description": "Chronic lung inflammation and scarring."
      },
      {
        "title": "Severe Asthma",
        "description": "Advanced asthma requiring specialized care."
      },
      {
        "title": "COPD",
        "description": "Chronic obstructive lung disease management."
      },
      {
        "title": "Respiratory Failure",
        "description": "Acute and chronic breathing disorders."
      }
    ],
    "procedures": [
      {
        "title": "Endobronchial Ultrasound (EBUS)",
        "description": "Advanced lung imaging for diagnosis."
      },
      {
        "title": "Cryolung Biopsy",
        "description": "Minimally invasive lung tissue sampling."
      },
      {
        "title": "Medical Thoracoscopy",
        "description": "Evaluation and treatment of pleural diseases."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Gopal pioneer in EBUS in India?",
        "answer": "Yes, he is among the first to introduce EBUS-guided procedures in India."
      },
      {
        "question": "Does he treat ILD and COPD?",
        "answer": "Yes, he specializes in advanced lung diseases including ILD, asthma, and COPD."
      },
      {
        "question": "Does he perform cryobiopsies?",
        "answer": "Yes, he is a national leader in cryobiopsy techniques."
      }
    ]
  },
  {
    "slug": "dr-neelam-mohan",
    "name": "Dr. Neelam Mohan",
    "specialty": "Paediatric Gastroenterology & Hepatology",
    "hospital": "Medanta - The Medicity",
    "experience": "36+ years",
    "image": "assets/uploads/dr-neelam-mohan.png",
    "isTopDoctor": true,
    "position": "Senior Director - Paediatric Gastroenterology & Hepatology",
    "degree": "MBBS | DNB - Paediatrics | FACG | FIAP | FIMSA | FPGH | FRCPCH",
    "about": "Dr. Neelam Mohan is a globally acclaimed pediatric gastroenterologist and hepatologist with over 36 years of experience. She pioneered pediatric liver transplantation in India and introduced therapeutic endoscopy for newborns and young children for the first time in the country. With over 250 publications and 900+ presentations, she is a leading authority in pediatric hepatology and nutrition. She is also the recipient of India\u2019s prestigious B.C. Roy National Award and serves as advisor to the National Health Authority and ICMR.",
    "medicalProblems": [
      {
        "title": "Pediatric Liver Diseases",
        "description": "Management of hepatitis, cirrhosis, biliary atresia, and metabolic liver disorders."
      },
      {
        "title": "Pediatric Gastrointestinal Disorders",
        "description": "IBD, pancreatitis, chronic abdominal pain, celiac disease."
      },
      {
        "title": "Nutrition Disorders",
        "description": "Growth issues, malnutrition, adolescent nutrition concerns."
      },
      {
        "title": "Acute & Chronic Pancreatitis",
        "description": "Evaluation and treatment of pancreatic disorders in children."
      }
    ],
    "procedures": [
      {
        "title": "Therapeutic Pediatric Endoscopy",
        "description": "Endoscopic treatments in newborns, infants, and young children."
      },
      {
        "title": "Pediatric Liver Transplantation",
        "description": "Full-spectrum pediatric liver transplant procedures."
      },
      {
        "title": "Advanced GI Interventions",
        "description": "Endoscopic and minimally invasive GI procedures."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Neelam Mohan a pioneer in pediatric liver transplant?",
        "answer": "Yes, she is one of the first in India to start pediatric liver transplantation programs."
      },
      {
        "question": "Does she treat nutrition-related issues in children?",
        "answer": "Yes, she specializes in pediatric and adolescent nutrition."
      },
      {
        "question": "Has she received national awards?",
        "answer": "Yes, including the B.C. Roy National Award, India\u2019s highest medical honor."
      }
    ]
  },
  {
    "slug": "dr-raman-kant-aggarwal",
    "name": "Dr. Raman Kant Aggarwal",
    "specialty": "Orthopaedics",
    "hospital": "Medanta - The Medicity",
    "experience": "37+ years",
    "image": "assets/uploads/dr-raman-kant-aggarwal.png",
    "isTopDoctor": true,
    "position": "Vice Chairman - Orthopaedics",
    "degree": "MBBS | MS - Orthopaedics | Fellowship - Shoulder & Elbow Surgery | MSc - Trauma & Orthopaedics",
    "about": "Dr. Raman Kant Aggarwal is one of North India's leading shoulder and elbow surgeons with over 37 years of experience. He specializes in reverse and anatomical shoulder replacements, total elbow replacement, and advanced arthroscopic surgeries. He has treated numerous professional athletes and senior citizens, helping them regain pain-free mobility. His expertise covers complex trauma, joint reconstruction, and revision surgeries.",
    "medicalProblems": [
      {
        "title": "Shoulder Injuries",
        "description": "Rotator cuff tears, frozen shoulder, dislocations."
      },
      {
        "title": "Elbow Disorders",
        "description": "Arthritis, instability, tendon injuries, trauma."
      },
      {
        "title": "Sports Injuries",
        "description": "Injuries in athletes including ligament, tendon, and joint damage."
      },
      {
        "title": "Upper Limb Trauma",
        "description": "Fractures, complex injuries, and post-injury deformities."
      }
    ],
    "procedures": [
      {
        "title": "Reverse Shoulder Replacement",
        "description": "Advanced procedure for irreparable rotator cuff damage."
      },
      {
        "title": "Arthroscopic Shoulder Surgery",
        "description": "Keyhole surgery for ligament tears, SLAP lesions, Bankart repairs."
      },
      {
        "title": "Total Elbow Replacement",
        "description": "Replacement of damaged elbow joints including revisions."
      },
      {
        "title": "Joint Reconstruction Surgery",
        "description": "Restoration of joint function after injury or degeneration."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Aggarwal treat athletes?",
        "answer": "Yes, he has treated numerous professional sports players from cricket, badminton, boxing, golf, etc."
      },
      {
        "question": "Does he perform shoulder replacements?",
        "answer": "Yes, he is a leading surgeon in reverse and anatomical shoulder replacements."
      },
      {
        "question": "What are his key specialties?",
        "answer": "Shoulder/elbow surgeries, sports injuries, arthroscopy, and joint reconstructions."
      }
    ]
  },
  {
    "slug": "dr-tarun-grover",
    "name": "Dr. Tarun Grover",
    "specialty": "Peripheral Vascular & Endovascular Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "30+ years",
    "image": "assets/uploads/dr-tarun-grover.png",
    "isTopDoctor": true,
    "position": "Senior Director - Peripheral Vascular & Endovascular Surgery",
    "degree": "MBBS | MNAMS - Surgery | DNB - General Surgery | FNB - Peripheral Vascular Surgery",
    "about": "Dr. Tarun Grover is a distinguished vascular and endovascular surgeon with over 25 years of experience. He is the first National Board accredited fellow in Vascular & Endovascular Surgery in India. Trained globally, he is a leading expert in arterial bypass, aneurysm repair, DVT management, and complex vascular interventions. He is also the Indian Councillor of the Asian Vascular Society and a Fellow of the American College of Surgeons.",
    "medicalProblems": [
      {
        "title": "Deep Vein Thrombosis (DVT)",
        "description": "Blood clots in deep veins causing pain and swelling."
      },
      {
        "title": "Peripheral Artery Disease",
        "description": "Blocked arteries reducing blood flow to limbs."
      },
      {
        "title": "Varicose Veins",
        "description": "Swollen, twisted veins causing pain and discomfort."
      },
      {
        "title": "Aortic Aneurysm",
        "description": "Bulging of major arteries like the aorta."
      },
      {
        "title": "Vascular Malformations",
        "description": "Abnormal development of blood vessels."
      }
    ],
    "procedures": [
      {
        "title": "Endovascular Interventions",
        "description": "Minimally invasive treatments for vascular diseases."
      },
      {
        "title": "Carotid Stenting",
        "description": "Stenting the carotid artery to prevent stroke."
      },
      {
        "title": "Angioplasty & Venoplasty",
        "description": "Opening narrowed arteries or veins."
      },
      {
        "title": "Uterine Artery Embolization",
        "description": "Minimally invasive treatment for fibroids."
      },
      {
        "title": "AV Fistula & Permacath Placement",
        "description": "Access creation for dialysis patients."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Grover treat varicose veins?",
        "answer": "Yes, he is a leading expert in minimally invasive solutions for varicose veins."
      },
      {
        "question": "Does he perform aneurysm repairs?",
        "answer": "Yes, he specializes in endovascular aneurysm repair."
      },
      {
        "question": "Is he internationally trained?",
        "answer": "Yes, he trained in the UK and Germany among other global centers."
      }
    ]
  },
  {
    "slug": "dr-aru-chhabra-handa",
    "name": "Dr. Aru Chhabra Handa",
    "specialty": "ENT & Head and Neck Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "37+ years",
    "image": "assets/uploads/dr-aru-chhabra-handa.png",
    "isTopDoctor": true,
    "position": "Director - ENT & Head and Neck Surgery",
    "degree": "MBBS | MS - ENT | DNB - ENT",
    "about": "Dr. Aru Chhabra Handa is a senior ENT surgeon with over 34 years of clinical experience. Trained at PGIMER Chandigarh and former Assistant Professor at AIIMS Delhi, she is proficient in all major ENT and skull base surgeries. She specializes in sinusitis (including fungal), endoscopic nasal and sinus surgeries, rhinoplasty, microscopic ear surgery, neuro-otology, sialendoscopy, and head and neck glandular surgeries. She has over 40 publications and is a frequent invited faculty at national and international conferences.",
    "medicalProblems": [
      {
        "title": "Sinusitis & Nasal Diseases",
        "description": "Acute, chronic, and fungal sinus issues."
      },
      {
        "title": "Ear Disorders",
        "description": "Hearing loss, tympanic membrane issues, otosclerosis."
      },
      {
        "title": "Pediatric ENT Disorders",
        "description": "Adenoid, tonsil issues, airway problems."
      },
      {
        "title": "Allergic Rhinitis",
        "description": "Chronic nasal allergies causing congestion and irritation."
      }
    ],
    "procedures": [
      {
        "title": "Endoscopic Nose & Sinus Surgeries",
        "description": "Advanced minimally invasive sinus and skull base procedures."
      },
      {
        "title": "Functional & Cosmetic Rhinoplasty",
        "description": "Correction of nasal structure and aesthetic refinement."
      },
      {
        "title": "Microscopic Ear Surgery",
        "description": "Including hearing reconstruction and stapes surgery."
      },
      {
        "title": "Sialendoscopy",
        "description": "Minimally invasive salivary gland duct procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Handa perform rhinoplasty?",
        "answer": "Yes, she specializes in both functional and cosmetic rhinoplasty."
      },
      {
        "question": "Does she treat sinusitis?",
        "answer": "Yes, including fungal sinusitis and complex sinus disorders."
      },
      {
        "question": "Does she treat children?",
        "answer": "Yes, she has extensive experience in pediatric ENT."
      }
    ]
  },
  {
    "slug": "dr-anirban-deep-banerjee",
    "name": "Dr. Anirban Deep Banerjee",
    "specialty": "Neurosurgery",
    "hospital": "Medanta - The Medicity",
    "experience": "28+ years",
    "image": "assets/uploads/dr-anirban-deep-banerjee.png",
    "isTopDoctor": true,
    "position": "Director - Neurosurgery",
    "degree": "MBBS | MCh - Neurosurgery | Multiple Fellowships in Functional & Skull-base Neurosurgery",
    "about": "Dr. Anirban Deep Banerjee is an eminent neurosurgeon with expertise in stereotactic and functional neurosurgery, skull-base neurosurgery, and neuromodulation. Trained in the USA at Cleveland Clinic and LSU, he has pioneered movement disorder surgery programs including Deep Brain Stimulation (DBS). He established Eastern India\u2019s first Movement Disorder Clinic and has performed over 200 DBS surgeries and 400+ neuromodulation procedures. He is frequently invited internationally for lectures, workshops, and neuromodulation program setups.",
    "medicalProblems": [
      {
        "title": "Parkinson\u2019s Disease",
        "description": "Advanced management including DBS."
      },
      {
        "title": "Essential Tremor & Dystonia",
        "description": "Movement disorders treated through neuromodulation."
      },
      {
        "title": "Spasticity Disorders",
        "description": "Cerebral palsy, MS, post-injury or post-stroke spasticity."
      },
      {
        "title": "Epilepsy & Psychiatric Disorders",
        "description": "Surgical management of epilepsy and conditions like OCD."
      }
    ],
    "procedures": [
      {
        "title": "Deep Brain Stimulation (DBS)",
        "description": "Over 200 DBS implantations for movement disorders."
      },
      {
        "title": "Functional Neurosurgery",
        "description": "Stereotactic procedures for tremors, dystonia, and epilepsy."
      },
      {
        "title": "Skull-base Neurosurgery",
        "description": "Advanced micro-neurosurgical and endoscopic procedures."
      },
      {
        "title": "Neuromodulation Surgery",
        "description": "Brain and spinal cord stimulation for neurological conditions."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Banerjee specialize in DBS?",
        "answer": "Yes, he has performed over 200 DBS surgeries and is a leader in functional neurosurgery."
      },
      {
        "question": "Does he treat Parkinson\u2019s disease?",
        "answer": "Yes, he is an expert in surgical and neuromodulation treatments for Parkinson\u2019s."
      },
      {
        "question": "Is he internationally trained?",
        "answer": "Yes, he completed advanced fellowships in the USA at Cleveland Clinic and LSU."
      }
    ]
  },
  {
    "slug": "dr-jasjeet-singh-wasir",
    "name": "Dr. Jasjeet Singh Wasir",
    "specialty": "Endocrinology & Diabetes",
    "hospital": "Medanta - The Medicity",
    "experience": "30+ years",
    "image": "assets/uploads/dr-jasjeet-singh-wasir.png",
    "isTopDoctor": true,
    "position": "Director - Endocrinology & Diabetes",
    "degree": "MBBS | MD - Medicine",
    "about": "Dr. Jasjeet Singh Wasir is Director of the Division of Endocrinology & Diabetes at Medanta. Trained at AIIMS, MAMC, and UCMS, he is a key faculty member at the Center for Advanced Diabetes Therapy & Technology. With nearly a decade of experience in diabetes and metabolic disorders, he leads Medanta\u2019s Weight Management Program under the guidance of Dr. Ambrish Mithal. His expertise spans obesity, metabolic disorders, diabetes control, and thyroid-related diseases. He has published widely and presented research at major national and international forums.",
    "medicalProblems": [
      {
        "title": "Diabetes",
        "description": "Comprehensive management of Type 1, Type 2, and advanced diabetes."
      },
      {
        "title": "Obesity",
        "description": "Medical management of weight gain and metabolic complications."
      },
      {
        "title": "Thyroid Disorders",
        "description": "Evaluation and treatment of hypothyroidism, hyperthyroidism, and nodules."
      }
    ],
    "procedures": [
      {
        "title": "Advanced Diabetes Therapy",
        "description": "Newer insulin therapies, CGM-guided treatment, and metabolic control."
      },
      {
        "title": "Obesity Management",
        "description": "Structured medical weight-loss interventions."
      },
      {
        "title": "Thyroid Evaluation",
        "description": "Clinical assessment and treatment of thyroid dysfunction."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Wasir treat obesity?",
        "answer": "Yes, he leads Medanta\u2019s weight management program for metabolic and obesity-related issues."
      },
      {
        "question": "Does he manage complex diabetes?",
        "answer": "Yes, including high-risk and post-transplant diabetes."
      },
      {
        "question": "What other conditions does he treat?",
        "answer": "Diabetes, obesity, thyroid disorders, PCOD, and metabolic diseases."
      }
    ]
  },
  {
    "slug": "dr-preeti-rastogi",
    "name": "Dr. Preeti Rastogi",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Medanta - The Medicity",
    "experience": "32+ years",
    "image": "assets/uploads/dr-preeti-rastogi.png",
    "isTopDoctor": true,
    "position": "Director & HOD - Obstetrics and Gynaecology",
    "degree": "MBBS | DNB - Gynaecology | MRCOG - OB-GYN (UK)",
    "about": "Dr. Preeti Rastogi is Director & HOD, Obstetrics and Gynaecology at Medanta, with more than 25 years of expertise across India and the UK. She is a certified Da Vinci Xi robotic surgeon and specializes in minimally invasive surgery, high-risk pregnancies, and women\u2019s reproductive health. A strong advocate of safe motherhood and normal vaginal delivery, she is highly respected by patients and peers for her competence and ethical practice.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Management of complex pregnancies including hypertension, diabetes, and fetal complications."
      },
      {
        "title": "Menstrual Disorders",
        "description": "Irregular cycles, heavy bleeding, PCOD-related issues."
      },
      {
        "title": "Adolescent Gynaecology",
        "description": "Hormonal, menstrual, and developmental concerns in teenage girls."
      },
      {
        "title": "Postmenopausal Issues",
        "description": "Hormone changes, bleeding, menopausal symptoms."
      }
    ],
    "procedures": [
      {
        "title": "Robotic & Laparoscopic Surgery",
        "description": "Minimally invasive gynaecological procedures."
      },
      {
        "title": "Hysteroscopic Surgery",
        "description": "Uterine evaluations, polyp removal, septum correction."
      },
      {
        "title": "Infertility Management",
        "description": "Evaluation and treatment of conception difficulties."
      },
      {
        "title": "Benign Gynae Surgeries",
        "description": "Fibroids, cysts, and uterine issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Preeti manage high-risk pregnancies?",
        "answer": "Yes, she is an expert in handling high-risk obstetric cases."
      },
      {
        "question": "Is she a robotic surgeon?",
        "answer": "Yes, she is certified in Da Vinci Xi robotic surgery."
      },
      {
        "question": "Does she perform laparoscopic procedures?",
        "answer": "Yes, she specializes in minimally invasive surgery."
      }
    ]
  },
  {
    "slug": "dr-rajiv-uttam",
    "name": "Dr. Rajiv Uttam",
    "specialty": "Paediatric Care",
    "hospital": "Medanta - The Medicity",
    "experience": "40+ years",
    "image": "assets/uploads/dr-rajiv-uttam.png",
    "isTopDoctor": true,
    "position": "Director & HOD - Pediatrics, PICU & Pediatric ER",
    "degree": "MBBS | MRCP - Pediatrics",
    "about": "Dr. Rajiv Uttam is one of India\u2019s senior-most pediatric pulmonologists and intensivists with nearly four decades of experience. He trained and practiced for 12 years in leading UK hospitals. He has played a foundational role in establishing major pediatric intensive care units in Delhi and is a founding member and Vice Chancellor of the Pediatric Critical College (IAP).",
    "medicalProblems": [
      {
        "title": "Paediatric Ventilation Issues",
        "description": "Acute respiratory distress and critical breathing problems."
      },
      {
        "title": "Neonatal & Pediatric Lung Disorders",
        "description": "Asthma, chronic cough, airway issues in infants and children."
      },
      {
        "title": "Infectious Diseases",
        "description": "Severe infections requiring intensive care."
      }
    ],
    "procedures": [
      {
        "title": "Non-Invasive Ventilation",
        "description": "Respiratory support without intubation."
      },
      {
        "title": "Paediatric Ventilation",
        "description": "Advanced respiratory support for children."
      },
      {
        "title": "Paediatric Bronchoscopy",
        "description": "Diagnostic and therapeutic airway procedures for children."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Uttam treat critical pediatric cases?",
        "answer": "Yes, he specializes in pediatric intensive care and emergency medicine."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, he trained and practiced in the UK for 12 years."
      },
      {
        "question": "Does he perform pediatric bronchoscopy?",
        "answer": "Yes, he is an expert in neonatal and pediatric bronchoscopy."
      }
    ]
  },
  {
    "slug": "dr-sameer-kaushal",
    "name": "Dr. Sameer Kaushal",
    "specialty": "Ophthalmology",
    "hospital": "Medanta - The Medicity",
    "experience": "25+ years",
    "image": "assets/uploads/dr-sameer-kaushal.png",
    "isTopDoctor": true,
    "position": "Director - Ophthalmology",
    "degree": "MBBS | MD - Ophthalmology | DNB - Ophthalmology",
    "about": "Dr. Sameer Kaushal is a highly accomplished ophthalmologist with over 15,000 successful surgeries and extensive training from AIIMS, New Delhi. He specializes in cataract, corneal disorders, advanced LASIK, refractive surgery, ocular surface diseases, pediatric ophthalmology, and modern corneal transplantation techniques. His international publications, innovative surgical techniques, and academic contributions make him a leading eye surgeon in India.",
    "medicalProblems": [
      {
        "title": "Cataracts",
        "description": "Clouding of the lens leading to vision impairment."
      },
      {
        "title": "Corneal Disorders",
        "description": "Keratoconus, infections, scarring, and degeneration."
      },
      {
        "title": "Refractive Errors",
        "description": "Myopia, hyperopia, astigmatism requiring vision correction."
      },
      {
        "title": "Ocular Surface Disorders",
        "description": "Dry eyes, inflammation, and tear-film issues."
      }
    ],
    "procedures": [
      {
        "title": "Cataract Surgery (Phacoemulsification)",
        "description": "Advanced stitchless cataract removal."
      },
      {
        "title": "Corneal Transplant",
        "description": "Lamellar and full-thickness corneal surgeries."
      },
      {
        "title": "Vision Correction (LASIK, PRK, FEMTO, PreLEx)",
        "description": "Latest refractive procedures for spectacle-free vision."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kaushal perform LASIK?",
        "answer": "Yes, he specializes in all modern LASIK and refractive techniques."
      },
      {
        "question": "Is he experienced in corneal transplant?",
        "answer": "Yes, he performs advanced corneal transplantation and lamellar surgeries."
      },
      {
        "question": "Does he treat pediatric eye cases?",
        "answer": "Yes, he is an expert in pediatric ophthalmology as well."
      }
    ]
  },
  {
    "slug": "dr-amrita-gogia",
    "name": "Dr. Amrita Gogia",
    "specialty": "Dental Sciences",
    "hospital": "Medanta - The Medicity",
    "experience": "38+ years",
    "image": "assets/uploads/dr-amrita-gogia.png",
    "isTopDoctor": true,
    "position": "Associate Director & Head - Dental Sciences",
    "degree": "BDS | MDS - Dental",
    "about": "Dr. Amrita Gogia is a distinguished dentist with over 38 years of experience. A Diplomate of the American Board of Orofacial Pain, she specializes in pediatric dentistry, preventive dentistry, and dental sleep medicine. Her expertise spans minimally invasive procedures, root canal therapy, cosmetic dentistry, and managing dental anxiety in children and adults. She has led multiple academic programs, workshops, and CMEs, and heads dental departments across Delhi-NCR.",
    "medicalProblems": [
      {
        "title": "Dental Caries",
        "description": "Tooth decay requiring fillings or restorative care."
      },
      {
        "title": "Pulp & Root Infections",
        "description": "Painful infections requiring endodontic treatment."
      },
      {
        "title": "Orofacial Pain Disorders",
        "description": "Chronic jaw, facial, and headache-related pain."
      },
      {
        "title": "Pediatric Dental Issues",
        "description": "Tooth decay, cavity prevention, and behavioral concerns in children."
      }
    ],
    "procedures": [
      {
        "title": "Preventive Dentistry",
        "description": "Sealants, fluoride treatment, early cavity prevention."
      },
      {
        "title": "Endodontics (Root Canal Treatment)",
        "description": "Advanced pain-free root canal therapy."
      },
      {
        "title": "Restorative Dentistry",
        "description": "Fillings, crowns, and cosmetic restorative treatments."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gogia treat children?",
        "answer": "Yes, she specializes in pediatric and preventive dentistry."
      },
      {
        "question": "Does she perform root canals?",
        "answer": "Yes, she is trained in modern endodontic procedures."
      },
      {
        "question": "Does she manage dental anxiety?",
        "answer": "Yes, she is skilled in treating anxious adults and uncooperative children."
      }
    ]
  },
  {
    "slug": "dr-dimple-k-ahluwalia",
    "name": "Dr. Dimple K Ahluwalia",
    "specialty": "Gynaecology & Gynae Oncology",
    "hospital": "Medanta - The Medicity",
    "experience": "25+ years",
    "image": "assets/uploads/dr-dimple-k-ahluwalia.png",
    "isTopDoctor": true,
    "position": "Associate Director - Gynaecology",
    "degree": "MBBS | MS - Gynaecology",
    "about": "Dr. Dimple Ahluwalia is an Associate Director at Medanta and one of India's very few fellowship-trained robotic surgeons in Gynae Oncology and Minimally Invasive Gynaecology. She completed advanced clinical fellowships in robotic surgery and gynae oncology at National University Hospital Singapore and advanced robotic training at the University of Miami, USA. With over 1,000 minimally invasive surgeries, she specializes in robotic hysterectomy, myomectomy, endometriosis surgery, and cancer surgeries. Her work is driven by evidence-based care and strong research involvement, with multiple international publications.",
    "medicalProblems": [
      {
        "title": "Gynaecological Cancers",
        "description": "Cancers of uterus, ovaries, cervix, and other reproductive organs."
      },
      {
        "title": "Endometriosis",
        "description": "Deep infiltrating endometriosis requiring advanced minimally invasive surgery."
      },
      {
        "title": "Uterine Fibroids",
        "description": "Benign growths requiring laparoscopic or robotic removal."
      },
      {
        "title": "Ovarian Cysts & Tumors",
        "description": "Complex cysts requiring advanced laparoscopic management."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Hysterectomy",
        "description": "Keyhole robotic surgery for benign and cancerous gynecological conditions."
      },
      {
        "title": "Robotic Myomectomy",
        "description": "Minimally invasive removal of uterine fibroids."
      },
      {
        "title": "Laparoscopic Endometriosis Surgery",
        "description": "Advanced surgery for deep infiltrative endometriosis."
      },
      {
        "title": "Operative & Diagnostic Hysteroscopy",
        "description": "Evaluation and surgical treatment of uterine abnormalities."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ahluwalia perform robotic surgeries?",
        "answer": "Yes, she is fellowship-trained in robotic gynecologic oncology and minimally invasive surgery."
      },
      {
        "question": "Does she treat gynecological cancers?",
        "answer": "Yes, she specializes in minimally invasive procedures for gynecologic malignancies."
      },
      {
        "question": "Has she trained internationally?",
        "answer": "Yes, in Singapore, USA, and India under leading experts."
      }
    ]
  },
  {
    "slug": "dr-harmandeep-kaur-gill",
    "name": "Dr. Harmandeep Kaur Gill",
    "specialty": "Endocrinology & Diabetes",
    "hospital": "Medanta - The Medicity",
    "experience": "26+ years",
    "image": "assets/uploads/dr-harmandeep-kaur-gill.png",
    "isTopDoctor": true,
    "position": "Associate Director - Endocrinology & Diabetes",
    "degree": "MBBS | MD - Medicine | DM - Endocrinology",
    "about": "Dr. Harmandeep Kaur Gill is an Associate Director in the Division of Endocrinology & Diabetes at Medanta. Trained at SGPGI Lucknow, she brings extensive experience in diabetes, thyroid disorders, metabolic bone disorders, puberty issues, PCOS, and adrenal-pituitary diseases. She has served as Assistant Professor at UCMS-GTB Hospital and has worked in major multispecialty hospitals. Her work spans clinical practice, research, and academic excellence.",
    "medicalProblems": [
      {
        "title": "Growth & Puberty Disorders",
        "description": "Hormonal delays, early/late puberty-related disorders."
      },
      {
        "title": "Thyroid & Parathyroid Disorders",
        "description": "Thyroid nodules, hyper/hypothyroidism, calcium imbalance."
      },
      {
        "title": "Osteoporosis & Metabolic Bone Disease",
        "description": "Bone density loss, fragility fractures, metabolic bone issues."
      },
      {
        "title": "Pituitary & Adrenal Disorders",
        "description": "Hormonal abnormalities in adrenal or pituitary glands."
      }
    ],
    "procedures": [
      {
        "title": "Diabetes Management",
        "description": "Type 1, Type 2, and gestational diabetes care."
      },
      {
        "title": "Thyroid Function Evaluation",
        "description": "Hormonal and metabolic assessment."
      },
      {
        "title": "Hormonal Disorder Management",
        "description": "Treatment of PCOS, puberty disorders, adrenal conditions."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gill treat PCOS?",
        "answer": "Yes, she specializes in PCOS and hormonal disorders."
      },
      {
        "question": "Does she treat metabolic bone disease?",
        "answer": "Yes, including osteoporosis and parathyroid disorders."
      },
      {
        "question": "Is she trained in endocrinology?",
        "answer": "Yes, she completed DM Endocrinology from SGPGI Lucknow."
      }
    ]
  },
  {
    "slug": "dr-m-shafi-kuchay",
    "name": "Dr. M Shafi Kuchay",
    "specialty": "Endocrinology & Diabetes",
    "hospital": "Medanta - The Medicity",
    "experience": "19+ years",
    "image": "assets/uploads/dr-m-shafi-kuchay.png",
    "isTopDoctor": true,
    "position": "Associate Director - Endocrinology & Diabetes",
    "degree": "MBBS | MD - Medicine | DM - Endocrinology",
    "about": "Dr. Mohammad Shafi Kuchay is an Associate Director in Endocrinology & Diabetes at Medanta. A specialist in diabetes, thyroid disorders, pituitary and adrenal diseases, osteoporosis, and PCOS, he has over 60 international research publications. His areas of research include obesity, metabolic diseases, and fatty liver (MASLD). He serves as editor for leading scientific diabetes journals and has won multiple national awards for endocrine research.",
    "medicalProblems": [
      {
        "title": "Diabetes Mellitus",
        "description": "Management of all types including Type 1, Type 2, and gestational diabetes."
      },
      {
        "title": "Thyroid, Pituitary & Adrenal Disorders",
        "description": "Hormonal disorders affecting major endocrine glands."
      },
      {
        "title": "Osteoporosis & Calcium Disorders",
        "description": "Weak bones, calcium imbalance, and metabolic bone diseases."
      },
      {
        "title": "PCOS & Endocrine Disorders",
        "description": "Polycystic ovary syndrome and other hormonal imbalances."
      }
    ],
    "procedures": [
      {
        "title": "Diabetes Evaluation & Management",
        "description": "Advanced therapy for glycemic control and complications."
      },
      {
        "title": "Hormonal Disorder Treatment",
        "description": "Managing thyroid, pituitary, adrenal, and metabolic issues."
      },
      {
        "title": "Bone & Calcium Disorder Treatment",
        "description": "Assessment and management of bone health issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kuchay specialize in diabetes?",
        "answer": "Yes, he treats all forms of diabetes including complex and rare types."
      },
      {
        "question": "Does he treat PCOS?",
        "answer": "Yes, PCOS is one of his core specialties."
      },
      {
        "question": "Has he published research?",
        "answer": "Yes, he has published over 60 scientific papers internationally."
      }
    ]
  },
  {
    "slug": "dr-naginder-vashisht",
    "name": "Dr. Naginder Vashisht",
    "specialty": "Ophthalmology",
    "hospital": "Medanta - The Medicity",
    "experience": "22+ years",
    "image": "assets/uploads/dr-naginder-vashisht.png",
    "isTopDoctor": true,
    "position": "Consultant - Ophthalmology",
    "degree": "MBBS | MD - Ophthalmology",
    "about": "Dr. Naginder Vashisht is a highly experienced ophthalmologist specializing in complex retinal surgeries, vitreo-retina, uvea, ocular trauma, lasers, and cataract surgeries. With over 10,000 retinal surgeries performed, he is recognized for managing high-risk and advanced retinal conditions. Trained at the prestigious Dr. R.P. Centre, AIIMS, he has also completed fellowships from the International Council of Ophthalmology (London) and RCPS Glasgow. He is also an active contributor in research, FDA-approved clinical trials, and ophthalmology education.",
    "medicalProblems": [
      {
        "title": "Retinal Diseases",
        "description": "Diabetic retinopathy, retinal detachment, age-related degeneration."
      },
      {
        "title": "Uveitis",
        "description": "Inflammation of the uveal tissues causing vision issues."
      },
      {
        "title": "Ocular Trauma",
        "description": "Injury-related eye damage requiring surgical intervention."
      },
      {
        "title": "Cataract",
        "description": "Lens opacity causing visual impairment."
      }
    ],
    "procedures": [
      {
        "title": "Retina Surgery",
        "description": "Vitreo-retinal procedures and minimally invasive retinal interventions."
      },
      {
        "title": "Laser Procedures",
        "description": "Laser treatments for diabetic retinopathy and retinal tears."
      },
      {
        "title": "Intravitreal Injections",
        "description": "Anti-VEGF and steroid injections for various retinal diseases."
      },
      {
        "title": "Cataract Surgery",
        "description": "Advanced cataract removal with lens implantation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vashisht handle complex retinal cases?",
        "answer": "Yes, with over 10,000 retinal surgeries completed."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, with advanced fellowships from London and Glasgow."
      },
      {
        "question": "Does he treat ocular trauma?",
        "answer": "Yes, he is highly skilled in trauma-related retinal and ocular surgeries."
      }
    ]
  },
  {
    "slug": "dr-narendra-s-choudhary",
    "name": "Dr. Narendra S Choudhary",
    "specialty": "Transplant Hepatology",
    "hospital": "Medanta - The Medicity",
    "experience": "21+ years",
    "image": "assets/uploads/",
    "isTopDoctor": true,
    "position": "Associate Director - Transplant Hepatology",
    "degree": "MBBS | MD - Medicine | DM - Hepatology",
    "about": "Dr. Narendra Singh Choudhary is an Associate Director at Medanta's Institute of Liver Transplantation & Regenerative Medicine. He completed his DM Hepatology from PGI Chandigarh and is known for his significant contributions to liver disease research. He pioneered the concept of using intragastric balloon therapy for weight loss in cirrhosis patients. His expertise includes liver transplantation, EUS, fatty liver disease, viral hepatitis, liver failure, and liver cancer.",
    "medicalProblems": [
      {
        "title": "Liver Cirrhosis",
        "description": "Chronic liver damage leading to scarring and impaired function."
      },
      {
        "title": "Viral Hepatitis (B & C)",
        "description": "Liver inflammation caused by hepatitis viruses."
      },
      {
        "title": "Fatty Liver Disease",
        "description": "Metabolic-associated steatotic liver disease (MASLD)."
      },
      {
        "title": "Liver Failure",
        "description": "Severe acute or chronic liver dysfunction."
      },
      {
        "title": "Liver Cancer",
        "description": "Primary and secondary hepatic malignancies."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplantation",
        "description": "Comprehensive liver transplant evaluation and surgery."
      },
      {
        "title": "Endoscopic Ultrasound (EUS)",
        "description": "Advanced imaging for liver and GI diseases."
      },
      {
        "title": "Fatty Liver Management",
        "description": "Advanced care for MASLD and metabolic liver diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Choudhary specialize in liver transplantation?",
        "answer": "Yes, he is an expert in liver transplant and advanced hepatology."
      },
      {
        "question": "Does he treat fatty liver disease?",
        "answer": "Yes, he specializes in MASLD and metabolic liver disorders."
      },
      {
        "question": "Is he trained in EUS?",
        "answer": "Yes, he is skilled in endoscopic ultrasound for liver diagnosis."
      }
    ]
  },
  {
    "slug": "dr-parjeet-kaur",
    "name": "Dr. Parjeet Kaur",
    "specialty": "Endocrinology & Diabetes",
    "hospital": "Medanta - The Medicity",
    "experience": "24+ years",
    "image": "assets/uploads/dr-parjeet-kaur.png",
    "isTopDoctor": true,
    "position": "Associate Director - Endocrinology & Diabetes",
    "degree": "MBBS | MD - Medicine | DM - Endocrinology",
    "about": "Dr. Parjeet Kaur is an Associate Director at Medanta, Gurugram, with over 24 years of experience in Endocrinology. Trained at AIIMS New Delhi, she has also worked at Mayo Clinic, USA. She specializes in diabetes, thyroid and parathyroid disorders, PCOS, obesity, pituitary and adrenal diseases, osteoporosis, and complex hormonal disorders. She is actively involved in academic programs, research, and national/international conferences. She has received prestigious awards including the A.V. Gandhi Award and MMS Ahuja Award for excellence in Endocrinology.",
    "medicalProblems": [
      {
        "title": "Diabetes Mellitus (Type 1 & 2)",
        "description": "Comprehensive management of all forms of diabetes."
      },
      {
        "title": "Thyroid & Parathyroid Disorders",
        "description": "Hypothyroidism, hyperthyroidism, thyroid nodules, hyperparathyroidism."
      },
      {
        "title": "PCOS",
        "description": "Management of hormonal imbalance, infertility, and metabolic complications."
      },
      {
        "title": "Pituitary & Adrenal Disorders",
        "description": "Cushing\u2019s disease, adrenal tumors, hormonal dysfunction."
      },
      {
        "title": "Obesity",
        "description": "Evaluation and medical weight management."
      },
      {
        "title": "Osteoporosis",
        "description": "Bone density loss and metabolic bone issues."
      },
      {
        "title": "Puberty Disorders & Growth Issues",
        "description": "Short stature, delayed growth, puberty disorders."
      }
    ],
    "procedures": [
      {
        "title": "Diabetes Management",
        "description": "Advanced therapy including insulin management and inpatient care."
      },
      {
        "title": "Hormone Disorder Treatment",
        "description": "Pituitary, adrenal, thyroid, and parathyroid conditions."
      },
      {
        "title": "Metabolic Disorder Evaluation",
        "description": "Assessment of obesity, osteoporosis, PCOS, and related issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kaur treat PCOS?",
        "answer": "Yes, PCOS and women\u2019s endocrinological disorders are her specialties."
      },
      {
        "question": "Is she trained at AIIMS?",
        "answer": "Yes, she completed MD and DM (Endocrinology) at AIIMS, New Delhi."
      },
      {
        "question": "Does she manage complex hormonal cases?",
        "answer": "Yes, including pituitary, adrenal, thyroid, and metabolic disorders."
      }
    ]
  },
  {
    "slug": "dr-priyanka-batra",
    "name": "Dr. Priyanka Batra",
    "specialty": "Gynaecology & Gynae Oncology",
    "hospital": "Medanta - The Medicity",
    "experience": "26+ years",
    "image": "assets/uploads/dr-priyanka-batra.png",
    "isTopDoctor": true,
    "position": "Associate Director - Gynaecology",
    "degree": "MBBS | DGO | DNB - Gynaecology | GESEA-Endoscopy | FCLS - Laparoscopy | Advanced Gynae Oncology Training | Certificate - Da Vinci Robotic Surgery",
    "about": "Dr. Priyanka Batra is Associate Director in the Department of Gynaecology, Gynae Oncology, and Robotic Surgery at Medanta, Gurugram. With over 24 years of experience, she is a leading robotic and laparoscopic gynecologic oncologic surgeon. She was part of the team that performed India\u2019s first robotic gynecological surgery at Medanta. She has specialized training in Gynecologic Oncology from Switzerland University and Europe, along with advanced MIS and robotic certifications from global institutions. She has performed thousands of complex surgeries and is deeply involved in academic teaching, research, and mentorship.",
    "medicalProblems": [
      {
        "title": "Gynecologic Cancers",
        "description": "Ovarian, cervical, uterine, vulvar, and vaginal cancers."
      },
      {
        "title": "Endometriosis",
        "description": "Deep infiltrative and complex endometriosis management."
      },
      {
        "title": "Benign Gynecologic Conditions",
        "description": "Fibroids, cysts, adenomyosis, polyps, and precancerous lesions."
      },
      {
        "title": "Infertility & Reproductive Disorders",
        "description": "Evaluation and treatment of reproductive challenges."
      }
    ],
    "procedures": [
      {
        "title": "Robotic & Laparoscopic Cancer Surgery",
        "description": "Minimally invasive surgery for all gynecologic cancers."
      },
      {
        "title": "Radical & Cytoreductive Procedures",
        "description": "Advanced cancer surgeries including staging and debulking."
      },
      {
        "title": "Fertility-Preserving Cancer Surgery",
        "description": "Cancer treatment while preserving fertility when possible."
      },
      {
        "title": "Hysteroscopy & Colposcopy",
        "description": "Diagnostic and operative procedures for uterine and cervical issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Batra perform robotic surgeries?",
        "answer": "Yes, she is highly skilled in robotic MIS for gynecologic cancers and benign conditions."
      },
      {
        "question": "Does she specialize in cancer surgery?",
        "answer": "Yes, she is a gynecologic cancer surgeon trained in Europe and Switzerland."
      },
      {
        "question": "Does she treat complex endometriosis?",
        "answer": "Yes, she is an expert in MIS for severe and deep endometriosis."
      }
    ]
  },
  {
    "slug": "dr-sheilly-kapoor",
    "name": "Dr. Sheilly Kapoor",
    "specialty": "Dermatology",
    "hospital": "Medanta - The Medicity",
    "experience": "30+ years",
    "image": "assets/uploads/dr-sheilly-kapoor.png",
    "isTopDoctor": true,
    "position": "Associate Director - Dermatology",
    "degree": "MBBS | MD - Dermatology",
    "about": "Dr. Sheilly Kapoor is a highly experienced dermatologist with over 27 years in evidence-based dermatology. She specializes in skin, hair, and nail diseases and is known for her expertise in biologic therapies for moderate to severe skin disorders. She has extensive experience in dermatologic surgeries, cosmetic procedures, lasers, PRP, fillers, and acne scar management. She has been with Medanta since 2010 and has received the 2014 Excellence in Dermatology Award.",
    "medicalProblems": [
      {
        "title": "Acne & Acne Scars",
        "description": "Acne control, scar revision, and advanced treatments."
      },
      {
        "title": "Psoriasis & Eczema",
        "description": "Chronic inflammatory skin diseases requiring expert care."
      },
      {
        "title": "Hair & Scalp Disorders",
        "description": "Hair fall, alopecia, dandruff, scalp infections."
      },
      {
        "title": "Geriatric Dermatology",
        "description": "Skin issues related to aging including pigmentation and dryness."
      }
    ],
    "procedures": [
      {
        "title": "Skin Biopsies",
        "description": "Punch and elliptical biopsies for diagnosis."
      },
      {
        "title": "Laser Treatments",
        "description": "Laser therapy for pigmentation, scars, and rejuvenation."
      },
      {
        "title": "Cosmetic Dermatology",
        "description": "Botox, fillers, chemical peels, PRP, and thread lifts."
      },
      {
        "title": "Dermatosurgery",
        "description": "RF ablation, mole removal, cyst excision, and more."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Kapoor treat acne scars?",
        "answer": "Yes, she is highly experienced in advanced acne scar treatments."
      },
      {
        "question": "Does she perform laser procedures?",
        "answer": "Yes, including laser resurfacing and pigmentation laser therapy."
      },
      {
        "question": "Does she treat severe skin diseases?",
        "answer": "Yes, she routinely uses biologics for severe dermatological conditions."
      }
    ]
  },
  {
    "slug": "dr-shradha-chaudhari",
    "name": "Dr. Shradha Chaudhari",
    "specialty": "Gynaecology & Gynae Oncology",
    "hospital": "Medanta - The Medicity",
    "experience": "26+ years",
    "image": "assets/uploads/dr-shradha-chaudhari.png",
    "isTopDoctor": true,
    "position": "Associate Director - Gynaecology",
    "degree": "MBBS | MD - Gynaecology | DGO | FCPS - Gynaecology",
    "about": "Dr. Shradha Chaudhari is a senior gynecologist and minimally invasive surgeon with 24+ years of experience. She has advanced fellowship training in Laparoscopy (Germany), Urogynaecology & Pelvic Floor Reconstruction (Germany), and Cosmetic & Aesthetic Gynaecology (ISAGSS, Israel). Since joining Medanta in 2010, she has performed a wide range of complex robotic, laparoscopic, and vaginal surgeries. She is also actively involved in teaching, research, and academic publications.",
    "medicalProblems": [
      {
        "title": "PCOS & Puberty Disorders",
        "description": "Hormonal imbalance, menstrual issues, adolescent health."
      },
      {
        "title": "Gynecologic Cancers",
        "description": "Early and advanced cancer evaluation."
      },
      {
        "title": "Fibroids & Ovarian Cysts",
        "description": "Benign tumors requiring surgical or medical management."
      },
      {
        "title": "Endometriosis",
        "description": "Pelvic pain and infertility related to endometriosis."
      },
      {
        "title": "Urinary Incontinence",
        "description": "Pelvic floor and bladder-related issues."
      }
    ],
    "procedures": [
      {
        "title": "Robotic & Laparoscopic Surgery",
        "description": "Minimally invasive surgery for benign & complex conditions."
      },
      {
        "title": "Operative Hysteroscopy",
        "description": "Management of septum, fibroids, and uterine anomalies."
      },
      {
        "title": "Vaginal Surgeries",
        "description": "Pelvic floor reconstruction, prolapse repair."
      },
      {
        "title": "Urogynaecology Procedures",
        "description": "Treatment for urinary issues and pelvic floor dysfunction."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Chaudhari perform robotic surgeries?",
        "answer": "Yes, she is experienced in robotic and advanced MIS surgeries."
      },
      {
        "question": "Does she treat PCOS?",
        "answer": "Yes, PCOS and menstrual disorders are her core specialties."
      },
      {
        "question": "Is she trained internationally?",
        "answer": "Yes, in Germany and Israel for advanced gynecologic procedures."
      }
    ]
  },
  {
    "slug": "dr-ankur-atal-gupta",
    "name": "Dr. Ankur Atal Gupta",
    "specialty": "Liver Transplant Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "25+ years",
    "image": "assets/uploads/dr-ankur-atal-gupta.png",
    "isTopDoctor": true,
    "position": "Senior Consultant - Liver Transplant Surgery",
    "degree": "MBBS | MS - General Surgery | Fellowships in Minimal Access Surgery, Liver Transplantation & Hepatobiliary Surgery",
    "about": "Dr. Ankur Atal Gupta is a senior consultant in Liver Transplantation and Hepatobiliary Surgery at Medanta. He completed ASTS fellowship in abdominal organ transplant & hepatobiliary surgery at Virginia Commonwealth University, USA, followed by fellowship at Medanta. He has extensive experience in living donor and cadaveric liver transplants, hepatobiliary surgery, and complex minimal access procedures. He is actively involved in FNB training and medical education.",
    "medicalProblems": [
      {
        "title": "Liver Tumors & Cancers",
        "description": "Evaluation and surgical management of liver malignancies."
      },
      {
        "title": "Biliary Tract Diseases",
        "description": "Blockages, strictures, gallbladder and bile duct conditions."
      },
      {
        "title": "Cirrhosis & Liver Failure",
        "description": "Pre-transplant and surgical management."
      },
      {
        "title": "Transplant-Related Issues",
        "description": "Evaluation and management of donor and recipient complications."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplantation",
        "description": "Living and cadaver donor liver transplant surgeries."
      },
      {
        "title": "Minimal Access Hepatobiliary Surgery",
        "description": "Laparoscopic procedures for liver and bile duct diseases."
      },
      {
        "title": "Complex Hepatobiliary Surgery",
        "description": "Advanced surgeries for tumors, cysts, and traumatic injuries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gupta perform liver transplants?",
        "answer": "Yes, he has extensive experience in living and cadaver donor liver transplants."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, he completed ASTS fellowship in the USA."
      },
      {
        "question": "Does he perform minimally invasive surgery?",
        "answer": "Yes, he specializes in minimal access hepatobiliary surgery."
      }
    ]
  },
  {
    "slug": "dr-ateksha-bhardwaj-khanna",
    "name": "Dr. Ateksha Bhardwaj Khanna",
    "specialty": "Dental Sciences",
    "hospital": "Medanta - The Medicity",
    "experience": "18+ years",
    "image": "assets/uploads/dr-ateksha-bhardwaj-khanna.png",
    "isTopDoctor": true,
    "position": "Senior Consultant - Dental Sciences",
    "degree": "BDS | Fellowship - MJDF | Fellowship - MFDS",
    "about": "Dr. Ateksha Bhardwaj Khanna is a highly accomplished dental surgeon with advanced training from King\u2019s College London, specializing in Endodontics, Restorative and Cosmetic Dentistry. A recipient of the Clinical Excellence Award in Aesthetic Dentistry, she has practiced in leading dental clinics in London, including Smiledent and Southfields Practice. She holds dual memberships from the Royal College of Surgeons of England and Edinburgh.",
    "medicalProblems": [
      {
        "title": "Dental Decay & Cavities",
        "description": "Requires fillings, restorations, or root canal therapy."
      },
      {
        "title": "Cosmetic Dental Issues",
        "description": "Aesthetic corrections for teeth shape, color, and alignment."
      },
      {
        "title": "Missing Teeth",
        "description": "Managed with crowns, bridges, and implants."
      },
      {
        "title": "Dental Infections",
        "description": "Pulp and periapical infections requiring endodontic care."
      }
    ],
    "procedures": [
      {
        "title": "Endodontics (Root Canal)",
        "description": "Advanced pain-free root canal treatment."
      },
      {
        "title": "Cosmetic Dentistry",
        "description": "Smile design, veneers, bonding, and aesthetic restorations."
      },
      {
        "title": "Prosthodontics",
        "description": "Crowns, bridges, dentures, and full-mouth rehabilitation."
      },
      {
        "title": "Implantology",
        "description": "Dental implant placement and restoration."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ateksha specialize in cosmetic dentistry?",
        "answer": "Yes, she has advanced training from King\u2019s College London in aesthetic dentistry."
      },
      {
        "question": "Does she perform root canals?",
        "answer": "Yes, she specializes in Endodontics with advanced expertise."
      },
      {
        "question": "Has she practiced internationally?",
        "answer": "Yes, she has clinical experience in London at premier dental facilities."
      }
    ]
  },
  {
    "slug": "dr-kanika-rana",
    "name": "Dr. Kanika Rana",
    "specialty": "Head & Neck Onco Surgery",
    "hospital": "Medanta - The Medicity",
    "experience": "17+ years",
    "image": "assets/uploads/dr-kanika-rana.png",
    "isTopDoctor": true,
    "position": "Senior Consultant - Head & Neck Onco Surgery",
    "degree": "MBBS | MS - ENT | Fellowship - Head & Neck Onco Surgery",
    "about": "Dr. Kanika Rana is a Senior Consultant in Head & Neck Oncology at Medanta, specializing in head and neck cancer surgeries. She trained at Maulana Azad Medical College and gained further experience through observerships at Johns Hopkins Hospital (USA) and Memorial Sloan Kettering Cancer Center (USA). Her expertise includes oral cancer, laryngeal cancer, thyroid and parathyroid surgery, airway surgeries, and reconstructive procedures.",
    "medicalProblems": [
      {
        "title": "Oral Cancer",
        "description": "Tumors of the mouth requiring surgical removal."
      },
      {
        "title": "Thyroid & Parathyroid Disorders",
        "description": "Cancers and benign conditions of endocrine glands."
      },
      {
        "title": "Laryngeal Cancer",
        "description": "Cancers of the voice box causing hoarseness or breathing difficulty."
      },
      {
        "title": "Head & Neck Tumors",
        "description": "Parotid, salivary gland, and neck mass evaluation."
      }
    ],
    "procedures": [
      {
        "title": "Head & Neck Cancer Surgery",
        "description": "Comprehensive surgical treatment for all head and neck cancers."
      },
      {
        "title": "Laser Microlaryngeal Surgery",
        "description": "Minimally invasive laser-based larynx procedures."
      },
      {
        "title": "Endocrine Surgery",
        "description": "Thyroidectomy, parathyroidectomy, and related endocrine procedures."
      },
      {
        "title": "Reconstructive Surgery",
        "description": "Flap reconstruction post tumor removal."
      }
    ],
    "faqs": [
      {
        "question": "Did Dr. Rana train internationally?",
        "answer": "Yes, at Johns Hopkins Hospital and Memorial Sloan Kettering Cancer Center."
      },
      {
        "question": "Does she perform thyroid surgeries?",
        "answer": "Yes, she specializes in thyroid and parathyroid surgery."
      },
      {
        "question": "Does she treat oral cancer?",
        "answer": "Yes, it is one of her primary areas of expertise."
      }
    ]
  },
  {
    "slug": "dr-mona-kulpati",
    "name": "Dr. Mona Kulpati",
    "specialty": "Pediatrics",
    "hospital": "Medanta - The Medicity",
    "experience": "27+ years",
    "image": "assets/uploads/dr-mona-kulpati.png",
    "isTopDoctor": true,
    "position": "Senior Consultant - Pediatrics",
    "degree": "MBBS | DCH - Pediatrics | MRCPCH (UK) | Allergy Asthma Specialist Certification",
    "about": "Dr. Mona Kulpati is a senior pediatrician with over 20 years of experience across AIIMS, Apollo, and Rainbow Children\u2019s Hospital. She holds MRCPCH from Royal College of Paediatrics & Child Health (UK). Her expertise covers pediatric infections, growth and nutrition, newborn care, developmental assessment, and pediatric allergy and asthma.",
    "medicalProblems": [
      {
        "title": "Pediatric Allergies",
        "description": "Food, dust, environmental allergies in children."
      },
      {
        "title": "Asthma & Breathing Disorders",
        "description": "Chronic cough, wheezing, and asthma evaluation."
      },
      {
        "title": "Pediatric Infections",
        "description": "Common viral and bacterial infections in children."
      },
      {
        "title": "Growth & Nutrition Issues",
        "description": "Underweight, obesity, growth delays."
      }
    ],
    "procedures": [
      {
        "title": "Immunisation",
        "description": "Full vaccination schedule for infants and children."
      },
      {
        "title": "Skin Prick Test",
        "description": "Testing for allergy triggers."
      },
      {
        "title": "Developmental Assessment",
        "description": "Milestone, learning, and behavioral evaluation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mona treat allergies?",
        "answer": "Yes, she specializes in pediatric allergy and asthma management."
      },
      {
        "question": "Does she manage newborn care?",
        "answer": "Yes, she has extensive experience in neonatal and pediatric care."
      },
      {
        "question": "Does she perform allergy testing?",
        "answer": "Yes, including skin prick testing for accurate diagnosis."
      }
    ]
  },
  {
    "slug": "dr-neha-rastogi",
    "name": "Dr. Neha Rastogi",
    "specialty": "Paediatric Haemato-Oncology & Bone Marrow Transplant",
    "hospital": "Medanta - The Medicity",
    "experience": "22+ years",
    "image": "assets/uploads/dr-neha-rastogi.png",
    "isTopDoctor": true,
    "position": "Senior Consultant - Paediatric Haemato-Oncology & BMT",
    "degree": "MBBS | DCH | DNB - Paediatrics | Fellowships in Pediatric Hematology, Oncology & Bone Marrow Transplant",
    "about": "Dr. Neha Rastogi is extensively trained in pediatric hematology, oncology, and bone marrow transplantation across premier institutions including Sir Ganga Ram Hospital, BJ Wadia Hospital, Vancouver General Hospital, UCMS, and Fortis. She specializes in treating pediatric leukemias, thalassemia, hemophilia, platelet disorders, solid tumors, and primary immunodeficiency disorders. She is highly experienced in haploidentical and unrelated donor BMT and has deep interest in cellular and immunotherapy.",
    "medicalProblems": [
      {
        "title": "Pediatric Leukemia",
        "description": "Blood cancers requiring advanced chemotherapy and BMT."
      },
      {
        "title": "Thalassemia & Hemophilia",
        "description": "Genetic blood disorders requiring specialized care."
      },
      {
        "title": "Primary Immunodeficiency",
        "description": "Rare immune disorders in children."
      },
      {
        "title": "Pediatric Solid Tumors",
        "description": "Brain tumors, sarcomas, and other solid cancers."
      }
    ],
    "procedures": [
      {
        "title": "Hematopoietic Stem Cell Transplant (BMT)",
        "description": "Haploidentical, unrelated donor, and matched donor transplants."
      },
      {
        "title": "Chemotherapy Protocols",
        "description": "Advanced pediatric cancer treatment."
      },
      {
        "title": "Immunotherapy",
        "description": "Cellular and targeted therapies."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Neha perform BMT?",
        "answer": "Yes, she has extensive experience in pediatric bone marrow transplantation."
      },
      {
        "question": "Does she treat blood cancers?",
        "answer": "Yes, including leukemia, lymphoma, and related disorders."
      },
      {
        "question": "Is she trained internationally?",
        "answer": "Yes, including advanced training in Canada."
      }
    ]
  },
  {
    "slug": "dr-vinay-kumar-singal",
    "name": "Dr. Vinay Kumar Singal",
    "specialty": "Rheumatology & Immunology",
    "hospital": "Medanta - The Medicity",
    "experience": "43+ years",
    "image": "assets/uploads/dr-vinay-kumar-singal.png",
    "isTopDoctor": true,
    "position": "Senior Consultant - Clinical Immunology & Rheumatology",
    "degree": "MBBS | MD - General Medicine | Fellowship - Rheumatology & Clinical Immunology",
    "about": "Dr. Vinay Kumar Singal is a veteran rheumatologist with over 20 years of specialized experience and more than 43+ years in medicine. He completed his postdoctoral fellowship in Rheumatology from AIIMS, New Delhi, and has served as faculty for both undergraduate and postgraduate medical programs. He has extensive experience managing complex autoimmune and inflammatory diseases and has served as a DNB examiner.",
    "medicalProblems": [
      {
        "title": "Inflammatory Arthritis",
        "description": "Rheumatoid arthritis and other joint inflammatory conditions."
      },
      {
        "title": "SLE (Lupus)",
        "description": "Autoimmune disease affecting multiple organs."
      },
      {
        "title": "Ankylosing Spondylitis",
        "description": "Inflammatory spine disorder causing stiffness."
      },
      {
        "title": "Autoimmune Disorders",
        "description": "Immune-mediated systemic diseases."
      }
    ],
    "procedures": [
      {
        "title": "Intra-articular Injections",
        "description": "Steroid or biologic injections into joints."
      },
      {
        "title": "Arthritis Management",
        "description": "Comprehensive treatment for inflammatory arthritis."
      },
      {
        "title": "Autoimmune Disorder Treatment",
        "description": "Advanced immunomodulatory therapy."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Singal treat rheumatoid arthritis?",
        "answer": "Yes, he has decades of expertise in inflammatory arthritis."
      },
      {
        "question": "Is he trained at AIIMS?",
        "answer": "Yes, he completed his postdoctoral fellowship in Rheumatology at AIIMS."
      },
      {
        "question": "Does he manage autoimmune diseases?",
        "answer": "Yes, including lupus, spondylitis, and systemic immunological disorders."
      }
    ]
  },
  {
    "slug": "dr-dhwanee-shardul-thakkar",
    "name": "Dr. Dhwanee Shardul Thakkar",
    "specialty": "Pediatric Hemato-Oncology & Bone Marrow Transplant",
    "hospital": "Medanta - The Medicity",
    "experience": "17+ years",
    "image": "assets/uploads/",
    "isTopDoctor": true,
    "position": "Consultant - Pediatric Hemato Oncology & Bone Marrow Transplant",
    "degree": "MBBS | MD - Paediatrics | FNB - Pediatric Hematology Oncology | Fellowship - Pediatric Hematology Oncology",
    "about": "Dr. Dhwanee Shardul Thakkar is a specialist in Pediatric Hematology and Oncology with advanced training in Haemostasis and Thrombosis from The Royal Infirmary of Edinburgh, Scotland. She has extensive expertise in bleeding disorders such as hemophilia, von Willebrand disease, and rare coagulation disorders. She also treats pediatric leukemias, lymphomas, solid tumors, anemias, and primary immunodeficiencies. She is actively involved in pediatric hematopoietic stem cell transplantation.",
    "medicalProblems": [
      {
        "title": "Pediatric Bleeding Disorders",
        "description": "Hemophilia, von Willebrand disease, and rare bleeding disorders."
      },
      {
        "title": "Pediatric Blood Cancers",
        "description": "Leukemia, lymphoma, and related hematologic malignancies."
      },
      {
        "title": "Childhood Anemias",
        "description": "Hemolytic and nutritional anemias."
      },
      {
        "title": "Immunodeficiency Disorders",
        "description": "Primary immune system disorders requiring specialized care."
      }
    ],
    "procedures": [
      {
        "title": "Hematopoietic Stem Cell Transplant",
        "description": "Bone marrow transplantation for children with hematologic diseases."
      },
      {
        "title": "Coagulation Disorder Management",
        "description": "Comprehensive care for hemophilia and bleeding disorders."
      },
      {
        "title": "Pediatric Oncology Treatment",
        "description": "Chemotherapy and targeted therapy for childhood cancers."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Dhwanee trained internationally?",
        "answer": "Yes, she trained in Haemostasis and Thrombosis at The Royal Infirmary of Edinburgh, Scotland."
      },
      {
        "question": "Does she treat hemophilia?",
        "answer": "Yes, she has specialized expertise in hemophilia and rare bleeding disorders."
      },
      {
        "question": "Does she perform pediatric bone marrow transplants?",
        "answer": "Yes, she is actively involved in pediatric HSCT."
      }
    ]
  },
  {
    "slug": "dr-shanky-koul",
    "name": "Dr. Shanky Koul",
    "specialty": "Gastroenterology",
    "hospital": "Medanta - The Medicity",
    "experience": "14+ years",
    "image": "assets/uploads/dr-shanky-koul.png",
    "isTopDoctor": true,
    "position": "Associate Consultant - Gastroenterology",
    "degree": "MBBS | MD - General Medicine | DM - Gastroenterology",
    "about": "Dr. Shanky Koul is an Associate Consultant in Gastroenterology at Medanta with strong expertise in diagnostic and therapeutic endoscopy, ERCP, and endoscopic ultrasound. He belongs to one of the first batches in India trained by leading Japanese experts in standardized endoscopy practices and early gastric cancer detection. His interests include pancreatic diseases, liver disorders, and functional GI conditions.",
    "medicalProblems": [
      {
        "title": "Pancreatic Disorders",
        "description": "Pancreatitis and other pancreatic diseases."
      },
      {
        "title": "Liver Diseases",
        "description": "Acute and chronic liver disease evaluation."
      },
      {
        "title": "Functional GI Disorders",
        "description": "IBS, dyspepsia, and motility-related issues."
      },
      {
        "title": "Biliary Tract Disorders",
        "description": "Blockages and gallstone-related issues managed via ERCP."
      }
    ],
    "procedures": [
      {
        "title": "Diagnostic & Therapeutic Endoscopy",
        "description": "Endoscopic evaluation and treatment of GI diseases."
      },
      {
        "title": "ERCP",
        "description": "Endoscopic removal of stones and treatment of biliary/pancreatic duct issues."
      },
      {
        "title": "Endoscopic Ultrasound (EUS)",
        "description": "Advanced imaging for pancreas, bile ducts, and GI tract."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Koul perform ERCP?",
        "answer": "Yes, he specializes in diagnostic and therapeutic ERCP."
      },
      {
        "question": "Is he trained in early cancer detection via endoscopy?",
        "answer": "Yes, trained under Japanese experts in early gastric cancer detection."
      },
      {
        "question": "Does he manage liver diseases?",
        "answer": "Yes, he treats both acute and chronic liver conditions."
      }
    ]
  },
  {
    "slug": "chhavi-kohli",
    "name": "Chhavi Kohli",
    "specialty": "Diabetes Education & Nutrition",
    "hospital": "Medanta - The Medicity",
    "experience": "20+ years",
    "image": "assets/uploads/",
    "isTopDoctor": false,
    "position": "Chief Diabetes Educator - Endocrinology & Diabetes",
    "degree": "PG Diploma in Nutrition & Dietetics | B.Sc - Home Science | M.Sc - Home Science",
    "about": "Chhavi Kohli is a Senior Diabetes Educator and Nutritionist with over a decade of specialized experience in Type 1 diabetes, gestational diabetes, CGMS, and insulin pump management. She frequently conducts educational workshops, school programs, lifestyle modification sessions, and awareness campaigns to prevent diabetes, obesity, and lifestyle diseases. She has also created multiple educational videos on diabetes care.",
    "medicalProblems": [
      {
        "title": "Type 1 Diabetes",
        "description": "Child and adult Type 1 diabetes requiring insulin and CGMS support."
      },
      {
        "title": "Gestational Diabetes",
        "description": "Diabetes occurring during pregnancy requiring careful management."
      },
      {
        "title": "Obesity & Weight Gain",
        "description": "Lifestyle-based weight management support."
      },
      {
        "title": "Type 2 Diabetes Lifestyle Issues",
        "description": "Nutrition and activity-based diabetes management."
      }
    ],
    "procedures": [
      {
        "title": "Insulin Pump Training",
        "description": "Hands-on guidance for insulin pump usage and troubleshooting."
      },
      {
        "title": "CGMS Setup & Analysis",
        "description": "Continuous glucose monitoring system training and data interpretation."
      },
      {
        "title": "Diet & Lifestyle Planning",
        "description": "Customized nutrition and exercise plans."
      }
    ],
    "faqs": [
      {
        "question": "Does Chhavi Kohli specialize in Type 1 diabetes?",
        "answer": "Yes, she has extensive experience in Type 1 diabetes education and management."
      },
      {
        "question": "Does she provide nutrition counseling?",
        "answer": "Yes, she creates tailored diet and lifestyle management plans."
      },
      {
        "question": "Does she support insulin pump users?",
        "answer": "Yes, she specializes in insulin pump and CGMS training."
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/medanta.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/fmri.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/artemis.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/max-saket.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/max-patparganj.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/amrita.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/metro.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/paras.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/asian.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/manipal.jpg",
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
 * @query data=[{ "name": "...", "image": "assets/uploads/assets/uploads/assets/uploads/..." }, ...]
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
