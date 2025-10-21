import { Briefcase, GraduationCap, Award, Download } from "lucide-react";

const Resume = () => {
  const experience = [
    {
      title: "Senior Full-Stack Developer",
      company: "Tech Innovations Inc.",
      period: "2022 - Present",
      description:
        "Leading development of enterprise-scale applications serving 100K+ users. Architecting scalable microservices, mentoring junior developers, and implementing best practices across the engineering team.",
      achievements: [
        "Reduced API response time by 60% through optimization",
        "Led migration to microservices architecture",
        "Mentored team of 5 junior developers",
        "Implemented CI/CD pipeline reducing deployment time by 80%",
      ],
    },
    {
      title: "Full-Stack Developer",
      company: "Digital Solutions Corp",
      period: "2020 - 2022",
      description:
        "Developed and maintained multiple client-facing web applications using React, Node.js, and PostgreSQL. Collaborated with designers and product managers to deliver exceptional user experiences.",
      achievements: [
        "Built 15+ production-ready web applications",
        "Improved application performance by 45%",
        "Implemented real-time features using WebSocket",
        "Reduced bug rate by 35% through comprehensive testing",
      ],
    },
    {
      title: "Junior Developer",
      company: "StartupHub",
      period: "2019 - 2020",
      description:
        "Contributed to various projects in a fast-paced startup environment. Gained experience in rapid prototyping, agile methodologies, and full-stack development.",
      achievements: [
        "Developed responsive UIs for mobile and desktop",
        "Integrated third-party APIs and payment systems",
        "Participated in code reviews and pair programming",
        "Maintained 98% code coverage through testing",
      ],
    },
  ];

  const education = [
    {
      degree: "Bachelor of Technology in Computer Science",
      institution: "Indian Institute of Technology",
      period: "2015 - 2019",
      description:
        "Specialized in software engineering and algorithms. Graduated with honors.",
    },
  ];

  const certifications = [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2023",
    },
    {
      name: "Google Cloud Professional Developer",
      issuer: "Google Cloud",
      year: "2022",
    },
    {
      name: "MongoDB Certified Developer",
      issuer: "MongoDB University",
      year: "2021",
    },
  ];

  return (
    <div className="theme-bg-primary min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex justify-between items-start scan-line">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 theme-text-primary gradient-text">
              Resume
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl">
              A comprehensive overview of my professional experience, education,
              and certifications.
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-lg theme-bg-accent theme-text-accent font-semibold transition-all duration-200 hover:scale-105 retro-button theme-card-glow">
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Briefcase className="w-8 h-8 theme-text-primary" />
              <h2 className="text-3xl font-bold theme-text-primary">
                Work Experience
              </h2>
            </div>
            <div className="space-y-8">
              {experience.map((job, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl theme-bg-card theme-shadow hover:theme-shadow-lg transition-all duration-300 retro-border theme-card-glow"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold theme-text-primary mb-1">
                        {job.title}
                      </h3>
                      <p className="text-lg theme-text-secondary">
                        {job.company}
                      </p>
                    </div>
                    <span className="mt-2 md:mt-0 px-4 py-1 rounded-full text-sm font-semibold theme-bg-accent theme-text-accent border-2 theme-border">
                      {job.period}
                    </span>
                  </div>
                  <p className="theme-text-secondary mb-4 leading-relaxed">
                    {job.description}
                  </p>
                  <div>
                    <h4 className="font-semibold theme-text-primary mb-2">
                      Key Achievements:
                    </h4>
                    <ul className="space-y-2">
                      {job.achievements.map((achievement, achIndex) => (
                        <li
                          key={achIndex}
                          className="flex items-start gap-2 theme-text-secondary"
                        >
                          <span className="w-1.5 h-1.5 rounded-full theme-bg-accent mt-2 flex-shrink-0"></span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap className="w-8 h-8 theme-text-primary" />
              <h2 className="text-3xl font-bold theme-text-primary">
                Education
              </h2>
            </div>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl theme-bg-card theme-shadow retro-border theme-card-glow"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold theme-text-primary mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-lg theme-text-secondary">
                        {edu.institution}
                      </p>
                    </div>
                    <span className="mt-2 md:mt-0 px-4 py-1 rounded-full text-sm font-semibold theme-bg-accent theme-text-accent border-2 theme-border">
                      {edu.period}
                    </span>
                  </div>
                  <p className="theme-text-secondary">{edu.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-8 h-8 theme-text-primary" />
              <h2 className="text-3xl font-bold theme-text-primary">
                Certifications
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl theme-bg-card theme-shadow hover:theme-shadow-lg transition-all duration-300 retro-border theme-card-glow"
                >
                  <h3 className="text-lg font-bold theme-text-primary mb-2">
                    {cert.name}
                  </h3>
                  <p className="theme-text-secondary text-sm mb-2">
                    {cert.issuer}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm theme-bg-accent theme-text-accent border-2 theme-border">
                    {cert.year}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <button className="md:hidden mt-12 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg theme-bg-accent theme-text-accent font-semibold transition-all duration-200 retro-button theme-card-glow">
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default Resume;
