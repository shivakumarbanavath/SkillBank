"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, X, Star, MapPin, Clock, BookOpen, Heart } from "lucide-react";
import { cn, getProficiencyLabel, getFormatLabel, parseJsonSafe } from "@/lib/utils";
import { addLearningInterest } from "@/actions/skills";
import { useToast } from "@/components/ui/toaster";

interface SkillResult {
  id: string;
  skillName: string;
  description: string | null;
  proficiency: string;
  format: string;
  duration: number;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  completedSessions: number;
  category: { id: string; name: string };
  user: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      campus?: string | null;
      avatar?: string | null;
    } | null;
  };
}


interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DiscoverClientProps {
  initialSkills: SkillResult[];
  total: number;
  pages: number;
  currentPage: number;
  categories: Category[];
  currentUserId?: string;
}

export function DiscoverClient({
  initialSkills, total, pages, currentPage, categories, currentUserId,
}: DiscoverClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [addingInterest, setAddingInterest] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/discover?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("search", search);
  }

  async function handleAddInterest(skill: SkillResult) {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    setAddingInterest(skill.id);
    const result = await addLearningInterest({
      categoryId: skill.category.id,
      skillName: skill.skillName,
    });
    setAddingInterest(null);
    if (result.success) {
      toast({
        type: "success",
        title: "Added to learning interests",
        description: `${skill.skillName} added. Check your matches!`,
      });
    } else {
      toast({ type: "error", title: "Error", description: result.error });
    }
  }

  const selectedCategory = searchParams.get("category") ?? "";
  const selectedFormat = searchParams.get("format") ?? "";
  const hasFilters = !!(searchParams.get("search") || selectedCategory || selectedFormat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Discover Skills</h1>
        <p className="text-slate-400 mt-1">
          {total} skill{total !== 1 ? "s" : ""} available from teachers in your community
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex-1 min-w-64 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills, topics..."
              className="input-md pl-9 w-full"
              aria-label="Search skills"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-md">
            Search
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn("btn btn-md", showFilters ? "btn-primary" : "btn-secondary")}
          aria-expanded={showFilters}
        >
          <Filter className="w-4 h-4" /> Filters
          {hasFilters && <span className="w-2 h-2 bg-blue-300 rounded-full" />}
        </button>
        {hasFilters && (
          <Link href="/discover" className="btn btn-ghost btn-md">
            <X className="w-4 h-4" /> Clear
          </Link>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-5 flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyFilter("category", "")}
                className={cn("badge cursor-pointer transition-all", !selectedCategory ? "badge-blue" : "badge-gray")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => applyFilter("category", cat.id)}
                  className={cn("badge cursor-pointer transition-all", selectedCategory === cat.id ? "badge-blue" : "badge-gray")}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Format</p>
            <div className="flex flex-wrap gap-2">
              {[{ v: "", l: "All" }, { v: "IN_PERSON", l: "In Person" }, { v: "ONLINE", l: "Online" }, { v: "EITHER", l: "Either" }].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => applyFilter("format", opt.v)}
                  className={cn("badge cursor-pointer transition-all", selectedFormat === opt.v ? "badge-blue" : "badge-gray")}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results grid */}
      {initialSkills.length === 0 ? (
        <div className="card p-16 text-center flex flex-col items-center gap-4">
          <Search className="w-12 h-12 text-slate-600" />
          <div>
            <p className="text-white font-semibold">No skills found</p>
            <p className="text-slate-400 text-sm mt-1">Try different search terms or clear filters</p>
          </div>
          <Link href="/discover" className="btn btn-secondary btn-md">Clear Filters</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              currentUserId={currentUserId}
              onAddInterest={handleAddInterest}
              addingInterest={addingInterest}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/discover?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(p) })}`}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                p === currentPage ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({
  skill, currentUserId, onAddInterest, addingInterest,
}: {
  skill: SkillResult;
  currentUserId?: string;
  onAddInterest: (s: SkillResult) => void;
  addingInterest: string | null;
}) {
  const isOwner = skill.user.id === currentUserId;

  return (
    <div className="card p-5 flex flex-col gap-4 hover:border-blue-500/30 transition-all duration-300 group">
      {/* Teacher */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {skill.user.profile?.displayName?.[0]?.toUpperCase() ?? "T"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {skill.user.profile?.displayName}
          </p>
          {skill.user.profile?.campus && (
            <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" /> {skill.user.profile.campus}
            </p>
          )}
        </div>
        {skill.avgRating > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-white">{skill.avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Skill details */}
      <div className="flex-1">
        <p className="font-semibold text-white mb-1">{skill.skillName}</p>
        <p className="text-sm text-slate-400 line-clamp-2">{skill.description}</p>
      </div>

      {/* Tags & badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="badge badge-blue">{skill.category.name}</span>
        <span className="badge badge-gray">{getProficiencyLabel(skill.proficiency)}</span>
        <span className="badge badge-gray">{getFormatLabel(skill.format)}</span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {skill.duration}min
        </span>
        {skill.completedSessions > 0 && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> {skill.completedSessions} done
          </span>
        )}
        {skill.reviewCount > 0 && (
          <span>{skill.reviewCount} review{skill.reviewCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/skills/${skill.id}`}
          className="btn btn-primary btn-sm flex-1 justify-center"
        >
          {isOwner ? "View Skill" : "Request Session"}
        </Link>
        {!isOwner && (
          <button
            onClick={() => onAddInterest(skill)}
            disabled={addingInterest === skill.id}
            className="btn btn-secondary btn-sm"
            title="Add to learning interests"
            aria-label={`Add ${skill.skillName} to learning interests`}
          >
            <Heart className={cn("w-4 h-4", addingInterest === skill.id && "animate-pulse")} />
          </button>
        )}
      </div>
    </div>
  );
}
