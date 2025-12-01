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
    "slug": "dr-aayush-chawla",
    "name": "Dr. Aayush Chawla",
    "specialty": "Anesthesiology & Critical Care",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "11+ years",
    "image": "Aayush Chawla.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Critical Care",
    "degree": "MBBS | MD (Anaesthesia) | IDCCM | IFCCM",
    "about": "Dr. Aayush Chawla is an Anaesthesiologist and Intensivist with more than 11 years of experience in Critical Care Medicine. He completed MBBS and MD from Banaras Hindu University and has worked at Fortis Escorts Hospital, Faridabad and Indraprastha Apollo Hospitals, New Delhi. He specializes in the management of critically ill patients, airway techniques, mechanical ventilation and infection control. He is a founder member of the Fluid Academy of India and an active academic contributor.",
    "medicalProblems": [
      {
        "title": "Critical Illness",
        "description": "Comprehensive ICU care for life-threatening conditions."
      },
      {
        "title": "Sepsis & Septic Shock",
        "description": "Advanced management of severe infections."
      },
      {
        "title": "Respiratory Failure",
        "description": "Expert ventilation and airway management."
      },
      {
        "title": "Hemodynamic Instability",
        "description": "Monitoring and stabilization of unstable patients."
      }
    ],
    "procedures": [
      {
        "title": "Airway Management",
        "description": "Advanced and difficult airway handling."
      },
      {
        "title": "Mechanical Ventilation",
        "description": "Invasive and non-invasive ventilation support."
      },
      {
        "title": "ICU Bronchoscopy",
        "description": "Diagnostic and therapeutic bronchoscopy in ICU."
      },
      {
        "title": "Infection Control Protocols",
        "description": "Antibiotic stewardship and infection prevention."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Aayush manage critically ill patients?",
        "answer": "Yes, he specializes in critical care and ICU management."
      },
      {
        "question": "Is he trained in mechanical ventilation?",
        "answer": "Yes, he has deep expertise in ventilatory support and monitoring."
      },
      {
        "question": "Does he perform ICU bronchoscopy?",
        "answer": "Yes, he performs bronchoscopy in critically ill patients."
      }
    ]
  },
  {
    "slug": "dr-gaurav-kakkar",
    "name": "Dr. Gaurav Kakkar",
    "specialty": "Neuro-Anaesthesia & Neurocritical Care",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "22+ years",
    "image": "garva kakkar.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Lead  Neuro-Anaesthesia & Neurocritical Care",
    "degree": "MBBS | FCARCSI | Fellowship (Neuroanaesthesia & Neurocritical Care) | CCT (UK) | FSNCC",
    "about": "Dr. Gaurav Kakkar is a British-trained Neuroanaesthetist and Neurocritical Care specialist with over 22 years of experience. He completed his MBBS from AFMC Pune and then trained extensively in the UK, completing Specialist Registrar training and earning the Certificate of Completion of Training. He has worked at leading UK hospitals such as The Royal London Hospital and The Walton Centre for Neurosciences.",
    "medicalProblems": [
      {
        "title": "Brain & Spine Trauma",
        "description": "Expert care for traumatic neurological emergencies."
      },
      {
        "title": "Subarachnoid Hemorrhage",
        "description": "Critical management of brain hemorrhage cases."
      },
      {
        "title": "Neurosurgical Conditions",
        "description": "Support for complex neurosurgical procedures."
      },
      {
        "title": "Stroke",
        "description": "Expertise in hyperacute stroke services."
      }
    ],
    "procedures": [
      {
        "title": "Neuro-Anaesthesia",
        "description": "Anaesthesia for brain and spine surgeries."
      },
      {
        "title": "Neurocritical Care",
        "description": "ICU management of neurological emergencies."
      },
      {
        "title": "Functional Neurosurgery Support",
        "description": "Anaesthesia for DBS and similar procedures."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Kakkar trained in the UK?",
        "answer": "Yes, he has 14 years of UK training including formal specialist registrar training."
      },
      {
        "question": "Does he treat stroke emergencies?",
        "answer": "Yes, he is experienced in hyperacute stroke care."
      },
      {
        "question": "Is he specialized in neurocritical care?",
        "answer": "Yes, he is a recognized neurocritical care expert."
      }
    ]
  },
  {
    "slug": "dr-niti-batra-gulati",
    "name": "Dr. Niti Batra Gulati",
    "specialty": "Anesthesiology & Critical Care",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "18+ years",
    "image": "dr niti gulati batra.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Anaesthesiology & Critical Care",
    "degree": "MBBS | MD | IDRA",
    "about": "Dr. Niti Batra Gulati is a Senior Consultant in Anaesthesiology & Critical Care with 18 years of experience. She specializes in high-risk surgical anaesthesia, acute pain management, and life support training. She is also an instructor for advanced trauma and life support courses.",
    "medicalProblems": [
      {
        "title": "High-Risk Surgical Cases",
        "description": "Anaesthesia for complex and critical surgeries."
      },
      {
        "title": "Acute Pain Conditions",
        "description": "Expert acute and perioperative pain management."
      },
      {
        "title": "Trauma Cases",
        "description": "Advanced trauma life support expertise."
      }
    ],
    "procedures": [
      {
        "title": "Advanced Life Support Training",
        "description": "Instructor-level BLS & ACLS guidance."
      },
      {
        "title": "Labour Analgesia",
        "description": "Pain-free delivery management."
      },
      {
        "title": "Acute Pain Interventions",
        "description": "Post-operative and perioperative pain procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Niti manage high-risk surgeries?",
        "answer": "Yes, she has extensive experience in high-risk anaesthesia."
      },
      {
        "question": "Is she a certified life support instructor?",
        "answer": "Yes, she teaches BLS, ACLS, and ATLS."
      },
      {
        "question": "Does she offer labour analgesia?",
        "answer": "Yes, she provides pain-free delivery services."
      }
    ]
  },
  {
    "slug": "dr-ripenmeet-salhotra",
    "name": "Dr. Ripenmeet Salhotra",
    "specialty": "Critical Care & Anaesthesiology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "16+ years",
    "image": "dr. ripenmmet salhotra.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Critical Care",
    "degree": "MBBS | MD (Anaesthesiology) | IDCCM | IFCCM | EDIC",
    "about": "Dr. Ripenmeet Salhotra has over 16 years of experience as an intensivist with national and international training in critical care. He has been instrumental in managing thousands of critically ill patients, including those with sepsis, trauma, stroke and multi-organ failure. He is a strong advocate of palliative care, infection control and rational antibiotic use.",
    "medicalProblems": [
      {
        "title": "Severe Sepsis & Septic Shock",
        "description": "Advanced life-saving treatment for sepsis."
      },
      {
        "title": "Multi-Organ Failure",
        "description": "Expert management of organ dysfunction syndromes."
      },
      {
        "title": "Neurological Emergencies",
        "description": "Stroke and trauma support in ICU."
      },
      {
        "title": "Respiratory Failure",
        "description": "Ventilation and airway management expertise."
      }
    ],
    "procedures": [
      {
        "title": "Bronchoscopy",
        "description": "Bronchoscopy for critically ill patients."
      },
      {
        "title": "Percutaneous Tracheostomy",
        "description": "Bedside tracheostomy procedures."
      },
      {
        "title": "Point of Care Ultrasound",
        "description": "Ultrasound for rapid ICU diagnosis."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ripenmeet perform tracheostomy?",
        "answer": "Yes, he performs percutaneous tracheostomy in ICU patients."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, he holds EDIC from Brussels."
      },
      {
        "question": "Does he manage end-of-life care?",
        "answer": "Yes, he strongly advocates ethical palliative care."
      }
    ]
  },
  {
    "slug": "dr-shankey-garg",
    "name": "Dr. Shankey Garg",
    "specialty": "Anesthesiology & Critical Care",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "4+ years post-MD",
    "image": "dr. shankey.webp",
    "isTopDoctor": false,
    "position": "Consultant  Anaesthesia & Critical Care",
    "degree": "MBBS | MD (Anaesthesia) | DNB | PDCC (Liver Transplant Anaesthesia)",
    "about": "Dr. Shankey Garg is an accomplished anaesthetist trained at premier institutions such as PGIMER Chandigarh and ILBS New Delhi. With strong expertise in liver transplant anaesthesia, gastrointestinal surgeries, high-risk cases and labour analgesia, she has contributed significantly to patient care and academics. She has also authored several national and international publications.",
    "medicalProblems": [
      {
        "title": "Liver Failure & Transplant Care",
        "description": "Anaesthesia and ICU care for liver transplant patients."
      },
      {
        "title": "High-Risk Surgical Cases",
        "description": "Anaesthesia for major GI, hepatobiliary and urology surgeries."
      },
      {
        "title": "Obstetric Anaesthesia",
        "description": "Pain-free labour and pregnancy-related anaesthesia support."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplant Anaesthesia",
        "description": "Anaesthesia for living donor liver transplant surgeries."
      },
      {
        "title": "POCUS",
        "description": "Point of care ultrasound for real-time decision making."
      },
      {
        "title": "Labour Analgesia",
        "description": "Pain-free normal delivery support."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Shankey specialize in liver transplant anaesthesia?",
        "answer": "Yes, she completed a PDCC fellowship at ILBS, New Delhi."
      },
      {
        "question": "Does she provide labour analgesia?",
        "answer": "Yes, she strongly advocates pain-free childbirth."
      },
      {
        "question": "Does she handle high-risk surgical patients?",
        "answer": "Yes, she has extensive experience across major surgical specialties."
      }
    ]
  },
  {
    "slug": "dr-dheeraj-arora",
    "name": "Dr. Dheeraj Arora",
    "specialty": "Cardiac Anaesthesiology & Critical Care",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "22+ years",
    "image": "dr. dheeraj arora.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Cardiac Anaesthesiology & Critical Care",
    "degree": "MBBS | DNB | PDCC (Cardiac Anaesthesiology) | PGCCHM",
    "about": "Dr. Dheeraj Arora is a highly experienced cardiac anaesthesiologist with over 22 years of post-graduate experience. He has worked in leading cardiac centres including SGPGIMS Lucknow, GB Pant Hospital, Escorts Heart Institute, and Medanta. He specialises in high-risk cardiac surgical cases, TEE, and percutaneous cardiac interventions.",
    "medicalProblems": [
      {
        "title": "Heart Surgery Support",
        "description": "Anaesthesia for bypass, valve and complex cardiac surgeries."
      },
      {
        "title": "Cardiac Critical Illness",
        "description": "Expert care for cardiac ICU patients."
      },
      {
        "title": "High-Risk Cardiac Cases",
        "description": "Management of complex cardiac comorbidities."
      }
    ],
    "procedures": [
      {
        "title": "Cardiac Anaesthesia",
        "description": "Anaesthesia for all major cardiac surgical procedures."
      },
      {
        "title": "Transesophageal Echocardiography (TEE)",
        "description": "Perioperative cardiac function monitoring."
      },
      {
        "title": "Percutaneous Interventions Support",
        "description": "Anaesthesia for catheter-based procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Dheeraj handle cardiac surgeries?",
        "answer": "Yes, he has decades of experience in cardiac anaesthesia."
      },
      {
        "question": "Is he trained in TEE?",
        "answer": "Yes, he specializes in perioperative TEE monitoring."
      },
      {
        "question": "Does he manage high-risk cardiac patients?",
        "answer": "Yes, he is known for managing complex cardiac cases."
      }
    ]
  },
  {
    "slug": "dr-anshul-jain",
    "name": "Dr. Anshul Jain",
    "specialty": "Emergency Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Anshul Jain.webp",
    "isTopDoctor": false,
    "position": "Consultant  Emergency Medicine",
    "degree": "MBBS | MD (Emergency Medicine) | MRCEM (Royal College London)",
    "about": "Dr. Anshul Jain is a Consultant and Assistant Professor in Emergency Medicine with experience at AIIMS New Delhi and Sarvodaya Hospital. He specializes in trauma, toxicology, emergency stabilisation, and point-of-care ultrasound.",
    "medicalProblems": [
      {
        "title": "Emergency Trauma Care",
        "description": "Immediate care for critical injuries and trauma."
      },
      {
        "title": "Poisoning & Toxicology",
        "description": "Expert management of poisoning emergencies."
      },
      {
        "title": "Cardiac & Respiratory Emergencies",
        "description": "Life-saving interventions for cardiac arrest and breathing failure."
      }
    ],
    "procedures": [
      {
        "title": "Point of Care Ultrasound (POCUS)",
        "description": "Bedside ultrasound for rapid diagnosis."
      },
      {
        "title": "Advanced Resuscitation",
        "description": "BLS, ACLS, ATLS and PALS certified emergency interventions."
      },
      {
        "title": "Emergency Stabilization",
        "description": "Airway, circulation and trauma stabilization."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Anshul MRCEM certified?",
        "answer": "Yes, he has completed MRCEM from the Royal College London."
      },
      {
        "question": "Does he treat poisoning cases?",
        "answer": "Yes, toxicology is one of his key areas of expertise."
      },
      {
        "question": "Has he worked at AIIMS?",
        "answer": "Yes, he worked as a Senior Resident at AIIMS Delhi."
      }
    ]
  },
  {
    "slug": "dr-abhishek-behera",
    "name": "Dr. Abhishek Behera",
    "specialty": "Therapeutic Nuclear Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Abhishek Behera.webp",
    "isTopDoctor": false,
    "position": "Consultant & Assistant Professor  Nuclear Medicine",
    "degree": "MBBS | MD (Nuclear Medicine) | DM (Therapeutic Nuclear Medicine)",
    "about": "Dr. Abhishek Behera is one of the few DM-trained Therapeutic Nuclear Medicine specialists in India, trained at AIIMS New Delhi. He has authored more than 15 publications and works extensively on prostate cancer, neuroendocrine tumours, targeted alpha therapy, and translational radionuclide therapy.",
    "medicalProblems": [
      {
        "title": "Prostate Cancer",
        "description": "Advanced nuclear theranostics and imaging."
      },
      {
        "title": "Neuroendocrine Tumors",
        "description": "Targeted therapy and PET-CT imaging."
      },
      {
        "title": "Thyroid Cancer",
        "description": "Diagnostic and therapeutic nuclear management."
      }
    ],
    "procedures": [
      {
        "title": "PET-CT Imaging",
        "description": "High-precision nuclear imaging."
      },
      {
        "title": "Targeted Alpha Therapy",
        "description": "Advanced therapeutic nuclear treatment."
      },
      {
        "title": "Radioembolization",
        "description": "Liver-directed radionuclide therapy."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Abhishek trained at AIIMS?",
        "answer": "Yes, he completed both MD and DM from AIIMS New Delhi."
      },
      {
        "question": "Does he treat prostate cancer?",
        "answer": "Yes, it is one of his main areas of expertise."
      },
      {
        "question": "Does he perform PET-CT scans?",
        "answer": "Yes, he specializes in nuclear imaging including PET-CT."
      }
    ]
  },
  {
    "slug": "dr-meghana-prabhu-s",
    "name": "Dr. Meghana Prabhu S",
    "specialty": "Therapeutic Nuclear Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Meghana Prabhu S.webp",
    "isTopDoctor": false,
    "position": "Consultant & Associate Professor  Nuclear Medicine",
    "degree": "MBBS | DNB | DM (Therapeutic Nuclear Medicine) | MNAMS | FANMB",
    "about": "Dr. Meghana Prabhu S is among the few DM-trained Therapeutic Nuclear Medicine specialists in India, trained at AIIMS New Delhi. She has over 24 publications, multiple awards, and expertise in nuclear oncology, PET-CT, targeted alpha therapy, and theranostics for prostate, thyroid, and neuroendocrine cancers.",
    "medicalProblems": [
      {
        "title": "Neuroendocrine Cancer",
        "description": "Advanced imaging and targeted therapy."
      },
      {
        "title": "Prostate Cancer",
        "description": "Nuclear theranostics and advanced PET imaging."
      },
      {
        "title": "Thyroid Cancer",
        "description": "Diagnostic and therapeutic nuclear medicine."
      }
    ],
    "procedures": [
      {
        "title": "PET-CT Imaging",
        "description": "High-quality nuclear diagnostic imaging."
      },
      {
        "title": "Targeted Alpha Therapeutics",
        "description": "Theranostic nuclear treatment for cancers."
      },
      {
        "title": "SIRT / Radioembolization",
        "description": "Selective internal radiation therapy."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Meghana DM-trained from AIIMS?",
        "answer": "Yes, she completed DM at AIIMS New Delhi."
      },
      {
        "question": "Does she specialize in nuclear oncology?",
        "answer": "Yes, she has extensive expertise in theranostics."
      },
      {
        "question": "How many publications does she have?",
        "answer": "She has authored over 24 publications."
      }
    ]
  },
  {
    "slug": "dr-bela-bhat",
    "name": "Dr. Bela Bhat",
    "specialty": "Dermatology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Bela Bhat.webp",
    "isTopDoctor": false,
    "position": "Consultant  Dermatology",
    "degree": "MBBS | MD (Dermatology, Venereology & Leprosy)",
    "about": "Dr. Bela Bhat is a Consultant Dermatologist with over 8 years of experience in clinical dermatology, laser treatments, acne management, pigmentation, hair disorders, and cosmetic procedures. She is known for her patient-centered approach and has multiple publications in national and international journals.",
    "medicalProblems": [
      {
        "title": "Acne & Acne Scars",
        "description": "Comprehensive acne and scar treatment plans."
      },
      {
        "title": "Pigmentation Disorders",
        "description": "Laser and dermatological treatment for pigmentation."
      },
      {
        "title": "Hair & Scalp Disorders",
        "description": "Management of alopecia and scalp conditions."
      },
      {
        "title": "Autoimmune Skin Disorders",
        "description": "Vitiligo, psoriasis and other chronic dermatological diseases."
      }
    ],
    "procedures": [
      {
        "title": "Laser Hair Removal",
        "description": "IPL, diode and triple wavelength laser treatments."
      },
      {
        "title": "Q-Switch Laser Treatments",
        "description": "Pigmentation, tattoo removal and rejuvenation."
      },
      {
        "title": "MNRF & Radiofrequency",
        "description": "Skin tightening and rejuvenation procedures."
      },
      {
        "title": "PRP Treatments",
        "description": "PRP for hair growth and facial rejuvenation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Bela perform laser hair removal?",
        "answer": "Yes, she works with all major laser platforms."
      },
      {
        "question": "Does she treat acne and pigmentation?",
        "answer": "Yes, she has extensive expertise in acne and pigmentation treatment."
      },
      {
        "question": "Does she offer PRP treatments?",
        "answer": "Yes, she performs PRP for hair loss and skin rejuvenation."
      }
    ]
  },
  {
    "slug": "dr-vichitra-sharma",
    "name": "Dr. Vichitra Sharma",
    "specialty": "Dermatology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Vichitra Sharma.webp",
    "isTopDoctor": false,
    "position": "Consultant  Dermatology",
    "degree": "MBBS | MD (Dermatology)",
    "about": "Dr. Vichitra Sharma is a Consultant Dermatologist at Amrita Hospital, Faridabad with expertise in clinical dermatology, aesthetic dermatology, acne, pigmentary disorders, lasers, dermoscopy and dermatosurgery. She completed MBBS from KMC Manipal and MD Dermatology from Era\u2019s Lucknow Medical College. She is known for her compassionate patient care and stays updated with latest advancements in dermatology. She has 4 poster presentations, 1 oral paper presentation and 3 publications in reputed journals.",
    "medicalProblems": [
      {
        "title": "Acne & Acne Scars",
        "description": "Advanced acne treatment and scar therapy."
      },
      {
        "title": "Skin Allergies",
        "description": "Treatment for atopic dermatitis, eczema and urticaria."
      },
      {
        "title": "Pigmentary Disorders",
        "description": "Management of melasma, hyperpigmentation and related issues."
      },
      {
        "title": "Infectious Dermatology",
        "description": "Management of leprosy and sexually transmitted skin infections."
      }
    ],
    "procedures": [
      {
        "title": "Laser Hair Reduction",
        "description": "Safe and advanced LHR procedures."
      },
      {
        "title": "PRP for Hair & Skin",
        "description": "PRP for hair loss and facial rejuvenation."
      },
      {
        "title": "Dermatosurgery",
        "description": "Mole removal, cyst excision, vitiligo and nail surgeries."
      },
      {
        "title": "Chemical Peels",
        "description": "Peels for rejuvenation and pigmentation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vichitra treat acne scars?",
        "answer": "Yes, she specializes in acne and acne scar management."
      },
      {
        "question": "Does she perform dermatosurgery?",
        "answer": "Yes, including mole removal, cyst excisions and vitiligo surgeries."
      },
      {
        "question": "Does she provide laser hair reduction?",
        "answer": "Yes, she performs advanced laser hair removal treatments."
      }
    ]
  },
  {
    "slug": "dr-sachin-gupta",
    "name": "Dr. Sachin Gupta",
    "specialty": "Dermatology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "dr. sachin gupta.webp",
    "isTopDoctor": false,
    "position": "Consultant & Assistant Professor  Dermatology",
    "degree": "MBBS | MD Dermatology | DNB Dermatology",
    "about": "Dr. Sachin Gupta is a highly trained dermatologist with MBBS and MD Dermatology from AIIMS New Delhi. He has worked as a Senior Resident at AIIMS and specializes in acne, melasma, vitiligo, psoriasis, eczema, hair fall and sexually transmitted infections. He is experienced in dermatosurgery, laser treatments, PRP and chemical peeling. He has earned multiple national recognitions including top positions in PG quiz competitions and international dermatology scholarships.",
    "medicalProblems": [
      {
        "title": "Vitiligo & Melasma",
        "description": "Evaluation and targeted treatment for pigmentation disorders."
      },
      {
        "title": "Psoriasis & Chronic Eczema",
        "description": "Comprehensive long-term management."
      },
      {
        "title": "Hair Loss Disorders",
        "description": "Diagnosis and treatment of alopecia and hair fall."
      },
      {
        "title": "Sexually Transmitted Infections",
        "description": "Diagnosis and treatment of dermatological STIs."
      }
    ],
    "procedures": [
      {
        "title": "Laser Hair Removal",
        "description": "Advanced laser hair reduction."
      },
      {
        "title": "Chemical Peeling",
        "description": "Peels for acne, melasma and rejuvenation."
      },
      {
        "title": "Dermatosurgery",
        "description": "Mole removal, wart removal, corn removal and vitiligo surgeries."
      },
      {
        "title": "PRP",
        "description": "PRP for hair growth and facial treatment."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sachin treat melasma and pigmentation?",
        "answer": "Yes, melasma and pigmentation disorders are key areas of his expertise."
      },
      {
        "question": "Does he perform dermatosurgery procedures?",
        "answer": "Yes, including mole excision, wart removal and vitiligo surgeries."
      },
      {
        "question": "Is Dr. Sachin trained at AIIMS?",
        "answer": "Yes, he completed MBBS, MD Dermatology and Senior Residency from AIIMS."
      }
    ]
  },
  {
    "slug": "dr-amit-kumar-agarwal",
    "name": "Dr. Amit Kumar Agarwal",
    "specialty": "Neurology & Epilepsy",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "12+ years",
    "image": "Dr. Amit Kumar Agarwal.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Assistant Professor  Neurology",
    "degree": "MBBS | MD | DM (Neurology) | PDF Epilepsy | PDCC Epilepsy",
    "about": "Dr. Amit Kumar Agarwal is an epilepsy specialist trained at Amrita Institute of Medical Sciences, Kochi and the Cleveland Clinic, USA. He completed his neurology training from AIIMS New Delhi and specializes in treating complex epilepsy cases, especially drug-resistant epilepsy. He provides advanced epilepsy management including epilepsy surgery, ketogenic diet therapy and neuromodulation techniques like Deep Brain Stimulation (DBS). He is known for his ethical, compassionate and research-driven approach towards patient care.",
    "medicalProblems": [
      {
        "title": "Epilepsy",
        "description": "Comprehensive management of all types of epilepsy."
      },
      {
        "title": "Drug-Resistant Epilepsy",
        "description": "Advanced evaluation for surgical and non-surgical options."
      },
      {
        "title": "Seizure Disorders",
        "description": "Diagnosis and long-term follow-up for recurrent seizures."
      },
      {
        "title": "Neurological Disorders",
        "description": "Treatment of general neurological conditions."
      }
    ],
    "procedures": [
      {
        "title": "Epilepsy Surgery Evaluation",
        "description": "Assessment for surgical treatment in resistant epilepsy."
      },
      {
        "title": "Ketogenic Diet Therapy",
        "description": "Diet-based therapy for seizure control."
      },
      {
        "title": "Deep Brain Stimulation (DBS)",
        "description": "Advanced neuromodulation for epilepsy."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Amit treat drug-resistant epilepsy?",
        "answer": "Yes, he specializes in treating patients who do not respond to medication."
      },
      {
        "question": "Does he offer epilepsy surgery evaluation?",
        "answer": "Yes, he evaluates and prepares patients for surgical options."
      },
      {
        "question": "Is he trained internationally?",
        "answer": "Yes, he has advanced epilepsy training from Cleveland Clinic, USA."
      }
    ]
  },
  {
    "slug": "dr-akanksha-jain",
    "name": "Dr. Akanksha Jain",
    "specialty": "Paediatric Intensive Care (PICU)",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "13+ years",
    "image": "dr-akanksha-jain.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Paediatrics & Paediatric Critical Care",
    "degree": "MBBS | DNB Paediatrics | FNB PICU | FPICU (UK) | FCCM (Toronto, Canada)",
    "about": "Dr. Akanksha Jain is a Senior Consultant in Paediatrics and Paediatric Critical Care with over 13 years of experience. She has trained at prestigious institutes including Narayana Hrudayalaya (Bangalore), London, Birmingham, and SickKids (Toronto). She has successfully led PICU setups, managed complex paediatric cases including airway emergencies, ECMO-supported pneumonias, organ transplant patients, neurology emergencies, metabolic disorders, and genetic diseases. She is also a passionate academician, having authored multiple publications, initiated PICU fellowship programs, and developed simulation-based training modules.",
    "medicalProblems": [
      {
        "title": "Critically Ill Children",
        "description": "Advanced PICU management across multiple specialties."
      },
      {
        "title": "Airway Emergencies",
        "description": "Management of complex paediatric airway conditions."
      },
      {
        "title": "Complex Infections",
        "description": "Treatment of severe infections requiring advanced ventilation."
      },
      {
        "title": "Pediatric Organ Transplant Care",
        "description": "Post-operative care for liver, kidney and cardiac transplants."
      }
    ],
    "procedures": [
      {
        "title": "Advanced Ventilation & ECMO Support",
        "description": "Management of critically ill children requiring ventilation and ECMO."
      },
      {
        "title": "Paediatric Simulation Training",
        "description": "Simulation-based academic programs for healthcare staff."
      },
      {
        "title": "Emergency Critical Care Transport",
        "description": "National and international PICU transport expertise."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Akanksha manage complex PICU cases?",
        "answer": "Yes, she has extensive expertise across all paediatric critical care subspecialties."
      },
      {
        "question": "Has she worked internationally?",
        "answer": "Yes, she trained at SickKids Toronto and hospitals in London and Birmingham."
      },
      {
        "question": "Does she offer ECMO-supported care?",
        "answer": "Yes, she has significant experience in ECMO-supported paediatric respiratory failure."
      }
    ]
  },
  {
    "slug": "dr-veena-raghunathan",
    "name": "Dr. Veena Raghunathan",
    "specialty": "Paediatric Intensive Care (PICU)",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Veena Raghunathan.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Paediatric Intensive Care",
    "degree": "MBBS | MD (Paediatrics) | DNB (Paediatrics) | FNB (Paediatric Intensive Care)",
    "about": "Dr. Veena Raghunathan is a Senior Consultant in Paediatric Intensive Care with over 15 years of experience. She completed her MBBS from Seth GS Medical College and KEM Hospital, Mumbai, and MD Paediatrics from Grant Medical College. She further pursued DNB Paediatrics and specialized PICU training including FNB in Paediatric Intensive Care at Sir Ganga Ram Hospital, Delhi. She has managed over 300 pediatric liver transplant patients and is renowned for her expertise in respiratory support, renal replacement therapies, paediatric bronchoscopy, and care of critically ill children with complex conditions.",
    "medicalProblems": [
      {
        "title": "Severe Pneumonia & Bronchiolitis",
        "description": "Advanced respiratory support for severe lung infections."
      },
      {
        "title": "Tropical Infections",
        "description": "Management of dengue, malaria and other acute infections in children."
      },
      {
        "title": "Paediatric Organ Transplant Care",
        "description": "Post-operative ICU management for liver, kidney and BMT patients."
      },
      {
        "title": "Neuromuscular & Genetic Disorders",
        "description": "Critical care for complex congenital and neurological conditions."
      }
    ],
    "procedures": [
      {
        "title": "Acute Renal Replacement Therapies (CRRT)",
        "description": "Advanced renal support for critically ill children."
      },
      {
        "title": "Paediatric Bronchoscopy",
        "description": "Bronchoscopy for airway evaluation and treatment."
      },
      {
        "title": "Lung Function Testing",
        "description": "Paediatric pulmonary diagnostics."
      },
      {
        "title": "Long-Term Ventilation & Tracheostomy Care",
        "description": "Comprehensive care for children requiring chronic respiratory support."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Veena manage paediatric liver transplant patients?",
        "answer": "Yes, she has managed over 300 paediatric liver transplant cases."
      },
      {
        "question": "Does she perform paediatric bronchoscopy?",
        "answer": "Yes, she is experienced in both diagnostic and therapeutic bronchoscopy."
      },
      {
        "question": "Does she treat severe respiratory infections?",
        "answer": "Yes, she specializes in advanced respiratory support for critically ill children."
      }
    ]
  },
  {
    "slug": "dr-amrita-kapoor-chaturvedi",
    "name": "Dr. Amrita Kapoor Chaturvedi",
    "specialty": "Ophthalmology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "20+ years",
    "image": "Dr. Amrita Kapoor Chaturvedi.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Assistant Professor  Ophthalmology",
    "degree": "MBBS (AIIMS) | MD Ophthalmology (AIIMS) | FRCS (Edinburgh)",
    "about": "Dr. Amrita Kapoor Chaturvedi is a highly experienced ophthalmologist trained at AIIMS, New Delhi. She has worked extensively at Dr. Rajendra Prasad Centre for Ophthalmic Sciences in glaucoma, squint, pediatric ophthalmology, neuro-ophthalmology and oculoplasty. She has also served as Senior Research Associate and later as Senior Consultant at Visitech Eye Centre before joining Amrita Hospital in 2022. She has vast experience in treating complex glaucoma, pediatric eye diseases, neuro-ophthalmic conditions and performing advanced cataract and refractive surgeries.",
    "medicalProblems": [
      {
        "title": "Glaucoma",
        "description": "Management of complex and refractory glaucoma cases."
      },
      {
        "title": "Pediatric Eye Disorders",
        "description": "Treatment for squint, refractive errors and childhood eye diseases."
      },
      {
        "title": "Neuro-Ophthalmology",
        "description": "Evaluation of optic nerve and brain-related visual problems."
      },
      {
        "title": "Cataract & Refractive Errors",
        "description": "Comprehensive cataract treatment and vision correction surgeries."
      }
    ],
    "procedures": [
      {
        "title": "Glaucoma Surgeries",
        "description": "Valves, drainage devices and advanced glaucoma interventions."
      },
      {
        "title": "Cataract Surgery",
        "description": "Phacoemulsification and intraocular lens implantation."
      },
      {
        "title": "Squint Surgery",
        "description": "Correction of strabismus in children and adults."
      },
      {
        "title": "Oculoplasty Procedures",
        "description": "Eyelid, orbit and ocular reconstructive surgeries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Amrita treat glaucoma?",
        "answer": "Yes, she has extensive experience in managing complex glaucoma cases."
      },
      {
        "question": "Does she perform pediatric eye surgeries?",
        "answer": "Yes, including squint correction and childhood eye treatments."
      },
      {
        "question": "Is she trained at AIIMS?",
        "answer": "Yes, both her MBBS and MD Ophthalmology were completed at AIIMS New Delhi."
      }
    ]
  },
  {
    "slug": "dr-anubhav-pandey",
    "name": "Dr. Anubhav Pandey",
    "specialty": "Clinical Microbiology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "20+ years",
    "image": "Dr. Anubhav Pandey.webp",
    "isTopDoctor": false,
    "position": "Head  Clinical Labs",
    "degree": "MBBS | MD (Microbiology) | PGDHHM | Infectious Diseases Certification",
    "about": "Dr. Anubhav Pandey is a highly accomplished Clinical Microbiologist and Clinical Laboratory specialist with more than two decades of experience. He completed MBBS from King George Medical College, Lucknow and MD Microbiology from AIIMS, New Delhi, followed by senior residencies at AIIMS. He has set up multiple national referral laboratories including Dengue Referral Lab (AIIMS, 2006) and Swine Flu Diagnostic Lab (SRL, 2009). He is an ISO 9001 Lead Auditor, CAP Auditor, NABH Assessor and an expert in clinical virology, stem cell research, quality assurance, and infectious diseases. He has authored over 20 publications and contributed to multiple national research programs.",
    "medicalProblems": [
      {
        "title": "Infectious Diseases Diagnosis",
        "description": "Laboratory diagnosis for bacterial, viral and fungal infections."
      },
      {
        "title": "Clinical Virology",
        "description": "Specialized testing for viruses including dengue, influenza and more."
      },
      {
        "title": "HIV & AIDS Screening",
        "description": "Expertise in HIV diagnosis and complications screening."
      },
      {
        "title": "Antimicrobial Resistance",
        "description": "Testing and management strategies for MDR organisms."
      }
    ],
    "procedures": [
      {
        "title": "Molecular Diagnostics",
        "description": "PCR-based detection of infectious diseases."
      },
      {
        "title": "Quality Assurance Systems",
        "description": "ISO, CAP and NABH compliant laboratory frameworks."
      },
      {
        "title": "Stem Cell Culture",
        "description": "Advanced laboratory procedures for stem cell research."
      },
      {
        "title": "Virology Lab Setup",
        "description": "Designing and establishing viral diagnostic labs."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Anubhav an expert in virology?",
        "answer": "Yes, he has specialized training and has established multiple virology labs."
      },
      {
        "question": "Does he have experience with infectious disease outbreaks?",
        "answer": "Yes, he set up national labs during dengue and swine flu outbreaks."
      },
      {
        "question": "Is he involved in research?",
        "answer": "Yes, he is PI/Co-PI for over 10 national research programs."
      }
    ]
  },
  {
    "slug": "dr-aparna-chakravarty",
    "name": "Dr. Aparna Chakravarty",
    "specialty": "Paediatric Infectious Diseases",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "19+ years",
    "image": "Dr. Aparna Chakravarty.webp",
    "isTopDoctor": false,
    "position": "Professor  Paediatric Infectious Diseases",
    "degree": "MBBS | MD Paediatrics | Fellowship Pediatric Infectious Diseases (SickKids Toronto) | MSc Infectious Diseases (LSHTM London)",
    "about": "Dr. Aparna Chakravarty is a senior paediatrician and paediatric infectious disease specialist with over 19 years of experience. She brings international expertise from SickKids Toronto and advanced academic training from the London School of Hygiene & Tropical Medicine. She has extensive experience in managing neonatal and pediatric infections, antimicrobial stewardship, infection prevention, vaccine research and medical education. She has led multi-institutional research projects, served as hospital infection control lead and mentored hundreds of medical students. She is known for her holistic, rational and family-centric care approach.",
    "medicalProblems": [
      {
        "title": "Pediatric Infectious Diseases",
        "description": "Management of bacterial, viral and fungal infections in children."
      },
      {
        "title": "Neonatal Infections",
        "description": "Specialized care for infections in newborns."
      },
      {
        "title": "Multi-Drug Resistant Infections (MDR)",
        "description": "Management of complex resistant infections."
      },
      {
        "title": "Tropical Diseases",
        "description": "Management of dengue, malaria, typhoid and parasitic infections."
      }
    ],
    "procedures": [
      {
        "title": "Antimicrobial Stewardship Programs",
        "description": "Implementation of rational antibiotic use in hospitals."
      },
      {
        "title": "Infection Control Systems",
        "description": "Designing and monitoring infection prevention protocols."
      },
      {
        "title": "Vaccine Research",
        "description": "Clinical trials and academic research in immunization."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Aparna treat complex infections?",
        "answer": "Yes, she specializes in managing severe and multi-drug resistant infections."
      },
      {
        "question": "Is she trained internationally?",
        "answer": "Yes, she completed her fellowship at SickKids, Toronto and MSc in London."
      },
      {
        "question": "Does she work in antimicrobial stewardship?",
        "answer": "Yes, she has led antimicrobial stewardship programs at major institutions."
      }
    ]
  },
  {
    "slug": "dr-aparna-h-mahajan",
    "name": "Dr. Aparna H. Mahajan",
    "specialty": "ENT (Otorhinolaryngology)",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "12+ years",
    "image": "Dr. Aparna H Mahajan.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  ENT",
    "degree": "MBBS | MS (ENT) | MRCS ENT (London)",
    "about": "Dr. Aparna Mahajan is a highly accomplished ENT surgeon with over a decade of experience. A graduate of the Mahatma Gandhi Institute of Medical Sciences, she later completed MRCS ENT from the Royal College of Surgeons, London. She has undergone advanced training in Cardiff, Wales, and has worked at reputed hospitals such as Fortis Escorts, VIMHANS, ESIC Medical College, and Park Hospital. She is experienced in skull base surgery, cochlear implants, sinus surgery, paediatric bronchoscopy, and complex ENT surgical procedures. Dr. Aparna successfully performed numerous rigid bronchoscopies in infants with airway foreign bodies and treated multiple mucormycosis cases during the COVID era.",
    "medicalProblems": [
      {
        "title": "Chronic Sinusitis",
        "description": "Evaluation and treatment of long-standing sinus conditions."
      },
      {
        "title": "Hearing Loss & Ear Disorders",
        "description": "Management of conductive and sensorineural hearing problems."
      },
      {
        "title": "Airway Foreign Bodies",
        "description": "Paediatric bronchoscopy for removal of foreign bodies."
      },
      {
        "title": "Voice & Laryngeal Disorders",
        "description": "Treatment of voice problems and laryngeal conditions."
      }
    ],
    "procedures": [
      {
        "title": "Endoscopic Sinus Surgery",
        "description": "Advanced minimally invasive sinus procedures."
      },
      {
        "title": "Cochlear Implants",
        "description": "Surgical restoration for profound hearing loss."
      },
      {
        "title": "Paediatric Rigid Bronchoscopy",
        "description": "Expert removal of airway foreign bodies in children."
      },
      {
        "title": "Ear Microsurgery",
        "description": "Surgical treatment for chronic ear diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Aparna perform cochlear implant surgeries?",
        "answer": "Yes, she is experienced in cochlear implant procedures."
      },
      {
        "question": "Does she treat sinus problems?",
        "answer": "Yes, she specializes in endoscopic sinus surgery."
      },
      {
        "question": "Is she trained internationally?",
        "answer": "Yes, she completed MRCS ENT from London with additional training in Cardiff."
      }
    ]
  },
  {
    "slug": "dr-arjun-khanna",
    "name": "Dr. Arjun Khanna",
    "specialty": "Pulmonary Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Arjun Khanna.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Head  Pulmonary Medicine",
    "degree": "MD | DM (Pulmonary & Critical Care) | FCCP | FNCCP | FAPSR",
    "about": "Dr. Arjun Khanna is one of the few DM-trained Pulmonary Medicine specialists in India and a highly accomplished clinician, researcher and academic leader. An alumnus of King George Medical College, he has served as faculty at AIIMS New Delhi and has received more than 10 gold medals during his medical training. He has over 100 publications and has delivered more than 500 invited lectures. He received the Global Rising Star Award in Pulmonary Medicine at an international conference in France. His expertise includes advanced respiratory failure, severe COPD, asthma, interstitial lung diseases, interventional pulmonology and pulmonary rehabilitation.",
    "medicalProblems": [
      {
        "title": "Severe COPD",
        "description": "Comprehensive evaluation and long-term management."
      },
      {
        "title": "Asthma & Allergies",
        "description": "Management of difficult-to-treat asthma and allergic airway diseases."
      },
      {
        "title": "Interstitial Lung Disease (ILD)",
        "description": "Diagnosis and advanced ILD care."
      },
      {
        "title": "Sleep Disorders",
        "description": "Evaluation and management of sleep-related breathing disorders."
      }
    ],
    "procedures": [
      {
        "title": "Interventional Pulmonology",
        "description": "Advanced procedures including bronchoscopy and airway interventions."
      },
      {
        "title": "Pulmonary Rehabilitation",
        "description": "Rehabilitation programs for chronic lung disease."
      },
      {
        "title": "Biologic Therapy for Asthma",
        "description": "Advanced biologic treatments for severe asthma."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Arjun treat severe COPD?",
        "answer": "Yes, COPD and chronic airway diseases are key areas of his expertise."
      },
      {
        "question": "Is he trained in interventional pulmonology?",
        "answer": "Yes, he completed advanced training at Siriraj Hospital, Bangkok."
      },
      {
        "question": "Has he received international awards?",
        "answer": "Yes, including the Global Rising Star Award in Pulmonary Medicine."
      }
    ]
  },
  {
    "slug": "dr-arun-sharma",
    "name": "Dr. Arun Sharma",
    "specialty": "Plastic & Reconstructive Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "13+ years",
    "image": "Dr. Arun Sharma.webp",
    "isTopDoctor": false,
    "position": "Consultant & Assistant Professor  Plastic & Reconstructive Surgery",
    "degree": "BDS | MDS (Oral & Maxillofacial Surgery) | Certificate in Oral & Maxillofacial Implantology",
    "about": "Dr. Arun Sharma is a Consultant and Assistant Professor in the Department of Plastic & Reconstructive Surgery at Amrita Hospital, Faridabad. With over 13 years of experience, he specializes in Oral and Maxillofacial Surgery, craniofacial surgery, cleft care, and facial trauma. A graduate of Manipal University with an MDS from KLE University, he has worked extensively with major plastic and reconstructive surgery units across Delhi. He has over 10 years of experience in cleft and craniofacial surgery and has been part of leading craniofacial teams in India. His expertise spans facial trauma, orthognathic surgery, TMJ disorders, craniosynostosis, and complex dental implant rehabilitation including zygomatic and pterygoid implants.",
    "medicalProblems": [
      {
        "title": "Facial Trauma",
        "description": "Management of complex facial injuries and fractures."
      },
      {
        "title": "Cleft Lip & Palate",
        "description": "Comprehensive cleft and craniofacial deformity correction."
      },
      {
        "title": "TMJ Disorders",
        "description": "Evaluation and surgical management of temporomandibular joint issues."
      },
      {
        "title": "Craniosynostosis",
        "description": "Surgical correction of premature skull bone fusion."
      }
    ],
    "procedures": [
      {
        "title": "Orthognathic Surgery",
        "description": "Jaw alignment surgeries for facial aesthetics and function."
      },
      {
        "title": "Craniofacial Surgery",
        "description": "Correction of congenital facial deformities."
      },
      {
        "title": "Dental Implants",
        "description": "Advanced implant procedures including zygomatic and pterygoid implants."
      },
      {
        "title": "Profiloplasty",
        "description": "Facial aesthetic surgeries for structural enhancement."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Arun perform cleft and craniofacial surgeries?",
        "answer": "Yes, he has over 10 years of specialized experience in craniofacial and cleft surgery."
      },
      {
        "question": "Does he handle complex dental implant cases?",
        "answer": "Yes, he specializes in advanced implants including zygomatic and pterygoid implants."
      },
      {
        "question": "Does he treat facial trauma?",
        "answer": "Yes, he is highly experienced in managing all types of facial trauma."
      }
    ]
  },
  {
    "slug": "dr-ashish-katewa",
    "name": "Dr. Ashish Katewa",
    "specialty": "Paediatric & Adult Congenital Heart Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "14+ years",
    "image": "Dr. Ashish Katewa.webp",
    "isTopDoctor": false,
    "position": "Head of Department  Paediatric & Adult Congenital Heart Surgery",
    "degree": "MBBS | MS (General Surgery) | MCh (Cardiovascular & Thoracic Surgery) | Fellowship in Paediatric Cardiac Surgery",
    "about": "Dr. Ashish Katewa is an acclaimed Paediatric and Congenital Heart Surgeon with over 14 years of experience and more than 6000 paediatric cardiac surgeries performed across a wide spectrum of heart conditions. He has trained at premier institutions including SMS Medical College Jaipur, KEM Hospital Mumbai, and the Children\u2019s Hospital at Westmead, Australia. He has led humanitarian pediatric cardiac missions across India and abroad, and has mentored cardiac programs in Cambodia and Nigeria. Dr. Katewa works closely with governments, NGOs and global foundations to improve congenital heart disease awareness and accessible care. His expertise spans neonatal heart surgeries, complex congenital heart repairs, single-ventricle physiology, arrhythmia surgery, and bloodless cardiac surgery.",
    "medicalProblems": [
      {
        "title": "Congenital Heart Defects",
        "description": "Diagnosis and surgical correction of birth-related heart abnormalities."
      },
      {
        "title": "Neonatal Heart Disease",
        "description": "Specialized cardiac surgery for newborns with life-threatening defects."
      },
      {
        "title": "Pediatric Heart Failure",
        "description": "Surgical management of cardiomyopathy and advanced heart failure in children."
      },
      {
        "title": "Adult Congenital Heart Disease",
        "description": "Surgical care for adults with congenital heart anomalies."
      }
    ],
    "procedures": [
      {
        "title": "Neonatal Cardiac Surgery",
        "description": "Advanced surgeries for newborn cardiac conditions."
      },
      {
        "title": "Pediatric Cardiac Surgery",
        "description": "Treatment of complex congenital heart diseases in children."
      },
      {
        "title": "Root Translocation & Complex Repairs",
        "description": "Specialized reconstruction procedures for advanced cardiac anomalies."
      },
      {
        "title": "Arrhythmia Surgery",
        "description": "Surgical solutions for difficult-to-manage pediatric arrhythmias."
      },
      {
        "title": "Bloodless Cardiac Surgery",
        "description": "Minimally transfusion-dependent cardiac operations."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Katewa perform neonatal heart surgeries?",
        "answer": "Yes, neonatal cardiac surgery is one of his core specialties."
      },
      {
        "question": "Has he worked internationally?",
        "answer": "Yes, he has mentored pediatric cardiac programs in Cambodia, Nigeria, and led global humanitarian missions."
      },
      {
        "question": "Does he handle complex congenital heart defects?",
        "answer": "Yes, he has performed over 6000 pediatric cardiac surgeries across all complexity levels."
      }
    ]
  },
  {
    "slug": "dr-binoj-s-t",
    "name": "Dr. Binoj S T",
    "specialty": "Gastrointestinal Surgery, Liver Transplantation & HPB Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Binoj S T.webp",
    "isTopDoctor": false,
    "position": "Clinical Professor  GI Surgery & Transplantation",
    "degree": "MS (General Surgery) | DNB (Surgical Gastroenterology) | Fellowship in Minimal Access Surgery",
    "about": "Dr. Binoj S T is a Clinical Professor in Gastrointestinal Surgery and Liver, Small Bowel and Pancreas Transplantation. With over 15 years of experience, he has extensive expertise in complex GI surgeries, hepatobiliary procedures, and multi-organ transplantation. He has received multiple national awards for his pioneering research on liver transplantation and immunosuppression. Dr. Binoj has contributed to major international research trials, including randomized studies on venous thromboembolism prevention, stem cell therapy for critical limb ischemia, antifungal trials, and intra-abdominal infection treatments. His work is widely published in national and international journals.",
    "medicalProblems": [
      {
        "title": "Liver Failure",
        "description": "Evaluation and surgical management including liver transplantation."
      },
      {
        "title": "Pancreatic Diseases",
        "description": "Management of pancreatic cancers and benign pancreatic conditions."
      },
      {
        "title": "Small Bowel Disorders",
        "description": "Treatment including small bowel transplantation."
      },
      {
        "title": "Gastrointestinal Cancers",
        "description": "Comprehensive surgical care for GI malignancies."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplantation",
        "description": "Living donor and deceased donor liver transplant surgeries."
      },
      {
        "title": "Minimal Access GI Surgery",
        "description": "Laparoscopic interventions for digestive diseases."
      },
      {
        "title": "Pancreas Transplant & HPB Surgery",
        "description": "Advanced hepatobiliary and pancreatic procedures."
      },
      {
        "title": "Small Bowel Transplantation",
        "description": "Surgical treatment for intestinal failure."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Binoj perform liver transplants?",
        "answer": "Yes, he has extensive experience in living and deceased donor liver transplantation."
      },
      {
        "question": "Has he published research?",
        "answer": "Yes, he has multiple publications including award-winning studies on liver transplant immunosuppression."
      },
      {
        "question": "Is he involved in clinical trials?",
        "answer": "Yes, he has been Co-Investigator in several multinational randomized trials."
      }
    ]
  },
  {
    "slug": "dr-deepti-sharma",
    "name": "Dr. Deepti Sharma",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "25+ years",
    "image": "Dr. Deepti Sharma.webp",
    "isTopDoctor": false,
    "position": "Professor & Head  Obstetrics & Gynaecology",
    "degree": "MBBS | MS (Obstetrics & Gynaecology) | Diploma in Pelvic Endoscopy",
    "about": "Dr. Deepti Sharma is a renowned Obstetrician and Gynaecologist with over 25 years of clinical and academic excellence. She specializes in high-risk pregnancies, advanced laparoscopic surgery, operative hysteroscopy, pelvic floor reconstruction and management of complex gynaecological disorders. Trained at SMS Medical College, Jaipur, and the prestigious Kiel School of Gynecological Endoscopy in Germany, she brings world-class expertise to women\u2019s healthcare. Dr. Sharma is known for her evidence-based approach, preventive care focus, and commitment to training the next generation of medical professionals.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Expert care for complicated and high-risk maternal conditions."
      },
      {
        "title": "Cesarean Scar Ectopic Pregnancy",
        "description": "Diagnosis and surgical management of rare ectopic implantations."
      },
      {
        "title": "Pelvic Floor Disorders",
        "description": "Management of prolapse, incontinence and pelvic floor dysfunction."
      },
      {
        "title": "Adolescent Gynaecology",
        "description": "Hormonal, menstrual and developmental concerns in adolescents."
      }
    ],
    "procedures": [
      {
        "title": "Advanced Laparoscopic Surgery",
        "description": "Minimally invasive solutions for complex gynaecological conditions."
      },
      {
        "title": "Operative Hysteroscopy",
        "description": "Endoscopic procedures for uterine abnormalities."
      },
      {
        "title": "Pelvic Floor Reconstruction",
        "description": "Colposuspension, sling surgeries and pelvic restorative procedures."
      },
      {
        "title": "Endoscopic Ovarian Transposition",
        "description": "Ovarian preservation in young cancer patients undergoing pelvic radiation."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Deepti manage high-risk pregnancies?",
        "answer": "Yes, she is highly experienced in managing complex and high-risk maternal cases."
      },
      {
        "question": "Does she perform advanced laparoscopic surgeries?",
        "answer": "Yes, she is a leading expert in minimally invasive gynaecological procedures."
      },
      {
        "question": "Is she involved in teaching?",
        "answer": "Yes, she has been teaching and mentoring medical students and residents for over 20 years."
      }
    ]
  },
  {
    "slug": "dr-dinesh-balakrishnan",
    "name": "Dr. Dinesh Balakrishnan",
    "specialty": "Gastrointestinal Surgery, Surgical Oncology & Organ Transplantation",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "20+ years",
    "image": "Dr. Dinesh Balakrishnan.webp",
    "isTopDoctor": false,
    "position": "Clinical Professor  Digestive Diseases, GI Surgery & Transplantation",
    "degree": "MBBS | MS (General Surgery) | DNB (General Surgery) | Fellowship  Minimal Access Surgery | Senior Clinical Fellow  Solid Organ Transplant (Cambridge)",
    "about": "Dr. Dinesh Balakrishnan is a distinguished GI surgeon and transplant specialist with more than 20 years of experience. He trained at premier institutions including Medical College Calicut, Medical College Kottayam, and Addenbrooke\u2019s Hospital, Cambridge, where he gained advanced expertise in multivisceral transplantation and organ retrieval. Dr. Balakrishnan has been an integral part of the solid organ transplant program at Amrita Institute, contributing significantly to liver, pancreas and small bowel transplant initiatives. He has led numerous public health awareness programs across India and has participated in major global clinical trials involving antifungal therapies, antibiotics and cancer treatment protocols.",
    "medicalProblems": [
      {
        "title": "Gastrointestinal Cancers",
        "description": "Comprehensive surgical care for stomach, colorectal and liver cancers."
      },
      {
        "title": "Liver & Pancreatic Diseases",
        "description": "Management of complex hepatobiliary and pancreatic conditions."
      },
      {
        "title": "Organ Failure",
        "description": "Evaluation for liver, pancreas and small bowel transplantation."
      },
      {
        "title": "Esophageal Disorders",
        "description": "Surgical management of benign and malignant esophageal diseases."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplantation",
        "description": "Advanced transplant procedures including multi-organ retrieval."
      },
      {
        "title": "GI Oncologic Surgery",
        "description": "Surgery for tumors of the stomach, colon, liver and pancreas."
      },
      {
        "title": "Minimal Access Surgery",
        "description": "Laparoscopic solutions for digestive and abdominal diseases."
      },
      {
        "title": "Pancreas & Small Bowel Transplant",
        "description": "Transplant procedures for complex organ failure."
      }
    ],
    "faqs": [
      {
        "question": "Is Dr. Dinesh involved in transplant surgery?",
        "answer": "Yes, he has extensive experience in liver, pancreas and small bowel transplantation."
      },
      {
        "question": "Has he participated in clinical trials?",
        "answer": "Yes, he has been a co-investigator in multiple global randomized trials."
      },
      {
        "question": "Does he treat GI cancers?",
        "answer": "Yes, he specializes in surgical management of gastrointestinal and hepatobiliary cancers."
      }
    ]
  },
  {
    "slug": "dr-divyam-girdhar",
    "name": "Dr. Divyam Girdhar",
    "specialty": "Endodontics & Conservative Dentistry",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "6+ years (post-MDS)",
    "image": "Dr. Divyam Girdhar.webp",
    "isTopDoctor": false,
    "position": "Consultant  Endodontist",
    "degree": "BDS | MDS (Conservative Dentistry & Endodontics)",
    "about": "Dr. Divyam Girdhar is a highly skilled Endodontist with extensive experience in micro-endodontics, retreatment procedures, aesthetic dentistry and advanced restorative techniques. Trained at prestigious institutions such as PGIDS Rohtak and B.R. Ambedkar University Agra, he has worked as a Senior Resident and Assistant Professor in leading dental colleges in Delhi-NCR. He has a strong academic and research background with multiple national and international publications and book chapters. He is known for his precision-driven approach, especially in microsurgical endodontics, single-visit RCTs and smile correction.",
    "medicalProblems": [
      {
        "title": "Tooth Pain & Infection",
        "description": "Diagnosis and treatment of pulp infections and dental abscesses."
      },
      {
        "title": "Failed Root Canals",
        "description": "Advanced retreatment and corrective endodontic procedures."
      },
      {
        "title": "Aesthetic Dental Concerns",
        "description": "Smile correction for discoloration, shape defects and uneven teeth."
      },
      {
        "title": "Tooth Fractures & Structural Loss",
        "description": "Restoration of compromised teeth using advanced techniques."
      }
    ],
    "procedures": [
      {
        "title": "Root Canal Treatment (RCT)",
        "description": "Single-sitting and multi-visit RCT using microscopic precision."
      },
      {
        "title": "Microsurgical Endodontics",
        "description": "Advanced minimally invasive surgeries for complex root issues."
      },
      {
        "title": "Smile Correction",
        "description": "Ceramic veneers, crowns, whitening and aesthetic restorations."
      },
      {
        "title": "Retreatment Procedures",
        "description": "Correction of previous inadequate or failed dental treatments."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Divyam perform single-sitting RCTs?",
        "answer": "Yes, he specializes in single-sitting root canal treatments using modern techniques."
      },
      {
        "question": "Does he handle failed root canals?",
        "answer": "Yes, he is highly experienced in endodontic retreatment and microsurgical corrections."
      },
      {
        "question": "Does he offer aesthetic dentistry?",
        "answer": "Yes, including smile correction, veneers and cosmetic restorations."
      }
    ]
  },
  {
    "slug": "dr-gargi-agarwal",
    "name": "Dr. Gargi Agarwal",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "12+ years",
    "image": "Dr. Gargi Agarwal.webp",
    "isTopDoctor": false,
    "position": "Associate Professor & Senior Consultant  Obstetrics & Gynaecology",
    "degree": "MBBS | MD (Obstetrics & Gynaecology) | DNB | FMAS",
    "about": "Dr. Gargi Agarwal is an accomplished Obstetrician & Gynaecologist with over 12 years of clinical and academic experience. She completed her MBBS with Gold Medal and Distinction from Bundelkhand University, followed by MD (OBGYN) from the prestigious King George Medical University (KGMU), Lucknow. She has received multiple university-level Gold Medals and awards for academic excellence and research. Dr. Gargi has worked as Assistant Professor, Senior Resident and Registrar at premier medical institutions across India, including Lady Hardinge Medical College and Queen Mary\u2019s Hospital, Lucknow. Her expertise spans high-risk pregnancy, infertility, hysteroscopy, laparoscopy and advanced gynaecological procedures.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Holistic care for complex and high-risk obstetric cases."
      },
      {
        "title": "Female Infertility",
        "description": "Evaluation and treatment of infertility-related concerns."
      },
      {
        "title": "Menstrual Disorders",
        "description": "Management of irregular cycles, PCOS and hormonal issues."
      },
      {
        "title": "Uterine & Ovarian Conditions",
        "description": "Fibroids, cysts, polyps and related gynaecological diseases."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive procedures for gynaecological disorders."
      },
      {
        "title": "Hysteroscopic Surgery",
        "description": "Uterine polyp removal, septum correction and diagnostic hysteroscopy."
      },
      {
        "title": "Infertility Treatments",
        "description": "Comprehensive management for couples with fertility issues."
      },
      {
        "title": "Obstetric Care",
        "description": "Safe delivery planning and pregnancy care including high-risk cases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gargi specialize in high-risk pregnancy?",
        "answer": "Yes, she has significant expertise in managing complicated pregnancies."
      },
      {
        "question": "Does she perform laparoscopic surgeries?",
        "answer": "Yes, she is trained in advanced laparoscopy and hysteroscopy."
      },
      {
        "question": "Does she treat infertility?",
        "answer": "Yes, she manages a wide range of infertility-related conditions."
      }
    ]
  },
  {
    "slug": "dr-gaurav-khanna",
    "name": "Dr. Gaurav Khanna",
    "specialty": "Pathology (Histopathology)",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Gaurav Khanna.webp",
    "isTopDoctor": false,
    "position": "Consultant  Histopathology",
    "degree": "MBBS | MD (Pathology) | PDCC  Hepatopathology",
    "about": "Dr. Gaurav Khanna is a renowned histopathologist with deep expertise in oncopathology, neuropathology and hepatopathology. He completed MBBS from Government Medical College, Amritsar and pursued MD Pathology at AIIMS New Delhi, where he trained under some of India\u2019s foremost pathology experts. He later completed a PDCC fellowship in hepatopathology at the Institute of Liver and Biliary Sciences (ILBS), India\u2019s premier liver institute. Dr. Khanna has worked with leading surgeons and clinicians at Fortis Memorial Research Institute, Gurugram, and is widely respected for his precision, diagnostic accuracy and research contributions. He has numerous publications and has been invited as faculty for national-level pathology workshops and CMEs.",
    "medicalProblems": [
      {
        "title": "Cancer Diagnosis",
        "description": "Histopathological evaluation for accurate cancer detection."
      },
      {
        "title": "Liver Diseases",
        "description": "Advanced biopsy interpretation in hepatitis, cirrhosis and tumors."
      },
      {
        "title": "Brain & Nerve Tumors",
        "description": "Specialized diagnosis in neuropathology."
      },
      {
        "title": "Inflammatory & Autoimmune Conditions",
        "description": "Biopsy-based assessment for systemic and organ-specific disorders."
      }
    ],
    "procedures": [
      {
        "title": "Histopathology Reporting",
        "description": "Microscopic tissue diagnosis for all major organs and diseases."
      },
      {
        "title": "Liver Biopsy Analysis",
        "description": "Specialized interpretation of liver biopsies including complex cases."
      },
      {
        "title": "Oncopathology Panels",
        "description": "Advanced tumor typing and immunohistochemistry."
      },
      {
        "title": "Neuropathology Evaluation",
        "description": "Detailed reporting of brain, spine and nerve lesions."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gaurav specialize in cancer pathology?",
        "answer": "Yes, oncopathology is one of his primary areas of expertise."
      },
      {
        "question": "Is he trained in liver pathology?",
        "answer": "Yes, he completed a specialized PDCC fellowship in hepatopathology at ILBS."
      },
      {
        "question": "Does he handle neuropathology cases?",
        "answer": "Yes, he has significant experience in diagnosing complex brain and nerve tumors."
      }
    ]
  },
  {
    "slug": "dr-hyacinth-peninnah-paljor",
    "name": "Dr. Hyacinth Peninnah Paljor",
    "specialty": "Internal Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "35+ years",
    "image": "r. Hyacinth Peninnah Paljor.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Internal Medicine",
    "degree": "MBBS | MD (Internal Medicine)",
    "about": "Dr. Hyacinth Peninnah Paljor is a Senior Consultant in Internal Medicine with over 35 years of extensive clinical experience in outpatient, inpatient and critical care settings. A graduate of Mysore Medical College with MD from Bangalore Medical College, she has served in India and internationally across government hospitals, multispecialty centers, and major tertiary care institutions. She has held pivotal leadership roles such as Senior Consultant & Head of Medicine at St. Stephen\u2019s Hospital, Delhi, and Director Academics & Head of Wellness Centre at Sarvodaya Hospital, Faridabad. She is also a National Boardrecognized teacher, examiner and thesis guide with decades of experience training DNB postgraduate students. Dr. Paljor is known for her compassionate patient care, excellence in diagnosis, and her strong commitment to medical education and ethics.",
    "medicalProblems": [
      {
        "title": "Chronic Lifestyle Diseases",
        "description": "Management of diabetes, hypertension, thyroid disorders and metabolic conditions."
      },
      {
        "title": "Infectious Diseases",
        "description": "Comprehensive care for viral, bacterial and parasitic infections."
      },
      {
        "title": "Critical Care Conditions",
        "description": "Expert management of acute medical emergencies and ICU-level care."
      },
      {
        "title": "Geriatric Medicine",
        "description": "Holistic care for elderly patients with multiple comorbidities."
      }
    ],
    "procedures": [
      {
        "title": "Chronic Disease Management",
        "description": "Long-term care plans for diabetes, hypertension and endocrine issues."
      },
      {
        "title": "Critical Care Management",
        "description": "Evaluation and stabilization of serious medical emergencies."
      },
      {
        "title": "Preventive Health Programs",
        "description": "Wellness assessments and lifestyle modification guidance."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Paljor treat chronic diseases?",
        "answer": "Yes, she extensively manages diabetes, hypertension, thyroid issues and other long-standing medical conditions."
      },
      {
        "question": "Is she experienced in critical care?",
        "answer": "Yes, she has decades of experience caring for ICU and emergency patients."
      },
      {
        "question": "Is she involved in medical education?",
        "answer": "Yes, she is a National Boardrecognized teacher, examiner and thesis guide."
      }
    ]
  },
  {
    "slug": "dr-jaya-agarwal",
    "name": "Dr. Jaya Agarwal",
    "specialty": "Solid Organ Transplantation & HPB Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Jaya Agarwal.webp",
    "isTopDoctor": false,
    "position": "Assistant Professor  GI Surgery, Solid Organ Transplant & HPB Surgery",
    "degree": "MBBS | MS (General Surgery) | MCh (GI Surgery & Solid Organ Transplant) | FALS (Colorectal) | Fellowship in HPB Surgery | Fellowship in Liver Transplant & Organ Retrieval",
    "about": "Dr. Jaya Agarwal is an accomplished Hepato-Pancreato-Biliary (HPB) and Solid Organ Transplant surgeon with advanced expertise in complex GI surgeries, liver transplant, pancreas transplant and robotic HPB procedures. A Gold Medalist in MS and MCh, she has trained at premier national centers including PGIMER Chandigarh, GB Pant Institute New Delhi and Amrita Institute of Medical Sciences, Kochi. She has extensive hands-on experience in managing high-risk HPB cancers, advanced laparoscopic and robotic surgeries, and both living and deceased donor liver transplant surgeries. Her dedication to research has earned her multiple national and international awards. She holds advanced fellowships in colorectal and HPB surgery and is recognized for her precision, surgical finesse and strong academic contributions.",
    "medicalProblems": [
      {
        "title": "Liver Diseases & Liver Cancer",
        "description": "Comprehensive surgical care for liver tumors, cirrhosis and complex hepatobiliary conditions."
      },
      {
        "title": "Gallbladder Disorders",
        "description": "Management of gallstones, gallbladder cancer and biliary tract diseases."
      },
      {
        "title": "Pancreatic Diseases",
        "description": "Surgery for pancreatic cancer, pancreatitis and benign pancreatic conditions."
      },
      {
        "title": "Organ Failure Conditions",
        "description": "Evaluation for liver, pancreas and small bowel transplantation."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplant Surgery",
        "description": "Living and deceased donor liver transplant procedures."
      },
      {
        "title": "Robotic HPB Surgery",
        "description": "Minimally invasive robotic surgery for liver, pancreas and GI cancers."
      },
      {
        "title": "Gallbladder & Bile Duct Surgery",
        "description": "Advanced surgery for gallbladder cancer and bile duct diseases."
      },
      {
        "title": "Pancreas & Small Bowel Transplant",
        "description": "Complex transplant procedures for advanced organ failure."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Jaya perform liver transplants?",
        "answer": "Yes, she specializes in both living and deceased donor liver transplantation."
      },
      {
        "question": "Does she offer robotic HPB surgery?",
        "answer": "Yes, she performs robotic surgeries for GI and HPB conditions."
      },
      {
        "question": "Is she experienced with pancreatic and bile duct surgeries?",
        "answer": "Yes, she has extensive expertise in pancreatic, biliary and hepatobiliary surgeries."
      }
    ]
  },
  {
    "slug": "dr-jayadatta-pawar",
    "name": "Dr. Jayadatta Pawar",
    "specialty": "General Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Jayadatta Pawar.webp",
    "isTopDoctor": false,
    "position": "Consultant & Assistant Professor  General Surgery",
    "degree": "MBBS | MS (General Surgery) | FNB (Laparoscopic & Robotic Surgery) | FALS (Bariatric Surgery) | FCRS (Colorectal Surgery, Hong Kong)",
    "about": "Dr. Jayadatta Pawar is a highly skilled and technologically advanced General & Minimal Access Surgeon specializing in laparoscopic, robotic, bariatric and colorectal surgeries. Trained at leading institutions such as GB Pant Hospital, Sir Ganga Ram Hospital and GEM, Coimbatore, he has also undergone advanced international training in colorectal and bariatric surgery in Hong Kong. His expertise includes complex hernia surgeries, abdominal wall reconstruction, weight-loss procedures, gallbladder surgery and robotic interventions. Dr. Pawar is academically active with multiple book chapters, international orations (Vietnam, Rome) and research contributions. Known for his precision-driven surgical approach, he strongly believes in combining modern technology with empathy-driven patient care.",
    "medicalProblems": [
      {
        "title": "Gallbladder Stones",
        "description": "Advanced laparoscopic and robotic removal of gallbladder stones."
      },
      {
        "title": "Hernia & Abdominal Wall Defects",
        "description": "Management of simple to complex hernias with reconstruction techniques."
      },
      {
        "title": "Colorectal Disorders",
        "description": "Surgical management of colon, rectal conditions and anorectal diseases."
      },
      {
        "title": "Obesity & Metabolic Issues",
        "description": "Weight-loss and bariatric surgery for obesity and related disorders."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive surgery for gallbladder, hernia, colorectal and upper GI disorders."
      },
      {
        "title": "Robotic Surgery",
        "description": "Precision surgery for complex abdominal and colorectal conditions."
      },
      {
        "title": "Bariatric Surgery",
        "description": "Weight-loss procedures including sleeve gastrectomy and gastric bypass."
      },
      {
        "title": "Colorectal Surgery",
        "description": "Surgical management of fistula, hemorrhoids, polyps, tumors and colorectal diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Pawar perform laparoscopic hernia repairs?",
        "answer": "Yes, he specializes in laparoscopic and robotic hernia and abdominal wall reconstruction surgeries."
      },
      {
        "question": "Does he perform bariatric/weight-loss surgery?",
        "answer": "Yes, he is trained and certified in bariatric surgery including advanced FALS fellowship."
      },
      {
        "question": "Has he received international training?",
        "answer": "Yes, he completed specialized colorectal and bariatric surgical training in Hong Kong and has spoken at global conferences."
      }
    ]
  },
  {
    "slug": "dr-krishnanunni-nair",
    "name": "Dr. Krishnanunni Nair",
    "specialty": "Solid Organ Transplantation & HPB Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Krishnanunni Nair.webp",
    "isTopDoctor": false,
    "position": "Associate Professor  Solid Organ Transplant & HPB Surgery",
    "degree": "MBBS | MS (General Surgery) | MCh (Surgical Gastroenterology) | FMAS",
    "about": "Dr. Krishnanunni Nair is an accomplished HPB and Solid Organ Transplant surgeon with over a decade of experience in liver, pancreas and intestinal transplantation. Trained entirely at Amrita Institute of Medical Sciences, Kochi, he has been an integral part of pioneering robotic donor hepatectomy development in India. Since 2012, he has contributed significantly to the advancement of HPB surgeries and robotic GI procedures. He has also completed international transplantation rotations at UCLA and UCSF under globally renowned transplant surgeons. A prolific academician, he has multiple prestigious international publications and is an active member of global transplant and HPB societies. He is passionate about making transplantation and robotic surgery accessible to more patients across India.",
    "medicalProblems": [
      {
        "title": "Liver Failure & Liver Cancer",
        "description": "Evaluation and treatment planning for liver transplant and complex liver resections."
      },
      {
        "title": "Pancreatic Diseases",
        "description": "Management of pancreatic tumors, chronic pancreatitis and resection surgeries."
      },
      {
        "title": "Biliary Disorders",
        "description": "Treatment of complex bile duct injuries, strictures and cholangiocarcinoma."
      },
      {
        "title": "Intestinal Failure",
        "description": "Assessment and surgical management including intestinal transplant."
      }
    ],
    "procedures": [
      {
        "title": "Liver Transplantation",
        "description": "Living and deceased donor liver transplantation."
      },
      {
        "title": "Robotic Donor Hepatectomy",
        "description": "Advanced robotic liver donor surgery developed at Amrita."
      },
      {
        "title": "Pancreatic Transplantation",
        "description": "Transplant and surgical treatment for pancreatic failure."
      },
      {
        "title": "Robotic HPB Surgery",
        "description": "Minimally invasive robotic liver, pancreas and biliary surgeries."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Krishnanunni perform robotic donor hepatectomy?",
        "answer": "Yes, he has been directly involved in developing and performing robotic donor hepatectomy since its inception at Amrita."
      },
      {
        "question": "Does he manage pancreatic and intestinal transplants?",
        "answer": "Yes, he has extensive experience in pancreas and intestinal transplantation."
      },
      {
        "question": "Has he trained internationally?",
        "answer": "Yes, he completed advanced transplant rotations at UCLA and UCSF in the USA."
      }
    ]
  },
  {
    "slug": "dr-kunal-raj-gandhi",
    "name": "Dr. Kunal Raj Gandhi",
    "specialty": "Nephrology & Kidney Transplantation",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Kunal Raj Gandhi.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Assistant Professor  Nephrology",
    "degree": "MBBS | MD (General Medicine) | DM (Nephrology)",
    "about": "Dr. Kunal Raj Gandhi is an experienced Nephrologist with extensive expertise in kidney transplantation, interventional nephrology and management of complex renal disorders. He completed his DM in Nephrology from the prestigious Sawai Man Singh Medical College, Jaipur. He has successfully managed a wide spectrum of kidney transplant cases, including high-risk and ABO-incompatible transplants. With more than 1000 interventional nephrology procedures such as renal biopsies, permacath insertions and dialysis catheter placements, Dr. Gandhi is widely recognized for his precision and technical skill. He has been part of major clinical research trials and published over 20 scientific papers in national and international journals.",
    "medicalProblems": [
      {
        "title": "Chronic Kidney Disease (CKD)",
        "description": "Comprehensive diagnosis and long-term management of CKD."
      },
      {
        "title": "Acute Kidney Injury (AKI)",
        "description": "Emergency management of sudden kidney failure."
      },
      {
        "title": "Kidney Transplant Conditions",
        "description": "Evaluation of donors and recipients including high-risk transplants."
      },
      {
        "title": "Dialysis-Related Issues",
        "description": "Management of hemodialysis, peritoneal dialysis and CRRT complications."
      }
    ],
    "procedures": [
      {
        "title": "Renal Biopsy",
        "description": "Ultrasound-guided kidney biopsy for accurate diagnosis."
      },
      {
        "title": "Vascular Access Procedures",
        "description": "Placement of temporary and tunneled dialysis catheters including permacath."
      },
      {
        "title": "Kidney Transplantation",
        "description": "ABO-incompatible, deceased donor and high-risk kidney transplants."
      },
      {
        "title": "Dialysis Therapies",
        "description": "CRRT, HDF and peritoneal dialysis for critically ill patients."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Gandhi perform kidney transplant procedures?",
        "answer": "Yes, he is experienced in all forms of kidney transplant including high-risk and ABO-incompatible transplants."
      },
      {
        "question": "Is he trained in interventional nephrology?",
        "answer": "Yes, he has performed over 1000 interventional nephrology procedures."
      },
      {
        "question": "Does he manage dialysis therapies?",
        "answer": "Yes, he is proficient in CRRT, HDF, peritoneal dialysis and transplant-related renal care."
      }
    ]
  },
  {
    "slug": "dr-manav-suryavanshi",
    "name": "Dr. Manav Suryavanshi",
    "specialty": "Urology, Uro-Oncology & Robotic Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "18+ years",
    "image": "Dr. Manav Suryavanshi.webp",
    "isTopDoctor": true,
    "position": "Senior Consultant & Head  Urology | Program Head  Uro-Oncology & Robotic Surgery",
    "degree": "MBBS | MS | MCh (Urology, Gold Medalist) | Robotic Surgery Fellowship (Belgium)",
    "about": "Dr. Manav Suryavanshi is a highly accomplished Uro-Oncologist and one of India\u2019s leading robotic urology surgeons with over 18 years of expertise. A Gold Medalist in MCh Urology, he was previously Director of Uro-Oncology & Robotic Surgery at Medanta, where he established one of the first successful robotic surgery programs in the country. He has performed more than 3000 robotic and laparoscopic surgeries for prostate, kidney, bladder, testicular and adrenal disorders. Dr. Manav has over 20 indexed publications, more than 100 video presentations, and 50 invited lectures to his credit. He is widely recognized for his advanced skills in robotic cancer surgery, minimally invasive procedures, and complex urological oncology.",
    "medicalProblems": [
      {
        "title": "Prostate Cancer",
        "description": "Advanced evaluation and robotic radical prostatectomy."
      },
      {
        "title": "Kidney Tumors",
        "description": "Management of small to advanced renal masses including IVC thrombus cases."
      },
      {
        "title": "Bladder Cancer",
        "description": "Robotic radical cystectomy with neobladder/ileal conduit reconstruction."
      },
      {
        "title": "Testicular & Penile Cancers",
        "description": "Expertise in RPLND, orchiectomy and penile cancer surgery."
      }
    ],
    "procedures": [
      {
        "title": "Robotic Prostatectomy (RARP)",
        "description": "Precision robotic surgery for prostate cancer."
      },
      {
        "title": "Robotic Nephrectomy (RPN/RN)",
        "description": "Partial and radical nephrectomy using robotic techniques."
      },
      {
        "title": "Robotic Cystectomy",
        "description": "Bladder removal with urinary reconstruction."
      },
      {
        "title": "RPLND & Inguinal LND",
        "description": "Advanced lymph node dissections for testicular and penile cancer."
      }
    ],
    "faqs": [
      {
        "question": "Has Dr. Manav performed robotic surgeries?",
        "answer": "Yes, he has performed over 3000 robotic and laparoscopic urological cancer surgeries."
      },
      {
        "question": "Does he specialize in prostate and kidney cancer?",
        "answer": "Yes, prostate, kidney, bladder, adrenal and testicular cancers are his core specialties."
      },
      {
        "question": "Has he won awards for his work?",
        "answer": "Yes, he has received multiple national awards including the Dr. Dipak L. Kothari Gold Medal."
      }
    ]
  },
  {
    "slug": "dr-maninder-dhaliwal",
    "name": "Dr. Maninder Singh Dhaliwal",
    "specialty": "Paediatric Intensive Care (PICU) & Paediatric Respiratory Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "18+ years",
    "image": "Dr. Maninder Dhaliwal.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Paediatric Critical Care & Respiratory Medicine",
    "degree": "MBBS | MD (Paediatrics) | Fellowship in Paediatric Critical Care (IAP-ISCCM) | Diploma in Allergy & Asthma",
    "about": "Dr. Maninder Singh Dhaliwal is a highly experienced Paediatric Intensive Care specialist with over 18 years of expertise in managing critically ill children. He completed his MBBS and MD in Paediatrics from KMC Manipal & Mangalore and later trained in Paediatric Critical Care at Sir Ganga Ram Hospital, New Delhi. He has led major PICU services at Medanta  The Medicity for more than a decade, handling complex cases including solid organ transplant ICU care, neuro-PICU cases, acute liver failure, refractory respiratory illness and advanced multi-organ support therapies such as ECMO, HFOV, CRRT and iNO. He is an accredited instructor with multiple national and international paediatric critical care training programs and has mentored numerous paediatric intensivists.",
    "medicalProblems": [
      {
        "title": "Severe Respiratory Illness",
        "description": "Management of asthma, chronic cough, non-resolving pneumonia and recurrent infections."
      },
      {
        "title": "Critical Paediatric Conditions",
        "description": "Sepsis, shock, multi-organ failure and acute liver failure."
      },
      {
        "title": "Paediatric Lung Disorders",
        "description": "Cystic fibrosis, bronchiectasis and interstitial lung diseases in children."
      },
      {
        "title": "Complex PICU Cases",
        "description": "Neuro-PICU cases, BMT and transplant ICU care."
      }
    ],
    "procedures": [
      {
        "title": "Paediatric Bronchoscopy",
        "description": "Diagnostic and therapeutic bronchoscopy in children."
      },
      {
        "title": "Paediatric Lung Function Tests",
        "description": "Assessment of respiratory physiology in infants and children."
      },
      {
        "title": "Advanced PICU Therapies",
        "description": "ECMO, HFOV, SLED, CRRT, iNO and long-term ventilation support."
      },
      {
        "title": "Allergy & Asthma Management",
        "description": "Evaluation and treatment for childhood asthma and allergy disorders."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Dhaliwal manage complex PICU cases?",
        "answer": "Yes, he has more than a decade of experience handling transplant ICU, neuro-PICU and multi-organ failure cases."
      },
      {
        "question": "Does he perform paediatric bronchoscopy?",
        "answer": "Yes, he is trained and experienced in paediatric diagnostic and therapeutic bronchoscopy."
      },
      {
        "question": "Is he experienced in advanced respiratory support?",
        "answer": "Yes, he has expertise in ECMO, HFOV, CRRT and advanced ventilatory management."
      }
    ]
  },
  {
    "slug": "dr-mansi-kumar",
    "name": "Dr. Mansi Kumar",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "13+ years",
    "image": "Dr. Mansi Kumar.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Associate Professor  Obstetrics & Gynaecology",
    "degree": "MBBS | MS (Obstetrics & Gynaecology) | FMAS | PGDHM",
    "about": "Dr. Mansi Kumar is a highly experienced Senior Consultant in Obstetrics & Gynaecology with over 13 years of clinical expertise and more than a decade of teaching experience. She is recognized for her work in high-risk pregnancy management, infertility care, minimally invasive gynaecological surgery, and laparoscopic procedures. With strong academic involvement, Dr. Mansi has contributed to medical research, conferences and clinical training programs. Her approach combines evidence-based care, compassionate guidance and advanced surgical skills.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancy",
        "description": "Specialized care for complex and high-risk obstetric conditions."
      },
      {
        "title": "Infertility Issues",
        "description": "Complete evaluation and management of female infertility."
      },
      {
        "title": "Menstrual & Hormonal Disorders",
        "description": "Management of PCOS, irregular periods and hormonal disturbances."
      },
      {
        "title": "Uterine & Ovarian Disorders",
        "description": "Evaluation of fibroids, cysts, endometriosis and pelvic pain."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive procedures for gynaecological conditions."
      },
      {
        "title": "Obstetric & Gynaec Procedures",
        "description": "Normal deliveries, C-section and routine surgical care."
      },
      {
        "title": "IUD & Contraceptive Procedures",
        "description": "Expertise in post-placental IUD insertion and contraceptive surgery."
      },
      {
        "title": "Infertility Treatment",
        "description": "Advanced evaluation and treatment for reproductive issues."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mansi handle high-risk pregnancies?",
        "answer": "Yes, she specializes in the management of high-risk and complex pregnancies."
      },
      {
        "question": "Does she perform laparoscopic surgeries?",
        "answer": "Yes, she is trained in minimally invasive (FMAS) laparoscopic gynecologic procedures."
      },
      {
        "question": "Does she treat infertility?",
        "answer": "Yes, she offers comprehensive infertility evaluation and treatment."
      }
    ]
  },
  {
    "slug": "dr-meenakshi-jain",
    "name": "Dr. Meenakshi Jain",
    "specialty": "Psychiatry",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Meenakshi Jain.webp",
    "isTopDoctor": false,
    "position": "Assistant Professor  Psychiatry",
    "degree": "MBBS | MD (Psychiatry)",
    "about": "Dr. Meenakshi Jain is a renowned Psychiatrist, Psychotherapist, Sexologist and De-addiction Specialist with strong clinical, academic and therapeutic expertise. A gold medalist in both MBBS and MD, she has worked at the prestigious Institute of Human Behaviour and Allied Sciences (IHBAS), New Delhi, serving in OPD, IPD and specialized psychiatry boards. She has extensive experience across Child & Adolescent Psychiatry, Reproductive Psychiatry, Adult Psychiatry, Geriatric Psychiatry and Dual Diagnosis. She is skilled in advanced psychiatric procedures such as Modified Electroconvulsive Therapy (MECT), Repetitive Transcranial Magnetic Stimulation (rTMS) and Biofeedback Therapy. Her treatment philosophy emphasizes empathy, awareness and holistic mental well-being.",
    "medicalProblems": [
      {
        "title": "Depression & Anxiety Disorders",
        "description": "Comprehensive diagnosis and treatment for mood and anxiety disorders."
      },
      {
        "title": "Addiction & Substance Abuse",
        "description": "Therapy and medical management for addiction and dependency."
      },
      {
        "title": "Child & Adolescent Psychiatry",
        "description": "Behavioral issues, developmental concerns and emotional disorders."
      },
      {
        "title": "Sexual Medicine",
        "description": "Management of sexual dysfunction and psychosexual disorders."
      }
    ],
    "procedures": [
      {
        "title": "MECT (Modified Electroconvulsive Therapy)",
        "description": "Safe and effective treatment for severe psychiatric disorders."
      },
      {
        "title": "Repetitive TMS (rTMS)",
        "description": "Non-invasive brain stimulation therapy for depression and anxiety."
      },
      {
        "title": "Psychotherapy & Counselling",
        "description": "Evidence-based therapy approaches for behavioral and emotional health."
      },
      {
        "title": "Biofeedback Therapy",
        "description": "Advanced mindbody therapy for stress and psychosomatic disorders."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Meenakshi treat adolescents and children?",
        "answer": "Yes, she is highly experienced in child and adolescent psychiatry."
      },
      {
        "question": "Does she offer treatment for addiction?",
        "answer": "Yes, she specializes in de-addiction and dual-diagnosis management."
      },
      {
        "question": "Does she perform MECT and rTMS?",
        "answer": "Yes, she is trained in advanced psychiatric procedures including MECT and rTMS."
      }
    ]
  },
  {
    "slug": "dr-megha-jain",
    "name": "Dr. Megha Jain",
    "specialty": "Pediatric Dentistry",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "13+ years",
    "image": "Dr. Megha Jain.webp",
    "isTopDoctor": false,
    "position": "Associate Professor  Pediatric Dentistry",
    "degree": "BDS | MDS (Pedodontics & Preventive Dentistry) | FAGE",
    "about": "Dr. Megha Jain is an accomplished Pediatric Dental Surgeon with over 13 years of rich clinical and academic experience. A gold medalist in Pediatric and Preventive Dentistry from Manipal University, she has worked across several major dental centres and medical institutes in Mumbai, Hyderabad, Ahmedabad and Jaipur. Her expertise includes early childhood caries management, full mouth rehabilitation for children, preventive dental care and behavioral management techniques. She is an active researcher with multiple national and international publications. Her approach focuses on creating a child-friendly, comforting dental experience while ensuring the highest standards of treatment.",
    "medicalProblems": [
      {
        "title": "Early Childhood Caries",
        "description": "Specialized management of nursing bottle caries and rampant dental decay."
      },
      {
        "title": "Orthodontic Issues in Children",
        "description": "Preventive and interceptive orthodontic care for developing dentition."
      },
      {
        "title": "Dental Trauma & Cavities",
        "description": "Treatment for fractured teeth, deep cavities and emergency pediatric dental issues."
      },
      {
        "title": "Oral Habits & Development Issues",
        "description": "Management of thumb-sucking, tongue-thrusting and other behavioral oral issues."
      }
    ],
    "procedures": [
      {
        "title": "Full Mouth Rehabilitation",
        "description": "Comprehensive treatment for severe dental decay in children and adolescents."
      },
      {
        "title": "Preventive Dentistry",
        "description": "Fluoride therapy, sealants and preventive treatments for children."
      },
      {
        "title": "Pediatric Restorative Dentistry",
        "description": "Fillings, crowns and space maintainers for developing teeth."
      },
      {
        "title": "Behavioral Management",
        "description": "Child-friendly techniques for stress-free dental care."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Megha treat very young children?",
        "answer": "Yes, she specializes in infant and toddler dental care including early childhood caries."
      },
      {
        "question": "Does she perform full mouth rehabilitation?",
        "answer": "Yes, she has extensive experience in managing severe dental decay requiring comprehensive care."
      },
      {
        "question": "Is she experienced in preventive dental care?",
        "answer": "Yes, preventive and interceptive pediatric dentistry are key areas of her expertise."
      }
    ]
  },
  {
    "slug": "dr-mohit-sharma",
    "name": "Dr. Mohit Sharma",
    "specialty": "Internal Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Mohit Sharma.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Internal Medicine",
    "degree": "MBBS | MRCP (UK)  Internal Medicine | MRCP (UK)  Acute Medicine | PgCert Medical Leadership (UK) | PRINCE2 Certification (UK)",
    "about": "Dr. Mohit Sharma is a distinguished physician known for his excellence in holistic, evidence-based Internal Medicine. With significant clinical experience in both India and the UK, he is one of the few full-time practicing physicians with international credentials in medical leadership, ethics, healthcare quality, and patient communication. He has successfully treated numerous complex and multi-system disorders with a patient-centered, empathetic approach. Dr. Mohit is also an academic tutor for postgraduate doctors internationally and has presented his research and quality improvement work at global medical platforms. His unique blend of clinical expertise, leadership training, and human-centric care makes him a highly trusted Internal Medicine specialist.",
    "medicalProblems": [
      {
        "title": "Complex Multi-Organ Disorders",
        "description": "Diagnosis and management of systemic and chronic medical conditions."
      },
      {
        "title": "Geriatric Medicine",
        "description": "Comprehensive care for elderly patients with multiple comorbidities."
      },
      {
        "title": "Medical Emergencies",
        "description": "Expert management of acute and life-threatening medical conditions."
      },
      {
        "title": "Chronic Disease Management",
        "description": "Long-term care for diabetes, hypertension, thyroid disorders and metabolic conditions."
      }
    ],
    "procedures": [
      {
        "title": "Diagnostic Procedures",
        "description": "Performance of essential medical diagnostic tests and evaluations."
      },
      {
        "title": "Therapeutic Procedures",
        "description": "Administration of treatments including emergency interventions."
      },
      {
        "title": "Critical Care Management",
        "description": "Management of ICU-level medical cases requiring advanced support."
      },
      {
        "title": "Preventive & Lifestyle Medicine",
        "description": "Guidance for preventive care, wellness and long-term health optimization."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Mohit manage complex medical cases?",
        "answer": "Yes, he specializes in multi-organ and chronic complex medical conditions."
      },
      {
        "question": "Has he worked internationally?",
        "answer": "Yes, he has extensive training and clinical exposure in the UK with MRCP and leadership fellowships."
      },
      {
        "question": "Does he handle emergencies?",
        "answer": "Yes, he is highly experienced in acute internal medicine and medical emergency care."
      }
    ]
  },
  {
    "slug": "dr-moushumi-suryavanshi",
    "name": "Dr. Moushumi Suryavanshi",
    "specialty": "Molecular Biology & Cytogenetics",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "22+ years",
    "image": "Dr. Moushumi Suryavanshi.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Head  Molecular Biology and Cytogenetics",
    "degree": "PhD | MD (Pathology) | FRCPath (Molecular Pathology) | Masters in Molecular Oncology",
    "about": "Dr. Moushumi Suryavanshi is one of India's most accomplished molecular biologists and clinical scientists, with over 22 years of leadership in molecular diagnostics, personalized cancer genomics, and translational research. She has pioneered liquid biopsy and next-generation sequencing applications in India, establishing advanced molecular laboratories at national-level institutions. She serves in national task forces (ICMR), is an NABL assessor, and plays a global role as internal assessor for EMQN. She has conducted molecular tumor boards, trained numerous postgraduates, and contributed extensively to cancer genomics research. Her expertise spans NGS, digital PCR, ctDNA, molecular biomarkers, hereditary cancer diagnostics, and precision oncology.",
    "medicalProblems": [
      {
        "title": "Hereditary Cancer Syndromes",
        "description": "Genetic risk evaluation and molecular diagnosis for hereditary cancers."
      },
      {
        "title": "Oncology Biomarkers",
        "description": "Molecular profiling for diagnosis, prognosis and therapy selection in cancers."
      },
      {
        "title": "Immunological Biomarkers",
        "description": "Advanced biomarker testing for immunotherapy and targeted therapy guidance."
      },
      {
        "title": "Early Cancer Screening",
        "description": "High-precision molecular testing for early detection of various cancers."
      }
    ],
    "procedures": [
      {
        "title": "Next Generation Sequencing (NGS)",
        "description": "Comprehensive genomic profiling for cancer and hereditary conditions."
      },
      {
        "title": "Liquid Biopsy",
        "description": "ctDNA-based non-invasive testing for cancer screening and monitoring."
      },
      {
        "title": "Digital PCR & Sanger Sequencing",
        "description": "High-sensitivity molecular diagnostic technologies."
      },
      {
        "title": "FISH & Cytogenetic Testing",
        "description": "Advanced chromosomal studies for oncology and genetic disorders."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Moushumi specialize in cancer genomics?",
        "answer": "Yes, precision oncology and genomic profiling are her core areas of expertise."
      },
      {
        "question": "Does she perform hereditary cancer testing?",
        "answer": "Yes, she provides complete evaluation, testing and counseling for hereditary cancers."
      },
      {
        "question": "Is she experienced in NGS and liquid biopsy?",
        "answer": "Yes, she is a pioneer in India in introducing NGS and liquid biopsy into clinical diagnostics."
      }
    ]
  },
  {
    "slug": "dr-namrata-seth",
    "name": "Dr. Namrata Seth",
    "specialty": "Obstetrics & Gynaecology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "16+ years",
    "image": "Dr. Namrata Seth.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Assistant Professor  Obstetrics & Gynaecology",
    "degree": "MBBS | DGO | DNB | Fellowship in Laparoscopy (Kiel, Germany) | Fellowship in Infertility (ICOG India) | Diploma in Cosmetic Gynecology | Fellowship in Laparoscopy",
    "about": "Dr. Namrata Seth is a highly experienced laparoscopic surgeon, infertility specialist and obstetrician with over 16 years of clinical expertise. She has trained under globally renowned surgeons and has served at leading institutions including Holy Family Hospital and Asian Hospital. A distinguished academic performer, she was awarded 15 gold medals during her medical education. She has contributed extensively to national and international research, holds multiple publications, and is a lifetime member of several esteemed medical societies. She is known for her patient-centred, evidence-based and technology-driven approach.",
    "medicalProblems": [
      {
        "title": "Infertility",
        "description": "Evaluation and treatment with advanced fertility techniques."
      },
      {
        "title": "High-Risk Pregnancy",
        "description": "Management of complex and high-risk obstetric cases."
      },
      {
        "title": "Gynaecological Disorders",
        "description": "Treatment for menstrual irregularities, fibroids, cysts and reproductive concerns."
      }
    ],
    "procedures": [
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive procedures for gynaecological conditions."
      },
      {
        "title": "Infertility Procedures",
        "description": "Advanced fertility care including ovulation induction and reproductive procedures."
      },
      {
        "title": "Cosmetic Gynaecology",
        "description": "Aesthetic and functional gynecological enhancement procedures."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Namrata specialize in infertility?",
        "answer": "Yes, she has specialized training in infertility management from ICOG India."
      },
      {
        "question": "Is she trained in laparoscopic surgery?",
        "answer": "Yes, she has completed advanced laparoscopic training from Kiel, Germany."
      },
      {
        "question": "Does she manage high-risk pregnancies?",
        "answer": "Yes, she has extensive experience in high-risk obstetrics."
      }
    ]
  },
  {
    "slug": "dr-pooja-khanna",
    "name": "Dr. Pooja Khanna",
    "specialty": "General Paediatrics",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Pooja Khanna.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Assistant Professor  Paediatrics",
    "degree": "MBBS | DNB (Paediatrics)",
    "about": "Dr. Pooja Khanna is an experienced paediatrician with strong expertise in growth, nutrition, immunization and overall development of children. She completed her MBBS from Kasturba Medical College, Manipal, and her DNB in Paediatrics from Chacha Nehru Bal Chikitsalaya, New Delhi, a leading paediatric center affiliated with Maulana Azad Medical College. She has worked at several reputed hospitals including Max BLK Hospital, Tarawati Medical Centre and various pediatric facilities across Delhi NCR. Her care approach focuses on preventive paediatrics, early developmental assessments and holistic child health.",
    "medicalProblems": [
      {
        "title": "Growth & Development Issues",
        "description": "Monitoring and management of growth delays and developmental concerns."
      },
      {
        "title": "Nutrition Problems",
        "description": "Assessment and guidance for nutritional deficiencies and dietary needs."
      },
      {
        "title": "Childhood Infections",
        "description": "Management of common and recurrent infections."
      },
      {
        "title": "Immunization",
        "description": "Complete vaccination guidance for infants, children and adolescents."
      }
    ],
    "procedures": [
      {
        "title": "Routine Vaccinations",
        "description": "All childhood immunizations as per national and international schedules."
      },
      {
        "title": "Developmental Screening",
        "description": "Early detection of developmental delays and behavioural concerns."
      },
      {
        "title": "Pediatric Clinical Assessments",
        "description": "Evaluation of acute and chronic pediatric illnesses."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Pooja handle childhood growth concerns?",
        "answer": "Yes, she specializes in growth, nutrition and child development."
      },
      {
        "question": "Does she provide immunization services?",
        "answer": "Yes, she offers complete vaccination services for children and adolescents."
      },
      {
        "question": "Is she experienced with newborn and adolescent care?",
        "answer": "Yes, she has extensive experience across all age groups from infants to teens."
      }
    ]
  },
  {
    "slug": "dr-reema-bhatt",
    "name": "Dr. Reema Bhatt",
    "specialty": "Fetal Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "23+ years",
    "image": "Dr. Reema Bhatt.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant & Head  Fetal Medicine",
    "degree": "MBBS | MS | DNB | FICOG | MNAMS | Fetal Medicine (FMF-UK Accredited)",
    "about": "Dr. Reema Bhatt is an accomplished fetal medicine specialist with over 23 years of experience, including a distinguished career in the Indian Armed Forces. She is renowned for her expertise in invasive fetal procedures, fetal therapy and fetal anomaly evaluation. Deeply committed to safeguarding the health of the mother and the unborn child, she combines clinical precision with compassionate counselling. Her extensive credentials include FMF-UK accreditation and multiple national awards, including recognition from the President of India for excellence in clinical service.",
    "medicalProblems": [
      {
        "title": "High-Risk Pregnancies",
        "description": "Evaluation and management of high-risk fetal and maternal conditions."
      },
      {
        "title": "Fetal Anomalies",
        "description": "Diagnosis and monitoring of fetal structural and genetic abnormalities."
      },
      {
        "title": "Genetic Counselling",
        "description": "Risk assessment and counselling for hereditary and chromosomal disorders."
      },
      {
        "title": "Fetal Growth Problems",
        "description": "Assessment and management of fetal growth restriction and related issues."
      }
    ],
    "procedures": [
      {
        "title": "Invasive Fetal Therapy",
        "description": "Procedures including fetal transfusion, shunt placement and other interventions."
      },
      {
        "title": "Fetal Echocardiography",
        "description": "Detailed ultrasound evaluation of fetal heart structure and function."
      },
      {
        "title": "Fetal Neurosonography",
        "description": "Advanced ultrasound for fetal brain development assessment."
      },
      {
        "title": "Prenatal Screening & Diagnostics",
        "description": "NT scan, anomaly scan, targeted imaging and genetic testing guidance."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Reema perform invasive fetal procedures?",
        "answer": "Yes, she specializes in invasive fetal therapy and fetal interventions."
      },
      {
        "question": "Is she trained in fetal echo?",
        "answer": "Yes, she has advanced expertise in fetal echocardiography and fetal neurosonology."
      },
      {
        "question": "Does she provide genetic counselling?",
        "answer": "Yes, she offers complete genetic counselling for high-risk and complex pregnancies."
      }
    ]
  },
  {
    "slug": "dr-rishabh-kumar",
    "name": "Dr. Rishabh Kumar",
    "specialty": "Radiation Oncology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Rishabh Kumar.webp",
    "isTopDoctor": false,
    "position": "Senior Consultant  Radiation Oncology",
    "degree": "MBBS | MD (Radiation Oncology) | ESTRO Fellow (Erasmus MC, Netherlands)",
    "about": "Dr. Rishabh Kumar is an advanced radiation oncologist with specialised expertise in high-precision cancer treatment techniques including SRS, SBRT, IGRT, proton therapy and robotic brachytherapy. He has trained at globally reputed centres such as AIIMS Delhi, SGPGI Lucknow, ILBS Delhi, and Erasmus MC Netherlands. During his early career, he contributed to major innovations such as commissioning India\u2019s second-largest MRI-guided brachytherapy program and performing the world\u2019s first robotic liver HDR brachytherapy. His research has received national and international recognition, including the MC Pant Gold Medal and Best Young Radiation Oncologist Award. He focuses on personalised, technology-driven, multidisciplinary cancer care.",
    "medicalProblems": [
      {
        "title": "Brain & CNS Cancers",
        "description": "Advanced stereotactic and precision radiation therapies for brain and spinal tumors."
      },
      {
        "title": "Head & Neck Cancers",
        "description": "High-precision radiotherapy to preserve organ function and improve outcomes."
      },
      {
        "title": "Breast & GI Cancers",
        "description": "Comprehensive radiotherapy for breast, gastrointestinal and hepatobiliary cancers."
      },
      {
        "title": "Gynaecological Cancers",
        "description": "Expertise in brachytherapy, image-guided radiation and advanced pelvic treatments."
      }
    ],
    "procedures": [
      {
        "title": "Stereotactic Radiosurgery (SRS)",
        "description": "Ultra-precise high-dose radiation for brain and spine tumors."
      },
      {
        "title": "Stereotactic Body Radiotherapy (SBRT)",
        "description": "Targeted high-dose treatment for liver, lung, spine and prostate cancers."
      },
      {
        "title": "IGRT & IMRT",
        "description": "Image-guided and intensity-modulated radiation therapy for accurate dosing."
      },
      {
        "title": "Robotic & MRI-guided Brachytherapy",
        "description": "Minimally invasive, high-precision internal radiation for multiple cancers."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Rishabh specialize in stereotactic treatments like SRS and SBRT?",
        "answer": "Yes, he has advanced training and extensive experience in SRS and SBRT."
      },
      {
        "question": "Has he worked at premier institutes like AIIMS?",
        "answer": "Yes, he has completed senior residencies at AIIMS Delhi, ILBS Delhi and SGPGI Lucknow."
      },
      {
        "question": "Does he offer robotic brachytherapy?",
        "answer": "Yes, he is trained in robotic and MRI-guided brachytherapy for liver, cervical, prostate and other cancers."
      }
    ]
  },
  {
    "slug": "dr-ruchi-gaba",
    "name": "Dr. Ruchi Gaba",
    "specialty": "General Paediatrics",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Ruchi Gaba.webp",
    "isTopDoctor": false,
    "position": "Assistant Professor  Paediatrics",
    "degree": "MBBS | MD (Paediatrics)",
    "about": "Dr. Ruchi Gaba is an experienced pediatrician with comprehensive training from the prestigious Sawai Man Singh (SMS) Medical College and JK Lon Hospital, Jaipur\u2014one of India\u2019s largest Pediatric centers. She has worked across top government, corporate and research institutions including Hindu Rao Hospital and AIIMS New Delhi, where she contributed to research on cystic fibrosis, asthma, tuberculosis and infectious diseases. She is known for her expertise in childhood nutrition, growth and development, immunization and management of pediatric infections.",
    "medicalProblems": [
      {
        "title": "Nutritional Disorders",
        "description": "Evaluation and management of malnutrition, obesity and micronutrient deficiencies."
      },
      {
        "title": "Growth & Development Concerns",
        "description": "Monitoring developmental milestones and addressing developmental delays."
      },
      {
        "title": "Pediatric Infections",
        "description": "Diagnosis and treatment of acute and chronic infectious diseases in children."
      },
      {
        "title": "Respiratory & Allergy Issues",
        "description": "Management of asthma, allergic disorders and recurrent respiratory symptoms."
      }
    ],
    "procedures": [
      {
        "title": "Immunization Services",
        "description": "Complete vaccination for infants, children and adolescents."
      },
      {
        "title": "Growth & Development Assessment",
        "description": "Developmental screening and monitoring of physical, cognitive and emotional milestones."
      },
      {
        "title": "Pediatric Clinical Evaluation",
        "description": "Assessment of acute illnesses, chronic conditions and infectious diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Ruchi specialize in child nutrition?",
        "answer": "Yes, she has extensive experience in managing nutritional disorders in children."
      },
      {
        "question": "Does she provide immunization services?",
        "answer": "Yes, she offers all national and optional vaccines for children."
      },
      {
        "question": "Has she worked at major pediatric institutions?",
        "answer": "Yes, her training includes SMS Medical College Jaipur, AIIMS New Delhi and multiple tertiary care hospitals."
      }
    ]
  },
  {
    "slug": "dr-rahul-katharia",
    "name": "Dr. Rahul Katharia",
    "specialty": "Transfusion Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "16+ years",
    "image": "Dr. Rahul Katharia.webp",
    "isTopDoctor": false,
    "position": "Professor & Head  Transfusion Medicine",
    "degree": "MBBS | MD (Transfusion Medicine)",
    "about": "Dr. Rahul Katharia is a highly accomplished Transfusion Medicine specialist with over 16 years of expertise in transfusion services, cellular therapy, apheresis medicine and transplant immunology. Trained at the prestigious SGPGI Lucknow, he has served as faculty at AIIMS Rishikesh and SGPGI, and has led major advancements in blood transfusion safety, apheresis, and donor management. A strong advocate of telemedicine, he has been awarded for pioneering innovative applications of telemedicine in apheresis. Dr. Katharia has received multiple national and international honors, including the Harold Gunson Fellowship and Young Investigator Award, and has over 30 high-impact research publications. He currently leads the Department of Transfusion Medicine at Amrita Hospital, Faridabad.",
    "medicalProblems": [
      {
        "title": "Apheresis-Related Conditions",
        "description": "Therapeutic plasma exchange, cytapheresis and immune-mediated disorders."
      },
      {
        "title": "Transfusion Reactions",
        "description": "Diagnosis, prevention and management of transfusion-related complications."
      },
      {
        "title": "Transplant Immunology",
        "description": "Immunohematological support for solid organ and stem cell transplants."
      },
      {
        "title": "Antenatal Serology",
        "description": "Evaluation and monitoring of maternal-fetal blood group incompatibility."
      }
    ],
    "procedures": [
      {
        "title": "Therapeutic Apheresis",
        "description": "Plasma exchange, leukapheresis, erythrocytapheresis and plateletpheresis."
      },
      {
        "title": "Cellular Therapy Support",
        "description": "Stem cell collection, processing and cellular manipulation."
      },
      {
        "title": "Advanced Immunohematology Testing",
        "description": "DAT, antibody titration, antigen typing and compatibility testing."
      },
      {
        "title": "Blood Component Therapy",
        "description": "Safe administration and monitoring of blood components."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Rahul specialize in therapeutic apheresis?",
        "answer": "Yes, he is highly experienced in all forms of therapeutic and donor apheresis."
      },
      {
        "question": "Has he worked at SGPGI and AIIMS?",
        "answer": "Yes, he has served in major academic roles at SGPGI Lucknow and AIIMS Rishikesh."
      },
      {
        "question": "Does he handle transplant immunology?",
        "answer": "Yes, he has extensive expertise in immunohematology for solid organ and stem cell transplantation."
      }
    ]
  },
  {
    "slug": "dr-swati-pabbi",
    "name": "Dr. Swati Pabbi",
    "specialty": "Transfusion Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Swati Pabbi.webp",
    "isTopDoctor": false,
    "position": "Consultant  Transfusion Medicine",
    "degree": "MBBS | MD (Pathology) | Fellowship in Apheresis & Cellular Therapy",
    "about": "Dr. Swati Pabbi is an experienced Transfusion Medicine specialist with strong expertise in therapeutic apheresis, stem cell harvests, immunoadsorption, and transplant immunology. She has worked at renowned institutions, including Medanta  The Medicity, and has trained at the prestigious Fred Hutchinson Cancer Research Center/Seattle Cancer Care Alliance (University of Washington), USA. With more than 25 national and international publications, she is an active researcher and reviewer for leading journals in transfusion and apheresis sciences. She is known for her patient-centric approach, deep technical proficiency and commitment to advancing indigenous research for better healthcare access.",
    "medicalProblems": [
      {
        "title": "Autoimmune Disorders",
        "description": "Treatment through plasmapheresis and immunoadsorption."
      },
      {
        "title": "Graft-Versus-Host Disease (GVHD)",
        "description": "Management using extracorporeal photopheresis and immunomodulatory therapies."
      },
      {
        "title": "Hematological Disorders",
        "description": "Supportive transfusion and cellular therapy for blood-related diseases."
      },
      {
        "title": "Transplant Immunology Issues",
        "description": "Evaluation and management of immunological complications in transplant patients."
      }
    ],
    "procedures": [
      {
        "title": "Plasmapheresis",
        "description": "Therapeutic plasma exchange for autoimmune and neurological disorders."
      },
      {
        "title": "Cascade Plasmapheresis",
        "description": "Selective removal of pathological plasma components."
      },
      {
        "title": "Stem Cell Harvests",
        "description": "Collection of peripheral blood stem cells for transplantation."
      },
      {
        "title": "Extracorporeal Photopheresis",
        "description": "Advanced therapy for GVHD and immune-mediated diseases."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Swati perform therapeutic apheresis?",
        "answer": "Yes, she specializes in all advanced apheresis techniques including plasmapheresis and immunoadsorption."
      },
      {
        "question": "Has she trained internationally?",
        "answer": "Yes, she completed a visiting fellowship in Apheresis & Cellular Therapy at the Fred Hutchinson Cancer Research Center, USA."
      },
      {
        "question": "Does she manage stem cell collections?",
        "answer": "Yes, she is highly experienced in stem cell harvest procedures for transplant patients."
      }
    ]
  },
  {
    "slug": "dr-puneet-dhar",
    "name": "Dr. Puneet Dhar",
    "specialty": "Digestive Diseases & Gastrointestinal Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "30+ years",
    "image": "Dr. Puneet Dhar.webp",
    "isTopDoctor": true,
    "position": "Senior Consultant & Chief Administrator  Surgical Services",
    "degree": "MBBS | MS (General Surgery) | MCh (Surgical Gastroenterology) | Fellowship (Transplant Surgery  Cambridge, UK)",
    "about": "Dr. Puneet Dhar is one of India\u2019s most respected and experienced Surgical Gastroenterologists with over 30 years of expertise in advanced GI surgery, HPB surgery, transplant surgery, and complex colorectal procedures. He received his super-specialty training (MCh) from the prestigious GB Pant Hospital, Delhi, and later trained in transplant surgery at Addenbrookes Hospital, Cambridge, UK. Dr. Dhar has led and established major GI surgery departments across India, including Amrita Kochi and AIIMS Rishikesh, where he served as Professor, Head, and Dean of Student Welfare. A prolific academician, author, and international speaker, he has held leadership roles in national surgical associations and is the President-elect of the Indian Chapter of the International HPB Association. His clinical expertise spans GI cancers, pancreatic and neuroendocrine tumors, advanced laparoscopic/robotic surgery, pouch surgeries, and surgical infections.",
    "medicalProblems": [
      {
        "title": "GI Cancers",
        "description": "Comprehensive management of stomach, colorectal, pancreatic and liver cancers."
      },
      {
        "title": "Pancreatic Disorders",
        "description": "Surgery for pancreatic tumors, pancreatitis, and neuroendocrine tumors."
      },
      {
        "title": "Complex Colorectal Diseases",
        "description": "Advanced pouch surgeries and reconstruction for complicated colorectal conditions."
      },
      {
        "title": "Biliary Disorders",
        "description": "Surgical management of bile duct diseases and reconstructions."
      }
    ],
    "procedures": [
      {
        "title": "GI Cancer Surgery",
        "description": "Advanced surgical procedures for gastrointestinal malignancies."
      },
      {
        "title": "Pancreatic Surgery",
        "description": "Surgery for pancreatic tumors and chronic pancreatitis."
      },
      {
        "title": "Laparoscopic Surgery",
        "description": "Minimally invasive surgeries for various GI conditions."
      },
      {
        "title": "Biliary Reconstruction",
        "description": "Complex reconstructions of bile ducts following injury or disease."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Puneet specialize in pancreatic surgery?",
        "answer": "Yes, he is highly experienced in advanced pancreatic and neuroendocrine tumor surgeries."
      },
      {
        "question": "Has he trained internationally?",
        "answer": "Yes, he completed a prestigious fellowship in Transplant Surgery at Cambridge University Hospitals, UK."
      },
      {
        "question": "Does he perform minimally invasive GI surgeries?",
        "answer": "Yes, he is an expert in advanced laparoscopic and minimally invasive surgery techniques."
      }
    ]
  },
  {
    "slug": "dr-sakshi-singh",
    "name": "Dr. Sakshi Singh",
    "specialty": "Internal Medicine",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "8+ years",
    "image": "Dr. Sakshi Singh.webp",
    "isTopDoctor": false,
    "position": "Consultant  Internal Medicine",
    "degree": "MBBS | MD (General Medicine)",
    "about": "Dr. Sakshi Singh is an accomplished Internal Medicine specialist with strong expertise in managing complex medical conditions, infectious diseases, critical care, and chronic disorders. She completed her medical education in Gujarat and subsequently gained experience across leading institutions including Fortis Escorts Hospital and QRG Central Hospital, Faridabad. She has served at ESIC Medical College & Hospital in both general medicine and intensive care units, providing frontline care during the COVID-19 pandemic. Dr. Sakshi has also contributed to research as a Co-Investigator in the CORBEVAX COVID-19 vaccine trial. Her approach emphasizes evidence-based care, preventive medicine and long-term patient wellbeing.",
    "medicalProblems": [
      {
        "title": "Chronic Medical Conditions",
        "description": "Management of diabetes, hypertension, thyroid disorders and multi-system chronic diseases."
      },
      {
        "title": "Infectious Diseases",
        "description": "Evaluation and treatment of viral, bacterial and systemic infections."
      },
      {
        "title": "Critical Illness",
        "description": "Medical stabilization and management of ICU-level acute conditions."
      },
      {
        "title": "Liver & Pregnancy-Related Disorders",
        "description": "Expertise in acute fatty liver of pregnancy and complex internal medicine issues."
      }
    ],
    "procedures": [
      {
        "title": "Diagnostic Evaluation",
        "description": "Complete medical workup for acute and chronic illnesses."
      },
      {
        "title": "Emergency Medical Management",
        "description": "Stabilization and treatment of acute medical emergencies."
      },
      {
        "title": "Critical Care Support",
        "description": "Management of critically ill patients including COVID and non-COVID ICU."
      },
      {
        "title": "Preventive Health Assessments",
        "description": "Lifestyle and risk-based screening for chronic disease prevention."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sakshi manage complex medical cases?",
        "answer": "Yes, she specializes in the management of multi-system and chronic medical conditions."
      },
      {
        "question": "Was she involved in COVID care?",
        "answer": "Yes, she worked extensively in critical care and COVID ICU settings and participated in vaccine trials."
      },
      {
        "question": "Does she treat infectious diseases?",
        "answer": "Yes, she has experience managing a wide range of infectious and systemic illnesses."
      }
    ]
  },
  {
    "slug": "dr-shilpa-khullar-sood",
    "name": "Dr. Shilpa Khullar Sood",
    "specialty": "Dentistry (Prosthodontics, Implantology & Maxillofacial Prosthesis)",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "23+ years",
    "image": "Dr. Shilpa Khullar Sood.webp",
    "isTopDoctor": true,
    "position": "Head  Dentistry",
    "degree": "BDS | MDS (Prosthodontics & Maxillofacial Prosthesis) | Implantologist | FAGE | Fellowship in Orofacial Pain & Dental Sleep Medicine",
    "about": "Dr. Shilpa Khullar Sood is a highly accomplished Prosthodontist, Implantologist and Maxillofacial Prosthesis specialist with over 23 years of clinical experience and 14 years of academic expertise. A gold medalist from MAHE University, she has trained internationally at the American Academy of Implant Dentistry (Chicago), New York University College of Dentistry and Roseman University (USA). She specializes in advanced prosthodontics, full mouth rehabilitation, aesthetic dentistry, implant-supported prosthesis, occlusal rehabilitation, and dental sleep medicine. Dr. Shilpa is known for her precision-driven, aesthetic-focused and patient-centric dental care. She has worked with major dental institutions and has contributed to dental education, research and international training programs.",
    "medicalProblems": [
      {
        "title": "Tooth Loss & Missing Teeth",
        "description": "Implant-supported restorations, dentures, and full-mouth rehabilitation."
      },
      {
        "title": "Aesthetic Dental Concerns",
        "description": "Smile correction using veneers, crowns and cosmetic dentistry techniques."
      },
      {
        "title": "Occlusal & Bite Disorders",
        "description": "Comprehensive occlusal rehabilitation for functional and aesthetic improvement."
      },
      {
        "title": "TMJ & Orofacial Pain Disorders",
        "description": "Diagnosis and management of jaw pain, migraines, and dental sleep issues."
      }
    ],
    "procedures": [
      {
        "title": "Dental Implants & \u2018Teeth in a Day\u2019",
        "description": "Immediate implants and full-mouth implant-supported prosthesis."
      },
      {
        "title": "Full Mouth Rehabilitation",
        "description": "Rebuilding aesthetics and function with advanced prosthodontic techniques."
      },
      {
        "title": "Smile Makeover",
        "description": "Aesthetic correction using veneers, crowns, and composite restorations."
      },
      {
        "title": "Maxillofacial Prosthesis",
        "description": "Rehabilitation of jaw, facial structures and post-surgical defects."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Shilpa specialize in dental implants?",
        "answer": "Yes, she is internationally trained in surgical implantology and advanced implant-supported prosthesis."
      },
      {
        "question": "Does she perform smile correction procedures?",
        "answer": "Yes, she performs cosmetic dentistry including veneers, crowns and aesthetic reconstructions."
      },
      {
        "question": "Is she experienced in full mouth rehabilitation?",
        "answer": "Yes, she has over two decades of expertise in complex full-mouth prosthetic rehabilitation."
      }
    ]
  },
  {
    "slug": "dr-saphalta-baghmar",
    "name": "Dr. Saphalta Baghmar",
    "specialty": "Medical Oncology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Saphalta Baghmar.webp",
    "isTopDoctor": true,
    "position": "Program Head  Head & Neck, Neuro-oncology, Breast, GI, Hepatobiliary & Genitourinary Cancers",
    "degree": "MBBS | MD (Medicine) | DM (Medical Oncology)",
    "about": "Dr. Saphalta Baghmar is a distinguished Medical Oncologist with advanced training from AIIMS New Delhi. An alumna of MGM Medical College, she has served as faculty at the Institute of Liver and Biliary Sciences (ILBS), New Delhi. She has delivered over 100 invited lectures at national and international platforms and has been awarded multiple gold medals for academic excellence. With more than 30 research publications and book chapters, she is highly recognized for her expertise in breast cancer, gastrointestinal cancers, urogenital cancers, and head & neck oncology. Trained in precision oncology, she specializes in targeted therapy and immunotherapy, offering individualized and evidence-based cancer care.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Comprehensive evaluation and advanced medical management."
      },
      {
        "title": "Gastrointestinal Cancers",
        "description": "Expertise in colon, stomach, pancreatic and liver cancers."
      },
      {
        "title": "Urogenital Cancers",
        "description": "Medical management of prostate, kidney, bladder and testicular cancers."
      },
      {
        "title": "Head & Neck Cancers",
        "description": "Diagnosis, staging and systemic therapy for head & neck tumors."
      }
    ],
    "procedures": [
      {
        "title": "Targeted Therapy",
        "description": "Precision-based treatments targeting molecular drivers of cancer."
      },
      {
        "title": "Immunotherapy",
        "description": "Immune-boosting therapies for advanced and resistant cancers."
      },
      {
        "title": "Precision Oncology",
        "description": "Genetic and molecular profiling to customize cancer treatment."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Saphalta treat breast cancer?",
        "answer": "Yes, breast cancer management is one of her primary specialties."
      },
      {
        "question": "Does she offer immunotherapy?",
        "answer": "Yes, she is extensively trained and experienced in modern immunotherapy treatments."
      },
      {
        "question": "Is she trained in precision oncology?",
        "answer": "Yes, she applies genetic and molecular insights to personalize cancer treatment."
      }
    ]
  },
  {
    "slug": "dr-sameer-bhate",
    "name": "Dr. Sameer Bhate",
    "specialty": "Cardiac Sciences  Cardiovascular & Thoracic Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "20+ years",
    "image": "Dr. Sameer Bhate.webp",
    "isTopDoctor": true,
    "position": "Senior Consultant & Head  Adult Cardiac Surgery",
    "degree": "MBBS | MCh | DNB (CVTS) | DNB (General Surgery) | FIACS | MNAMS | Fellow  Adult & Pediatric Cardiac Surgery (Australia) | Fellow  Heart & Lung Transplant & Assist Devices (Australia)",
    "about": "Dr. Sameer Bhate is a highly accomplished Cardiothoracic Surgeon with over 20 years of experience and more than 4000 cardiac surgeries to his credit. He leads the Department of Adult Cardiac Surgery at Amrita Hospital, Faridabad, and is known for his expertise in complex cardiac procedures including redo heart surgeries, valve surgery, bypass surgery, aortic aneurysm surgery, and advanced transplant care. He has been instrumental in establishing multiple cardiac centers across North India and two heart and lung transplant programs in South India. His commitment to patient care, research, and surgical innovation has made him a respected name in Indian cardiac surgery.",
    "medicalProblems": [
      {
        "title": "Coronary Artery Disease",
        "description": "Advanced surgical treatment including CABG for blocked heart arteries."
      },
      {
        "title": "Valvular Heart Disease",
        "description": "Surgical management including valve repair and valve replacement."
      },
      {
        "title": "Aortic Aneurysm",
        "description": "Complex open-heart surgery for aortic dilation and aneurysm."
      },
      {
        "title": "Heart Failure & End-stage Cardiac Disease",
        "description": "Heart and lung transplant solutions for advanced cardiac conditions."
      }
    ],
    "procedures": [
      {
        "title": "Coronary Artery Bypass Grafting (CABG)",
        "description": "Surgery to restore blood flow in blocked coronary arteries."
      },
      {
        "title": "Redo Heart Surgeries",
        "description": "High-risk repeat cardiac procedures performed with precision."
      },
      {
        "title": "Valve Replacement Surgery",
        "description": "Mitral, aortic and tricuspid valve repair and replacement."
      },
      {
        "title": "Heart & Lung Transplant Surgery",
        "description": "Transplantation and artificial assist device support (LVAD/ECMO)."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Sameer perform redo heart surgeries?",
        "answer": "Yes, he is widely recognized for expertise in high-risk redo cardiac surgeries."
      },
      {
        "question": "Does he perform valve replacement surgeries?",
        "answer": "Yes, he performs complete range of valve repair and replacement procedures."
      },
      {
        "question": "Is he trained in heart and lung transplants?",
        "answer": "Yes, he completed advanced fellowships in Australia in transplant and assist devices."
      }
    ]
  },
  {
    "slug": "dr-savita-krishnamurthy-guin",
    "name": "Dr. Savita Krishnamurthy Guin",
    "specialty": "Paediatric Cardiology & Adult Congenital Heart Disease",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "13+ years",
    "image": "Dr. Savita Krishnamurthy Guin.webp",
    "isTopDoctor": false,
    "position": "Assistant Professor  Paediatric Cardiology",
    "degree": "MBBS | MD (Paediatrics) | DrNB (Paediatric Cardiology)",
    "about": "Dr. Savita Krishnamurthy Guin is an experienced Paediatric Cardiologist with over 13 years in managing congenital, rheumatic and acquired heart diseases in newborns, children and adults. She specializes in cardiac imaging, fetal echocardiography, perinatal cardiac management and emergency paediatric cardiac care. Trained at prestigious institutions like KMC Manipal, IGMC Shimla and RTIICS Kolkata, she plays a crucial role in diagnosing and treating complex congenital heart conditions. Her approach integrates precision imaging, holistic perinatal planning and long-term cardiac care.",
    "medicalProblems": [
      {
        "title": "Congenital Heart Diseases",
        "description": "Diagnosis and management of structural heart defects in newborns and children."
      },
      {
        "title": "Rheumatic & Acquired Heart Diseases",
        "description": "Comprehensive care for paediatric and adolescent heart disorders."
      },
      {
        "title": "Fetal Cardiac Abnormalities",
        "description": "Specialized assessment and counseling during pregnancy for suspected fetal heart conditions."
      },
      {
        "title": "Paediatric Cardiac Emergencies",
        "description": "Acute management of life-threatening cardiac conditions in infants and children."
      }
    ],
    "procedures": [
      {
        "title": "Fetal Echocardiography",
        "description": "Advanced prenatal heart imaging to detect fetal cardiac anomalies."
      },
      {
        "title": "Paediatric Cardiac Imaging",
        "description": "Echocardiography and imaging for diagnosis of congenital and acquired heart diseases."
      },
      {
        "title": "Perinatal Cardiac Management",
        "description": "Planning and optimizing outcomes for babies diagnosed with cardiac issues before birth."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Savita perform fetal echocardiography?",
        "answer": "Yes, she is highly skilled in fetal cardiac imaging and prenatal diagnosis."
      },
      {
        "question": "Does she treat congenital heart diseases in newborns?",
        "answer": "Yes, she manages congenital, rheumatic and acquired cardiac disorders across pediatric age groups."
      },
      {
        "question": "Is she experienced in paediatric cardiac emergencies?",
        "answer": "Yes, she has extensive experience in managing neonatal and paediatric cardiac emergencies."
      }
    ]
  },
  {
    "slug": "dr-shikha-gupta",
    "name": "Dr. Shikha Gupta",
    "specialty": "Plastic & Reconstructive Surgery",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Shikha Gupta.webp",
    "isTopDoctor": true,
    "position": "Senior Consultant  Plastic & Reconstructive Surgery",
    "degree": "MBBS | MS (General Surgery) | MCh (Plastic Surgery) | MRCS (UK) | FRCS (UK) | Fellowship in Microsurgery | Fellow in Plastic Surgery (UK)",
    "about": "Dr. Shikha Gupta is an internationally trained and highly acclaimed Plastic & Reconstructive Surgeon with extensive expertise in reconstructive microsurgery, breast surgery, head and neck reconstruction, facial reanimation, body contouring, and cosmetic surgery. She completed her MBBS and MS from top institutions in Mumbai, followed by MCh in Plastic Surgery where she secured the *Gold Medal* and topped the Maharashtra University of Health Sciences. She further trained in the United Kingdom as an International Training Fellow in Microsurgery at Norfolk & Norwich University Hospital and completed multiple advanced fellowships. Dr. Gupta combines world-class surgical skill with compassionate patient care and is widely recognized for her excellence in reconstructive and aesthetic surgery. She has received numerous awards and has presented groundbreaking work on national and global platforms.",
    "medicalProblems": [
      {
        "title": "Breast Deformities & Reconstruction Needs",
        "description": "Reconstruction after mastectomy, congenital deformities and aesthetic breast surgeries."
      },
      {
        "title": "Head & Neck Reconstruction",
        "description": "Complex reconstruction after trauma, tumor removal and congenital defects."
      },
      {
        "title": "Lymphedema",
        "description": "Comprehensive medical and surgical management of chronic lymphedema."
      },
      {
        "title": "Trauma & Hand Injuries",
        "description": "Microsurgical repair and reconstruction after trauma, burns and limb injuries."
      }
    ],
    "procedures": [
      {
        "title": "Breast Reconstruction & Oncoplastic Surgery",
        "description": "Aesthetic and reconstructive procedures including flap-based and implant-based reconstruction."
      },
      {
        "title": "Microsurgery",
        "description": "Free flap surgeries, nerve repair, vascularized composite tissue transfer and limb salvage procedures."
      },
      {
        "title": "Body Contouring Surgery",
        "description": "Liposuction, tummy tuck, arm lift, lower body lift and post-weight-loss body reshaping."
      },
      {
        "title": "Facial Reanimation & Reconstruction",
        "description": "Advanced surgical techniques to restore facial movement and aesthetics."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Shikha specialize in breast reconstruction?",
        "answer": "Yes, she is highly skilled in both reconstructive and aesthetic breast surgeries."
      },
      {
        "question": "Is she trained internationally?",
        "answer": "Yes, she trained extensively in the UK and earned the prestigious FRCS in Plastic Surgery."
      },
      {
        "question": "Does she treat lymphedema?",
        "answer": "Yes, she provides both medical and surgical treatment options for lymphedema."
      }
    ]
  },
  {
    "slug": "dr-shiveta-razdan",
    "name": "Dr. Shiveta Razdan",
    "specialty": "Breast Surgery & Breast Oncology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Shiveta Razdan.webp",
    "isTopDoctor": true,
    "position": "Senior Consultant & Assistant Professor  Breast Oncology",
    "degree": "MBBS | MS (General Surgery) | MRCS (UK) | Fellow  European Board of Breast Surgery (UEMS)",
    "about": "Dr. Shiveta Razdan is an internationally trained Breast Oncoplastic Surgeon with extensive expertise in breast cancer surgery, oncoplastic procedures, sentinel node biopsy, and management of benign breast diseases. She completed her MBBS and MS from Jammu University, followed by MRCS (Edinburgh). She further trained in the UK as an Oncoplastic Breast Fellow at South Tees Trust, James Cook Hospital and Frimley Health Foundation Trust. She is certified by the European Board of Breast Surgery, reflecting the highest standards of breast surgical care in Europe. With over 15 years of clinical experience, Dr. Shiveta excels in partial breast reconstruction, aesthetic breast surgery, implant-based reconstruction, and advanced breast cancer management. She has held key positions at Medanta and has delivered numerous public awareness talks, especially on hereditary breast cancer, early detection and BRCA screening.",
    "medicalProblems": [
      {
        "title": "Breast Cancer",
        "description": "Comprehensive surgical and oncoplastic management of breast cancer."
      },
      {
        "title": "Benign Breast Diseases",
        "description": "Evaluation and treatment of non-cancerous breast lumps and conditions."
      },
      {
        "title": "Hereditary Breast Cancer Risk",
        "description": "Assessment and management of BRCA-related hereditary cancer."
      },
      {
        "title": "Male Breast Cancer",
        "description": "Diagnosis and treatment of gynecomastia and male breast cancers."
      }
    ],
    "procedures": [
      {
        "title": "Oncoplastic Breast Surgery",
        "description": "Combines cancer removal with cosmetic reconstruction for optimal outcomes."
      },
      {
        "title": "Sentinel Lymph Node Biopsy",
        "description": "Minimally invasive technique for accurate cancer staging."
      },
      {
        "title": "Breast Reconstruction",
        "description": "Implant-based and partial reconstruction techniques post-cancer surgery."
      },
      {
        "title": "Breast Lump Evaluation & Surgery",
        "description": "Comprehensive management of benign and suspicious breast lumps."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Shiveta perform oncoplastic breast surgery?",
        "answer": "Yes, she is internationally trained in advanced oncoplastic breast reconstruction techniques."
      },
      {
        "question": "Does she treat benign breast lumps?",
        "answer": "Yes, she manages all types of benign breast conditions with precision."
      },
      {
        "question": "Is she experienced in hereditary breast cancer screening?",
        "answer": "Yes, she regularly counsels and manages patients with BRCA gene mutations."
      }
    ]
  },
  {
    "slug": "dr-vidit-kapoor",
    "name": "Dr. Vidit Kapoor",
    "specialty": "Hematology & Medical Oncology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "10+ years",
    "image": "Dr. Vidit Kapoor.webp",
    "isTopDoctor": true,
    "position": "Assistant Professor  Hematology & Medical Oncology",
    "degree": "MBBS | Diplomate Internal Medicine (American Board) | Diplomate Palliative Medicine | Diplomate Medical Oncology & Hematology",
    "about": "Dr. Vidit Kapoor is a US-trained Hematologist and Medical Oncologist specializing in the diagnosis, treatment, and long-term care of patients with solid tumors and blood cancers. He completed his MBBS in New Delhi and pursued rigorous residency and fellowship training in the United States, including Internal Medicine at the University of New Mexico and advanced fellowships in Palliative Medicine and Medical Oncology & Hematology at the prestigious UT Health San Antonio MD Anderson Cancer Center. Known for his evidence-based and compassionate cancer care approach, Dr. Kapoor has contributed to international research, published widely, and presented at global oncology conferences. His expertise spans immunotherapy, targeted therapy, precision oncology, lymphoma, leukemia, myeloma, and solid organ cancers.",
    "medicalProblems": [
      {
        "title": "Solid Tumors",
        "description": "Breast, lung, liver, gallbladder, colorectal, gastric, pancreatic, prostate, ovarian, cervical and other organ cancers."
      },
      {
        "title": "Hematological Cancers",
        "description": "Comprehensive care for leukemia, lymphoma and multiple myeloma."
      },
      {
        "title": "Advanced & Metastatic Cancers",
        "description": "Personalized treatment with targeted therapy, immunotherapy and precision oncology."
      },
      {
        "title": "Palliative Oncology",
        "description": "Expert care focused on symptom relief, quality of life and holistic cancer support."
      }
    ],
    "procedures": [
      {
        "title": "Chemotherapy",
        "description": "Customized treatment plans for solid tumors and hematological cancers."
      },
      {
        "title": "Immunotherapy",
        "description": "Cutting-edge immune-based treatments for advanced cancers."
      },
      {
        "title": "Targeted Therapy",
        "description": "Molecularly guided therapies for precision cancer treatment."
      },
      {
        "title": "Oncology Diagnostics & Staging",
        "description": "Comprehensive evaluation including genetic and molecular testing."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vidit treat both solid tumors and blood cancers?",
        "answer": "Yes, he is trained in both Medical Oncology and Hematology."
      },
      {
        "question": "Is he trained in the United States?",
        "answer": "Yes, he completed his residency and multiple fellowships in top US institutions including UT Health San Antonio MD Anderson Cancer Center."
      },
      {
        "question": "Does he offer immunotherapy and precision oncology?",
        "answer": "Yes, he specializes in advanced treatments like immunotherapy, targeted therapy and personalized cancer care."
      }
    ]
  },
  {
    "slug": "dr-vivek-chaturvedi",
    "name": "Dr. Vivek Chaturvedi",
    "specialty": "Adult Cardiology",
    "hospital": "Amrita Hospital – Faridabad",
    "experience": "15+ years",
    "image": "Dr. Vivek Chaturvedi.webp",
    "isTopDoctor": true,
    "position": "Professor & Head  Adult Cardiology",
    "degree": "MBBS | MD (Medicine) | DM (Cardiology) | Fellowship in Cardiac Electrophysiology",
    "about": "Dr. Vivek Chaturvedi is a highly respected and nationally acclaimed cardiologist with over 15 years of expertise in adult cardiology, cardiac electrophysiology, and complex arrhythmia management. Before joining Amrita Hospital, he served as Professor of Cardiology and Incharge of Arrhythmia & Electrophysiology Services at G.B. Pant Hospital (GIPMER), New Delhi. He is recognized as one of India's leading experts in electrophysiology, specialising in atrial fibrillation ablation, ventricular tachycardia ablation, complex device implantation, and advanced cardiac rhythm management. Dr. Chaturvedi has contributed over 50 publications to international journals, authored book chapters, and has been consistently honored for excellence in cardiology, clinical research, and academic performance.",
    "medicalProblems": [
      {
        "title": "Complex Cardiac Arrhythmias",
        "description": "Evaluation and treatment of atrial fibrillation, atrial tachycardia, ventricular tachycardia and VPCs."
      },
      {
        "title": "Coronary Artery Disease",
        "description": "Management of blockages, heart attack risk and interventional treatments."
      },
      {
        "title": "Heart Valve Disorders",
        "description": "Assessment and treatment of valvular heart disease including rheumatic mitral valve disease."
      },
      {
        "title": "Heart Failure & Rhythm Disorders",
        "description": "Advanced treatment of conduction issues, heart failure and device-based therapy needs."
      }
    ],
    "procedures": [
      {
        "title": "Electrophysiology Studies & Ablation",
        "description": "Radiofrequency and 3D electroanatomic mappingguided ablation for complex arrhythmias."
      },
      {
        "title": "Coronary & Peripheral Angioplasty",
        "description": "Interventional treatment for blocked heart and peripheral blood vessels."
      },
      {
        "title": "Mitral Valvuloplasty",
        "description": "Catheter-based treatment for rheumatic mitral stenosis."
      },
      {
        "title": "Diagnostic Cardiology",
        "description": "ECG, echocardiography, tilt table testing and implantable loop recorders."
      }
    ],
    "faqs": [
      {
        "question": "Does Dr. Vivek specialize in electrophysiology?",
        "answer": "Yes, he is a national leader in electrophysiology and specializes in complex arrhythmia ablation."
      },
      {
        "question": "Does he perform coronary angioplasty?",
        "answer": "Yes, he is highly experienced in coronary and peripheral angioplasty procedures."
      },
      {
        "question": "Is he experienced in treating atrial fibrillation?",
        "answer": "Yes, he is skilled in advanced AF ablation using 3D mapping and cutting-edge electrophysiology technologies."
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
