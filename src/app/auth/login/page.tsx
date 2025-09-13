

'use client'
import React, { useState } from "react";
import { setAuthToken } from '../../../utils/auth';
import { Loader2 } from "lucide-react";

export default function LoginPageCombined() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [err, setErr] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSocialLogin = async (type: "google" | "apple") => {
		setLoading(true);
		setTimeout(() => {
			setAuthToken(`${type.toUpperCase()}_USER_TOKEN`);
			setLoading(false);
			setSuccess(true);
		}, 1200);
	};

	function handle(e: React.FormEvent) {
		e.preventDefault();
		if (!email || !password) return setErr("All fields are required!");
		setErr(null);
		setAuthToken(email);
		setSuccess(true);
	}

	return (
				<div className="fixed inset-0 z-[150] flex items-center justify-center" style={{
					background: "radial-gradient(ellipse at 55% 48%,rgba(80,60,200,0.35) 0 45%,rgba(16,14,32,0.98) 100%)",
					WebkitBackdropFilter: 'blur(22px) saturate(1.8)',
					backdropFilter: 'blur(22px) saturate(1.8)'
				}}>
			<div className="rounded-2xl bg-gradient-to-br from-[#261E39e7] via-[#180C2Af4] to-[#0b0618e7] shadow-2xl border-2 border-purple-600/20 max-w-md w-[90vw] mx-auto py-10 px-8 relative glass-auth-anim space-y-6">
				<h2 className="text-2xl font-bold text-white mb-4 text-center">
					Sign in to Xleos
				</h2>

				<div className="flex flex-col space-y-3 w-full">
					<button
						className="rounded-lg bg-white/10 border border-white/10 flex items-center justify-center gap-2 py-3 w-full text-white font-semibold shadow hover:bg-white/20 transition disabled:opacity-60"
						disabled={loading}
						onClick={() => handleSocialLogin('google')}
					>
						<img src="/google.svg" className="w-5 h-5" alt="Google" />
						{loading ? <Loader2 className="animate-spin" /> : "Sign in with Google"}
					</button>
					<button
						className="rounded-lg bg-white/10 border border-white/10 flex items-center justify-center gap-2 py-3 w-full text-white font-semibold shadow hover:bg-white/20 transition disabled:opacity-60"
						disabled={loading}
						onClick={() => handleSocialLogin('apple')}
					>
						<img src="/apple.svg" className="w-5 h-5" alt="Apple" />
						{loading ? <Loader2 className="animate-spin" /> : "Sign in with Apple"}
					</button>
				</div>

				<div className="flex items-center my-2 w-full">
					<div className="flex-1 h-px bg-white/15" />
					<span className="px-4 text-xs text-white/40">or with Email</span>
					<div className="flex-1 h-px bg-white/15" />
				</div>

				<form
					className="flex flex-col items-center justify-center gap-4"
					style={{ minWidth: 320 }}
					onSubmit={handle}
					autoComplete="off"
				>
					<input
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="Email"
						autoFocus
						className="px-4 py-3 w-full rounded-lg bg-white/10 border border-white/10 text-white/95 shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
					<input
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder="Password"
						className="px-4 py-3 w-full rounded-lg bg-white/10 border border-white/10 text-white/95 shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
					{err && <div className="text-sm text-red-400">{err}</div>}
					<button
						type="submit"
						className="w-full rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 py-2 text-white font-semibold mt-1 shadow-md hover:scale-105 active:scale-95 transition"
					>
						Sign In
					</button>
				</form>
				{success && <div className="text-green-400 text-center mt-4">Login successful!</div>}
			</div>
		</div>
	);
}
