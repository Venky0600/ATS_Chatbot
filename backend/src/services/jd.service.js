const JobDescription = require('../models/jobDescription.model');
const { getInMemoryMode } = require('../config/database');

const inMemoryJDs = new Map();

const KNOWN_SKILLS = [
  'Flutter', 'Dart', 'Firebase', 'Node.js', 'Express', 'JavaScript', 'TypeScript',
  'React', 'React.js', 'Vue', 'Angular', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'REST API', 'GraphQL', 'Python',
  'Java', 'C++', 'Git', 'CI/CD', 'Linux', 'TailwindCSS', 'HTML', 'CSS'
];

const parseJdText = (text) => {
  const requiredSkills = [];
  const preferredSkills = [];
  
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      if (/nice to have|preferred|optional|bonus/i.test(text) && text.indexOf(skill) > text.search(/nice to have|preferred|optional|bonus/i)) {
        preferredSkills.push({
          name: skill,
          normalizedName: skill.toLowerCase(),
          importance: 'medium'
        });
      } else {
        requiredSkills.push({
          name: skill,
          normalizedName: skill.toLowerCase(),
          importance: 'high'
        });
      }
    }
  }

  const expYearsMatch = text.match(/(\d+)\+?\s*(?:years|yrs)\b/i);
  const minYears = expYearsMatch ? parseInt(expYearsMatch[1], 10) : 0;

  return {
    requiredSkills,
    preferredSkills,
    responsibilities: text.split(/\r?\n/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('*')).map(l => l.replace(/^[-*]\s*/, '').trim()),
    experienceRequirements: {
      minimumYears: minYears,
      description: minYears > 0 ? `${minYears}+ years experience required` : ''
    },
    educationRequirements: /degree|bachelor|master/i.test(text) ? ['Bachelor Degree in CS or related field'] : [],
    tools: requiredSkills.map(s => s.name),
    frameworks: requiredSkills.filter(s => ['Flutter', 'React', 'Vue', 'Angular', 'Express'].includes(s.name)).map(s => s.name),
    databases: requiredSkills.filter(s => ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'].includes(s.name)).map(s => s.name),
    cloudTechnologies: requiredSkills.filter(s => ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes'].includes(s.name)).map(s => s.name),
    certifications: []
  };
};

const createJobDescription = async (userId, { title, company, rawText, sourceUrl, sourceType = 'text' }) => {
  const parsedData = parseJdText(rawText);

  if (getInMemoryMode()) {
    const jd = {
      _id: 'jd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: userId.toString(),
      title,
      company: company || '',
      sourceType,
      sourceUrl: sourceUrl || '',
      rawText,
      status: 'processed',
      parsedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryJDs.set(jd._id, jd);
    return jd;
  }

  return await JobDescription.create({
    userId,
    title,
    company: company || '',
    sourceType,
    sourceUrl: sourceUrl || '',
    rawText,
    status: 'processed',
    parsedData
  });
};

const getJdsByUserId = async (userId) => {
  if (getInMemoryMode()) {
    return Array.from(inMemoryJDs.values())
      .filter(j => j.userId === userId.toString())
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  return await JobDescription.find({ userId }).sort({ createdAt: -1 });
};

const getJdById = async (id, userId) => {
  if (getInMemoryMode()) {
    const j = inMemoryJDs.get(id.toString());
    if (j && j.userId === userId.toString()) {
      return j;
    }
    return null;
  }
  return await JobDescription.findOne({ _id: id, userId });
};

const deleteJd = async (id, userId) => {
  if (getInMemoryMode()) {
    if (inMemoryJDs.has(id.toString()) && inMemoryJDs.get(id.toString()).userId === userId.toString()) {
      inMemoryJDs.delete(id.toString());
      return true;
    }
    return false;
  }
  const res = await JobDescription.deleteOne({ _id: id, userId });
  return res.deletedCount > 0;
};

module.exports = {
  createJobDescription,
  getJdsByUserId,
  getJdById,
  deleteJd,
  parseJdText
};
