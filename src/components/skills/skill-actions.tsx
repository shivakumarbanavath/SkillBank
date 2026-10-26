"use client";

import { useState } from "react";
import { toggleSkillStatus, deleteSkill } from "@/actions/skills";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface SkillActionsProps {
  skillId: string;
  isActive: boolean;
  skillName: string;
}

export function SkillActions({ skillId, isActive, skillName }: SkillActionsProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleToggle() {
    setToggling(true);
    const result = await toggleSkillStatus(skillId);
    setToggling(false);
    if (result.success) {
      toast({
        type: "success",
        title: result.isActive ? "Skill activated" : "Skill deactivated",
        description: `${skillName} is now ${result.isActive ? "visible" : "hidden"} to learners`,
      });
      router.refresh();
    } else {
      toast({ type: "error", title: "Error", description: result.error });
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    const result = await deleteSkill(skillId);
    setDeleting(false);
    if (result.success) {
      toast({ type: "success", title: "Skill deleted", description: skillName });
      router.refresh();
    } else {
      toast({ type: "error", title: "Cannot delete", description: result.error });
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={`/skills/${skillId}/edit`}
        className="btn btn-secondary btn-sm"
        aria-label={`Edit ${skillName}`}
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit
      </Link>

      <button
        onClick={handleToggle}
        disabled={toggling}
        className="btn btn-secondary btn-sm"
        aria-label={isActive ? `Deactivate ${skillName}` : `Activate ${skillName}`}
      >
        {toggling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isActive ? (
          <ToggleRight className="w-4 h-4 text-green-400" />
        ) : (
          <ToggleLeft className="w-4 h-4 text-slate-500" />
        )}
      </button>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className={`btn btn-sm ${confirmDelete ? "btn-danger" : "btn-secondary"}`}
        aria-label={confirmDelete ? `Confirm delete ${skillName}` : `Delete ${skillName}`}
        title={confirmDelete ? "Click again to confirm" : "Delete skill"}
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        {confirmDelete && <span className="text-xs">Confirm</span>}
      </button>
    </div>
  );
}
