// components/Projects.tsx
import Image from "next/image";
import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { cookies } from "next/headers";
import ProjectModal from "../components/ProjectModal";

type ReadMoreSlide = { img: string; desc: string };

type ProjectItem = {
  title: string;
  description: string;
  tech: string[];
  image: string;
  category: "associated" | "my" | string;
  github?: string;
  live?: string;
  readMore?: ReadMoreSlide[];
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Projects = async ({ searchParams }: any) => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("portfolio-theme")?.value || "light";

  const filter = searchParams?.filter || "all";
  const selectedProjectTitle = searchParams?.project;

  const projects: ProjectItem[] = [
    {
      title: "Bombay Softwares Website Development",
      description:
        "Worked on the official company website. Created multiple pages, designed Strapi CMS schemas, and integrated them into the frontend. Optimized website performance and improved overall UX.",
      tech: ["Next.js", "TypeScript", "Strapi CMS"],
      image: "/assets/projects/associated/bombay-softwares.png",
      category: "associated",
    },
    {
      title: "PMOFY - Project & Sprint Management Tool",
      description:
        "<p>A full-fledged PMO (Project Management Office) tool designed to manage end-to-end project execution and sprint tracking. It allows teams to upload sprint data (CSV), track estimations, tasks, team allocations, weightages, and progress in real time.</p>",
      tech: [
        "Next.js",
        "Node.js",
        "TypeScript",
        "Express",
        "MongoDB",
        "React Tanstack Table",
        "Recharts / Chart.js",
        "CSV Parsing",
      ],
      image: "/assets/projects/associated/pmofy/cover-image.png",
      category: "associated",
      readMore: [
        {
          img: "/assets/projects/associated/pmofy/projection-date.png",
          desc: `<p>In this app, you can filter project data for every task — team-wise, resource-wise, responsible owner-wise, and by deliverables. After applying filters, you can also further segment the data for deeper insights.</p><p>The system provides a complete analysis of each task, showing weekly progress, current status, and any delays — essentially helping you understand how your project is progressing over time.</p><p>In the image, you can see multiple lines representing segmented data for different teams or parameters, while the top line shows the accumulated or overall projection trend.</p>`,
        },
        {
          img: "/assets/projects/associated/pmofy/pending-to-be-developed.png",
          desc: `<p>This chart visually represents which project tasks are still pending or yet to be developed.</p><p>Each dot on the chart corresponds to a specific project or task. By clicking on any of these dots, you can view detailed information about that particular task.</p>`,
        },
        {
          img: "/assets/projects/associated/pmofy/detailed-info.png",
          desc: `<p>Clicking on any point displays a detailed view of the data at that specific point.</p>`,
        },
        {
          img: "/assets/projects/associated/pmofy/newly-added-sprint.png",
          desc: `<p>This chart visually represents how many sprints have been added recently to the existing project</p>`,
        },
        {
          img: "/assets/projects/associated/pmofy/change-in-sprint.png",
          desc: `<p>This chart visually represents change in sprints</p>`,
        },
        {
          img: "/assets/projects/associated/pmofy/total-wip-sprint.png",
          desc: `<p>This chart visually represents total sprints which are under progress</p>`,
        },
        {
          img: "/assets/projects/associated/pmofy/collecive-table.png",
          desc: `<p>TThis table shows a complete dump of the data in tabular form, where we can filter, edit, and view the history of a particular task.</p>`,
        },
      ],
    },
    {
      title: "Zakaa - Ministry of Environment, Water & Agriculture (U.A.E)",
      description:
        "<p>A comprehensive fund allocation and monitoring platform developed for a UAE government initiative supporting both <strong>Arabic and English</strong> languages. It streamlines the approval and distribution of government funds across multiple ministries, departments, and sectors. The system allows decision-makers to track budget allocations and ensure transparency and accountability throughout the fund distribution process. </p>",
      tech: [
        "Next.js",
        "TypeScript",
        "Redux Toolkit",
        "React Tanstack Table",
        "Recharts / Chart.js",
        "CSV Parsing",
      ],
      image: "/assets/projects/associated/zakaa/cover-image.png",
      category: "associated",
      readMore: [
        {
          img: "/assets/projects/associated/zakaa/admin-panel.png",
          desc: `<p>This is the complete <strong>admin panel</strong> where you can add new contracts or project types, define ministry types, assign roles, and manage all related details in a structured way.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/budget-tracker.png",
          desc: "<p>This is the complete <strong>Ministry Dashboard</strong> where you can view all details such as budget distribution, allocation types, and approvals from different ministries. The data is displayed in structured charts and cards — all of which are clickable for viewing detailed insights.</p><p>On the side there's a budget tracker powered by <strong>Socket.io</strong> that shows real-time updates of where funds have reached, who approved or rejected them, and an audit trail of all actions for easy tracking.</p>",
        },
        {
          img: "/assets/projects/associated/zakaa/expenses-entity-wise.png",
          desc: `<p>This is a detailed <strong>overhead expenses</strong> page displayed entity-wise, showing how much has been spent by each entity so far. It uses a TanStack Table view where you can also attach files and add comments for better tracking and documentation.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/detailed-overhead-expenses.png",
          desc: `<p>This section displays detailed <strong>miscellaneous expenses</strong>, showing which ministry they belong to, where the expenses were added, who added them, and when. It provides a complete tracking view of all miscellaneous financial activities.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/new-programs.png",
          desc: `<p>This section allows you to add and manage <strong>new-programs</strong>. The detailed information is displayed below in a TanStack Table. The table supports adding, editing, and removing entries, as well as attaching comments for better program</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/new-projects.png",
          desc: `<p>This section allows you to add and manage <strong>new-projects</strong>. The detailed information is displayed below in a TanStack Table. The table supports adding, editing, and removing entries, as well as attaching comments for better project and contract management.</p>`,
        },

        {
          img: "/assets/projects/associated/zakaa/existing-programs.png",
          desc: `<p>The <strong>Existing Programs</strong> section provides a detailed table view where you can see all existing programs. From here, you can also access data for existing contracts, add new contracts, and view contract planning and item details using the TanStack Table action buttons. A summary of key data is also displayed in cards at the top for quick reference.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/existing-contracts.png",
          desc: `<p>The <strong>Existing Contracts</strong> section allows you to view detailed information for each contract, including its validity. By clicking the "Contract Details" button, you can access deeper insights. Additionally, you can open nested tables to see related data using the "Contract Need" button, and attachments can be added as required.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/new-contracts.png",
          desc: `<p>The <strong>New Contracts</strong> section lets you create new contracts and view all currently valid contracts. Using the TanStack Table action buttons, you can edit, delete, or add comments/attachments to any contract.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/alternative-programs.png",
          desc: `<p>The <strong>Alternative Programs</strong> section displays programs running as alternatives. Once approvals are completed, you can view their data, merge them with existing programs, or delete them. Radio buttons allow you to decide whether a program should be considered as an alternative.</p>`,
        },
        {
          img: "/assets/projects/associated/zakaa/detailed-report.png",
          desc: `<p>The <strong>Detailed Report</strong> section provides a comprehensive report of all contracts. From this page, you can download the complete data in PDF or EXCEL format for further analysis.</p>`,
        },
      ],
    },
    {
      title: "Frass - Center School of Weapon and Tactics",
      description:
        "<p>This is a Central School of Weapons & Tactics shooting-practice project — a web dashboard with range visualization that records shots, predicts accuracy using a dummy model, and provides real-time analytics. Features include top-shooter leaderboards, round/game modes, individual performance cards, and visual charts to make target practice measurable and engaging.</p>",
      tech: [
        "Next.js",
        "TypeScript",
        "Redux Toolkit",
        "React Tanstack Table",
        "Recharts / Chart.js",
        "CSV Parsing",
      ],
      image: "/assets/projects/associated/frass/cover-image.png",
      category: "associated",
      readMore: [
        {
          img: "/assets/projects/associated/frass/dashboard-1.png",
          desc: `<p>The main Dashboard provides a comprehensive overview of the entire system’s activity. It displays key metrics, statistics, and performance summaries across all regions, allowing users to quickly assess operational effectiveness. The dashboard includes visual graphs and charts to illustrate trends, highlight critical data points, and show comparisons over time. Users can view region-wise performance, session counts, active training programs, and summary statistics of soldiers and targets. This overview helps in identifying areas that need attention and provides actionable insights for training managers and supervisors.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/dashboard-2.png",
          desc: `<p>The secondary Dashboard view focuses on detailed performance analytics for individuals and teams. It highlights top performers and bottom performers based on various parameters, including scores, accuracy, completion rates, and other operational metrics. Each metric is clearly displayed along with comparative charts, allowing supervisors to evaluate performance trends, identify strengths and weaknesses, and make data-driven decisions. Additional filters and sorting options help in drilling down to specific units, training types, or individual soldiers for deeper insights.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/session-detail-add.png",
          desc: `<p>The <strong>Add - Session Detail</strong> section is designed for pre-session configuration. Before a session begins, essential information must be entered, including the training unit, course, assigned soldiers, and target allocations. Users can define the type of training, objectives, and expected outcomes. This ensures that all sessions are accurately set up in the system and ready for execution. It also allows for planning complex scenarios with multiple soldiers and targets, making it easier to track performance once the session starts.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/session-detail-past.png",
          desc: `<p>The <strong>Past Session Detail</strong> view provides a historical record of all previously created sessions. It includes detailed information such as training type, total number of soldiers involved, assigned training units, courses, and targets. This section allows users to review past sessions, compare results, and analyze trends over time. By examining historical session data, supervisors can identify training gaps, improve future session planning, and ensure that performance objectives are being met.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/creating-new-session.png",
          desc: `<p>The <strong>Create New Session</strong> screen allows users to launch a new training session with all required details. This includes selecting the weapon, defining the course, assigning soldier positions, choosing firing types, and specifying target types. All previously entered reference data, such as training units, soldiers, and objectives, can be leveraged to ensure accuracy. Users can also define session-specific rules and parameters to match real-world training scenarios. This structured approach ensures that each session is comprehensive, organized, and ready for live execution.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/session-started.png",
          desc: `<p>Once a session is started, all activities are captured in real-time. Soldier movements, target engagements, and fired shots are tracked and visually represented in the user interface. The system records key performance metrics such as points scored, hit accuracy, and completion times for each soldier. This live tracking allows supervisors to monitor session progress, provide immediate feedback, and evaluate individual and team performance dynamically. It also ensures that all session data is accurately logged for post-session analysis.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/session-cam-view.png",
          desc: `<p>The <strong>Live Session Camera</strong> provides a live feed from the training range, capturing the real-time actions of soldiers and targets. This view allows supervisors and instructors to closely monitor ongoing activities, ensuring proper execution of training procedures and maintaining safety compliance. The camera feed also helps in validating performance data and provides a visual reference for any incidents or exceptional performances during the session.</p>`,
        },
        {
          img: "/assets/projects/associated/frass/session-completed-past.png",
          desc: `<p>The <strong>Past Completed Sessions</strong> section provides a detailed record of all sessions that have been completed. It includes comprehensive information about each session, such as total soldiers, weapons used, course details, target types, scores, hit accuracy, and overall performance metrics. Users can review individual and team performances, analyze trends, and download session data for reporting purposes. This section serves as a complete historical archive, enabling supervisors to evaluate training effectiveness, identify areas for improvement, and support performance assessments.</p>`,
        },
      ],
    },
    {
      title: "XplorEarth",
      description: `<p>XplorEarth is a comprehensive and <strong>SEO-friendly</strong> travel booking platform designed to make global travel planning effortless and personalized. It allows users to explore destinations across the world, discover exclusive deals, and customize travel packages according to their preferences, interests, and budgets.</p>
  <p>Built with a strong focus on performance, accessibility, and search optimization, XplorEarth ensures faster load times and improved visibility across search engines. Users can enjoy a clean, intuitive interface</p>`,
      tech: [
        "Next.js",
        "TypeScript",
        "React Simple Maps",
        "Context Api",
        "CMS-Strapi",
      ],
      image: "/assets/projects/associated/xplorearth/cover-image.png",
      category: "associated",
    },
    {
      title: "Triveni Kalasangam",
      description: `<p>Triveni Kalasangam is a long-established cultural organization that has been a hub for artists and art enthusiasts for several decades. The project involved developing a fully functional website with complete authentication and user flow implemented.</p>
  <p>The platform emphasizes a seamless, user-friendly experience, robust backend functionality, and responsive design across all devices. It is designed to facilitate easy access to events, classes, and archives while maintaining high performance and scalability.</p>`,
      tech: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Mongoose", "JWT"],
      image: "/assets/projects/associated/triveni/cover-image.png",
      category: "associated",
      readMore: [
        {
          img: "/assets/projects/associated/triveni/our-classes.png",
          desc: ``,
        },
        {
          img: "/assets/projects/associated/triveni/spaces.png",
          desc: ``,
        },
        {
          img: "/assets/projects/associated/triveni/archives.png",
          desc: ``,
        },
      ],
    },
    {
      title: "Elite Systems (U.A.E)",
      description: `<p>As part of Bombay Softwares, I developed a fully <strong>SEO-friendly</strong> website for the company's U.A.E branch, registered under the name Elite Systems. The platform is bilingual, supporting both <strong>Arabic and English</strong>, ensuring accessibility and engagement for a diverse audience.</p>
  <p>The project focuses on high performance, responsive design, and search engine optimization, delivering a seamless user experience across devices while maintaining a clean, scalable, and maintainable codebase.</p>`,
      tech: ["Next.js", "TypeScript", "Redux Toolkit"],
      image: "/assets/projects/associated/es/cover-image.png",
      category: "associated",
    },
    {
      title: "Threadflows",
      description: `<p>We are currently developing an application similar to Slack, designed for seamless team collaboration, messaging, and communication. The platform includes all the core features of Slack, along with our own custom, enhanced functionalities. Full data sharing and collaboration capabilities are supported.</p>
<p>At present, the application is in its testing phase and is being used internally within our company as well as by some selected clients.</p>`,
      tech: [
        "Vanilla JS",
        "Socket.io",
        "Quill rich-text editor",
        "Django",
        "Python",
        "Postgres SQL",
      ],
      image: "/assets/projects/associated/threadflows/cover-image.png",
      category: "associated",
      readMore: [
        {
          img: "/assets/projects/associated/threadflows/tf-main.png",
          desc: `<p>In this project, I integrated the Quill text editor at a full-fledged scale, UI/UX redesign acc. to client, fixed several bugs, optimized performance, and enabled the functionality to send messages within subthreads.</p>`,
        },
      ],
    },
    {
      title: "Bharat Sahayta Hub",
      description:
        "A full-featured e-commerce solution with real-time inventory management, payment processing, and analytics dashboard. Built with scalability and performance in mind.",
      tech: ["Next.js", "Node.js", "Mongo DB", "TypeScript", "Mongoose", "JWT"],
      image: "/assets/projects/associated/bharat-sahayta-hub/cover-image.png",
      github: "https://github.com",
      live: "https://example.com",
      category: "my",
    },
    {
      title: "Zydoc: Online Doctor Appointment Booking App",
      description:
        "A full-featured e-commerce solution with real-time inventory management, payment processing, and analytics dashboard. Built with scalability and performance in mind.",
      tech: [
        "Next.js",
        "Node.js",
        "Mongo DB",
        "Mongoose",
        "JWT",
        "Razorpay Payment Gateway",
        "Cloudinary",
      ],
      image: "/assets/projects/associated/zydoc/cover-image.png",
      github: "https://github.com",
      live: "https://example.com",
      category: "my",
    },
    {
      title: "Bharat Sahayta Hub",
      description:
        "A full-featured e-commerce solution with real-time inventory management, payment processing, and analytics dashboard. Built with scalability and performance in mind.",
      tech: ["Next.js", "Node.js", "Mongo DB", "Mongoose", "JWT"],
      image: "/assets/projects/associated/bharat-sahayta-hub/cover-image.png",
      github: "https://github.com",
      live: "https://example.com",
      category: "my",
    },
  ];

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const activeProject = projects.find((p) => p.title === selectedProjectTitle);

  return (
    <div className="theme-bg-primary min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-10 ${theme === "futuristic" ? "scan-line" : ""}`}>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-4 theme-text-primary ${
              theme === "futuristic" || theme === "retro" ? "gradient-text" : ""
            }`}
          >
            Projects
          </h1>
          <p className="text-xl theme-text-secondary max-w-3xl">
            A selection of some of the projects that I've worked on, showcasing
            my expertise in building scalable, user-friendly applications.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-12 flex-wrap">
          {["all", "my", "associated"].map((btn) => (
            <Link
              key={btn}
              href={`?filter=${btn}`}
              className={`px-5 py-2 rounded-lg text-lg font-medium transition-all duration-200 border theme-border ${
                filter === btn
                  ? "theme-bg-accent theme-text-accent"
                  : "theme-text-primary hover:theme-bg-hover"
              } ${theme === "retro" ? "retro-button" : ""} ${
                theme === "futuristic" ? "theme-card-glow" : ""
              }`}
            >
              {btn === "all"
                ? "All Projects"
                : btn === "my"
                ? "My Projects"
                : "Associated Projects"}
            </Link>
          ))}
        </div>

        {/* Project Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden theme-bg-card theme-shadow hover:theme-shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                theme === "retro" ? "retro-border" : ""
              } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={
                    project.image.startsWith("/")
                      ? project.image
                      : project.image.replace("../../public", "")
                  }
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  width={500}
                  height={300}
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 theme-text-primary">
                  {project.title}
                </h3>

                <div
                  className="theme-text-secondary mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className={`px-3 py-1 rounded-full text-sm theme-bg-accent theme-text-accent ${
                        theme === "retro" ? "border-2 theme-border" : ""
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {project.readMore && (
                  <Link
                    href={`?filter=${filter}&project=${encodeURIComponent(
                      project.title
                    )}`}
                    scroll={false}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-[1.02] ${
                      theme === "retro" ? "retro-button" : ""
                    }`}
                    style={{
                      background:
                        "linear-gradient(90deg, #fb923c 0%, #f97316 100%)",
                      color: "white",
                      width: "fit-content",
                    }}
                  >
                    Read More
                  </Link>
                )}

                {project.github && project.live && (
                  <div className="flex gap-4 mt-3">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg theme-text-primary border theme-border hover:theme-bg-hover transition-all duration-200 ${
                        theme === "retro" ? "retro-button" : ""
                      }`}
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg theme-bg-accent theme-text-accent transition-all duration-200 hover:scale-105 ${
                        theme === "retro" ? "retro-button" : ""
                      } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeProject && activeProject.readMore && (
        <ProjectModal
          isOpen={true}
          title={activeProject.title}
          slides={activeProject.readMore}
        />
      )}
    </div>
  );
};

export default Projects;
