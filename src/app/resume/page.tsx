import Link from "next/link";
import React from "react";

const resumeData = {
  personalInfo: {
    name: "Ashish Kumar",
    title: "Full-Stack Developer",
    location: "Ahmedabad, India",
    status: "Available for hire",
  },
  summary:
    "Passionate full-stack developer with 2.5+ years of experience creating scalable web applications and exceptional user experiences. Proven track record of collaborating with development teams, delivering complex projects, and driving technical innovation. Expert in modern JavaScript frameworks and agile methodologies.",
  experience: [
    {
      title: "SDE-1 Full-Stack Developer",
      company: "Bombay Softwares",
      location: "Ahmedabad, India",
      period: "August 2023 - Present",
      description:
        "As an SDE-1 Full-Stack Developer, I work on both frontend and backend development, building and maintaining enterprise web applications using React.js, Next.js, Node.js, and other modern technologies. I collaborate closely with cross-functional teams to deliver high-quality, scalable solutions.",
      skills: [
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
        "AWS",
        "Docker",
        "Kubernetes",
      ],
    },
    {
      title: "Full Stack Developer",
      company: "Two Dots",
      location: "Pune, India",
      period: "June 2023 - August 2023",
      description:
        "Worked as a Full Stack Developer on an agriculture-related IoT irrigation service. Developed the frontend using vanilla JavaScript and handled backend operations with Node.js, ensuring seamless integration between devices and web interface.",
      skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "Node.js",
        "MySQL",
        "IoT Integration",
      ],
    },
    {
      title: "Graduate Engineer Trainee (Full Stack Developer)",
      company: "Sterlite Technologies Ltd.",
      location: "Bengaluru, India",
      period: "October 2022 - April 2023",
      description:
        "Served as a Graduate Engineer Trainee in Full Stack Development with focus on React and Java. Contributed to a library management system, developing both frontend and backend modules using React and Spring Boot.",
      skills: [
        "React",
        "Java",
        "Spring Boot",
        "MySQL",
        "REST APIs",
        "HTML/CSS",
      ],
    },
    {
      title: "Programmer Analyst Intern",
      company: "Cognizant Technology Solutions",
      location: "Chennai, India",
      period: "June 2022 - September 2022",
      description:
        "Completed an internship gaining hands-on experience in databases, data warehouses, and ETL processes. Worked extensively with Informatica PowerCenter for data integration and transformation.",
      skills: [
        "Informatica PowerCenter",
        "SQL",
        "Data Warehousing",
        "ETL",
        "MySQL",
      ],
    },
  ],
  education: {
    degree: "Bachelor of Technology.",
    school: "SRM Institute of Science and Technology",
    location: "Chennai, India",
    period: "2018 - 2022",
    gpa: "8.8",
  },
  technicalSkills: {
    Frontend: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Bootstrap",
      "Redux",
      "Vanilla JS",
    ],
    Backend: ["Node.js", "Express.js", "REST APIs", "MongoDB", "Mongoose"],
    ["V.C/Deployment"]: ["Git", "GitHub", "Vercel Deployment"],
  },
};

