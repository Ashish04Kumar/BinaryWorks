import { BookOpen, Heart, Lightbulb, Target } from "lucide-react";
import { ArrowRight, Code, Palette, Zap } from "lucide-react";
import ashishImg1 from "../../../public/assets/personal-images/image1.jpeg";
import ashishImg2 from "../../../public/assets/personal-images/image2.jpeg";
import ashishImg3 from "../../../public/assets/personal-images/image3.jpeg";
import Link from "next/link";
import SwiperContainer from "../components/SwiperContainer";
import { cookies } from "next/headers";

const About = async () => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("portfolio-theme")?.value || "light";
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Full-Stack Development",
      description:
        "Expertise in building scalable web applications with modern technologies and best practices.",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "UI/UX Design",
      description:
        "Creating intuitive and beautiful user interfaces that provide exceptional user experiences.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Optimization",
      description:
        "Delivering lightning-fast applications through code optimization.",
    },
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal-Oriented",
      description:
        "I believe in setting clear objectives and delivering results that exceed expectations.",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation",
      description:
        "Constantly exploring new technologies and methodologies to solve problems creatively.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Passion",
      description:
        "Deeply passionate about creating software that makes a positive impact on people's lives.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Continuous Learning",
      description:
        "Committed to staying current with industry trends and expanding my skill set.",
    },
  ];

  const myJourney = [
    {
      year: "2022-2025",
      designation: "Programmer Analyst Intern",
      companyLogo: "",
      companyName: "Cognizant Technology Solutions",
      description:
        "I believe in setting clear objectives and delivering results that exceed expectations.",
    },
    {
      year: "2022-2025",
      designation: "Java Developer GET",
      companyLogo: "",
      companyName: "Sterlite Technologies",
      description:
        "Constantly exploring new technologies and methodologies to solve problems creatively.",
    },
    {
      year: "2022-2025",
      designation: "Full Stack Developer",
      companyLogo: "",
      companyName: "Two Dots",
      description:
        "Deeply passionate about creating software that makes a positive impact on people's lives.",
    },
    {
      year: "2022-2025",
      designation: "Full Stack Developer",
      companyLogo: "",
      companyName: "Bombay Softwares",
      description:
        "Committed to staying current with industry trends and expanding my skill set.",
    },
  ];

  const skills = [
    {
      category: "Frontend",
      items: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Bootstrap",
        "Vanilla Js",
      ],
    },
    {
      category: "Backend",
      items: ["Node.js", "Express", "JWT / OAuth authentication"],
    },
    {
      category: "Database",
      items: ["MongoDB", "Mongoose"],
    },
    {
      category: "DevOps / Deployment",
      items: ["Vercel / Netlify (frontend deployment)", "Git & GitHub"],
    },
  ];

  return (
    <div className="theme-bg-primary min-h-screen">
      <section
        className={`relative py-20 lg:py-32 theme-bg-secondary ${
          theme === "futuristic" ? "scan-line" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className={`text-5xl md:text-7xl font-bold mb-6 theme-text-primary ${
                theme === "futuristic" || theme === "retro"
                  ? "gradient-text"
                  : ""
              }`}
            >
              Hi, I'm Ashish Kumar
            </h1>
            <p className="text-xl md:text-2xl theme-text-secondary mb-8 max-w-3xl mx-auto">
              Full-Stack Developer & Creative Problem Solver
            </p>
            <p className="text-lg theme-text-secondary mb-12 max-w-2xl mx-auto">
              Passionate about crafting elegant solutions to complex problems. I
              specialize in building performant web applications that make a
              difference. With expertise spanning frontend frameworks, backend
              architectures. I bring ideas to life with clean, maintainable
              code.
            </p>
            <div className="flex flex-col md:flex-row items-center md:items-start mb-20 mt-20 gap-8 md:gap-20">
              <div className="w-full md:w-1/2 rounded-xl theme-bg-card theme-shadow retro-border mb-8 md:mb-0 theme-card-glow">
                <SwiperContainer
                  slides={[
                    { image: ashishImg1 },
                    { image: ashishImg2 },
                    { image: ashishImg3 },
                  ]}
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col items-start">
                <h2 className="text-4xl font-bold mb-6 theme-text-primary">
                  Get to Know Me
                </h2>
                <p className="text-lg theme-text-secondary mb-10 text-start">
                  My journey into technology began during graduation when I
                  built my first website. What started as curiosity has evolved
                  into a deep passion for creating digital experiences that
                  solve real problems and delight users.
                  <br />
                  <br />
                  When I'm not coding, you'll find me exploring new coffee
                  shops, hiking in nature, or experimenting with the latest
                  design trends. I believe the best work comes from a balanced
                  life and diverse experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/projects"
                    className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 theme-bg-accent theme-text-accent shadow-lg hover:shadow-xl ${
                      theme === "retro" ? "retro-button" : ""
                    } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
                  >
                    View My Work
                  </Link>
                  <Link
                    href="/contact"
                    className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 theme-text-primary border-2 theme-border hover:theme-bg-hover ${
                      theme === "retro" ? "retro-button" : ""
                    }`}
                  >
                    Get In Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 theme-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 theme-text-primary">
            What I Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl theme-bg-card theme-shadow hover:theme-shadow-lg transition-all duration-300 hover:scale-105 ${
                  theme === "retro" ? "retro-border" : ""
                } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
              >
                <div className="theme-text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 theme-text-primary">
                  {feature.title}
                </h3>
                <p className="theme-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 theme-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 theme-text-primary">
            Let's Build Something Amazing Together
          </h2>
          <p className="text-xl theme-text-secondary mb-8 max-w-2xl mx-auto">
            I'm always excited to collaborate on interesting projects and
            explore new opportunities.
          </p>
          <Link
            href="/contact"
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 theme-bg-accent theme-text-accent shadow-lg ${
              theme === "retro" ? "retro-button" : ""
            } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
          >
            Start a Conversation
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className={`mb-20 ${theme === "futuristic" ? "scan-line" : ""}`}>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 theme-text-primary ${
              theme === "futuristic" || theme === "retro" ? "gradient-text" : ""
            }`}
          >
            About Me
          </h1>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg theme-text-secondary mb-6 leading-relaxed">
                I'm a full-stack developer with over 2.5+ years of experience
                building web applications that combine beautiful design with
                powerful functionality. My journey in software development
                started with a curiosity about how things work and evolved into
                a passion for creating solutions that improve people's digital
                experiences.
              </p>
              <p className="text-lg theme-text-secondary mb-6 leading-relaxed">
                Throughout my career, I've had the privilege of working with
                startups and established companies, helping them transform their
                ideas into successful products. I thrive in collaborative
                environments where innovation meets practical problem-solving.
              </p>
            </div>
            <div
              className={`p-8 rounded-xl theme-bg-card theme-shadow-lg ${
                theme === "retro" ? "retro-border" : ""
              } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
            >
              <h3 className="text-2xl font-bold mb-4 theme-text-primary">
                Quick Facts
              </h3>
              <ul className="space-y-3 theme-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full theme-bg-accent"></span>
                  2.5+ years of professional experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full theme-bg-accent"></span>
                  10+ successful projects delivered
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full theme-bg-accent"></span>
                  Passionate about mentoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full theme-bg-accent"></span>
                  Based in India
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20  theme-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 theme-text-primary text-center">
            My Journey
          </h2>
          <div>
            {myJourney.map((value, index) => (
              <div
                key={index}
                className={`mt-14 p-6 rounded-xl theme-bg-card 
    ${theme === "retro" ? "retro-border" : ""} 
    ${theme === "futuristic" ? "theme-card-glow" : ""} 
    ${theme === "dark" ? "theme-shadow" : "theme-shadow border border-gray-200"}
  `}
              >
                <h3 className="text-lg font-bold mb-2 theme-text-primary">
                  {/* {value.title} */}
                </h3>
                <p className="text-lg theme-text-secondary ">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 theme-text-primary text-center">
            My Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl theme-bg-card theme-shadow hover:theme-shadow-lg transition-all duration-300 hover:scale-105 ${
                  theme === "retro" ? "retro-border" : ""
                } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
              >
                <div className="theme-text-primary mb-3">{value.icon}</div>
                <h3 className="text-lg font-bold mb-2 theme-text-primary">
                  {value.title}
                </h3>
                <p className="theme-text-secondary text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr></hr>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-4xl font-bold mb-12 theme-text-primary text-center">
            Technical Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillSet, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl theme-bg-card theme-shadow ${
                  theme === "retro" ? "retro-border" : ""
                } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
              >
                <h3 className="text-xl font-bold mb-4 theme-text-primary">
                  {skillSet.category}
                </h3>
                <ul className="space-y-2">
                  {skillSet.items.map((skill, skillIndex) => (
                    <li
                      key={skillIndex}
                      className="theme-text-secondary flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full theme-bg-accent"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
