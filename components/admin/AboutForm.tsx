"use client";

import { useState } from "react";
import Image from "next/image";
import { saveAuthor } from "@/app/actions/authors";
import type { Author } from "@/db/schema";

interface AboutFormProps {
  initialData: Author | null;
}

export default function AboutForm({ initialData }: AboutFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    title: initialData?.title ?? "",
    avatar: initialData?.avatar ?? "",
    bio: initialData?.bio ?? "",
    longBio: initialData?.longBio ?? "",
    location: initialData?.location ?? "",
    email: initialData?.email ?? "",
    skills: initialData?.skills ?? [],
    social: {
      twitter: initialData?.socialTwitter ?? "",
      github: initialData?.socialGithub ?? "",
      linkedin: initialData?.socialLinkedin ?? "",
    },
  });
  const [skillInput, setSkillInput] = useState("");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const setSocial = (field: string, value: string) =>
    setForm((f) => ({ ...f, social: { ...f.social, [field]: value } }));

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const handleSave = async () => {
    setSaved("saving");
    setError("");
    const result = await saveAuthor(form);
    if (result.success) {
      setSaved("saved");
      setTimeout(() => setSaved("idle"), 3000);
    } else {
      setSaved("idle");
      setError(result.error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#38200D]">About Me</h1>
          <p className="text-sm text-[#38200D]/50 mt-0.5">Edit your personal profile and bio</p>
        </div>
        <div className="flex gap-2">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 self-center">
              {error}
            </p>
          )}
          <a
            href="/about"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-[#38200D]/15 text-[#38200D]/70 text-sm font-medium rounded-xl hover:bg-[#38200D]/5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saved === "saving"}
            className="flex items-center gap-2 px-4 py-2 bg-[#FB5607] text-white text-sm font-semibold rounded-xl hover:bg-[#FB5607]/90 transition-colors shadow-lg shadow-[#FB5607]/20 disabled:opacity-60"
          >
            {saved === "saving" ? "Saving..." : saved === "saved" ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity */}
        <div className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5">
            <h2 className="text-sm font-semibold text-[#38200D] mb-4">Profile Photo</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#FB5607]/20 bg-[#FFF8F2]">
                {form.avatar && !imgError ? (
                  <Image src={form.avatar} alt="Avatar" fill className="object-cover" onError={() => setImgError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38200D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Avatar image URL..."
                value={form.avatar}
                onChange={(e) => { set("avatar", e.target.value); setImgError(false); }}
                className="w-full text-xs text-[#38200D]/70 bg-[#FFF8F2] border border-[#38200D]/10 rounded-xl px-3 py-2 outline-none focus:border-[#FB5607]/40 text-center"
              />
            </div>
          </div>

          {/* Identity fields */}
          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#38200D]">Identity</h2>
            {[
              { label: "Display Name", field: "name", placeholder: "Your full name" },
              { label: "Title / Role", field: "title", placeholder: "e.g. Full-Stack Developer" },
              { label: "Location", field: "location", placeholder: "City, Country" },
              { label: "Email", field: "email", placeholder: "hello@yourblog.com" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-[#38200D]/50 mb-1.5">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => set(field, e.target.value)}
                  className="w-full text-sm text-[#38200D] bg-[#FFF8F2] border border-[#38200D]/10 rounded-xl px-3 py-2 outline-none focus:border-[#FB5607]/40"
                />
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#38200D]">Social Links</h2>
            {[
              { label: "Twitter / X", field: "twitter", icon: "𝕏" },
              { label: "GitHub", field: "github", icon: "⬡" },
              { label: "LinkedIn", field: "linkedin", icon: "in" },
            ].map(({ label, field, icon }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-[#38200D]/50 mb-1.5">{label}</label>
                <div className="flex items-center gap-2 bg-[#FFF8F2] border border-[#38200D]/10 rounded-xl px-3 py-2 focus-within:border-[#FB5607]/40">
                  <span className="text-xs font-bold text-[#38200D]/30">{icon}</span>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.social[field as keyof typeof form.social]}
                    onChange={(e) => setSocial(field, e.target.value)}
                    className="flex-1 text-sm text-[#38200D] bg-transparent outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bio + Skills */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5">
            <label className="block text-sm font-semibold text-[#38200D] mb-3">
              Short Bio
              <span className="ml-2 text-xs font-normal text-[#38200D]/40">Shown in post cards and header</span>
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="w-full text-sm text-[#38200D]/80 bg-[#FFF8F2] border border-[#38200D]/10 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#FB5607]/40 leading-relaxed"
            />
            <p className="text-right text-xs text-[#38200D]/30 mt-1">{form.bio.length}/300</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5 flex-1">
            <label className="block text-sm font-semibold text-[#38200D] mb-3">
              Full Bio
              <span className="ml-2 text-xs font-normal text-[#38200D]/40">Shown on the About page</span>
            </label>
            <textarea
              rows={10}
              value={form.longBio}
              onChange={(e) => set("longBio", e.target.value)}
              className="w-full text-sm text-[#38200D]/80 bg-[#FFF8F2] border border-[#38200D]/10 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#FB5607]/40 leading-relaxed"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5">
            <h2 className="text-sm font-semibold text-[#38200D] mb-3">Skills & Technologies</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add skill or technology..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="flex-1 text-sm text-[#38200D] bg-[#FFF8F2] border border-[#38200D]/10 rounded-xl px-3 py-2 outline-none focus:border-[#FB5607]/40"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-[#FFBE0B] text-[#38200D] text-sm font-semibold rounded-xl hover:bg-[#FFBE0B]/80 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3A86FF]/10 text-[#3A86FF] text-sm font-medium rounded-xl border border-[#3A86FF]/20">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-[#3A86FF]/50 hover:text-red-500 transition-colors leading-none">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
