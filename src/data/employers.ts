import type { Employer } from "../types";

// Fictional demo employers. In production these would come from Grameenphone's
// employer/partner network. The AI may only match against this list.
export const EMPLOYERS: Employer[] = [
  {
    id: "emp-nodi-labs", name: "Nodi Labs", industry: "Software / SaaS", location: "Dhaka (Hybrid)",
    about: "Builds B2B SaaS products for South Asian SMEs.",
    roles: [
      { title: "Junior Frontend Developer", type: "Full-time", skills: ["JavaScript", "React", "HTML", "CSS", "Git"] },
      { title: "QA Intern", type: "Internship", skills: ["Testing", "Attention to detail", "Communication"] },
    ],
  },
  {
    id: "emp-shishir-fintech", name: "Shishir FinTech", industry: "Fintech / Mobile payments", location: "Dhaka",
    about: "Mobile-first payments and micro-savings platform.",
    roles: [
      { title: "Data Analyst Intern", type: "Internship", skills: ["SQL", "Microsoft Excel", "Power BI", "Data analysis"] },
      { title: "Product Operations Associate", type: "Full-time", skills: ["Business English", "Microsoft Excel", "Problem solving", "Communication"] },
    ],
  },
  {
    id: "emp-dhaka-datawise", name: "Dhaka Datawise", industry: "Analytics consultancy", location: "Dhaka (Remote-friendly)",
    about: "Data and BI consulting for retail and telecom clients.",
    roles: [
      { title: "Junior Data Analyst", type: "Full-time", skills: ["SQL", "Python", "Power BI", "Data storytelling"] },
      { title: "Machine Learning Intern", type: "Internship", skills: ["Python", "Machine learning", "scikit-learn", "Statistics"] },
    ],
  },
  {
    id: "emp-ronger-haat", name: "Ronger Haat Creative", industry: "Creative agency", location: "Dhaka",
    about: "Branding, social and video content for consumer brands.",
    roles: [
      { title: "Junior Graphic Designer", type: "Full-time", skills: ["Adobe Photoshop", "Adobe Illustrator", "Branding", "Graphic design"] },
      { title: "Video Editor (Short-form)", type: "Part-time", skills: ["Video editing", "CapCut", "Short-form content", "Storytelling"] },
      { title: "Content Writer", type: "Freelance", skills: ["Content writing", "SEO writing", "Business English"] },
    ],
  },
  {
    id: "emp-brishti-commerce", name: "Brishti Commerce", industry: "E-commerce", location: "Dhaka / Chattogram",
    about: "Online marketplace for home goods and fashion.",
    roles: [
      { title: "Digital Marketing Executive", type: "Full-time", skills: ["Digital marketing", "Facebook ads", "SEO", "Analytics"] },
      { title: "Social Media Intern", type: "Internship", skills: ["Social media marketing", "Canva", "Content planning"] },
    ],
  },
  {
    id: "emp-kashful-studio", name: "Kashful Studio", industry: "Product design studio", location: "Remote (Bangladesh)",
    about: "UI/UX design studio working with international startups.",
    roles: [
      { title: "UI/UX Design Intern", type: "Internship", skills: ["Figma", "UI design", "Wireframing", "User research"] },
      { title: "Motion Designer", type: "Freelance", skills: ["2D animation", "Motion design", "Storyboarding"] },
    ],
  },
  {
    id: "emp-tarabot-textiles", name: "Tarabot Textiles", industry: "Textile & RMG", location: "Gazipur",
    about: "Export-oriented knitwear manufacturer digitizing its operations.",
    roles: [
      { title: "Management Trainee (Merchandising)", type: "Full-time", skills: ["Business English", "Microsoft Excel", "Negotiation", "Communication"] },
      { title: "Production Data Intern", type: "Internship", skills: ["Microsoft Excel", "Data analysis", "Dashboards"] },
    ],
  },
  {
    id: "emp-sobuj-agrotech", name: "Sobuj AgroTech", industry: "Agritech", location: "Rajshahi (Hybrid)",
    about: "Connects farmers to markets with a mobile app and field agents.",
    roles: [
      { title: "Field Operations Associate", type: "Full-time", skills: ["Communication", "Problem solving", "Microsoft Excel"] },
      { title: "Network Support Intern", type: "Internship", skills: ["Networking", "TCP/IP", "Troubleshooting"] },
    ],
  },
  {
    id: "emp-shapla-secure", name: "Shapla SecureNet", industry: "Cybersecurity services", location: "Dhaka",
    about: "Managed security and network services for banks and NGOs.",
    roles: [
      { title: "SOC Analyst Trainee", type: "Full-time", skills: ["Cybersecurity", "Network security", "Linux", "Networking"] },
    ],
  },
];

export const employerById = new Map(EMPLOYERS.map((e) => [e.id, e]));
