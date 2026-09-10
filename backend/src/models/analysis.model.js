const mongoose = require('mongoose');

const scoreBreakdownSchema = new mongoose.Schema({
  overallMatch: { type: Number, required: true, min: 0, max: 100 },
  atsCompatibility: { type: Number, required: true, min: 0, max: 100 },
  skillMatch: { type: Number, default: 0, min: 0, max: 100 },
  keywordMatch: { type: Number, default: 0, min: 0, max: 100 },
  experienceMatch: { type: Number, default: 0, min: 0, max: 100 },
  educationMatch: { type: Number, default: 0, min: 0, max: 100 },
  projectRelevance: { type: Number, default: 0, min: 0, max: 100 },
  roleAlignment: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });

const matchedSkillSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  matchType: { type: String, enum: ['exact', 'normalized', 'semantic'], default: 'exact' },
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
  evidence: { type: String }
}, { _id: false });

const missingSkillSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
  reason: { type: String }
}, { _id: false });

const weakAreaSchema = new mongoose.Schema({
  area: { type: String, required: true },
  reason: { type: String },
  severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
}, { _id: false });

const improvementSchema = new mongoose.Schema({
  section: { type: String, default: 'General' },
  currentText: { type: String, required: true },
  suggestedText: { type: String, required: true },
  reason: { type: String }
}, { _id: false });

const recommendationSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
  reason: { type: String },
  learningPath: [{ type: String }],
  courses: [{
    title: { type: String },
    provider: { type: String },
    url: { type: String },
    level: { type: String }
  }]
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    index: true
  },
  jobDescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'processing'
  },
  progress: {
    type: Number,
    default: 0
  },
  scores: scoreBreakdownSchema,
  matchedSkills: [matchedSkillSchema],
  partialSkills: [matchedSkillSchema],
  missingSkills: [missingSkillSchema],
  weakAreas: [weakAreaSchema],
  atsAnalysis: {
    score: { type: Number, default: 0 },
    keywordCoverage: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    sectionCompleteness: { type: Number, default: 0 },
    issues: [{ type: String }]
  },
  improvements: [improvementSchema],
  recommendations: [recommendationSchema]
}, {
  timestamps: true
});

analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
