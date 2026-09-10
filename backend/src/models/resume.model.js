const mongoose = require('mongoose');

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  normalizedName: { type: String },
  evidence: { type: String }
}, { _id: false });

const experienceItemSchema = new mongoose.Schema({
  company: { type: String },
  role: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
  technologies: [{ type: String }]
}, { _id: false });

const educationItemSchema = new mongoose.Schema({
  institution: { type: String },
  degree: { type: String },
  field: { type: String },
  grade: { type: String }
}, { _id: false });

const projectItemSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  technologies: [{ type: String }],
  url: { type: String }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'failed', 'deleted'],
    default: 'uploaded'
  },
  extractedText: {
    type: String,
    default: ''
  },
  parsedData: {
    personal: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    summary: { type: String, default: '' },
    skills: [skillItemSchema],
    experience: [experienceItemSchema],
    education: [educationItemSchema],
    projects: [projectItemSchema],
    certifications: [{ type: String }]
  }
}, {
  timestamps: true
});

resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
