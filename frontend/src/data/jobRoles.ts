export interface JobRole {
    title: string;
    department: string;
    description: string;
    requirements: string;
    salaryRange: string;
    experienceLevel: string;
}

export const jobRoles: Record<string, JobRole> = {
    // --- 1. Software Development / Engineering ---
    "Frontend Developer": {
        title: "Frontend Developer",
        department: "Engineering",
        description: "Build and maintain responsive web applications using HTML, CSS, and modern JS frameworks like React, Angular, or Vue. Optimize applications for maximum speed and scalability.",
        requirements: "Proficient in React/Vue/Angular, HTML5, CSS3, and JavaScript. Experience with responsive design and cross-browser compatibility.",
        salaryRange: "$80,000 - $135,000",
        experienceLevel: "mid"
    },
    "Backend Developer": {
        title: "Backend Developer",
        department: "Engineering",
        description: "Work on server-side logic, databases, and APIs using Node.js, Java, Python, or .NET. Ensure high performance and responsiveness to requests from the frontend.",
        requirements: "Strong proficiency in Node.js, Python, or Java. Experience with SQL/NoSQL databases and RESTful API design.",
        salaryRange: "$85,000 - $145,000",
        experienceLevel: "mid"
    },
    "Full Stack Developer": {
        title: "Full Stack Developer",
        department: "Engineering",
        description: "Handle both frontend and backend development. Design end-to-end software solutions and manage the entire web development stack.",
        requirements: "Proficiency in both frontend frameworks (React) and backend languages (Node.js). Strong understanding of database management and system architecture.",
        salaryRange: "$100,000 - $160,000",
        experienceLevel: "senior"
    },
    "Mobile App Developer": {
        title: "Mobile App Developer",
        department: "Engineering",
        description: "Specializes in developing high-quality applications for iOS and Android platforms using native or cross-platform frameworks.",
        requirements: "Experience with React Native, Flutter, Swift, or Kotlin. Understanding of mobile app design patterns and performance optimization.",
        salaryRange: "$85,000 - $140,000",
        experienceLevel: "mid"
    },
    "DevOps Engineer": {
        title: "DevOps Engineer",
        department: "Engineering",
        description: "Manages CI/CD pipelines, automation, and cloud infrastructure on AWS, Azure, or GCP. Bridges the gap between development and operations.",
        requirements: "Experience with Docker, Kubernetes, and CI/CD tools. Proficiency in cloud platforms (AWS/Azure/GCP) and infrastructure as code (Terraform).",
        salaryRange: "$110,000 - $170,000",
        experienceLevel: "senior"
    },
    "Software Architect": {
        title: "Software Architect",
        department: "Engineering",
        description: "Designs the overall software structure and makes high-level technology stack decisions to ensure scalability and reliability.",
        requirements: "Deep expertise in software design patterns and system architecture. 10+ years of engineering experience with proven leadership skills.",
        salaryRange: "$160,000 - $230,000",
        experienceLevel: "lead"
    },
    "Embedded Systems Engineer": {
        title: "Embedded Systems Engineer",
        department: "Engineering",
        description: "Develops software and firmware for hardware systems and microcontrollers. Optimizes code for resource-constrained environments.",
        requirements: "Expertise in C/C++, assembly, and RTOS. Knowledge of hardware protocols (I2C, SPI, UART).",
        salaryRange: "$95,000 - $155,000",
        experienceLevel: "senior"
    },

    // --- 2. Quality Assurance / Testing ---
    "QA Analyst / Tester": {
        title: "QA Analyst / Tester",
        department: "Engineering",
        description: "Tests software for defects, usability, and performance issues. Ensures the product meets quality standards before release.",
        requirements: "Strong analytical skills and attention to detail. Experience with manual testing and bug tracking tools like Jira.",
        salaryRange: "$60,000 - $100,000",
        experienceLevel: "entry"
    },
    "Automation Tester": {
        title: "Automation Tester",
        department: "Engineering",
        description: "Creates and maintains scripts to automate repetitive testing tasks, improving efficiency and coverage.",
        requirements: "Proficiency in Selenium, Cypress, or Playwright. Knowledge of at least one programming language (JavaScript/Python/Java).",
        salaryRange: "$85,000 - $135,000",
        experienceLevel: "mid"
    },
    "Performance / Load Tester": {
        title: "Performance / Load Tester",
        department: "Engineering",
        description: "Checks system scalability and performance under heavy load. Identifies bottlenecks and suggests optimizations.",
        requirements: "Expertise in load testing tools (JMeter, LoadRunner, K6). Understanding of server performance metrics.",
        salaryRange: "$90,000 - $150,000",
        experienceLevel: "senior"
    },
    "Security Tester / Ethical Hacker": {
        title: "Security Tester / Ethical Hacker",
        department: "Operations",
        description: "Conducts penetration testing and vulnerability assessments to identify and patch security weaknesses.",
        requirements: "Relevant certifications (CEH, OSCP). Deep knowledge of network security and web application vulnerabilities.",
        salaryRange: "$115,000 - $185,000",
        experienceLevel: "senior"
    },

    // --- 3. IT Infrastructure / Systems ---
    "System Administrator": {
        title: "System Administrator",
        department: "Operations",
        description: "Manages servers, operating systems, and overall IT resources to ensure system stability and security.",
        requirements: "Experience in Linux/Windows server administration. Knowledge of virtualization and backup solutions.",
        salaryRange: "$75,000 - $125,000",
        experienceLevel: "mid"
    },
    "Network Administrator": {
        title: "Network Administrator",
        department: "Operations",
        description: "Maintains network infrastructure, including switches, routers, and firewalls, to ensure constant connectivity.",
        requirements: "CCNA/CCNP certification. Experience with network protocols and hardware management.",
        salaryRange: "$80,000 - $130,000",
        experienceLevel: "mid"
    },
    "Cloud Engineer": {
        title: "Cloud Engineer",
        department: "Engineering",
        description: "Handles cloud architecture and solutions (AWS, Azure, GCP). Implements and maintains cloud-based services.",
        requirements: "Cloud certification (AWS/Azure). Experience with cloud native services and cloud security.",
        salaryRange: "$105,000 - $165,000",
        experienceLevel: "senior"
    },
    "Database Administrator (DBA)": {
        title: "Database Administrator (DBA)",
        department: "Operations",
        description: "Manages and maintains databases (Oracle, MySQL, SQL Server) to ensure data integrity, security, and performance.",
        requirements: "Expert knowledge of SQL. Experience with database tuning, backups, and disaster recovery.",
        salaryRange: "$90,000 - $145,000",
        experienceLevel: "mid"
    },
    "IT Support / Helpdesk": {
        title: "IT Support / Helpdesk",
        department: "Operations",
        description: "Provides first-level support for hardware and software issues. Assists employees with technical problems.",
        requirements: "Basic IT troubleshooting skills. Excellent communication and patient customer service.",
        salaryRange: "$45,000 - $75,000",
        experienceLevel: "entry"
    },
    "Site Reliability Engineer (SRE)": {
        title: "Site Reliability Engineer (SRE)",
        department: "Engineering",
        description: "Ensures system reliability and uptime by applying software engineering practices to infrastructure and operations.",
        requirements: "Strong programming background and experience with infrastructure automation. Knowledge of monitoring and observability.",
        salaryRange: "$120,000 - $180,000",
        experienceLevel: "senior"
    },

    // --- 4. Data & Analytics ---
    "Data Analyst": {
        title: "Data Analyst",
        department: "Data & Analytics",
        description: "Interprets complex datasets and creates visualizations to provide actionable insights for business decisions.",
        requirements: "Proficiency in SQL, Excel, and visualization tools (Tableau/Power BI). Strong analytical thinking.",
        salaryRange: "$65,000 - $110,000",
        experienceLevel: "mid"
    },
    "Data Scientist": {
        title: "Data Scientist",
        department: "Data & Analytics",
        description: "Builds predictive models and applies machine learning algorithms to solve business problems and identify patterns.",
        requirements: "Proficiency in Python/R. Strong background in statistics and machine learning frameworks.",
        salaryRange: "$110,000 - $175,000",
        experienceLevel: "senior"
    },
    "Data Engineer": {
        title: "Data Engineer",
        department: "Data & Analytics",
        description: "Designs and maintains scalable data pipelines and ETL processes to ensure data availability and quality.",
        requirements: "Knowledge of Big Data technologies (Hadoop, Spark). Experience with data warehousing and pipeline orchestration.",
        salaryRange: "$100,000 - $165,000",
        experienceLevel: "senior"
    },
    "BI Developer": {
        title: "BI Developer",
        department: "Data & Analytics",
        description: "Develops dashboards and business intelligence reports to help stakeholders track performance and metrics.",
        requirements: "Expertise in BI tools (PowerBI, Looker). Strong understanding of data modeling and warehousing.",
        salaryRange: "$85,000 - $140,000",
        experienceLevel: "mid"
    },

    // --- 5. Security & Compliance ---
    "Cybersecurity Analyst": {
        title: "Cybersecurity Analyst",
        department: "Operations",
        description: "Monitors and protects systems from cyber attacks. Conducts audits and manages security software.",
        requirements: "CompTIA Security+ or similar. Experience with threat monitoring and incident response.",
        salaryRange: "$95,000 - $155,000",
        experienceLevel: "mid"
    },
    "Security Architect": {
        title: "Security Architect",
        department: "Operations",
        description: "Designs secure IT systems and develops security standards and policies across the organization.",
        requirements: "10+ years in IT security. Proven ability to design zero-trust architectures.",
        salaryRange: "$150,000 - $220,000",
        experienceLevel: "lead"
    },
    "Compliance Officer / Risk Analyst": {
        title: "Compliance Officer / Risk Analyst",
        department: "Human Resources",
        description: "Ensures regulatory compliance with standards like GDPR, ISO, and HIPAA. Evaluates IT risks.",
        requirements: "Knowledge of IT compliance frameworks and laws. Experience in risk assessment and auditing.",
        salaryRange: "$85,000 - $135,000",
        experienceLevel: "mid"
    },

    // --- 6. Project & Product Management ---
    "Project Manager": {
        title: "Project Manager",
        department: "Product",
        description: "Oversees project delivery, timelines, and resource allocation. Ensures projects are completed on time and in scope.",
        requirements: "PMP certification preferred. Strong organizational and leadership skills.",
        salaryRange: "$90,000 - $155,000",
        experienceLevel: "senior"
    },
    "Scrum Master": {
        title: "Scrum Master",
        department: "Product",
        description: "Facilitates Agile processes and helps development squads follow Scrum principles. Removes blockers for the team.",
        requirements: "CSM certification. Deep understanding of Agile methodology and conflict resolution.",
        salaryRange: "$85,000 - $140,000",
        experienceLevel: "mid"
    },
    "Product Manager": {
        title: "Product Manager",
        department: "Product",
        description: "Defines the product strategy and roadmap. Bridges the gap between customers, business, and engineering.",
        requirements: "Strong product sense and analytical skills. Experience with product discovery and lifecycle management.",
        salaryRange: "$110,000 - $180,000",
        experienceLevel: "senior"
    },
    "Business Analyst (BA)": {
        title: "Business Analyst (BA)",
        department: "Product",
        description: "Gathers business requirements and translates them into technical specifications for the IT team.",
        requirements: "Excellent communication and documentation skills. Ability to bridge business needs with technical solutions.",
        salaryRange: "$75,000 - $125,000",
        experienceLevel: "mid"
    },

    // --- 7. UX / Design ---
    "UI/UX Designer": {
        title: "UI/UX Designer",
        department: "Design",
        description: "Designs intuitive interfaces and user experiences. Conducts user research and creates high-fidelity prototypes.",
        requirements: "Proficiency in Figma. Solid understanding of user-centered design principles.",
        salaryRange: "$80,000 - $135,000",
        experienceLevel: "mid"
    },
    "Graphic Designer": {
        title: "Graphic Designer",
        department: "Design",
        description: "Creates visual graphics and branding materials for digital and print media.",
        requirements: "Expertise in Adobe Creative Suite. Strong portfolio showing creative diversity.",
        salaryRange: "$55,000 - $95,000",
        experienceLevel: "entry"
    },
    "Interaction Designer": {
        title: "Interaction Designer",
        department: "Design",
        description: "Focuses on how users interact with products, ensuring high accessibility and smooth animations.",
        requirements: "Skills in motion design and accessibility standards (WCAG). Proficiency in prototyping tools.",
        salaryRange: "$85,000 - $140,000",
        experienceLevel: "mid"
    },

    // --- 8. IT Sales / Marketing / Customer Engagement ---
    "Technical Sales Engineer": {
        title: "Technical Sales Engineer",
        department: "Sales",
        description: "Explains technical products to clients and helps close deals by demonstrating value through a technical lens.",
        requirements: "Combination of technical knowledge and sales aptitude. Strong presentation and relationship skills.",
        salaryRange: "$90,000 - $160,000",
        experienceLevel: "mid"
    },
    "Customer Success Manager (CSM)": {
        title: "Customer Success Manager (CSM)",
        department: "Operations",
        description: "Ensures product adoption and long-term customer satisfaction. Acts as a liaison between customers and product teams.",
        requirements: "Strong empathy and problem-solving skills. Experience in client-facing roles in the tech industry.",
        salaryRange: "$80,000 - $130,000",
        experienceLevel: "mid"
    },

    // --- 9. Emerging Technologies / Specialized Roles ---
    "AI / Machine Learning Engineer": {
        title: "AI / Machine Learning Engineer",
        department: "Engineering",
        description: "Builds ML models and AI applications. Implements deep learning and NLP algorithms in production.",
        requirements: "Masters in CS or related field. Expertise in Python and frameworks like PyTorch or TensorFlow.",
        salaryRange: "$135,000 - $210,000",
        experienceLevel: "senior"
    },
    "Blockchain Developer": {
        title: "Blockchain Developer",
        department: "Engineering",
        description: "Designs blockchain-based solutions, smart contracts, and decentralized applications (DApps).",
        requirements: "Knowledge of Solidity, Rust, and cryptography and consensus mechanisms.",
        salaryRange: "$120,000 - $190,000",
        experienceLevel: "senior"
    },
    "IoT Engineer": {
        title: "IoT Engineer",
        department: "Engineering",
        description: "Develops connected devices and IoT applications. Integrates hardware sensors with cloud services.",
        requirements: "Skills in embedded systems, wireless protocols, and cloud IoT hubs.",
        salaryRange: "$95,000 - $155,000",
        experienceLevel: "mid"
    },
    "AR/VR Developer": {
        title: "AR/VR Developer",
        department: "Engineering",
        description: "Works on augmented and virtual reality solutions for training, simulation, or entertainment.",
        requirements: "Proficiency in Unity or Unreal Engine. Understanding of 3D modeling and spatial computing.",
        salaryRange: "$100,000 - $165,000",
        experienceLevel: "mid"
    },
    "RPA Developer": {
        title: "RPA Developer",
        department: "Engineering",
        description: "Implements robotic process automation to streamline business tasks and reduce manual labor.",
        requirements: "Experience with RPA tools like UiPath or Blue Prism. Strong logical thinking skills.",
        salaryRange: "$85,000 - $135,000",
        experienceLevel: "mid"
    },

    // --- 10. Executive & Leadership ---
    "CIO": {
        title: "CIO",
        department: "Human Resources",
        description: "Overall IT strategy and management for the organization. Leads digital transformation initiatives.",
        requirements: "15+ years of IT leadership. MBA or Master's in IT preferred.",
        salaryRange: "$250,000 - $450,000",
        experienceLevel: "lead"
    },
    "CTO": {
        title: "CTO",
        department: "Human Resources",
        description: "Drives technology vision and innovation. Oversees R&D and ensures technical excellence across product lines.",
        requirements: "Proven track record as a technical visionary. Strong leadership and communication skills.",
        salaryRange: "$200,000 - $400,000",
        experienceLevel: "lead"
    },
    "IT Director": {
        title: "IT Director",
        department: "Operations",
        description: "Manages IT departments and operations. Responsible for budgeting, infrastructure, and team leadership.",
        requirements: "Senior leadership experience. Strong grasp of IT service management and operations.",
        salaryRange: "$140,000 - $220,000",
        experienceLevel: "lead"
    },
    "Technical Lead / Team Lead": {
        title: "Technical Lead",
        department: "Engineering",
        description: "Guides development teams and critical technical decisions. Mentors engineers and ensures code quality.",
        requirements: "Lead-level experience in software development. Strong people management skills blended with technical depth.",
        salaryRange: "$145,000 - $195,000",
        experienceLevel: "lead"
    },

    // --- 11. Other Supporting Roles ---
    "Technical Writer": {
        title: "Technical Writer",
        department: "Operations",
        description: "Creates manuals, documentation, and help guides to explain technical systems to users and developers.",
        requirements: "Exceptional writing skills. Ability to translate technical jargon into clear, concise language.",
        salaryRange: "$70,000 - $115,000",
        experienceLevel: "mid"
    },
    "IT Trainer": {
        title: "IT Trainer",
        department: "Human Resources",
        description: "Provides training on software, tools, and best practices to ensure employee productivity and software mastery.",
        requirements: "Strong background in educational techniques and deep knowledge of organizational tools.",
        salaryRange: "$65,000 - $110,000",
        experienceLevel: "mid"
    },
    "Operations Analyst": {
        title: "Operations Analyst",
        department: "Operations",
        description: "Optimizes IT processes and workflows to improve efficiency and reduce operational costs.",
        requirements: "Data-driven approach to process improvement. Experience with Lean or Six Sigma.",
        salaryRange: "$75,000 - $120,000",
        experienceLevel: "mid"
    },
    "Change Manager": {
        title: "Change Manager",
        department: "Operations",
        description: "Manages IT change and deployment processes to minimize disruption and ensure successful system updates.",
        requirements: "Experience in ITIL change management practices. Strong risk assessment skills.",
        salaryRange: "$85,000 - $140,000",
        experienceLevel: "mid"
    }
};
