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
app.use(express.urlencoded({ extended: true }));



const mime = require('mime-types');
mime.types['webp'] = 'image/webp';


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

const CommentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ArticleSchema = new mongoose.Schema({
   name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // required! // This maps to TreatmentCategory → treatments.name

  // Optional: map to treatment category data
  treatmentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TreatmentCategory",
  },

  comments: [CommentSchema], // embedded comments
});

// module.exports = mongoose.model("Article", ArticleSchema);

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
const Article = mongoose.model("articles", ArticleSchema);


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


app.post("/admin/article", async (req, res) => {
  try {
    const articles = await Article.create(req.body);
    res.status(201).json({
      success: true,
      message: "Article added successfully",
      data: articles,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

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
    res.json(reviews);
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
    res.json(videos);
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
  const doctors =[];
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

app.get('/admin/seed-admin', async (req, res) => {
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
    return res.json({ message: "Admin user created successfully" });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
});


// PATCH: Update doctor image paths if missing "assets/uploads/"
app.patch("/doctors/fix-image-paths", async (req, res) => {
  try {
    const prefix = "assets/uploads/";

    // Find doctors where image does NOT start with `assets/uploads/`
    const doctorsToUpdate = await Doctor.find({
      image: { $exists: true, $ne: null },
      $expr: { $not: [{ $regexMatch: { input: "$image", regex: /^assets\/uploads\// } }] }
    });

    if (doctorsToUpdate.length === 0) {
      return res.json({ success: true, message: "All doctors already have correct image path." });
    }

    // Prepare bulk update
    const bulkOps = doctorsToUpdate.map(doc => {
      const fileName = doc.image.split("/").pop(); // keep only the filename
      const newPath = prefix + fileName;

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { image: newPath } }
        }
      };
    });

    // Execute in bulk
    const result = await Doctor.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: "Image paths updated successfully.",
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error updating doctor images:", error);
    res.status(500).json({ success: false, error: "Server error." });
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
    "image": "",
    "location": "CH Baktawar Singh Road, Islampur Colony, Sector 38, Medicity, Gurugram, Haryana 122001, Gurugram (Gurgaon), Haryana, India",
    "rating": 4.2,
    "beds": 1391,
    "specialties": "Cardiology & Cardiac Surgery, Neurosciences & Neurosurgery, Oncology (Medical, Surgical, Radiation), Gastroenterology & Hepatology, GI Surgery & Bariatric Surgery, Liver Transplant & Intestinal Transplant, Nephrology & Kidney Transplant, Orthopaedics & Joint Replacement, Pulmonology & Respiratory Medicine, Critical Care & Emergency Medicine, Endocrinology & Diabetes, Internal Medicine, Dermatology, ENT / Head & Neck Surgery, Pediatrics & Neonatology, Obstetrics & Gynaecology, Urology, Radiology & Imaging, Preventive and Lifestyle Medicine",
    "description": "Medanta – The Medicity is one of India’s largest multi-super-speciality hospitals offering advanced tertiary and quaternary care. Founded by eminent cardiac surgeon Dr. Naresh Trehan in 2009, the 43-acre facility provides comprehensive medical services across more than 30 specialties. It is a globally recognized healthcare destination for complex surgeries, transplants, and medical tourism.",
    "accreditations": ["NABH", "NABL", "JCI"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "fortis-memorial-research-institute-gurgaon",
    "name": "Fortis Memorial Research Institute, Gurgaon",
    "image": "",
    "location": "Sector 44, Opposite HUDA City Centre Metro Station, Gurugram, Haryana 122002, Gurugram, Haryana, India",
    "rating": 4.2,
    "beds": 299,
    "specialties": "Neurosciences, Neurology & Neurosurgery, Cardiac Sciences, Cardiology & CT Surgery, Oncology, Medical, Surgical & Radiation Oncology, Bone Marrow Transplant, Renal Sciences, Nephrology & Kidney Transplant, Orthopaedics & Joint Replacement, Gastroenterology & Hepatobiliary Sciences, GI Surgery & Endoscopy, Urology & Andrology, Pulmonology & Critical Care, Paediatrics, Obstetrics & Gynaecology, ENT & Head-Neck Surgery",
    "description": "Fortis Memorial Research Institute (FMRI) is a multi-super-speciality quaternary care hospital in Gurgaon, offering advanced diagnostics, complex surgeries, and comprehensive treatment across all major specialties. Known as one of India’s most technologically advanced hospitals, FMRI serves patients from more than 50 countries.",
    "accreditations": ["NABH", "NABL"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "artemis-hospital-gurgaon",
    "name": "Artemis Hospital, Gurgaon",
    "image": "",
    "location": "Sector 51, Gurugram, Haryana 122001, Gurugram, Haryana, India",
    "rating": 4.1,
    "beds": 600,
    "specialties": "Oncology (Medical, Surgical, Radiation), Neurosciences, Neurology, Neurosurgery, Spine Surgery, Cardiology, Cardiac Surgery (CTVS), Orthopaedics, Joint Replacement, Sports Medicine, Gastroenterology, GI Surgery, Hepatology, Liver Transplant, Kidney Transplant, Bone Marrow Transplant, Pulmonology, Nephrology, Urology & Andrology, Endocrinology, Internal Medicine, ENT & Head-Neck Surgery, Plastic & Cosmetic Surgery, Paediatrics & Neonatology, Obstetrics & Gynaecology, Dermatology, Ophthalmology, Radiology & Imaging",
    "description": "Artemis Hospital, established in 2007, is a JCI- and NABH-accredited multi-super-speciality hospital in Gurgaon. Known for advanced cancer care, neurology, cardiac sciences, orthopaedics, and transplants, it offers high-end medical technology and international patient support.",
    "accreditations": ["JCI", "NABH", "NABL"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "max-super-speciality-hospital-saket",
    "name": "Max Hospital – Saket West | Panchsheel Park | Saket East",
    "image": "",
    "location": "1 & 2, Press Enclave Road, Saket, New Delhi 110017, New Delhi, Delhi, India",
    "rating": 4.1,
    "beds": 539,
    "specialties": "Oncology, Medical Oncology, Surgical Oncology, Radiation Oncology, Bone Marrow Transplant, Cardiology, Cardiothoracic and Vascular Surgery, Electrophysiology, Neurology, Neurosurgery, Neurointervention, Orthopaedics, Joint Replacement, Sports Medicine, Spine Surgery, Gastroenterology, GI Surgery, Hepatology, Liver Transplant, Kidney Transplant, Pulmonology, Nephrology, Urology, Endocrinology, ENT, Obstetrics & Gynaecology, Paediatrics, Neonatology, Dermatology, Plastic & Cosmetic Surgery, Internal Medicine",
    "description": "Max Super Speciality Hospital, Saket is a leading multi-super-speciality tertiary care hospital in New Delhi, known for excellence in oncology, cardiac sciences, neurology, orthopaedics, minimally invasive surgery, and advanced organ transplant programs. Part of Max Healthcare, it offers cutting-edge technology, advanced ICU facilities, and global patient care standards.",
    "accreditations": ["NABH", "NABL"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "max-super-speciality-hospital-patparganj",
    "name": "Max Hospital – Patparganj",
    "image": "",
    "location": "108A, I.P. Extension, Opp. Sanchar Apartments, Patparganj, New Delhi 110092, New Delhi, Delhi, India",
    "rating": 4.2,
    "beds": 402,
    "specialties": "Cardiology, Interventional Cardiology, Cardiac Surgery, Oncology, Medical Oncology, Surgical Oncology, Radiation Oncology, Neurosciences, Neurology, Neurosurgery, Orthopaedics, Joint Replacement, Spine Surgery, Gastroenterology, GI Surgery, Pulmonology, Nephrology & Dialysis, Urology, Endocrinology, ENT, Obstetrics & Gynaecology, Paediatrics & Neonatology, Dermatology, Plastic Surgery, Internal Medicine",
    "description": "Max Super Speciality Hospital, Patparganj is a premier multi-speciality tertiary care hospital in East Delhi under Max Healthcare. Known for excellence in cardiac sciences, oncology, neurosciences, orthopaedics, and critical care, the hospital offers advanced technology and internationally aligned medical standards.",
    "accreditations": ["NABH", "NABL"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "amrita-hospital-faridabad",
    "name": "Amrita Hospital – Faridabad",
    "image": "",
    "location": "Mata Amritanandamayi Marg, RPS City, Sector 88, Faridabad, Haryana 121002, Faridabad, Haryana, India",
    "rating": null,
    "beds": 2600,
    "specialties": "Cardiac Sciences, Oncology, Medical Oncology, Surgical Oncology, Radiation Oncology, Neurosciences, Neurosurgery, Neuro-intervention, Gastroenterology, Hepatology, GI Surgery, Organ Transplant, Renal Sciences, Nephrology, Dialysis, Orthopaedics, Bone & Joint Surgery, Trauma Care, Pulmonology, Lung & Respiratory Medicine, Obstetrics & Gynaecology, Paediatrics & Neonatology, Physical Medicine & Rehabilitation (PMR), Radiology & Imaging, Pathology & Laboratory Services, Critical Care & ICU Services",
    "description": "Amrita Hospital, Faridabad is a world-class multi-speciality and super-speciality tertiary care hospital, part of the Amrita Hospitals network. Inaugurated in August 2022, it offers comprehensive care across 81 specialties, with 2600+ beds, state-of-the-art infrastructure, a full academic campus and a commitment to accessible, compassionate healthcare.",
    "accreditations": ["NABH"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "metro-hospital-faridabad",
    "name": "Metro Heart Institute with Multispeciality",
    "image": "",
    "location": "Sector 16A, Faridabad 121002, Haryana, India",
    "rating": null,
    "beds": 400,
    "specialties": "Cardiology, Cardiac Surgery, Interventional Cardiology, Critical Care & ICU, Neurology, Neurosurgery, Oncology, Medical Oncology, Surgical Oncology, Radiation Oncology, Orthopaedics, Joint Replacement, Spine Surgery, Gastroenterology, GI Surgery & Liver Surgery, Nephrology & Renal Transplant, Urology, Pulmonology & Respiratory Medicine, ENT, Ophthalmology, Dental Care, Obstetrics & Gynaecology, Paediatrics & Neonatology, General Medicine & Surgery, Minimally Invasive & Robotic Surgery, Rehabilitation & Physiotherapy",
    "description": "Metro Hospital, Faridabad (Metro Heart Institute with Multispeciality) is a private multi-speciality tertiary care hospital founded in 2002. Known for advanced cardiac care, multi-speciality services, and critical care facilities, it serves as a major healthcare hub in NCR, offering comprehensive services across specialties under one roof.",
    "accreditations": [],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "paras-hospital-gurgaon",
    "name": "Paras Health – Gurugram",
    "image": "",
    "location": "C-1, Sushant Lok Phase I, Sector 43, Gurugram, Haryana 122002, Gurugram, Haryana, India",
    "rating": null,
    "beds": 300,
    "specialties": "Cardiology, Interventional Cardiology, Cardio-thoracic Surgery, Neurosciences, Neurology, Neurosurgery, Oncology, Surgical Oncology, Radiation Oncology, Gastroenterology, GI & Hepato-biliary Surgery, Orthopaedics, Joint Replacement, Spine Surgery, Trauma Surgery, Nephrology, Urology & Andrology, Obstetrics & Gynaecology, Paediatrics & Neonatology, ENT, Ophthalmology, Dermatology & Cosmetology, Plastic Surgery, General Medicine, General Surgery, Critical Care / ICU, Emergency Medicine",
    "description": "Paras Hospital, Gurgaon is the flagship hospital of Paras Health. Founded in 2006, it is a NABH & NABL-accredited multi-speciality tertiary care hospital, offering over 30 standard and super-specialities under one roof. Known for advanced neurosurgery, oncology, cardiology and multi-speciality care, it combines modern infrastructure with experienced specialists to serve both domestic and international patients.",
    "accreditations": ["NABH", "NABL"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "asian-institute-of-medical-sciences-faridabad",
    "name": "Asian Institute of Medical Sciences",
    "image": "",
    "location": "Sector 21A, Badkal Flyover Road, Faridabad 121001, Faridabad, Haryana, India",
    "rating": null,
    "beds": 425,
    "specialties": "Oncology, Surgical Oncology, Radiation Oncology, Bone Marrow Transplant, Cardiac Sciences, Cardiothoracic & Vascular Surgery (CTVS), Interventional Cardiology, Neurosciences, Neurology, Neurosurgery, Urology & Kidney Transplant, Nephrology, General Surgery & Minimal Access Surgery, Critical Care & ICU Services, Emergency & Trauma, Radiology & Imaging (PET-CT, Gamma Camera, HDR Brachytherapy), Internal Medicine, Orthopaedics, Pulmonology, ENT, Ophthalmology, Paediatrics & Neonatology, Supportive Care & Palliative Care, Rehabilitation & Physiotherapy",
    "description": "Asian Institute of Medical Sciences (AIMS) is a 425-bed super-speciality tertiary care hospital in Faridabad, established in 2010. Accredited by NABH, NABL and ACCI, AIMS provides comprehensive multi-specialty and super-specialty services — including oncology, cardiac care, neurosurgery, bone-marrow transplant and advanced diagnostics — under one roof, meeting preventive, diagnostic, therapeutic, rehabilitative and palliative care needs.",
    "accreditations": ["NABH", "NABL", "ACCI"],
    "latitude": null,
    "longitude": null
  },
  {
    "slug": "manipal-hospital-dwarka-delhi",
    "name": "Manipal Comprehensive Cancer Centre – North-West Cluster",
    "image": "",
    "location": "Palam Vihar, Sector 6, Dwarka, New Delhi 110075, New Delhi, Delhi, India",
    "rating": null,
    "beds": 380,
    "specialties": "Cardiac Sciences, Interventional Cardiology, Cardio-thoracic Surgery, Neurosciences, Neurology, Neurosurgery, Oncology, Surgical Oncology, Radiation Oncology, Gastroenterology & Hepatology, GI Surgery, General & Minimal Access Surgery, Renal Sciences & Nephrology, Urology, Orthopaedics & Joint / Spine Care, Trauma & Emergency Medicine, Obstetrics & Gynaecology, Maternity & Neonatology / Paediatrics, Critical Care & ICU Services, Internal Medicine, ENT, Dermatology / Skin & Cosmetology, Plastic & Cosmetic Surgery, Physiotherapy & Rehabilitation, Diagnostic & Imaging Services",
    "description": "Manipal Hospital, Dwarka is a multi-super-speciality tertiary care hospital in Delhi, part of the Manipal Hospitals network. Equipped with advanced infrastructure, modern diagnostics, and a wide specialty range, it offers affordable, accessible and comprehensive medical services to patients across age groups and geographies.",
    "accreditations": [],
    "latitude": null,
    "longitude": null
  }
  ];

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
 * @query data=[{ "name": "...", "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/..." }, ...]
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


// 👉 GET all contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find(); // latest first
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Server error" });
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



app.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/articles/:name", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.name });

    if (!article) return res.status(404).json({ message: "Not found" });

    res.json(article);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

app.post("/articles/:slug/comments", async (req, res) => {
  try {
    const article = await Article.findOne({ name: req.params.slug });

    if (!article) return res.status(404).json({ message: "Article not found" });

    article.comments.push(req.body);
    await article.save();

    res.json(
       article.comments
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// ----------------------
//  START SERVER
// ----------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
