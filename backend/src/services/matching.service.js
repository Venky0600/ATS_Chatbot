const ALIASES = {
  'js': 'javascript',
  'javascript': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',
  'node': 'node.js',
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'react': 'react.js',
  'reactjs': 'react.js',
  'react.js': 'react.js',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'rest': 'rest api',
  'rest api': 'rest api',
  'gcp': 'google cloud',
  'aws': 'amazon web services'
};

const normalizeSkill = (skill) => {
  const clean = skill.trim().toLowerCase();
  return ALIASES[clean] || clean;
};

const runMatching = (resumeParsedData, jdParsedData) => {
  const resumeSkills = (resumeParsedData.skills || []).map(s => typeof s === 'string' ? s : s.name);
  const jdRequired = (jdParsedData.requiredSkills || []).map(s => typeof s === 'string' ? s : s.name);
  const jdPreferred = (jdParsedData.preferredSkills || []).map(s => typeof s === 'string' ? s : s.name);
  const allJdSkills = Array.from(new Set([...jdRequired, ...jdPreferred]));

  const matchedSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  const normalizedResumeMap = new Map();
  for (const s of resumeSkills) {
    normalizedResumeMap.set(normalizeSkill(s), s);
  }

  for (const jdSkill of allJdSkills) {
    const normJd = normalizeSkill(jdSkill);

    // Exact Match
    if (resumeSkills.some(s => s.toLowerCase() === jdSkill.toLowerCase())) {
      matchedSkills.push({
        skill: jdSkill,
        matchType: 'exact',
        confidence: 'high',
        evidence: `Directly matched "${jdSkill}" in resume.`
      });
    }
    // Normalized Match
    else if (normalizedResumeMap.has(normJd)) {
      const origResumeSkill = normalizedResumeMap.get(normJd);
      matchedSkills.push({
        skill: jdSkill,
        matchType: 'normalized',
        confidence: 'high',
        evidence: `Normalized match between "${origResumeSkill}" in resume and "${jdSkill}" in job description.`
      });
    }
    // Semantic / Partial Match
    else {
      let isPartial = false;
      for (const [normRes, origRes] of normalizedResumeMap.entries()) {
        if (normRes.includes(normJd) || normJd.includes(normRes)) {
          partialSkills.push({
            skill: jdSkill,
            matchType: 'semantic',
            confidence: 'medium',
            evidence: `Partial relevance found between "${origRes}" and "${jdSkill}".`
          });
          isPartial = true;
          break;
        }
      }

      if (!isPartial) {
        missingSkills.push({
          skill: jdSkill,
          priority: jdRequired.includes(jdSkill) ? 'high' : 'medium',
          reason: `${jdSkill} is specified in the job description but was not found in the resume.`
        });
      }
    }
  }

  return {
    matchedSkills,
    partialSkills,
    missingSkills,
    totalRequiredCount: jdRequired.length,
    matchedRequiredCount: matchedSkills.filter(m => jdRequired.includes(m.skill)).length
  };
};

module.exports = {
  runMatching,
  normalizeSkill
};
