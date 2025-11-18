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
const Hospital = require("./models/Hospital"); // change path if needed

mongoose.connect("mongodb://127.0.0.1:27017/yourdbname")
  .then(() => console.log("DB Connected"))
  .catch(err => console.error(err));

const hospitals = [
  {
    "name": "Medanta - The Medicity, Gurgaon",
    "slug": "medanta-the-medicity-gurgaon",
    "image": "",
    "location": "Gurgaon , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Specialty"],
    "description": "Founded in 2009 by globally acclaimed cardiothoracic surgeon Dr. Naresh Trehan, Medanta – The Medicity is one of India’s largest and most respected multi-specialty medical institutes, offering a holistic range of treatments across more than 30 specialties.\n\n43-acre campus\n30+ medical specialities\n900+ doctors\n1250+ beds\n45 operation theatres\n270+ ICU beds\nJCI and NABH accreditation\nNABL accreditation",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Fortis Memorial Research Institute, Gurgaon",
    "slug": "fortis-memorial-research-institute-gurgaon",
    "image": "",
    "location": "Gurgaon , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Fortis Memorial Research Institute (FMRI), Gurgaon, is a multi-super-specialty, quaternary care hospital known for clinical excellence and cutting-edge technology.\n\nFounded in 2001\n1000+ doctors\n50 medical specialities\nA hub for advanced cancer, cardiac and neuro care\nEstablished in 2001\nJCI and NABH accreditation\nNABL accreditation",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Artemis Hospital, Gurgaon",
    "slug": "artemis-hospital-gurgaon",
    "image": "",
    "location": "Gurgaon , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Artemis Hospital is a JCI and NABH accredited hospital known for advanced multispecialty care including orthopaedics, oncology, cardiology, neurology, and transplants.\n\nFounded in 2007\n400+ beds\n11+ centres of excellence\nJCI and NABH accredited",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Max Super Speciality Hospital, Saket",
    "slug": "max-super-speciality-hospital-saket",
    "image": "",
    "location": "New Delhi , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Max Super Speciality Hospital, Saket, is one of India’s leading healthcare facilities, offering advanced treatments across multiple disciplines.\n\nFounded in 2006\n500+ beds\n35+ specialities\nJCI and NABH accredited",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "BLK-Max Super Speciality Hospital, Delhi",
    "slug": "blk-max-super-speciality-hospital-delhi",
    "image": "",
    "location": "Delhi , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "BLK-Max Super Speciality Hospital is one of the largest tertiary care hospitals with a strong reputation in oncology, cardiac sciences, and organ transplants.\n\nFounded in 1959\n650+ beds\n17 state-of-the-art modular operation theatres\nJCI and NABH accredited",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Indraprastha Apollo Hospital, Delhi",
    "slug": "indraprastha-apollo-hospital-delhi",
    "image": "",
    "location": "Delhi , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Indraprastha Apollo Hospital is a premier multi-specialty tertiary care center offering internationally benchmarked medical services.\n\nFounded in 1996\n700+ beds\n52 specialities\nThe first hospital in India to receive JCI accreditation",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Jaypee Hospital, Noida",
    "slug": "jaypee-hospital-noida",
    "image": "",
    "location": "Noida , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Jaypee Hospital is a modern multi-specialty facility offering comprehensive healthcare with advanced technologies.\n\nFounded in 2014\n1200-bed flagship hospital of Jaypee Group\nMulti-super-speciality care",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Sir Ganga Ram Hospital, Delhi",
    "slug": "sir-ganga-ram-hospital-delhi",
    "image": "",
    "location": "Delhi , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Sir Ganga Ram Hospital is a prestigious multi-specialty hospital renowned for comprehensive medical and surgical care.\n\nFounded in 1951\n675+ beds\nTop-ranked medical institute",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Aakash Healthcare Super Speciality Hospital, Delhi",
    "slug": "aakash-healthcare-super-speciality-hospital-delhi",
    "image": "",
    "location": "Delhi , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Aakash Healthcare is known for orthopaedic care along with comprehensive multi-specialty medical and surgical services.\n\nFounded in 2011\n230+ beds\nKnown for robotic surgeries",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  },
  {
    "name": "Narayana Superspeciality Hospital, Gurgaon",
    "slug": "narayana-superspeciality-hospital-gurgaon",
    "image": "",
    "location": "Gurgaon , India",
    "rating": null,
    "beds": null,
    "specialties": ["Multi Speciality"],
    "description": "Narayana Superspeciality Hospital is a NABH-accredited multi-specialty center offering advanced healthcare services.\n\nFounded in 2010\n200+ beds\nPart of Narayana Health network",
    "accreditations": [],
    "treatments": [],
    "doctors": [],
    "latitude": null,
    "longitude": null
  }
];

// (async () => {
//   try {
//     await HospitalSchema.deleteMany();
//     await HospitalSchema.insertMany(hospitals);
//     console.log("Hospital seed complete!");
//   } catch (err) {
//     console.error(err);
//   } finally {
//     // mongoose.connection.close();
//   }
// })();



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

// --- Helper: seed minimal mock data if empty ---
async function seedIfEmpty() {
    // 🔥 NEW: Seed Admin User
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
        await AdminUser.create({
            username: 'admin',
            password: 'password123' // NOTE: Use bcrypt in a real app!
        });
        console.log('Default admin user created: admin/password123');
    }
  const hCount = await Hospital.countDocuments();
  if (hCount === 0) {

    // 1️⃣ Create hospital
     await HospitalSchema.deleteMany();
    await HospitalSchema.insertMany(hospitals);

    // 2️⃣ Create treatment FIRST (doctor created later)
    const angiography = await Treatment.create({
      slug: 'angiography',   // ⭐ proper slug
      treatmentName: 'Angiography',
      category: 'Cardiology',
      description: 'Diagnostic imaging for heart arteries',
      costRange: '$300 – $600',

      treatmentNameAr: 'تصوير الأوعية الدموية',
      categoryAr: 'أمراض القلب',
      descriptionAr: 'تصوير تشخيصي لشرايين القلب',

      hospitals: [medanta._id],

      // no doctors yet → fill later
      doctors: [],

      // Example cost table
      costTable: [
        {
          name: "Angiography Test",
          description: "Standard coronary angiography",
          costFrom: 300,
          costTo: 600,
          currency: "USD"
        }
      ]
    });

    // 3️⃣ Create doctor
    const dr = await Doctor.create({
      slug: 'dr-anil-bhan',
      name: 'Dr. Anil Bhan',
      specialty: 'Cardiology',
      hospital: medanta._id,
      experience: '43+ years',
      image: '',
      isTopDoctor: true,
      position: 'Chairman',
      degree: 'MBBS, MS, MCh(CTVS)',
      about: 'Dr. Bhan is an outstanding cardiovascular surgeon...',
      medicalProblems: ['Aortic Aneurysm','Pediatric Cardiac Conditions'],
      procedures: ['Aortic Aneurysm Surgery','Pediatric Cardiac Surgery'],
      faqs: [{ question: "What is Dr. Bhan's area of expertise?", answer: 'Aortic surgery' }],
      treatments: [angiography._id]
    });

    // 4️⃣ Update treatment with doctor ID
    angiography.doctors = [dr._id];
    await angiography.save();

    // 5️⃣ Update hospital with doctor + treatment
    medanta.doctors = [dr._id];
    medanta.treatments = [angiography._id];
    await medanta.save();
  }
}


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
