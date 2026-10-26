import {
  getAdminStats,
  getAdminUsers,
  getAdminVerifications,
  getAdminReports,
  getAdminAuditLogs,
} from "@/actions/admin";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata = {
  title: "Admin Command Center | SkillBank",
  description: "SkillBank platform administration, user management, and safety moderation",
};

export default async function AdminPage() {
  const [statsRes, usersRes, verificationsRes, reportsRes, logsRes] = await Promise.all([
    getAdminStats(),
    getAdminUsers(),
    getAdminVerifications(),
    getAdminReports(),
    getAdminAuditLogs(),
  ]);

  const defaultStats = {
    totalUsers: 0,
    totalSkills: 0,
    completedSessions: 0,
    circulatingCredits: 0,
    totalCreditsEarned: 0,
    pendingVerifications: 0,
    openReports: 0,
    openDisputes: 0,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminConsole
        stats={statsRes.stats || defaultStats}
        users={usersRes.users || []}
        verifications={verificationsRes.requests || []}
        reports={reportsRes.reports || []}
        auditLogs={logsRes.logs || []}
      />
    </div>
  );
}
