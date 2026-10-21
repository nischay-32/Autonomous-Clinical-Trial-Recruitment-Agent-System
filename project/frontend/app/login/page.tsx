"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setSession(res.token, res.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Check the work email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f4f5f7]">
      <div className="hidden md:flex flex-col justify-between p-12 bg-[#1a2332] text-white">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={36} height={36} />
          <span className="font-serif text-[20px]">TrialScreen</span>
        </Link>
        <div className="max-w-[380px]">
          <h2 className="font-serif text-[28px] leading-snug">Coordinator sign-in</h2>
          <p className="mt-4 text-[14px] text-[#c5cad3] leading-relaxed">
            Use the account issued by your institution. Session tokens stay in this browser. Patient records are not stored on TrialScreen cloud servers.
          </p>
        </div>
        <p className="text-[13px] text-[#8b93a1]">CI_PR_13, JSSATEB, VTU</p>
      </div>

      <div className="flex flex-col justify-center px-8 sm:px-14 py-12 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <Link href="/" className="flex items-center gap-2.5 mb-8 md:hidden">
            <Image src="/logo.png" alt="" width={32} height={32} />
            <span className="font-serif text-[18px] text-[#1a2332]">TrialScreen</span>
          </Link>

          <h1 className="font-serif text-[26px] text-[#1a2332]">Sign in</h1>
          <p className="text-[13px] mt-1.5 mb-7 text-[#4d5663]">
            Work email and password for the recruitment console.
          </p>

          {error && (
            <div className="mb-5 p-3 text-[13px] bg-[#fdecea] border border-[#f4c7c3] text-[#b42318]" role="alert">
              {error}
            </div>
          )}

          <div className="mb-6 p-3 border border-[#d5d9e0] bg-[#f4f5f7] flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#4d5663]">
              Academic demo: <span className="font-mono text-[#1a2332]">croberts@memorial-cancer.org</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("croberts@memorial-cancer.org");
                setPassword("demo123");
                setError(null);
              }}
              className="btn btn-secondary text-[12px] min-h-8 py-1"
            >
              Fill demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[12px] font-semibold mb-1.5">Work email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1.5">
                <label htmlFor="password" className="block text-[12px] font-semibold">Password</label>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[12px] mt-6 text-[#4d5663]">
            No account?{" "}
            <Link href="/register" className="font-semibold text-[#0b5f5a] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
