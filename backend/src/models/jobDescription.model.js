const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  normalizedName: { type: String },
  importance: { type: String, enum: ['high', 'medium', 'low'], default: 'high' }
}, { _id: false });

const jobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    default: '',
    trim: true
  },
  sourceType: {
    type: String,
    enum: ['text', 'file', 'url'],
    default: 'text'
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  rawText: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'processed', 'failed'],
    default: 'processed'
  },
  parsedData: {
    requiredSkills: [requiredSkillSchema],
    preferredSkills: [requiredSkillSchema],
    responsibilities: [{ type: String }],
    experienceRequirements: {
      minimumYears: { type: Number, default: 0 },
      description: { type: String, default: '' }
    },
    educationRequirements: [{ type: String }],
    tools: [{ type: String }],
    frameworks: [{ type: String }],
    databases: [{ type: String }],
    cloudTechnologies: [{ type: String }],
    certifications: [{ type: String }],
    role: { type: String, default: '' },
    seniority: { type: String, default: '' }
  }
}, {
  timestamps: true
});

jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
