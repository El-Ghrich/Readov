"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Lock,
  Trash2,
  ArrowLeft,
  Sliders,
  Save,
  Check,
  Loader2,
  LogOut,
  ChevronRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useToast } from "@/context/ToastContext";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Native"];

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    favoriteLanguage: "English",
    languageLevel: "Beginner",
    autoScroll: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("readov_prefs");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleSavePreferences = () => {
    setIsSaving(true);
    localStorage.setItem("readov_prefs", JSON.stringify(preferences));
    setTimeout(() => {
      setIsSaving(false);
      showToast("Preferences updated locally!", "success");
    }, 800);
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      showToast("User email not found", "error");
      setIsResetting(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setIsResetting(false);
    setShowPasswordModal(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Password reset email sent!", "success");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // In a real production app, you'd call a secure edge function to delete the user from auth.users
    // Here we simulate and redirect
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
      showToast("Account deletion request submitted. (Simulated)", "success");
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in pt-12 fade-in duration-300 max-w-4xl mx-auto pb-10 px-10">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-1">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Adjust your experience and manage account security
        </p>
      </div>

      <div className="grid gap-8 ">
        {/* Preferences Section */}
        <section className="bg-card p-6 md:p-10 rounded-4xl border border-border shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

          <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            Reading Preferences
          </h3>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CustomSelect
                label="Favorite Story Language"
                options={LANGUAGES.map((lang) => ({
                  value: lang,
                  label: lang,
                }))}
                value={preferences.favoriteLanguage}
                onChange={(val) =>
                  setPreferences({ ...preferences, favoriteLanguage: val })
                }
              />

              <CustomSelect
                label="My Proficiency"
                options={LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
                value={preferences.languageLevel}
                onChange={(val) =>
                  setPreferences({ ...preferences, languageLevel: val })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
              <div>
                <p className="text-foreground font-bold">Auto-scroll</p>
                <p className="text-xs text-muted-foreground">
                  Automatically scroll to new story parts as they appear
                </p>
              </div>
              <button
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    autoScroll: !preferences.autoScroll,
                  })
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center shadow-inner ${
                  preferences.autoScroll
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`absolute bg-white w-5 h-5 rounded-full transition-all shadow-md ${
                    preferences.autoScroll ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 ml-auto shadow-lg shadow-primary/20 disabled:opacity-70 disabled:scale-100"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </section>

        {/* Account Security Section */}
        <section className="bg-card p-6 md:p-10 rounded-4xl border border-border shadow-sm overflow-hidden relative">
          <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Lock className="w-5 h-5" />
            </div>
            Security & Account
          </h3>

          <div className="space-y-4">
            <div
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl hover:bg-muted/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-card rounded-xl border border-border/50 shadow-sm group-hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-bold">Password Reset</p>
                  <p className="text-xs text-muted-foreground">
                    Change your password via email link
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>

            <div
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl hover:bg-red-500/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-card rounded-xl border border-red-500/10 shadow-sm group-hover:scale-110 transition-transform">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-red-600 dark:text-red-400 font-bold">
                    Delete Account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove your data and account
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Reset Password"
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-3">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              We will send a secure link to your registered email address to
              change your password. This link will expire in 1 hour.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 px-4 py-2 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordReset}
              disabled={isResetting}
              className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Link
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 flex gap-3">
            <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-red-600 block mb-1">
                Warning: Irreversible Action
              </span>
              All your stories, progress, and personalized settings will be
              permanently erased.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors"
            >
              No, keep it
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Yes, Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