function Resume() {
  return (
    <div className="theme-bg-primary min-h-screen scan-line px-4 sm:px-6 lg:px-8 relative py-16 sm:py-16 lg:py-32">
      <section className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl theme-bg-card theme-shadow resume-border theme-card-glow theme-retro-resume">
        {/* Header */}

        {/* Personal Info */}
        <div className="text-center md:mb-12 mb-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 theme-text-primary gradient-text">
            {resumeData.personalInfo.name}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl theme-text-secondary">
            {resumeData.personalInfo.title}
          </h2>
          <div className="text-sm sm:text-lg theme-text-secondary mt-2">
            {resumeData.personalInfo.location} |{" "}
            {resumeData.personalInfo.status}
          </div>
        </div>
        <div className="flex justify-center mb-6 sm:mb-8">
          <button className="retro-button theme-card-glow px-3 py-2 cursor-pointer rounded-lg font-semibold transition-all duration-200 theme-bg-accent theme-text-accent shadow-lg hover:shadow-xl">
            Download Resume
          </button>
        </div>

        {/* Summary */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 theme-text-primary">
            Professional Summary
          </h2>
          <p className="text-base sm:text-lg theme-text-secondary leading-relaxed tracking-tight">
            {resumeData.summary}
          </p>
        </div>

        {/* Experience */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 theme-text-primary">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {resumeData.experience.map((job, i) => (
              <div
                key={i}
                className="p-4 sm:p-6 rounded-xl theme-resume-card theme-shadow hover:theme-shadow-lg theme-card-glow transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold theme-text-primary">
                    {job.title}
                  </h3>
                  <span className="text-sm theme-text-secondary mt-1">
                    {job.period}
                  </span>
                </div>
                <div className="mb-2">
                  <strong className="theme-text-primary">{job.company}</strong>
                  <div className="theme-text-secondary">{job.location}</div>
                </div>
                <p className="theme-text-secondary mb-3 text-sm sm:text-base leading-relaxed tracking-tight">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 sm:px-3 py-1 rounded-full border theme-border theme-text-secondary text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="md:mb-6 mb-0 text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-0 theme-text-primary">
              Highlighted Projects
            </h2>
            <Link
              href="/projects"
              className="mb-5 md:mb-0 inline-flex items-center text-sm sm:text-md underline font-medium theme-text-primary"
              target="_blank"
            >
              View All Projects
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </Link>
          </div>

          {/* Individual Projects */}
          <div className="space-y-8">
            {[
              {
                title: "PMO Analyzer Tool",
                desc: "Built a full-fledged project & sprint tracking tool for managing agile development workflows.",
                tech: "Next.js, Node.js, TypeScript, Express, MongoDB, React TanStack Table, Recharts",
              },
              {
                title: "Firearms Training & Analytics Dashboard",
                desc: "Dashboard for shooting-practice data visualization, live tracking, and analytics for performance evaluation.",
                tech: "Next.js, TypeScript, Redux Toolkit, TanStack Table, Chart.js, CSV Parsing",
              },
              {
                title: "Fund Management Dashboard (UAE Ministry)",
                desc: "Developed bilingual fund tracking and visualization system with real-time socket updates and role-based access.",
                tech: "Next.js, TypeScript, Redux Toolkit, Recharts, CSV Parsing",
              },
              {
                title: "Zydoc — Online Doctor Appointment Booking App",
                desc: "End-to-end appointment system with payments, notifications, and analytics.",
                tech: "Next.js, Node.js, MongoDB, JWT, Razorpay, Cloudinary",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="p-4 sm:p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow"
              >
                <h3 className="text-xl sm:text-2xl font-bold theme-text-primary mb-2">
                  {p.title}
                </h3>
                <p className="theme-text-secondary mb-3 text-sm sm:text-base leading-relaxed tracking-tight">
                  {p.desc}
                </p>
                <p className="theme-text-secondary text-xs sm:text-sm">
                  <strong>Tech:</strong> {p.tech}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 theme-text-primary">
            Education
          </h2>
          <div className="p-4 sm:p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
              <h3 className="text-lg sm:text-xl font-bold theme-text-primary">
                {resumeData.education.degree}
              </h3>
              <span className="text-sm theme-text-secondary mt-1">
                {resumeData.education.period}
              </span>
            </div>
            <strong className="theme-text-primary">
              {resumeData.education.school}
            </strong>
            <div className="theme-text-secondary text-sm">
              {resumeData.education.location}
            </div>
            <p className="theme-text-secondary mt-1 text-sm">
              {resumeData.education.gpa} CGPA
            </p>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 theme-text-primary">
            Technical Skills
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(resumeData.technicalSkills).map(
              ([category, skills], idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow"
                >
                  <h3 className="text-lg sm:text-xl font-bold mb-2 theme-text-primary">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full border theme-border theme-text-secondary text-xs sm:text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 theme-text-primary">
            Certifications
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: "Next.js", issuer: "Udemy", year: "2023" },
              {
                name: "Node.js Backend Development",
                issuer: "Udemy",
                year: "2023",
              },
              { name: "MongoDB for Developers", issuer: "Udemy", year: "2023" },
              { name: "TypeScript Masterclass", issuer: "Udemy", year: "2024" },
              {
                name: "Database Design and Management",
                issuer: "Coursera (University of Michigan)",
                year: "2022",
              },
              {
                name: "Specialisation in IoT",
                issuer: "Coursera (University of Michigan)",
                year: "2022",
              },
            ].map((cert, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow"
              >
                <h3 className="text-lg sm:text-xl font-bold theme-text-primary">
                  {cert.name}
                </h3>
                <div className="theme-text-secondary text-sm">
                  {cert.issuer}
                </div>
                <div className="text-xs sm:text-sm theme-text-secondary mt-1">
                  {cert.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Resume;
