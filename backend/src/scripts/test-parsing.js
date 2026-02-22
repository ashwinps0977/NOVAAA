const aiService = require('../services/aiService');

const sampleResumeText = `
John Doe
Software Engineer
Email: john.doe@example.com
Phone: +1 (555) 123-4567
Location: San Francisco, CA

SUMMARY
Highly motivated Software Engineer with over 5+ years of experience in building scalable web applications.
Proficient in JavaScript, React, Node.js, and Cloud Architecture.

EXPERIENCE
Lead Developer | Tech Solutions Inc. | 2020 - Present
- Developed a high-performance REST API using Express and MongoDB.
- Built a real-time dashboard with React and Socket.io.
- Implemented CI/CD pipelines using GitHub Actions and Docker.

Full Stack Developer | Web Innovators | 2018 - 2020
- Created a responsive e-commerce platform with Next.js and Tailwind CSS.
- Optimized database queries in PostgreSQL, improving performance by 30%.
- Integrated AWS S3 for secure file storage.

EDUCATION
B.Tech in Computer Science | University of Technology | 2014 - 2018

PROJECTS
Personal Portfolio Project: Built a custom portfolio using Vue.js and Firebase.
E-commerce Bot Project: Developed a Telegram bot for automated order tracking.

SKILLS
JavaScript, TypeScript, Python, React, Angular, Node.js, Express, MongoDB, PostgreSQL, AWS, Docker, Git, UI/UX Design.
`;

const sampleJobDetails = {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    skills: ["JavaScript", "React", "Node.js", "Docker", "AWS", "MongoDB"],
    requirements: "5+ years of experience in full-stack development. Proficiency in modern JavaScript frameworks.",
    experienceLevel: "5"
};

async function testParsing() {
    console.log("Starting Resume Parsing Test...");
    const result = await aiService.analyzeResume(sampleResumeText, sampleJobDetails);

    console.log("\n--- AI Analysis Results ---");
    console.log(`Overall Fit: ${result.overallScore}%`);
    console.log(`Summary: ${result.analysisSummary}`);
    console.log(`Recommendations: ${result.aiRecommendations}`);

    console.log("\n--- Score Breakdown ---");
    console.log(`Skills: ${result.scoreBreakdown.skills}/40`);
    console.log(`Experience: ${result.scoreBreakdown.experience}/35`);
    console.log(`Education: ${result.scoreBreakdown.education}/25`);
    console.log(`Projects: ${result.scoreBreakdown.projects}/10`);

    console.log("\n--- Candidate Snapshot ---");
    console.log(`Location: ${result.candidateDetails.location}`);
    console.log(`Education: ${JSON.stringify(result.candidateDetails.education, null, 2)}`);
    console.log(`Experience: ${JSON.stringify(result.candidateDetails.experience, null, 2)}`);
    console.log(`Projects: ${JSON.stringify(result.candidateDetails.projects, null, 2)}`);
    console.log(`Certifications: ${result.candidateDetails.certifications.join(", ") || "None"}`);

    console.log("\n--- Extracted Skills ---");
    console.log(result.parsedSkills.join(", "));

    console.log("\n--- Strengths ---");
    console.log(result.strengths.join("\n"));

    console.log("\n--- Gaps ---");
    if (result.gaps.length > 0) {
        console.log(result.gaps.join("\n"));
    } else {
        console.log("No gaps identified.");
    }
}

testParsing().catch(err => console.error("Test failed:", err));
