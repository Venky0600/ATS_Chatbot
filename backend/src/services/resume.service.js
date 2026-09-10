const Resume = require('../models/resume.model');
const { getInMemoryMode } = require('../config/database');
const { parsePdf } = require('../parsers/pdf.parser');
const { parseDocx } = require('../parsers/docx.parser');
const { parseText } = require('../parsers/text.parser');

const inMemoryResumes = new Map();

// Known skills taxonomy dictionary for parsing & extraction
const KNOWN_SKILLS = [
  'Flutter', 'Dart', 'Firebase', 'Node.js', 'Express', 'JavaScript', 'TypeScript',
  'React', 'React.js', 'Vue', 'Angular', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'REST API', 'GraphQL', 'Python',
  'Java', 'C++', 'Git', 'CI/CD', 'Linux', 'TailwindCSS', 'HTML', 'CSS'
];

const extractTextFromFile = async (buffer, mimetype, originalname) => {
  const ext = (originalname.split('.').pop() || '').toLowerCase();

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    return await parsePdf(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return await parseDocx(buffer);
  } else if (mimetype === 'text/plain' || ext === 'txt') {
    return parseText(buffer);
  } else {
    throw new Error(`Unsupported file type: ${ext || mimetype}`);
  }
};

const parseResumeText = (text) => {
  const extractedSkills = [];
  const lines = text.split(/\r?\n/);
  
  // Extract matching skills from dictionary without fabrication
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      extractedSkills.push({
        name: skill,
        normalizedName: skill.toLowerCase(),
        evidence: `Found in resume text`
      });
    }
  }

  // Basic extraction of sections if available
  const summaryMatch = text.match(/(?:summary|profile|about me)[:\s]+([^\n]+(?:\n[^\n]+){0,3})/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : '';

  // Extract experience mentions without inventing fake roles
  const experience = [];
  const expMatch = text.match(/(?:experience|work history|employment)[:\s]+([\s\S]*?)(?=(?:education|projects|skills|$))/i);
  if (expMatch && expMatch[1].trim()) {
    experience.push({
      company: 'Extracted Experience',
      role: 'Role Mentioned',
      description: expMatch[1].trim().substring(0, 300),
      technologies: extractedSkills.slice(0, 5).map(s => s.name)
    });
  }

  // Extract education mentions
  const education = [];
  if (/bachelor|master|degree|b\.s|m\.s|university|college/i.test(text)) {
    education.push({
      institution: 'Degree / Institution Mentioned',
      degree: 'Degree Program',
      field: 'Computer Science / Engineering'
    });
  }

  return {
    personal: {
      name: '',
      email: (text.match(/[\w.-]+@[\w.-]+\.\w+/) || [''])[0]
    },
    summary,
    skills: extractedSkills,
    experience,
    education,
    projects: [],
    certifications: []
  };
};

const createResume = async (userId, file) => {
  const text = await extractTextFromFile(file.buffer, file.mimetype, file.originalname);
  const parsedData = parseResumeText(text);

  if (getInMemoryMode()) {
    const resume = {
      _id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: userId.toString(),
      fileName: file.originalname,
      fileType: file.mimetype,
      fileUrl: '',
      status: 'processed',
      extractedText: text,
      parsedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryResumes.set(resume._id, resume);
    return resume;
  }

  return await Resume.create({
    userId,
    fileName: file.originalname,
    fileType: file.mimetype,
    status: 'processed',
    extractedText: text,
    parsedData
  });
};

const getResumesByUserId = async (userId) => {
  if (getInMemoryMode()) {
    return Array.from(inMemoryResumes.values())
      .filter(r => r.userId === userId.toString() && r.status !== 'deleted')
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  return await Resume.find({ userId, status: { $ne: 'deleted' } }).sort({ createdAt: -1 });
};

const getResumeById = async (id, userId) => {
  if (getInMemoryMode()) {
    const r = inMemoryResumes.get(id.toString());
    if (r && r.userId === userId.toString() && r.status !== 'deleted') {
      return r;
    }
    return null;
  }
  return await Resume.findOne({ _id: id, userId, status: { $ne: 'deleted' } });
};

const deleteResume = async (id, userId) => {
  if (getInMemoryMode()) {
    const r = inMemoryResumes.get(id.toString());
    if (r && r.userId === userId.toString()) {
      r.status = 'deleted';
      inMemoryResumes.set(id.toString(), r);
      return true;
    }
    return false;
  }
  const result = await Resume.findOneAndUpdate(
    { _id: id, userId },
    { status: 'deleted' },
    { new: true }
  );
  return !!result;
};

module.exports = {
  createResume,
  getResumesByUserId,
  getResumeById,
  deleteResume,
  parseResumeText
};
