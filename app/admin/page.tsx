"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import {
  Shield,
  Trash2,
  Users,
  ArrowLeft,
  Loader2,
  Crown,
  User,
  Eye,
} from "lucide-react";

interface UserItem {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/auth/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch {
      console.error("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden p-6 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-160 h-160 rounded-full bg-amber-500/15 dark:bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-160 h-160 rounded-full bg-violet-500/15 dark:bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Scanner
        </button>

        {/* Header Card */}
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Logged in as{" "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {user?.username}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                All Users ({users.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No users found
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-full ${
                        u.role === "admin"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                          : u.role === "supervisor"
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {u.role === "admin" ? (
                        <Crown className="w-5 h-5" />
                      ) : u.role === "supervisor" ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {u.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : u.role === "supervisor"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {u.role}
                    </span>

                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={deleting === u.id}
                        className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                        title="Delete user"
                      >
                        {deleting === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
