import type { Course } from "../types";

// Seeded demo catalog. The first block mirrors courses visible on the GP Academy
// landing page; the rest are plausible catalog entries per category, plus a few
// well-known free external resources. The AI may only recommend from this list.
export const COURSES: Course[] = [
  // --- GP Academy: seen on the landing page ---
  { id: "gp-network-ai", title: "Network Smarter with AI", category: "AI Essentials", provider: "GP Academy", duration: "55 min", level: "Beginner", skills: ["AI tools", "Professional networking", "LinkedIn"], free: true, source: "gp" },
  { id: "gp-photoshop-drawing", title: "Digital Drawing with Photoshop", category: "Digital Skills", provider: "GP Academy", duration: "1 hr 39 min", level: "Beginner", skills: ["Adobe Photoshop", "Digital illustration", "Graphic design"], free: true, source: "gp" },
  { id: "gp-content-writing", title: "Freelancing with Content Writing", category: "Freelancing Skill", provider: "GP Academy", duration: "5 hr 2 min", level: "Beginner", skills: ["Content writing", "SEO writing", "Freelancing", "Client communication"], free: true, source: "gp" },
  { id: "gp-capcut", title: "Video Editing with CapCut Mobile", category: "Digital Skills", provider: "GP Academy", duration: "2 hr 10 min", level: "Beginner", skills: ["Video editing", "CapCut", "Short-form content"], free: true, source: "gp" },
  { id: "gp-aptitude", title: "AI-Pro Aptitude Hacks", category: "Career Readiness", provider: "GP Academy", duration: "1 hr 20 min", level: "Beginner", skills: ["Aptitude tests", "Logical reasoning", "AI tools"], free: true, source: "gp" },
  { id: "gp-ats-cv", title: "Build ATS-Winning CV", category: "Career Readiness", provider: "GP Academy", duration: "1 hr 5 min", level: "Beginner", skills: ["CV writing", "ATS optimization", "Personal branding"], free: true, source: "gp" },

  // --- Career Readiness ---
  { id: "gp-interview", title: "Cracking the Job Interview", category: "Career Readiness", provider: "GP Academy", duration: "2 hr 30 min", level: "Beginner", skills: ["Interview skills", "Communication", "Storytelling"], free: true, source: "gp" },
  { id: "gp-personal-branding", title: "Personal Branding in the AI Era", category: "Career Readiness", provider: "GP Academy", duration: "1 hr 45 min", level: "Beginner", skills: ["Personal branding", "LinkedIn", "AI tools"], free: true, source: "gp" },
  { id: "gp-business-english", title: "English for Daily & Workplace Use", category: "Career Readiness", provider: "GP Academy × IDP Education", duration: "3 hr", level: "Beginner", skills: ["Business English", "Email writing", "Communication"], free: true, source: "gp" },
  { id: "gp-excel", title: "Excel for Professionals", category: "Career Readiness", provider: "LEAD Academy", duration: "4 hr 15 min", level: "Intermediate", skills: ["Microsoft Excel", "Data cleaning", "Pivot tables", "Dashboards"], free: true, source: "gp" },
  { id: "gp-data-analytics", title: "Data Analytics Masterclass Series", category: "Career Readiness", provider: "GP Academy", duration: "6 hr", level: "Intermediate", skills: ["Data analysis", "SQL", "Power BI", "Data storytelling"], free: true, source: "gp" },
  { id: "gp-ai-ux", title: "AI-Powered UX Design", category: "Digital Skills", provider: "GP Academy", duration: "3 hr 40 min", level: "Intermediate", skills: ["UX design", "Figma", "AI tools", "User research"], free: true, source: "gp" },

  // --- Digital Skills ---
  { id: "gp-figma-uiux", title: "UI/UX Fundamentals with Figma", category: "Digital Skills", provider: "GP Academy", duration: "5 hr 20 min", level: "Beginner", skills: ["Figma", "UI design", "Wireframing", "Prototyping"], free: true, source: "gp" },
  { id: "gp-digital-marketing", title: "Digital Marketing Essentials", category: "Digital Skills", provider: "LEAD Academy", duration: "4 hr", level: "Beginner", skills: ["Digital marketing", "Facebook ads", "SEO", "Analytics"], free: true, source: "gp" },
  { id: "gp-2d-animation", title: "2D Animation Basics", category: "Digital Skills", provider: "Animation with Shinchon", duration: "3 hr 30 min", level: "Beginner", skills: ["2D animation", "Storyboarding", "Motion design"], free: true, source: "gp" },
  { id: "gp-web-basics", title: "Web Development Foundations (HTML, CSS, JS)", category: "Digital Skills", provider: "Amar iSchool", duration: "8 hr", level: "Beginner", skills: ["HTML", "CSS", "JavaScript", "Responsive design"], free: true, source: "gp" },
  { id: "gp-python", title: "Python Programming for Beginners", category: "Digital Skills", provider: "Amar iSchool", duration: "7 hr", level: "Beginner", skills: ["Python", "Problem solving", "Automation"], free: true, source: "gp" },

  // --- Freelancing Skill ---
  { id: "gp-freelance-start", title: "Start Your Freelancing Career", category: "Freelancing Skill", provider: "CodersTrust", duration: "3 hr 15 min", level: "Beginner", skills: ["Freelancing", "Upwork/Fiverr profiles", "Client communication", "Pricing"], free: true, source: "gp" },
  { id: "gp-graphic-freelance", title: "Graphic Design for Freelancers", category: "Freelancing Skill", provider: "CodersTrust", duration: "6 hr", level: "Intermediate", skills: ["Graphic design", "Adobe Illustrator", "Branding", "Freelancing"], free: true, source: "gp" },
  { id: "gp-wordpress", title: "WordPress Website Building", category: "Freelancing Skill", provider: "CodersTrust", duration: "5 hr 30 min", level: "Beginner", skills: ["WordPress", "Web design", "Freelancing"], free: true, source: "gp" },
  { id: "gp-social-media", title: "Social Media Management", category: "Freelancing Skill", provider: "LEAD Academy", duration: "2 hr 50 min", level: "Beginner", skills: ["Social media marketing", "Content planning", "Canva"], free: true, source: "gp" },

  // --- Cisco Series ---
  { id: "gp-cisco-cyber", title: "Introduction to Cybersecurity", category: "Cisco Series", provider: "Cisco Networking Academy", duration: "6 hr", level: "Beginner", skills: ["Cybersecurity", "Network security", "Threat awareness"], free: true, source: "gp" },
  { id: "gp-cisco-networking", title: "Networking Basics", category: "Cisco Series", provider: "Cisco Networking Academy", duration: "8 hr", level: "Beginner", skills: ["Networking", "TCP/IP", "Routing basics"], free: true, source: "gp" },

  // --- Free external resources ---
  { id: "ext-fcc-rwd", title: "Responsive Web Design Certification", category: "Free Resource", provider: "freeCodeCamp", duration: "~300 hr", level: "Beginner", skills: ["HTML", "CSS", "Responsive design"], free: true, source: "external", url: "https://www.freecodecamp.org/learn" },
  { id: "ext-fcc-js", title: "JavaScript Algorithms and Data Structures", category: "Free Resource", provider: "freeCodeCamp", duration: "~300 hr", level: "Intermediate", skills: ["JavaScript", "Algorithms", "Data structures"], free: true, source: "external", url: "https://www.freecodecamp.org/learn" },
  { id: "ext-kaggle-python", title: "Kaggle Learn: Python", category: "Free Resource", provider: "Kaggle", duration: "5 hr", level: "Beginner", skills: ["Python"], free: true, source: "external", url: "https://www.kaggle.com/learn" },
  { id: "ext-kaggle-sql", title: "Kaggle Learn: Intro to SQL", category: "Free Resource", provider: "Kaggle", duration: "3 hr", level: "Beginner", skills: ["SQL", "Data analysis"], free: true, source: "external", url: "https://www.kaggle.com/learn" },
  { id: "ext-kaggle-ml", title: "Kaggle Learn: Intro to Machine Learning", category: "Free Resource", provider: "Kaggle", duration: "3 hr", level: "Intermediate", skills: ["Machine learning", "Python", "scikit-learn"], free: true, source: "external", url: "https://www.kaggle.com/learn" },
  { id: "ext-netacad", title: "Cisco NetAcad Self-Paced Courses", category: "Free Resource", provider: "Cisco Networking Academy", duration: "varies", level: "Beginner", skills: ["Networking", "Cybersecurity", "Linux", "Python"], free: true, source: "external", url: "https://www.netacad.com/" },
];

export const courseById = new Map(COURSES.map((c) => [c.id, c]));
