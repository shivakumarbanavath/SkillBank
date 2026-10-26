import Link from "next/link";
import { ExternalLink } from "lucide-react";

const footerLinks = {
  Platform: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/discover", label: "Explore Skills" },
    { href: "/pricing", label: "Pricing" },
    { href: "/courses", label: "Courses" },
    { href: "/workshops", label: "Workshops" },
    { href: "/events", label: "Events" },
  ],
  Community: [
    { href: "/about", label: "About Us" },
    { href: "/community-guidelines", label: "Community Guidelines" },
    { href: "/safety", label: "Trust & Safety" },
    { href: "/blog", label: "Blog" },
  ],
  Support: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact Us" },
    { href: "/faq", label: "FAQ" },
  ],
};

const socialLinks = [
  { href: "https://twitter.com", label: "Twitter", text: "𝕏" },
  { href: "https://linkedin.com", label: "LinkedIn", text: "in" },
  { href: "https://github.com", label: "GitHub", text: "<>" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="SkillBank home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="font-bold text-lg text-white">
                Skill<span className="text-blue-400">Bank</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Your Skills Are Worth More Than You Think. Teach what you know.
              Learn what you love. Build a community of knowledge exchange.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xs font-bold"
                  aria-label={s.label}
                >
                  {s.text}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2.5" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SkillBank. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Built with <span className="text-red-400">♥</span> for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
