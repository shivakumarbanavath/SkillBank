"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProfile, ProfileInput } from "@/actions/profile";
import { User, Globe, MapPin, Building2, School, Check, AlertCircle, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProfileEditFormProps {
  initialProfile: {
    username: string;
    displayName: string;
    bio?: string | null;
    campus?: string | null;
    institution?: string | null;
    city?: string | null;
    avatar?: string | null;
    languages: string[];
    preferredFormat: "IN_PERSON" | "ONLINE" | "EITHER";
    isPublic: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
  userEmail: string;
}

const COMMON_LANGUAGES = [
  "English", "Hindi", "Malayalam", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali", "Spanish", "French", "German"
];

export function ProfileEditForm({ initialProfile, userEmail }: ProfileEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: initialProfile.displayName || "",
    username: initialProfile.username || "",
    bio: initialProfile.bio || "",
    campus: initialProfile.campus || "",
    institution: initialProfile.institution || "",
    city: initialProfile.city || "",
    avatar: initialProfile.avatar || "",
    preferredFormat: initialProfile.preferredFormat || "EITHER",
    languages: initialProfile.languages || [],
    isPublic: initialProfile.isPublic ?? true,
    showEmail: initialProfile.showEmail ?? false,
    showLocation: initialProfile.showLocation ?? true,
  });

  const [languageInput, setLanguageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function toggleLanguage(lang: string) {
    setFormData((prev) => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang],
      };
    });
  }

  function addCustomLanguage() {
    const trimmed = languageInput.trim();
    if (!trimmed || formData.languages.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, languages: [...prev.languages, trimmed] }));
    setLanguageInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const result = await upsertProfile({
      username: formData.username,
      displayName: formData.displayName,
      bio: formData.bio || undefined,
      campus: formData.campus || undefined,
      institution: formData.institution || undefined,
      city: formData.city || undefined,
      avatar: formData.avatar || undefined,
      languages: formData.languages,
      preferredFormat: formData.preferredFormat,
      isPublic: formData.isPublic,
      showEmail: formData.showEmail,
      showLocation: formData.showLocation,
    });

    setLoading(false);

    if (result.success) {
      setStatusMessage({ type: "success", text: "Profile updated successfully!" });
      router.refresh();
    } else {
      setStatusMessage({ type: "error", text: result.error || "Failed to update profile" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            statusMessage.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {statusMessage.type === "success" ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">General Information</h2>
            <p className="text-sm text-slate-400">Basic details about your public presence</p>
          </div>
          {formData.username && (
            <Link
              href={`/profile/${formData.username}`}
              target="_blank"
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="input w-full"
              placeholder="e.g. Alex Kumar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-blue-500">
              <span className="bg-white/5 px-3 py-2 text-sm text-slate-400 flex items-center border-r border-white/10">
                @
              </span>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                className="input w-full border-none rounded-none focus:ring-0"
                placeholder="alexkumar"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Lowercase letters, numbers, and underscores only</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input w-full"
            placeholder="Tell the community what you're passionate about, what you study, or your learning goals..."
          />
          <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/500 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Avatar Image URL</label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="input w-full"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      {/* Campus & Location */}
      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Campus & Hyperlocal Location</h2>
          <p className="text-sm text-slate-400">Helps connect you with peers on your campus or nearby</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-blue-400" /> Campus / Department
            </label>
            <input
              type="text"
              value={formData.campus}
              onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
              className="input w-full"
              placeholder="e.g. North Campus, CSE Dept"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-400" /> College / Institution
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="input w-full"
              placeholder="e.g. NIT Calicut, IIT Bombay"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input w-full"
              placeholder="e.g. Kozhikode, Bangalore"
            />
          </div>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Exchange Preferences</h2>
          <p className="text-sm text-slate-400">How you prefer to exchange knowledge</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Session Format</label>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { id: "EITHER", title: "Either Format", desc: "Open to both in-person and online" },
              { id: "ONLINE", title: "Online Only", desc: "Remote via Google Meet / Zoom" },
              { id: "IN_PERSON", title: "In-Person Only", desc: "Physical meetups on campus" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setFormData({ ...formData, preferredFormat: fmt.id as any })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.preferredFormat === fmt.id
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="font-semibold text-white">{fmt.title}</div>
                <div className="text-xs text-slate-400 mt-1">{fmt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Languages Spoken</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_LANGUAGES.map((lang) => {
              const selected = formData.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {selected && "✓ "}
                  {lang}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomLanguage();
                }
              }}
              className="input flex-1 text-sm"
              placeholder="Add other language..."
            />
            <button
              type="button"
              onClick={addCustomLanguage}
              className="btn btn-secondary btn-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Privacy & Visibility</h2>
          <p className="text-sm text-slate-400">Control who can discover you on the platform</p>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white/10 border-white/20"
            />
            <div>
              <p className="text-sm font-medium text-white">Public Profile</p>
              <p className="text-xs text-slate-400">Allow other students to find you in Discover and search</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showLocation}
              onChange={(e) => setFormData({ ...formData, showLocation: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white/10 border-white/20"
            />
            <div>
              <p className="text-sm font-medium text-white">Show Campus & City</p>
              <p className="text-xs text-slate-400">Display your campus and city on your public profile</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg min-w-[160px]"
        >
          {loading ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
