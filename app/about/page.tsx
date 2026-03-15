import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { getAuthor } from "@/db/queries/authors";
import { getAllPublishedPosts } from "@/db/queries/posts";

export default async function AboutPage() {
  const [author, posts] = await Promise.all([getAuthor(), getAllPublishedPosts()]);

  if (!author) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <p className="text-[#38200D]/50 text-sm">Profile not set up yet.</p>
      </div>
    );
  }

  const about = {
    name: author.name,
    title: author.title,
    avatar: author.avatar,
    bio: author.bio,
    longBio: author.longBio.split("\n\n").filter(Boolean),
    location: author.location,
    email: author.email,
    skills: author.skills,
    social: {
      twitter: author.socialTwitter,
      github: author.socialGithub,
      linkedin: author.socialLinkedin,
    },
  };

  const postCount = posts.length;
  const totalReadTime = posts.reduce((acc, p) => acc + p.readingTime, 0);

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Header />

      {/* Hero */}
      <section className="bg-[#38200D] pt-16 pb-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB5607]/10 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFBE0B]/10 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden ring-4 ring-[#FB5607]/40 shadow-2xl shadow-[#FB5607]/20">
              <Image
                src={about.avatar}
                alt={about.name}
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FFBE0B] rounded-xl flex items-center justify-center shadow-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38200D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[#FF995D] text-sm font-semibold uppercase tracking-widest mb-1">
              About the author
            </p>
            <h1 className="text-white text-4xl sm:text-5xl font-extrabold mb-2">{about.name}</h1>
            <p className="text-[#FFBE0B] font-medium text-lg mb-4">{about.title}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#FF995D]">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {about.location}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {about.email}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-16">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Articles written", value: postCount },
            { label: "Minutes of content", value: `${totalReadTime}+` },
            { label: "Topics covered", value: [...new Set(posts.flatMap((p) => p.tags))].length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 text-center shadow-lg shadow-[#38200D]/5 border border-[#38200D]/5"
            >
              <p className="text-3xl font-extrabold text-[#FB5607]">{stat.value}</p>
              <p className="text-sm text-[#38200D]/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bio */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#38200D]/5">
              <h2 className="text-[#38200D] text-xl font-bold mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FB5607] rounded-full" />
                Hi, I&apos;m {about.name.split(" ")[0]}
              </h2>
              <div className="space-y-4">
                {about.longBio.map((para, i) => (
                  <p key={i} className="text-[#38200D]/70 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#38200D]/5">
              <h2 className="text-[#38200D] text-xl font-bold mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FFBE0B] rounded-full" />
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {about.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-[#3A86FF]/10 text-[#3A86FF] text-sm font-semibold rounded-xl border border-[#3A86FF]/15 hover:bg-[#3A86FF]/20 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Social */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#38200D]/5">
              <h3 className="text-[#38200D] font-semibold mb-4">Find me online</h3>
              <div className="space-y-2">
                {[
                  { label: "Twitter / X", href: about.social.twitter, color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/20" },
                  { label: "GitHub", href: about.social.github, color: "hover:bg-[#38200D]/10 hover:text-[#38200D] hover:border-[#38200D]/20" },
                  { label: "LinkedIn", href: about.social.linkedin, color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/20" },
                ].map(({ label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#38200D]/10 text-[#38200D]/60 text-sm font-medium transition-all ${color}`}
                  >
                    {label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-[#38200D] rounded-2xl p-6 text-center">
              <div className="w-10 h-10 bg-[#FB5607] rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Get in touch</h3>
              <p className="text-[#FF995D] text-xs mb-4 leading-relaxed">
                Have a question or want to collaborate? I&apos;d love to hear from you.
              </p>
              <a
                href={`mailto:${about.email}`}
                className="block px-4 py-2 bg-[#FB5607] text-white text-sm font-semibold rounded-xl hover:bg-[#FF995D] transition-colors"
              >
                Send a message
              </a>
            </div>

            {/* Latest posts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#38200D]/5">
              <h3 className="text-[#38200D] font-semibold mb-4">Latest Posts</h3>
              <div className="space-y-3">
                {posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#FFF8F2]">
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#38200D] line-clamp-2 group-hover:text-[#FB5607] transition-colors leading-snug">
                        {post.title}
                      </p>
                      <p className="text-xs text-[#38200D]/40 mt-0.5">{post.readingTime} min</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/"
                className="block mt-4 text-center text-xs text-[#FB5607] hover:underline font-medium"
              >
                View all posts →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
