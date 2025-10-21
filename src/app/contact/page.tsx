import { cookies } from "next/headers";
import ContactForm from "../components/ContactForm";

const Contact = async () => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("portfolio-theme")?.value || "light";

  return (
    <div className="theme-bg-primary min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-16 ${theme === "futuristic" ? "scan-line" : ""}`}>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 theme-text-primary ${
              theme === "futuristic" || theme === "retro" ? "gradient-text" : ""
            }`}
          >
            Get In Touch
          </h1>
          <p className="text-xl theme-text-secondary max-w-3xl">
            Have a project in mind or want to discuss opportunities? I'd love to
            hear from you. Fill out the form below or reach out directly through
            the contact information provided.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;
