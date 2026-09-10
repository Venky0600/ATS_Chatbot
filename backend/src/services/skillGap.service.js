const evaluateSkillGaps = (matchingResults) => {
  const missingSkills = matchingResults.missingSkills.map(m => ({
    skill: m.skill,
    priority: m.priority || 'high',
    reason: m.reason || `${m.skill} is specified in the job description but not evidenced in the resume.`
  }));

  const weakAreas = [];
  if (missingSkills.length > 3) {
    weakAreas.push({
      area: 'Core Technical Coverage',
      reason: `Resume is missing ${missingSkills.length} critical skills from the target job requirements.`,
      severity: 'high'
    });
  }

  if (matchingResults.partialSkills.length > 0) {
    weakAreas.push({
      area: 'Depth of Related Experience',
      reason: `Some skills (${matchingResults.partialSkills.map(p => p.skill).join(', ')}) are only partially evidenced.`,
      severity: 'medium'
    });
  }

  return {
    missingSkills,
    weakAreas
  };
};

module.exports = { evaluateSkillGaps };
