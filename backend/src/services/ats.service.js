const runAtsAnalysis = (resume, jobDescription, matchingResults) => {
  const text = (resume.extractedText || '').toLowerCase();

  // Section completeness checks
  const hasSummary = /summary|profile|about/i.test(text);
  const hasSkills = /skills|technical skills|competencies/i.test(text);
  const hasExperience = /experience|employment|work history/i.test(text);
  const hasEducation = /education|academic|degree/i.test(text);
  const hasProjects = /projects|portfolio/i.test(text);

  let sectionScore = 0;
  if (hasSummary) sectionScore += 20;
  if (hasSkills) sectionScore += 25;
  if (hasExperience) sectionScore += 25;
  if (hasEducation) sectionScore += 15;
  if (hasProjects) sectionScore += 15;

  // Keyword coverage calculation
  const totalJdSkills = matchingResults.matchedSkills.length + matchingResults.missingSkills.length + matchingResults.partialSkills.length;
  const keywordCoverage = totalJdSkills > 0 
    ? Math.round((matchingResults.matchedSkills.length / totalJdSkills) * 100)
    : 70;

  // Formatting readability score
  const formattingScore = (text.length > 200 && text.length < 15000) ? 90 : 65;

  // Composite ATS Score
  const atsScore = Math.round(
    (keywordCoverage * 0.5) + (sectionScore * 0.3) + (formattingScore * 0.2)
  );

  const issues = [];
  if (!hasSummary) issues.push('Missing explicit "Summary" or "Profile" section heading.');
  if (!hasSkills) issues.push('Missing dedicated "Skills" section.');
  if (!hasExperience) issues.push('Work experience section could not be clearly identified.');
  if (matchingResults.missingSkills.length > 0) {
    issues.push(`Missing ${matchingResults.missingSkills.length} key technical terms required by the job description.`);
  }

  return {
    score: Math.min(100, Math.max(0, atsScore)),
    keywordCoverage,
    formatting: formattingScore,
    sectionCompleteness: sectionScore,
    issues
  };
};

module.exports = { runAtsAnalysis };
