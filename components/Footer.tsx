import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#38200D] text-[#FF995D] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FB5607] flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">ChatBlog</span>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              A space for developers to share knowledge, ideas, and experiences.
              Built with Next.js and passion.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {["Home", "Topics", "About", "Write a Post"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="hover:text-[#FFBE0B] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "CSS",
                "Database",
                "WebSockets",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[#FB5607]/20 text-[#FF995D] text-xs rounded-full border border-[#FB5607]/30 hover:bg-[#FB5607]/40 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#FB5607]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-60">
          <p>© 2024 ChatBlog. All rights reserved.</p>
          <p>Made with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
