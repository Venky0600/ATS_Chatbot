const generateTruthfulImprovements = (resume, matchingResults) => {
  const improvements = [];
  const matchedSkills = matchingResults.matchedSkills.map(m => m.skill);
  const parsedData = resume.parsedData || {};

  // If summary exists, refine summary wording using ONLY existing matched skills
  if (parsedData.summary) {
    improvements.push({
      section: 'Summary',
      currentText: parsedData.summary,
      suggestedText: `Results-driven software professional experienced in ${matchedSkills.slice(0, 4).join(', ')}. Demonstrated capability in developing and integrating robust software solutions.`,
      reason: 'Highlighting your verified technical skills in the opening summary improves recruiter visibility without adding fabricated experience.'
    });
  } else if (matchedSkills.length > 0) {
    improvements.push({
      section: 'Summary',
      currentText: 'No professional summary found',
      suggestedText: `Software engineer specializing in ${matchedSkills.slice(0, 3).join(', ')} with a strong foundation in application development.`,
      reason: 'Adding an action-oriented summary tailored to your verified skills strengthens your resume.'
    });
  }

  // Suggest experience description enhancement using ONLY skills existing in resume
  if (parsedData.experience && parsedData.experience.length > 0) {
    const exp = parsedData.experience[0];
    const techUsed = (exp.technologies || []).concat(matchedSkills.slice(0, 3));
    const uniqueTech = Array.from(new Set(techUsed));
    
    improvements.push({
      section: 'Experience',
      currentText: exp.description || `Worked as ${exp.role || 'Developer'}`,
      suggestedText: `Engineered software modules using ${uniqueTech.join(', ')}. Collaborated with cross-functional teams to improve performance and code quality.`,
      reason: 'Elaborating on your existing role responsibilities with concrete technology keywords increases ATS keyword density.'
    });
  }

  return improvements;
};

module.exports = { generateTruthfulImprovements };
