const Course = require('../models/course.model');
const { getInMemoryMode } = require('../config/database');

const MOCK_COURSES = [
  {
    title: 'Complete Flutter & Dart Development Course',
    provider: 'Udemy / Online Platform',
    url: 'https://www.udemy.com/course/flutter-bootcamp-with-dart/',
    skills: ['Flutter', 'Dart'],
    level: 'beginner'
  },
  {
    title: 'Docker and Kubernetes: The Complete Guide',
    provider: 'Udemy / Online Platform',
    url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/',
    skills: ['Docker', 'Kubernetes'],
    level: 'intermediate'
  },
  {
    title: 'AWS Certified Developer - Associate',
    provider: 'AWS Training & Certification',
    url: 'https://aws.amazon.com/certification/certified-developer-associate/',
    skills: ['AWS', 'Cloud'],
    level: 'intermediate'
  },
  {
    title: 'React - The Complete Guide (incl Hooks, React Router, Redux)',
    provider: 'Udemy / Online Platform',
    url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
    skills: ['React', 'React.js', 'JavaScript'],
    level: 'beginner'
  },
  {
    title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
    provider: 'Udemy / Online Platform',
    url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/',
    skills: ['Node.js', 'Express', 'MongoDB'],
    level: 'beginner'
  }
];

const generateRecommendations = async (missingSkills) => {
  const recommendations = [];

  for (const item of missingSkills) {
    const skillName = item.skill;

    // Generate learning path steps
    const learningPath = [
      `${skillName} Core Fundamentals & Syntax`,
      `Building sample mini-projects with ${skillName}`,
      `Integrating ${skillName} into end-to-end applications`,
      `Best practices, architecture & performance optimization`
    ];

    // Find course matches from DB or fallback list
    let matchedCourses = [];
    if (!getInMemoryMode()) {
      try {
        const dbCourses = await Course.find({
          skills: { $in: [new RegExp(skillName, 'i')] },
          isActive: true
        }).limit(3);
        if (dbCourses.length > 0) {
          matchedCourses = dbCourses.map(c => ({
            title: c.title,
            provider: c.provider,
            url: c.url,
            level: c.level
          }));
        }
      } catch (err) {
        // fallback
      }
    }

    if (matchedCourses.length === 0) {
      matchedCourses = MOCK_COURSES.filter(c => 
        c.skills.some(s => s.toLowerCase() === skillName.toLowerCase())
      ).map(c => ({
        title: c.title,
        provider: c.provider,
        url: c.url,
        level: c.level
      }));
    }

    if (matchedCourses.length === 0) {
      matchedCourses = [{
        title: `Mastering ${skillName}: Official Documentation & Video Tutorials`,
        provider: 'Official Resources / Community',
        url: `https://google.com/search?q=${encodeURIComponent(skillName + ' learning course')}`,
        level: 'beginner'
      }];
    }

    recommendations.push({
      skill: skillName,
      priority: item.priority || 'high',
      reason: item.reason || `Required by job description but missing in resume.`,
      learningPath,
      courses: matchedCourses
    });
  }

  return recommendations;
};

module.exports = { generateRecommendations };
