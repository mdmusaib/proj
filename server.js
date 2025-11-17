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
  latitude: Number,
  longitude: Number,
});

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

const Hospital = mongoose.model('Hospital', HospitalSchema);
const Treatment = mongoose.model('Treatment', TreatmentSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);

// --- Helper: seed minimal mock data if empty ---
async function seedIfEmpty() {
  const hCount = await Hospital.countDocuments();
  if (hCount === 0) {

    // 1️⃣ Create hospital
    const medanta = await Hospital.create({
      slug: 'medanta-the-medicity-gurgaon',
      name: 'Medanta- The Medicity, Gurgaon',
      image: '',
      location: 'Gurgaon, India',
      rating: 4.8,
      beds: 1250,
      specialties: ['Cardiology','Oncology','Neurology','Orthopedics','Gastroenterology'],
      description: 'Medanta - The Medicity is among India’s largest and most renowned multi-super specialty healthcare centres.',
      accreditations: ['JCI','NABH'],
      latitude: 28.4595,
      longitude: 77.0266
    });

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

