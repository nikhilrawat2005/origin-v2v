export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  eligibility: string;
  deadline: string;
  country: string;
  state?: string;
  category: "Scholarships" | "Fellowships" | "Internships" | "Conferences" | "Hackathons" | "STEM Programs";
  applyLink: string;
  requiredDocuments: string[];
  field: string;
  incomeLimit?: number; // Maximum family income allowed
  degreeLevel?: string; // High School, Bachelor, Master, PhD
}

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Google Generation Scholarship (Women in Gaming)",
    organization: "Google",
    description: "Established to help aspiring computer scientists excel in technology and become leaders in the field. Selected students will receive funding for the upcoming academic year.",
    eligibility: "Identify as a female, pursuing a computer science or gaming degree at an accredited university.",
    deadline: "2026-09-30",
    country: "United States",
    category: "Scholarships",
    applyLink: "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship/",
    requiredDocuments: ["Resume", "Academic Transcripts", "Two Letters of Recommendation", "Essay Responses"],
    field: "Computer Science",
    incomeLimit: 120000,
    degreeLevel: "Bachelor",
  },
  {
    id: "opp-2",
    title: "Grace Hopper Celebration Fellowship",
    organization: "AnitaB.org",
    description: "The GHC Fellowship program provides scholarships for students and faculty to attend the world's largest gathering of women technologists.",
    eligibility: "Must be a student enrolled in an accredited degree program or faculty at a recognized college/university.",
    deadline: "2026-08-15",
    country: "United States",
    category: "Fellowships",
    applyLink: "https://ghc.anitab.org/",
    requiredDocuments: ["Proof of Enrollment / Employment", "Statement of Purpose", "CV"],
    field: "STEM",
    incomeLimit: 75000,
    degreeLevel: "Bachelor",
  },
  {
    id: "opp-3",
    title: "Outreachy Open Source Internship",
    organization: "Outreachy",
    description: "Outreachy provides paid internships in open source to people who are subject to systemic bias or underrepresented in tech.",
    eligibility: "Internships are open to applicants internationally. Must be able to work 30 hours per week.",
    deadline: "2026-10-10",
    country: "Global",
    category: "Internships",
    applyLink: "https://www.outreachy.org/",
    requiredDocuments: ["Initial Application Essays", "Contribution Log"],
    field: "Software Engineering",
    incomeLimit: 50000,
    degreeLevel: "Bachelor",
  },
  {
    id: "opp-4",
    title: "Women in Cybersecurity (WiCyS) Annual Conference Grant",
    organization: "WiCyS",
    description: "Scholarships to attend the WiCyS annual conference, providing opportunities for mentorship, networking, and career advancement.",
    eligibility: "Active WiCyS student member or professional trying to transition to cybersecurity.",
    deadline: "2026-11-01",
    country: "Canada",
    category: "Conferences",
    applyLink: "https://www.wicys.org/events/wicys-conference/",
    requiredDocuments: ["Member ID Proof", "Personal Statement", "Professional Resume"],
    field: "Cybersecurity",
    incomeLimit: 90000,
    degreeLevel: "Master",
  },
  {
    id: "opp-5",
    title: "SheHacks International Hackathon",
    organization: "Girls in Tech",
    description: "A 48-hour global virtual hackathon dedicated to creating digital solutions that address gender inequality and empower women.",
    eligibility: "Open to all women, non-binary individuals, and allies. Teams must consist of at least 50% female members.",
    deadline: "2026-07-30",
    country: "Global",
    category: "Hackathons",
    applyLink: "https://girlsintech.org/shehacks",
    requiredDocuments: ["Team Registration details", "GitHub link"],
    field: "Computer Science",
    degreeLevel: "Bachelor",
  },
  {
    id: "opp-6",
    title: "L'Oréal-UNESCO For Women in Science Fellowship",
    organization: "UNESCO / L'Oréal Foundation",
    description: "Supports outstanding female researchers in the life and physical sciences, granting substantial research funds to doctoral and post-doctoral candidates.",
    eligibility: "Female researchers pursuing doctoral or post-doctoral research in life, physical, engineering, or mathematics fields.",
    deadline: "2026-12-15",
    country: "France",
    category: "Fellowships",
    applyLink: "https://www.forwomeninscience.com/",
    requiredDocuments: ["Research Proposal", "Recommendation Letters", "PhD confirmation", "CV"],
    field: "STEM",
    degreeLevel: "PhD",
  },
  {
    id: "opp-7",
    title: "Adobe Research Women-in-Technology Scholarship",
    organization: "Adobe",
    description: "To bring more diversity to the tech industry, Adobe awards scholarships to female university students studying computer science.",
    eligibility: "Female undergraduate or master's student studying Computer Science, Computer Engineering, or related tech fields.",
    deadline: "2026-09-01",
    country: "Global",
    category: "Scholarships",
    applyLink: "https://research.adobe.com/scholarship/",
    requiredDocuments: ["Resume", "Transcripts", "Academic reference letter", "Creative submission (video/essay)"],
    field: "Computer Science",
    incomeLimit: 150000,
    degreeLevel: "Bachelor",
  }
];
