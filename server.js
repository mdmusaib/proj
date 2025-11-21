const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔥 NEW: AdminUser Schema for basic authentication
const AdminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});


// --- Mongoose models ---
const HospitalSchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  location: String,
  rating: Number,
  beds: Number,
  specialties: [String],
  description: String,
  accreditations: [String],
  treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' }],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  latitude: Number,
  longitude: Number,
});


const hospitals = [
  
  {
    slug: "dr-subrat-akhoury",
    name: "Dr. Subrat Akhoury",
    specialty: "Cardiology",
    position: "Chairman Cath Lab & Interventional Cardiologist",
    experience: "20+ years",
    expertise: "Cardiac catheterization, Interventional Cardiology",
    qualifications: "MD, DM Cardiology",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Expertise in interventional cardiology, extensive experience in angioplasty and cardiac catheterization."
  },
  {
    slug: "dr-rishi-gupta",
    name: "Dr. Rishi Gupta",
    specialty: "Cardiology",
    position: "Senior Cardiologist",
    experience: "32 years",
    expertise: "General Cardiology, Non-invasive cardiac procedures",
    qualifications: "MD, DM Cardiology",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "32 years of experience in cardiology including non-invasive cardiology techniques."
  },
  {
    slug: "dr-prateek-chaudhary",
    name: "Dr. Prateek Chaudhary",
    specialty: "Cardiology",
    position: "Interventional Cardiologist",
    experience: "8+ years",
    expertise: "Interventional Cardiology",
    qualifications: "MBBS, MD, DM, EP Fellowship",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Known for advanced cardiac care and interventions."
  },
  {
    slug: "dr-l-k-jha",
    name: "Dr. L.K. Jha",
    specialty: "Cardiology",
    position: "Senior Cardiologist",
    experience: "14+ years",
    expertise: "Cardiac catheterization, Angioplasty, Electrophysiology",
    qualifications: "Medicine training at KGMU, Lucknow",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Performed 10,000+ coronary angiograms and 1,000+ angioplasties."
  },
  {
    slug: "dr-anita-kant-cosmetic",
    name: "Dr. Anita Kant",
    specialty: "Cosmetic Surgery",
    position: "Consultant Gynecologist with Cosmetic Surgery expertise",
    experience: "12 years",
    expertise: "Gynecology and cosmetic procedures",
    qualifications: "MBBS, MS, DGO",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Specialized in gynecology with additional expertise in cosmetic procedures."
  },
  {
    slug: "dr-anita-kant-gynecology",
    name: "Dr. Anita Kant",
    specialty: "Gynecology",
    position: "Gynecologist/Obstetrician",
    experience: "12 years",
    expertise: "Obstetrics, Gynecology, Cosmetic Gynecology",
    qualifications: "MBBS, MS, DGO",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced in obstetrics and gynecology with a focus on cosmetic gynecology."
  },
  {
    slug: "dr-gunjan-bhola",
    name: "Dr. Gunjan Bhola",
    specialty: "Gynecology",
    position: "Senior Consultant Gynecologist",
    experience: "25 years",
    expertise: "High-risk pregnancies, infertility treatment",
    qualifications: "MBBS, MS, DNB",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Expert in managing high-risk pregnancies and infertility."
  },
  {
    slug: "dr-namrata-seth",
    name: "Dr. Namrata Seth",
    specialty: "Gynecology",
    position: "Gynecologist/Obstetrician",
    experience: "15 years",
    expertise: "General gynecology, infertility, laparoscopic surgeries",
    qualifications: "MBBS, MS, DNB",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced gynecologist with laparoscopic surgery expertise."
  },
  {
    slug: "dr-pooja-thukral",
    name: "Dr. Pooja Thukral",
    specialty: "Gynecology",
    position: "Gynecologist",
    experience: "10+ years",
    expertise: "Gynecological surgeries, infertility treatment",
    qualifications: "MBBS, MS",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced in gynecological surgeries and infertility treatments."
  },
  {
    slug: "dr-bhavna-banga",
    name: "Dr. Bhavna Banga",
    specialty: "IVF & Infertility",
    position: "Consultant and IVF Specialist",
    experience: "12 years",
    expertise: "IVF, infertility treatments",
    qualifications: "MBBS, DGO",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced IVF specialist with hands-on experience in assisted reproductive technologies."
  },
  {
    slug: "dr-mukesh-pandey",
    name: "Dr. Mukesh Pandey",
    specialty: "Neurosurgery",
    position: "Director & HOD - Neurosurgery",
    experience: "16+ years",
    expertise: "Neurosurgical procedures, brain and spine surgeries",
    qualifications: "MBBS, MS (General Surgery), MCh (Neurosurgery)",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Performs complex neurosurgical procedures including aneurysms and brain tumors."
  },
  {
    slug: "dr-kunal-bahrani",
    name: "Dr. Kunal Bahrani",
    specialty: "Neurosurgery",
    position: "Consultant Neurosurgeon",
    experience: "10+ years",
    expertise: "Brain tumor surgery, spinal surgeries",
    qualifications: "MBBS, MS, MCh Neurosurgery",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced in minimally invasive neurosurgical techniques."
  },
  {
    slug: "dr-reetesh-sharma",
    name: "Dr. Reetesh Sharma",
    specialty: "Neurosurgery",
    position: "Consultant Neurosurgeon",
    experience: "12 years",
    expertise: "Spine surgery, neurotrauma",
    qualifications: "MBBS, MS, MCh Neurosurgery",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Specializes in spinal surgeries and neurotrauma management."
  },
  {
    slug: "dr-anil-kumar",
    name: "Dr. Anil Kumar",
    specialty: "Neurosurgery",
    position: "Senior Consultant Neurosurgeon",
    experience: "18+ years",
    expertise: "Brain and spinal tumor surgeries",
    qualifications: "MBBS, MS, MCh Neurosurgery",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced in complex brain and spinal tumor surgeries."
  },
  {
    slug: "dr-prashant-mehta",
    name: "Dr. Prashant Mehta",
    specialty: "Oncology",
    position: "Medical Oncologist",
    experience: "12+ years",
    expertise: "Medical oncology, hematology, bone marrow transplant",
    qualifications: "MD, DM Oncology",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Expert in precision oncology and hematological malignancies."
  },
  {
    slug: "dr-praveen-bansal",
    name: "Dr. Praveen Bansal",
    specialty: "Oncology",
    position: "Director - Oncology Services",
    experience: "23+ years",
    expertise: "Medical oncology, hematological tumors",
    qualifications: "MD, DM Oncology",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Specializes in pediatric and adult hematological malignancies."
  },
  {
    slug: "dr-manish-julaha",
    name: "Dr. Manish Julaha",
    specialty: "Oncology",
    position: "Head & Neck Onco Surgeon",
    experience: "14 years",
    expertise: "Head and neck oncology surgery",
    qualifications: "MS, MCh Oncology",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Experienced in head and neck cancer surgeries."
  },
  {
    slug: "dr-neetu-singhal",
    name: "Dr. Neetu Singhal",
    specialty: "Oncology",
    position: "Radiation Oncologist",
    experience: "20 years",
    expertise: "Radiation oncology",
    qualifications: "MD Radiotherapy",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Expert in radiation therapy for various cancers."
  },
  {
    slug: "dr-mrinal-sharma",
    name: "Dr. Mrinal Sharma",
    specialty: "Orthopedics",
    position: "Orthopaedic and Joint Replacement Surgeon",
    experience: "17+ years",
    expertise: "Bone and joint replacement, computer navigated arthroplasty",
    qualifications: "MS Orthopedics",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Expert in robotic assisted hip and knee replacements."
  },
  {
    slug: "dr-ashutosh-srivastava",
    name: "Dr. Ashutosh Srivastava",
    specialty: "Orthopedics",
    position: "Orthopedician",
    experience: "15 years",
    expertise: "Orthopedics, Trauma surgery",
    qualifications: "MS Orthopedics",
    experienceLevel: "Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Handles complex fracture and trauma cases."
  },
  {
    slug: "dr-rajiv-thukral",
    name: "Dr. Rajiv Thukral",
    specialty: "Orthopedics",
    position: "Senior Orthopaedic Surgeon",
    experience: "23+ years",
    expertise: "Arthroplasty, sports injury surgery",
    qualifications: "MS Orthopedics, DNB",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Specialist in joint replacement and sports injuries."
  },
  {
    slug: "dr-neeraj-gupta",
    name: "Dr. Neeraj Gupta",
    specialty: "Spine Surgery",
    position: "Consultant Spine Surgeon",
    experience: "25+ years",
    expertise: "Spine surgery, spinal deformities, minimally invasive spine surgery",
    qualifications: "MBBS, Diploma in Orthopedics, DNB, FNB Spine Surgery",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Specialist in minimally invasive and robotic spine surgeries with extensive international training."
  },
  {
    slug: "dr-rakesh-kumar",
    name: "Dr. Rakesh Kumar",
    specialty: "Spine Surgery",
    position: "Senior Consultant Spine Surgeon",
    experience: "20+ years",
    expertise: "Spinal tumor surgery, deformity correction",
    qualifications: "MS Orthopedics, MCh Spine Surgery",
    experienceLevel: "Senior Consultant",
    place: "Asian Institute of Medical Sciences, Faridabad",
    photo: "",
    about: "Skilled in spinal tumor surgeries and complex deformity corrections."
  }


];



const TreatmentSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
   // 🔥 ADD THIS

  treatmentName: String,
  category: String,
  description: String,
  costRange: String,

  treatmentNameAr: String,
  categoryAr: String,
  descriptionAr: String,

  hospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],

  treatmentDetails: {
    en: { type: String, default: "" },
    ar: { type: String, default: "" }
  },

  costTable: [
    {
      name: String,
      description: String,
      costFrom: Number,
      costTo: Number,
      currency: { type: String, default: "USD" }
    }
  ]
});

TreatmentSchema.pre("save", function (next) {
  if (this.treatmentName && !this.slug) {
    this.slug = this.treatmentName.toLowerCase().trim().replace(/\s+/g, "-");
  }
  next();
});




const DoctorSchema = new mongoose.Schema({
  name: String,
  slug: String,
  specialty: String,
  experience: String,
  image: String,
  isTopDoctor: Boolean,
  position: String,
  degree: String,
  about: String,
  medicalProblems: [String],
  procedures: [String],
  faqs: [{ question: String, answer: String }],
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' }]
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema); 
const Hospital = mongoose.model('Hospital', HospitalSchema);
const Treatment = mongoose.model('Treatment', TreatmentSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);




// --- Admin APIs ---
// Hospitals
app.post('/admin/hospitals', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = '/uploads/' + req.file.filename;
    // ensure arrays
    if (data.specialties && typeof data.specialties === 'string') data.specialties = data.specialties.split(',').map(s => s.trim());
    const h = await Hospital.create(data);
    res.json(h);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin/hospitals', async (req, res) => {
  const list = await Hospital.find();
  res.json(list);
});

