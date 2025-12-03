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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Article", ArticleSchema);

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
    "normalizedName": "medanta medicity",
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/medanta.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/fmri.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/artemis.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/max-saket.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/max-patparganj.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/amrita.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/metro.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/paras.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/asian.jpg",
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
    "image": "assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/uploads/assets/upload/assets/uploads/assets/uploads/manipal.jpg",
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

app.post("/articles", async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();

    res.json( article );
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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

app.get("/articles/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) return res.status(404).json({ message: "Not found" });

    res.json(article);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

app.post("/articles/:slug/comments", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

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
