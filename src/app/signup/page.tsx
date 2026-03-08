"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Calendar,
  ArrowRight,
  Loader2,
  Globe,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupSchema } from "@/lib/validations";
import { InputError } from "@/components/ui/InputError";
import { CustomSelect } from "@/components/ui/CustomSelect";

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const LANGUAGES = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Español" },
    { value: "French", label: "Français" },
    { value: "German", label: "Deutsch" },
    { value: "Italian", label: "Italiano" },
    { value: "Portuguese", label: "Português" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Arabic", label: "Arabic" },
    { value: "Russian", label: "Russian" },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      nativeLanguage: "English",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            date_of_birth: data.dateOfBirth,
            native_language: data.nativeLanguage,
          },
        },
      });

      if (authError) throw authError;

      // Success
      router.push(
        "/login?message=Account created! Please check your email to confirm.",
      );
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4e45e3]/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#37248f]/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
        <div
          className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#4e45e3]/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 py-25 w-full max-w-xl">
        <div className="bg-card/40 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <Link href="/">
              <img
                src={
                  theme === "light" ? "/logo_purple.png" : "/img/logo_white.png"
                }
                alt="Readov"
                className="h-12 w-auto mx-auto mb-6 hover:scale-105 transition-transform"
              />
            </Link>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Create Account
            </h2>
            <p className="text-muted-foreground">
              Join Readov and start your storytelling journey
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      {...register("firstName")}
                      placeholder="First Name"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all hover:bg-background/80 ${
                        errors.firstName
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-border focus:border-primary focus:ring-primary"
                      }`}
                      aria-invalid={!!errors.firstName}
                    />
                  </div>
                  <InputError message={errors.firstName?.message} />
                </div>
                <div className="space-y-1 relative group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      {...register("lastName")}
                      placeholder="Last Name"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all hover:bg-background/80 ${
                        errors.lastName
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-border focus:border-primary focus:ring-primary"
                      }`}
                      aria-invalid={!!errors.lastName}
                    />
                  </div>
                  <InputError message={errors.lastName?.message} />
                </div>
              </div>

              <div className="space-y-1 relative group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Email address"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all hover:bg-background/80 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-primary"
                    }`}
                    aria-invalid={!!errors.email}
                  />
                </div>
                <InputError message={errors.email?.message} />
              </div>

              <div className="space-y-1 relative group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all hover:bg-background/80 ${
                      errors.dateOfBirth
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-primary"
                    }`}
                    aria-invalid={!!errors.dateOfBirth}
                  />
                </div>
                <InputError message={errors.dateOfBirth?.message} />
              </div>

              <div className="space-y-1 relative group">
                <Controller
                  name="nativeLanguage"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={LANGUAGES}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.nativeLanguage?.message}
                      placeholder="Select Native Language"
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div className="space-y-1 relative group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Password"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all hover:bg-background/80 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-primary"
                    }`}
                    aria-invalid={!!errors.password}
                  />
                </div>
                <InputError message={errors.password?.message} />
              </div>

              <div className="space-y-1 relative group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Confirm Password"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all hover:bg-background/80 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-border focus:border-primary focus:ring-primary"
                    }`}
                    aria-invalid={!!errors.confirmPassword}
                  />
                </div>
                <InputError message={errors.confirmPassword?.message} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 px-4 group relative"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
              {!loading && (
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 underline transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