app.get('/admin/hospitals/:id', async (req, res) => {
  const item = await Hospital.findById(req.params.id);
  res.json(item);
});

app.put('/admin/hospitals/:id', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.specialties && typeof data.specialties === 'string') data.specialties = data.specialties.split(',').map(s => s.trim());
    const h = await Hospital.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(h);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/hospitals/:id', async (req, res) => {
  await Hospital.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Treatments (no images)
app.post('/admin/treatments', async (req, res) => {
  try {
    const t = await Treatment.create(req.body);
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin/treatments', async (req, res) => {
  const list = await Treatment.find().populate('hospitals').populate('doctors');
  res.json(list);
});

app.get('/admin/treatments/:id', async (req, res) => {
  const item = await Treatment.findById(req.params.id).populate('hospitals').populate('doctors');
  res.json(item);
});

app.put('/admin/treatments/:id', async (req, res) => {
  try {
    const t = await Treatment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/treatments/:id', async (req, res) => {
  await Treatment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Doctors (image supported)
app.post('/admin/doctors', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.treatments && typeof data.treatments === 'string') data.treatments = data.treatments.split(',').map(s=>s.trim());
    const d = await Doctor.create(data);
    res.json(d);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin/doctors', async (req, res) => {
  const list = await Doctor.find().populate('hospital').populate('treatments');
  res.json(list);
});

app.get('/admin/doctors/:id', async (req, res) => {
  const item = await Doctor.findById(req.params.id).populate('hospital').populate('treatments');
  res.json(item);
});

app.put('/admin/doctors/:id', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.treatments && typeof data.treatments === 'string') data.treatments = data.treatments.split(',').map(s=>s.trim());
    const d = await Doctor.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(d);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/doctors/:id', async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Public listing routes (formatted like your mock)
app.get('/public/treatments', async (req, res) => {
  const treatments = await Treatment.find().populate('doctors').populate('hospitals');
  const formatted = treatments.map(t => ({
    treatmentName: t.treatmentName,
    category: t.category,
    description: t.description,
    costRange: t.costRange,
    treatmentNameAr: t.treatmentNameAr,
    categoryAr: t.categoryAr,
    descriptionAr: t.descriptionAr,
    hospitals: t.hospitals.map(h => ({
      slug: h.slug, name: h.name, image: h.image, location: h.location, rating: h.rating,
      beds: h.beds, specialties: h.specialties, description: h.description, accreditations: h.accreditations,
      latitude: h.latitude, longitude: h.longitude
    })),
    doctors: t.doctors.map(d => ({
      slug: d.slug, name: d.name, specialty: d.specialty, hospital: d.hospital?.name,
      experience: d.experience, image: d.image, isTopDoctor: d.isTopDoctor, position: d.position,
      degree: d.degree, about: d.about, medicalProblems: d.medicalProblems, procedures: d.procedures, faqs: d.faqs
    }))
  }));
  res.json(formatted);
});

// simple healthcheck
app.get('/health', (req,res)=> res.json({ok:true}));

// start
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_local';
mongoose.connect(MONGO, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=> {
    console.log('mongodb connected');
    seedIfEmpty().then(()=> console.log('seed complete'));
    app.listen(process.env.PORT || 5000, ()=> console.log('server started on 5000'));
  }).catch(err=> {
    console.error('mongo connect failed', err);
  });

  app.get('/public/hospitals/:slug', async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ slug: req.params.slug });

    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/public/doctors/:slug', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ slug: req.params.slug })
      .populate('hospital')
      .populate('treatments');

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/public/hospitals/:hospitalId/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospital: req.params.hospitalId })
      .populate('treatments');

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/public/treatments/:categorySlug', async (req, res) => {
  try {
    const categorySlug = req.params.categorySlug.toLowerCase().trim();

    // Convert slug -> category name (Cardiology, Oncology, etc.)
    const categoryName = categorySlug.replace(/-/g, ' '); // If needed

    // Fetch treatments under this category
    const treatments = await Treatment.find({
      category: new RegExp(`^${categoryName}$`, "i")
    });

    if (!treatments || treatments.length === 0) {
      return res.status(404).json({ error: "No treatments found for this category" });
    }

    // Format each treatment
    const formatted = treatments.map(t => ({
      treatmentName: t.treatmentName,
      treatmentNameAr: t.treatmentNameAr,

      category: t.category,
      categoryAr: t.categoryAr,

      description: t.description,
      descriptionAr: t.descriptionAr,

      treatmentDetails: t.treatmentDetails,

      costTable: t.costTable || []
    }));

    res.json({
      category: categoryName,
      slug: categorySlug,
      treatments: formatted
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/fix-slugs", async (req, res) => {
  const treatments = await Treatment.find();

  for (const t of treatments) {
    t.slug = t.treatmentName.toLowerCase().trim().replace(/\s+/g, "-");
    await t.save();
  }

  res.send("Slugs added");
});


app.post('/admin/treatments', async (req, res) => {
  try {
    let data = req.body;

    // Ensure hospitals & doctors are arrays
    if (data.hospitals && typeof data.hospitals === "string") {
      data.hospitals = data.hospitals.split(",").map(id => id.trim());
    }
    if (data.doctors && typeof data.doctors === "string") {
      data.doctors = data.doctors.split(",").map(id => id.trim());
    }

    // --- 🔥 COST TABLE FIX ---
    if (data.costTable) {
      if (typeof data.costTable === "string") {
        data.costTable = JSON.parse(data.costTable);
      }

      data.costTable = data.costTable.map(item => ({
        name: item.name,
        description: item.description,
        costFrom: Number(item.costFrom) || 0,
        costTo: Number(item.costTo) || 0,
        currency: item.currency || "USD"
      }));
    }

    const t = await Treatment.create(data);
    res.json(t);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/admin/treatments/:id', async (req, res) => {
  try {
    let data = req.body;

    if (data.costTable) {
      if (typeof data.costTable === "string") {
        data.costTable = JSON.parse(data.costTable);
      }

      data.costTable = data.costTable.map(item => ({
        name: item.name,
        description: item.description,
        costFrom: Number(item.costFrom) || 0,
        costTo: Number(item.costTo) || 0,
        currency: item.currency || "USD"
      }));
    }

    const t = await Treatment.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(t);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Top 3 Doctors
app.get('/public/top-doctors', async (req, res) => {
  try {
    const topDoctors = await Doctor.find({ isTopDoctor: true })
      .populate('hospital')
      .populate('treatments')
      .limit(3);

    res.json(topDoctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// // 🔥 Top 3 Hospitals 
// app.get('/public/top-hospitals', async (req, res) => {
//   try {
//     const topHospitals = await Hospital.find()
//       .limit(3);

//     res.json(topHospitals);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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
