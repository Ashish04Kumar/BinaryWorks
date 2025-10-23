import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="theme-bg-footer border-t theme-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold theme-text-primary mb-4">
              Ashish Kumar
            </h3>
            <p className="theme-text-secondary">
              Full-stack developer passionate about creating elegant solutions
              to complex problems.
            </p>
          </div>

          <div>
            <h4 className="font-semibold theme-text-primary mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="theme-text-secondary hover:theme-text-primary transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/projects"
                  className="theme-text-secondary hover:theme-text-primary transition-colors"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="theme-text-secondary hover:theme-text-primary transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="theme-text-secondary hover:theme-text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold theme-text-primary mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-text-secondary hover:theme-text-primary transition-all duration-200 hover:scale-110"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-text-secondary hover:theme-text-primary transition-all duration-200 hover:scale-110"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-text-secondary hover:theme-text-primary transition-all duration-200 hover:scale-110"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="mailto:ashish@example.com"
                className="theme-text-secondary hover:theme-text-primary transition-all duration-200 hover:scale-110"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center theme-text-secondary">
          <p>&copy; {currentYear} Ashish Kumar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
