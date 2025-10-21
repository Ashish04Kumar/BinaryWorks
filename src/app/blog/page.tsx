// import { Calendar, Clock, ArrowRight } from "lucide-react";
import { cookies } from "next/headers";

const Blog = async () => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("portfolio-theme")?.value || "light";

//   const posts = [
//     {
//       title: "Building Scalable React Applications",
//       excerpt:
//         "Learn best practices for structuring React applications that can grow with your team and product requirements. We'll explore component architecture, state management patterns, and performance optimization techniques.",
//       date: "2024-10-15",
//       readTime: "8 min read",
//       category: "React",
//       image:
//         "https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800",
//     },
//     {
//       title: "Mastering TypeScript: Advanced Patterns",
//       excerpt:
//         "Dive deep into TypeScript's advanced type system. Discover how generics, conditional types, and mapped types can help you write safer, more maintainable code. Includes real-world examples and practical use cases.",
//       date: "2024-10-08",
//       readTime: "12 min read",
//       category: "TypeScript",
//       image:
//         "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
//     },
//     {
//       title: "API Design Best Practices",
//       excerpt:
//         "Creating robust, developer-friendly APIs is an art. This guide covers RESTful principles, versioning strategies, authentication patterns, error handling, and documentation best practices that will make your APIs a joy to use.",
//       date: "2024-09-30",
//       readTime: "10 min read",
//       category: "Backend",
//       image:
//         "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
//     },
//     {
//       title: "Optimizing Database Performance",
//       excerpt:
//         "Database performance can make or break your application. Learn about indexing strategies, query optimization, caching techniques, and monitoring tools that will help you keep your database running smoothly at scale.",
//       date: "2024-09-22",
//       readTime: "15 min read",
//       category: "Database",
//       image:
//         "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800",
//     },
//     {
//       title: "Modern CSS Techniques",
//       excerpt:
//         "CSS has evolved tremendously. Explore modern layout techniques with Grid and Flexbox, CSS custom properties, container queries, and the latest animation features that bring your designs to life without JavaScript.",
//       date: "2024-09-15",
//       readTime: "7 min read",
//       category: "CSS",
//       image:
//         "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
//     },
//     {
//       title: "DevOps Fundamentals for Developers",
//       excerpt:
//         "Understanding DevOps principles is essential for modern developers. This comprehensive guide covers CI/CD pipelines, containerization with Docker, infrastructure as code, monitoring, and deployment strategies.",
//       date: "2024-09-08",
//       readTime: "13 min read",
//       category: "DevOps",
//       image:
//         "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
//     },
//   ];

  return (
    <div className="theme-bg-primary min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-16 ${theme === "futuristic" ? "scan-line" : ""}`}>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 theme-text-primary ${
              theme === "futuristic" || theme === "retro" ? "gradient-text" : ""
            }`}
          >
            Blog
          </h1>
          <p className="text-xl theme-text-secondary max-w-3xl">
            Thoughts, tutorials, and insights on web development, software
            engineering, and technology. Sharing what I learn along the way.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* {posts.map((post, index) => (
            <article
              key={index}
              className={`rounded-xl overflow-hidden theme-bg-card theme-shadow hover:theme-shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                theme === "retro" ? "retro-border" : ""
              } ${theme === "futuristic" ? "theme-card-glow" : ""}`}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  height={20}
                  width={20}
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <span
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold theme-bg-accent theme-text-accent ${
                    theme === "retro" ? "border-2 theme-border" : ""
                  }`}
                >
                  {post.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 theme-text-secondary text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-3 theme-text-primary">
                  {post.title}
                </h2>
                <p className="theme-text-secondary mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <button
                  className={`flex items-center gap-2 theme-text-primary hover:theme-text-accent transition-colors font-semibold group ${
                    theme === "retro" ? "retro-button px-3 py-1" : ""
                  }`}
                >
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default Blog;
