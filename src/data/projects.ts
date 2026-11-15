// All portfolio projects. "associated" = built at work, "my" = personal.

export type ReadMoreSlide = { img: string; desc: string };

export type ProjectItem = {
  title: string;
  description: string;
  tech: string[];
  image: string;
  category: "associated" | "my" | string;
  github?: string;
  githubFrontend?: string;
  githubBackend?: string;
  live?: string;
  liveAdmin?: string;
  liveClient?: string;
  // Link to a live demo on this site (e.g. "/#glitch")
  demo?: string;
  readMore?: ReadMoreSlide[];
};

export const projects: ProjectItem[] = [
  {
    title: "Glitch: Voice Companion Robot",
    description:
      "<p>An AI companion that lives on my desk. It talks with you, and it also remembers what you tell it, keeps your notes, reminders, lists and to-dos, and controls devices around the room (IoT). It has a round face that shows its moods, a head that turns on two servos, and a camera that sees hand gestures and people.</p><p>Its brain started as a separate project, <strong>Umbrella</strong> (memory, tools and live voice), and now powers Glitch. It runs on my laptop today and moves to a Raspberry Pi next.</p>",
    tech: ["Python", "LangGraph", "FastAPI", "PostgreSQL", "LiveKit", "MediaPipe", "YOLO", "Raspberry Pi", "PCA9685"],
    image: "/assets/projects/personal/glitch/architecture.png",
    category: "my",
    demo: "/#glitch",
  },
  {
    title: "ScholarLens: Research Paper Assistant",
    description:
      "<p>An <strong>Agentic RAG</strong> app: ask questions about research papers and get answers with page numbers. Upload a PDF, or paste a link or an arXiv ID. For each question it decides whether to search the paper, check a claim against newer research, or just answer, and tries a better search if the first one misses.</p><p>Tested for accuracy with DeepEval and deployed with Docker on AWS.</p>",
    tech: ["LangGraph", "LangChain", "Qdrant", "Cohere", "Groq", "Gemini", "Tavily", "DeepEval", "Streamlit", "Docker", "AWS"],
    image: "/assets/projects/personal/scholarlens/architecture.png",
    category: "my",
    live: "https://scholarlens.duckdns.org/",
    demo: "/#scholarlens",
  },
  {
    title: "BotStream: Smart RAG Chatbot Platform",
    description: `<p><strong>BotStream</strong> lets a business turn its PDFs, documents and web pages into a chatbot that answers questions and shows where each answer came from.</p>
<p><strong>How it finds answers</strong></p>
<ul>
<li>Questions asked before are answered instantly from a cache.</li>
<li>Follow-up questions are rewritten so they make sense on their own.</li>
<li>It searches the documents two ways at once, by meaning and by keywords, and combines the results.</li>
<li>Whole documents can also be given to Gemini to read in full, with Claude as a backup.</li>
<li>New files and links are processed in the background.</li>
</ul>
<p><strong>What I built:</strong> most of the web app (the chat with sources that jump to the right PDF page, the bot creation flow, voice input and output, the landing pages) and backend features in Flask such as user feedback emails, security checks for embedded bots and an admin role.</p>`,
    tech: [
      "Next.js",
      "Flask",
      "LangChain",
      "TypeScript",
      "Redux Toolkit",
      "react-pdf",
      "PostgreSQL",
      "Redis + RQ",
      "FAISS + BM25",
      "OpenAI embeddings",
      "Gemini",
      "Claude",
    ],
    image: "/assets/projects/associated/botstream/cover-image.png",
    category: "associated",
    live: "https://www.botstream.co",
  },
  {
    title: "Company Website Platform",
    description:
      "<p>A company website with many pages, all managed from a CMS. I built the pages, set up the CMS content structure, connected it to the frontend and made the site faster.</p>",
    tech: ["Next.js", "TypeScript", "Strapi CMS"],
    image: "/assets/projects/associated/bombay-softwares.png",
    category: "associated",
  },
  {
    title: "Fund Management Dashboard for U.A.E Ministry of Gov.",
    description:
      "<p>A system for a UAE government ministry to plan, approve and track its budgets. It works in Arabic and English, shows every approval step live, and exports reports to PDF and Excel.</p>",
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
    title: "Firearms Training & Analytics Dashboard",
    description:
      "<p>A dashboard for shooting-range training. It sets up sessions, tracks every shot live, scores each person and shows progress with charts and leaderboards.</p>",
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
        desc: `<p>Historical record of past sessions with detailed info.</p>`,
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
    title: "Global Travel Planner",
    description:
      "<p>A travel site where people explore destinations on an interactive map, find deals and build their own trip packages. Built to load fast and rank well in search.</p>",
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
    title: "Cultural Events Platform",
    description: "<p>A website for a cultural centre to run its events, classes and archives, with sign-up, login and a layout that works on every screen size.</p>",
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
    title: "Corporate Website Platform",
    description:
      "<p>A company website for a UAE branch in both Arabic and English, built to be fast, search-friendly and responsive.</p>",
    tech: ["Next.js", "TypeScript", "Redux Toolkit"],
    image: "/assets/projects/associated/es/cover-image.png",
    category: "associated",
  },
  {
    title: "Team Collaboration Tool",
    description:
      "<p>An internal chat tool for teams, similar to Slack. I added a rich text editor, threaded replies, a redesigned interface and fixed performance issues.</p>",
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
];
