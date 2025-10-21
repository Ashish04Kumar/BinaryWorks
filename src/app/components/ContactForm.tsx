"use client";
import React, { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useTheme } from "../providers/theme-provider";

const ContactForm = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Email",
      value: "ashish.kumar@example.com",
      link: "mailto:ashish.kumar@example.com",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Phone",
      value: "+91 98765 43210",
      link: "tel:+919876543210",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Location",
      value: "Mumbai, India",
      link: null,
    },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit}
          className={`p-8 rounded-xl theme-bg-card theme-shadow-lg ${
            theme === "retro" ? "retro-border" : ""
          } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold mb-2 theme-text-primary"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg theme-bg-secondary theme-text-primary border theme-border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${
                  theme === "futuristic"
                    ? "focus:ring-[#00ff41]"
                    : "focus:ring-blue-500"
                }`}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2 theme-text-primary"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg theme-bg-secondary theme-text-primary border theme-border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${
                  theme === "futuristic"
                    ? "focus:ring-[#00ff41]"
                    : "focus:ring-blue-500"
                }`}
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="subject"
              className="block text-sm font-semibold mb-2 theme-text-primary"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg theme-bg-secondary theme-text-primary border theme-border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${
                theme === "futuristic"
                  ? "focus:ring-[#00ff41]"
                  : "focus:ring-blue-500"
              }`}
              placeholder="Project Inquiry"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-semibold mb-2 theme-text-primary"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full px-4 py-3 rounded-lg theme-bg-secondary theme-text-primary border theme-border focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none transition-all ${
                theme === "futuristic"
                  ? "focus:ring-[#00ff41]"
                  : "focus:ring-blue-500"
              }`}
              placeholder="Tell me about your project..."
            />
          </div>
          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg theme-bg-accent theme-text-accent font-semibold transition-all duration-200 hover:scale-105 ${
              theme === "retro" ? "retro-button" : ""
            } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
          >
            <Send className="w-5 h-5" />
            Send Message
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div
          className={`p-6 rounded-xl theme-bg-card theme-shadow ${
            theme === "retro" ? "retro-border" : ""
          } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
        >
          <h2 className="text-2xl font-bold mb-6 theme-text-primary">
            Contact Information
          </h2>
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="theme-text-primary mt-1">{info.icon}</div>
                <div>
                  <h3 className="font-semibold theme-text-primary mb-1">
                    {info.label}
                  </h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="theme-text-secondary hover:theme-text-primary transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="theme-text-secondary">{info.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div
              className={`p-6 rounded-xl theme-bg-card theme-shadow ${
                theme === 'retro' ? 'retro-border' : ''
              } ${theme === 'futuristic' ? 'theme-card-glow' : ''}`}
            >
              <h2 className="text-2xl font-bold mb-4 theme-text-primary">Availability</h2>
              <p className="theme-text-secondary leading-relaxed mb-4">
                I'm currently available for freelance projects and full-time opportunities.
              </p>
              <p className="theme-text-secondary leading-relaxed">
                Response time: Usually within 24 hours
              </p>
            </div> */}

        <div
          className={`p-6 rounded-xl theme-bg-card theme-shadow ${
            theme === "retro" ? "retro-border" : ""
          } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
        >
          <h2 className="text-2xl font-bold mb-4 theme-text-primary">
            Work With Me
          </h2>
          <p className="theme-text-secondary leading-relaxed">
            Whether you need a full-stack developer for your team, a consultant
            for your project, or someone to bring your idea to life, I'm here to
            help.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
