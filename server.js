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

  medicalProblems: [
    {
      title: String,
      description: String
    }
  ],

  procedures: [
    {
      title: String,
      description: String
    }
  ],

  faqs: [
    {
      question: String,
      answer: String
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
 const doctors =[
{
  "slug": "dr-aayush-chawla",
  "name": "Dr. Aayush Chawla",
  "specialty": "Anesthesiology & Critical Care",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Critical Care",
  "degree": "MBBS | MD (Anaesthesia) | IDCCM | IFCCM",
  "about": "Dr. Aayush Chawla is an Anaesthesiologist and Intensivist with more than 11 years of experience in Critical Care Medicine. He completed MBBS and MD from Banaras Hindu University and has worked at Fortis Escorts Hospital, Faridabad and Indraprastha Apollo Hospitals, New Delhi. He specializes in the management of critically ill patients, airway techniques, mechanical ventilation and infection control. He is a founder member of the Fluid Academy of India and an active academic contributor.",
  "medicalProblems": [
    { "title": "Critical Illness", "description": "Comprehensive ICU care for life-threatening conditions." },
    { "title": "Sepsis & Septic Shock", "description": "Advanced management of severe infections." },
    { "title": "Respiratory Failure", "description": "Expert ventilation and airway management." },
    { "title": "Hemodynamic Instability", "description": "Monitoring and stabilization of unstable patients." }
  ],
  "procedures": [
    { "title": "Airway Management", "description": "Advanced and difficult airway handling." },
    { "title": "Mechanical Ventilation", "description": "Invasive and non-invasive ventilation support." },
    { "title": "ICU Bronchoscopy", "description": "Diagnostic and therapeutic bronchoscopy in ICU." },
    { "title": "Infection Control Protocols", "description": "Antibiotic stewardship and infection prevention." }
  ],
  "faqs": [
    { "question": "Does Dr. Aayush manage critically ill patients?", "answer": "Yes, he specializes in critical care and ICU management." },
    { "question": "Is he trained in mechanical ventilation?", "answer": "Yes, he has deep expertise in ventilatory support and monitoring." },
    { "question": "Does he perform ICU bronchoscopy?", "answer": "Yes, he performs bronchoscopy in critically ill patients." }
  ]
},
{
  "slug": "dr-gaurav-kakkar",
  "name": "Dr. Gaurav Kakkar",
  "specialty": "Neuro-Anaesthesia & Neurocritical Care",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Lead – Neuro-Anaesthesia & Neurocritical Care",
  "degree": "MBBS | FCARCSI | Fellowship (Neuroanaesthesia & Neurocritical Care) | CCT (UK) | FSNCC",
  "about": "Dr. Gaurav Kakkar is a British-trained Neuroanaesthetist and Neurocritical Care specialist with over 22 years of experience. He completed his MBBS from AFMC Pune and then trained extensively in the UK, completing Specialist Registrar training and earning the Certificate of Completion of Training. He has worked at leading UK hospitals such as The Royal London Hospital and The Walton Centre for Neurosciences.",
  "medicalProblems": [
    { "title": "Brain & Spine Trauma", "description": "Expert care for traumatic neurological emergencies." },
    { "title": "Subarachnoid Hemorrhage", "description": "Critical management of brain hemorrhage cases." },
    { "title": "Neurosurgical Conditions", "description": "Support for complex neurosurgical procedures." },
    { "title": "Stroke", "description": "Expertise in hyperacute stroke services." }
  ],
  "procedures": [
    { "title": "Neuro-Anaesthesia", "description": "Anaesthesia for brain and spine surgeries." },
    { "title": "Neurocritical Care", "description": "ICU management of neurological emergencies." },
    { "title": "Functional Neurosurgery Support", "description": "Anaesthesia for DBS and similar procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Kakkar trained in the UK?", "answer": "Yes, he has 14 years of UK training including formal specialist registrar training." },
    { "question": "Does he treat stroke emergencies?", "answer": "Yes, he is experienced in hyperacute stroke care." },
    { "question": "Is he specialized in neurocritical care?", "answer": "Yes, he is a recognized neurocritical care expert." }
  ]
},
{
  "slug": "dr-niti-batra-gulati",
  "name": "Dr. Niti Batra Gulati",
  "specialty": "Anesthesiology & Critical Care",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Anaesthesiology & Critical Care",
  "degree": "MBBS | MD | IDRA",
  "about": "Dr. Niti Batra Gulati is a Senior Consultant in Anaesthesiology & Critical Care with 18 years of experience. She specializes in high-risk surgical anaesthesia, acute pain management, and life support training. She is also an instructor for advanced trauma and life support courses.",
  "medicalProblems": [
    { "title": "High-Risk Surgical Cases", "description": "Anaesthesia for complex and critical surgeries." },
    { "title": "Acute Pain Conditions", "description": "Expert acute and perioperative pain management." },
    { "title": "Trauma Cases", "description": "Advanced trauma life support expertise." }
  ],
  "procedures": [
    { "title": "Advanced Life Support Training", "description": "Instructor-level BLS & ACLS guidance." },
    { "title": "Labour Analgesia", "description": "Pain-free delivery management." },
    { "title": "Acute Pain Interventions", "description": "Post-operative and perioperative pain procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Niti manage high-risk surgeries?", "answer": "Yes, she has extensive experience in high-risk anaesthesia." },
    { "question": "Is she a certified life support instructor?", "answer": "Yes, she teaches BLS, ACLS, and ATLS." },
    { "question": "Does she offer labour analgesia?", "answer": "Yes, she provides pain-free delivery services." }
  ]
},
{
  "slug": "dr-ripenmeet-salhotra",
  "name": "Dr. Ripenmeet Salhotra",
  "specialty": "Critical Care & Anaesthesiology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Critical Care",
  "degree": "MBBS | MD (Anaesthesiology) | IDCCM | IFCCM | EDIC",
  "about": "Dr. Ripenmeet Salhotra has over 16 years of experience as an intensivist with national and international training in critical care. He has been instrumental in managing thousands of critically ill patients, including those with sepsis, trauma, stroke and multi-organ failure. He is a strong advocate of palliative care, infection control and rational antibiotic use.",
  "medicalProblems": [
    { "title": "Severe Sepsis & Septic Shock", "description": "Advanced life-saving treatment for sepsis." },
    { "title": "Multi-Organ Failure", "description": "Expert management of organ dysfunction syndromes." },
    { "title": "Neurological Emergencies", "description": "Stroke and trauma support in ICU." },
    { "title": "Respiratory Failure", "description": "Ventilation and airway management expertise." }
  ],
  "procedures": [
    { "title": "Bronchoscopy", "description": "Bronchoscopy for critically ill patients." },
    { "title": "Percutaneous Tracheostomy", "description": "Bedside tracheostomy procedures." },
    { "title": "Point of Care Ultrasound", "description": "Ultrasound for rapid ICU diagnosis." }
  ],
  "faqs": [
    { "question": "Does Dr. Ripenmeet perform tracheostomy?", "answer": "Yes, he performs percutaneous tracheostomy in ICU patients." },
    { "question": "Is he trained internationally?", "answer": "Yes, he holds EDIC from Brussels." },
    { "question": "Does he manage end-of-life care?", "answer": "Yes, he strongly advocates ethical palliative care." }
  ]
},
{
  "slug": "dr-shankey-garg",
  "name": "Dr. Shankey Garg",
  "specialty": "Anesthesiology & Critical Care",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "4+ years post-MD",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Anaesthesia & Critical Care",
  "degree": "MBBS | MD (Anaesthesia) | DNB | PDCC (Liver Transplant Anaesthesia)",
  "about": "Dr. Shankey Garg is an accomplished anaesthetist trained at premier institutions such as PGIMER Chandigarh and ILBS New Delhi. With strong expertise in liver transplant anaesthesia, gastrointestinal surgeries, high-risk cases and labour analgesia, she has contributed significantly to patient care and academics. She has also authored several national and international publications.",
  "medicalProblems": [
    { "title": "Liver Failure & Transplant Care", "description": "Anaesthesia and ICU care for liver transplant patients." },
    { "title": "High-Risk Surgical Cases", "description": "Anaesthesia for major GI, hepatobiliary and urology surgeries." },
    { "title": "Obstetric Anaesthesia", "description": "Pain-free labour and pregnancy-related anaesthesia support." }
  ],
  "procedures": [
    { "title": "Liver Transplant Anaesthesia", "description": "Anaesthesia for living donor liver transplant surgeries." },
    { "title": "POCUS", "description": "Point of care ultrasound for real-time decision making." },
    { "title": "Labour Analgesia", "description": "Pain-free normal delivery support." }
  ],
  "faqs": [
    { "question": "Does Dr. Shankey specialize in liver transplant anaesthesia?", "answer": "Yes, she completed a PDCC fellowship at ILBS, New Delhi." },
    { "question": "Does she provide labour analgesia?", "answer": "Yes, she strongly advocates pain-free childbirth." },
    { "question": "Does she handle high-risk surgical patients?", "answer": "Yes, she has extensive experience across major surgical specialties." }
  ]
},
{
  "slug": "dr-dheeraj-arora",
  "name": "Dr. Dheeraj Arora",
  "specialty": "Cardiac Anaesthesiology & Critical Care",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Cardiac Anaesthesiology & Critical Care",
  "degree": "MBBS | DNB | PDCC (Cardiac Anaesthesiology) | PGCCHM",
  "about": "Dr. Dheeraj Arora is a highly experienced cardiac anaesthesiologist with over 22 years of post-graduate experience. He has worked in leading cardiac centres including SGPGIMS Lucknow, GB Pant Hospital, Escorts Heart Institute, and Medanta. He specialises in high-risk cardiac surgical cases, TEE, and percutaneous cardiac interventions.",
  "medicalProblems": [
    { "title": "Heart Surgery Support", "description": "Anaesthesia for bypass, valve and complex cardiac surgeries." },
    { "title": "Cardiac Critical Illness", "description": "Expert care for cardiac ICU patients." },
    { "title": "High-Risk Cardiac Cases", "description": "Management of complex cardiac comorbidities." }
  ],
  "procedures": [
    { "title": "Cardiac Anaesthesia", "description": "Anaesthesia for all major cardiac surgical procedures." },
    { "title": "Transesophageal Echocardiography (TEE)", "description": "Perioperative cardiac function monitoring." },
    { "title": "Percutaneous Interventions Support", "description": "Anaesthesia for catheter-based procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Dheeraj handle cardiac surgeries?", "answer": "Yes, he has decades of experience in cardiac anaesthesia." },
    { "question": "Is he trained in TEE?", "answer": "Yes, he specializes in perioperative TEE monitoring." },
    { "question": "Does he manage high-risk cardiac patients?", "answer": "Yes, he is known for managing complex cardiac cases." }
  ]
},
{
  "slug": "dr-anshul-jain",
  "name": "Dr. Anshul Jain",
  "specialty": "Emergency Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Emergency Medicine",
  "degree": "MBBS | MD (Emergency Medicine) | MRCEM (Royal College London)",
  "about": "Dr. Anshul Jain is a Consultant and Assistant Professor in Emergency Medicine with experience at AIIMS New Delhi and Sarvodaya Hospital. He specializes in trauma, toxicology, emergency stabilisation, and point-of-care ultrasound.",
  "medicalProblems": [
    { "title": "Emergency Trauma Care", "description": "Immediate care for critical injuries and trauma." },
    { "title": "Poisoning & Toxicology", "description": "Expert management of poisoning emergencies." },
    { "title": "Cardiac & Respiratory Emergencies", "description": "Life-saving interventions for cardiac arrest and breathing failure." }
  ],
  "procedures": [
    { "title": "Point of Care Ultrasound (POCUS)", "description": "Bedside ultrasound for rapid diagnosis." },
    { "title": "Advanced Resuscitation", "description": "BLS, ACLS, ATLS and PALS certified emergency interventions." },
    { "title": "Emergency Stabilization", "description": "Airway, circulation and trauma stabilization." }
  ],
  "faqs": [
    { "question": "Is Dr. Anshul MRCEM certified?", "answer": "Yes, he has completed MRCEM from the Royal College London." },
    { "question": "Does he treat poisoning cases?", "answer": "Yes, toxicology is one of his key areas of expertise." },
    { "question": "Has he worked at AIIMS?", "answer": "Yes, he worked as a Senior Resident at AIIMS Delhi." }
  ]
},
{
  "slug": "dr-abhishek-behera",
  "name": "Dr. Abhishek Behera",
  "specialty": "Therapeutic Nuclear Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant & Assistant Professor – Nuclear Medicine",
  "degree": "MBBS | MD (Nuclear Medicine) | DM (Therapeutic Nuclear Medicine)",
  "about": "Dr. Abhishek Behera is one of the few DM-trained Therapeutic Nuclear Medicine specialists in India, trained at AIIMS New Delhi. He has authored more than 15 publications and works extensively on prostate cancer, neuroendocrine tumours, targeted alpha therapy, and translational radionuclide therapy.",
  "medicalProblems": [
    { "title": "Prostate Cancer", "description": "Advanced nuclear theranostics and imaging." },
    { "title": "Neuroendocrine Tumors", "description": "Targeted therapy and PET-CT imaging." },
    { "title": "Thyroid Cancer", "description": "Diagnostic and therapeutic nuclear management." }
  ],
  "procedures": [
    { "title": "PET-CT Imaging", "description": "High-precision nuclear imaging." },
    { "title": "Targeted Alpha Therapy", "description": "Advanced therapeutic nuclear treatment." },
    { "title": "Radioembolization", "description": "Liver-directed radionuclide therapy." }
  ],
  "faqs": [
    { "question": "Is Dr. Abhishek trained at AIIMS?", "answer": "Yes, he completed both MD and DM from AIIMS New Delhi." },
    { "question": "Does he treat prostate cancer?", "answer": "Yes, it is one of his main areas of expertise." },
    { "question": "Does he perform PET-CT scans?", "answer": "Yes, he specializes in nuclear imaging including PET-CT." }
  ]
},
{
  "slug": "dr-meghana-prabhu-s",
  "name": "Dr. Meghana Prabhu S",
  "specialty": "Therapeutic Nuclear Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant & Associate Professor – Nuclear Medicine",
  "degree": "MBBS | DNB | DM (Therapeutic Nuclear Medicine) | MNAMS | FANMB",
  "about": "Dr. Meghana Prabhu S is among the few DM-trained Therapeutic Nuclear Medicine specialists in India, trained at AIIMS New Delhi. She has over 24 publications, multiple awards, and expertise in nuclear oncology, PET-CT, targeted alpha therapy, and theranostics for prostate, thyroid, and neuroendocrine cancers.",
  "medicalProblems": [
    { "title": "Neuroendocrine Cancer", "description": "Advanced imaging and targeted therapy." },
    { "title": "Prostate Cancer", "description": "Nuclear theranostics and advanced PET imaging." },
    { "title": "Thyroid Cancer", "description": "Diagnostic and therapeutic nuclear medicine." }
  ],
  "procedures": [
    { "title": "PET-CT Imaging", "description": "High-quality nuclear diagnostic imaging." },
    { "title": "Targeted Alpha Therapeutics", "description": "Theranostic nuclear treatment for cancers." },
    { "title": "SIRT / Radioembolization", "description": "Selective internal radiation therapy." }
  ],
  "faqs": [
    { "question": "Is Dr. Meghana DM-trained from AIIMS?", "answer": "Yes, she completed DM at AIIMS New Delhi." },
    { "question": "Does she specialize in nuclear oncology?", "answer": "Yes, she has extensive expertise in theranostics." },
    { "question": "How many publications does she have?", "answer": "She has authored over 24 publications." }
  ]
},
{
  "slug": "dr-bela-bhat",
  "name": "Dr. Bela Bhat",
  "specialty": "Dermatology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Dermatology",
  "degree": "MBBS | MD (Dermatology, Venereology & Leprosy)",
  "about": "Dr. Bela Bhat is a Consultant Dermatologist with over 8 years of experience in clinical dermatology, laser treatments, acne management, pigmentation, hair disorders, and cosmetic procedures. She is known for her patient-centered approach and has multiple publications in national and international journals.",
  "medicalProblems": [
    { "title": "Acne & Acne Scars", "description": "Comprehensive acne and scar treatment plans." },
    { "title": "Pigmentation Disorders", "description": "Laser and dermatological treatment for pigmentation." },
    { "title": "Hair & Scalp Disorders", "description": "Management of alopecia and scalp conditions." },
    { "title": "Autoimmune Skin Disorders", "description": "Vitiligo, psoriasis and other chronic dermatological diseases." }
  ],
  "procedures": [
    { "title": "Laser Hair Removal", "description": "IPL, diode and triple wavelength laser treatments." },
    { "title": "Q-Switch Laser Treatments", "description": "Pigmentation, tattoo removal and rejuvenation." },
    { "title": "MNRF & Radiofrequency", "description": "Skin tightening and rejuvenation procedures." },
    { "title": "PRP Treatments", "description": "PRP for hair growth and facial rejuvenation." }
  ],
  "faqs": [
    { "question": "Does Dr. Bela perform laser hair removal?", "answer": "Yes, she works with all major laser platforms." },
    { "question": "Does she treat acne and pigmentation?", "answer": "Yes, she has extensive expertise in acne and pigmentation treatment." },
    { "question": "Does she offer PRP treatments?", "answer": "Yes, she performs PRP for hair loss and skin rejuvenation." }
  ]
},
{
  "slug": "dr-vichitra-sharma",
  "name": "Dr. Vichitra Sharma",
  "specialty": "Dermatology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Dermatology",
  "degree": "MBBS | MD (Dermatology)",
  "about": "Dr. Vichitra Sharma is a Consultant Dermatologist at Amrita Hospital, Faridabad with expertise in clinical dermatology, aesthetic dermatology, acne, pigmentary disorders, lasers, dermoscopy and dermatosurgery. She completed MBBS from KMC Manipal and MD Dermatology from Era’s Lucknow Medical College. She is known for her compassionate patient care and stays updated with latest advancements in dermatology. She has 4 poster presentations, 1 oral paper presentation and 3 publications in reputed journals.",
  "medicalProblems": [
    { "title": "Acne & Acne Scars", "description": "Advanced acne treatment and scar therapy." },
    { "title": "Skin Allergies", "description": "Treatment for atopic dermatitis, eczema and urticaria." },
    { "title": "Pigmentary Disorders", "description": "Management of melasma, hyperpigmentation and related issues." },
    { "title": "Infectious Dermatology", "description": "Management of leprosy and sexually transmitted skin infections." }
  ],
  "procedures": [
    { "title": "Laser Hair Reduction", "description": "Safe and advanced LHR procedures." },
    { "title": "PRP for Hair & Skin", "description": "PRP for hair loss and facial rejuvenation." },
    { "title": "Dermatosurgery", "description": "Mole removal, cyst excision, vitiligo and nail surgeries." },
    { "title": "Chemical Peels", "description": "Peels for rejuvenation and pigmentation." }
  ],
  "faqs": [
    { "question": "Does Dr. Vichitra treat acne scars?", "answer": "Yes, she specializes in acne and acne scar management." },
    { "question": "Does she perform dermatosurgery?", "answer": "Yes, including mole removal, cyst excisions and vitiligo surgeries." },
    { "question": "Does she provide laser hair reduction?", "answer": "Yes, she performs advanced laser hair removal treatments." }
  ]
},
{
  "slug": "dr-sachin-gupta",
  "name": "Dr. Sachin Gupta",
  "specialty": "Dermatology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant & Assistant Professor – Dermatology",
  "degree": "MBBS | MD Dermatology | DNB Dermatology",
  "about": "Dr. Sachin Gupta is a highly trained dermatologist with MBBS and MD Dermatology from AIIMS New Delhi. He has worked as a Senior Resident at AIIMS and specializes in acne, melasma, vitiligo, psoriasis, eczema, hair fall and sexually transmitted infections. He is experienced in dermatosurgery, laser treatments, PRP and chemical peeling. He has earned multiple national recognitions including top positions in PG quiz competitions and international dermatology scholarships.",
  "medicalProblems": [
    { "title": "Vitiligo & Melasma", "description": "Evaluation and targeted treatment for pigmentation disorders." },
    { "title": "Psoriasis & Chronic Eczema", "description": "Comprehensive long-term management." },
    { "title": "Hair Loss Disorders", "description": "Diagnosis and treatment of alopecia and hair fall." },
    { "title": "Sexually Transmitted Infections", "description": "Diagnosis and treatment of dermatological STIs." }
  ],
  "procedures": [
    { "title": "Laser Hair Removal", "description": "Advanced laser hair reduction." },
    { "title": "Chemical Peeling", "description": "Peels for acne, melasma and rejuvenation." },
    { "title": "Dermatosurgery", "description": "Mole removal, wart removal, corn removal and vitiligo surgeries." },
    { "title": "PRP", "description": "PRP for hair growth and facial treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Sachin treat melasma and pigmentation?", "answer": "Yes, melasma and pigmentation disorders are key areas of his expertise." },
    { "question": "Does he perform dermatosurgery procedures?", "answer": "Yes, including mole excision, wart removal and vitiligo surgeries." },
    { "question": "Is Dr. Sachin trained at AIIMS?", "answer": "Yes, he completed MBBS, MD Dermatology and Senior Residency from AIIMS." }
  ]
},
{
  "slug": "dr-amit-kumar-agarwal",
  "name": "Dr. Amit Kumar Agarwal",
  "specialty": "Neurology & Epilepsy",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Assistant Professor – Neurology",
  "degree": "MBBS | MD | DM (Neurology) | PDF Epilepsy | PDCC Epilepsy",
  "about": "Dr. Amit Kumar Agarwal is an epilepsy specialist trained at Amrita Institute of Medical Sciences, Kochi and the Cleveland Clinic, USA. He completed his neurology training from AIIMS New Delhi and specializes in treating complex epilepsy cases, especially drug-resistant epilepsy. He provides advanced epilepsy management including epilepsy surgery, ketogenic diet therapy and neuromodulation techniques like Deep Brain Stimulation (DBS). He is known for his ethical, compassionate and research-driven approach towards patient care.",
  "medicalProblems": [
    { "title": "Epilepsy", "description": "Comprehensive management of all types of epilepsy." },
    { "title": "Drug-Resistant Epilepsy", "description": "Advanced evaluation for surgical and non-surgical options." },
    { "title": "Seizure Disorders", "description": "Diagnosis and long-term follow-up for recurrent seizures." },
    { "title": "Neurological Disorders", "description": "Treatment of general neurological conditions." }
  ],
  "procedures": [
    { "title": "Epilepsy Surgery Evaluation", "description": "Assessment for surgical treatment in resistant epilepsy." },
    { "title": "Ketogenic Diet Therapy", "description": "Diet-based therapy for seizure control." },
    { "title": "Deep Brain Stimulation (DBS)", "description": "Advanced neuromodulation for epilepsy." }
  ],
  "faqs": [
    { "question": "Does Dr. Amit treat drug-resistant epilepsy?", "answer": "Yes, he specializes in treating patients who do not respond to medication." },
    { "question": "Does he offer epilepsy surgery evaluation?", "answer": "Yes, he evaluates and prepares patients for surgical options." },
    { "question": "Is he trained internationally?", "answer": "Yes, he has advanced epilepsy training from Cleveland Clinic, USA." }
  ]
},
{
  "slug": "dr-akanksha-jain",
  "name": "Dr. Akanksha Jain",
  "specialty": "Paediatric Intensive Care (PICU)",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Paediatrics & Paediatric Critical Care",
  "degree": "MBBS | DNB Paediatrics | FNB PICU | FPICU (UK) | FCCM (Toronto, Canada)",
  "about": "Dr. Akanksha Jain is a Senior Consultant in Paediatrics and Paediatric Critical Care with over 13 years of experience. She has trained at prestigious institutes including Narayana Hrudayalaya (Bangalore), London, Birmingham, and SickKids (Toronto). She has successfully led PICU setups, managed complex paediatric cases including airway emergencies, ECMO-supported pneumonias, organ transplant patients, neurology emergencies, metabolic disorders, and genetic diseases. She is also a passionate academician, having authored multiple publications, initiated PICU fellowship programs, and developed simulation-based training modules.",
  "medicalProblems": [
    { "title": "Critically Ill Children", "description": "Advanced PICU management across multiple specialties." },
    { "title": "Airway Emergencies", "description": "Management of complex paediatric airway conditions." },
    { "title": "Complex Infections", "description": "Treatment of severe infections requiring advanced ventilation." },
    { "title": "Pediatric Organ Transplant Care", "description": "Post-operative care for liver, kidney and cardiac transplants." }
  ],
  "procedures": [
    { "title": "Advanced Ventilation & ECMO Support", "description": "Management of critically ill children requiring ventilation and ECMO." },
    { "title": "Paediatric Simulation Training", "description": "Simulation-based academic programs for healthcare staff." },
    { "title": "Emergency Critical Care Transport", "description": "National and international PICU transport expertise." }
  ],
  "faqs": [
    { "question": "Does Dr. Akanksha manage complex PICU cases?", "answer": "Yes, she has extensive expertise across all paediatric critical care subspecialties." },
    { "question": "Has she worked internationally?", "answer": "Yes, she trained at SickKids Toronto and hospitals in London and Birmingham." },
    { "question": "Does she offer ECMO-supported care?", "answer": "Yes, she has significant experience in ECMO-supported paediatric respiratory failure." }
  ]
},
{
  "slug": "dr-veena-raghunathan",
  "name": "Dr. Veena Raghunathan",
  "specialty": "Paediatric Intensive Care (PICU)",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Paediatric Intensive Care",
  "degree": "MBBS | MD (Paediatrics) | DNB (Paediatrics) | FNB (Paediatric Intensive Care)",
  "about": "Dr. Veena Raghunathan is a Senior Consultant in Paediatric Intensive Care with over 15 years of experience. She completed her MBBS from Seth GS Medical College and KEM Hospital, Mumbai, and MD Paediatrics from Grant Medical College. She further pursued DNB Paediatrics and specialized PICU training including FNB in Paediatric Intensive Care at Sir Ganga Ram Hospital, Delhi. She has managed over 300 pediatric liver transplant patients and is renowned for her expertise in respiratory support, renal replacement therapies, paediatric bronchoscopy, and care of critically ill children with complex conditions.",
  "medicalProblems": [
    { "title": "Severe Pneumonia & Bronchiolitis", "description": "Advanced respiratory support for severe lung infections." },
    { "title": "Tropical Infections", "description": "Management of dengue, malaria and other acute infections in children." },
    { "title": "Paediatric Organ Transplant Care", "description": "Post-operative ICU management for liver, kidney and BMT patients." },
    { "title": "Neuromuscular & Genetic Disorders", "description": "Critical care for complex congenital and neurological conditions." }
  ],
  "procedures": [
    { "title": "Acute Renal Replacement Therapies (CRRT)", "description": "Advanced renal support for critically ill children." },
    { "title": "Paediatric Bronchoscopy", "description": "Bronchoscopy for airway evaluation and treatment." },
    { "title": "Lung Function Testing", "description": "Paediatric pulmonary diagnostics." },
    { "title": "Long-Term Ventilation & Tracheostomy Care", "description": "Comprehensive care for children requiring chronic respiratory support." }
  ],
  "faqs": [
    { "question": "Does Dr. Veena manage paediatric liver transplant patients?", "answer": "Yes, she has managed over 300 paediatric liver transplant cases." },
    { "question": "Does she perform paediatric bronchoscopy?", "answer": "Yes, she is experienced in both diagnostic and therapeutic bronchoscopy." },
    { "question": "Does she treat severe respiratory infections?", "answer": "Yes, she specializes in advanced respiratory support for critically ill children." }
  ]
},
{
  "slug": "dr-amrita-kapoor-chaturvedi",
  "name": "Dr. Amrita Kapoor Chaturvedi",
  "specialty": "Ophthalmology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Assistant Professor – Ophthalmology",
  "degree": "MBBS (AIIMS) | MD Ophthalmology (AIIMS) | FRCS (Edinburgh)",
  "about": "Dr. Amrita Kapoor Chaturvedi is a highly experienced ophthalmologist trained at AIIMS, New Delhi. She has worked extensively at Dr. Rajendra Prasad Centre for Ophthalmic Sciences in glaucoma, squint, pediatric ophthalmology, neuro-ophthalmology and oculoplasty. She has also served as Senior Research Associate and later as Senior Consultant at Visitech Eye Centre before joining Amrita Hospital in 2022. She has vast experience in treating complex glaucoma, pediatric eye diseases, neuro-ophthalmic conditions and performing advanced cataract and refractive surgeries.",
  "medicalProblems": [
    { "title": "Glaucoma", "description": "Management of complex and refractory glaucoma cases." },
    { "title": "Pediatric Eye Disorders", "description": "Treatment for squint, refractive errors and childhood eye diseases." },
    { "title": "Neuro-Ophthalmology", "description": "Evaluation of optic nerve and brain-related visual problems." },
    { "title": "Cataract & Refractive Errors", "description": "Comprehensive cataract treatment and vision correction surgeries." }
  ],
  "procedures": [
    { "title": "Glaucoma Surgeries", "description": "Valves, drainage devices and advanced glaucoma interventions." },
    { "title": "Cataract Surgery", "description": "Phacoemulsification and intraocular lens implantation." },
    { "title": "Squint Surgery", "description": "Correction of strabismus in children and adults." },
    { "title": "Oculoplasty Procedures", "description": "Eyelid, orbit and ocular reconstructive surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Amrita treat glaucoma?", "answer": "Yes, she has extensive experience in managing complex glaucoma cases." },
    { "question": "Does she perform pediatric eye surgeries?", "answer": "Yes, including squint correction and childhood eye treatments." },
    { "question": "Is she trained at AIIMS?", "answer": "Yes, both her MBBS and MD Ophthalmology were completed at AIIMS New Delhi." }
  ]
},
{
  "slug": "dr-anubhav-pandey",
  "name": "Dr. Anubhav Pandey",
  "specialty": "Clinical Microbiology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head – Clinical Labs",
  "degree": "MBBS | MD (Microbiology) | PGDHHM | Infectious Diseases Certification",
  "about": "Dr. Anubhav Pandey is a highly accomplished Clinical Microbiologist and Clinical Laboratory specialist with more than two decades of experience. He completed MBBS from King George Medical College, Lucknow and MD Microbiology from AIIMS, New Delhi, followed by senior residencies at AIIMS. He has set up multiple national referral laboratories including Dengue Referral Lab (AIIMS, 2006) and Swine Flu Diagnostic Lab (SRL, 2009). He is an ISO 9001 Lead Auditor, CAP Auditor, NABH Assessor and an expert in clinical virology, stem cell research, quality assurance, and infectious diseases. He has authored over 20 publications and contributed to multiple national research programs.",
  "medicalProblems": [
    { "title": "Infectious Diseases Diagnosis", "description": "Laboratory diagnosis for bacterial, viral and fungal infections." },
    { "title": "Clinical Virology", "description": "Specialized testing for viruses including dengue, influenza and more." },
    { "title": "HIV & AIDS Screening", "description": "Expertise in HIV diagnosis and complications screening." },
    { "title": "Antimicrobial Resistance", "description": "Testing and management strategies for MDR organisms." }
  ],
  "procedures": [
    { "title": "Molecular Diagnostics", "description": "PCR-based detection of infectious diseases." },
    { "title": "Quality Assurance Systems", "description": "ISO, CAP and NABH compliant laboratory frameworks." },
    { "title": "Stem Cell Culture", "description": "Advanced laboratory procedures for stem cell research." },
    { "title": "Virology Lab Setup", "description": "Designing and establishing viral diagnostic labs." }
  ],
  "faqs": [
    { "question": "Is Dr. Anubhav an expert in virology?", "answer": "Yes, he has specialized training and has established multiple virology labs." },
    { "question": "Does he have experience with infectious disease outbreaks?", "answer": "Yes, he set up national labs during dengue and swine flu outbreaks." },
    { "question": "Is he involved in research?", "answer": "Yes, he is PI/Co-PI for over 10 national research programs." }
  ]
},
{
  "slug": "dr-aparna-chakravarty",
  "name": "Dr. Aparna Chakravarty",
  "specialty": "Paediatric Infectious Diseases",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Professor – Paediatric Infectious Diseases",
  "degree": "MBBS | MD Paediatrics | Fellowship Pediatric Infectious Diseases (SickKids Toronto) | MSc Infectious Diseases (LSHTM London)",
  "about": "Dr. Aparna Chakravarty is a senior paediatrician and paediatric infectious disease specialist with over 19 years of experience. She brings international expertise from SickKids Toronto and advanced academic training from the London School of Hygiene & Tropical Medicine. She has extensive experience in managing neonatal and pediatric infections, antimicrobial stewardship, infection prevention, vaccine research and medical education. She has led multi-institutional research projects, served as hospital infection control lead and mentored hundreds of medical students. She is known for her holistic, rational and family-centric care approach.",
  "medicalProblems": [
    { "title": "Pediatric Infectious Diseases", "description": "Management of bacterial, viral and fungal infections in children." },
    { "title": "Neonatal Infections", "description": "Specialized care for infections in newborns." },
    { "title": "Multi-Drug Resistant Infections (MDR)", "description": "Management of complex resistant infections." },
    { "title": "Tropical Diseases", "description": "Management of dengue, malaria, typhoid and parasitic infections." }
  ],
  "procedures": [
    { "title": "Antimicrobial Stewardship Programs", "description": "Implementation of rational antibiotic use in hospitals." },
    { "title": "Infection Control Systems", "description": "Designing and monitoring infection prevention protocols." },
    { "title": "Vaccine Research", "description": "Clinical trials and academic research in immunization." }
  ],
  "faqs": [
    { "question": "Does Dr. Aparna treat complex infections?", "answer": "Yes, she specializes in managing severe and multi-drug resistant infections." },
    { "question": "Is she trained internationally?", "answer": "Yes, she completed her fellowship at SickKids, Toronto and MSc in London." },
    { "question": "Does she work in antimicrobial stewardship?", "answer": "Yes, she has led antimicrobial stewardship programs at major institutions." }
  ]
},
{
  "slug": "dr-aparna-h-mahajan",
  "name": "Dr. Aparna H. Mahajan",
  "specialty": "ENT (Otorhinolaryngology)",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – ENT",
  "degree": "MBBS | MS (ENT) | MRCS ENT (London)",
  "about": "Dr. Aparna Mahajan is a highly accomplished ENT surgeon with over a decade of experience. A graduate of the Mahatma Gandhi Institute of Medical Sciences, she later completed MRCS ENT from the Royal College of Surgeons, London. She has undergone advanced training in Cardiff, Wales, and has worked at reputed hospitals such as Fortis Escorts, VIMHANS, ESIC Medical College, and Park Hospital. She is experienced in skull base surgery, cochlear implants, sinus surgery, paediatric bronchoscopy, and complex ENT surgical procedures. Dr. Aparna successfully performed numerous rigid bronchoscopies in infants with airway foreign bodies and treated multiple mucormycosis cases during the COVID era.",
  "medicalProblems": [
    { "title": "Chronic Sinusitis", "description": "Evaluation and treatment of long-standing sinus conditions." },
    { "title": "Hearing Loss & Ear Disorders", "description": "Management of conductive and sensorineural hearing problems." },
    { "title": "Airway Foreign Bodies", "description": "Paediatric bronchoscopy for removal of foreign bodies." },
    { "title": "Voice & Laryngeal Disorders", "description": "Treatment of voice problems and laryngeal conditions." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus Surgery", "description": "Advanced minimally invasive sinus procedures." },
    { "title": "Cochlear Implants", "description": "Surgical restoration for profound hearing loss." },
    { "title": "Paediatric Rigid Bronchoscopy", "description": "Expert removal of airway foreign bodies in children." },
    { "title": "Ear Microsurgery", "description": "Surgical treatment for chronic ear diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Aparna perform cochlear implant surgeries?", "answer": "Yes, she is experienced in cochlear implant procedures." },
    { "question": "Does she treat sinus problems?", "answer": "Yes, she specializes in endoscopic sinus surgery." },
    { "question": "Is she trained internationally?", "answer": "Yes, she completed MRCS ENT from London with additional training in Cardiff." }
  ]
},
{
  "slug": "dr-arjun-khanna",
  "name": "Dr. Arjun Khanna",
  "specialty": "Pulmonary Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Head – Pulmonary Medicine",
  "degree": "MD | DM (Pulmonary & Critical Care) | FCCP | FNCCP | FAPSR",
  "about": "Dr. Arjun Khanna is one of the few DM-trained Pulmonary Medicine specialists in India and a highly accomplished clinician, researcher and academic leader. An alumnus of King George Medical College, he has served as faculty at AIIMS New Delhi and has received more than 10 gold medals during his medical training. He has over 100 publications and has delivered more than 500 invited lectures. He received the Global Rising Star Award in Pulmonary Medicine at an international conference in France. His expertise includes advanced respiratory failure, severe COPD, asthma, interstitial lung diseases, interventional pulmonology and pulmonary rehabilitation.",
  "medicalProblems": [
    { "title": "Severe COPD", "description": "Comprehensive evaluation and long-term management." },
    { "title": "Asthma & Allergies", "description": "Management of difficult-to-treat asthma and allergic airway diseases." },
    { "title": "Interstitial Lung Disease (ILD)", "description": "Diagnosis and advanced ILD care." },
    { "title": "Sleep Disorders", "description": "Evaluation and management of sleep-related breathing disorders." }
  ],
  "procedures": [
    { "title": "Interventional Pulmonology", "description": "Advanced procedures including bronchoscopy and airway interventions." },
    { "title": "Pulmonary Rehabilitation", "description": "Rehabilitation programs for chronic lung disease." },
    { "title": "Biologic Therapy for Asthma", "description": "Advanced biologic treatments for severe asthma." }
  ],
  "faqs": [
    { "question": "Does Dr. Arjun treat severe COPD?", "answer": "Yes, COPD and chronic airway diseases are key areas of his expertise." },
    { "question": "Is he trained in interventional pulmonology?", "answer": "Yes, he completed advanced training at Siriraj Hospital, Bangkok." },
    { "question": "Has he received international awards?", "answer": "Yes, including the Global Rising Star Award in Pulmonary Medicine." }
  ]
},
{
  "slug": "dr-arun-sharma",
  "name": "Dr. Arun Sharma",
  "specialty": "Plastic & Reconstructive Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant & Assistant Professor – Plastic & Reconstructive Surgery",
  "degree": "BDS | MDS (Oral & Maxillofacial Surgery) | Certificate in Oral & Maxillofacial Implantology",
  "about": "Dr. Arun Sharma is a Consultant and Assistant Professor in the Department of Plastic & Reconstructive Surgery at Amrita Hospital, Faridabad. With over 13 years of experience, he specializes in Oral and Maxillofacial Surgery, craniofacial surgery, cleft care, and facial trauma. A graduate of Manipal University with an MDS from KLE University, he has worked extensively with major plastic and reconstructive surgery units across Delhi. He has over 10 years of experience in cleft and craniofacial surgery and has been part of leading craniofacial teams in India. His expertise spans facial trauma, orthognathic surgery, TMJ disorders, craniosynostosis, and complex dental implant rehabilitation including zygomatic and pterygoid implants.",
  "medicalProblems": [
    { "title": "Facial Trauma", "description": "Management of complex facial injuries and fractures." },
    { "title": "Cleft Lip & Palate", "description": "Comprehensive cleft and craniofacial deformity correction." },
    { "title": "TMJ Disorders", "description": "Evaluation and surgical management of temporomandibular joint issues." },
    { "title": "Craniosynostosis", "description": "Surgical correction of premature skull bone fusion." }
  ],
  "procedures": [
    { "title": "Orthognathic Surgery", "description": "Jaw alignment surgeries for facial aesthetics and function." },
    { "title": "Craniofacial Surgery", "description": "Correction of congenital facial deformities." },
    { "title": "Dental Implants", "description": "Advanced implant procedures including zygomatic and pterygoid implants." },
    { "title": "Profiloplasty", "description": "Facial aesthetic surgeries for structural enhancement." }
  ],
  "faqs": [
    { "question": "Does Dr. Arun perform cleft and craniofacial surgeries?", "answer": "Yes, he has over 10 years of specialized experience in craniofacial and cleft surgery." },
    { "question": "Does he handle complex dental implant cases?", "answer": "Yes, he specializes in advanced implants including zygomatic and pterygoid implants." },
    { "question": "Does he treat facial trauma?", "answer": "Yes, he is highly experienced in managing all types of facial trauma." }
  ]
},
{
  "slug": "dr-ashish-katewa",
  "name": "Dr. Ashish Katewa",
  "specialty": "Paediatric & Adult Congenital Heart Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head of Department – Paediatric & Adult Congenital Heart Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Cardiovascular & Thoracic Surgery) | Fellowship in Paediatric Cardiac Surgery",
  "about": "Dr. Ashish Katewa is an acclaimed Paediatric and Congenital Heart Surgeon with over 14 years of experience and more than 6000 paediatric cardiac surgeries performed across a wide spectrum of heart conditions. He has trained at premier institutions including SMS Medical College Jaipur, KEM Hospital Mumbai, and the Children’s Hospital at Westmead, Australia. He has led humanitarian pediatric cardiac missions across India and abroad, and has mentored cardiac programs in Cambodia and Nigeria. Dr. Katewa works closely with governments, NGOs and global foundations to improve congenital heart disease awareness and accessible care. His expertise spans neonatal heart surgeries, complex congenital heart repairs, single-ventricle physiology, arrhythmia surgery, and bloodless cardiac surgery.",
  "medicalProblems": [
    { "title": "Congenital Heart Defects", "description": "Diagnosis and surgical correction of birth-related heart abnormalities." },
    { "title": "Neonatal Heart Disease", "description": "Specialized cardiac surgery for newborns with life-threatening defects." },
    { "title": "Pediatric Heart Failure", "description": "Surgical management of cardiomyopathy and advanced heart failure in children." },
    { "title": "Adult Congenital Heart Disease", "description": "Surgical care for adults with congenital heart anomalies." }
  ],
  "procedures": [
    { "title": "Neonatal Cardiac Surgery", "description": "Advanced surgeries for newborn cardiac conditions." },
    { "title": "Pediatric Cardiac Surgery", "description": "Treatment of complex congenital heart diseases in children." },
    { "title": "Root Translocation & Complex Repairs", "description": "Specialized reconstruction procedures for advanced cardiac anomalies." },
    { "title": "Arrhythmia Surgery", "description": "Surgical solutions for difficult-to-manage pediatric arrhythmias." },
    { "title": "Bloodless Cardiac Surgery", "description": "Minimally transfusion-dependent cardiac operations." }
  ],
  "faqs": [
    { "question": "Does Dr. Katewa perform neonatal heart surgeries?", "answer": "Yes, neonatal cardiac surgery is one of his core specialties." },
    { "question": "Has he worked internationally?", "answer": "Yes, he has mentored pediatric cardiac programs in Cambodia, Nigeria, and led global humanitarian missions." },
    { "question": "Does he handle complex congenital heart defects?", "answer": "Yes, he has performed over 6000 pediatric cardiac surgeries across all complexity levels." }
  ]
},
{
  "slug": "dr-binoj-s-t",
  "name": "Dr. Binoj S T",
  "specialty": "Gastrointestinal Surgery, Liver Transplantation & HPB Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Clinical Professor – GI Surgery & Transplantation",
  "degree": "MS (General Surgery) | DNB (Surgical Gastroenterology) | Fellowship in Minimal Access Surgery",
  "about": "Dr. Binoj S T is a Clinical Professor in Gastrointestinal Surgery and Liver, Small Bowel and Pancreas Transplantation. With over 15 years of experience, he has extensive expertise in complex GI surgeries, hepatobiliary procedures, and multi-organ transplantation. He has received multiple national awards for his pioneering research on liver transplantation and immunosuppression. Dr. Binoj has contributed to major international research trials, including randomized studies on venous thromboembolism prevention, stem cell therapy for critical limb ischemia, antifungal trials, and intra-abdominal infection treatments. His work is widely published in national and international journals.",
  "medicalProblems": [
    { "title": "Liver Failure", "description": "Evaluation and surgical management including liver transplantation." },
    { "title": "Pancreatic Diseases", "description": "Management of pancreatic cancers and benign pancreatic conditions." },
    { "title": "Small Bowel Disorders", "description": "Treatment including small bowel transplantation." },
    { "title": "Gastrointestinal Cancers", "description": "Comprehensive surgical care for GI malignancies." }
  ],
  "procedures": [
    { "title": "Liver Transplantation", "description": "Living donor and deceased donor liver transplant surgeries." },
    { "title": "Minimal Access GI Surgery", "description": "Laparoscopic interventions for digestive diseases." },
    { "title": "Pancreas Transplant & HPB Surgery", "description": "Advanced hepatobiliary and pancreatic procedures." },
    { "title": "Small Bowel Transplantation", "description": "Surgical treatment for intestinal failure." }
  ],
  "faqs": [
    { "question": "Does Dr. Binoj perform liver transplants?", "answer": "Yes, he has extensive experience in living and deceased donor liver transplantation." },
    { "question": "Has he published research?", "answer": "Yes, he has multiple publications including award-winning studies on liver transplant immunosuppression." },
    { "question": "Is he involved in clinical trials?", "answer": "Yes, he has been Co-Investigator in several multinational randomized trials." }
  ]
},
{
  "slug": "dr-deepti-sharma",
  "name": "Dr. Deepti Sharma",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Professor & Head – Obstetrics & Gynaecology",
  "degree": "MBBS | MS (Obstetrics & Gynaecology) | Diploma in Pelvic Endoscopy",
  "about": "Dr. Deepti Sharma is a renowned Obstetrician and Gynaecologist with over 25 years of clinical and academic excellence. She specializes in high-risk pregnancies, advanced laparoscopic surgery, operative hysteroscopy, pelvic floor reconstruction and management of complex gynaecological disorders. Trained at SMS Medical College, Jaipur, and the prestigious Kiel School of Gynecological Endoscopy in Germany, she brings world-class expertise to women’s healthcare. Dr. Sharma is known for her evidence-based approach, preventive care focus, and commitment to training the next generation of medical professionals.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Expert care for complicated and high-risk maternal conditions." },
    { "title": "Cesarean Scar Ectopic Pregnancy", "description": "Diagnosis and surgical management of rare ectopic implantations." },
    { "title": "Pelvic Floor Disorders", "description": "Management of prolapse, incontinence and pelvic floor dysfunction." },
    { "title": "Adolescent Gynaecology", "description": "Hormonal, menstrual and developmental concerns in adolescents." }
  ],
  "procedures": [
    { "title": "Advanced Laparoscopic Surgery", "description": "Minimally invasive solutions for complex gynaecological conditions." },
    { "title": "Operative Hysteroscopy", "description": "Endoscopic procedures for uterine abnormalities." },
    { "title": "Pelvic Floor Reconstruction", "description": "Colposuspension, sling surgeries and pelvic restorative procedures." },
    { "title": "Endoscopic Ovarian Transposition", "description": "Ovarian preservation in young cancer patients undergoing pelvic radiation." }
  ],
  "faqs": [
    { "question": "Does Dr. Deepti manage high-risk pregnancies?", "answer": "Yes, she is highly experienced in managing complex and high-risk maternal cases." },
    { "question": "Does she perform advanced laparoscopic surgeries?", "answer": "Yes, she is a leading expert in minimally invasive gynaecological procedures." },
    { "question": "Is she involved in teaching?", "answer": "Yes, she has been teaching and mentoring medical students and residents for over 20 years." }
  ]
},
{
  "slug": "dr-dinesh-balakrishnan",
  "name": "Dr. Dinesh Balakrishnan",
  "specialty": "Gastrointestinal Surgery, Surgical Oncology & Organ Transplantation",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Clinical Professor – Digestive Diseases, GI Surgery & Transplantation",
  "degree": "MBBS | MS (General Surgery) | DNB (General Surgery) | Fellowship – Minimal Access Surgery | Senior Clinical Fellow – Solid Organ Transplant (Cambridge)",
  "about": "Dr. Dinesh Balakrishnan is a distinguished GI surgeon and transplant specialist with more than 20 years of experience. He trained at premier institutions including Medical College Calicut, Medical College Kottayam, and Addenbrooke’s Hospital, Cambridge, where he gained advanced expertise in multivisceral transplantation and organ retrieval. Dr. Balakrishnan has been an integral part of the solid organ transplant program at Amrita Institute, contributing significantly to liver, pancreas and small bowel transplant initiatives. He has led numerous public health awareness programs across India and has participated in major global clinical trials involving antifungal therapies, antibiotics and cancer treatment protocols.",
  "medicalProblems": [
    { "title": "Gastrointestinal Cancers", "description": "Comprehensive surgical care for stomach, colorectal and liver cancers." },
    { "title": "Liver & Pancreatic Diseases", "description": "Management of complex hepatobiliary and pancreatic conditions." },
    { "title": "Organ Failure", "description": "Evaluation for liver, pancreas and small bowel transplantation." },
    { "title": "Esophageal Disorders", "description": "Surgical management of benign and malignant esophageal diseases." }
  ],
  "procedures": [
    { "title": "Liver Transplantation", "description": "Advanced transplant procedures including multi-organ retrieval." },
    { "title": "GI Oncologic Surgery", "description": "Surgery for tumors of the stomach, colon, liver and pancreas." },
    { "title": "Minimal Access Surgery", "description": "Laparoscopic solutions for digestive and abdominal diseases." },
    { "title": "Pancreas & Small Bowel Transplant", "description": "Transplant procedures for complex organ failure." }
  ],
  "faqs": [
    { "question": "Is Dr. Dinesh involved in transplant surgery?", "answer": "Yes, he has extensive experience in liver, pancreas and small bowel transplantation." },
    { "question": "Has he participated in clinical trials?", "answer": "Yes, he has been a co-investigator in multiple global randomized trials." },
    { "question": "Does he treat GI cancers?", "answer": "Yes, he specializes in surgical management of gastrointestinal and hepatobiliary cancers." }
  ]
},
{
  "slug": "dr-divyam-girdhar",
  "name": "Dr. Divyam Girdhar",
  "specialty": "Endodontics & Conservative Dentistry",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "6+ years (post-MDS)",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Endodontist",
  "degree": "BDS | MDS (Conservative Dentistry & Endodontics)",
  "about": "Dr. Divyam Girdhar is a highly skilled Endodontist with extensive experience in micro-endodontics, retreatment procedures, aesthetic dentistry and advanced restorative techniques. Trained at prestigious institutions such as PGIDS Rohtak and B.R. Ambedkar University Agra, he has worked as a Senior Resident and Assistant Professor in leading dental colleges in Delhi-NCR. He has a strong academic and research background with multiple national and international publications and book chapters. He is known for his precision-driven approach, especially in microsurgical endodontics, single-visit RCTs and smile correction.",
  "medicalProblems": [
    { "title": "Tooth Pain & Infection", "description": "Diagnosis and treatment of pulp infections and dental abscesses." },
    { "title": "Failed Root Canals", "description": "Advanced retreatment and corrective endodontic procedures." },
    { "title": "Aesthetic Dental Concerns", "description": "Smile correction for discoloration, shape defects and uneven teeth." },
    { "title": "Tooth Fractures & Structural Loss", "description": "Restoration of compromised teeth using advanced techniques." }
  ],
  "procedures": [
    { "title": "Root Canal Treatment (RCT)", "description": "Single-sitting and multi-visit RCT using microscopic precision." },
    { "title": "Microsurgical Endodontics", "description": "Advanced minimally invasive surgeries for complex root issues." },
    { "title": "Smile Correction", "description": "Ceramic veneers, crowns, whitening and aesthetic restorations." },
    { "title": "Retreatment Procedures", "description": "Correction of previous inadequate or failed dental treatments." }
  ],
  "faqs": [
    { "question": "Does Dr. Divyam perform single-sitting RCTs?", "answer": "Yes, he specializes in single-sitting root canal treatments using modern techniques." },
    { "question": "Does he handle failed root canals?", "answer": "Yes, he is highly experienced in endodontic retreatment and microsurgical corrections." },
    { "question": "Does he offer aesthetic dentistry?", "answer": "Yes, including smile correction, veneers and cosmetic restorations." }
  ]
},
{
  "slug": "dr-gargi-agarwal",
  "name": "Dr. Gargi Agarwal",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Professor & Senior Consultant – Obstetrics & Gynaecology",
  "degree": "MBBS | MD (Obstetrics & Gynaecology) | DNB | FMAS",
  "about": "Dr. Gargi Agarwal is an accomplished Obstetrician & Gynaecologist with over 12 years of clinical and academic experience. She completed her MBBS with Gold Medal and Distinction from Bundelkhand University, followed by MD (OBGYN) from the prestigious King George Medical University (KGMU), Lucknow. She has received multiple university-level Gold Medals and awards for academic excellence and research. Dr. Gargi has worked as Assistant Professor, Senior Resident and Registrar at premier medical institutions across India, including Lady Hardinge Medical College and Queen Mary’s Hospital, Lucknow. Her expertise spans high-risk pregnancy, infertility, hysteroscopy, laparoscopy and advanced gynaecological procedures.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Holistic care for complex and high-risk obstetric cases." },
    { "title": "Female Infertility", "description": "Evaluation and treatment of infertility-related concerns." },
    { "title": "Menstrual Disorders", "description": "Management of irregular cycles, PCOS and hormonal issues." },
    { "title": "Uterine & Ovarian Conditions", "description": "Fibroids, cysts, polyps and related gynaecological diseases." }
  ],
  "procedures": [
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive procedures for gynaecological disorders." },
    { "title": "Hysteroscopic Surgery", "description": "Uterine polyp removal, septum correction and diagnostic hysteroscopy." },
    { "title": "Infertility Treatments", "description": "Comprehensive management for couples with fertility issues." },
    { "title": "Obstetric Care", "description": "Safe delivery planning and pregnancy care including high-risk cases." }
  ],
  "faqs": [
    { "question": "Does Dr. Gargi specialize in high-risk pregnancy?", "answer": "Yes, she has significant expertise in managing complicated pregnancies." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, she is trained in advanced laparoscopy and hysteroscopy." },
    { "question": "Does she treat infertility?", "answer": "Yes, she manages a wide range of infertility-related conditions." }
  ]
},
{
  "slug": "dr-gaurav-khanna",
  "name": "Dr. Gaurav Khanna",
  "specialty": "Pathology (Histopathology)",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Histopathology",
  "degree": "MBBS | MD (Pathology) | PDCC – Hepatopathology",
  "about": "Dr. Gaurav Khanna is a renowned histopathologist with deep expertise in oncopathology, neuropathology and hepatopathology. He completed MBBS from Government Medical College, Amritsar and pursued MD Pathology at AIIMS New Delhi, where he trained under some of India’s foremost pathology experts. He later completed a PDCC fellowship in hepatopathology at the Institute of Liver and Biliary Sciences (ILBS), India’s premier liver institute. Dr. Khanna has worked with leading surgeons and clinicians at Fortis Memorial Research Institute, Gurugram, and is widely respected for his precision, diagnostic accuracy and research contributions. He has numerous publications and has been invited as faculty for national-level pathology workshops and CMEs.",
  "medicalProblems": [
    { "title": "Cancer Diagnosis", "description": "Histopathological evaluation for accurate cancer detection." },
    { "title": "Liver Diseases", "description": "Advanced biopsy interpretation in hepatitis, cirrhosis and tumors." },
    { "title": "Brain & Nerve Tumors", "description": "Specialized diagnosis in neuropathology." },
    { "title": "Inflammatory & Autoimmune Conditions", "description": "Biopsy-based assessment for systemic and organ-specific disorders." }
  ],
  "procedures": [
    { "title": "Histopathology Reporting", "description": "Microscopic tissue diagnosis for all major organs and diseases." },
    { "title": "Liver Biopsy Analysis", "description": "Specialized interpretation of liver biopsies including complex cases." },
    { "title": "Oncopathology Panels", "description": "Advanced tumor typing and immunohistochemistry." },
    { "title": "Neuropathology Evaluation", "description": "Detailed reporting of brain, spine and nerve lesions." }
  ],
  "faqs": [
    { "question": "Does Dr. Gaurav specialize in cancer pathology?", "answer": "Yes, oncopathology is one of his primary areas of expertise." },
    { "question": "Is he trained in liver pathology?", "answer": "Yes, he completed a specialized PDCC fellowship in hepatopathology at ILBS." },
    { "question": "Does he handle neuropathology cases?", "answer": "Yes, he has significant experience in diagnosing complex brain and nerve tumors." }
  ]
},
{
  "slug": "dr-hyacinth-peninnah-paljor",
  "name": "Dr. Hyacinth Peninnah Paljor",
  "specialty": "Internal Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Internal Medicine",
  "degree": "MBBS | MD (Internal Medicine)",
  "about": "Dr. Hyacinth Peninnah Paljor is a Senior Consultant in Internal Medicine with over 35 years of extensive clinical experience in outpatient, inpatient and critical care settings. A graduate of Mysore Medical College with MD from Bangalore Medical College, she has served in India and internationally across government hospitals, multispecialty centers, and major tertiary care institutions. She has held pivotal leadership roles such as Senior Consultant & Head of Medicine at St. Stephen’s Hospital, Delhi, and Director Academics & Head of Wellness Centre at Sarvodaya Hospital, Faridabad. She is also a National Board–recognized teacher, examiner and thesis guide with decades of experience training DNB postgraduate students. Dr. Paljor is known for her compassionate patient care, excellence in diagnosis, and her strong commitment to medical education and ethics.",
  "medicalProblems": [
    { "title": "Chronic Lifestyle Diseases", "description": "Management of diabetes, hypertension, thyroid disorders and metabolic conditions." },
    { "title": "Infectious Diseases", "description": "Comprehensive care for viral, bacterial and parasitic infections." },
    { "title": "Critical Care Conditions", "description": "Expert management of acute medical emergencies and ICU-level care." },
    { "title": "Geriatric Medicine", "description": "Holistic care for elderly patients with multiple comorbidities." }
  ],
  "procedures": [
    { "title": "Chronic Disease Management", "description": "Long-term care plans for diabetes, hypertension and endocrine issues." },
    { "title": "Critical Care Management", "description": "Evaluation and stabilization of serious medical emergencies." },
    { "title": "Preventive Health Programs", "description": "Wellness assessments and lifestyle modification guidance." }
  ],
  "faqs": [
    { "question": "Does Dr. Paljor treat chronic diseases?", "answer": "Yes, she extensively manages diabetes, hypertension, thyroid issues and other long-standing medical conditions." },
    { "question": "Is she experienced in critical care?", "answer": "Yes, she has decades of experience caring for ICU and emergency patients." },
    { "question": "Is she involved in medical education?", "answer": "Yes, she is a National Board–recognized teacher, examiner and thesis guide." }
  ]
},
{
  "slug": "dr-jaya-agarwal",
  "name": "Dr. Jaya Agarwal",
  "specialty": "Solid Organ Transplantation & HPB Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Assistant Professor – GI Surgery, Solid Organ Transplant & HPB Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (GI Surgery & Solid Organ Transplant) | FALS (Colorectal) | Fellowship in HPB Surgery | Fellowship in Liver Transplant & Organ Retrieval",
  "about": "Dr. Jaya Agarwal is an accomplished Hepato-Pancreato-Biliary (HPB) and Solid Organ Transplant surgeon with advanced expertise in complex GI surgeries, liver transplant, pancreas transplant and robotic HPB procedures. A Gold Medalist in MS and MCh, she has trained at premier national centers including PGIMER Chandigarh, GB Pant Institute New Delhi and Amrita Institute of Medical Sciences, Kochi. She has extensive hands-on experience in managing high-risk HPB cancers, advanced laparoscopic and robotic surgeries, and both living and deceased donor liver transplant surgeries. Her dedication to research has earned her multiple national and international awards. She holds advanced fellowships in colorectal and HPB surgery and is recognized for her precision, surgical finesse and strong academic contributions.",
  "medicalProblems": [
    { "title": "Liver Diseases & Liver Cancer", "description": "Comprehensive surgical care for liver tumors, cirrhosis and complex hepatobiliary conditions." },
    { "title": "Gallbladder Disorders", "description": "Management of gallstones, gallbladder cancer and biliary tract diseases." },
    { "title": "Pancreatic Diseases", "description": "Surgery for pancreatic cancer, pancreatitis and benign pancreatic conditions." },
    { "title": "Organ Failure Conditions", "description": "Evaluation for liver, pancreas and small bowel transplantation." }
  ],
  "procedures": [
    { "title": "Liver Transplant Surgery", "description": "Living and deceased donor liver transplant procedures." },
    { "title": "Robotic HPB Surgery", "description": "Minimally invasive robotic surgery for liver, pancreas and GI cancers." },
    { "title": "Gallbladder & Bile Duct Surgery", "description": "Advanced surgery for gallbladder cancer and bile duct diseases." },
    { "title": "Pancreas & Small Bowel Transplant", "description": "Complex transplant procedures for advanced organ failure." }
  ],
  "faqs": [
    { "question": "Does Dr. Jaya perform liver transplants?", "answer": "Yes, she specializes in both living and deceased donor liver transplantation." },
    { "question": "Does she offer robotic HPB surgery?", "answer": "Yes, she performs robotic surgeries for GI and HPB conditions." },
    { "question": "Is she experienced with pancreatic and bile duct surgeries?", "answer": "Yes, she has extensive expertise in pancreatic, biliary and hepatobiliary surgeries." }
  ]
},
{
  "slug": "dr-jayadatta-pawar",
  "name": "Dr. Jayadatta Pawar",
  "specialty": "General Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant & Assistant Professor – General Surgery",
  "degree": "MBBS | MS (General Surgery) | FNB (Laparoscopic & Robotic Surgery) | FALS (Bariatric Surgery) | FCRS (Colorectal Surgery, Hong Kong)",
  "about": "Dr. Jayadatta Pawar is a highly skilled and technologically advanced General & Minimal Access Surgeon specializing in laparoscopic, robotic, bariatric and colorectal surgeries. Trained at leading institutions such as GB Pant Hospital, Sir Ganga Ram Hospital and GEM, Coimbatore, he has also undergone advanced international training in colorectal and bariatric surgery in Hong Kong. His expertise includes complex hernia surgeries, abdominal wall reconstruction, weight-loss procedures, gallbladder surgery and robotic interventions. Dr. Pawar is academically active with multiple book chapters, international orations (Vietnam, Rome) and research contributions. Known for his precision-driven surgical approach, he strongly believes in combining modern technology with empathy-driven patient care.",
  "medicalProblems": [
    { "title": "Gallbladder Stones", "description": "Advanced laparoscopic and robotic removal of gallbladder stones." },
    { "title": "Hernia & Abdominal Wall Defects", "description": "Management of simple to complex hernias with reconstruction techniques." },
    { "title": "Colorectal Disorders", "description": "Surgical management of colon, rectal conditions and anorectal diseases." },
    { "title": "Obesity & Metabolic Issues", "description": "Weight-loss and bariatric surgery for obesity and related disorders." }
  ],
  "procedures": [
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive surgery for gallbladder, hernia, colorectal and upper GI disorders." },
    { "title": "Robotic Surgery", "description": "Precision surgery for complex abdominal and colorectal conditions." },
    { "title": "Bariatric Surgery", "description": "Weight-loss procedures including sleeve gastrectomy and gastric bypass." },
    { "title": "Colorectal Surgery", "description": "Surgical management of fistula, hemorrhoids, polyps, tumors and colorectal diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Pawar perform laparoscopic hernia repairs?", "answer": "Yes, he specializes in laparoscopic and robotic hernia and abdominal wall reconstruction surgeries." },
    { "question": "Does he perform bariatric/weight-loss surgery?", "answer": "Yes, he is trained and certified in bariatric surgery including advanced FALS fellowship." },
    { "question": "Has he received international training?", "answer": "Yes, he completed specialized colorectal and bariatric surgical training in Hong Kong and has spoken at global conferences." }
  ]
},
{
  "slug": "dr-krishnanunni-nair",
  "name": "Dr. Krishnanunni Nair",
  "specialty": "Solid Organ Transplantation & HPB Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Professor – Solid Organ Transplant & HPB Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Surgical Gastroenterology) | FMAS",
  "about": "Dr. Krishnanunni Nair is an accomplished HPB and Solid Organ Transplant surgeon with over a decade of experience in liver, pancreas and intestinal transplantation. Trained entirely at Amrita Institute of Medical Sciences, Kochi, he has been an integral part of pioneering robotic donor hepatectomy development in India. Since 2012, he has contributed significantly to the advancement of HPB surgeries and robotic GI procedures. He has also completed international transplantation rotations at UCLA and UCSF under globally renowned transplant surgeons. A prolific academician, he has multiple prestigious international publications and is an active member of global transplant and HPB societies. He is passionate about making transplantation and robotic surgery accessible to more patients across India.",
  "medicalProblems": [
    { "title": "Liver Failure & Liver Cancer", "description": "Evaluation and treatment planning for liver transplant and complex liver resections." },
    { "title": "Pancreatic Diseases", "description": "Management of pancreatic tumors, chronic pancreatitis and resection surgeries." },
    { "title": "Biliary Disorders", "description": "Treatment of complex bile duct injuries, strictures and cholangiocarcinoma." },
    { "title": "Intestinal Failure", "description": "Assessment and surgical management including intestinal transplant." }
  ],
  "procedures": [
    { "title": "Liver Transplantation", "description": "Living and deceased donor liver transplantation." },
    { "title": "Robotic Donor Hepatectomy", "description": "Advanced robotic liver donor surgery developed at Amrita." },
    { "title": "Pancreatic Transplantation", "description": "Transplant and surgical treatment for pancreatic failure." },
    { "title": "Robotic HPB Surgery", "description": "Minimally invasive robotic liver, pancreas and biliary surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Krishnanunni perform robotic donor hepatectomy?", "answer": "Yes, he has been directly involved in developing and performing robotic donor hepatectomy since its inception at Amrita." },
    { "question": "Does he manage pancreatic and intestinal transplants?", "answer": "Yes, he has extensive experience in pancreas and intestinal transplantation." },
    { "question": "Has he trained internationally?", "answer": "Yes, he completed advanced transplant rotations at UCLA and UCSF in the USA." }
  ]
},
{
  "slug": "dr-kunal-raj-gandhi",
  "name": "Dr. Kunal Raj Gandhi",
  "specialty": "Nephrology & Kidney Transplantation",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Assistant Professor – Nephrology",
  "degree": "MBBS | MD (General Medicine) | DM (Nephrology)",
  "about": "Dr. Kunal Raj Gandhi is an experienced Nephrologist with extensive expertise in kidney transplantation, interventional nephrology and management of complex renal disorders. He completed his DM in Nephrology from the prestigious Sawai Man Singh Medical College, Jaipur. He has successfully managed a wide spectrum of kidney transplant cases, including high-risk and ABO-incompatible transplants. With more than 1000 interventional nephrology procedures such as renal biopsies, permacath insertions and dialysis catheter placements, Dr. Gandhi is widely recognized for his precision and technical skill. He has been part of major clinical research trials and published over 20 scientific papers in national and international journals.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease (CKD)", "description": "Comprehensive diagnosis and long-term management of CKD." },
    { "title": "Acute Kidney Injury (AKI)", "description": "Emergency management of sudden kidney failure." },
    { "title": "Kidney Transplant Conditions", "description": "Evaluation of donors and recipients including high-risk transplants." },
    { "title": "Dialysis-Related Issues", "description": "Management of hemodialysis, peritoneal dialysis and CRRT complications." }
  ],
  "procedures": [
    { "title": "Renal Biopsy", "description": "Ultrasound-guided kidney biopsy for accurate diagnosis." },
    { "title": "Vascular Access Procedures", "description": "Placement of temporary and tunneled dialysis catheters including permacath." },
    { "title": "Kidney Transplantation", "description": "ABO-incompatible, deceased donor and high-risk kidney transplants." },
    { "title": "Dialysis Therapies", "description": "CRRT, HDF and peritoneal dialysis for critically ill patients." }
  ],
  "faqs": [
    { "question": "Does Dr. Gandhi perform kidney transplant procedures?", "answer": "Yes, he is experienced in all forms of kidney transplant including high-risk and ABO-incompatible transplants." },
    { "question": "Is he trained in interventional nephrology?", "answer": "Yes, he has performed over 1000 interventional nephrology procedures." },
    { "question": "Does he manage dialysis therapies?", "answer": "Yes, he is proficient in CRRT, HDF, peritoneal dialysis and transplant-related renal care." }
  ]
},
{
  "slug": "dr-manav-suryavanshi",
  "name": "Dr. Manav Suryavanshi",
  "specialty": "Urology, Uro-Oncology & Robotic Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & Head – Urology | Program Head – Uro-Oncology & Robotic Surgery",
  "degree": "MBBS | MS | MCh (Urology, Gold Medalist) | Robotic Surgery Fellowship (Belgium)",
  "about": "Dr. Manav Suryavanshi is a highly accomplished Uro-Oncologist and one of India’s leading robotic urology surgeons with over 18 years of expertise. A Gold Medalist in MCh Urology, he was previously Director of Uro-Oncology & Robotic Surgery at Medanta, where he established one of the first successful robotic surgery programs in the country. He has performed more than 3000 robotic and laparoscopic surgeries for prostate, kidney, bladder, testicular and adrenal disorders. Dr. Manav has over 20 indexed publications, more than 100 video presentations, and 50 invited lectures to his credit. He is widely recognized for his advanced skills in robotic cancer surgery, minimally invasive procedures, and complex urological oncology.",
  "medicalProblems": [
    { "title": "Prostate Cancer", "description": "Advanced evaluation and robotic radical prostatectomy." },
    { "title": "Kidney Tumors", "description": "Management of small to advanced renal masses including IVC thrombus cases." },
    { "title": "Bladder Cancer", "description": "Robotic radical cystectomy with neobladder/ileal conduit reconstruction." },
    { "title": "Testicular & Penile Cancers", "description": "Expertise in RPLND, orchiectomy and penile cancer surgery." }
  ],
  "procedures": [
    { "title": "Robotic Prostatectomy (RARP)", "description": "Precision robotic surgery for prostate cancer." },
    { "title": "Robotic Nephrectomy (RPN/RN)", "description": "Partial and radical nephrectomy using robotic techniques." },
    { "title": "Robotic Cystectomy", "description": "Bladder removal with urinary reconstruction." },
    { "title": "RPLND & Inguinal LND", "description": "Advanced lymph node dissections for testicular and penile cancer." }
  ],
  "faqs": [
    { "question": "Has Dr. Manav performed robotic surgeries?", "answer": "Yes, he has performed over 3000 robotic and laparoscopic urological cancer surgeries." },
    { "question": "Does he specialize in prostate and kidney cancer?", "answer": "Yes, prostate, kidney, bladder, adrenal and testicular cancers are his core specialties." },
    { "question": "Has he won awards for his work?", "answer": "Yes, he has received multiple national awards including the Dr. Dipak L. Kothari Gold Medal." }
  ]
},
{
  "slug": "dr-maninder-dhaliwal",
  "name": "Dr. Maninder Singh Dhaliwal",
  "specialty": "Paediatric Intensive Care (PICU) & Paediatric Respiratory Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Paediatric Critical Care & Respiratory Medicine",
  "degree": "MBBS | MD (Paediatrics) | Fellowship in Paediatric Critical Care (IAP-ISCCM) | Diploma in Allergy & Asthma",
  "about": "Dr. Maninder Singh Dhaliwal is a highly experienced Paediatric Intensive Care specialist with over 18 years of expertise in managing critically ill children. He completed his MBBS and MD in Paediatrics from KMC Manipal & Mangalore and later trained in Paediatric Critical Care at Sir Ganga Ram Hospital, New Delhi. He has led major PICU services at Medanta – The Medicity for more than a decade, handling complex cases including solid organ transplant ICU care, neuro-PICU cases, acute liver failure, refractory respiratory illness and advanced multi-organ support therapies such as ECMO, HFOV, CRRT and iNO. He is an accredited instructor with multiple national and international paediatric critical care training programs and has mentored numerous paediatric intensivists.",
  "medicalProblems": [
    { "title": "Severe Respiratory Illness", "description": "Management of asthma, chronic cough, non-resolving pneumonia and recurrent infections." },
    { "title": "Critical Paediatric Conditions", "description": "Sepsis, shock, multi-organ failure and acute liver failure." },
    { "title": "Paediatric Lung Disorders", "description": "Cystic fibrosis, bronchiectasis and interstitial lung diseases in children." },
    { "title": "Complex PICU Cases", "description": "Neuro-PICU cases, BMT and transplant ICU care." }
  ],
  "procedures": [
    { "title": "Paediatric Bronchoscopy", "description": "Diagnostic and therapeutic bronchoscopy in children." },
    { "title": "Paediatric Lung Function Tests", "description": "Assessment of respiratory physiology in infants and children." },
    { "title": "Advanced PICU Therapies", "description": "ECMO, HFOV, SLED, CRRT, iNO and long-term ventilation support." },
    { "title": "Allergy & Asthma Management", "description": "Evaluation and treatment for childhood asthma and allergy disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Dhaliwal manage complex PICU cases?", "answer": "Yes, he has more than a decade of experience handling transplant ICU, neuro-PICU and multi-organ failure cases." },
    { "question": "Does he perform paediatric bronchoscopy?", "answer": "Yes, he is trained and experienced in paediatric diagnostic and therapeutic bronchoscopy." },
    { "question": "Is he experienced in advanced respiratory support?", "answer": "Yes, he has expertise in ECMO, HFOV, CRRT and advanced ventilatory management." }
  ]
},
{
  "slug": "dr-mansi-kumar",
  "name": "Dr. Mansi Kumar",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Associate Professor – Obstetrics & Gynaecology",
  "degree": "MBBS | MS (Obstetrics & Gynaecology) | FMAS | PGDHM",
  "about": "Dr. Mansi Kumar is a highly experienced Senior Consultant in Obstetrics & Gynaecology with over 13 years of clinical expertise and more than a decade of teaching experience. She is recognized for her work in high-risk pregnancy management, infertility care, minimally invasive gynaecological surgery, and laparoscopic procedures. With strong academic involvement, Dr. Mansi has contributed to medical research, conferences and clinical training programs. Her approach combines evidence-based care, compassionate guidance and advanced surgical skills.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Specialized care for complex and high-risk obstetric conditions." },
    { "title": "Infertility Issues", "description": "Complete evaluation and management of female infertility." },
    { "title": "Menstrual & Hormonal Disorders", "description": "Management of PCOS, irregular periods and hormonal disturbances." },
    { "title": "Uterine & Ovarian Disorders", "description": "Evaluation of fibroids, cysts, endometriosis and pelvic pain." }
  ],
  "procedures": [
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive procedures for gynaecological conditions." },
    { "title": "Obstetric & Gynaec Procedures", "description": "Normal deliveries, C-section and routine surgical care." },
    { "title": "IUD & Contraceptive Procedures", "description": "Expertise in post-placental IUD insertion and contraceptive surgery." },
    { "title": "Infertility Treatment", "description": "Advanced evaluation and treatment for reproductive issues." }
  ],
  "faqs": [
    { "question": "Does Dr. Mansi handle high-risk pregnancies?", "answer": "Yes, she specializes in the management of high-risk and complex pregnancies." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, she is trained in minimally invasive (FMAS) laparoscopic gynecologic procedures." },
    { "question": "Does she treat infertility?", "answer": "Yes, she offers comprehensive infertility evaluation and treatment." }
  ]
},
{
  "slug": "dr-meenakshi-jain",
  "name": "Dr. Meenakshi Jain",
  "specialty": "Psychiatry",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Assistant Professor – Psychiatry",
  "degree": "MBBS | MD (Psychiatry)",
  "about": "Dr. Meenakshi Jain is a renowned Psychiatrist, Psychotherapist, Sexologist and De-addiction Specialist with strong clinical, academic and therapeutic expertise. A gold medalist in both MBBS and MD, she has worked at the prestigious Institute of Human Behaviour and Allied Sciences (IHBAS), New Delhi, serving in OPD, IPD and specialized psychiatry boards. She has extensive experience across Child & Adolescent Psychiatry, Reproductive Psychiatry, Adult Psychiatry, Geriatric Psychiatry and Dual Diagnosis. She is skilled in advanced psychiatric procedures such as Modified Electroconvulsive Therapy (MECT), Repetitive Transcranial Magnetic Stimulation (rTMS) and Biofeedback Therapy. Her treatment philosophy emphasizes empathy, awareness and holistic mental well-being.",
  "medicalProblems": [
    { "title": "Depression & Anxiety Disorders", "description": "Comprehensive diagnosis and treatment for mood and anxiety disorders." },
    { "title": "Addiction & Substance Abuse", "description": "Therapy and medical management for addiction and dependency." },
    { "title": "Child & Adolescent Psychiatry", "description": "Behavioral issues, developmental concerns and emotional disorders." },
    { "title": "Sexual Medicine", "description": "Management of sexual dysfunction and psychosexual disorders." }
  ],
  "procedures": [
    { "title": "MECT (Modified Electroconvulsive Therapy)", "description": "Safe and effective treatment for severe psychiatric disorders." },
    { "title": "Repetitive TMS (rTMS)", "description": "Non-invasive brain stimulation therapy for depression and anxiety." },
    { "title": "Psychotherapy & Counselling", "description": "Evidence-based therapy approaches for behavioral and emotional health." },
    { "title": "Biofeedback Therapy", "description": "Advanced mind–body therapy for stress and psychosomatic disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Meenakshi treat adolescents and children?", "answer": "Yes, she is highly experienced in child and adolescent psychiatry." },
    { "question": "Does she offer treatment for addiction?", "answer": "Yes, she specializes in de-addiction and dual-diagnosis management." },
    { "question": "Does she perform MECT and rTMS?", "answer": "Yes, she is trained in advanced psychiatric procedures including MECT and rTMS." }
  ]
},
{
  "slug": "dr-megha-jain",
  "name": "Dr. Megha Jain",
  "specialty": "Pediatric Dentistry",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Professor – Pediatric Dentistry",
  "degree": "BDS | MDS (Pedodontics & Preventive Dentistry) | FAGE",
  "about": "Dr. Megha Jain is an accomplished Pediatric Dental Surgeon with over 13 years of rich clinical and academic experience. A gold medalist in Pediatric and Preventive Dentistry from Manipal University, she has worked across several major dental centres and medical institutes in Mumbai, Hyderabad, Ahmedabad and Jaipur. Her expertise includes early childhood caries management, full mouth rehabilitation for children, preventive dental care and behavioral management techniques. She is an active researcher with multiple national and international publications. Her approach focuses on creating a child-friendly, comforting dental experience while ensuring the highest standards of treatment.",
  "medicalProblems": [
    { "title": "Early Childhood Caries", "description": "Specialized management of nursing bottle caries and rampant dental decay." },
    { "title": "Orthodontic Issues in Children", "description": "Preventive and interceptive orthodontic care for developing dentition." },
    { "title": "Dental Trauma & Cavities", "description": "Treatment for fractured teeth, deep cavities and emergency pediatric dental issues." },
    { "title": "Oral Habits & Development Issues", "description": "Management of thumb-sucking, tongue-thrusting and other behavioral oral issues." }
  ],
  "procedures": [
    { "title": "Full Mouth Rehabilitation", "description": "Comprehensive treatment for severe dental decay in children and adolescents." },
    { "title": "Preventive Dentistry", "description": "Fluoride therapy, sealants and preventive treatments for children." },
    { "title": "Pediatric Restorative Dentistry", "description": "Fillings, crowns and space maintainers for developing teeth." },
    { "title": "Behavioral Management", "description": "Child-friendly techniques for stress-free dental care." }
  ],
  "faqs": [
    { "question": "Does Dr. Megha treat very young children?", "answer": "Yes, she specializes in infant and toddler dental care including early childhood caries." },
    { "question": "Does she perform full mouth rehabilitation?", "answer": "Yes, she has extensive experience in managing severe dental decay requiring comprehensive care." },
    { "question": "Is she experienced in preventive dental care?", "answer": "Yes, preventive and interceptive pediatric dentistry are key areas of her expertise." }
  ]
},
{
  "slug": "dr-mohit-sharma",
  "name": "Dr. Mohit Sharma",
  "specialty": "Internal Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Internal Medicine",
  "degree": "MBBS | MRCP (UK) – Internal Medicine | MRCP (UK) – Acute Medicine | PgCert Medical Leadership (UK) | PRINCE2 Certification (UK)",
  "about": "Dr. Mohit Sharma is a distinguished physician known for his excellence in holistic, evidence-based Internal Medicine. With significant clinical experience in both India and the UK, he is one of the few full-time practicing physicians with international credentials in medical leadership, ethics, healthcare quality, and patient communication. He has successfully treated numerous complex and multi-system disorders with a patient-centered, empathetic approach. Dr. Mohit is also an academic tutor for postgraduate doctors internationally and has presented his research and quality improvement work at global medical platforms. His unique blend of clinical expertise, leadership training, and human-centric care makes him a highly trusted Internal Medicine specialist.",
  "medicalProblems": [
    { "title": "Complex Multi-Organ Disorders", "description": "Diagnosis and management of systemic and chronic medical conditions." },
    { "title": "Geriatric Medicine", "description": "Comprehensive care for elderly patients with multiple comorbidities." },
    { "title": "Medical Emergencies", "description": "Expert management of acute and life-threatening medical conditions." },
    { "title": "Chronic Disease Management", "description": "Long-term care for diabetes, hypertension, thyroid disorders and metabolic conditions." }
  ],
  "procedures": [
    { "title": "Diagnostic Procedures", "description": "Performance of essential medical diagnostic tests and evaluations." },
    { "title": "Therapeutic Procedures", "description": "Administration of treatments including emergency interventions." },
    { "title": "Critical Care Management", "description": "Management of ICU-level medical cases requiring advanced support." },
    { "title": "Preventive & Lifestyle Medicine", "description": "Guidance for preventive care, wellness and long-term health optimization." }
  ],
  "faqs": [
    { "question": "Does Dr. Mohit manage complex medical cases?", "answer": "Yes, he specializes in multi-organ and chronic complex medical conditions." },
    { "question": "Has he worked internationally?", "answer": "Yes, he has extensive training and clinical exposure in the UK with MRCP and leadership fellowships." },
    { "question": "Does he handle emergencies?", "answer": "Yes, he is highly experienced in acute internal medicine and medical emergency care." }
  ]
},
{
  "slug": "dr-moushumi-suryavanshi",
  "name": "Dr. Moushumi Suryavanshi",
  "specialty": "Molecular Biology & Cytogenetics",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Head – Molecular Biology and Cytogenetics",
  "degree": "PhD | MD (Pathology) | FRCPath (Molecular Pathology) | Masters in Molecular Oncology",
  "about": "Dr. Moushumi Suryavanshi is one of India's most accomplished molecular biologists and clinical scientists, with over 22 years of leadership in molecular diagnostics, personalized cancer genomics, and translational research. She has pioneered liquid biopsy and next-generation sequencing applications in India, establishing advanced molecular laboratories at national-level institutions. She serves in national task forces (ICMR), is an NABL assessor, and plays a global role as internal assessor for EMQN. She has conducted molecular tumor boards, trained numerous postgraduates, and contributed extensively to cancer genomics research. Her expertise spans NGS, digital PCR, ctDNA, molecular biomarkers, hereditary cancer diagnostics, and precision oncology.",
  "medicalProblems": [
    { "title": "Hereditary Cancer Syndromes", "description": "Genetic risk evaluation and molecular diagnosis for hereditary cancers." },
    { "title": "Oncology Biomarkers", "description": "Molecular profiling for diagnosis, prognosis and therapy selection in cancers." },
    { "title": "Immunological Biomarkers", "description": "Advanced biomarker testing for immunotherapy and targeted therapy guidance." },
    { "title": "Early Cancer Screening", "description": "High-precision molecular testing for early detection of various cancers." }
  ],
  "procedures": [
    { "title": "Next Generation Sequencing (NGS)", "description": "Comprehensive genomic profiling for cancer and hereditary conditions." },
    { "title": "Liquid Biopsy", "description": "ctDNA-based non-invasive testing for cancer screening and monitoring." },
    { "title": "Digital PCR & Sanger Sequencing", "description": "High-sensitivity molecular diagnostic technologies." },
    { "title": "FISH & Cytogenetic Testing", "description": "Advanced chromosomal studies for oncology and genetic disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Moushumi specialize in cancer genomics?", "answer": "Yes, precision oncology and genomic profiling are her core areas of expertise." },
    { "question": "Does she perform hereditary cancer testing?", "answer": "Yes, she provides complete evaluation, testing and counseling for hereditary cancers." },
    { "question": "Is she experienced in NGS and liquid biopsy?", "answer": "Yes, she is a pioneer in India in introducing NGS and liquid biopsy into clinical diagnostics." }
  ]
},
{
  "slug": "dr-namrata-seth",
  "name": "Dr. Namrata Seth",
  "specialty": "Obstetrics & Gynaecology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Assistant Professor – Obstetrics & Gynaecology",
  "degree": "MBBS | DGO | DNB | Fellowship in Laparoscopy (Kiel, Germany) | Fellowship in Infertility (ICOG India) | Diploma in Cosmetic Gynecology | Fellowship in Laparoscopy",
  "about": "Dr. Namrata Seth is a highly experienced laparoscopic surgeon, infertility specialist and obstetrician with over 16 years of clinical expertise. She has trained under globally renowned surgeons and has served at leading institutions including Holy Family Hospital and Asian Hospital. A distinguished academic performer, she was awarded 15 gold medals during her medical education. She has contributed extensively to national and international research, holds multiple publications, and is a lifetime member of several esteemed medical societies. She is known for her patient-centred, evidence-based and technology-driven approach.",
  "medicalProblems": [
    { "title": "Infertility", "description": "Evaluation and treatment with advanced fertility techniques." },
    { "title": "High-Risk Pregnancy", "description": "Management of complex and high-risk obstetric cases." },
    { "title": "Gynaecological Disorders", "description": "Treatment for menstrual irregularities, fibroids, cysts and reproductive concerns." }
  ],
  "procedures": [
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive procedures for gynaecological conditions." },
    { "title": "Infertility Procedures", "description": "Advanced fertility care including ovulation induction and reproductive procedures." },
    { "title": "Cosmetic Gynaecology", "description": "Aesthetic and functional gynecological enhancement procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Namrata specialize in infertility?", "answer": "Yes, she has specialized training in infertility management from ICOG India." },
    { "question": "Is she trained in laparoscopic surgery?", "answer": "Yes, she has completed advanced laparoscopic training from Kiel, Germany." },
    { "question": "Does she manage high-risk pregnancies?", "answer": "Yes, she has extensive experience in high-risk obstetrics." }
  ]
},
{
  "slug": "dr-pooja-khanna",
  "name": "Dr. Pooja Khanna",
  "specialty": "General Paediatrics",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Assistant Professor – Paediatrics",
  "degree": "MBBS | DNB (Paediatrics)",
  "about": "Dr. Pooja Khanna is an experienced paediatrician with strong expertise in growth, nutrition, immunization and overall development of children. She completed her MBBS from Kasturba Medical College, Manipal, and her DNB in Paediatrics from Chacha Nehru Bal Chikitsalaya, New Delhi, a leading paediatric center affiliated with Maulana Azad Medical College. She has worked at several reputed hospitals including Max BLK Hospital, Tarawati Medical Centre and various pediatric facilities across Delhi NCR. Her care approach focuses on preventive paediatrics, early developmental assessments and holistic child health.",
  "medicalProblems": [
    { "title": "Growth & Development Issues", "description": "Monitoring and management of growth delays and developmental concerns." },
    { "title": "Nutrition Problems", "description": "Assessment and guidance for nutritional deficiencies and dietary needs." },
    { "title": "Childhood Infections", "description": "Management of common and recurrent infections." },
    { "title": "Immunization", "description": "Complete vaccination guidance for infants, children and adolescents." }
  ],
  "procedures": [
    { "title": "Routine Vaccinations", "description": "All childhood immunizations as per national and international schedules." },
    { "title": "Developmental Screening", "description": "Early detection of developmental delays and behavioural concerns." },
    { "title": "Pediatric Clinical Assessments", "description": "Evaluation of acute and chronic pediatric illnesses." }
  ],
  "faqs": [
    { "question": "Does Dr. Pooja handle childhood growth concerns?", "answer": "Yes, she specializes in growth, nutrition and child development." },
    { "question": "Does she provide immunization services?", "answer": "Yes, she offers complete vaccination services for children and adolescents." },
    { "question": "Is she experienced with newborn and adolescent care?", "answer": "Yes, she has extensive experience across all age groups from infants to teens." }
  ]
},
{
  "slug": "dr-reema-bhatt",
  "name": "Dr. Reema Bhatt",
  "specialty": "Fetal Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant & Head – Fetal Medicine",
  "degree": "MBBS | MS | DNB | FICOG | MNAMS | Fetal Medicine (FMF-UK Accredited)",
  "about": "Dr. Reema Bhatt is an accomplished fetal medicine specialist with over 23 years of experience, including a distinguished career in the Indian Armed Forces. She is renowned for her expertise in invasive fetal procedures, fetal therapy and fetal anomaly evaluation. Deeply committed to safeguarding the health of the mother and the unborn child, she combines clinical precision with compassionate counselling. Her extensive credentials include FMF-UK accreditation and multiple national awards, including recognition from the President of India for excellence in clinical service.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancies", "description": "Evaluation and management of high-risk fetal and maternal conditions." },
    { "title": "Fetal Anomalies", "description": "Diagnosis and monitoring of fetal structural and genetic abnormalities." },
    { "title": "Genetic Counselling", "description": "Risk assessment and counselling for hereditary and chromosomal disorders." },
    { "title": "Fetal Growth Problems", "description": "Assessment and management of fetal growth restriction and related issues." }
  ],
  "procedures": [
    { "title": "Invasive Fetal Therapy", "description": "Procedures including fetal transfusion, shunt placement and other interventions." },
    { "title": "Fetal Echocardiography", "description": "Detailed ultrasound evaluation of fetal heart structure and function." },
    { "title": "Fetal Neurosonography", "description": "Advanced ultrasound for fetal brain development assessment." },
    { "title": "Prenatal Screening & Diagnostics", "description": "NT scan, anomaly scan, targeted imaging and genetic testing guidance." }
  ],
  "faqs": [
    { "question": "Does Dr. Reema perform invasive fetal procedures?", "answer": "Yes, she specializes in invasive fetal therapy and fetal interventions." },
    { "question": "Is she trained in fetal echo?", "answer": "Yes, she has advanced expertise in fetal echocardiography and fetal neurosonology." },
    { "question": "Does she provide genetic counselling?", "answer": "Yes, she offers complete genetic counselling for high-risk and complex pregnancies." }
  ]
},
{
  "slug": "dr-rishabh-kumar",
  "name": "Dr. Rishabh Kumar",
  "specialty": "Radiation Oncology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant – Radiation Oncology",
  "degree": "MBBS | MD (Radiation Oncology) | ESTRO Fellow (Erasmus MC, Netherlands)",
  "about": "Dr. Rishabh Kumar is an advanced radiation oncologist with specialised expertise in high-precision cancer treatment techniques including SRS, SBRT, IGRT, proton therapy and robotic brachytherapy. He has trained at globally reputed centres such as AIIMS Delhi, SGPGI Lucknow, ILBS Delhi, and Erasmus MC Netherlands. During his early career, he contributed to major innovations such as commissioning India’s second-largest MRI-guided brachytherapy program and performing the world’s first robotic liver HDR brachytherapy. His research has received national and international recognition, including the MC Pant Gold Medal and Best Young Radiation Oncologist Award. He focuses on personalised, technology-driven, multidisciplinary cancer care.",
  "medicalProblems": [
    { "title": "Brain & CNS Cancers", "description": "Advanced stereotactic and precision radiation therapies for brain and spinal tumors." },
    { "title": "Head & Neck Cancers", "description": "High-precision radiotherapy to preserve organ function and improve outcomes." },
    { "title": "Breast & GI Cancers", "description": "Comprehensive radiotherapy for breast, gastrointestinal and hepatobiliary cancers." },
    { "title": "Gynaecological Cancers", "description": "Expertise in brachytherapy, image-guided radiation and advanced pelvic treatments." }
  ],
  "procedures": [
    { "title": "Stereotactic Radiosurgery (SRS)", "description": "Ultra-precise high-dose radiation for brain and spine tumors." },
    { "title": "Stereotactic Body Radiotherapy (SBRT)", "description": "Targeted high-dose treatment for liver, lung, spine and prostate cancers." },
    { "title": "IGRT & IMRT", "description": "Image-guided and intensity-modulated radiation therapy for accurate dosing." },
    { "title": "Robotic & MRI-guided Brachytherapy", "description": "Minimally invasive, high-precision internal radiation for multiple cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Rishabh specialize in stereotactic treatments like SRS and SBRT?", "answer": "Yes, he has advanced training and extensive experience in SRS and SBRT." },
    { "question": "Has he worked at premier institutes like AIIMS?", "answer": "Yes, he has completed senior residencies at AIIMS Delhi, ILBS Delhi and SGPGI Lucknow." },
    { "question": "Does he offer robotic brachytherapy?", "answer": "Yes, he is trained in robotic and MRI-guided brachytherapy for liver, cervical, prostate and other cancers." }
  ]
},
{
  "slug": "dr-ruchi-gaba",
  "name": "Dr. Ruchi Gaba",
  "specialty": "General Paediatrics",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Assistant Professor – Paediatrics",
  "degree": "MBBS | MD (Paediatrics)",
  "about": "Dr. Ruchi Gaba is an experienced pediatrician with comprehensive training from the prestigious Sawai Man Singh (SMS) Medical College and JK Lon Hospital, Jaipur—one of India’s largest Pediatric centers. She has worked across top government, corporate and research institutions including Hindu Rao Hospital and AIIMS New Delhi, where she contributed to research on cystic fibrosis, asthma, tuberculosis and infectious diseases. She is known for her expertise in childhood nutrition, growth and development, immunization and management of pediatric infections.",
  "medicalProblems": [
    { "title": "Nutritional Disorders", "description": "Evaluation and management of malnutrition, obesity and micronutrient deficiencies." },
    { "title": "Growth & Development Concerns", "description": "Monitoring developmental milestones and addressing developmental delays." },
    { "title": "Pediatric Infections", "description": "Diagnosis and treatment of acute and chronic infectious diseases in children." },
    { "title": "Respiratory & Allergy Issues", "description": "Management of asthma, allergic disorders and recurrent respiratory symptoms." }
  ],
  "procedures": [
    { "title": "Immunization Services", "description": "Complete vaccination for infants, children and adolescents." },
    { "title": "Growth & Development Assessment", "description": "Developmental screening and monitoring of physical, cognitive and emotional milestones." },
    { "title": "Pediatric Clinical Evaluation", "description": "Assessment of acute illnesses, chronic conditions and infectious diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Ruchi specialize in child nutrition?", "answer": "Yes, she has extensive experience in managing nutritional disorders in children." },
    { "question": "Does she provide immunization services?", "answer": "Yes, she offers all national and optional vaccines for children." },
    { "question": "Has she worked at major pediatric institutions?", "answer": "Yes, her training includes SMS Medical College Jaipur, AIIMS New Delhi and multiple tertiary care hospitals." }
  ]
},
{
  "slug": "dr-rahul-katharia",
  "name": "Dr. Rahul Katharia",
  "specialty": "Transfusion Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Professor & Head – Transfusion Medicine",
  "degree": "MBBS | MD (Transfusion Medicine)",
  "about": "Dr. Rahul Katharia is a highly accomplished Transfusion Medicine specialist with over 16 years of expertise in transfusion services, cellular therapy, apheresis medicine and transplant immunology. Trained at the prestigious SGPGI Lucknow, he has served as faculty at AIIMS Rishikesh and SGPGI, and has led major advancements in blood transfusion safety, apheresis, and donor management. A strong advocate of telemedicine, he has been awarded for pioneering innovative applications of telemedicine in apheresis. Dr. Katharia has received multiple national and international honors, including the Harold Gunson Fellowship and Young Investigator Award, and has over 30 high-impact research publications. He currently leads the Department of Transfusion Medicine at Amrita Hospital, Faridabad.",
  "medicalProblems": [
    { "title": "Apheresis-Related Conditions", "description": "Therapeutic plasma exchange, cytapheresis and immune-mediated disorders." },
    { "title": "Transfusion Reactions", "description": "Diagnosis, prevention and management of transfusion-related complications." },
    { "title": "Transplant Immunology", "description": "Immunohematological support for solid organ and stem cell transplants." },
    { "title": "Antenatal Serology", "description": "Evaluation and monitoring of maternal-fetal blood group incompatibility." }
  ],
  "procedures": [
    { "title": "Therapeutic Apheresis", "description": "Plasma exchange, leukapheresis, erythrocytapheresis and plateletpheresis." },
    { "title": "Cellular Therapy Support", "description": "Stem cell collection, processing and cellular manipulation." },
    { "title": "Advanced Immunohematology Testing", "description": "DAT, antibody titration, antigen typing and compatibility testing." },
    { "title": "Blood Component Therapy", "description": "Safe administration and monitoring of blood components." }
  ],
  "faqs": [
    { "question": "Does Dr. Rahul specialize in therapeutic apheresis?", "answer": "Yes, he is highly experienced in all forms of therapeutic and donor apheresis." },
    { "question": "Has he worked at SGPGI and AIIMS?", "answer": "Yes, he has served in major academic roles at SGPGI Lucknow and AIIMS Rishikesh." },
    { "question": "Does he handle transplant immunology?", "answer": "Yes, he has extensive expertise in immunohematology for solid organ and stem cell transplantation." }
  ]
},
{
  "slug": "dr-swati-pabbi",
  "name": "Dr. Swati Pabbi",
  "specialty": "Transfusion Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Transfusion Medicine",
  "degree": "MBBS | MD (Pathology) | Fellowship in Apheresis & Cellular Therapy",
  "about": "Dr. Swati Pabbi is an experienced Transfusion Medicine specialist with strong expertise in therapeutic apheresis, stem cell harvests, immunoadsorption, and transplant immunology. She has worked at renowned institutions, including Medanta – The Medicity, and has trained at the prestigious Fred Hutchinson Cancer Research Center/Seattle Cancer Care Alliance (University of Washington), USA. With more than 25 national and international publications, she is an active researcher and reviewer for leading journals in transfusion and apheresis sciences. She is known for her patient-centric approach, deep technical proficiency and commitment to advancing indigenous research for better healthcare access.",
  "medicalProblems": [
    { "title": "Autoimmune Disorders", "description": "Treatment through plasmapheresis and immunoadsorption." },
    { "title": "Graft-Versus-Host Disease (GVHD)", "description": "Management using extracorporeal photopheresis and immunomodulatory therapies." },
    { "title": "Hematological Disorders", "description": "Supportive transfusion and cellular therapy for blood-related diseases." },
    { "title": "Transplant Immunology Issues", "description": "Evaluation and management of immunological complications in transplant patients." }
  ],
  "procedures": [
    { "title": "Plasmapheresis", "description": "Therapeutic plasma exchange for autoimmune and neurological disorders." },
    { "title": "Cascade Plasmapheresis", "description": "Selective removal of pathological plasma components." },
    { "title": "Stem Cell Harvests", "description": "Collection of peripheral blood stem cells for transplantation." },
    { "title": "Extracorporeal Photopheresis", "description": "Advanced therapy for GVHD and immune-mediated diseases." }
  ],
  "faqs": [
    { "question": "Does Dr. Swati perform therapeutic apheresis?", "answer": "Yes, she specializes in all advanced apheresis techniques including plasmapheresis and immunoadsorption." },
    { "question": "Has she trained internationally?", "answer": "Yes, she completed a visiting fellowship in Apheresis & Cellular Therapy at the Fred Hutchinson Cancer Research Center, USA." },
    { "question": "Does she manage stem cell collections?", "answer": "Yes, she is highly experienced in stem cell harvest procedures for transplant patients." }
  ]
},
{
  "slug": "dr-puneet-dhar",
  "name": "Dr. Puneet Dhar",
  "specialty": "Digestive Diseases & Gastrointestinal Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & Chief Administrator – Surgical Services",
  "degree": "MBBS | MS (General Surgery) | MCh (Surgical Gastroenterology) | Fellowship (Transplant Surgery – Cambridge, UK)",
  "about": "Dr. Puneet Dhar is one of India’s most respected and experienced Surgical Gastroenterologists with over 30 years of expertise in advanced GI surgery, HPB surgery, transplant surgery, and complex colorectal procedures. He received his super-specialty training (MCh) from the prestigious GB Pant Hospital, Delhi, and later trained in transplant surgery at Addenbrookes Hospital, Cambridge, UK. Dr. Dhar has led and established major GI surgery departments across India, including Amrita Kochi and AIIMS Rishikesh, where he served as Professor, Head, and Dean of Student Welfare. A prolific academician, author, and international speaker, he has held leadership roles in national surgical associations and is the President-elect of the Indian Chapter of the International HPB Association. His clinical expertise spans GI cancers, pancreatic and neuroendocrine tumors, advanced laparoscopic/robotic surgery, pouch surgeries, and surgical infections.",
  "medicalProblems": [
    { "title": "GI Cancers", "description": "Comprehensive management of stomach, colorectal, pancreatic and liver cancers." },
    { "title": "Pancreatic Disorders", "description": "Surgery for pancreatic tumors, pancreatitis, and neuroendocrine tumors." },
    { "title": "Complex Colorectal Diseases", "description": "Advanced pouch surgeries and reconstruction for complicated colorectal conditions." },
    { "title": "Biliary Disorders", "description": "Surgical management of bile duct diseases and reconstructions." }
  ],
  "procedures": [
    { "title": "GI Cancer Surgery", "description": "Advanced surgical procedures for gastrointestinal malignancies." },
    { "title": "Pancreatic Surgery", "description": "Surgery for pancreatic tumors and chronic pancreatitis." },
    { "title": "Laparoscopic Surgery", "description": "Minimally invasive surgeries for various GI conditions." },
    { "title": "Biliary Reconstruction", "description": "Complex reconstructions of bile ducts following injury or disease." }
  ],
  "faqs": [
    { "question": "Does Dr. Puneet specialize in pancreatic surgery?", "answer": "Yes, he is highly experienced in advanced pancreatic and neuroendocrine tumor surgeries." },
    { "question": "Has he trained internationally?", "answer": "Yes, he completed a prestigious fellowship in Transplant Surgery at Cambridge University Hospitals, UK." },
    { "question": "Does he perform minimally invasive GI surgeries?", "answer": "Yes, he is an expert in advanced laparoscopic and minimally invasive surgery techniques." }
  ]
},
{
  "slug": "dr-sakshi-singh",
  "name": "Dr. Sakshi Singh",
  "specialty": "Internal Medicine",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Internal Medicine",
  "degree": "MBBS | MD (General Medicine)",
  "about": "Dr. Sakshi Singh is an accomplished Internal Medicine specialist with strong expertise in managing complex medical conditions, infectious diseases, critical care, and chronic disorders. She completed her medical education in Gujarat and subsequently gained experience across leading institutions including Fortis Escorts Hospital and QRG Central Hospital, Faridabad. She has served at ESIC Medical College & Hospital in both general medicine and intensive care units, providing frontline care during the COVID-19 pandemic. Dr. Sakshi has also contributed to research as a Co-Investigator in the CORBEVAX COVID-19 vaccine trial. Her approach emphasizes evidence-based care, preventive medicine and long-term patient wellbeing.",
  "medicalProblems": [
    { "title": "Chronic Medical Conditions", "description": "Management of diabetes, hypertension, thyroid disorders and multi-system chronic diseases." },
    { "title": "Infectious Diseases", "description": "Evaluation and treatment of viral, bacterial and systemic infections." },
    { "title": "Critical Illness", "description": "Medical stabilization and management of ICU-level acute conditions." },
    { "title": "Liver & Pregnancy-Related Disorders", "description": "Expertise in acute fatty liver of pregnancy and complex internal medicine issues." }
  ],
  "procedures": [
    { "title": "Diagnostic Evaluation", "description": "Complete medical workup for acute and chronic illnesses." },
    { "title": "Emergency Medical Management", "description": "Stabilization and treatment of acute medical emergencies." },
    { "title": "Critical Care Support", "description": "Management of critically ill patients including COVID and non-COVID ICU." },
    { "title": "Preventive Health Assessments", "description": "Lifestyle and risk-based screening for chronic disease prevention." }
  ],
  "faqs": [
    { "question": "Does Dr. Sakshi manage complex medical cases?", "answer": "Yes, she specializes in the management of multi-system and chronic medical conditions." },
    { "question": "Was she involved in COVID care?", "answer": "Yes, she worked extensively in critical care and COVID ICU settings and participated in vaccine trials." },
    { "question": "Does she treat infectious diseases?", "answer": "Yes, she has experience managing a wide range of infectious and systemic illnesses." }
  ]
},
{
  "slug": "dr-shilpa-khullar-sood",
  "name": "Dr. Shilpa Khullar Sood",
  "specialty": "Dentistry (Prosthodontics, Implantology & Maxillofacial Prosthesis)",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head – Dentistry",
  "degree": "BDS | MDS (Prosthodontics & Maxillofacial Prosthesis) | Implantologist | FAGE | Fellowship in Orofacial Pain & Dental Sleep Medicine",
  "about": "Dr. Shilpa Khullar Sood is a highly accomplished Prosthodontist, Implantologist and Maxillofacial Prosthesis specialist with over 23 years of clinical experience and 14 years of academic expertise. A gold medalist from MAHE University, she has trained internationally at the American Academy of Implant Dentistry (Chicago), New York University College of Dentistry and Roseman University (USA). She specializes in advanced prosthodontics, full mouth rehabilitation, aesthetic dentistry, implant-supported prosthesis, occlusal rehabilitation, and dental sleep medicine. Dr. Shilpa is known for her precision-driven, aesthetic-focused and patient-centric dental care. She has worked with major dental institutions and has contributed to dental education, research and international training programs.",
  "medicalProblems": [
    { "title": "Tooth Loss & Missing Teeth", "description": "Implant-supported restorations, dentures, and full-mouth rehabilitation." },
    { "title": "Aesthetic Dental Concerns", "description": "Smile correction using veneers, crowns and cosmetic dentistry techniques." },
    { "title": "Occlusal & Bite Disorders", "description": "Comprehensive occlusal rehabilitation for functional and aesthetic improvement." },
    { "title": "TMJ & Orofacial Pain Disorders", "description": "Diagnosis and management of jaw pain, migraines, and dental sleep issues." }
  ],
  "procedures": [
    { "title": "Dental Implants & ‘Teeth in a Day’", "description": "Immediate implants and full-mouth implant-supported prosthesis." },
    { "title": "Full Mouth Rehabilitation", "description": "Rebuilding aesthetics and function with advanced prosthodontic techniques." },
    { "title": "Smile Makeover", "description": "Aesthetic correction using veneers, crowns, and composite restorations." },
    { "title": "Maxillofacial Prosthesis", "description": "Rehabilitation of jaw, facial structures and post-surgical defects." }
  ],
  "faqs": [
    { "question": "Does Dr. Shilpa specialize in dental implants?", "answer": "Yes, she is internationally trained in surgical implantology and advanced implant-supported prosthesis." },
    { "question": "Does she perform smile correction procedures?", "answer": "Yes, she performs cosmetic dentistry including veneers, crowns and aesthetic reconstructions." },
    { "question": "Is she experienced in full mouth rehabilitation?", "answer": "Yes, she has over two decades of expertise in complex full-mouth prosthetic rehabilitation." }
  ]
},
{
  "slug": "dr-saphalta-baghmar",
  "name": "Dr. Saphalta Baghmar",
  "specialty": "Medical Oncology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Program Head – Head & Neck, Neuro-oncology, Breast, GI, Hepatobiliary & Genitourinary Cancers",
  "degree": "MBBS | MD (Medicine) | DM (Medical Oncology)",
  "about": "Dr. Saphalta Baghmar is a distinguished Medical Oncologist with advanced training from AIIMS New Delhi. An alumna of MGM Medical College, she has served as faculty at the Institute of Liver and Biliary Sciences (ILBS), New Delhi. She has delivered over 100 invited lectures at national and international platforms and has been awarded multiple gold medals for academic excellence. With more than 30 research publications and book chapters, she is highly recognized for her expertise in breast cancer, gastrointestinal cancers, urogenital cancers, and head & neck oncology. Trained in precision oncology, she specializes in targeted therapy and immunotherapy, offering individualized and evidence-based cancer care.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Comprehensive evaluation and advanced medical management." },
    { "title": "Gastrointestinal Cancers", "description": "Expertise in colon, stomach, pancreatic and liver cancers." },
    { "title": "Urogenital Cancers", "description": "Medical management of prostate, kidney, bladder and testicular cancers." },
    { "title": "Head & Neck Cancers", "description": "Diagnosis, staging and systemic therapy for head & neck tumors." }
  ],
  "procedures": [
    { "title": "Targeted Therapy", "description": "Precision-based treatments targeting molecular drivers of cancer." },
    { "title": "Immunotherapy", "description": "Immune-boosting therapies for advanced and resistant cancers." },
    { "title": "Precision Oncology", "description": "Genetic and molecular profiling to customize cancer treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Saphalta treat breast cancer?", "answer": "Yes, breast cancer management is one of her primary specialties." },
    { "question": "Does she offer immunotherapy?", "answer": "Yes, she is extensively trained and experienced in modern immunotherapy treatments." },
    { "question": "Is she trained in precision oncology?", "answer": "Yes, she applies genetic and molecular insights to personalize cancer treatment." }
  ]
},
{
  "slug": "dr-sameer-bhate",
  "name": "Dr. Sameer Bhate",
  "specialty": "Cardiac Sciences – Cardiovascular & Thoracic Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & Head – Adult Cardiac Surgery",
  "degree": "MBBS | MCh | DNB (CVTS) | DNB (General Surgery) | FIACS | MNAMS | Fellow – Adult & Pediatric Cardiac Surgery (Australia) | Fellow – Heart & Lung Transplant & Assist Devices (Australia)",
  "about": "Dr. Sameer Bhate is a highly accomplished Cardiothoracic Surgeon with over 20 years of experience and more than 4000 cardiac surgeries to his credit. He leads the Department of Adult Cardiac Surgery at Amrita Hospital, Faridabad, and is known for his expertise in complex cardiac procedures including redo heart surgeries, valve surgery, bypass surgery, aortic aneurysm surgery, and advanced transplant care. He has been instrumental in establishing multiple cardiac centers across North India and two heart and lung transplant programs in South India. His commitment to patient care, research, and surgical innovation has made him a respected name in Indian cardiac surgery.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Advanced surgical treatment including CABG for blocked heart arteries." },
    { "title": "Valvular Heart Disease", "description": "Surgical management including valve repair and valve replacement." },
    { "title": "Aortic Aneurysm", "description": "Complex open-heart surgery for aortic dilation and aneurysm." },
    { "title": "Heart Failure & End-stage Cardiac Disease", "description": "Heart and lung transplant solutions for advanced cardiac conditions." }
  ],
  "procedures": [
    { "title": "Coronary Artery Bypass Grafting (CABG)", "description": "Surgery to restore blood flow in blocked coronary arteries." },
    { "title": "Redo Heart Surgeries", "description": "High-risk repeat cardiac procedures performed with precision." },
    { "title": "Valve Replacement Surgery", "description": "Mitral, aortic and tricuspid valve repair and replacement." },
    { "title": "Heart & Lung Transplant Surgery", "description": "Transplantation and artificial assist device support (LVAD/ECMO)." }
  ],
  "faqs": [
    { "question": "Does Dr. Sameer perform redo heart surgeries?", "answer": "Yes, he is widely recognized for expertise in high-risk redo cardiac surgeries." },
    { "question": "Does he perform valve replacement surgeries?", "answer": "Yes, he performs complete range of valve repair and replacement procedures." },
    { "question": "Is he trained in heart and lung transplants?", "answer": "Yes, he completed advanced fellowships in Australia in transplant and assist devices." }
  ]
},
{
  "slug": "dr-savita-krishnamurthy-guin",
  "name": "Dr. Savita Krishnamurthy Guin",
  "specialty": "Paediatric Cardiology & Adult Congenital Heart Disease",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Assistant Professor – Paediatric Cardiology",
  "degree": "MBBS | MD (Paediatrics) | DrNB (Paediatric Cardiology)",
  "about": "Dr. Savita Krishnamurthy Guin is an experienced Paediatric Cardiologist with over 13 years in managing congenital, rheumatic and acquired heart diseases in newborns, children and adults. She specializes in cardiac imaging, fetal echocardiography, perinatal cardiac management and emergency paediatric cardiac care. Trained at prestigious institutions like KMC Manipal, IGMC Shimla and RTIICS Kolkata, she plays a crucial role in diagnosing and treating complex congenital heart conditions. Her approach integrates precision imaging, holistic perinatal planning and long-term cardiac care.",
  "medicalProblems": [
    { "title": "Congenital Heart Diseases", "description": "Diagnosis and management of structural heart defects in newborns and children." },
    { "title": "Rheumatic & Acquired Heart Diseases", "description": "Comprehensive care for paediatric and adolescent heart disorders." },
    { "title": "Fetal Cardiac Abnormalities", "description": "Specialized assessment and counseling during pregnancy for suspected fetal heart conditions." },
    { "title": "Paediatric Cardiac Emergencies", "description": "Acute management of life-threatening cardiac conditions in infants and children." }
  ],
  "procedures": [
    { "title": "Fetal Echocardiography", "description": "Advanced prenatal heart imaging to detect fetal cardiac anomalies." },
    { "title": "Paediatric Cardiac Imaging", "description": "Echocardiography and imaging for diagnosis of congenital and acquired heart diseases." },
    { "title": "Perinatal Cardiac Management", "description": "Planning and optimizing outcomes for babies diagnosed with cardiac issues before birth." }
  ],
  "faqs": [
    { "question": "Does Dr. Savita perform fetal echocardiography?", "answer": "Yes, she is highly skilled in fetal cardiac imaging and prenatal diagnosis." },
    { "question": "Does she treat congenital heart diseases in newborns?", "answer": "Yes, she manages congenital, rheumatic and acquired cardiac disorders across pediatric age groups." },
    { "question": "Is she experienced in paediatric cardiac emergencies?", "answer": "Yes, she has extensive experience in managing neonatal and paediatric cardiac emergencies." }
  ]
},
{
  "slug": "dr-shikha-gupta",
  "name": "Dr. Shikha Gupta",
  "specialty": "Plastic & Reconstructive Surgery",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant – Plastic & Reconstructive Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Plastic Surgery) | MRCS (UK) | FRCS (UK) | Fellowship in Microsurgery | Fellow in Plastic Surgery (UK)",
  "about": "Dr. Shikha Gupta is an internationally trained and highly acclaimed Plastic & Reconstructive Surgeon with extensive expertise in reconstructive microsurgery, breast surgery, head and neck reconstruction, facial reanimation, body contouring, and cosmetic surgery. She completed her MBBS and MS from top institutions in Mumbai, followed by MCh in Plastic Surgery where she secured the *Gold Medal* and topped the Maharashtra University of Health Sciences. She further trained in the United Kingdom as an International Training Fellow in Microsurgery at Norfolk & Norwich University Hospital and completed multiple advanced fellowships. Dr. Gupta combines world-class surgical skill with compassionate patient care and is widely recognized for her excellence in reconstructive and aesthetic surgery. She has received numerous awards and has presented groundbreaking work on national and global platforms.",
  "medicalProblems": [
    { "title": "Breast Deformities & Reconstruction Needs", "description": "Reconstruction after mastectomy, congenital deformities and aesthetic breast surgeries." },
    { "title": "Head & Neck Reconstruction", "description": "Complex reconstruction after trauma, tumor removal and congenital defects." },
    { "title": "Lymphedema", "description": "Comprehensive medical and surgical management of chronic lymphedema." },
    { "title": "Trauma & Hand Injuries", "description": "Microsurgical repair and reconstruction after trauma, burns and limb injuries." }
  ],
  "procedures": [
    { "title": "Breast Reconstruction & Oncoplastic Surgery", "description": "Aesthetic and reconstructive procedures including flap-based and implant-based reconstruction." },
    { "title": "Microsurgery", "description": "Free flap surgeries, nerve repair, vascularized composite tissue transfer and limb salvage procedures." },
    { "title": "Body Contouring Surgery", "description": "Liposuction, tummy tuck, arm lift, lower body lift and post-weight-loss body reshaping." },
    { "title": "Facial Reanimation & Reconstruction", "description": "Advanced surgical techniques to restore facial movement and aesthetics." }
  ],
  "faqs": [
    { "question": "Does Dr. Shikha specialize in breast reconstruction?", "answer": "Yes, she is highly skilled in both reconstructive and aesthetic breast surgeries." },
    { "question": "Is she trained internationally?", "answer": "Yes, she trained extensively in the UK and earned the prestigious FRCS in Plastic Surgery." },
    { "question": "Does she treat lymphedema?", "answer": "Yes, she provides both medical and surgical treatment options for lymphedema." }
  ]
},
{
  "slug": "dr-shiveta-razdan",
  "name": "Dr. Shiveta Razdan",
  "specialty": "Breast Surgery & Breast Oncology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant & Assistant Professor – Breast Oncology",
  "degree": "MBBS | MS (General Surgery) | MRCS (UK) | Fellow – European Board of Breast Surgery (UEMS)",
  "about": "Dr. Shiveta Razdan is an internationally trained Breast Oncoplastic Surgeon with extensive expertise in breast cancer surgery, oncoplastic procedures, sentinel node biopsy, and management of benign breast diseases. She completed her MBBS and MS from Jammu University, followed by MRCS (Edinburgh). She further trained in the UK as an Oncoplastic Breast Fellow at South Tees Trust, James Cook Hospital and Frimley Health Foundation Trust. She is certified by the European Board of Breast Surgery, reflecting the highest standards of breast surgical care in Europe. With over 15 years of clinical experience, Dr. Shiveta excels in partial breast reconstruction, aesthetic breast surgery, implant-based reconstruction, and advanced breast cancer management. She has held key positions at Medanta and has delivered numerous public awareness talks, especially on hereditary breast cancer, early detection and BRCA screening.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Comprehensive surgical and oncoplastic management of breast cancer." },
    { "title": "Benign Breast Diseases", "description": "Evaluation and treatment of non-cancerous breast lumps and conditions." },
    { "title": "Hereditary Breast Cancer Risk", "description": "Assessment and management of BRCA-related hereditary cancer." },
    { "title": "Male Breast Cancer", "description": "Diagnosis and treatment of gynecomastia and male breast cancers." }
  ],
  "procedures": [
    { "title": "Oncoplastic Breast Surgery", "description": "Combines cancer removal with cosmetic reconstruction for optimal outcomes." },
    { "title": "Sentinel Lymph Node Biopsy", "description": "Minimally invasive technique for accurate cancer staging." },
    { "title": "Breast Reconstruction", "description": "Implant-based and partial reconstruction techniques post-cancer surgery." },
    { "title": "Breast Lump Evaluation & Surgery", "description": "Comprehensive management of benign and suspicious breast lumps." }
  ],
  "faqs": [
    { "question": "Does Dr. Shiveta perform oncoplastic breast surgery?", "answer": "Yes, she is internationally trained in advanced oncoplastic breast reconstruction techniques." },
    { "question": "Does she treat benign breast lumps?", "answer": "Yes, she manages all types of benign breast conditions with precision." },
    { "question": "Is she experienced in hereditary breast cancer screening?", "answer": "Yes, she regularly counsels and manages patients with BRCA gene mutations." }
  ]
},
{
  "slug": "dr-vidit-kapoor",
  "name": "Dr. Vidit Kapoor",
  "specialty": "Hematology & Medical Oncology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Assistant Professor – Hematology & Medical Oncology",
  "degree": "MBBS | Diplomate Internal Medicine (American Board) | Diplomate Palliative Medicine | Diplomate Medical Oncology & Hematology",
  "about": "Dr. Vidit Kapoor is a US-trained Hematologist and Medical Oncologist specializing in the diagnosis, treatment, and long-term care of patients with solid tumors and blood cancers. He completed his MBBS in New Delhi and pursued rigorous residency and fellowship training in the United States, including Internal Medicine at the University of New Mexico and advanced fellowships in Palliative Medicine and Medical Oncology & Hematology at the prestigious UT Health San Antonio MD Anderson Cancer Center. Known for his evidence-based and compassionate cancer care approach, Dr. Kapoor has contributed to international research, published widely, and presented at global oncology conferences. His expertise spans immunotherapy, targeted therapy, precision oncology, lymphoma, leukemia, myeloma, and solid organ cancers.",
  "medicalProblems": [
    { "title": "Solid Tumors", "description": "Breast, lung, liver, gallbladder, colorectal, gastric, pancreatic, prostate, ovarian, cervical and other organ cancers." },
    { "title": "Hematological Cancers", "description": "Comprehensive care for leukemia, lymphoma and multiple myeloma." },
    { "title": "Advanced & Metastatic Cancers", "description": "Personalized treatment with targeted therapy, immunotherapy and precision oncology." },
    { "title": "Palliative Oncology", "description": "Expert care focused on symptom relief, quality of life and holistic cancer support." }
  ],
  "procedures": [
    { "title": "Chemotherapy", "description": "Customized treatment plans for solid tumors and hematological cancers." },
    { "title": "Immunotherapy", "description": "Cutting-edge immune-based treatments for advanced cancers." },
    { "title": "Targeted Therapy", "description": "Molecularly guided therapies for precision cancer treatment." },
    { "title": "Oncology Diagnostics & Staging", "description": "Comprehensive evaluation including genetic and molecular testing." }
  ],
  "faqs": [
    { "question": "Does Dr. Vidit treat both solid tumors and blood cancers?", "answer": "Yes, he is trained in both Medical Oncology and Hematology." },
    { "question": "Is he trained in the United States?", "answer": "Yes, he completed his residency and multiple fellowships in top US institutions including UT Health San Antonio MD Anderson Cancer Center." },
    { "question": "Does he offer immunotherapy and precision oncology?", "answer": "Yes, he specializes in advanced treatments like immunotherapy, targeted therapy and personalized cancer care." }
  ]
},
{
  "slug": "dr-vivek-chaturvedi",
  "name": "Dr. Vivek Chaturvedi",
  "specialty": "Adult Cardiology",
  "hospital": "Amrita Hospital – Faridabad",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Professor & Head – Adult Cardiology",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | Fellowship in Cardiac Electrophysiology",
  "about": "Dr. Vivek Chaturvedi is a highly respected and nationally acclaimed cardiologist with over 15 years of expertise in adult cardiology, cardiac electrophysiology, and complex arrhythmia management. Before joining Amrita Hospital, he served as Professor of Cardiology and Incharge of Arrhythmia & Electrophysiology Services at G.B. Pant Hospital (GIPMER), New Delhi. He is recognized as one of India's leading experts in electrophysiology, specialising in atrial fibrillation ablation, ventricular tachycardia ablation, complex device implantation, and advanced cardiac rhythm management. Dr. Chaturvedi has contributed over 50 publications to international journals, authored book chapters, and has been consistently honored for excellence in cardiology, clinical research, and academic performance.",
  "medicalProblems": [
    { "title": "Complex Cardiac Arrhythmias", "description": "Evaluation and treatment of atrial fibrillation, atrial tachycardia, ventricular tachycardia and VPCs." },
    { "title": "Coronary Artery Disease", "description": "Management of blockages, heart attack risk and interventional treatments." },
    { "title": "Heart Valve Disorders", "description": "Assessment and treatment of valvular heart disease including rheumatic mitral valve disease." },
    { "title": "Heart Failure & Rhythm Disorders", "description": "Advanced treatment of conduction issues, heart failure and device-based therapy needs." }
  ],
  "procedures": [
    { "title": "Electrophysiology Studies & Ablation", "description": "Radiofrequency and 3D electroanatomic mapping–guided ablation for complex arrhythmias." },
    { "title": "Coronary & Peripheral Angioplasty", "description": "Interventional treatment for blocked heart and peripheral blood vessels." },
    { "title": "Mitral Valvuloplasty", "description": "Catheter-based treatment for rheumatic mitral stenosis." },
    { "title": "Diagnostic Cardiology", "description": "ECG, echocardiography, tilt table testing and implantable loop recorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Vivek specialize in electrophysiology?", "answer": "Yes, he is a national leader in electrophysiology and specializes in complex arrhythmia ablation." },
    { "question": "Does he perform coronary angioplasty?", "answer": "Yes, he is highly experienced in coronary and peripheral angioplasty procedures." },
    { "question": "Is he experienced in treating atrial fibrillation?", "answer": "Yes, he is skilled in advanced AF ablation using 3D mapping and cutting-edge electrophysiology technologies." }
  ]
},
{
  "slug": "dr-shelly-mittal",
  "name": "Dr. Shelly Mittal",
  "specialty": "Anaesthesia",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Anaesthesia",
  "degree": "MBBS | MD - Anaesthesia",
  "about": "Dr. Shelly Mittal is a senior anaesthesiologist with over 20 years of experience across leading institutions including GB Pant Hospital, Max Hospital Saket, Fortis Raigarh and Artemis Hospital. She specializes in anaesthesia for complex surgeries including liver and kidney transplants, bariatric procedures, neurosurgery, orthopaedics, obstetrics and oncosurgery. She is also an AHA-certified BLS & ACLS instructor.",
  "medicalProblems": [
    { "title": "High-Risk Surgical Anaesthesia", "description": "Anaesthesia management for complex and critical procedures." },
    { "title": "Transplant Anaesthesia", "description": "Specialized anesthesia for liver and kidney transplant surgeries." },
    { "title": "Pain & Perioperative Management", "description": "Comprehensive intraoperative and postoperative care." }
  ],
  "procedures": [
    { "title": "Transplant Anaesthesia", "description": "Advanced anaesthetic management for liver & kidney transplants." },
    { "title": "Ultrasound-Guided Nerve Blocks", "description": "Precision regional anaesthesia techniques." },
    { "title": "General & Regional Anaesthesia", "description": "Expertise across all major surgical specialties." }
  ],
  "faqs": [
    { "question": "Does Dr. Mittal handle transplant anaesthesia?", "answer": "Yes, she has extensive experience in liver and kidney transplant anaesthesia." },
    { "question": "Is she certified in emergency care training?", "answer": "Yes, she is an AHA-certified BLS and ACLS instructor." },
    { "question": "Which surgeries does she provide anaesthesia for?", "answer": "All major surgeries including bariatric, neuro, ortho, paediatric, obstetric and oncology." }
  ]
},
{
  "slug": "dr-g-arya-prakash",
  "name": "Dr. G. Arya Prakash",
  "specialty": "Anaesthesia & Transplant Anaesthesia",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Anaesthesia for Liver Transplant",
  "degree": "MBBS | Diploma in Anaesthesia (DA)",
  "about": "Dr. G. Arya Prakash is a highly experienced anaesthesiologist specializing in transplant anaesthesia, perioperative medicine and critical care. With over 16 years of expertise, he is skilled in advanced regional anaesthesia, vascular access, fiberoptic intubations, difficult airway management and anesthesia for liver and kidney transplants.",
  "medicalProblems": [
    { "title": "Complex Surgical Anaesthesia", "description": "Anaesthesia for high-risk and transplant procedures." },
    { "title": "Critical Care Transport", "description": "Safe transfer of critically ill patients." },
    { "title": "Difficult Airway Management", "description": "Advanced fiberoptic and bronchoscopic techniques." }
  ],
  "procedures": [
    { "title": "Transplant Anaesthesia", "description": "Anaesthesia for liver & kidney transplant surgeries." },
    { "title": "Regional Anaesthesia Techniques", "description": "Spinals, epidurals, nerve blocks, USG-guided procedures." },
    { "title": "Advanced Airway Procedures", "description": "Fiberoptic intubation, DLT insertion and bronchoscopy." }
  ],
  "faqs": [
    { "question": "Does he specialize in transplant anaesthesia?", "answer": "Yes, including liver and kidney transplant procedures." },
    { "question": "Does he perform ultrasound-guided nerve blocks?", "answer": "Yes, extensively." },
    { "question": "Is he experienced in difficult airway management?", "answer": "Yes, he performs advanced fiberoptic and bronchoscopy-based intubations." }
  ]
},
{
  "slug": "dr-anil-khetarpal",
  "name": "Dr. (Brig.) Anil Khetarpal",
  "specialty": "Blood Centre & Transfusion Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "33+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Deputy Chief - Medical Services & Chairperson - Blood Centre & Transfusion Medicine",
  "degree": "MBBS | MD - Pathology",
  "about": "Dr. (Brig.) Anil Khetarpal is a veteran in Transfusion Medicine with 33+ years of experience across premier military and civilian hospitals. He has performed over 300 peripheral blood stem cell harvests, extensive therapeutic apheresis and has contributed significantly to national blood transfusion standards. He is a former Professor & Head of Pathology in Armed Forces Medical Institutions and has several national recognitions.",
  "medicalProblems": [
    { "title": "Blood Disorders", "description": "Diagnosis and management of transfusion-related issues." },
    { "title": "Stem Cell Disorders", "description": "Stem cell harvesting and transplant support." },
    { "title": "Apheresis-related Conditions", "description": "Therapeutic plasma exchange, leukapheresis, thrombocytapheresis." }
  ],
  "procedures": [
    { "title": "Stem Cell Harvesting", "description": "Over 300 hematopoietic stem cell procedures." },
    { "title": "Therapeutic Apheresis", "description": "TPE, TPR, TRex and regenerative stem cell therapies." },
    { "title": "Cryobanking & Advanced Transfusion", "description": "Expertise in cryopreservation and immunohematology." }
  ],
  "faqs": [
    { "question": "Has Dr. Khetarpal worked in national military hospitals?", "answer": "Yes, he has served as Professor & Head across top Armed Forces medical centers." },
    { "question": "Does he perform stem cell harvesting?", "answer": "Yes, with over 300 procedures to his credit." },
    { "question": "Is he experienced in therapeutic apheresis?", "answer": "Yes, including TPE, TRex and advanced procedures." }
  ]
},
{
  "slug": "dr-surendra-nath-khanna",
  "name": "Dr. Surendra Nath Khanna",
  "specialty": "Cardiothoracic & Vascular Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "34+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson - Adult Cardiac Surgery & Heart-Lung Transplant",
  "degree": "MBBS | MS | M.Ch | FICS (USA) | FIACS | FAMS | FICC",
  "about": "Dr. Surendra Nath Khanna is a leading cardiac surgeon with 34+ years of experience and over 21,000 successful cardiac surgeries. Trained under world-renowned surgeon Prof. Ottavio Alfieri in Milan, he specializes in heart failure surgery, LVAD, minimally invasive cardiac surgery, valve repair, CABG and heart–lung transplant procedures.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Advanced management requiring CABG and minimally invasive surgery." },
    { "title": "Valve Disorders", "description": "Repair and replacement including complex cases." },
    { "title": "Heart Failure", "description": "LVAD, transplant and advanced surgical solutions." }
  ],
  "procedures": [
    { "title": "Beating Heart CABG", "description": "Off-pump coronary artery bypass surgery." },
    { "title": "Valve Repair & Replacement", "description": "Trained under Prof. Alfieri, a pioneer in valve surgery." },
    { "title": "Heart-Lung Transplant & LVAD", "description": "Advanced cardiac failure solutions." }
  ],
  "faqs": [
    { "question": "Has he performed many cardiac surgeries?", "answer": "Yes, over 21,000 surgeries." },
    { "question": "Is he trained internationally?", "answer": "Yes, under Prof. Ottavio Alfieri in Italy." },
    { "question": "Does he perform minimally invasive surgery?", "answer": "Yes, he is an expert in keyhole cardiac surgery." }
  ]
},
{
  "slug": "dr-sameer-mehrotra",
  "name": "Dr. Sameer Mehrotra",
  "specialty": "Interventional Cardiology & Electrophysiology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Unit Chief - Interventional Cardiology & Electrophysiology",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology) | CCDS (IBHRE) | FHRS | FACC | FESC | FSCAI",
  "about": "Dr. Sameer Mehrotra is a highly skilled interventional cardiologist and electrophysiologist with expertise in angioplasty, electrophysiology studies, AF & VT ablations and cardiac device implantation. He is an IBHRE-certified cardiac device specialist and performs complex PPI, CRT-D, ICD and lead extraction procedures.",
  "medicalProblems": [
    { "title": "Heart Rhythm Disorders", "description": "AF, VT, SVT, conduction abnormalities." },
    { "title": "Coronary Artery Disease", "description": "Blockages requiring angioplasty." },
    { "title": "Heart Failure with Arrhythmia", "description": "CRT-D, ICD and electrophysiology management." }
  ],
  "procedures": [
    { "title": "Complex Angioplasty", "description": "Primary, elective and high-risk PCI." },
    { "title": "Electrophysiology & Ablation", "description": "AF, VT and other arrhythmia ablations." },
    { "title": "Device Implantation", "description": "Pacemakers, ICDs, CRT-D and lead extraction." }
  ],
  "faqs": [
    { "question": "Is he a certified device specialist?", "answer": "Yes, he is IBHRE-certified (CCDS)." },
    { "question": "Does he perform AF and VT ablations?", "answer": "Yes, with extensive experience." },
    { "question": "Does he handle complex angioplasties?", "answer": "Yes, including primary and high-risk angioplasty." }
  ]
},
{
  "slug": "dr-balbir-kalra",
  "name": "Dr. (Col) Balbir Kalra",
  "specialty": "Cardiology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Associate Chief - Cardiology (NIC)",
  "degree": "MBBS | MD (Medicine) | DM (Cardiology)",
  "about": "Dr. (Col) Balbir Kalra is a highly accomplished cardiologist with 18+ years of experience in clinical, non-invasive and invasive cardiology. He previously served as HOD – Cardiology at Army Base Hospital, New Delhi and has treated senior Government of India officials. He has published multiple research papers in leading journals and received the prestigious Rashtriya Gaurav Award.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages, angina and heart attack management." },
    { "title": "Hypertension & Heart Failure", "description": "Advanced diagnosis and long-term care." },
    { "title": "Cardiac Rhythm Abnormalities", "description": "Holter evaluation and arrhythmia management." }
  ],
  "procedures": [
    { "title": "Non-Invasive Cardiology", "description": "Echocardiography, TMT, Holter and cardiac evaluations." },
    { "title": "Invasive Cardiology", "description": "Angiography, angioplasty and interventional cardiac procedures." },
    { "title": "Clinical Cardiology Management", "description": "Comprehensive cardiac care for complex diseases." }
  ],
  "faqs": [
    { "question": "Has Dr. Kalra worked with the Armed Forces?", "answer": "Yes, he served as HOD, Cardiology at Army Base Hospital, New Delhi." },
    { "question": "Does he perform interventional cardiology procedures?", "answer": "Yes, he is trained in invasive cardiology." },
    { "question": "Has he received national recognition?", "answer": "Yes, he is a recipient of the Rashtriya Gaurav Award." }
  ]
},
{
  "slug": "dr-pradeep-kumar-singh",
  "name": "Dr. Pradeep Kumar Singh",
  "specialty": "Plastic & Cosmetic Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Cosmetic & Plastic Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Plastic Surgery) | Fellowship in Aesthetic Surgery (Paris)",
  "about": "Dr. Pradeep Kumar Singh is a renowned plastic and cosmetic surgeon with 17+ years of experience across cosmetic surgery, microvascular reconstruction, congenital deformity correction, hair transplantation, and trauma reconstruction. He has worked at leading institutions such as Max Hospital, Rockland Hospital, KGMC Lucknow and SMS Medical College Jaipur. He is widely known for his expertise in liposuction, breast surgeries, facelifts, rhinoplasty and reconstructive microsurgery.",
  "medicalProblems": [
    { "title": "Cosmetic Concerns", "description": "Aesthetic corrections including face, nose, breast and body." },
    { "title": "Congenital Anomalies", "description": "Cleft lip, palate and hypospadias surgeries." },
    { "title": "Post-Cancer & Trauma Defects", "description": "Microvascular reconstruction and limb salvage." }
  ],
  "procedures": [
    { "title": "Liposuction & Body Contouring", "description": "High-definition body shaping procedures." },
    { "title": "Breast Surgery", "description": "Augmentation, reduction and correction procedures." },
    { "title": "Facial Aesthetic Surgery", "description": "Facelift, rhinoplasty and eyelid surgeries." }
  ],
  "faqs": [
    { "question": "Is Dr. Singh trained internationally?", "answer": "Yes, he completed a fellowship in aesthetic surgery from St. Louis Hospital, Paris." },
    { "question": "Does he perform microvascular reconstruction?", "answer": "Yes, including limb replantation and post-cancer reconstruction." },
    { "question": "Does he offer hair restoration surgery?", "answer": "Yes, he performs advanced hair transplant procedures." }
  ]
},
{
  "slug": "dr-jeetendra-sharma",
  "name": "Dr. Jeetendra Sharma",
  "specialty": "Critical Care & ICU",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Critical Care (Unit II) & Chief - Medical Quality",
  "degree": "MBBS | MD | DNB (Critical Care) | IDCCM | IFCC",
  "about": "Dr. Jeetendra Sharma is a leading Critical Care specialist with extensive experience at Fortis Escorts, Apollo Hospital, and Medanta. He is the editor of multiple critical care textbooks, a reviewer for IJCCM, and a NABH assessor. He has received multiple awards including Best Critical Care Specialist in Delhi NCR (2018) and the FICCM Award (2019).",
  "medicalProblems": [
    { "title": "Cardiac Critical Illness", "description": "Advanced life support for cardiac emergencies." },
    { "title": "Sepsis & Severe Infections", "description": "Management of life-threatening infections and organ failure." },
    { "title": "Respiratory Failure", "description": "Ventilation and ECMO support." }
  ],
  "procedures": [
    { "title": "Ultrasound & ECHO in ICU", "description": "Imaging for rapid diagnosis and intervention." },
    { "title": "Invasive ICU Procedures", "description": "Lines, drains, ventilation and critical care interventions." },
    { "title": "ECMO & Hemodynamic Monitoring", "description": "Advanced life-support techniques." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharma specialize in cardiac critical care?", "answer": "Yes, he is highly experienced in cardiac emergencies and ECMO." },
    { "question": "Is he involved in academic work?", "answer": "Yes, he has authored and edited multiple critical care books." },
    { "question": "Has he received national awards?", "answer": "Yes, including Best Critical Care Specialist in Delhi NCR (2018)." }
  ]
},
{
  "slug": "dr-reshma-tewari",
  "name": "Dr. Reshma Tewari",
  "specialty": "Critical Care & Intensive Care Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Critical Care (Unit I)",
  "degree": "MBBS | MD (Anaesthesiology)",
  "about": "Dr. Reshma Tewari is an accomplished critical care expert with over 22 years of experience. A graduate of AFMC Pune and MD Anaesthesiology from Army R&R Hospital Delhi, she has served in the Armed Forces and is a recognized IDCCM teacher. She specializes in cardiac intensive care, sepsis management, poisoning emergencies and complex ventilatory support.",
  "medicalProblems": [
    { "title": "Sepsis & Severe Infections", "description": "Advanced management of septic shock and multi-organ failure." },
    { "title": "Cardiac Critical Care", "description": "Post-cardiac surgery and cardiac emergency management." },
    { "title": "Respiratory Failure", "description": "Acute and chronic ventilatory support." }
  ],
  "procedures": [
    { "title": "Percutaneous Tracheostomy", "description": "Safe airway creation in critically ill patients." },
    { "title": "Temporary Pacing", "description": "Emergency cardiac rhythm support." },
    { "title": "IABP Insertion & ICU Procedures", "description": "Advanced life-saving ICU interventions." }
  ],
  "faqs": [
    { "question": "Does Dr. Tewari have Armed Forces background?", "answer": "Yes, she served as a Short Service Commission Officer." },
    { "question": "Is she an accredited critical care teacher?", "answer": "Yes, she is recognized by ISCCM for IDCCM training." },
    { "question": "Does she handle cardiac ICU cases?", "answer": "Yes, cardiac intensive care is her core specialty." }
  ]
},
{
  "slug": "dr-anjana-satyajit",
  "name": "Dr. Anjana Satyajit",
  "specialty": "Dentistry",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Dentistry",
  "degree": "BDS | Advanced Dental Training (Bellevue Hospital Center, NYU)",
  "about": "Dr. Anjana Satyajit is a senior dentist with over 20 years of experience, trained at Maulana Azad Medical College and Bellevue Hospital Center (NYU). She leads a multidisciplinary team including endodontists, orthodontists, implantologists and pediatric dental specialists, offering comprehensive dental care with international clinical standards.",
  "medicalProblems": [
    { "title": "Tooth Decay & Root Canal Issues", "description": "Advanced endodontic and restorative treatments." },
    { "title": "Gum & Periodontal Disease", "description": "Specialized periodontal therapy and maintenance." },
    { "title": "Dental Alignment & Bite Issues", "description": "Orthodontic corrections for children and adults." }
  ],
  "procedures": [
    { "title": "Root Canal & Restorative Dentistry", "description": "Microscope-assisted precision treatments." },
    { "title": "Dental Implants & Oral Surgery", "description": "Implant placement and surgical tooth extraction." },
    { "title": "Cosmetic Dentistry", "description": "Smile design, veneers, whitening and esthetic corrections." }
  ],
  "faqs": [
    { "question": "Does Dr. Satyajit offer multidisciplinary dental care?", "answer": "Yes, her department includes specialists across all dental fields." },
    { "question": "Is she internationally trained?", "answer": "Yes, she trained at Bellevue Hospital Center, NYU." },
    { "question": "Does she treat children?", "answer": "Yes, her team includes dedicated pedodontists." }
  ]
},
{
  "slug": "dr-monica-bambroo",
  "name": "Dr. Monica Bambroo",
  "specialty": "Dermatology & Cosmetology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Dermatology",
  "degree": "MBBS | DVD (Dermatology) | FCPS | PGDHMM | Fellowship - Lasers & Dermatosurgery (NSC Singapore)",
  "about": "Dr. Monica Bambroo is a leading dermatologist and dermato-surgeon with extensive experience in medical dermatology, lasers, aesthetic treatments and scar correction. Trained at the prestigious KEM Hospital Mumbai and National Skin Centre Singapore, she is recognized nationwide for her expertise in Botox, fillers, anti-aging treatments, laser therapies and complex dermato-surgeries.",
  "medicalProblems": [
    { "title": "Skin, Hair & Nail Disorders", "description": "Comprehensive evaluation and treatment for all dermatological issues." },
    { "title": "Acne & Scarring", "description": "Advanced laser and surgical scar revision." },
    { "title": "Pigmentation & Aging Concerns", "description": "Laser-based and injectable treatments for rejuvenation." }
  ],
  "procedures": [
    { "title": "Botox & Fillers", "description": "Advanced facial contouring and anti-aging procedures." },
    { "title": "Laser Treatments", "description": "Hair removal, pigmentation, scar revision and resurfacing lasers." },
    { "title": "Dermato-Surgery", "description": "Vitiligo surgery, mole removal, acne scar revision and more." }
  ],
  "faqs": [
    { "question": "Is Dr. Bambroo trained internationally?", "answer": "Yes, she completed a laser & dermatosurgery fellowship at NSC Singapore." },
    { "question": "Does she perform aesthetic injectables?", "answer": "Yes, she is an expert injector with over a decade of experience." },
    { "question": "Does she handle complex skin conditions?", "answer": "Yes, she treats challenging dermatological and aesthetic cases routinely." }
  ]
},
{
  "slug": "dr-noor-sharma",
  "name": "Dr. Noor Sharma",
  "specialty": "Dermatology & Cosmetology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant - Dermatology & Cosmetology",
  "degree": "MBBS | MD (Dermatology, Venereology & Leprology) | Fellowship in Aesthetics",
  "about": "Dr. Noor Sharma is a skilled dermatologist known for her expertise in treating complex skin, hair and nail disorders. With advanced training in aesthetic dermatology, lasers and dermatosurgery, she is recognized for her gentle approach and strong clinical judgement. She has worked across government hospitals, tele-dermatology platforms and private institutions, and has contributed to several international dermatology journals.",
  "medicalProblems": [
    { "title": "Skin, Hair & Nail Diseases", "description": "Acne, pigmentation, eczema, psoriasis and hair fall." },
    { "title": "Paediatric & Geriatric Dermatology", "description": "Special care for age-specific skin conditions." },
    { "title": "Vitiligo & Dermatosurgery Cases", "description": "Expertise in surgical and non-surgical treatment." },
    { "title": "Cosmetic Skin Concerns", "description": "Anti-aging, glow therapies and non-surgical rejuvenation." }
  ],
  "procedures": [
    { "title": "Laser Procedures", "description": "Pigmentation, tattoo removal, hair reduction and scar laser." },
    { "title": "Injectables", "description": "Botox, fillers, PRP, GFC and mesotherapy." },
    { "title": "Dermatosurgery", "description": "Scar revision, acne scar treatment, vitiligo surgery and grafting." }
  ],
  "faqs": [
    { "question": "Is Dr. Noor trained in lasers and injectables?", "answer": "Yes, she completed advanced laser and aesthetic training including fellowship in aesthetics." },
    { "question": "Does she treat all age groups?", "answer": "Yes, she treats paediatric, adult and geriatric patients." },
    { "question": "Does she perform vitiligo surgeries?", "answer": "Yes, she is trained in vitiligo surgery and grafting procedures." }
  ]
},
{
  "slug": "dr-shifa-yadav",
  "name": "Dr. Shifa Yadav",
  "specialty": "Dermatology & Cosmetology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant - Dermatology & Cosmetology",
  "degree": "MBBS | MD (Dermatology, Venereology & Leprosy) | Fellowships in Lasers & Aesthetics",
  "about": "Dr. Shifa Yadav is a gold medalist dermatologist with expertise in acne, cosmetic dermatology, dermatosurgery and laser-based treatments. With extensive training in Singapore, Gurugram and New Delhi, she specializes in advanced acne scar management, fillers, Botox, thread lifts, hair restoration and non-surgical facial rejuvenation. She has numerous indexed publications and has received multiple national awards for her dermatology research.",
  "medicalProblems": [
    { "title": "Acne & Acne Scars", "description": "Comprehensive management with lasers, MNRF, PRP and subcision." },
    { "title": "Cosmetic & Anti-Aging Concerns", "description": "Botox, fillers, thread lifts and non-invasive tightening." },
    { "title": "Hair Loss & Scalp Disorders", "description": "PRP, mesotherapy, GFC and advanced hair treatments." },
    { "title": "Pigmentation Issues", "description": "Melasma, tanning and uneven skin tone." }
  ],
  "procedures": [
    { "title": "Injectables", "description": "Botox, fillers, Profhilo, mesolipolysis and facial sculpting." },
    { "title": "Laser Treatments", "description": "Q-switch, CO2, erbium glass, hair reduction and scar lasers." },
    { "title": "Dermatosurgeries", "description": "Vitiligo surgery, mole removal, scar revision and nail surgery." }
  ],
  "faqs": [
    { "question": "Is Dr. Shifa a gold medalist?", "answer": "Yes, she received a Gold Medal for MD Dermatology." },
    { "question": "Does she specialize in acne scar treatments?", "answer": "Yes, including MNRF, subcision, PRP and laser resurfacing." },
    { "question": "Is she trained internationally?", "answer": "Yes, including observership at National Skin Centre Singapore." }
  ]
},
{
  "slug": "dr-anjana-kharbanda",
  "name": "Dr. Anjana Kharbanda",
  "specialty": "Emergency & Trauma Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "22+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Emergency Medicine",
  "degree": "MBBS | CCEBDM (PHFI)",
  "about": "Dr. Anjana Kharbanda is a senior emergency physician with over 22 years of experience in managing trauma, critical emergencies and life-threatening conditions. An alumna of Kasturba Medical College, she has been associated with Artemis Hospital for more than a decade and is certified in ACLS, BLS and ATLS. She is known for her rapid decision-making and leadership in emergency resuscitation.",
  "medicalProblems": [
    { "title": "Trauma & Accident Injuries", "description": "Immediate stabilization and emergency care." },
    { "title": "Cardiac & Respiratory Emergencies", "description": "Chest pain, cardiac arrest, breathlessness and shock." },
    { "title": "Diabetic & Metabolic Emergencies", "description": "Management of DKA, severe hypoglycemia and dehydration." }
  ],
  "procedures": [
    { "title": "Emergency Resuscitation", "description": "Systematic stabilization of critically ill patients." },
    { "title": "Airway Management", "description": "Intubation and ventilatory support." },
    { "title": "Trauma Support Procedures", "description": "Splinting, wound care and emergency triage." }
  ],
  "faqs": [
    { "question": "Is Dr. Kharbanda ACLS & ATLS certified?", "answer": "Yes, she is certified by AHA and American College of Surgeons." },
    { "question": "Does she manage complex emergencies?", "answer": "Yes, including trauma, cardiac and metabolic crises." },
    { "question": "How experienced is she in emergency medicine?", "answer": "She has over 22 years of extensive emergency care experience." }
  ]
},
{
  "slug": "dr-suvasish-chakraberty",
  "name": "Dr. (Col) Suvasish Chakraberty",
  "specialty": "Emergency & Trauma Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Emergency",
  "degree": "MBBS | MD (Anaesthesiology) | PDCC (Critical Care)",
  "about": "Dr. (Col) Suvasish Chakraberty is a highly experienced emergency and critical care specialist with over 25 years of service, including distinguished work in the Armed Forces. A trained anaesthesiologist, interventionist and recognized professor of anaesthesiology, he brings immense expertise in trauma care, resuscitation and intensive care management. He is a decorated physician, awarded the Chief of Army Staff Commendation for exemplary medical service.",
  "medicalProblems": [
    { "title": "Trauma & Emergency Cases", "description": "Immediate management of critical injuries and polytrauma." },
    { "title": "Critical Care Conditions", "description": "Sepsis, shock, cardiac emergencies and ICU-level complications." },
    { "title": "Respiratory & Cardiac Arrest", "description": "Advanced life support and resuscitation." }
  ],
  "procedures": [
    { "title": "Advanced Resuscitation", "description": "ACLS, ATLS and critical life-saving interventions." },
    { "title": "Critical Care Procedures", "description": "Ventilation, central line insertion, ICU monitoring and stabilization." },
    { "title": "Emergency Interventions", "description": "Airway management, trauma stabilization and rapid response care." }
  ],
  "faqs": [
    { "question": "Is Dr. Chakraberty trained in ACLS and ATLS?", "answer": "Yes, he is formally trained in both ACLS and ATLS protocols." },
    { "question": "Has he worked in the Armed Forces?", "answer": "Yes, he served as a senior officer and received prestigious commendations." },
    { "question": "Does he manage critical trauma cases?", "answer": "Yes, he specializes in emergency trauma and critical care management." }
  ]
},
{
  "slug": "dr-dheeraj-kapoor",
  "name": "Dr. Dheeraj Kapoor",
  "specialty": "Diabetes & Endocrinology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Endocrinology",
  "degree": "MBBS | MD (Medicine) | DM (Endocrinology) | FACE | FRCP (Edinburgh) | FRCP (Glasgow) | FACP | FRSSDI | FDiab | FGSI | FIACM | FISH | FIPF",
  "about": "Dr. Dheeraj Kapoor is one of India’s most accomplished endocrinologists with over 30 years of expertise in managing complex hormonal, metabolic and endocrine disorders. He is a distinguished academician, researcher and clinician with more than 70 publications and multiple editorial contributions. As Chief of Endocrinology at Artemis Hospital, he specializes in diabetes, thyroid disorders, obesity, endocrine cancers and paediatric endocrinology.",
  "medicalProblems": [
    { "title": "Diabetes (Type 1 & Type 2)", "description": "Comprehensive diabetes care with advanced therapies." },
    { "title": "Thyroid Disorders", "description": "Hypothyroidism, hyperthyroidism and thyroid nodules." },
    { "title": "Hormonal Imbalance", "description": "Adrenal, pituitary and gonadal disorders." },
    { "title": "Endocrine Tumors", "description": "Evaluation and management of endocrine cancers." }
  ],
  "procedures": [
    { "title": "Diabetes Management Programs", "description": "Insulin therapy, CGM, lifestyle and metabolic control." },
    { "title": "Endocrine Function Testing", "description": "Hormonal assays and stimulation/suppression tests." },
    { "title": "Obesity & Adiposity Treatment", "description": "Medical management and metabolic evaluation." }
  ],
  "faqs": [
    { "question": "Does Dr. Kapoor treat endocrine cancers?", "answer": "Yes, he has extensive experience in endocrine oncology." },
    { "question": "Does he manage gestational diabetes?", "answer": "Yes, he provides specialized care for diabetes during pregnancy." },
    { "question": "Is he involved in research and publications?", "answer": "Yes, he has authored over 70 publications and several medical books." }
  ]
},
{
  "slug": "dr-sumeet-arora",
  "name": "Dr. Sumeet Arora",
  "specialty": "Paediatric & Adolescent Endocrinology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant - Paediatric & Adolescent Endocrinology",
  "degree": "MBBS | MD (Pediatrics, USA) | ABP Certified in Pediatrics & Pediatric Endocrinology | Fellowship Pediatric Endocrinology (SUNY, USA)",
  "about": "Dr. Sumeet Arora is an American Board Certified Pediatric Endocrinologist with extensive U.S. training in managing hormonal disorders in children and adolescents. She specializes in growth disorders, puberty problems, childhood diabetes and metabolic issues. Her expertise includes managing insulin pumps, CGM and complex paediatric endocrinology conditions.",
  "medicalProblems": [
    { "title": "Childhood Diabetes", "description": "Type 1 diabetes, insulin pumps and glucose monitoring." },
    { "title": "Thyroid Disorders", "description": "Pediatric hypothyroidism and hyperthyroidism." },
    { "title": "Growth Problems", "description": "Short stature and growth hormone disorders." },
    { "title": "Puberty Disorders", "description": "Early or delayed puberty in children and teens." }
  ],
  "procedures": [
    { "title": "Growth Hormone Stimulation Test", "description": "Evaluation of growth hormone deficiency." },
    { "title": "ACTH Stimulation Test", "description": "Assessment of adrenal gland function." },
    { "title": "Leuprolide Stimulation Test", "description": "Diagnosis of puberty-related disorders." }
  ],
  "faqs": [
    { "question": "Is Dr. Arora U.S. Board Certified?", "answer": "Yes, she is double board certified in Pediatrics and Pediatric Endocrinology." },
    { "question": "Does she treat early puberty?", "answer": "Yes, managing puberty disorders is one of her core specialties." },
    { "question": "Does she treat childhood obesity?", "answer": "Yes, she manages metabolic syndrome and weight-related hormonal issues." }
  ]
},
{
  "slug": "dr-shashidhar-tb",
  "name": "Dr. Shashidhar TB",
  "specialty": "ENT & ENT Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - ENT Surgery",
  "degree": "MBBS | MS (ENT) | ECFMG (USA) | Pediatric ENT Fellow (USA)",
  "about": "Dr. Shashidhar TB is a highly accomplished ENT and Head & Neck surgeon with advanced international training from Cincinnati Children’s Hospital (USA) and expertise in airway reconstruction, pediatric ENT, swallowing disorders and sleep apnea surgery. Known for handling complex cases rejected elsewhere, he has performed thousands of successful pediatric and adult ENT surgeries.",
  "medicalProblems": [
    { "title": "Paediatric ENT Disorders", "description": "Airway issues, infections and congenital ENT problems." },
    { "title": "Sleep Apnea & Snoring", "description": "Diagnosis and surgical management." },
    { "title": "Voice & Swallowing Disorders", "description": "Advanced laryngology and phonosurgery." },
    { "title": "Chronic ENT Conditions", "description": "Sinusitis, tonsillitis, hearing loss and nasal obstruction." }
  ],
  "procedures": [
    { "title": "Airway Reconstruction", "description": "Specialist surgeries for complex pediatric airway problems." },
    { "title": "Balloon Laryngoplasty", "description": "First pediatric balloon laryngoplasty and LTR in India." },
    { "title": "Endoscopic ENT Surgeries", "description": "Minimally invasive sinus, ear and laryngeal procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Shashidhar specialize in pediatric ENT?", "answer": "Yes, he is one of India's top pediatric ENT surgeons." },
    { "question": "Does he perform sleep apnea surgeries?", "answer": "Yes, including advanced airway and sleep surgery." },
    { "question": "Is he internationally trained?", "answer": "Yes, with fellowships from leading U.S. centers." }
  ]
},
{
  "slug": "dr-trisha-srivastava",
  "name": "Dr. Trisha Srivastava",
  "specialty": "ENT (Ear, Nose & Throat)",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - ENT",
  "degree": "MBBS | MS (ENT) | DNB (ENT) | Advanced Training in Endoscopic Ear Surgery & Implant Otology",
  "about": "Dr. Trisha Srivastava is an experienced ENT surgeon proficient in managing a broad range of ENT conditions in both adults and children. Her core expertise lies in endoscopic ear surgery and implant otology using minimally invasive techniques that ensure faster recovery and better outcomes. She is also trained in advanced sinus surgery, sleep apnea management, voice disorders, and airway surgery. With more than 20 publications and multiple achievements, she is recognized for her precision, patient-centric approach and strong academic background.",
  "medicalProblems": [
    { "title": "Chronic Ear Diseases", "description": "Otitis media, cholesteatoma and hearing loss." },
    { "title": "Sinus & Nasal Disorders", "description": "Chronic sinusitis, nasal blockage and allergies." },
    { "title": "Sleep Apnea & Snoring", "description": "Evaluation and surgical management of airway obstruction." },
    { "title": "Voice & Throat Disorders", "description": "Laryngeal, swallowing and vocal cord problems." }
  ],
  "procedures": [
    { "title": "Endoscopic Ear Surgery", "description": "Tympanoplasty, ossiculoplasty and cholesteatoma removal." },
    { "title": "Implant Otology", "description": "Stapedotomy, cochlear implants and bone-anchored implants." },
    { "title": "Functional Endoscopic Sinus Surgery (FESS)", "description": "Advanced sinus surgery for chronic sinus issues." }
  ],
  "faqs": [
    { "question": "Does Dr. Trisha perform minimally invasive ear surgeries?", "answer": "Yes, she specializes in endoscopic ear surgeries for faster recovery." },
    { "question": "Does she treat sleep apnea?", "answer": "Yes, she has expertise in managing obstructive sleep apnea surgically." },
    { "question": "Is she experienced with pediatric ENT?", "answer": "Yes, she manages ENT conditions for both children and adults." }
  ]
},
{
  "slug": "dr-dilpreet-bajwa",
  "name": "Dr. Dilpreet Bajwa",
  "specialty": "ENT & ENT Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - ENT",
  "degree": "MBBS | MS (ENT)",
  "about": "Dr. Dilpreet Bajwa is an experienced ENT surgeon trained at the prestigious Maulana Azad Medical College & Lok Nayak Hospital, Delhi—one of Asia’s highest-volume ENT surgical centers. She has over a decade of expertise in diagnosing and treating simple to complex ENT conditions in both adults and children. She is proficient in advanced endoscopic sinus surgery, airway surgeries, thyroid surgeries, sleep apnea management and endoscopic ear surgeries. Known for her precision and patient-centric approach, she is widely appreciated for delivering safe and effective ENT care.",
  "medicalProblems": [
    { "title": "Hearing Problems & Ear Diseases", "description": "Chronic infections, hearing loss, tinnitus and cholesteatoma." },
    { "title": "Nasal & Sinus Disorders", "description": "Sinusitis, nasal blockage, polyps and deviated septum." },
    { "title": "Throat & Voice Disorders", "description": "Tonsillitis, adenoid issues, swallowing disorders and voice problems." },
    { "title": "Sleep Apnea & Snoring", "description": "Obstructive sleep apnea evaluation and surgical management." }
  ],
  "procedures": [
    { "title": "Endoscopic Sinus & Septal Surgery", "description": "Advanced FESS, septoplasty and medial maxillectomy." },
    { "title": "Ear Surgeries", "description": "Endoscopic tympanoplasty, mastoidectomy and ear reconstruction." },
    { "title": "ENT Emergency & Airway Surgeries", "description": "Tracheostomy, foreign body removal and airway management." }
  ],
  "faqs": [
    { "question": "Does Dr. Bajwa perform advanced sinus surgery?", "answer": "Yes, she is highly experienced in Functional Endoscopic Sinus Surgery (FESS)." },
    { "question": "Does she treat pediatric ENT conditions?", "answer": "Yes, she has vast expertise in managing ENT issues in children." },
    { "question": "Does she perform thyroid and airway surgeries?", "answer": "Yes, she is trained in advanced thyroid, airway and endoscopic ear surgeries." }
  ]
},
{
  "slug": "dr-kanika-singh",
  "name": "Dr. Kanika Singh",
  "specialty": "Medical Genetics",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant - Medical Genetics",
  "degree": "MBBS | MD (Pediatrics) | DrNB (Medical Genetics)",
  "about": "Dr. Kanika Singh is a leading medical geneticist with extensive training from Lady Hardinge Medical College, UCMS, and Sir Ganga Ram Hospital. She specializes in pediatric, adult and reproductive genetics, offering advanced diagnostic evaluation, genetic testing and counseling for rare diseases, hereditary cancers, metabolic disorders, and fetal abnormalities. She previously served as Medical Scientist at AIIMS and MAMC and has contributed significantly to national-level genetic research.",
  "medicalProblems": [
    { "title": "Pediatric Genetic Disorders", "description": "Short stature, developmental delay, autism, neuromuscular & metabolic disorders." },
    { "title": "Adult Genetic Conditions", "description": "Hereditary cancers, young-onset kidney/cardiac disorders, familial diabetes & cholesterol issues." },
    { "title": "Reproductive Genetics", "description": "Fetal anomalies, recurrent pregnancy loss, infertility and carrier screening." }
  ],
  "procedures": [
    { "title": "Genetic Testing & Counseling", "description": "Comprehensive evaluation for inherited and rare genetic diseases." },
    { "title": "Prenatal Genetic Assessment", "description": "Risk assessment for fetal abnormalities and inherited conditions." },
    { "title": "Cancer & Cardiac Genetics", "description": "Testing for hereditary cancers and cardiovascular genetic syndromes." }
  ],
  "faqs": [
    { "question": "Does Dr. Kanika handle pediatric genetic disorders?", "answer": "Yes, she specializes in evaluating and diagnosing complex childhood genetic disorders." },
    { "question": "Can she help with hereditary cancer screening?", "answer": "Yes, she offers comprehensive assessment for familial and hereditary cancers." },
    { "question": "Does she provide prenatal genetic counseling?", "answer": "Yes, including fetal anomaly evaluation and reproductive risk assessment." }
  ]
},
{
  "slug": "dr-sakshi-karkra",
  "name": "Dr. Sakshi Karkra",
  "specialty": "Pediatric Gastroenterology & Hepatology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Pediatric Gastroenterology & Hepatology",
  "degree": "MBBS | MD (Pediatrics) | MRCPCH (Part II) | Fellowship in Pediatric Gastroenterology, Hepatology & Liver Transplant",
  "about": "Dr. Sakshi Karkra is a senior and highly accomplished pediatric gastroenterologist with over 23 years in Pediatrics and 14+ years in Pediatric Gastroenterology & Hepatology. She specializes in gastrointestinal disorders, liver diseases, motility disorders and pediatric liver transplant care. Trained internationally in GI neurophysiology and critical care nutrition, she offers advanced diagnostic and therapeutic endoscopic services for children.",
  "medicalProblems": [
    { "title": "Pediatric GI Disorders", "description": "Chronic abdominal pain, constipation, reflux, diarrhea and IBD." },
    { "title": "Liver Diseases in Children", "description": "Hepatitis, biliary atresia, fatty liver and metabolic liver disorders." },
    { "title": "Feeding & Motility Disorders", "description": "Swallowing issues, motility dysfunction, GERD and dyspepsia." }
  ],
  "procedures": [
    { "title": "Diagnostic & Therapeutic Endoscopy", "description": "Upper GI endoscopy, colonoscopy, enteroscopy and variceal ligation." },
    { "title": "GI Motility Studies", "description": "Esophageal, colonic, anal manometry and pH impedance study." },
    { "title": "Advanced Pediatric Procedures", "description": "PEG placement, polypectomy, foreign body removal and liver biopsy." }
  ],
  "faqs": [
    { "question": "Does Dr. Sakshi perform pediatric endoscopies?", "answer": "Yes, she performs all advanced diagnostic and therapeutic endoscopic procedures." },
    { "question": "Does she handle pediatric liver diseases?", "answer": "Yes, she is trained in pediatric hepatology and liver transplant care." },
    { "question": "Can she manage complex GI motility disorders?", "answer": "Yes, she is trained in advanced GI neurophysiology in the USA." }
  ]
},
{
  "slug": "dr-ma-mir",
  "name": "Dr. M.A. Mir",
  "specialty": "Gastroenterology & Digestive Diseases",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Gastroenterology (Unit III)",
  "degree": "MBBS | MD (Medicine, Honors) | DM-Level Training in Gastroenterology (AIIMS & SKIMS)",
  "about": "Dr. M.A. Mir is a renowned gastroenterologist and endoscopist with over 17 years of extensive experience. He has trained at AIIMS, New Delhi and SKIMS, Srinagar, and previously served as Director & HOD of Gastroenterology at Rockland Hospitals. His expertise spans advanced therapeutic endoscopy, complex GI disorders, hepatology, ERCP, liver disease management and GI oncology. He has performed thousands of complex endoscopic procedures with excellent outcomes.",
  "medicalProblems": [
    { "title": "Stomach & Intestinal Disorders", "description": "GERD, peptic ulcers, IBS, IBD, celiac disease, GI bleeding." },
    { "title": "Liver Disorders", "description": "Fatty liver, hepatitis A–E, hepatitis B & C, alcoholic liver disease, cirrhosis & liver cancer." },
    { "title": "Pancreatic & Biliary Diseases", "description": "Pancreatitis, bile duct stones, strictures and jaundice." },
    { "title": "Digestive Cancers", "description": "Diagnosis and endoscopic management of GI malignancies." }
  ],
  "procedures": [
    { "title": "Endoscopy & Colonoscopy", "description": "Diagnostic and therapeutic procedures for ulcers, polyps, cancers and GI bleeding." },
    { "title": "ERCP & Biliary Procedures", "description": "Stone removal, stent placement, management of bile duct and pancreatic diseases." },
    { "title": "Advanced Endoscopy", "description": "Variceal banding, sclerotherapy, APC, PEG, endoscopic dilatations and cystogastrostomy." },
    { "title": "Capsule Endoscopy", "description": "Full small bowel evaluation with advanced imaging capsule." }
  ],
  "faqs": [
    { "question": "Does Dr. Mir perform ERCP?", "answer": "Yes, he is highly experienced in therapeutic ERCP and stent placements." },
    { "question": "Does he treat liver cirrhosis?", "answer": "Yes, including complications like variceal bleeding and ascites." },
    { "question": "Does he manage GI cancers?", "answer": "Yes, he performs advanced endoscopic treatments for digestive cancers." }
  ]
},
{
  "slug": "dr-suresh-kumar-chhabra",
  "name": "Dr. Suresh Kumar Chhabra",
  "specialty": "General & Minimally Invasive Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "37+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Sr. Consultant & Unit Incharge (Unit III)",
  "degree": "MBBS | MS (General Surgery)",
  "about": "Dr. Suresh Chhabra is a highly experienced General & Minimally Invasive Surgeon with an illustrious career spanning over 37 years. Currently serving as the Senior Consultant and Unit Incharge at Artemis Hospital, he has performed over 11,000 surgeries including complex joint replacements, hernia repairs, GI surgeries and advanced laparoscopic procedures. He is widely respected for his surgical skill, clinical precision and compassionate patient care. Dr. Chhabra has an extensive academic presence with more than 150 publications (50 international & 102 national) and continues to mentor medical students, postgraduates and surgeons across India and abroad. He established India’s first Frozen Bone Bank at AIIMS, showcasing his commitment to medical innovation.",
  "medicalProblems": [
    { "title": "Hernia & Abdominal Disorders", "description": "Inguinal, umbilical, incisional hernias and abdominal wall defects." },
    { "title": "Colorectal & GI Conditions", "description": "Colorectal diseases, piles, fissures and gastrointestinal surgical problems." },
    { "title": "Obesity & Metabolic Disorders", "description": "Evaluation and management of bariatric and metabolic conditions." },
    { "title": "Infections & Trauma", "description": "Soft tissue infections, trauma management and emergency surgical conditions." }
  ],
  "procedures": [
    { "title": "Hernia Surgeries", "description": "Laparoscopic hernia repair, incisional hernia repair and abdominal wall reconstruction." },
    { "title": "Bariatric Surgery", "description": "Gastric bypass, sleeve gastrectomy and metabolic surgery." },
    { "title": "Piles Treatment", "description": "Non-surgical and minimally invasive procedures for hemorrhoids." },
    { "title": "Advanced Surgical Techniques", "description": "Fracture fixation, arthroscopy, arthroplasty and reconstruction techniques." }
  ],
  "faqs": [
    { "question": "Does Dr. Chhabra perform laparoscopic hernia repair?", "answer": "Yes, he is highly experienced in advanced laparoscopic hernia surgeries." },
    { "question": "How many surgeries has he performed?", "answer": "He has performed more than 11,000 surgeries across multiple specialties." },
    { "question": "Does he treat complex GI and colorectal cases?", "answer": "Yes, he has extensive experience in GI, colorectal and abdominal surgeries." }
  ]
},
{
  "slug": "dr-paritosh-s-gupta",
  "name": "Dr. Paritosh S Gupta",
  "specialty": "General & Minimally Invasive Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - General, MI & Bariatric Surgery",
  "degree": "MBBS | MS (General Surgery) | DNB (General Surgery) | FMAS | FAIS",
  "about": "Dr. Paritosh S Gupta is one of the leading General, Minimal Access and Bariatric Surgeons in Delhi NCR with over 17 years of surgical experience and more than 14,000 surgeries to his credit. He is the Chief of General, MI & Bariatric Surgery at Artemis Hospital. Dr. Gupta has previously served as Head of Department at renowned hospitals such as Indian Spinal Injury Centre, Nova Specialty Surgery and Columbia Asia Hospital. A highly skilled expert in laparoscopic, bariatric, GI and abdominal surgeries, he is also a faculty and trainer at Ethicon Institute of Surgical Education where he trains surgeons in advanced laparoscopic procedures. He is actively involved in academic teaching and instrumental in establishing the FNB (Minimal Access Surgery) program at Artemis. Dr. Gupta is known for his precision, leadership and contribution to minimally invasive surgical advancements.",
  "medicalProblems": [
    { "title": "Gastrointestinal Disorders", "description": "Gastric issues, liver disorders, pancreatic diseases and GI surgical conditions." },
    { "title": "Obesity & Bariatric Issues", "description": "Morbid obesity, metabolic disorders and weight-loss surgery evaluation." },
    { "title": "Hernia & Abdominal Wall Issues", "description": "Inguinal, ventral, incisional and complex hernias." },
    { "title": "Thyroid & Breast Conditions", "description": "Thyroid nodules, tumors and breast disorders requiring surgical care." }
  ],
  "procedures": [
    { "title": "Colorectal Surgeries", "description": "Laparoscopic colectomy, hemicolectomy, APR, anterior resection and colostomy." },
    { "title": "Liver & Pancreatic Surgeries", "description": "Laparoscopic liver abscess drainage, hydatid cyst surgery and Whipple’s procedure." },
    { "title": "Bariatric Procedures", "description": "Laparoscopic sleeve gastrectomy, gastric bypass and gastric banding." },
    { "title": "Gallbladder & Appendix Surgeries", "description": "Laparoscopic cholecystectomy, CBD exploration and laparoscopic appendectomy." },
    { "title": "Thyroid & Breast Surgeries", "description": "Hemi/total thyroidectomy, MRM and breast conservation surgery." },
    { "title": "Hernia Surgeries", "description": "Laparoscopic TEP/TAPP repair, incisional, umbilical and hiatus hernia." },
    { "title": "Urological & GUT Surgeries", "description": "Nephrectomy, ureterolithotomy, prostate surgery, orchiectomy and adrenalectomy." },
    { "title": "Emergency Surgeries", "description": "Trauma laparotomy, perforation closure, peritonitis and abdominal emergencies." }
  ],
  "faqs": [
    { "question": "Is Dr. Gupta experienced in bariatric surgery?", "answer": "Yes, he is one of the most experienced bariatric surgeons with expertise in sleeve gastrectomy, gastric bypass and advanced metabolic surgery." },
    { "question": "Does he perform advanced laparoscopic GI surgeries?", "answer": "Yes, he specializes in minimally invasive GI, liver, pancreatic and colorectal surgeries." },
    { "question": "Does he train other surgeons?", "answer": "Yes, he is a faculty at Ethicon Institute of Surgical Education and trains surgeons in advanced laparoscopic procedures." }
  ]
},
{
  "slug": "dr-sukriti-gupta",
  "name": "Dr. Sukriti Gupta",
  "specialty": "BMT, Haematopoietic Stem Cell Transplant, Hematology, Paediatric Haemato-Oncology & BMT",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "11+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant",
  "degree": "MBBS | MD (Pediatrics) | PDCC (Haemato Oncology)",
  "about": "Dr. Sukriti Gupta is a highly accomplished Haemato-Oncologist and Pediatric Medicine Specialist with more than 7 years of experience in Haemato-Oncology and over 11 years in Pediatrics. She has extensive experience in managing a broad range of benign and malignant hematological disorders including leukemia, lymphoma, multiple myeloma and various anemias. Dr. Gupta is proficient in stem cell harvesting and transplantation, including autologous, allogeneic, haploidentical and matched unrelated donor (MUD) transplants. Her key areas of interest include pediatric leukemias, aplastic anemia and thalassemia. She has served at eminent institutions such as Paras Hospitals, Action Cancer Hospital and Apollo Hospital, contributing significantly to advancements in BMT and hematologic care.",
  "medicalProblems": [
    { "title": "Leukemia & Blood Cancers", "description": "Pediatric and adult leukemias, lymphomas and multiple myeloma." },
    { "title": "Benign Hematological Disorders", "description": "Aplastic anemia, thalassemia, hemolytic anemia and platelet disorders." },
    { "title": "Pediatric Blood Disorders", "description": "Childhood leukemias, bone marrow failure syndromes and immunodeficiencies." },
    { "title": "Stem Cell Failure Conditions", "description": "Bone marrow disorders requiring transplant evaluation." }
  ],
  "procedures": [
    { "title": "Stem Cell Transplantation", "description": "Autologous, allogeneic, haploidentical and MUD transplants." },
    { "title": "Chemotherapy Administration", "description": "Intravenous and intrathecal chemotherapy for hematologic malignancies." },
    { "title": "Stem Cell Harvesting", "description": "Peripheral stem cell and bone marrow collection." },
    { "title": "Bone Marrow Examination", "description": "Diagnostic bone marrow aspiration and biopsy." }
  ],
  "faqs": [
    { "question": "Does Dr. Sukriti perform pediatric bone marrow transplants?", "answer": "Yes, she specializes in pediatric BMT for leukemia, aplastic anemia and thalassemia." },
    { "question": "Does she manage adult and pediatric blood cancers?", "answer": "Yes, she treats leukemia, lymphoma and myeloma in both children and adults." },
    { "question": "Does she handle haploidentical and MUD transplants?", "answer": "Yes, she is proficient in complex transplant types, including haploidentical and unrelated donor transplants." }
  ]
},
{
  "slug": "dr-gaurav-dixit",
  "name": "Dr. Gaurav Dixit",
  "specialty": "BMT, Haematopoietic Stem Cell Transplant, Hematology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head – Haematology Oncology & Bone Marrow Transplant (Unit II)",
  "degree": "MBBS | MD (General Medicine) | DM (Clinical Hematology)",
  "about": "Dr. Gaurav Dixit is a leading Clinical Hematologist and BMT specialist with extensive experience in treating complex blood disorders. After completing his medical education at PGIMS Rohtak and DM in Clinical Hematology from CMC Vellore—one of India’s top hematology centers—he trained at AIIMS Delhi where he developed a strong foundation in hematology and transplant medicine. He has previously worked at Max Hospital, Shalimar Bagh, and Action Cancer Hospital, where he established successful bone marrow transplant programs. He has exceptional clinical insight and follows strict international treatment guidelines. He performed the first successful Bone Marrow Transplant in Kenya (Oct 2022). His special interests include leukemia, lymphoma, myeloma and aplastic anemia.",
  "medicalProblems": [
    { "title": "Benign Blood Disorders", "description": "Thalassemia, sickle cell disease, aplastic anemia and bone marrow failure syndromes." },
    { "title": "Pediatric Immuno-deficiencies", "description": "Children with immune system defects and recurrent infections." },
    { "title": "Malignant Hematology", "description": "Acute and chronic leukemias, lymphomas, myelodysplastic syndromes and myelofibrosis." },
    { "title": "Stem Cell Disorders", "description": "Conditions requiring bone marrow transplantation." }
  ],
  "procedures": [
    { "title": "Autologous Stem Cell Transplant", "description": "Stem cell rescue for myeloma and lymphoma." },
    { "title": "Matched Sibling Allogenic Transplant", "description": "Stem cell transplant from HLA-matched sibling donors." },
    { "title": "Haploidentical Stem Cell Transplant", "description": "Half-matched donor transplant for complex blood disorders." },
    { "title": "Matched Unrelated Donor (MUD) Transplant", "description": "Unrelated donor transplant for high-risk hematological diseases." },
    { "title": "CAR-T Cell Therapy", "description": "Advanced immunotherapy for resistant blood cancers." }
  ],
  "faqs": [
    { "question": "Does Dr. Dixit perform advanced BMT procedures?", "answer": "Yes, including haploidentical, MUD and CAR-T therapy." },
    { "question": "Does he treat both benign and malignant blood disorders?", "answer": "Yes, he specializes in both categories including leukemias and thalassemia." },
    { "question": "Has he set up BMT programs?", "answer": "Yes, he established bone marrow transplant units at multiple leading hospitals." }
  ]
},
{
  "slug": "dr-amit-sharma",
  "name": "Dr. Amit Sharma",
  "specialty": "Internal Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "21+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Preventive Health Checks & Internal Medicine",
  "degree": "MBBS | MD (General Medicine) | DNB (General Medicine) | MRCP (UK)",
  "about": "Dr. Amit Sharma is an experienced Internal Medicine specialist with over 21 years of clinical expertise across India and abroad. He has served in leading institutions including Park Hospital Gurugram, Government Hospital Abu Dhabi and the Armed Forces Medical Services (Indian Navy). He specializes in managing chronic and acute medical conditions such as diabetes, hypertension, thyroid disorders, asthma, COPD and infectious diseases. Dr. Sharma is also a certified BLS and ACLS provider. At Artemis Hospitals, he plays a pivotal role in Preventive Health Checks, offering personalized, ethical and patient-centric care. His memberships with prestigious bodies like the Royal College of Physicians (UK) and the American College of Physicians underscore his commitment to excellence.",
  "medicalProblems": [
    { "title": "Lifestyle Disorders", "description": "Diabetes, hypertension, obesity and thyroid diseases." },
    { "title": "Respiratory Conditions", "description": "Asthma, COPD, pneumonia and chronic lung infections." },
    { "title": "Infectious Diseases", "description": "Dengue, typhoid, malaria, tuberculosis and viral infections." },
    { "title": "General Medical Conditions", "description": "Gastro diseases, cardiac risk factors and metabolic disorders." }
  ],
  "procedures": [
    { "title": "Preventive Health Screening", "description": "Comprehensive health checks and risk assessment." },
    { "title": "Chronic Disease Management", "description": "Long-term care plans for diabetes, hypertension and thyroid disorders." },
    { "title": "Respiratory Care", "description": "Management of asthma, COPD and respiratory infections." },
    { "title": "Emergency Care Support", "description": "Management of acute medical emergencies and stabilization." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharma manage chronic diseases like diabetes?", "answer": "Yes, he specializes in long-term care for diabetes, hypertension and thyroid diseases." },
    { "question": "Does he have international experience?", "answer": "Yes, he has worked in Abu Dhabi and with the Indian Navy." },
    { "question": "Does he focus on preventive healthcare?", "answer": "Yes, he leads Preventive Health Checks at Artemis Hospitals." }
  ]
},
{
  "slug": "dr-seema-dhir",
  "name": "Dr. Seema Dhir",
  "specialty": "Internal Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant",
  "degree": "MBBS | MD (Medicine)",
  "about": "Dr. Seema Dhir is a senior Internal Medicine specialist with over two decades of experience. She graduated and completed her MD from Delhi University, followed by a senior residency at GTB Hospital. She has served as a consultant at St. Stephen’s Hospital for 4 years and at Holy Family Hospital for 7 years. Dr. Dhir has extensive experience in treating diabetes, endocrine disorders and lifestyle diseases. She has led clinics for diabetes and endocrinology and has conducted research in thyroid diseases, toxicology and megaloblastic anemia. Her practice focuses on reversing lifestyle disorders including obesity, hypertension, diabetes and coronary heart disease.",
  "medicalProblems": [
    { "title": "Diabetes & Endocrine Disorders", "description": "Diabetes, thyroid diseases and hormonal imbalances." },
    { "title": "Lifestyle Disorders", "description": "Hypertension, obesity and metabolic syndrome." },
    { "title": "General Medical Conditions", "description": "Infection, anemia, chronic diseases and general internal medicine cases." },
    { "title": "Heart & Metabolic Health", "description": "Coronary risk evaluation and lifestyle-based disease reversal." }
  ],
  "procedures": [
    { "title": "Lifestyle Disease Reversal", "description": "Management of obesity, diabetes and hypertension through clinical programs." },
    { "title": "Endocrine Clinics", "description": "Specialized thyroid and hormonal disorder management." },
    { "title": "General Medicine Care", "description": "Acute and chronic medical illness management." },
    { "title": "Preventive Health Care", "description": "Health assessments and risk factor identification." }
  ],
  "faqs": [
    { "question": "Does Dr. Seema treat diabetes and thyroid disorders?", "answer": "Yes, she has extensive experience in managing endocrine and metabolic disorders." },
    { "question": "Does she focus on lifestyle modifications?", "answer": "Yes, she emphasizes disease reversal through lifestyle correction." },
    { "question": "Where has she previously worked?", "answer": "She has served at St. Stephen’s Hospital and Holy Family Hospital for over a decade." }
  ]
},
{
  "slug": "dr-rahul-naithani",
  "name": "Dr. Rahul Naithani",
  "specialty": "BMT, Hematology, Oncology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Hematology, Oncology & Bone Marrow Transplant",
  "degree": "MBBS | MD (Pediatrics) | DM (Clinical Hematology) | Fellowship in BMT | FRCP (Edinburgh)",
  "about": "Dr. Rahul Naithani is an accomplished Clinical Hematologist and Bone Marrow Transplant specialist with extensive expertise in hematologic oncology. With MD in Pediatrics from Lady Hardinge Medical College and DM in Clinical Hematology from AIIMS Delhi, he further trained at world-renowned centers such as The Hospital for Sick Children, Toronto and St. Jude Children’s Research Hospital, USA. He has performed over 650 successful bone marrow transplants across a wide array of hematologic disorders. Dr. Naithani has established BMT programs and contributed more than 120 scientific publications in reputed international and national journals. He is recognized for his clinical leadership and excellence in treating complex blood cancers and bone marrow disorders.",
  "medicalProblems": [
    { "title": "Hematologic Malignancies", "description": "Leukemia, lymphoma, myeloma and other blood cancers." },
    { "title": "Bone Marrow Failure Disorders", "description": "Aplastic anemia, marrow failure and congenital blood disorders." },
    { "title": "Pediatric Blood Disorders", "description": "Childhood blood cancers and bone marrow diseases." },
    { "title": "Bleeding & Clotting Disorders", "description": "WBC disorders, platelet disorders and coagulation abnormalities." }
  ],
  "procedures": [
    { "title": "Bone Marrow Transplantation", "description": "Autologous, allogeneic, haploidentical and unrelated donor BMT." },
    { "title": "Leukemia Treatment", "description": "Advanced therapies for acute and chronic leukemias." },
    { "title": "Targeted Cancer Therapy", "description": "Modern targeted and immune-based therapies for hematologic cancers." },
    { "title": "Pediatric BMT", "description": "Transplant procedures for children with blood disorders." }
  ],
  "faqs": [
    { "question": "How many BMTs has Dr. Naithani performed?", "answer": "He has performed more than 650 successful bone marrow transplants." },
    { "question": "Does he treat both adults and children?", "answer": "Yes, he specializes in both adult and pediatric hematology and BMT." },
    { "question": "Is he trained internationally?", "answer": "Yes, he trained at leading global centers including Toronto and St. Jude Children’s Research Hospital." }
  ]
},
{
  "slug": "dr-nandini-vasdev",
  "name": "Dr. Nandini Vasdev",
  "specialty": "Laboratory Services",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Lab Medicine, Histopathology & Cytology",
  "degree": "MBBS | MD (Pathology)",
  "about": "Dr. Nandini Vasdev is an accomplished Histopathologist and Cytopathologist with more than 24 years of post-MD experience. She specializes in GI and liver transplant pathology, with deep expertise in liver and gastrointestinal disease evaluation. A graduate of Kasturba Medical College, Manipal, Dr. Vasdev has contributed extensively to diagnostic pathology and laboratory medicine. She is known for her precision-driven reporting, excellence in tissue diagnosis and leadership in pathology services.",
  "medicalProblems": [
    { "title": "Histopathology Diagnostics", "description": "Evaluation of tissue samples for tumors, infections and inflammatory diseases." },
    { "title": "Cytopathology Disorders", "description": "Diagnosis from fine-needle aspirations, smears and fluid samples." },
    { "title": "GI Pathology", "description": "Comprehensive study of gastrointestinal diseases at microscopic level." },
    { "title": "Liver Transplant Pathology", "description": "Pre- and post-transplant liver pathology evaluation." }
  ],
  "procedures": [
    { "title": "Histopathology Reporting", "description": "Tissue analysis including biopsies, resections and complex pathology cases." },
    { "title": "Cytology Studies", "description": "FNAC, body fluid cytology and screening cytopathology." },
    { "title": "GI & Liver Pathology", "description": "Specialized diagnostic evaluation of liver and GI disorders." },
    { "title": "Transplant Pathology", "description": "Detailed pathology review for solid organ transplants." }
  ],
  "faqs": [
    { "question": "Does Dr. Vasdev specialize in liver transplant pathology?", "answer": "Yes, she has extensive expertise in liver transplant and GI pathology." },
    { "question": "Does she handle complex histopathology cases?", "answer": "Yes, she has over two decades of experience in advanced tissue diagnostics." },
    { "question": "Is she a member of major pathology associations?", "answer": "Yes, she is a life member of the Delhi Chapter of Pathologists & Microbiologists and a Fellow of AGE, Manipal." }
  ]
},
{
  "slug": "dr-chandrima-misra-mukherjee",
  "name": "Dr. Chandrima Misra Mukherjee",
  "specialty": "Mental Health & Behavioural Sciences",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Co-Head Psychological Services",
  "degree": "BA Psychology | MA Clinical Psychology | M.Phil Clinical Psychology | Ph.D.",
  "about": "Dr. Chandrima Misra Mukherjee is a distinguished Clinical Psychologist and therapist with over 15 years of experience. She is registered with RCI and specializes in individual, couple and family therapy. A UGC-NET JRF and SRF awardee, she integrates Cognitive Behavior Therapy (CBT), Trauma-Informed Therapy, Mentalization-Based Therapy, Systemic and Internal Family Systems approaches. She works with adolescents, adults, couples and families, helping them navigate emotional difficulties, trauma and psychiatric conditions.",
  "medicalProblems": [
    { "title": "Emotional & Stress Disorders", "description": "Anxiety, stress, burnout and adjustment difficulties." },
    { "title": "Psychiatric Support Psychotherapy", "description": "Supportive therapy for depression, bipolar disorder and anxiety disorders." },
    { "title": "Relationship & Marital Issues", "description": "Couples therapy, conflict management and relational difficulties." },
    { "title": "Trauma & Behavioral Issues", "description": "Trauma-informed therapy for PTSD and behavioral challenges." }
  ],
  "procedures": [
    { "title": "Cognitive Behavioral Therapy (CBT)", "description": "Evidence-based therapy for anxiety, depression and behavior change." },
    { "title": "Family & Couple Therapy", "description": "Relationship-oriented therapeutic interventions." },
    { "title": "Trauma-Informed Therapy", "description": "Therapy for trauma healing and emotional recovery." },
    { "title": "Systemic & IFS Approaches", "description": "Advanced psychotherapy models for deep emotional work." }
  ],
  "faqs": [
    { "question": "Does Dr. Chandrima treat adolescents and adults?", "answer": "Yes, she works with both age groups including families and couples." },
    { "question": "Is she trained in trauma therapy?", "answer": "Yes, she is trained in Trauma-Informed and Mentalization-Based therapies." },
    { "question": "Does she handle marital counseling?", "answer": "Yes, relationship and marital therapy are among her key areas of expertise." }
  ]
},
{
  "slug": "dr-rahul-chandhok",
  "name": "Dr. Rahul Chandhok",
  "specialty": "Mental Health & Behavioural Sciences",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head Consultant - Psychiatry",
  "degree": "MBBS | MD (Psychiatry)",
  "about": "Dr. Rahul Chandhok is a Senior Consultant and Head of Psychiatry with over 20 years of post-MD experience. He has worked with AIIMS, Safdarjung Hospital and VMMC and has been practicing across Delhi NCR since 2006. He specializes in treating schizophrenia, depression, anxiety, bipolar disorder, OCD, dementia, sexual disorders and addiction. Known for his compassionate approach, he conducts regular CME programs and awareness sessions. He is also a former Paul Harris Fellow of the Rotary Club.",
  "medicalProblems": [
    { "title": "Psychiatric Disorders", "description": "Schizophrenia, bipolar disorder, depression and anxiety disorders." },
    { "title": "Addiction & Substance Abuse", "description": "Alcohol, drug addiction, internet and gambling addiction." },
    { "title": "Cognitive & Memory Disorders", "description": "Dementia, memory issues and behavioral problems." },
    { "title": "Child & Adolescent Psychiatry", "description": "ADHD, behavioral issues and emotional disorders in children." }
  ],
  "procedures": [
    { "title": "Medication Management", "description": "Scientific and structured pharmacological treatment for psychiatric disorders." },
    { "title": "Psychotherapy Coordination", "description": "Collaborative care with psychologists for long-term management." },
    { "title": "Addiction Treatment", "description": "Detox, counseling and relapse prevention programs." },
    { "title": "Emergency Psychiatry", "description": "Management of acute psychiatric crises." }
  ],
  "faqs": [
    { "question": "Does Dr. Chandhok treat severe psychiatric conditions?", "answer": "Yes, he treats schizophrenia, bipolar disorder, OCD and major depression." },
    { "question": "Does he manage addiction cases?", "answer": "Yes, he provides complete treatment for substance abuse and behavioral addiction." },
    { "question": "Does he treat children?", "answer": "Yes, he has expertise in ADHD and pediatric behavioral issues." }
  ]
},
{
  "slug": "dr-manju-aggarwal",
  "name": "Dr. Manju Aggarwal",
  "specialty": "Kidney Transplant, Nephrology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Medical Services & Chairperson - Nephrology",
  "degree": "MBBS | MD (Internal Medicine) | DNB (Nephrology) | Fellowship in Nephrology (USA) | MBA Healthcare Administration",
  "about": "Dr. Manju Aggarwal is a highly respected Nephrologist with more than three decades of experience across India and the United States. She trained at the University of Minnesota—one of the world’s leading nephrology centers. She specializes in critically ill renal patients, dialysis, fluids-electrolyte management and complex kidney transplants, particularly high-risk and incompatible transplant cases. She has led major nephrology departments at Indraprastha Apollo Hospital and Sant Parmanand Hospital before joining Artemis. She is also a DNB teaching faculty and actively chairs multiple hospital administrative committees.",
  "medicalProblems": [
    { "title": "Kidney Failure & CKD", "description": "Management of acute and chronic renal failure." },
    { "title": "Dialysis Care", "description": "Hemodialysis, peritoneal dialysis and home dialysis support." },
    { "title": "Kidney Transplant Cases", "description": "High-risk, incompatible and sensitized transplant patients." },
    { "title": "ICU Nephrology", "description": "Critical care for acid-base, fluid and electrolyte disorders." }
  ],
  "procedures": [
    { "title": "Kidney Transplantation", "description": "Living donor, incompatible and high-risk kidney transplants." },
    { "title": "Dialysis Therapies", "description": "Hemodialysis, CRRT, peritoneal dialysis and home dialysis programs." },
    { "title": "Renal Replacement Therapy", "description": "Advanced kidney support therapies in ICU settings." },
    { "title": "Critical Renal Care", "description": "Complex renal management in critically ill patients." }
  ],
  "faqs": [
    { "question": "Does Dr. Manju handle incompatible kidney transplants?", "answer": "Yes, she specializes in highly sensitized and incompatible transplant cases." },
    { "question": "Does she manage ICU kidney patients?", "answer": "Yes, she is an expert in critical care nephrology and renal replacement therapy." },
    { "question": "Is she internationally trained?", "answer": "Yes, she completed her nephrology fellowship at the University of Minnesota, USA." }
  ]
},
{
  "slug": "dr-gaurav-singhal",
  "name": "Dr. Gaurav Singhal",
  "specialty": "Kidney Transplant, Nephrology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant - Nephrology",
  "degree": "MBBS | MD (Internal Medicine) | DrNB (Nephrology)",
  "about": "Dr. Gaurav Singhal is a skilled Nephrologist with strong academic and clinical credentials. He completed his DrNB in Nephrology from the prestigious Army Hospital R&R, New Delhi, and MD in Internal Medicine from Lady Hardinge Medical College. He specializes in dialysis care, renal failure management, transplant nephrology and advanced extracorporeal therapies including CRRT, hemodiafiltration and hemoperfusion. With experience across Army Hospital R&R and Fortis Memorial Research Institute, he is known for his precision, patient-centric care and expertise in managing complex renal disorders.",
  "medicalProblems": [
    { "title": "Chronic Kidney Disease", "description": "Comprehensive care for CKD and renal failure patients." },
    { "title": "Dialysis & Renal Support", "description": "Hemodialysis, peritoneal dialysis and CRRT." },
    { "title": "Kidney Transplant Care", "description": "ABO-incompatible and swap transplant management." },
    { "title": "Acute Kidney Injury", "description": "Emergency management of AKI and critical renal conditions." }
  ],
  "procedures": [
    { "title": "Hemodialysis & Peritoneal Dialysis", "description": "Routine and advanced dialysis therapies." },
    { "title": "CRRT & Hemodiafiltration", "description": "Continuous renal replacement therapy for ICU patients." },
    { "title": "Extracorporeal Treatments", "description": "Hemoperfusion, cytosorb, tobramycin cartridges and advanced renal support." },
    { "title": "Post-Transplant Care", "description": "Management of transplant recipients including complications." }
  ],
  "faqs": [
    { "question": "Does Dr. Singhal perform complex dialysis procedures?", "answer": "Yes, he is skilled in CRRT, hemodiafiltration and extracorporeal therapies." },
    { "question": "Does he manage kidney transplant patients?", "answer": "Yes, including ABO-incompatible and swap transplants." },
    { "question": "Is he actively involved in academic work?", "answer": "Yes, he has co-authored multiple publications in nephrology journals and conferences." }
  ]
},
{
  "slug": "dr-raman-deep-kaur",
  "name": "Dr. Raman Deep Kaur",
  "specialty": "Neuroanaesthesia & Neuro Critical Care",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Neuroanaesthesia & Neuro Critical Care",
  "degree": "MBBS | DNB (Anesthesiology) | ISNACC Fellowship (Neuroanesthesia & Neurocritical Care)",
  "about": "Dr. Raman Deep Kaur is a skilled Neuroanaesthesiologist and Neurocritical Care specialist with over 10 years of experience. She completed her postgraduation at BHMRC, New Delhi, followed by a senior residency at the reputed GB Pant Hospital where she developed her interest in neuroanaesthesia. She later pursued an ISNACC fellowship at Max Hospital, Saket. She is known for her calm, compassionate approach and expertise in managing complex neurosurgical and neurointervention cases, as well as critically ill neuro patients in the ICU.",
  "medicalProblems": [
    { "title": "Acute Neurocritical Conditions", "description": "Stroke, subarachnoid hemorrhage (SAH), meningitis, GBS and encephalopathy." },
    { "title": "Neuromuscular Disorders", "description": "Myasthenia gravis and severe neurological infections." },
    { "title": "Perioperative Neurosurgical Care", "description": "Care for patients undergoing brain and spine surgeries." },
    { "title": "Critical Brain Monitoring", "description": "Advanced monitoring for unstable neurological patients." }
  ],
  "procedures": [
    { "title": "Transcranial Doppler", "description": "Assessment of cerebral blood flow." },
    { "title": "POCUS", "description": "Point-of-care ultrasound for critical care management." },
    { "title": "Percutaneous Tracheostomy", "description": "Minimally invasive airway access procedure." },
    { "title": "Fiberoptic Bronchoscopy", "description": "Airway evaluation and ICU procedures." },
    { "title": "Central & Arterial Line Placement", "description": "Venous, arterial and epidural catheter insertion." }
  ],
  "faqs": [
    { "question": "Does Dr. Kaur manage complex neuro ICU cases?", "answer": "Yes, she specializes in neurocritical care including stroke, SAH and encephalopathy." },
    { "question": "Does she perform neuroanaesthesia for awake craniotomies?", "answer": "Yes, she has expertise in neuroanaesthesia including awake craniotomy procedures." },
    { "question": "Is she trained in advanced neurocritical care?", "answer": "Yes, she completed an ISNACC fellowship in Neuroanesthesia and Neurocritical Care." }
  ]
},
{
  "slug": "dr-saurabh-anand",
  "name": "Dr. Saurabh Anand",
  "specialty": "Neuroanaesthesia & Neuro Critical Care",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Neuroanaesthesia & Neurocritical Care",
  "degree": "MBBS | MD (Anaesthesia)",
  "about": "Dr. Saurabh Anand is an accomplished Neuroanaesthesiologist and Neurocritical Care expert trained at SMS Medical College, Jaipur, with specialized training from AIIMS, New Delhi. Before joining Artemis, he served as Senior Consultant in Neuroanaesthesia & Critical Care at Medanta for over six years. Recognized as a faculty member by the Indian Society of Neuroanaesthesia and Critical Care, he is known for his expertise in neurocritical care, awake craniotomy protocols and management of cerebral vasospasm.",
  "medicalProblems": [
    { "title": "Neurocritical Emergencies", "description": "SAH, severe stroke, traumatic brain injury and neurovascular crises." },
    { "title": "Neurosurgical Care", "description": "Anaesthesia and monitoring for brain and spine surgeries." },
    { "title": "Cerebral Vasospasm", "description": "Diagnosis and management protocols for vasospasm." },
    { "title": "Neuromonitoring", "description": "Brain monitoring modalities in neuro ICUs." }
  ],
  "procedures": [
    { "title": "Transcranial Doppler", "description": "Advanced assessment of cerebral hemodynamics." },
    { "title": "Percutaneous Tracheostomy", "description": "Airway access in critical neuro patients." },
    { "title": "Neuroanaesthesia for Awake Craniotomy", "description": "Specialized anaesthesia for functional neurosurgeries." },
    { "title": "Comprehensive Neurocritical Care Procedures", "description": "Airway, ventilation and hemodynamic management." }
  ],
  "faqs": [
    { "question": "Does Dr. Anand handle SAH and severe neuro emergencies?", "answer": "Yes, he is an expert in managing SAH and complex neurocritical care cases." },
    { "question": "Is he trained in awake craniotomy?", "answer": "Yes, he has special interest and expertise in awake craniotomy." },
    { "question": "Has he worked at major hospitals?", "answer": "Yes, he worked as Senior Consultant at Medanta for over six years." }
  ]
},
{
  "slug": "dr-tariq-matin",
  "name": "Dr. Tariq Matin",
  "specialty": "Neurointerventional Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Director & Chief - Neurointerventional Surgery",
  "degree": "MBBS | DMRD | DNB (Radiodiagnosis)",
  "about": "Dr. Tariq Matin is a highly experienced Neurointerventional Surgeon with over 15 years of experience and more than 5000 neuroendovascular therapeutic procedures to his credit. He has served as Senior Consultant and Clinical Lead at top hospitals including Medanta, Fortis FMRI and Narayana Health. Dr. Tariq is recognized internationally and has been actively involved in developing neurointervention programs and training specialists across India. His expertise spans stroke interventions, aneurysm management, AVM procedures and complex neurovascular therapies.",
  "medicalProblems": [
    { "title": "Acute Stroke", "description": "Ischemic stroke requiring emergency thrombectomy or thrombolysis." },
    { "title": "Cerebral Aneurysms", "description": "Endovascular treatment including coiling and flow diverters." },
    { "title": "AVMs & AV Fistulas", "description": "Diagnosis and endovascular embolization." },
    { "title": "Carotid Artery Disease", "description": "Carotid stenosis requiring stenting." }
  ],
  "procedures": [
    { "title": "Mechanical Thrombectomy", "description": "Emergency stroke treatment to remove clots." },
    { "title": "Carotid Stenting", "description": "Endovascular management of carotid artery blockages." },
    { "title": "Aneurysm Coiling & Flow Diversion", "description": "Minimally invasive treatment for intracranial aneurysms." },
    { "title": "AVM/AVF Embolization", "description": "Endovascular closure of malformations." },
    { "title": "Spinal & Cerebral Angiograms", "description": "Diagnostic imaging for neurovascular conditions." }
  ],
  "faqs": [
    { "question": "How many neurointerventional cases has Dr. Tariq performed?", "answer": "He has performed over 5000 therapeutic neuroendovascular procedures." },
    { "question": "Does he treat stroke patients?", "answer": "Yes, he specializes in emergency mechanical thrombectomy and stroke care." },
    { "question": "Has he received any major awards?", "answer": "Yes, including the PAN ARAB Interventional Society award for Stroke Centre Development." }
  ]
},
{
  "slug": "dr-mukesh-kumar",
  "name": "Dr. Mukesh Kumar",
  "specialty": "Neurointerventional Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Additional Consultant - Neurointerventional Surgery",
  "degree": "MBBS | MD (Medicine) | DM (Neurology) | PDF (Neuro Intervention)",
  "about": "Dr. Mukesh Kumar is an experienced Neurointerventional Surgeon and Neurologist with more than 20 years of experience, trained at AFMC Pune and AIIMS Delhi. He is among the few specialists in India trained in both stroke neurology and neurointervention. He has worked in prestigious establishments including AIIMS Delhi, Command Hospitals and Paras Hospital. His expertise includes mechanical thrombectomy, carotid interventions, aneurysm treatments and AVM therapy. He is a strong researcher with publications in leading peer-reviewed journals.",
  "medicalProblems": [
    { "title": "Acute Stroke", "description": "Emergency endovascular treatment including mechanical thrombectomy." },
    { "title": "Carotid Artery Disease", "description": "Carotid stenosis and recurrent stroke management." },
    { "title": "Aneurysm & AVM Disorders", "description": "Vascular malformations of the brain requiring interventional treatment." },
    { "title": "Neurological Vasculitis", "description": "Diagnosis and endovascular management of vasculitis." }
  ],
  "procedures": [
    { "title": "Mechanical Thrombectomy", "description": "Clot removal for acute ischemic stroke." },
    { "title": "IV Thrombolysis", "description": "Emergency clot dissolution." },
    { "title": "Carotid Stenting", "description": "Stenting for carotid artery blockages." },
    { "title": "Aneurysm & AVM Treatment", "description": "Endovascular coiling, embolization and fistula repair." },
    { "title": "Cerebral & Spinal Angiography", "description": "Diagnostic imaging of brain and spine vessels." }
  ],
  "faqs": [
    { "question": "Is Dr. Mukesh trained in both neurology and neurointervention?", "answer": "Yes, he is one of the few specialists with dual training." },
    { "question": "Does he manage acute stroke?", "answer": "Yes, he is highly skilled in mechanical thrombectomy and IV thrombolysis." },
    { "question": "Does he have research publications?", "answer": "Yes, he has published multiple papers in reputed medical journals." }
  ]
},
{
  "slug": "dr-sameer-arora",
  "name": "Dr. Sameer Arora",
  "specialty": "Neurology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Neurology",
  "degree": "MBBS | MD (Internal Medicine) | DM (Neurology)",
  "about": "Dr. Sameer Arora is an accomplished Neurologist with over eight years of experience, trained at AIIMS New Delhi. He has worked at prestigious institutions including Safdarjung Hospital, Aarvy Healthcare, Narayana Superspeciality Hospital and Marengo Asia Hospital. His expertise spans acute neurological emergencies, neurophysiology diagnostics, epilepsy monitoring, sleep medicine and advanced stroke interventions including IV thrombolysis and botulinum toxin therapy. He has contributed multiple research papers, case reports and book chapters, and has been an invited speaker at national conferences.",
  "medicalProblems": [
    { "title": "Neurological Emergencies", "description": "Guillain-Barré Syndrome, acute stroke and myasthenia gravis." },
    { "title": "Movement & Nerve Disorders", "description": "Parkinson’s disease, neuropathies and muscle disorders." },
    { "title": "Epilepsy & Seizure Disorders", "description": "Comprehensive epilepsy care and monitoring." },
    { "title": "Cognitive & Memory Disorders", "description": "Dementia, neurocognitive decline and behavioral neurology." }
  ],
  "procedures": [
    { "title": "Neurophysiological Tests", "description": "EEG, EMG, NCS, RNS and evoked potentials." },
    { "title": "Acute Stroke Interventions", "description": "IV thrombolysis and emergency stroke management." },
    { "title": "Botulinum Toxin Therapy", "description": "Treatment for dystonia, spasticity and migraine." },
    { "title": "Plasmapheresis", "description": "Therapy for severe immune-mediated neuromuscular disorders." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora treat stroke and neurological emergencies?", "answer": "Yes, he specializes in acute stroke, GBS, myasthenia gravis and neuro-emergencies." },
    { "question": "Is he trained in EEG, EMG and neurophysiology?", "answer": "Yes, he is skilled in all advanced neurodiagnostic procedures." },
    { "question": "Does he manage epilepsy cases?", "answer": "Yes, he is experienced in epilepsy monitoring and treatment." }
  ]
},
{
  "slug": "dr-sumit-singh",
  "name": "Dr. Sumit Singh",
  "specialty": "Neurology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Neurology",
  "degree": "MBBS | MD (Medicine) | DM (Neurology)",
  "about": "Dr. Sumit Singh is a renowned Neurologist and former topper at AIIMS, Delhi, where he also served as Faculty. He established India's first government-sector Headache Clinic at AIIMS in 2002 and pioneered the use of Botulinum toxin therapy for headaches and trigeminal neuralgia in India. A leading expert in Parkinson’s disease, movement disorders and Deep Brain Stimulation (DBS), he has extensive experience with dystonias, Writer’s Cramp, spasticity and hemifacial spasm. With over 104 research publications and 14 book chapters, Dr. Singh is one of India’s most respected neurologists.",
  "medicalProblems": [
    { "title": "Movement Disorders", "description": "Parkinson’s disease, dystonias, Writer’s cramp, blepharospasm, hemifacial spasm." },
    { "title": "Neuromuscular Disorders", "description": "Myasthenia gravis and related neuromuscular diseases." },
    { "title": "Headache & Migraine", "description": "Chronic migraine, trigeminal neuralgia and complex headache disorders." },
    { "title": "Multiple Sclerosis", "description": "Diagnosis and long-term management of MS." }
  ],
  "procedures": [
    { "title": "Botox Therapy", "description": "For headaches, trigeminal neuralgia, dystonias and spasticity." },
    { "title": "Plasma Exchange", "description": "Therapy for myasthenia gravis and autoimmune neurological disorders." },
    { "title": "Injection Therapy", "description": "Carpal tunnel and nerve entrapment injections." }
  ],
  "faqs": [
    { "question": "Is Dr. Sumit an expert in Parkinson’s disease?", "answer": "Yes, he is a leading specialist in movement disorders and deep brain stimulation." },
    { "question": "Does he treat complex headache disorders?", "answer": "Yes, he founded the first AIIMS headache clinic and pioneered Botox therapy for headache in India." },
    { "question": "Does he perform Botox procedures?", "answer": "Yes, he is one of the few experts in India for neurological Botox applications." }
  ]
},
{
  "slug": "dr-aditya-gupta",
  "name": "Dr. Aditya Gupta",
  "specialty": "Neurosurgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "32+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson - Neurosurgery & CNS Radiosurgery | Co-Chief - CyberKnife Centre",
  "degree": "MBBS | M.Ch (Neurosurgery) | Advanced International Fellowships",
  "about": "Dr. Aditya Gupta is one of India’s most accomplished neurosurgeons with over 32 years of experience and more than 10,000 brain tumour surgeries and 6,000 radiosurgery procedures. An AIIMS graduate and former Associate Professor of Neurosurgery at AIIMS, he co-founded the Institute of Neurosciences at Medanta. Trained at top global institutes in Amsterdam, Paris, Marseilles, Germany and the USA, he is an international leader in CyberKnife, Gamma Knife and LINAC-based radiosurgery. He has a strong global patient base and more than 50 scientific publications.",
  "medicalProblems": [
    { "title": "Brain & Spine Tumors", "description": "Brain tumour, spine tumour and skull base tumour management." },
    { "title": "Movement Disorders", "description": "Parkinson’s disease requiring DBS and advanced therapies." },
    { "title": "Epilepsy & Neurosurgical Disorders", "description": "Refractory epilepsy and nerve disorders." },
    { "title": "Cerebrovascular Diseases", "description": "Aneurysms, AVMs and neurovascular disorders." }
  ],
  "procedures": [
    { "title": "Brain Tumor Microsurgery", "description": "Advanced microsurgical tumor removal." },
    { "title": "CyberKnife Radiosurgery", "description": "Non-invasive radiosurgery for brain and spine." },
    { "title": "Deep Brain Stimulation (DBS)", "description": "Surgical treatment for Parkinson’s disease and movement disorders." },
    { "title": "Nerve & Brachial Plexus Surgery", "description": "Reconstructive and functional nerve surgeries." }
  ],
  "faqs": [
    { "question": "Has Dr. Gupta performed many brain tumour surgeries?", "answer": "Yes, he has performed over 10,000 brain tumour surgeries." },
    { "question": "Is he experienced in radiosurgery?", "answer": "Yes, he has performed more than 6,000 radiosurgery procedures using CyberKnife, Gamma Knife and LINAC." },
    { "question": "Does he treat international patients?", "answer": "Yes, he is renowned globally with patients from over 15 countries." }
  ]
},
{
  "slug": "dr-pawan-goyal",
  "name": "Dr. Pawan Goyal",
  "specialty": "Neurosurgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Chief - Neurosurgery & Head - Neuroendoscopy",
  "degree": "MBBS | MS (General Surgery) | MCh (Neurosurgery)",
  "about": "Dr. Pawan Goyal is a highly skilled neurosurgeon with over 25 years of clinical experience. Trained at Pt. BD Sharma PGIMS Rohtak and KGMU Lucknow, he specializes in minimally invasive spine and neurosurgery, neuroendoscopy, stereotactic surgery and management of all types of brain and spine tumors. He has published scientific papers and presented at major national and international neurosurgery conferences.",
  "medicalProblems": [
    { "title": "Brain Tumors", "description": "Meningiomas, gliomas and skull base tumors." },
    { "title": "Spine Disorders", "description": "Disc herniation, spinal stenosis and spinal injuries." },
    { "title": "Traumatic Injuries", "description": "Head injury and spine trauma management." },
    { "title": "Functional Neurosurgery", "description": "Dystonias, epilepsy and stereotactic disorders." }
  ],
  "procedures": [
    { "title": "Endoscopic Neurosurgery", "description": "Endoscopic tumor and cyst removal." },
    { "title": "Minimally Invasive Spine Surgery", "description": "Advanced spine decompression and stabilization." },
    { "title": "Stereotactic Neurosurgery", "description": "Precision-guided neurosurgical techniques." },
    { "title": "Brain & Spine Tumor Surgery", "description": "Modern microsurgical tumor removal." }
  ],
  "faqs": [
    { "question": "Does Dr. Goyal perform endoscopic neurosurgery?", "answer": "Yes, he heads Neuroendoscopy at Artemis." },
    { "question": "Does he treat spine disorders?", "answer": "Yes, he specializes in minimally invasive and endoscopic spine surgery." },
    { "question": "Is he experienced in trauma cases?", "answer": "Yes, he handles complex head and spinal injury cases." }
  ]
},
{
  "slug": "dr-noaline-sinha",
  "name": "Dr. Noaline Sinha",
  "specialty": "Nuclear Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson - Nuclear Medicine & Radio-Theranostics",
  "degree": "MBBS | Post Graduation in Radiation Medicine | PGDHHM | RSO Certification",
  "about": "Dr. Noaline Sinha is an expert in diagnostic and therapeutic Nuclear Medicine with extensive experience in PET-CT, cardiac PET, myocardial perfusion imaging and radionuclide therapy. She has special interest in high-dose I-131 therapy for thyroid cancer, neuroendocrine tumors and prostate cancer. She played a pivotal role in guiding the Nuclear Medicine Department through NABH accreditation and has contributed significantly to oncology imaging and theranostics.",
  "medicalProblems": [
    { "title": "Thyroid Cancer", "description": "Radioactive iodine therapy for thyroid malignancies." },
    { "title": "Neuroendocrine Tumors", "description": "Targeted radionuclide imaging and therapy." },
    { "title": "Prostate Cancer", "description": "Advanced PET imaging and radio-theranostics." },
    { "title": "Cardiac Perfusion Disorders", "description": "Nuclear cardiology and viability assessment." }
  ],
  "procedures": [
    { "title": "PET-CT Imaging", "description": "Whole-body diagnostics for oncology, cardiology and neurology." },
    { "title": "High-Dose I-131 Therapy", "description": "Therapeutic radioactive iodine treatment." },
    { "title": "Nuclear Cardiology Studies", "description": "Myocardial perfusion and cardiac PET." },
    { "title": "Gamma Probe Procedures", "description": "Intra-operative tumor localization." }
  ],
  "faqs": [
    { "question": "Does Dr. Noaline perform high-dose radioiodine therapy?", "answer": "Yes, she specializes in I-131 therapy for thyroid cancer and NETs." },
    { "question": "Does she perform PET-CT?", "answer": "Yes, she has extensive experience in PET-CT and nuclear imaging." },
    { "question": "Is she certified by AERB?", "answer": "Yes, she is fully certified for radioisotope administration." }
  ]
},
{
  "slug": "dr-tajamul-syed-malik",
  "name": "Dr. Tajamul Syed Malik",
  "specialty": "Nuclear Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Nuclear Medicine",
  "degree": "MBBS | DNB (Nuclear Medicine)",
  "about": "Dr. Tajamul Syed Malik is an experienced Nuclear Medicine specialist with extensive expertise in PET-CT, cardiac PET, renal scans, and therapeutic nuclear oncology. He has deep experience in I-131 therapy for thyroid cancer and other targeted radiopharmaceutical therapies. Previously associated with VMMC & Safdarjung Hospital, he is known for precision imaging and compassionate patient care.",
  "medicalProblems": [
    { "title": "Thyroid Disorders & Cancer", "description": "I-131 therapy and diagnostic nuclear imaging." },
    { "title": "Oncology PET Imaging", "description": "Cancer staging, recurrence and response monitoring." },
    { "title": "Renal Disorders", "description": "Renal nuclear scans and functional assessment." },
    { "title": "Cardiac Conditions", "description": "Cardiac PET and myocardial perfusion studies." }
  ],
  "procedures": [
    { "title": "PET-CT Studies", "description": "Whole-body PET and cardiac PET imaging." },
    { "title": "Scintigraphy", "description": "Renal, GI, CNS and infection imaging." },
    { "title": "Therapeutic I-131", "description": "Radioiodine therapy for hyperthyroidism and thyroid cancer." }
  ],
  "faqs": [
    { "question": "Does Dr. Malik perform PET-CT?", "answer": "Yes, he has extensive experience in oncology and cardiac PET." },
    { "question": "Does he treat thyroid cancer?", "answer": "Yes, using high-dose I-131 and nuclear therapeutics." },
    { "question": "Where has he worked previously?", "answer": "He previously worked at VMMC and Safdarjung Hospital, New Delhi." }
  ]
},
{
  "slug": "dr-seerat-sandhu",
  "name": "Dr. Seerat Sandhu",
  "specialty": "Maternity, Obstetrics & Gynaecology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Classified Consultant - Obstetrics & Gynaecology",
  "degree": "MBBS | MS (OBG) | DNB",
  "about": "Dr. Seerat Sandhu is an experienced Obstetrician and Gynecologist with over 8 years of clinical practice. A PGIMS Rohtak graduate, she specializes in high-risk pregnancies, menstrual disorders, PCOD, endometriosis, laparoscopic surgery and infertility management. She is known for her patient-centered approach and compassionate care for women across all stages of life.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Preeclampsia, diabetes in pregnancy, placenta previa and other complications." },
    { "title": "Infertility & Endocrine Disorders", "description": "PCOD, endometriosis and ovulation disorders." },
    { "title": "Menstrual Disorders", "description": "Irregular cycles, heavy bleeding and dysmenorrhea." },
    { "title": "Gynecological Cancers", "description": "Screening and management (in liaison with gyne-oncosurgeons)." }
  ],
  "procedures": [
    { "title": "Normal & Assisted Delivery", "description": "Comprehensive pregnancy care." },
    { "title": "Cesarean Section", "description": "Emergency and planned C-sections." },
    { "title": "Laparoscopic Surgeries", "description": "Ovarian cystectomy, TLH, ectopic pregnancy management." },
    { "title": "Hysteroscopy", "description": "Diagnostic and operative hysteroscopy for women’s health." }
  ],
  "faqs": [
    { "question": "Does Dr. Seerat handle high-risk pregnancies?", "answer": "Yes, she specializes in managing high-risk maternal conditions." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, including ovarian cyst removal and TLH." },
    { "question": "Does she treat PCOD and infertility?", "answer": "Yes, she offers medical and surgical infertility care." }
  ]
},
{
  "slug": "dr-nidhi-rajotia",
  "name": "Dr. Nidhi Rajotia (Goel)",
  "specialty": "Maternity, Obstetrics & Gynaecology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "19+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Unit Head - Obstetrics & Gynaecology",
  "degree": "MBBS | MS (OBG) | DNB | MICOG",
  "about": "Dr. Nidhi Rajotia is an award-winning Obstetrician and Gynecologist with over 19 years of experience. A Gold Medalist from PGIMS Rohtak, she is an expert in high-risk pregnancies, advanced laparoscopic surgeries, hysteroscopy, adolescent health, menopausal care and infertility treatment. With over 2,000 minimally invasive surgeries performed, she is a leading name in comprehensive women’s healthcare.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Preeclampsia, placenta accreta, diabetes, heart disease in pregnancy." },
    { "title": "Adolescent Gynecology", "description": "Menstrual disorders, endometriosis, ovarian cysts and hormonal issues." },
    { "title": "Gynecological Surgeries", "description": "Hysterectomy, pelvic floor repair, myomectomy and ovarian surgeries." },
    { "title": "Infertility & Menopause", "description": "Hormonal management, laparoscopic infertility procedures and menopausal care." }
  ],
  "procedures": [
    { "title": "Laparoscopic Surgeries", "description": "TLH, myomectomy, ovarian drilling and ectopic pregnancy." },
    { "title": "Hysteroscopic Surgeries", "description": "Septal resection and evaluation of infertility." },
    { "title": "Obstetric Care", "description": "Normal delivery, C-section and high-risk pregnancy management." },
    { "title": "Pelvic Floor Repair", "description": "Cystocele and rectocele corrective surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Nidhi specialize in high-risk pregnancy?", "answer": "Yes, she has extensive expertise in managing complex pregnancies." },
    { "question": "Does she perform laparoscopic surgeries?", "answer": "Yes, with over 2,000 minimally invasive procedures performed." },
    { "question": "Is she experienced in adolescent and menopausal care?", "answer": "Yes, she provides comprehensive care across all life stages." }
  ]
},
{
  "slug": "dr-nidhi-jain",
  "name": "Dr. Nidhi Jain",
  "specialty": "Maternity, Obstetrics & Gynaecology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Obstetrics & Gynaecology",
  "degree": "MBBS | MS (OBG) | Fellowship in Obstetric Ultrasound | Fellowship in Advanced Gynecological Endoscopy",
  "about": "Dr. Nidhi Jain is a skilled Obstetrician and Gynecologist with expertise in high-risk pregnancy, infertility, advanced laparoscopy and hysteroscopy. A graduate of Kasturba Medical College (Manipal), she holds specialized fellowships in ultrasound and minimally invasive gynecology. She is known for her expertise in PCOD, endometriosis, gynecologic cancers (in liaison with onco-surgeons) and advanced endoscopic procedures.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Medical complications, fetal issues and maternal risk factors." },
    { "title": "Endocrine Disorders", "description": "PCOD, endometriosis and hormonal issues." },
    { "title": "Infertility", "description": "Evaluation and treatment of infertility disorders." },
    { "title": "Gynecologic Malignancies", "description": "Screening & management with onco-surgeons." }
  ],
  "procedures": [
    { "title": "Normal & Cesarean Delivery", "description": "Full maternity care and delivery." },
    { "title": "Laparoscopic Surgeries", "description": "Cystectomy, TLH, tubal ligation and ectopic pregnancy." },
    { "title": "Hysteroscopy", "description": "Diagnostic and operative hysteroscopic procedures." },
    { "title": "Infertility Procedures", "description": "Evaulation and laparoscopic treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Jain manage high-risk pregnancies?", "answer": "Yes, she specializes in high-risk and complex cases." },
    { "question": "Is she trained in advanced endoscopy?", "answer": "Yes, she holds a fellowship in advanced gynecological endoscopy." },
    { "question": "Does she treat PCOD and endometriosis?", "answer": "Yes, she provides comprehensive endocrine and reproductive care." }
  ]
},
{
  "slug": "dr-parveen-yadav",
  "name": "Dr. Parveen Yadav",
  "specialty": "Oncology, Thoracic Oncology Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief & Senior Consultant – Minimal Invasive & Robotic Thoracic Onco Surgery",
  "degree": "MBBS | MS (General Surgery) | FAIS | FAIGES | FACS | HBNI Thoracic Fellowship | Surgical Oncology Training (AIIMS)",
  "about": "Dr. Parveen Yadav is a leading Thoracic Onco Surgeon with more than 20 years of oncology experience and 15 years dedicated purely to thoracic surgery. Trained at AIIMS Delhi and Tata Memorial Hospital Mumbai, he is a Da Vinci-certified robotic surgeon and a Fellow of the American College of Surgeons. He has performed more than 5,000 thoracic surgeries, including over 1,000 esophageal cancer surgeries and double that number of lung cancer surgeries. He is an expert in VATS, robotic thoracic surgery, airway surgery, and management of complex mediastinal and pleural diseases.",
  "medicalProblems": [
    { "title": "Esophageal Cancer", "description": "Minimally invasive and robotic esophagectomy." },
    { "title": "Lung Cancer", "description": "Advanced thoracoscopic and robotic lung cancer surgery." },
    { "title": "Airway Disorders", "description": "Tracheal tumors and airway reconstructions." },
    { "title": "Pleural & Mediastinal Diseases", "description": "Empyema, mediastinal tumors and thoracic cysts." }
  ],
  "procedures": [
    { "title": "Robotic Thoracic Surgery", "description": "Using Da Vinci robotic system for lung & esophageal cancers." },
    { "title": "VATS Procedures", "description": "Video-assisted thoracoscopic surgeries for lung and pleural disorders." },
    { "title": "Airway Reconstruction", "description": "Tracheal surgeries & TEF repairs." },
    { "title": "Interventional Bronchoscopy", "description": "Therapeutic bronchoscopic procedures." },
    { "title": "Chest Wall Reconstruction", "description": "Complex chest wall and sternal tumor surgeries." }
  ],
  "faqs": [
    { "question": "Does Dr. Yadav perform robotic thoracic surgery?", "answer": "Yes, he is Da Vinci-certified and highly experienced in robotic procedures." },
    { "question": "Has he performed many esophageal and lung surgeries?", "answer": "Yes, over 1,000 esophageal and 2,000+ lung cancer surgeries." },
    { "question": "Does he treat benign thoracic diseases?", "answer": "Yes, including empyema, TB complications and airway disorders." }
  ]
},
{
  "slug": "dr-priyanka-raina",
  "name": "Dr. Priyanka Raina",
  "specialty": "Oncology – Head & Neck Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Head & Neck Surgical Oncology",
  "degree": "MDS (Oral & Maxillofacial Surgery) | Diploma in Oral Oncology | Fellowship in Head & Neck Surgery | Microvascular Fellowship",
  "about": "Dr. Priyanka Raina is a specialized Head and Neck Cancer Surgeon with a decade of focused experience. She is trained at premier institutions including Tata Memorial Hospital and Chang Gung Memorial Hospital, Taiwan. Her expertise spans oral cancer, thyroid & parathyroid tumors, salivary gland tumors, endoscopic and laser-assisted surgeries, and microvascular reconstruction for functional restoration. A certified tobacco cessation specialist, she provides holistic care for head and neck cancer patients.",
  "medicalProblems": [
    { "title": "Oral Cavity Cancers", "description": "Tumors of tongue, cheek, jaw and oral mucosa." },
    { "title": "Thyroid & Parathyroid Tumors", "description": "Benign & malignant thyroid and parathyroid conditions." },
    { "title": "Salivary Gland Tumors", "description": "Parotid, submandibular and minor salivary gland tumors." },
    { "title": "Throat & Laryngeal Cancers", "description": "Larynx, pharynx and voice-box-related cancers." }
  ],
  "procedures": [
    { "title": "Oral Cancer Surgery", "description": "Wide excision, mandibulectomy and reconstruction." },
    { "title": "Skull Base Surgery", "description": "Endoscopic and open tumor removal." },
    { "title": "Thyroid & Parathyroid Surgery", "description": "Advanced minimally invasive and open procedures." },
    { "title": "Laser-Assisted Surgery", "description": "Precision laser surgeries for head & neck tumors." },
    { "title": "Microvascular Reconstruction", "description": "Functional and cosmetic reconstruction post-cancer surgery." }
  ],
  "faqs": [
    { "question": "Does Dr. Raina specialize in head & neck cancers?", "answer": "Yes, she is trained in advanced head and neck oncology and reconstructive surgery." },
    { "question": "Does she perform laser and endoscopic surgeries?", "answer": "Yes, she is skilled in minimally invasive laser-assisted tumor surgeries." },
    { "question": "Is she a tobacco cessation specialist?", "answer": "Yes, she is certified and provides structured cessation counseling." }
  ]
},
{
  "slug": "dr-s-jayalakshmi",
  "name": "Dr. S Jayalakshmi",
  "specialty": "Oncology – Radiation Oncology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Radiation Oncology & CyberKnife Centre (Unit II)",
  "degree": "MBBS | MD (Radiation Oncology) | DNB (Radiation Oncology)",
  "about": "Dr. S Jayalakshmi is a highly experienced Radiation Oncologist with over three decades of expertise. A postgraduate from Christian Medical College, Vellore, she trained further at AIIMS and has held senior positions across major cancer hospitals. She is internationally trained in advanced radiotherapy techniques including IMRT, IGRT, SRS, SRT, SBRT and CyberKnife. She is widely respected for her work in head & neck cancers, gynaecological cancers and precision radiosurgery.",
  "medicalProblems": [
    { "title": "Head & Neck Cancers", "description": "Comprehensive radiotherapy for oral, throat and laryngeal cancers." },
    { "title": "Gynaecological Malignancies", "description": "Radiation management of cervical and uterine cancers." },
    { "title": "Brain & Spine Tumors", "description": "SRS/SRT-based precision treatment." },
    { "title": "Thoracic & Abdominal Cancers", "description": "Advanced radiotherapy planning and delivery." }
  ],
  "procedures": [
    { "title": "SRS & SRT", "description": "Stereotactic radiosurgery and radiotherapy for high-precision tumor targeting." },
    { "title": "SBRT", "description": "Short-course, high-dose precision radiation." },
    { "title": "IGRT & VMAT", "description": "Image-guided and volumetric-modulated arc therapy." },
    { "title": "Brachytherapy", "description": "HDR & LDR intracavitary, intraluminal and interstitial brachytherapy." }
  ],
  "faqs": [
    { "question": "Does Dr. Jayalakshmi specialize in CyberKnife?", "answer": "Yes, she is internationally trained in SRS, SRT and SBRT including CyberKnife procedures." },
    { "question": "What cancers does she primarily treat?", "answer": "She focuses on head & neck cancers, gynecological cancers and CNS tumors." },
    { "question": "Is she experienced in brachytherapy?", "answer": "Yes, she performs both HDR and LDR brachytherapy procedures." }
  ]
},
{
  "slug": "dr-subodh-pande",
  "name": "Dr. Subodh Chandra Pande",
  "specialty": "Oncology – Radiation Oncology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "45+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Radiation Oncology & Co-Chief - CyberKnife Centre",
  "degree": "DMRE | MD (Radiation Oncology)",
  "about": "Dr. Subodh Pande is one of India’s most distinguished Radiation Oncologists with over four decades of clinical, academic and leadership experience. A product of AIIMS and former faculty at Tata Memorial Hospital and Apollo Hospitals, he pioneered neuro-oncology and pediatric oncology radiotherapy units. He is an authority in IGRT, stereotactic radiotherapy and PET-guided cancer management.",
  "medicalProblems": [
    { "title": "Head & Neck Cancers", "description": "Advanced radiation planning and treatment." },
    { "title": "CNS Tumors", "description": "Precise stereotactic radiotherapy for brain tumors." },
    { "title": "Pediatric Cancers", "description": "Radiation therapy for childhood malignancies." },
    { "title": "Prostate Cancer", "description": "Image-guided and targeted radiation therapy." }
  ],
  "procedures": [
    { "title": "Teletherapy", "description": "Modern external beam radiotherapy techniques." },
    { "title": "Brachytherapy", "description": "HDR and LDR internal radiation treatments." },
    { "title": "Stereotactic Radiotherapy", "description": "High-precision tumor-targeting therapy." },
    { "title": "PET-Based Radiation Planning", "description": "Advanced imaging-guided cancer treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Pande treat brain tumors?", "answer": "Yes, he is highly experienced in CNS radiotherapy including stereotactic techniques." },
    { "question": "Is he involved in pediatric cancer care?", "answer": "Yes, he has played major roles in developing pediatric oncology programs." },
    { "question": "Does he use PET-based planning?", "answer": "Yes, PET-guided radiation is one of his key areas of expertise." }
  ]
},
{
  "slug": "dr-vishal-arora",
  "name": "Dr. Vishal Arora",
  "specialty": "Ophthalmology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Ophthalmology",
  "degree": "MBBS | MD (Ophthalmology) | Fellowship in Phaco & Refractive Surgery",
  "about": "Dr. Vishal Arora is a highly reputed ophthalmologist trained at AIIMS New Delhi and Narayana Nethralaya, Bangalore. His expertise includes cataract surgery, LASIK, Keratoconus management, corneal imaging and advanced dry eye treatments. He is the first to establish a dedicated Dry Eye Clinic in Haryana and has numerous international publications. With extensive experience in refractive and cataract surgery, he is recognized as a leading ophthalmologist in North India.",
  "medicalProblems": [
    { "title": "Cataract", "description": "Age-related, congenital and complex cataracts." },
    { "title": "Refractive Errors", "description": "Myopia, hyperopia and astigmatism." },
    { "title": "Keratoconus", "description": "Corneal thinning and ectasia disorders." },
    { "title": "Dry Eye Disease", "description": "Severe and chronic dry eye requiring advanced therapies." }
  ],
  "procedures": [
    { "title": "Cataract Surgery", "description": "Suture-less phacoemulsification and premium lens implants." },
    { "title": "LASIK / Refractive Surgery", "description": "Advanced corneal reshaping for spectacle removal." },
    { "title": "Corneal Imaging", "description": "Pentacam, Orbscan, Sirius and epithelial mapping." },
    { "title": "Dry Eye Treatments", "description": "Lipiflow, Lipiview and gland imaging-based therapies." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora treat Keratoconus?", "answer": "Yes, Keratoconus and corneal imaging are his special interests." },
    { "question": "Is he an expert in LASIK?", "answer": "Yes, he is fellowship-trained in refractive surgery." },
    { "question": "Does he offer advanced dry eye treatments?", "answer": "Yes, he established Haryana’s first dedicated Dry Eye Clinic." }
  ]
},
{
  "slug": "dr-shyam-sunder-mahansaria",
  "name": "Dr. Shyam Sunder Mahansaria",
  "specialty": "Liver & Biliary Sciences, Organ Transplant",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Liver Transplant & GI Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (HPB & Liver Transplant Surgery)",
  "about": "Dr. Shyam Sunder Mahansaria is an accomplished HPB, GI and Liver Transplant surgeon with extensive experience in complex abdominal surgeries and over 500 liver transplant procedures. Trained at ILBS Delhi, he is skilled in advanced hepatobiliary surgery, gastrointestinal cancers, laparoscopic surgery and transplant hepatology. He has multiple international publications and has been honored for his contribution to liver surgery in Rajasthan.",
  "medicalProblems": [
    { "title": "Liver Tumors", "description": "Hepatocellular carcinoma and complex liver masses." },
    { "title": "Bile Duct & Gallbladder Diseases", "description": "Choledochal cyst, bile duct injury and gallbladder cancer." },
    { "title": "Pancreatic Disorders", "description": "Pancreatic cancer, cysts and pancreatitis complications." },
    { "title": "Portal Hypertension", "description": "Shunt surgeries and advanced management." }
  ],
  "procedures": [
    { "title": "Liver Transplant Surgery", "description": "Living donor and complex transplant procedures." },
    { "title": "HPB Cancer Surgery", "description": "Oncologic surgery for liver, pancreas and bile duct tumors." },
    { "title": "Advanced Laparoscopic Surgery", "description": "Minimally invasive GI and hepatobiliary procedures." },
    { "title": "Shunt & Biliary Surgery", "description": "Portal hypertension and bile duct reconstructive procedures." }
  ],
  "faqs": [
    { "question": "Has Dr. Mahansaria performed liver transplants?", "answer": "Yes, he has been involved in over 500 liver transplant surgeries." },
    { "question": "Does he perform GI cancer surgeries?", "answer": "Yes, he specializes in GI and HPB cancer surgery." },
    { "question": "Is he trained in laparoscopic liver surgery?", "answer": "Yes, he performs both open and laparoscopic HPB procedures." }
  ]
},
{
  "slug": "dr-giriraj-bora",
  "name": "Dr. Giriraj Bora",
  "specialty": "Liver Transplant & HPB Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Liver Transplant & Senior Consultant - GI & HPB Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (GI & HPB Surgery)",
  "about": "Dr. Giriraj Bora is one of India’s leading liver transplant and HPB surgeons with over 2,000 liver transplants and decades of expertise in gastrointestinal and hepatobiliary surgery. Trained at SGPGI Lucknow and G.B. Pant Hospital Delhi, he is a founding member of the Liver Transplant Society of India. He has pioneered complex robotic and laparoscopic donor liver surgeries and has performed landmark transplants in Rajasthan. Under his leadership, Artemis runs one of India's most advanced liver transplant programs.",
  "medicalProblems": [
    { "title": "End-Stage Liver Disease", "description": "Liver cirrhosis, hepatitis B/C and alcohol-related damage." },
    { "title": "Liver, Gallbladder & Pancreatic Cancers", "description": "Comprehensive HPB oncology care." },
    { "title": "Biliary Disorders", "description": "Bile duct injuries, strictures and choledochal cysts." },
    { "title": "Gastrointestinal Surgical Conditions", "description": "Advanced GI pathologies requiring surgical management." }
  ],
  "procedures": [
    { "title": "Liver Transplantation", "description": "Living and deceased donor transplants including complex grafts." },
    { "title": "Robotic & Laparoscopic Donor Surgery", "description": "Minimally invasive donor hepatectomy." },
    { "title": "HPB Surgery", "description": "Liver, biliary tract and pancreas tumor surgeries." },
    { "title": "Advanced GI Surgery", "description": "Minimally invasive and complex abdominal surgeries." }
  ],
  "faqs": [
    { "question": "Has Dr. Bora performed complex liver transplants?", "answer": "Yes, including rare right posterior and monosegment graft transplants." },
    { "question": "Does he perform robotic liver surgeries?", "answer": "Yes, he is a pioneer in robotic and laparoscopic donor surgery." },
    { "question": "How many transplants has he done?", "answer": "Over 2,000 liver transplants including living and deceased donor cases." }
  ]
},
{
  "slug": "dr-abhinandan-mukhopadhyay",
  "name": "Dr. Abhinandan Mukhopadhyay",
  "specialty": "Urology & Kidney Transplant",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Urology & Kidney Transplant Program (Unit I)",
  "degree": "MBBS | MS (General Surgery) | MCh (Urology)",
  "about": "Dr. Abhinandan Mukhopadhyay is an expert Urologist and Kidney Transplant Surgeon trained at PGIMER Chandigarh. With deep expertise in kidney stones, prostate disorders, male infertility, reconstructive urology and uro-oncology, he has performed over 600 major surgeries. He has significant experience in robotic-assisted surgeries and has previously led the Urology Department at GGS Medical College. His academic contributions include multiple national and international publications.",
  "medicalProblems": [
    { "title": "Urological Cancers", "description": "Kidney, bladder and prostate cancers." },
    { "title": "Prostate Diseases", "description": "BPH, chronic prostatitis and urinary obstruction." },
    { "title": "Kidney Stones", "description": "Recurrent stones requiring advanced endourology." },
    { "title": "Male Infertility & Andrology", "description": "Varicocele, erectile dysfunction and infertility evaluation." }
  ],
  "procedures": [
    { "title": "Kidney Transplant", "description": "Living donor transplant and post-transplant management." },
    { "title": "Robotic & Laparoscopic Urology", "description": "Minimally invasive cancer and reconstructive surgeries." },
    { "title": "Endourology", "description": "PCNL, ureteroscopy and TURBT/TURP procedures." },
    { "title": "Urethral Reconstruction", "description": "Buccal mucosal graft urethroplasty and perineal repairs." }
  ],
  "faqs": [
    { "question": "Does Dr. Abhinandan perform kidney transplants?", "answer": "Yes, he is part of the Kidney Transplant Program at Artemis." },
    { "question": "Is he skilled in robotic surgery?", "answer": "Yes, he has participated in 300+ robotic urological surgeries." },
    { "question": "Does he treat male infertility?", "answer": "Yes, he specializes in andrology and infertility treatments." }
  ]
},
{
  "slug": "dr-varun-khanna",
  "name": "Dr. Varun Khanna",
  "specialty": "Orthopaedics & Spine Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Orthopaedics & Spine Surgery",
  "degree": "MBBS | MS (Orthopaedics) | DNB (Orthopaedics) | FNB (Spine Surgery)",
  "about": "Dr. Varun Khanna is an experienced Orthopaedic Spine Surgeon trained at Sir Ganga Ram Hospital (FNB Spine Surgery) and Schön Klinik, Munich (AO Spine International Fellowship). He specializes in minimally invasive spine surgery, endoscopic spine procedures, spinal deformity correction and joint replacement surgeries. With a decade of extensive clinical exposure across AIIMS, Max Hospital and Artemis, he has authored multiple research papers in international spine journals.",
  "medicalProblems": [
    { "title": "Spinal Disorders", "description": "Lumbar stenosis, disc prolapse and cervical spondylosis." },
    { "title": "Spinal Deformities", "description": "Scoliosis, kyphosis and complex spinal alignment issues." },
    { "title": "Joint Disorders", "description": "Knee, hip and shoulder arthritis requiring joint replacement." },
    { "title": "Spinal Trauma", "description": "Fractures, injuries and instability requiring surgical management." }
  ],
  "procedures": [
    { "title": "Minimally Invasive Spine Surgery", "description": "Endoscopic and MIS decompression & fusion." },
    { "title": "Spinal Fusion", "description": "TLIF, OLIF, ALIF and PLF techniques." },
    { "title": "Joint Replacement Surgery", "description": "Hip, knee and shoulder replacement procedures." },
    { "title": "Spinal Tumor Surgery", "description": "Management of primary and metastatic spinal tumors." }
  ],
  "faqs": [
    { "question": "Does Dr. Khanna perform minimally invasive spine surgery?", "answer": "Yes, he is fellowship-trained in MIS and endoscopic spine surgery." },
    { "question": "Does he treat spinal deformities?", "answer": "Yes, he has extensive experience in scoliosis and kyphosis correction." },
    { "question": "Does he perform joint replacement surgery?", "answer": "Yes, he performs hip, knee and shoulder replacements." }
  ]
},
{
  "slug": "dr-sanjay-sarup",
  "name": "Dr. Sanjay Sarup",
  "specialty": "Paediatric Orthopaedics & Spine Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "24+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head – Orthopaedics (Unit II) & Chief – Paediatric Orthopaedics & Spine Surgery",
  "degree": "MBBS | MS (Orthopaedics) | MCh (Orthopaedics, UK) | FRCS (Glasgow)",
  "about": "Dr. Sanjay Sarup is one of India’s most experienced paediatric orthopaedic and spine surgeons with over 24 years of global expertise. Trained in India and the UK, he is the first qualified pediatric orthopedic surgeon to establish a dedicated clinical practice in Delhi. He specializes in congenital hip dislocations, clubfoot deformities, scoliosis correction, limb lengthening and complex pediatric deformity surgery.",
  "medicalProblems": [
    { "title": "Pediatric Orthopedic Deformities", "description": "Hip dysplasia, clubfoot and congenital limb deformities." },
    { "title": "Spinal Deformities", "description": "Scoliosis, kyphosis and spine curvature abnormalities." },
    { "title": "Pediatric Trauma", "description": "Fractures and growth-plate injuries." },
    { "title": "Adult Spine Issues", "description": "Degenerative spine and back pain." }
  ],
  "procedures": [
    { "title": "Scoliosis Correction", "description": "Deformity correction using advanced techniques." },
    { "title": "Hip Reconstruction", "description": "Reconstructive surgeries for congenital hip dislocation." },
    { "title": "Foot Deformity Correction", "description": "Clubfoot treatment and complex deformity surgery." },
    { "title": "Limb Lengthening", "description": "Advanced limb reconstruction and height gain procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Sarup treat scoliosis?", "answer": "Yes, he is highly experienced in pediatric and adult scoliosis correction." },
    { "question": "Does he perform pediatric orthopedic surgeries?", "answer": "Yes, he specializes exclusively in pediatric orthopedics and pediatric spine." },
    { "question": "Does he treat hip dysplasia?", "answer": "Yes, congenital hip dislocation is one of his major specialties." }
  ]
},
{
  "slug": "dr-ramkinkar-jha",
  "name": "Dr. Ramkinkar Jha",
  "specialty": "Orthopaedics, Joint Replacement & Robotic Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief & Unit Head - Orthopaedics (Unit III)",
  "degree": "MBBS (Hons.) | MS (Orthopaedics - AIIMS) | MCh (Orthopaedics - Edinburgh) | MBA (Healthcare)",
  "about": "Dr. Ramkinkar Jha is an award-winning Orthopaedic and Joint Replacement Surgeon with over two decades of experience across premier institutions including AIIMS, Medanta and Narayana Health. He specializes in robotic knee & hip replacement, sports injuries, complex trauma, orthopedic oncology and spine surgery. A global fellowship-trained surgeon, he performs over 1,000 procedures annually and is widely recognized as one of the best orthopedic surgeons in Delhi NCR.",
  "medicalProblems": [
    { "title": "Arthritis & Joint Disorders", "description": "Hip, knee, shoulder and elbow degeneration." },
    { "title": "Sports Injuries", "description": "ACL/PCL tears, rotator cuff injuries and athletic trauma." },
    { "title": "Complex Trauma", "description": "Pelvic, acetabular and limb fractures." },
    { "title": "Bone Tumors", "description": "Limb salvage and oncology reconstruction." }
  ],
  "procedures": [
    { "title": "Robotic Joint Replacement", "description": "Computer-assisted knee and hip replacement." },
    { "title": "Arthroscopy & Sports Surgery", "description": "ACL/PCL reconstruction and minimally invasive procedures." },
    { "title": "Complex Trauma Surgery", "description": "Pelvic, acetabular and revision surgeries." },
    { "title": "Spine Surgery", "description": "Degenerative, traumatic and minimally invasive spine procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Jha perform robotic joint replacement?", "answer": "Yes, he is a leading expert in robotic and computer-assisted surgery." },
    { "question": "Does he treat sports injuries?", "answer": "Yes, he specializes in arthroscopy and sports medicine." },
    { "question": "Does he handle complex trauma cases?", "answer": "Yes, he is extensively experienced in pelvic and acetabular trauma." }
  ]
},
{
  "slug": "dr-ravi-sauhta",
  "name": "Dr. (Prof.) Ravi Sauhta",
  "specialty": "Orthopaedics & Joint Replacement",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "30+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Chief & HOD - Orthopaedics & Joint Replacement (Unit VI)",
  "degree": "MBBS | MS (Orthopaedics) | MCh (Orthopaedics, USA) | AOFF (USA) | FIAMS",
  "about": "Dr. Ravi Sauhta is a senior orthopaedic surgeon with over 30 years of experience, specializing in pelvic-acetabular trauma, joint reconstruction, revision arthroplasty and limb salvage surgeries. Trained in India, the USA and South Korea, he has led orthopedic departments at Paras Hospital and Max Hospital before joining Artemis. He has over 20 scientific publications, a decade of teaching experience and is a recognized AO/ASIF faculty.",
  "medicalProblems": [
    { "title": "Joint Degeneration", "description": "Advanced knee and hip osteoarthritis." },
    { "title": "Trauma & Polytrauma", "description": "Complex fractures and high-impact injuries." },
    { "title": "Bone Tumors", "description": "Large bone tumors requiring limb salvage." },
    { "title": "Spine Disorders", "description": "Thoraco-lumbar spine injuries and degenerative conditions." }
  ],
  "procedures": [
    { "title": "Joint Replacement Surgery", "description": "Primary and revision knee & hip replacements." },
    { "title": "Pelvi-Acetabular Surgery", "description": "Complex pelvic and acetabular fracture reconstruction." },
    { "title": "Limb Salvage Surgery", "description": "Reconstruction for bone tumors and trauma." },
    { "title": "Spine Surgery", "description": "Instrumentation and deformity correction." }
  ],
  "faqs": [
    { "question": "Does Dr. Sauhta perform revision joint replacements?", "answer": "Yes, he is highly experienced in complex revision knee and hip surgery." },
    { "question": "Does he treat pelvic fractures?", "answer": "Yes, he is a recognized expert in pelvi-acetabular trauma." },
    { "question": "Does he manage bone tumors?", "answer": "Yes, he performs limb salvage surgeries for large bone tumors." }
  ]
},
{
  "slug": "dr-hemant-gogia",
  "name": "Dr. Hemant K. Gogia",
  "specialty": "Paediatrics",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Sr. Consultant - Paediatrics & Head - Medical Services",
  "degree": "MBBS | MD (Pediatrics)",
  "about": "Dr. Hemant Gogia is an experienced Paediatrician and Neonatologist with over a decade of expertise in childhood illnesses, immunization, respiratory and gastrointestinal diseases, and newborn care. He has extensive experience in pediatric intensive care and adolescent health.",
  "medicalProblems": [
    { "title": "Pediatric Infections", "description": "Respiratory, gastrointestinal and childhood infectious diseases." },
    { "title": "Newborn Care", "description": "Routine and specialized neonatal care." },
    { "title": "Asthma & Allergies", "description": "Diagnosis and management of pediatric asthma and chronic allergies." },
    { "title": "Adolescent Health", "description": "Counseling and health support during teenage years." }
  ],
  "procedures": [
    { "title": "Pediatric Intensive Care", "description": "Management of critically ill children and newborns." },
    { "title": "Immunization Services", "description": "Complete vaccination and preventive care." },
    { "title": "Neonatal Care", "description": "Care for premature and high-risk newborns." }
  ],
  "faqs": [
    { "question": "Does Dr. Gogia manage newborns?", "answer": "Yes, he is trained in both paediatrics and neonatology." },
    { "question": "Does he treat asthma in children?", "answer": "Yes, asthma care is one of his key clinical focuses." }
  ]
},
{
  "slug": "dr-shubhra-shri-gupta",
  "name": "Dr. Shubhra Shri Gupta",
  "specialty": "Neonatology & Pediatric Cardiac Critical Care",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Consultant - Neonatology & Incharge - Pediatric Cardiac Critical Care",
  "degree": "MBBS | MD (Pediatrics) | Fellowship in Neonatology (USA)",
  "about": "Dr. Shubhra Shri Gupta is a highly skilled neonatologist trained at East Carolina University, USA. She specializes in managing extremely low birth-weight newborns, neonatal ventilation, sepsis, complex congenital heart disease post-operative care, and high-risk neonatal conditions.",
  "medicalProblems": [
    { "title": "Extreme Prematurity", "description": "Care for low and extremely low birth-weight infants." },
    { "title": "Neonatal Respiratory Disorders", "description": "Management of respiratory distress and mechanical ventilation." },
    { "title": "Neonatal Sepsis", "description": "Critical care for severe infections in newborns." },
    { "title": "Congenital Heart Conditions (Post-Op)", "description": "Care after complex pediatric cardiac surgeries." }
  ],
  "procedures": [
    { "title": "Mechanical Ventilation", "description": "Advanced ventilation support for critical newborns." },
    { "title": "Neonatal Nutrition Management", "description": "Nutritional planning for premature babies." },
    { "title": "Developmental Follow-Up", "description": "Monitoring growth and neurodevelopment of high-risk babies." }
  ],
  "faqs": [
    { "question": "Does Dr. Shubhra treat premature babies?", "answer": "Yes, she is an expert in extreme prematurity and neonatal critical care." },
    { "question": "Does she manage babies after heart surgery?", "answer": "Yes, she has extensive experience with post-operative cardiac newborn care." }
  ]
},
{
  "slug": "dr-nidhi-rawal",
  "name": "Dr. Nidhi Rawal",
  "specialty": "Paediatric Cardiology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Chief - Paediatric Cardiology",
  "degree": "MBBS | MD (Pediatrics) | FNB (Pediatric Cardiology)",
  "about": "Dr. Nidhi Rawal is a leading pediatric cardiologist with expertise in neonatal and pediatric echocardiography, trans-esophageal echo and interventional pediatric cardiology. With extensive experience at PGIMER Chandigarh and Artemis, she performs a wide range of cardiac catheterization procedures.",
  "medicalProblems": [
    { "title": "Congenital Heart Diseases", "description": "Diagnosis and treatment of birth-related heart defects." },
    { "title": "Pediatric Heart Rhythm Issues", "description": "Evaluation of arrhythmias in infants and children." },
    { "title": "Adult Congenital Heart Disease", "description": "Continued care for congenital heart patients into adulthood." },
    { "title": "Fetal Cardiac Concerns", "description": "Specialized fetal heart evaluations." }
  ],
  "procedures": [
    { "title": "Pediatric Echocardiography", "description": "Neonatal, pediatric and TEE studies." },
    { "title": "Cardiac Catheterization", "description": "ASD, VSD, PDA closure; coarctation stenting; balloon dilations." },
    { "title": "Fetal Echocardiography", "description": "Advanced fetal heart assessments." }
  ],
  "faqs": [
    { "question": "Does Dr. Rawal perform pediatric cardiac interventions?", "answer": "Yes, she performs catheter-based closures and balloon dilations." },
    { "question": "Does she do fetal echocardiography?", "answer": "Yes, fetal echo is one of her areas of expertise." }
  ]
},
{
  "slug": "dr-nitin-goel",
  "name": "Dr. Nitin Goel",
  "specialty": "Paediatric Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Sr. Consultant - Paediatric Surgery",
  "degree": "MBBS | MS (General Surgery) | MCh (Paediatric Surgery)",
  "about": "Dr. Nitin Goel is a senior pediatric surgeon with expertise in neonatal surgery, pediatric urology, gastrointestinal surgeries, thoracoscopic procedures and minimally invasive pediatric surgery. He has worked extensively at major pediatric surgical centers across India.",
  "medicalProblems": [
    { "title": "Pediatric Urological Issues", "description": "PU valves, hydronephrosis and congenital urinary problems." },
    { "title": "Neonatal Anomalies", "description": "Congenital defects requiring surgical correction." },
    { "title": "Pediatric GI Disorders", "description": "Biliary atresia, choledochal cyst and abdominal masses." },
    { "title": "Thoracic Conditions", "description": "Congenital diaphragmatic hernia and thoracic anomalies." }
  ],
  "procedures": [
    { "title": "Paediatric Laparoscopy", "description": "Appendectomy, cyst removal and GI procedures." },
    { "title": "Thoracoscopic Surgery", "description": "VATS procedures for pediatric thoracic conditions." },
    { "title": "Neonatal Surgery", "description": "Surgery for congenital anomalies in newborns." }
  ],
  "faqs": [
    { "question": "Does Dr. Goel perform neonatal surgeries?", "answer": "Yes, he is skilled in managing complex neonatal anomalies." },
    { "question": "Does he treat pediatric urology cases?", "answer": "Yes, pediatric urology is one of his specialties." }
  ]
},
{
  "slug": "dr-aditi-dixit",
  "name": "Dr. Aditi Dixit",
  "specialty": "Radiology – Women’s Imaging",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Sr. Consultant – Women Imaging",
  "degree": "MBBS | DMRD",
  "about": "Dr. Aditi Dixit is a senior radiologist specializing in women’s imaging with extensive experience in ultrasound, mammography, MRI and CT. She is certified in fetal echocardiography and focuses on breast imaging, pregnancy scans and advanced diagnostic radiology.",
  "medicalProblems": [
    { "title": "Breast Disorders", "description": "Mammography and ultrasound evaluation." },
    { "title": "Pregnancy Imaging", "description": "Fetal scans and fetal echocardiography." },
    { "title": "Gynecological Imaging", "description": "Pelvic scans for ovarian and uterine conditions." }
  ],
  "procedures": [
    { "title": "Ultrasound & Doppler", "description": "All women-related ultrasound and Doppler studies." },
    { "title": "MRI & CT Imaging", "description": "Advanced cross-sectional imaging." },
    { "title": "USG-Guided Biopsies", "description": "Image-guided breast and soft-tissue biopsies." }
  ],
  "faqs": [
    { "question": "Does Dr. Dixit perform fetal echocardiography?", "answer": "Yes, she is certified in fetal echo." },
    { "question": "Does she specialize in breast imaging?", "answer": "Yes, breast and women’s imaging are her key focus areas." }
  ]
},
{
  "slug": "dr-rajiv-sharma",
  "name": "Dr. Rajiv Sharma",
  "specialty": "Interventional Radiology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "23+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head – Interventional Radiology",
  "degree": "MBBS | MD (Radiology) | DNB (Radiodiagnosis)",
  "about": "Dr. Rajiv Sharma is a senior interventional radiologist with over 23 years of experience in vascular, hepatobiliary and oncologic interventions. He performs a wide range of minimally invasive procedures including tumor embolization, vascular interventions, biopsies and image-guided therapies.",
  "medicalProblems": [
    { "title": "Vascular Disorders", "description": "Management through minimally invasive vascular procedures." },
    { "title": "Liver & Biliary Diseases", "description": "Interventions for tumors, obstructions and bleeding." },
    { "title": "Cancer-Related Conditions", "description": "Tumor embolization and targeted therapies." }
  ],
  "procedures": [
    { "title": "Tumor Embolization", "description": "Minimally invasive oncology procedures." },
    { "title": "Vascular Interventions", "description": "Angioplasty, stenting and embolization." },
    { "title": "Image-Guided Biopsies", "description": "Ultrasound, CT and MRI-guided biopsies." }
  ],
  "faqs": [
    { "question": "Does Dr. Sharma perform vascular procedures?", "answer": "Yes, he specializes in a full range of interventional vascular treatments." },
    { "question": "Does he perform tumor embolization?", "answer": "Yes, oncologic interventions are a major part of his practice." }
  ]
},
{
  "slug": "dr-kiran-arora",
  "name": "Dr. Kiran Arora",
  "specialty": "IVF & Reproductive Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Unit Head - Reproductive Medicine (Unit II)",
  "degree": "MBBS | MD (Obs & Gynae) | MRCOG | FRCOG",
  "about": "Dr. Kiran Arora is a renowned infertility specialist with over 20 years of experience, including advanced training in the UK. She specializes in IVF, donor egg treatment, recurrent IVF failures and surrogacy. She has led multiple top fertility centers and is known for handling highly complex infertility cases.",
  "medicalProblems": [
    { "title": "Female Infertility", "description": "Hormonal, ovarian and tubal factors." },
    { "title": "Male Infertility", "description": "Evaluation and management of low sperm function." },
    { "title": "Recurrent IVF Failure", "description": "Advanced fertility protocols for repeated failed cycles." },
    { "title": "High-Risk Pregnancy", "description": "Management of pregnancies with complications." }
  ],
  "procedures": [
    { "title": "IVF & ICSI", "description": "Complete advanced fertility treatment." },
    { "title": "Laparoscopic Surgeries", "description": "Fertility-enhancing minimally invasive procedures." },
    { "title": "Hysteroscopic Surgeries", "description": "Correction of uterine abnormalities." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora handle repeated IVF failures?", "answer": "Yes, she specializes in advanced protocols for recurrent failures." },
    { "question": "Does she perform donor and surrogacy cycles?", "answer": "Yes, she has vast experience in donor egg and surrogacy programs." }
  ]
},
{
  "slug": "dr-parul-prakash",
  "name": "Dr. Parul Prakash",
  "specialty": "IVF & Reproductive Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Reproductive Medicine (IVF)",
  "degree": "MBBS | MD (Obs & Gynae) | FNB (Reproductive Medicine) | FICMCH | FICOG",
  "about": "Dr. Parul Prakash is a senior IVF specialist with over 5,000 successful IVF/ICSI cycles. She has 20+ years of OB-GYN experience and expertise in third-party reproduction, fertility-enhancing laparoscopic surgeries, testicular biopsies and high-risk pregnancy management.",
  "medicalProblems": [
    { "title": "Infertility", "description": "Complex fertility challenges in both men and women." },
    { "title": "High-Risk Pregnancy", "description": "Management of pregnancies with complications." },
    { "title": "Reproductive Endocrine Disorders", "description": "PCOS, hormonal imbalance and ovulation issues." }
  ],
  "procedures": [
    { "title": "IUI, IVF & ICSI", "description": "Complete fertility treatment including embryo transfer." },
    { "title": "Testicular Biopsies", "description": "TESA, PESA and advanced sperm retrieval." },
    { "title": "Endoscopic Surgeries", "description": "Laparoscopy and hysteroscopy for fertility enhancement." }
  ],
  "faqs": [
    { "question": "Does Dr. Parul handle third-party reproduction?", "answer": "Yes, she has extensive experience in donor and surrogacy cycles." },
    { "question": "Does she treat high-risk IVF pregnancies?", "answer": "Yes, she manages high-risk pregnancies resulting from IVF." }
  ]
},
{
  "slug": "dr-sarabpreet-singh",
  "name": "Dr. Sarabpreet Singh",
  "specialty": "Embryology, Andrology & Male Infertility",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Clinical Embryology & Andrology",
  "degree": "MBBS | MD | Senior Clinical Embryologist (ESHRE & IFS)",
  "about": "Dr. Sarabpreet Singh is a nationally and internationally recognized expert in clinical embryology, male infertility and psychosexual medicine. He is India’s first embryologist certified as a Senior Clinical Embryologist by both ESHRE and IFS. His expertise includes advanced sperm biology, embryo culture, cryopreservation and fertility preservation.",
  "medicalProblems": [
    { "title": "Male Infertility", "description": "Low sperm count, motility issues and obstructive causes." },
    { "title": "Sexual Dysfunction", "description": "Psychosexual and biological disorders affecting fertility." },
    { "title": "Infertility Preservation", "description": "Sperm, oocyte and embryo preservation." }
  ],
  "procedures": [
    { "title": "IVF, ICSI & IMSI", "description": "Advanced embryology and fertilization techniques." },
    { "title": "Cryopreservation", "description": "Freezing of sperm, oocytes and embryos." },
    { "title": "Embryo Biopsy", "description": "Blastomere and trophectoderm biopsy for genetic testing." }
  ],
  "faqs": [
    { "question": "Is Dr. Sarabpreet a certified Senior Embryologist?", "answer": "Yes, certified by both ESHRE and IFS." },
    { "question": "Does he treat male sexual dysfunction?", "answer": "Yes, he is trained in psychosexual medicine." }
  ]
},
{
  "slug": "dr-arun-chowdary-kotaru",
  "name": "Dr. Arun Chowdary Kotaru",
  "specialty": "Pulmonology & Sleep Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Unit Head & Sr. Consultant - Respiratory Disease & Sleep Medicine (Unit I)",
  "degree": "MBBS | MD (Respiratory Medicine) | DNB | European Respiratory Diploma",
  "about": "Dr. Arun Kotaru is an award-winning pulmonologist and sleep specialist, trained at AFMC Pune where he received the Gold Medal in Respiratory Medicine. He is an expert in interventional pulmonology, bronchoscopic procedures, airway stenting, EBUS, thoracoscopy and advanced sleep studies.",
  "medicalProblems": [
    { "title": "Asthma & COPD", "description": "Chronic airway diseases and long-term lung disorders." },
    { "title": "Pulmonary Hypertension", "description": "Evaluation and management of elevated lung pressures." },
    { "title": "Lung Infections", "description": "Pneumonia, tuberculosis and chronic infections." },
    { "title": "Sleep Disorders", "description": "Sleep apnea, insomnia and sleep-related breathing issues." }
  ],
  "procedures": [
    { "title": "EBUS-TBNA", "description": "Endobronchial ultrasound-guided biopsy." },
    { "title": "Medical Thoracoscopy", "description": "Pleural biopsy and therapeutic procedures." },
    { "title": "Airway Stenting", "description": "Stent placement for airway obstruction." },
    { "title": "Sleep Studies", "description": "Polysomnography and titration studies." }
  ],
  "faqs": [
    { "question": "Does Dr. Arun perform bronchoscopic interventions?", "answer": "Yes, he is an expert in advanced bronchoscopic procedures." },
    { "question": "Does he treat sleep apnea?", "answer": "Yes, he performs diagnostic and titration sleep studies." }
  ]
},
{
  "slug": "dr-shweta-bansal",
  "name": "Dr. Shweta Bansal",
  "specialty": "Pulmonology (Chest & Lungs)",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Unit Head & Sr. Consultant - Respiratory Disease & Sleep Medicine (Unit II)",
  "degree": "MBBS | MD (Respiratory Medicine) | DM (Pulmonary, Critical Care & Sleep Medicine - AIIMS) | DNB | EDARM (Europe) | Lung Transplant Fellowship (Vienna)",
  "about": "Dr. Shweta Bansal is an accomplished pulmonologist with extensive training from VPCI, AIIMS and Vienna. She specializes in asthma, COPD, ILD, lung cancer, sleep disorders, post-Covid complications and advanced interventional pulmonology including EBUS, thoracoscopy and airway stenting. She is a national and international faculty with publications and global conference participation.",
  "medicalProblems": [
    { "title": "Asthma & Allergies", "description": "Chronic airway inflammation and allergic respiratory disorders." },
    { "title": "COPD & Smoking-Related Diseases", "description": "Emphysema, chronic bronchitis and smoking damage." },
    { "title": "Interstitial Lung Disease (ILD)", "description": "Pulmonary fibrosis and autoimmune-related ILD." },
    { "title": "Sleep Disorders", "description": "Obstructive sleep apnea and sleep-disordered breathing." }
  ],
  "procedures": [
    { "title": "Bronchoscopy", "description": "BAL, TBLB and endobronchial biopsy." },
    { "title": "EBUS-TBNA", "description": "Advanced nodal sampling and diagnosis." },
    { "title": "Medical Thoracoscopy", "description": "Pleural biopsy and effusion management." },
    { "title": "Airway Interventions", "description": "Tumor debulking, stenting and foreign body removal." }
  ],
  "faqs": [
    { "question": "Does Dr. Bansal treat sleep apnea?", "answer": "Yes, she specializes in sleep-disordered breathing and conducts sleep studies." },
    { "question": "Is she trained in lung transplant care?", "answer": "Yes, she completed a clinical fellowship in lung transplantation in Vienna." },
    { "question": "Does she perform EBUS?", "answer": "Yes, she is trained in both radial and convex EBUS." }
  ]
},
{
  "slug": "dr-sumeet-agrawal",
  "name": "Dr. Sumeet Agrawal",
  "specialty": "Rheumatology & Clinical Immunology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "17+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Chief - Rheumatology",
  "degree": "MBBS | MD (Gold Medal) | DM (Clinical Immunology) | APLAR Fellowship (UK)",
  "about": "Dr. Sumeet Agrawal is a highly experienced rheumatologist with deep expertise in autoimmune and systemic immunological diseases. With training from SGPGIMS, NIMS and an APLAR Fellowship in the UK, he specializes in lupus, vasculitis, juvenile arthritis, scleroderma and complex autoimmune disorders.",
  "medicalProblems": [
    { "title": "Lupus (SLE)", "description": "Systemic autoimmune disorder affecting multiple organs." },
    { "title": "Arthritis", "description": "Rheumatoid, psoriatic and juvenile arthritis." },
    { "title": "Vasculitis", "description": "Inflammation of blood vessels affecting various systems." },
    { "title": "Scleroderma & Myositis", "description": "Autoimmune connective tissue diseases." }
  ],
  "procedures": [
    { "title": "Intra-Articular Injections", "description": "Joint injections for pain and swelling." },
    { "title": "Soft Tissue Injections", "description": "Trigger point and tendon sheath injections." },
    { "title": "Biopsies", "description": "Skin, muscle, nerve and minor salivary gland biopsies." },
    { "title": "Biologic Therapy", "description": "Targeted treatments including infliximab, rituximab and tocilizumab." }
  ],
  "faqs": [
    { "question": "Does Dr. Agrawal treat lupus?", "answer": "Yes, he is widely recognized for his expertise in lupus care." },
    { "question": "Does he manage pediatric rheumatology?", "answer": "Yes, he treats juvenile arthritis and childhood autoimmune diseases." },
    { "question": "Are biologic therapies available?", "answer": "Yes, he administers all modern biologic and targeted therapies." }
  ]
},
{
  "slug": "dr-hitesh-garg",
  "name": "Dr. Hitesh Garg",
  "specialty": "Orthopaedic Spine Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head - Ortho Spine Surgery",
  "degree": "MBBS (AIIMS) | MS (Ortho - KEM) | Fellowships in Spine Surgery (Yale, USA & Shriners Children's Hospital, USA) | Joint Replacement Fellowship (AIIMS)",
  "about": "Dr. Hitesh Garg is one of India’s most accomplished spine surgeons with international training at Yale University and Shriners Hospital, USA. With over 5000 spine surgeries performed, he specializes in minimally invasive spine surgery, scoliosis correction, artificial disc replacement, spinal trauma and motion-preserving spine procedures.",
  "medicalProblems": [
    { "title": "Degenerative Spine Disease", "description": "Disc herniation, spinal stenosis and spondylosis." },
    { "title": "Scoliosis & Kyphosis", "description": "Spinal deformities requiring correction." },
    { "title": "Spinal Trauma", "description": "Fractures and spinal instability." },
    { "title": "Spinal Tumors", "description": "Benign and malignant spinal growths." }
  ],
  "procedures": [
    { "title": "Spinal Fusions", "description": "TLIF, ALIF, PLIF and other fusion techniques." },
    { "title": "Deformity Correction", "description": "Scoliosis and kyphosis surgery with neuromonitoring." },
    { "title": "Artificial Disc Replacement", "description": "Cervical and lumbar disc replacements." },
    { "title": "Minimally Invasive Spine Surgery", "description": "Small incision spine procedures with rapid recovery." }
  ],
  "faqs": [
    { "question": "Does Dr. Garg perform scoliosis surgery?", "answer": "Yes, he has performed over 1000 deformity correction surgeries." },
    { "question": "Does he use neuromonitoring and O-arm navigation?", "answer": "Yes, he uses state-of-the-art technologies for precision." },
    { "question": "Does he treat international patients?", "answer": "Yes, he has operated on patients from over 50 countries." }
  ]
},
{
  "slug": "dr-kunal-vinayak",
  "name": "Dr. Kunal Vinayak",
  "specialty": "Urology & Kidney Transplant",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Associate Consultant - Urology & Kidney Transplant",
  "degree": "MBBS | MS (General Surgery) | DrNB (Urology) | Senior Residencies in Urology & Transplant",
  "about": "Dr. Kunal Vinayak is a skilled urologist with expertise in endourology, uro-oncology, and renal transplant surgery. He has contributed extensively to robotic urology, stone disease management, prostate surgery and complex kidney transplant procedures, supported by multiple national and international publications.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Recurrent and complex stone disease." },
    { "title": "Prostate Problems", "description": "BPH, prostatitis and urinary obstruction." },
    { "title": "Urological Cancers", "description": "Kidney, bladder, prostate and testicular cancers." },
    { "title": "Male Infertility", "description": "Varicocele and andrology disorders." }
  ],
  "procedures": [
    { "title": "Endourology", "description": "RIRS, PCNL and laser stone surgeries." },
    { "title": "Uro-Oncology Surgery", "description": "Minimally invasive and robotic cancer surgeries." },
    { "title": "Renal Transplant Surgery", "description": "Kidney transplant and related procedures." },
    { "title": "Andrology Procedures", "description": "Varicocele repair and infertility management." }
  ],
  "faqs": [
    { "question": "Does Dr. Vinayak perform stone laser surgery?", "answer": "Yes, he specializes in laser-based stone removal." },
    { "question": "Does he handle complex kidney transplant cases?", "answer": "Yes, he has significant experience in renal transplant surgery." },
    { "question": "Is he involved in robotic urological surgeries?", "answer": "Yes, he has presented multiple robotic surgery papers." }
  ]
},
{
  "slug": "dr-piyush-gupta",
  "name": "Dr. Piyush Gupta",
  "specialty": "Urology & Andrology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Senior Consultant - Urology, Andrology & Renal Transplant",
  "degree": "MBBS | MS (General Surgery) | MCh (Urology) | Da Vinci Certified Robotic Surgeon",
  "about": "Dr. Piyush Gupta is a highly trained urologist, andrologist and robotic surgeon with expertise in kidney stones, prostate enlargement, male infertility, and urological cancers. With over 1000 surgeries performed, he is known for advanced endourology, laparoscopic and robotic urological procedures.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Renal, ureteric and recurrent stones." },
    { "title": "Prostate Disorders", "description": "BPH, urinary obstruction and prostate enlargement." },
    { "title": "Male Sexual Health", "description": "Infertility, erectile dysfunction and ejaculatory issues." },
    { "title": "Urological Cancers", "description": "Kidney, bladder and prostate cancers." }
  ],
  "procedures": [
    { "title": "Endourology", "description": "RIRS, PCNL and minimally invasive stone surgeries." },
    { "title": "Robotic Urology", "description": "Robotic prostatectomy and partial nephrectomy." },
    { "title": "Renal Transplant", "description": "Kidney transplant surgery and postoperative care." },
    { "title": "Andrology Treatments", "description": "Management of infertility and sexual dysfunction." }
  ],
  "faqs": [
    { "question": "Is Dr. Gupta a robotic surgeon?", "answer": "Yes, he is a Da Vinci-certified robotic surgeon." },
    { "question": "Does he treat male infertility?", "answer": "Yes, he specializes in andrology and sexual health." },
    { "question": "Does he handle prostate surgeries?", "answer": "Yes, he performs minimally invasive and robotic prostate procedures." }
  ]
},
{
  "slug": "dr-ashu-kumar-jain",
  "name": "Dr. Ashu Kumar Jain",
  "specialty": "Pain Medicine & Palliative Care",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Pain Medicine & Palliative Care",
  "degree": "MBBS | MD (Anesthesiology) | Fellowship in Pain Medicine",
  "about": "Dr. Ashu Jain is a leading pain physician with over 14 years of experience in advanced pain management. Trained at AIIMS and leading institutions, he established the Pain Medicine Department at Artemis and specializes in chronic pain, cancer pain, neuropathic pain, spine pain and interventions including neuromodulation and nerve blocks.",
  "medicalProblems": [
    { "title": "Chronic Back & Neck Pain", "description": "Disc pain, facet pain and nerve compression." },
    { "title": "Cancer Pain", "description": "Advanced pain control for cancer patients." },
    { "title": "Neuropathic Pain", "description": "Nerve-related chronic pain and neuralgias." },
    { "title": "Joint & Musculoskeletal Pain", "description": "Arthritic and mechanical joint pain." }
  ],
  "procedures": [
    { "title": "Spinal Cord Stimulator Implantation", "description": "Neuromodulation for severe chronic pain." },
    { "title": "Intrathecal Pump Implantation", "description": "Drug delivery systems for cancer and nerve pain." },
    { "title": "Radiofrequency Ablation", "description": "Targeted nerve ablation for long-term relief." },
    { "title": "Nerve Root Injections", "description": "Targeted injections for radicular pain." }
  ],
  "faqs": [
    { "question": "Does Dr. Jain treat cancer pain?", "answer": "Yes, he specializes in advanced cancer pain management." },
    { "question": "Does he offer pain procedures?", "answer": "Yes, he performs RF ablation, nerve blocks and neuromodulation." },
    { "question": "Can chronic back pain be treated without surgery?", "answer": "Yes, most cases respond well to interventional pain procedures." }
  ]
},
{
  "slug": "dr-shabana-parveen",
  "name": "Dr. Shabana Parveen",
  "specialty": "Nutrition & Dietetics",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Head - Dietetics",
  "degree": "Registered Dietician | MSc (Food & Nutrition) | BSc (Nutrition & Dietetics) | B.Ed",
  "about": "Dr. Shabana Parveen is an experienced clinical nutritionist with over 14 years in therapeutic nutrition, specializing in diabetes, renal, cardiac, gastro, oncology and pediatric nutrition. She leads the Dietetics Department at Artemis and is known for personalized diet planning, critical care nutrition and bariatric nutrition.",
  "medicalProblems": [
    { "title": "Diabetes & Metabolic Disorders", "description": "Lifestyle and diet management for metabolic health." },
    { "title": "Renal Disorders", "description": "Diet planning for CKD, dialysis and renal complications." },
    { "title": "Cardiac & Gastrointestinal Disorders", "description": "Tailored diets for heart and digestive health." },
    { "title": "Cancer Nutrition", "description": "Nutritional support for patients undergoing cancer treatment." }
  ],
  "procedures": [
    { "title": "Nutritional Assessments", "description": "Comprehensive diet evaluation and planning." },
    { "title": "Critical Care Nutrition", "description": "Enteral feeding and metabolic monitoring." },
    { "title": "Therapeutic Diet Planning", "description": "Condition-specific medical nutrition therapy." },
    { "title": "Bariatric Nutrition", "description": "Pre- and post-surgery nutrition management." }
  ],
  "faqs": [
    { "question": "Does she provide diet plans for kidney disease?", "answer": "Yes, she specializes in renal nutrition and dialysis diets." },
    { "question": "Does she handle cancer nutrition?", "answer": "Yes, she manages diet therapy for oncology patients." },
    { "question": "Does she offer counseling for weight loss?", "answer": "Yes, she provides structured weight management nutrition plans." }
  ]
},
{
  "slug": "dr-anjali-vaish",
  "name": "Dr. Anjali Vaish",
  "specialty": "Physiotherapy & Rehabilitation",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "14+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Physiotherapy & Rehabilitation",
  "degree": "BPT (Delhi University) | MPT (Neurological Disorders)",
  "about": "Dr. Anjali Vaish is an experienced physiotherapist specializing in neurological rehabilitation, spinal injuries, orthopedic rehab and sports injuries. With over 14 years of experience across leading hospitals and athlete programs, she leads the physiotherapy OPD at Artemis and has worked extensively with elite athletes including Abhinav Bindra’s performance team.",
  "medicalProblems": [
    { "title": "Neurological Disorders", "description": "Stroke, Parkinson’s disease, multiple sclerosis." },
    { "title": "Spine Injuries", "description": "Back pain, spinal rehabilitation and disc conditions." },
    { "title": "Orthopedic Rehabilitation", "description": "TKR, THR and post-fracture rehabilitation." },
    { "title": "Sports Injuries", "description": "Ligament tears and overuse injuries." }
  ],
  "procedures": [
    { "title": "McKenzie Technique", "description": "Mechanical diagnosis and therapy for spine." },
    { "title": "Mulligan Therapy", "description": "Mobilization with movement techniques." },
    { "title": "Neurological Rehabilitation", "description": "Stroke and spinal cord injury rehab." },
    { "title": "Balance & Proprioception Training", "description": "Motor control and functional recovery." }
  ],
  "faqs": [
    { "question": "Does Dr. Anjali treat stroke patients?", "answer": "Yes, she specializes in neurological rehabilitation." },
    { "question": "Does she handle sports injuries?", "answer": "Yes, she treats ligament injuries, back pain and athletic rehab." },
    { "question": "Does she provide spinal rehab?", "answer": "Yes, she is trained in McKenzie and other spine techniques." }
  ]
},
{
  "slug": "dr-sachin-sethi",
  "name": "Dr. Sachin Sethi (PT)",
  "specialty": "Physiotherapy & Rehabilitation",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Principal Lead - Physiotherapy",
  "degree": "BPT | MPT (Musculoskeletal) | PGDHM | Biomechanics Certification (IIT Guwahati)",
  "about": "Dr. Sachin Sethi is a musculoskeletal physiotherapy specialist with over 13 years of experience in orthopedic rehab, spinal care, sports injuries and post-operative rehabilitation. He leads the Physiotherapy Department at Artemis and is known for advanced manual therapy, dry needling and ergonomic training across top corporates.",
  "medicalProblems": [
    { "title": "Spine & Neck Pain", "description": "Cervical/lumbar pain, PIVD and posture issues." },
    { "title": "Orthopedic Injuries", "description": "Fractures, ligament tears and joint degeneration." },
    { "title": "Sports Injuries", "description": "ACL/PCL tears, rotator cuff injuries and muscle strains." },
    { "title": "Neurological Rehab", "description": "Stroke and spinal cord injury rehabilitation." }
  ],
  "procedures": [
    { "title": "Manual Therapy", "description": "Joint mobilization and soft tissue therapy." },
    { "title": "Dry Needling", "description": "Trigger point release and pain relief." },
    { "title": "Sports Rehabilitation", "description": "Post-injury and post-surgery athlete recovery." },
    { "title": "Wheelchair Training", "description": "Functional training for mobility-impaired patients." }
  ],
  "faqs": [
    { "question": "Does Dr. Sachin treat sports injuries?", "answer": "Yes, he specializes in ACL, PCL and shoulder injuries." },
    { "question": "Does he offer ergonomic training?", "answer": "Yes, he conducts regular corporate ergonomics workshops." },
    { "question": "Does he treat chronic back pain?", "answer": "Yes, he uses manual therapy and biomechanical corrections." }
  ]
},
{
  "slug": "dr-ashutosh-gupta",
  "name": "Dr. Ashutosh Gupta",
  "specialty": "Fetal Medicine & Medical Genetics",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head – Medical Genetics",
  "degree": "MBBS | MS (OBGYN) | DM (Medical Genetics) | Fellowship in Fetal Medicine",
  "about": "Dr. Ashutosh Gupta is a leading fetal medicine specialist and clinical geneticist with expertise in prenatal diagnostics, high-risk pregnancy imaging, genetic counseling and invasive fetal procedures. With over 2000 fetal invasive procedures performed, he is one of India’s most experienced fetal medicine specialists.",
  "medicalProblems": [
    { "title": "Genetic Disorders", "description": "Chromosomal and single-gene disorders." },
    { "title": "High-Risk Pregnancy", "description": "Genetic risks, fetal anomalies and prenatal complications." },
    { "title": "Fetal Abnormalities", "description": "Structural and functional fetal issues." },
    { "title": "Prenatal Counseling", "description": "Risk assessment for inherited diseases." }
  ],
  "procedures": [
    { "title": "Amniocentesis & CVS", "description": "Invasive diagnostic fetal testing." },
    { "title": "Intrauterine Transfusions", "description": "Fetal blood transfusion for severe anemia." },
    { "title": "Multifetal Reduction", "description": "Selective reduction in high-risk pregnancies." },
    { "title": "Fetal Ultrasound Imaging", "description": "Nuchal scan, anomaly scan, Doppler and fetal echocardiography." }
  ],
  "faqs": [
    { "question": "Does Dr. Gupta perform amniocentesis?", "answer": "Yes, he has performed more than 2000 invasive fetal procedures." },
    { "question": "Does he provide genetic counseling?", "answer": "Yes, he specializes in prenatal and family genetic counseling." },
    { "question": "Does he treat high-risk pregnancies?", "answer": "Yes, he is an expert in fetal medicine and genetic risk assessment." }
  ]
},
{
  "slug": "dr-deepak-jha",
  "name": "Dr. Deepak Jha",
  "specialty": "Breast Surgery & Surgical Oncology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - Breast Surgery & Senior Consultant, Surgical Oncology",
  "degree": "MBBS | MS (General Surgery) | Surgical Oncology (AIIMS) | Fellowship in Breast Surgery (European Board) | Breast Oncoplasty (ESSO & Barcelona) | Fellow - IFHNOS",
  "about": "Dr. Deepak Jha is a highly acclaimed Breast Surgeon trained in Surgical Oncology at AIIMS and further specialized in advanced breast oncoplasty and reconstruction from Europe. He is one of the first surgeons in India to receive the European Board Fellowship in Breast Surgery. With extensive experience at Fortis FMRI, RGCI and Vall d’Hebron Hospital in Barcelona, he excels in breast conservation, nipple-sparing mastectomy, complex reconstructions and oncoplastic procedures.",
  "medicalProblems": [
    { "title": "Breast Cancer", "description": "Diagnosis, staging and surgical management." },
    { "title": "Benign Breast Diseases", "description": "Lumps, fibroadenoma, cysts and infections." },
    { "title": "High-Risk Breast Conditions", "description": "Genetic risk and preventive surgeries." },
    { "title": "Lymphedema", "description": "Post-surgery lymphatic complications." }
  ],
  "procedures": [
    { "title": "Mastectomy / Lumpectomy", "description": "Breast removal or conservation surgeries." },
    { "title": "Nipple Sparing Mastectomy", "description": "Cosmetic and safe cancer removal preserving nipple." },
    { "title": "Breast Oncoplasty", "description": "Reconstruction and reshaping after cancer surgery." },
    { "title": "Sentinel Lymph Node Biopsy", "description": "Minimally invasive lymph node mapping." }
  ],
  "faqs": [
    { "question": "Is Dr. Jha an expert in breast reconstruction?", "answer": "Yes, he is trained in advanced oncoplasty and DIEP flap reconstruction." },
    { "question": "Does he perform nipple-sparing mastectomy?", "answer": "Yes, he specializes in cosmetic and oncologic breast preservation." },
    { "question": "Does he treat benign breast problems?", "answer": "Yes, he manages all benign and malignant breast conditions." }
  ]
},
{
  "slug": "dr-ips-oberoi",
  "name": "Dr. I P S Oberoi",
  "specialty": "Orthopaedics & Robotic Joint Replacement",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "25+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chairperson - Orthopaedics Program & Chief – Robotic Joint Replacement & Arthroscopy",
  "degree": "MS (Orthopaedics) | MCh Orth (Liverpool, UK)",
  "about": "Dr. IPS Oberoi is one of India's most renowned orthopaedic surgeons and a pioneer of robotic joint replacement and arthroscopic surgery. Trained across Germany, UK, France and South Africa, he is an expert in complex primary and revision joint replacements of the knee, hip, shoulder, elbow and ankle. He is among the first in India to introduce minimally invasive keyhole reconstructive surgery.",
  "medicalProblems": [
    { "title": "Joint Arthritis", "description": "Severe knee, hip and shoulder degeneration." },
    { "title": "Sports Injuries", "description": "Ligament tears, meniscal injuries and shoulder instability." },
    { "title": "Complex Joint Disorders", "description": "Multi-ligament injuries and deformities." },
    { "title": "Orthopaedic Trauma", "description": "Complex fractures and post-traumatic issues." }
  ],
  "procedures": [
    { "title": "Robotic Joint Replacement", "description": "Knee, hip, shoulder and ankle robotic surgeries." },
    { "title": "Arthroscopy", "description": "Keyhole surgery for knee, shoulder, hip and elbow." },
    { "title": "Revision Joint Replacement", "description": "Complex and failed joint replacements." },
    { "title": "Sports Injury Surgery", "description": "Ligament reconstruction and cartilage repair." }
  ],
  "faqs": [
    { "question": "Does Dr. Oberoi perform robotic knee replacement?", "answer": "Yes, he is a leading expert in robotic and computer-assisted joint replacement." },
    { "question": "Is he trained internationally?", "answer": "Yes, he has trained in Germany, UK, South Africa and France." },
    { "question": "Does he treat sports injuries?", "answer": "Yes, he is a specialist in arthroscopy and complex ligament reconstruction." }
  ]
},
{
  "slug": "dr-ankit-goel",
  "name": "Dr. Ankit Goel",
  "specialty": "Urology, Renal Transplant & Robotic Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Urology & Renal Transplant",
  "degree": "MBBS | MS (General Surgery) | DNB | MCh Urology | DrNB Urology | MRCS (England) | FRCS Urology (Edinburgh, Gold Medalist)",
  "about": "Dr. Ankit Goel is an internationally trained urologist, robotic surgeon and renal transplant specialist. A Gold Medalist Fellow of the Royal College of Surgeons Edinburgh, he has trained and mentored urologists globally. His expertise spans endourology, reconstructive urology, robotic uro-oncology, pediatric urology and complex transplant procedures.",
  "medicalProblems": [
    { "title": "Kidney Stones", "description": "Stone disease requiring laser and minimally invasive surgery." },
    { "title": "Prostate Disorders", "description": "Enlargement, obstruction and prostate cancer." },
    { "title": "Male Infertility", "description": "Varicocele, hormonal and structural issues." },
    { "title": "Urological Cancers", "description": "Kidney, bladder, prostate and testicular cancers." }
  ],
  "procedures": [
    { "title": "Endourology", "description": "PCNL, RIRS, URS and laser lithotripsy." },
    { "title": "Robotic Surgery", "description": "Prostatectomy, cystectomy and kidney procedures." },
    { "title": "Reconstructive Urology", "description": "Urethroplasty, valve fulguration and functional repairs." },
    { "title": "Renal Transplant", "description": "Advanced transplant techniques and post-transplant care." }
  ],
  "faqs": [
    { "question": "Is Dr. Goel a robotic surgeon?", "answer": "Yes, he is trained in advanced robotic urological surgeries." },
    { "question": "Does he treat kidney stones?", "answer": "Yes, he specializes in laser and endourological stone procedures." },
    { "question": "Is he a Gold Medalist?", "answer": "Yes, he received the FRCS Urology Gold Medal from Edinburgh." }
  ]
},
{
  "slug": "dr-anju-singh",
  "name": "Dr. Anju Singh",
  "specialty": "Paediatric Rheumatology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "13+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Pediatric Rheumatology",
  "degree": "MBBS | DCH | MD (Paediatrics) | Fellowship in Pediatric Rheumatology",
  "about": "Dr. Anju Singh is a certified pediatric rheumatologist with extensive experience in diagnosing and treating autoimmune and inflammatory disorders in children. Trained at Safdarjung Hospital, RML Hospital and Sir Ganga Ram Hospital, she is skilled in ultrasound-guided joint procedures and pediatric musculoskeletal ultrasound.",
  "medicalProblems": [
    { "title": "Juvenile Idiopathic Arthritis (JIA)", "description": "Chronic joint inflammation in children." },
    { "title": "Connective Tissue Disorders", "description": "Lupus, dermatomyositis and scleroderma." },
    { "title": "Pediatric Vasculitis", "description": "Kawasaki disease, PAN, Takayasu arteritis." },
    { "title": "Autoinflammatory Syndromes", "description": "Periodic fever and immune dysregulation disorders." }
  ],
  "procedures": [
    { "title": "Intra-Articular Steroid Injections", "description": "Ultrasound-guided joint therapy." },
    { "title": "Musculoskeletal Ultrasound", "description": "Diagnostic ultrasound for pediatric joints." },
    { "title": "Joint Aspiration", "description": "Fluid removal for diagnosis and treatment." }
  ],
  "faqs": [
    { "question": "Does Dr. Singh treat JIA?", "answer": "Yes, she specializes in all forms of juvenile arthritis." },
    { "question": "Does she perform ultrasound-guided injections?", "answer": "Yes, she routinely performs image-guided procedures for children." },
    { "question": "Does she treat rare autoimmune diseases?", "answer": "Yes, she manages complex pediatric rheumatologic conditions." }
  ]
},
{
  "slug": "dr-rahul-mehrotra",
  "name": "Dr. Rahul Mehrotra",
  "specialty": "Cardiology & Non-Invasive Cardiology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "20+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief - NIC & Clinical Cardiology",
  "degree": "MBBS | MD (Medicine) | DNB (Cardiology)",
  "about": "Dr. Rahul Mehrotra is a senior cardiologist with over two decades of expertise in non-invasive and clinical cardiology. He has authored more than 100 publications and is a reviewer for several national and international journals. His special interest includes echocardiography, cardiac imaging and preventive cardiology.",
  "medicalProblems": [
    { "title": "Heart Failure", "description": "Management of acute and chronic cardiac dysfunction." },
    { "title": "Arrhythmias", "description": "Heart rhythm disorders and risk evaluation." },
    { "title": "Coronary Artery Disease", "description": "Diagnosis through non-invasive imaging." },
    { "title": "Valvular Disorders", "description": "Assessment of structural heart diseases." }
  ],
  "procedures": [
    { "title": "2D & 3D Echocardiography", "description": "Advanced cardiac imaging." },
    { "title": "Stress Echocardiography", "description": "Evaluation of cardiac ischemia." },
    { "title": "TEE (Transesophageal Echo)", "description": "Detailed structural heart imaging." },
    { "title": "Vascular Doppler", "description": "Peripheral artery and vein evaluation." }
  ],
  "faqs": [
    { "question": "Does Dr. Mehrotra perform echocardiography?", "answer": "Yes, he specializes in all advanced echo techniques." },
    { "question": "Does he treat hypertension and cardiac risk?", "answer": "Yes, he focuses on preventive and clinical cardiology." },
    { "question": "Is he a member of major cardiology associations?", "answer": "Yes, he is affiliated with CSI, IAE and ASE." }
  ]
},
{
  "slug": "dr-kuldeep-arora",
  "name": "Dr. Kuldeep Arora",
  "specialty": "Interventional Cardiology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "16+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Unit Head & Chief Cath Lab (Unit II)",
  "degree": "MBBS | MD (General Medicine) | DM (Cardiology)",
  "about": "Dr. Kuldeep Arora is a senior interventional cardiologist with over 12,000 successful cardiac interventions including angioplasties, pacemakers, ICDs and device closures. He specializes in transradial angioplasty, heart attack management, complex coronary interventions and advanced cardiac devices.",
  "medicalProblems": [
    { "title": "Coronary Artery Disease", "description": "Blockages requiring angioplasty or stenting." },
    { "title": "Heart Rhythm Disorders", "description": "Pacemaker and ICD-related issues." },
    { "title": "Congenital Heart Defects", "description": "ASD, VSD and structural abnormalities." },
    { "title": "Valvular Heart Disease", "description": "Balloon valvotomy and advanced intervention." }
  ],
  "procedures": [
    { "title": "Coronary Angioplasty", "description": "Stent placement via radial or femoral route." },
    { "title": "Pacemaker & ICD Implantation", "description": "Device therapy for rhythm disorders." },
    { "title": "Device Closure", "description": "ASD, VSD and PDA closure." },
    { "title": "Balloon Valvuloplasty", "description": "Valve opening procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Arora perform radial angioplasty?", "answer": "Yes, he specializes in painless, quick-recovery radial interventions." },
    { "question": "Does he treat congenital defects?", "answer": "Yes, he performs device closures for pediatric and adult patients." },
    { "question": "Does he implant cardiac devices?", "answer": "Yes, including pacemakers, AICDs and CRT devices." }
  ]
},
{
  "slug": "dr-gajanand-yadav",
  "name": "Dr. Gajanand Yadav",
  "specialty": "Orthopaedics & Hip/Knee Arthroplasty",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "12+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant - Orthopaedics and Hip & Knee Arthroplasty",
  "degree": "MBBS | MS (Orthopaedics) | Fellowship – T.K. Orthopaedics & SNUBH (Seoul, South Korea)",
  "about": "Dr. Gajanand Yadav is an experienced orthopaedic surgeon with expertise in hip and knee joint replacement, arthroscopy and complex trauma surgeries. Trained at AIIMS New Delhi and later in South Korea under renowned joint replacement experts, he performs over 300 surgeries annually with high precision and advanced minimally invasive techniques.",
  "medicalProblems": [
    { "title": "Joint Arthritis", "description": "Advanced hip and knee degeneration." },
    { "title": "Sports Injuries", "description": "Ligament tears, meniscus and cartilage injuries." },
    { "title": "Complex Trauma", "description": "Peri-articular and acetabular fractures." },
    { "title": "Geriatric Orthopaedic Issues", "description": "Hip fractures and age-related mobility problems." }
  ],
  "procedures": [
    { "title": "Total Hip Replacement", "description": "Primary and revision hip arthroplasty." },
    { "title": "Total Knee Replacement", "description": "Minimally invasive and Oxford partial knee replacement." },
    { "title": "Knee Arthroscopy", "description": "Meniscus repair, cartilage procedures and ligament reconstruction." },
    { "title": "Complex Trauma Surgery", "description": "Polytrauma and pelvic-acetabular reconstruction." }
  ],
  "faqs": [
    { "question": "Does Dr. Yadav perform knee replacement surgery?", "answer": "Yes, he specializes in primary and revision knee arthroplasty." },
    { "question": "Is he trained internationally?", "answer": "Yes, he completed advanced training in Seoul, South Korea." },
    { "question": "Does he treat sports injuries?", "answer": "Yes, he manages all knee and shoulder sports injuries." }
  ]
},
{
  "slug": "dr-amit-kumar-chaurasia",
  "name": "Dr. Amit Kumar Chaurasia",
  "specialty": "Interventional Cardiology, TAVI/TAVR & Structural Heart Disease",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "18+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Chief Cath Lab & TAVI (Unit I)",
  "degree": "MBBS (JIPMER) | MD (AIIMS) | DM Cardiology (SCTIMST) | Fellowship in Structural Heart Disease (Europe)",
  "about": "Dr. Amit Kumar Chaurasia is one of India’s most renowned interventional and structural heart cardiologists with over 10,000 cardiac procedures and more than 1000 TAVI/TAVR cases—one of the highest in India. He is an international proctor for TAVI and has trained doctors across Europe and Asia. His expertise includes complex coronary interventions, TMVR, TPVR, LAA closure and advanced structural cardiac procedures.",
  "medicalProblems": [
    { "title": "Aortic Valve Stenosis", "description": "Advanced valve disease requiring TAVI/TAVR." },
    { "title": "Coronary Artery Disease", "description": "Blockages requiring complex angioplasty." },
    { "title": "Congenital Heart Defects", "description": "ASD, VSD and PDA requiring device closures." },
    { "title": "Heart Failure & Arrhythmias", "description": "Advanced structural and device-based treatment." }
  ],
  "procedures": [
    { "title": "TAVI / TAVR", "description": "Transcatheter aortic valve implantation." },
    { "title": "Complex Coronary Angioplasty", "description": "Left main, CTO and multivessel intervention." },
    { "title": "Structural Heart Interventions", "description": "TMVR, TPVR, MitraClip and LAA closure." },
    { "title": "Pediatric & Adult Device Closures", "description": "ASD, VSD and PDA." }
  ],
  "faqs": [
    { "question": "Is Dr. Chaurasia a TAVI specialist?", "answer": "Yes, he is one of India’s leading TAVI/TAVR experts and international proctors." },
    { "question": "Does he perform complex coronary angioplasties?", "answer": "Yes, including CTO, left main and high-risk PCI." },
    { "question": "Does he perform structural interventions?", "answer": "Yes, he performs TMVR, TPVR, MitraClip and more." }
  ]
},
{
  "slug": "dr-amita-naithani",
  "name": "Dr. Amita Naithani",
  "specialty": "Gynaecological Oncology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Senior Consultant - Gynae Oncology",
  "degree": "MBBS | DGO | DNB (Obs & Gynae) | Fellowship in Gynaecologic Oncology",
  "about": "Dr. Amita Naithani is an accomplished gynecologic oncologist with expertise in complex cytoreductive surgeries, HIPEC, radical hysterectomy (open and robotic), vulvar cancer surgery and ovarian cancer management. A DaVinci-certified robotic surgeon, she has over a decade of experience at Rajiv Gandhi Cancer Institute and Max Super Speciality Hospital.",
  "medicalProblems": [
    { "title": "Ovarian Cancer", "description": "Cytoreductive surgery with HIPEC/HITHOC." },
    { "title": "Cervical Cancer", "description": "Radical hysterectomy and pelvic lymphadenectomy." },
    { "title": "Endometrial Cancer", "description": "Minimally invasive and robotic surgery." },
    { "title": "Vulvar & Vaginal Cancers", "description": "Radical vulvectomy and node dissection." }
  ],
  "procedures": [
    { "title": "Robotic Radical Hysterectomy", "description": "Minimally invasive cancer surgery." },
    { "title": "Ovarian Cytoreductive Surgery", "description": "Advanced debulking procedures with HIPEC." },
    { "title": "Radical Vulvectomy", "description": "Oncologic resection with lymph node dissection." },
    { "title": "Pelvic Oncologic Surgery", "description": "Complex open and laparoscopic procedures." }
  ],
  "faqs": [
    { "question": "Is Dr. Naithani a robotic surgeon?", "answer": "Yes, she is a certified DaVinci Robotic Console Surgeon." },
    { "question": "Does she perform HIPEC?", "answer": "Yes, for advanced ovarian malignancies." },
    { "question": "Does she treat rare gynecologic cancers?", "answer": "Yes, she handles all oncologic gynecology cases." }
  ]
},
{
  "slug": "dr-nutan-agarwal",
  "name": "Dr. Nutan Agarwal",
  "specialty": "Gynaecological Endocrinology, Obstetrics & Gynaecology",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "35+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Head of Department - Gynae Endocrinology & DNB Program Director",
  "degree": "MBBS | MD (OBGYN) | MNAMS | FICOG | FIMSA | WHO Fellowship (Reproductive Medicine) | Fetal Medicine Fellowship (London)",
  "about": "Dr. Nutan Agarwal is one of India’s most respected obstetricians and gynaecological endocrinologists with over 35 years of experience. A former Professor at AIIMS Delhi, she pioneered multiple therapies in India for PCOS, recurrent pregnancy loss, AUB, menopause and fetal medicine. She has over 300 publications, numerous awards and has led national guidelines in gynecological endocrinology.",
  "medicalProblems": [
    { "title": "High-Risk Pregnancy", "description": "Recurrent pregnancy loss, fetal complications and preterm labor." },
    { "title": "PCOS & Endocrine Disorders", "description": "Hormonal imbalance and metabolic issues." },
    { "title": "Abnormal Uterine Bleeding", "description": "Medical and procedural treatment." },
    { "title": "Menopause & Hormonal Issues", "description": "Comprehensive endocrine management." }
  ],
  "procedures": [
    { "title": "Fetal Medicine Procedures", "description": "Amniocentesis, CVS, cordocentesis and fetal reduction." },
    { "title": "Laparoscopic & Gynecologic Surgery", "description": "Benign and malignant gynecological procedures." },
    { "title": "Vaginoplasty & Gonadectomy", "description": "Specialized corrective surgeries." },
    { "title": "High-Risk Obstetric Management", "description": "Advanced maternal-fetal interventions." }
  ],
  "faqs": [
    { "question": "Is Dr. Agarwal a fetal medicine expert?", "answer": "Yes, she has fellowship training from King’s College Hospital, London." },
    { "question": "Does she treat PCOS?", "answer": "Yes, she is a pioneer in medical therapy for PCOS in India." },
    { "question": "Does she manage high-risk pregnancies?", "answer": "Yes, including recurrent losses and fetal complications." }
  ]
},
{
  "slug": "dr-meenal-thakral",
  "name": "Dr. Meenal Thakral",
  "specialty": "Geriatric Medicine",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "8+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Attending Consultant – Geriatric Medicine",
  "degree": "MBBS (Gold Medalist) | MD (Geriatric Medicine, AIIMS)",
  "about": "Dr. Meenal Thakral is a geriatrician trained at AIIMS New Delhi with expertise in managing elderly patients with multiple comorbidities, cognitive decline, frailty and geriatric syndromes. She is a certified Clinical Dementia Rating (CDR) trainer and has presented her research at major international conferences.",
  "medicalProblems": [
    { "title": "Cognitive Disorders", "description": "Dementia, delirium and memory loss." },
    { "title": "Geriatric Syndromes", "description": "Falls, incontinence, weight loss and frailty." },
    { "title": "Chronic Diseases", "description": "Diabetes, hypertension, CKD, COPD and liver disease." },
    { "title": "Onco-Geriatrics", "description": "Pre-treatment assessment for elderly cancer patients." }
  ],
  "procedures": [
    { "title": "Comprehensive Geriatric Assessment", "description": "Holistic evaluation of elderly patients." },
    { "title": "Cognitive Testing", "description": "CDR scoring and dementia assessment." },
    { "title": "Frailty Screening", "description": "Risk evaluation for falls and disability." }
  ],
  "faqs": [
    { "question": "Does Dr. Thakral manage dementia?", "answer": "Yes, she is trained in cognitive assessment and dementia management." },
    { "question": "Does she treat elderly with multiple diseases?", "answer": "Yes, she specializes in multimorbidity management." },
    { "question": "Does she handle pre-surgical geriatric assessments?", "answer": "Yes, especially ortho-geriatrics and onco-geriatrics." }
  ]
},
{
  "slug": "dr-sumit-kumar",
  "name": "Dr. Sumit Kumar",
  "specialty": "Orthopaedics & Spine Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "10+ years",
  "image": "",
  "isTopDoctor": false,
  "position": "Consultant – Orthopaedics & Spine Surgery",
  "degree": "MBBS | D.Orth | DNB (Ortho) | FNB Spine Surgery | AO Spine Fellowship | MISS Fellowship (Germany)",
  "about": "Dr. Sumit Kumar is a fellowship-trained spine surgeon specializing in minimally invasive spine surgery, endoscopic spine procedures, deformity correction and spinal trauma. Trained at Safdarjung Hospital, ISIC and Germany, he manages complex spine disorders with modern techniques and evidence-driven care.",
  "medicalProblems": [
    { "title": "Lumbar & Cervical Disc Disease", "description": "Disc herniation and stenosis." },
    { "title": "Spinal Deformities", "description": "Scoliosis and kyphosis correction." },
    { "title": "Spinal Tumors", "description": "Benign and malignant spinal lesions." },
    { "title": "Spinal Trauma", "description": "Fractures and instability requiring fixation." }
  ],
  "procedures": [
    { "title": "Spinal Fusion (TLIF, OLIF, ALIF)", "description": "Stabilization for degenerative spine disease." },
    { "title": "Endoscopic Spine Surgery", "description": "Minimally invasive decompression and discectomy." },
    { "title": "MIS Decompression & Fixation", "description": "Minimally invasive spinal surgery." },
    { "title": "Pain Procedures", "description": "Nerve root blocks, epidural injections and RFA." }
  ],
  "faqs": [
    { "question": "Does Dr. Sumit perform endoscopic spine surgery?", "answer": "Yes, he is trained internationally in advanced endoscopic techniques." },
    { "question": "Does he treat spine deformities?", "answer": "Yes, including scoliosis and kyphosis." },
    { "question": "Does he perform minimally invasive spine surgery?", "answer": "Yes, he specializes in MIS spine procedures." }
  ]
},
{
  "slug": "dr-biswarup-purkayastha",
  "name": "Dr. Biswarup Purkayastha",
  "specialty": "Heart & Lung Transplant & Cardiothoracic Surgery",
  "hospital": "Artemis Hospital, Gurgaon",
  "experience": "15+ years",
  "image": "",
  "isTopDoctor": true,
  "position": "Consultant – Heart & Lung Transplant and Vascular Surgery",
  "degree": "MBBS | MEBCTS (European Board) | Greenlane Fellowship (Auckland) | Toronto–Vienna Lung Transplant Program",
  "about": "Dr. Biswarup Purkayastha is a highly skilled cardiothoracic and vascular surgeon with specialized training in heart and lung transplantation. With extensive experience across leading hospitals in India and international training in Austria and New Zealand, he performs advanced transplant surgeries, mechanical circulatory support and complex coronary and thoracic procedures.",
  "medicalProblems": [
    { "title": "End-Stage Heart Failure", "description": "Heart transplant and mechanical support." },
    { "title": "End-Stage Lung Disease", "description": "Lung transplantation and advanced thoracic procedures." },
    { "title": "Coronary Artery Disease", "description": "Complex bypass and total arterial revascularization." },
    { "title": "Aortic Diseases", "description": "Aneurysm, dissection and vascular disorders." }
  ],
  "procedures": [
    { "title": "Heart & Lung Transplantation", "description": "Advanced transplant and post-transplant care." },
    { "title": "Coronary Bypass Surgery", "description": "Including LIMA-RIMA total arterial grafting." },
    { "title": "Aortic Surgery (Bentall’s, TEVAR, EVAR)", "description": "Open and endovascular repair." },
    { "title": "Thoracoscopic & VATS Surgery", "description": "Minimally invasive lung and thoracic procedures." }
  ],
  "faqs": [
    { "question": "Does Dr. Biswarup perform heart and lung transplants?", "answer": "Yes, he is an expert in transplant and mechanical circulatory support." },
    { "question": "Does he perform minimally invasive thoracic surgery?", "answer": "Yes, including VATS and thoracoscopic techniques." },
    { "question": "Is he internationally trained?", "answer": "Yes, with advanced training from Vienna and Auckland." }
  ]
}
];



  try {
    // await Doctor.deleteMany({});
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
