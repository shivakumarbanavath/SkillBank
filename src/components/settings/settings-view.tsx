"use client";

import { useState } from "react";
import { updatePassword, deactivateAccount } from "@/actions/auth";
import { Lock, ShieldAlert, KeyRound, Check, AlertCircle, Bell, User, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SettingsViewProps {
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
    profile: {
      displayName: string;
      username: string;
    } | null;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deactivate state
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long" });
      return;
    }

    setPasswordLoading(true);
    const res = await updatePassword({ currentPassword, newPassword });
    setPasswordLoading(false);

    if (res.success) {
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: res.error || "Failed to update password" });
    }
  }

  async function handleDeactivate() {
    setDeactivateLoading(true);
    await deactivateAccount();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Account Info */}
      <div className="card p-6 md:p-8 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" /> Account Details
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-500">Email Address</span>
            <p className="text-white font-semibold text-sm">{user.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-500">Username</span>
            <p className="text-white font-semibold text-sm">@{user.profile?.username ?? "user"}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-500">Account Role</span>
            <p className="text-white font-semibold text-sm capitalize">{user.role.toLowerCase()}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-500">Member Since</span>
            <p className="text-white font-semibold text-sm">
              {format(new Date(user.createdAt), "MMMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" /> Change Password
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Update your account password to ensure continued security
          </p>
        </div>

        {passwordMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              passwordMessage.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {passwordMessage.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input w-full text-sm bg-white/5 border-white/10"
              placeholder="••••••••"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full text-sm bg-white/5 border-white/10"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full text-sm bg-white/5 border-white/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-primary btn-md min-w-[160px]"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 md:p-8 space-y-4 border-red-500/20 bg-red-950/10">
        <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Danger Zone
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Deactivating your account will immediately hide your teaching skills, cancel active session
          requests, and sign you out. Your public profile will no longer be visible.
        </p>

        {deactivateConfirm ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
            <p className="text-xs text-red-300 font-semibold">
              Are you absolutely sure you want to deactivate your SkillBank account?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeactivateConfirm(false)}
                className="btn btn-secondary btn-sm text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivateLoading}
                className="btn btn-primary btn-sm bg-red-600 hover:bg-red-700 text-white border-none text-xs"
              >
                {deactivateLoading ? "Deactivating..." : "Yes, Deactivate My Account"}
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setDeactivateConfirm(true)}
              className="btn btn-secondary btn-sm text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              Deactivate Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
