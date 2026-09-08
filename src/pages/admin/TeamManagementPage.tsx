import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { authService } from '../../auth/authService';
import { TeamMember, TeamRole, PlatformRole } from '../../types';
import {
  Users,
  Shield,
  Code2,
  Database,
  BrainCircuit,
  CheckCircle,
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  Check,
  AlertCircle
} from 'lucide-react';

const TEAM_ROLE_DETAILS: Record<TeamRole, { label: string; icon: any; color: string; desc: string }> = {
  TEAM_LEAD: {
    label: 'Team Lead',
    icon: Shield,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    desc: 'Engineering leadership, architecture oversight & deployment management',
  },
  BACKEND: {
    label: 'Backend Lead',
    icon: Code2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    desc: 'API services, Supabase PostgreSQL functions, escrow workflows & RLS',
  },
  FRONTEND: {
    label: 'Frontend Lead',
    icon: Code2,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    desc: 'React 19, responsive UX, real-time marketplace & state management',
  },
  DATABASE: {
    label: 'Database Architect',
    icon: Database,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    desc: 'Schema design, indexing, replication, audit integrity & migrations',
  },
  AI_ML: {
    label: 'AI / ML Engineer',
    icon: BrainCircuit,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    desc: 'Mandi price prediction models, quality grading CV & buyer matching',
  },
  QA: {
    label: 'QA Engineer',
    icon: CheckCircle,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    desc: 'Security auditing, end-to-end user flow testing & load benchmarks',
  },
};

