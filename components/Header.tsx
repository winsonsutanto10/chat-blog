import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#38200D] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
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
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-[#FFBE0B] transition-colors">
              ChatBlog
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-[#FF995D] hover:text-[#FFBE0B] transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-[#FF995D] hover:text-[#FFBE0B] transition-colors text-sm font-medium"
            >
              Topics
            </Link>
            <Link
              href="/about"
              className="text-[#FF995D] hover:text-[#FFBE0B] transition-colors text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="#"
              className="ml-2 px-4 py-1.5 bg-[#FB5607] text-white text-sm font-semibold rounded-full hover:bg-[#FF995D] transition-colors"
            >
              Write a Post
            </Link>
          </nav>

          <button className="md:hidden text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
