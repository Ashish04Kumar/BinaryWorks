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
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2024",
    },
    {
      name: "Google Cloud Professional Developer",
      issuer: "Google Cloud",
      year: "2023",
    },
    {
      name: "Certified Kubernetes Administrator",
      issuer: "CNCF",
      year: "2023",
    },
    { name: "React Developer Certification", issuer: "Meta", year: "2022" },
  ],
};

function Resume() {
  return (
    <div className="theme-bg-primary min-h-screen scan-line px-4 sm:px-6 lg:px-8 relative py-20 lg:py-32 theme-bg-primary scan-line ">
      <section className="max-w-4xl mx-auto  p-8 rounded-xl theme-bg-card theme-shadow resume-border theme-shadow retro-border theme-card-glow theme-retro-resume">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <button
            className={`retro-button theme-card-glow px-3 py-2 cursor-pointer rounded-lg font-semibold transition-all duration-200 theme-bg-accent theme-text-accent shadow-lg hover:shadow-xl`}
          >
            Download Resume
          </button>
        </div>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary gradient-text">
            {resumeData.personalInfo.name}
          </h1>
          <h2 className="text-xl md:text-2xl theme-text-secondary">
            {resumeData.personalInfo.title}
          </h2>
          <div className="text-lg theme-text-secondary mt-2">
            {resumeData.personalInfo.location} |{" "}
            {resumeData.personalInfo.status}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-6 theme-text-primary">
            Professional Summary
          </h2>
          <p className="text-lg theme-text-secondary leading-relaxed">
            {resumeData.summary}
          </p>
        </div>

        {/* Experience */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 theme-text-primary">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {resumeData.experience.map((job, i) => (
              <div
                key={i}
                className="p-6 rounded-xl theme-resume-card theme-shadow hover:theme-shadow-lg theme-card-glow transition-all duration-300"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold theme-text-primary">
                    {job.title}
                  </h3>
                  <span className="text-sm theme-text-secondary">
                    {job.period}
                  </span>
                </div>
                <div className="mb-2">
                  <strong className="theme-text-primary">{job.company}</strong>
                  <div className="theme-text-secondary">{job.location}</div>
                </div>
                <p className="theme-text-secondary mb-3">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 rounded-full border theme-border theme-text-secondary text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Highlighted Projects */}
        <div className="mb-16">
          <div className="flex justify-between">
            <h2 className="text-4xl font-bold mb-8 theme-text-primary">
              Highlighted Projects
            </h2>
            <Link
              href="/projects"
              className="inline-flex items-center mt-2 md:mt-0 text-md underline font-medium theme-text-primary"
              target="_blank"
            >
              View All Projects
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </Link>
          </div>

          <div className="space-y-8">
            {/* PMOFY */}
            <div className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow">
              <h3 className="text-2xl font-bold theme-text-primary mb-2">
                PMO Analyzer Tool
              </h3>
              <p className="theme-text-secondary mb-3">
                Built a full-fledged project & sprint tracking tool for managing
                agile development workflows.
              </p>
              <ul className="list-disc list-inside theme-text-secondary mb-3">
                <li>
                  Developed CSV-based import/export, real-time progress
                  visualization, and interactive charts for project analytics.
                </li>
                <li>
                  Designed and implemented modular backend architecture with
                  Express and MongoDB.
                </li>
                <li>
                  Integrated complex filtering, editing, and data visualization
                  features in the frontend using React and TanStack Table.
                </li>
              </ul>
              <p className="theme-text-secondary text-sm mb-2">
                <strong>Tech:</strong> Next.js, Node.js, TypeScript, Express,
                MongoDB, React TanStack Table, Recharts
              </p>
              {/* <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Live Project
              </a> */}
            </div>

            {/* Frass */}
            <div className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow">
              <h3 className="text-2xl font-bold theme-text-primary mb-2">
                Firearms Training & Analytics Dashboard
              </h3>
              <p className="theme-text-secondary mb-3">
                Central School of Weapons & Tactics shooting-practice project —
                web dashboard with range visualization that records shots,
                predicts accuracy using a dummy model, and provides real-time
                analytics. Features include top-shooter leaderboards, round/game
                modes, individual performance cards, and visual charts to make
                target practice measurable and engaging.
              </p>
              <ul className="list-disc list-inside theme-text-secondary mb-3">
                <li>
                  Main dashboard with region-wise performance, session counts,
                  and active training programs.
                </li>
                <li>
                  Secondary dashboards with detailed individual and team
                  performance analytics.
                </li>
                <li>
                  Session management including pre-session setup, real-time
                  tracking, and post-session analysis.
                </li>
                <li>
                  Live session camera view and historical records for evaluating
                  performance trends.
                </li>
              </ul>
              <p className="theme-text-secondary text-sm mb-2">
                <strong>Tech:</strong> Next.js, TypeScript, Redux Toolkit, React
                TanStack Table, Recharts / Chart.js, CSV Parsing
              </p>
              {/* <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Live Project
              </a> */}
            </div>

            {/* Zakaa */}
            <div className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow">
              <h3 className="text-2xl font-bold theme-text-primary mb-2">
                Fund Management Dashboard for U.A.E Ministry of Gov.
              </h3>
              <p className="theme-text-secondary mb-3">
                A comprehensive fund allocation and monitoring platform
                developed for a UAE government initiative supporting both{" "}
                <strong>Arabic and English</strong> languages. It streamlines
                the approval and distribution of government funds across
                multiple ministries, departments, and sectors. Decision-makers
                can track budget allocations and ensure transparency and
                accountability throughout the fund distribution process.
              </p>
              <ul className="list-disc list-inside theme-text-secondary mb-3">
                <li>
                  Developed bilingual enterprise dashboards for admin and
                  ministry users with real-time data visualization using
                  Recharts.
                </li>
                <li>
                  Implemented role-based access, file attachments, inline table
                  editing with TanStack Table, and audit trails.
                </li>
                <li>
                  Live budget tracker using Socket.io and interactive reporting
                  for transparent monitoring.
                </li>
                <li>
                  Managed programs, contracts, and financial data with
                  structured tables and CSV export.
                </li>
              </ul>
              <p className="theme-text-secondary text-sm mb-2">
                <strong>Tech:</strong> Next.js, TypeScript, Redux Toolkit, React
                TanStack Table, Recharts / Chart.js, CSV Parsing
              </p>
              {/* <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Live Project
              </a> */}
            </div>

            {/* Zydoc */}
            <div className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow">
              <h3 className="text-2xl font-bold theme-text-primary mb-2">
                Zydoc — Online Doctor Appointment Booking App
              </h3>
              <p className="theme-text-secondary mb-3">
                A full-featured e-commerce solution with real-time inventory
                management, payment processing, and analytics dashboard. Built
                with scalability and performance in mind.
              </p>
              <ul className="list-disc list-inside theme-text-secondary mb-3">
                <li>
                  Real-time doctor appointment booking with slot management and
                  notifications for patients and doctors.
                </li>
                <li>
                  Developed frontend and backend integration with MongoDB,
                  Node.js, and JWT-based authentication.
                </li>
                <li>
                  Implemented Razorpay payment gateway for secure transactions.
                </li>
                <li>
                  Cloudinary integration for media management and real-time
                  analytics dashboards.
                </li>
              </ul>
              <p className="theme-text-secondary text-sm">
                <strong>Tech:</strong> Next.js, Node.js, Mongo DB, Mongoose,
                JWT, Razorpay Payment Gateway, Cloudinary
              </p>
              {/* <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Live Project
              </a> */}
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 theme-text-primary">
            Education
          </h2>
          <div className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow">
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-bold theme-text-primary">
                {resumeData.education.degree}
              </h3>
              <span className="text-sm theme-text-secondary">
                {resumeData.education.period}
              </span>
            </div>
            <div className="mb-2">
              <strong className="theme-text-primary">
                {resumeData.education.school}
              </strong>
              <div className="theme-text-secondary">
                {resumeData.education.location}
              </div>
            </div>
            <p className="theme-text-secondary">
              {resumeData.education.gpa} CGPA
            </p>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 theme-text-primary">
            Technical Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(resumeData.technicalSkills).map(
              ([category, skills], idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow"
                >
                  <h3 className="text-xl font-bold mb-3 theme-text-primary">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full border theme-border theme-text-secondary text-sm"
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
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 theme-text-primary">
            Certifications
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Next.js",
                issuer: "Udemy",
                year: "2023",
              },
              {
                name: "Node.js Backend Development",
                issuer: "Udemy",
                year: "2023",
              },
              {
                name: "MongoDB for Developers",
                issuer: "Udemy",
                year: "2023",
              },
              {
                name: "TypeScript Masterclass",
                issuer: "Udemy",
                year: "2024",
              },
              {
                name: "Database Design and Management",
                issuer: "Coursera (University of Michigan)",
                year: "2022",
              },
              {
                name: "Specialisation in IOT",
                issuer: "Coursera",
                year: "2022",
              },
            ].map((cert, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl theme-resume-card theme-shadow theme-card-glow"
              >
                <h3 className="text-xl font-bold theme-text-primary">
                  {cert.name}
                </h3>
                <div className="theme-text-secondary">{cert.issuer}</div>
                <div className="text-sm theme-text-secondary">{cert.year}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Resume;