const PLATFORM_ROLE_BADGES: Record<PlatformRole, { color: string; border: string }> = {
  ADMIN: { color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/30' },
  FARMER: { color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/30' },
  SELLER: { color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30' },
  BUYER: { color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/30' },
};

export interface TeamMemberDisplay {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  platformRole: PlatformRole;
  teamRole: TeamRole;
  accountStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  assignedAt: string;
}

const CONFIRMED_TEAM_ROSTER: TeamMemberDisplay[] = [
  {
    id: 'team-1',
    fullName: 'Om Nalawade',
    email: 'om.nalawade.aids.25@vpkbiet.org',
    platformRole: 'ADMIN',
    teamRole: 'TEAM_LEAD',
    accountStatus: 'ACTIVE',
    assignedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'team-2',
    fullName: 'Date Atharv',
    email: 'dateathrav@gmail.com',
    platformRole: 'FARMER',
    teamRole: 'BACKEND',
    accountStatus: 'ACTIVE',
    assignedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'team-3',
    fullName: 'Yash Lokhande',
    email: 'yashlokhande082@gmail.com',
    platformRole: 'SELLER',
    teamRole: 'FRONTEND',
    accountStatus: 'ACTIVE',
    assignedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'team-4',
    fullName: 'Shravani Bhosale',
    email: 'shravani2.bhosale.comp.25@vpkbiet.org',
    platformRole: 'FARMER',
    teamRole: 'DATABASE',
    accountStatus: 'ACTIVE',
    assignedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'team-5',
    fullName: 'Anuj Deshpande',
    email: 'anuj.deshpande.comp.25@vpkbiet.org',
    platformRole: 'BUYER',
    teamRole: 'AI_ML',
    accountStatus: 'ACTIVE',
    assignedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'team-6',
    fullName: 'Prajwal Khomane',
    email: 'Prajwal.khomane.aids.25@vppkbiet.org',
    platformRole: 'BUYER',
    teamRole: 'QA',
    accountStatus: 'ACTIVE',
    assignedAt: '2026-09-01T00:00:00Z',
  },
];

export const TeamManagementPage: React.FC = () => {
  const { teamMember } = useAuth();
  const [displayMembers, setDisplayMembers] = useState<TeamMemberDisplay[]>(CONFIRMED_TEAM_ROSTER);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole>('TEAM_LEAD');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const dbMembers = await authService.fetchTeamMembers();

      // Merge database records with confirmed roster
      const merged = CONFIRMED_TEAM_ROSTER.map((rosterItem) => {
        const matched = dbMembers.find(
          (db) =>
            db.email?.toLowerCase() === rosterItem.email.toLowerCase() ||
            (rosterItem.userId && db.userId === rosterItem.userId)
        );

        if (matched) {
          return {
            ...rosterItem,
            id: matched.id,
            userId: matched.userId,
            fullName: matched.fullName || rosterItem.fullName,
            teamRole: matched.teamRole,
            accountStatus: (matched.accountStatus as any) || 'ACTIVE',
            assignedAt: matched.assignedAt,
            isPendingSlot: false,
          };
        }
        return rosterItem;
      });

      setDisplayMembers(merged);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: TeamRole) => {
    try {
      setErrorNotice(null);
      await authService.assignTeamRole(userId, newRole);
      setSuccessNotice(`Updated team role to ${newRole}`);
      setEditingId(null);
      await loadMembers();
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to update team role.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Internal Engineering & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            <span>AgriTech Team Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Directory of the 6 internal platform team members. Access is strictly controlled via Supabase Row-Level Security (RLS) and database trigger guards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl">
          <Shield className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400">Current Session Role:</span>
            <div className="font-semibold text-white">
              {teamMember ? `${teamMember.teamRole} (Internal)` : 'Platform Administrator'}
            </div>
          </div>
        </div>
      </div>

      {/* Security Constraints Alert */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">No Self-Creation</div>
            <div className="text-slate-400 mt-0.5">
              Team members table has strict RLS. Regular users and public actors cannot insert themselves into engineering roles.
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">Trigger Enforced Guard</div>
            <div className="text-slate-400 mt-0.5">
              `protect_profile_role()` trigger rejects any non-admin attempt to elevate platform privilege or manipulate team role.
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">Audit Trail Enabled</div>
            <div className="text-slate-400 mt-0.5">
              Every assignment change is permanently logged to the immutable `audit_logs` table with timestamp and assigner ID.
            </div>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMembers.map((member, idx) => {
          const roleConfig = TEAM_ROLE_DETAILS[member.teamRole] || TEAM_ROLE_DETAILS.TEAM_LEAD;
          const RoleIcon = roleConfig.icon;
          const isEditing = editingId === member.id;

          return (
            <div
              key={member.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all shadow-lg relative overflow-hidden group"
            >
              {/* Member number pill */}
              <div className="absolute top-5 right-5 text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                Member {idx + 1} of 6
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${roleConfig.color}`}>
                    <RoleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">
                      {member.fullName}
                    </h3>
                    <span className="text-xs text-slate-400 block truncate max-w-[200px]">
                      {member.email}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        PLATFORM_ROLE_BADGES[member.platformRole]?.color || 'text-emerald-400 bg-emerald-500/10'
                      } ${PLATFORM_ROLE_BADGES[member.platformRole]?.border || 'border-emerald-500/20'}`}>
                        {member.platformRole}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        member.accountStatus === 'ACTIVE'
                          ? 'bg-slate-800 text-slate-300'
                          : member.accountStatus === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {member.accountStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assigned Team Role
                    </div>
                    {isEditing && member.userId ? (
                      <div className="space-y-2 mt-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs text-white p-2 focus:ring-2 focus:ring-emerald-500"
                        >
                          {(Object.keys(TEAM_ROLE_DETAILS) as TeamRole[]).map((r) => (
                            <option key={r} value={r}>
                              {TEAM_ROLE_DETAILS[r].label}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRole(member.userId!, selectedRole)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md cursor-pointer font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs bg-slate-800 text-slate-400 hover:text-white px-3 py-1 rounded-md cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                        {member.userId && (
                          <button
                            onClick={() => {
                              setEditingId(member.id);
                              setSelectedRole(member.teamRole);
                            }}
                            className="text-[11px] text-slate-400 hover:text-emerald-400 underline cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {roleConfig.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created / Assigned</span>
                </span>
                <span className="font-mono text-slate-400">
                  {member.assignedAt.includes('T') ? new Date(member.assignedAt).toLocaleDateString() : member.assignedAt}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
