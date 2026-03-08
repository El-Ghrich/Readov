"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Mail,
  Zap,
  ArrowLeft,
  UserIcon,
  Save,
  Calendar,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validations";
import { InputError } from "@/components/ui/InputError";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useToast } from "@/context/ToastContext";
import { z } from "zod";

type ProfileFormValues = z.infer<typeof profileSchema>;

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Arabic", label: "Arabic" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const supabase = createClient();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        reset({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          dateOfBirth: profile.date_of_birth || "",
          nativeLanguage: profile.native_language || "English",
        });
      }
      setLoading(false);
    }
    loadData();
  }, [router, supabase, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          native_language: data.nativeLanguage,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Also update auth metadata to keep them in sync
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          native_language: data.nativeLanguage,
        },
      });

      if (authError) throw authError;

      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Error updating profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-8">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p>Gathering your details...</p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in pt-12 fade-in duration-300 max-w-4xl mx-auto pb-10">
      <div className="flex items-center pl-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">
            My Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <section className="bg-card p-6 md:p-10 rounded-4xl border border-border shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

          <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            Personal Information
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 relative z-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1">
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  className={`w-full px-4 py-3 bg-muted/30 border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.firstName
                      ? "border-red-500"
                      : "border-border hover:border-border/80"
                  }`}
                />
                <InputError message={errors.firstName?.message} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1">
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  className={`w-full px-4 py-3 bg-muted/30 border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.lastName
                      ? "border-red-500"
                      : "border-border hover:border-border/80"
                  }`}
                />
                <InputError message={errors.lastName?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">
                Email (Read Only)
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border border-border/50 rounded-xl text-muted-foreground italic">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Birth
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className={`w-full px-4 py-3 bg-muted/30 border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.dateOfBirth
                      ? "border-red-500"
                      : "border-border hover:border-border/80"
                  }`}
                />
                <InputError message={errors.dateOfBirth?.message} />
              </div>
              <div className="space-y-2">
                <Controller
                  name="nativeLanguage"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label="Native Language"
                      options={LANGUAGES}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.nativeLanguage?.message}
                      className="w-full"
                    />
                  )}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">
                  My Plan
                </label>
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full w-fit">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold capitalize text-primary">
                    {user?.user_metadata?.plan || "Free"} Member
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-10 py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:shadow-[0_8px_30px_rgba(78,69,227,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
