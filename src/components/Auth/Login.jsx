import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../UI/Loader';
import { sanitizeInput } from '../../utils/sanitize';

const features = [
	{
		title: 'AI-Powered Summaries',
		desc: 'Upload lab reports and get instant, easy-to-understand summaries with actionable recommendations.',
	},
	{
		title: 'Appointment Scheduling',
		desc: 'Book, track, and manage your medical appointments in one place.',
	},
	{
		title: 'Lab Result Trends',
		desc: 'Visualize your health data over time with beautiful, interactive charts.',
	},
	{
		title: 'Secure & Private',
		desc: 'Your data is encrypted and never shared. You are always in control.',
	},
];

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();
	const vantaRef = useRef(null);
	const vantaEffect = useRef(null);

	useEffect(() => {
		let cleanup = () => {};
		let vantaInstance = null;
		import('vanta/dist/vanta.birds.min').then((VANTA) => {
			import('three').then((THREE) => {
				if (!vantaEffect.current && vantaRef.current) {
					vantaInstance = VANTA.BIRDS({
						el: vantaRef.current,
						THREE,
						mouseControls: true,
						touchControls: true,
						gyroControls: false,
						minHeight: 200.0,
						minWidth: 200.0,
						scale: 1.0,
						scaleMobile: 1.0,
					});
					vantaEffect.current = vantaInstance;
				}
			});
		});
		cleanup = () => {
			if (vantaEffect.current) {
				vantaEffect.current.destroy();
				vantaEffect.current = null;
			}
		};
		return cleanup;
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const safeEmail = sanitizeInput(email);
		if (!safeEmail || !password) {
			setError('Please enter both email and password.');
			return;
		}
		try {
			setLoading(true);
			await login(safeEmail, password);
			navigate('/dashboard');
		} catch (err) {
			setError(getErrorMessage(err.code));
			setLoading(false);
		}
	};

	const getErrorMessage = (errorCode) => {
		switch (errorCode) {
			case 'auth/invalid-email':
				return 'Invalid email address format.';
			case 'auth/user-disabled':
				return 'This account has been disabled.';
			case 'auth/user-not-found':
				return 'No account found with this email.';
			case 'auth/wrong-password':
				return 'Incorrect password.';
			default:
				return 'An error occurred during sign in. Please try again.';
		}
	};

	return (
		<div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
			{/* Vanta.js Animated Background */}
			<div
				ref={vantaRef}
				className="fixed inset-0 -z-10"
				style={{ minHeight: '100vh', minWidth: '100vw' }}
			></div>
			{/* Hero Section */}
			<section className="relative flex flex-col items-center justify-center min-h-[80vh] pt-24 pb-16 px-4 z-10">
				<div className="max-w-2xl text-center">
					<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 drop-shadow-lg tracking-tight">
						Med4U: Your Personal Medical Dashboard
					</h1>
					<p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-8">
						Upload, summarize, and track your health records with AI. Book
						appointments, visualize trends, and take control of your medical
						journey.
					</p>
				</div>
				{/* Login Card (glassmorphic, floating) */}
				<div className="w-full max-w-md mx-auto bg-white/70 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 z-20 mt-8 md:mt-0 md:absolute md:right-12 md:top-1/2 md:-translate-y-1/2 animate-fadeInUp backdrop-blur-xl border border-white/30 dark:border-gray-700">
					<h2 className="text-2xl font-bold mb-2 text-center text-primary-700 dark:text-primary-300">
						Sign in to Med4U
					</h2>
					<p className="mb-6 text-center text-gray-500 dark:text-gray-400">
						Or{' '}
						<Link
							to="/signup"
							className="font-medium text-primary-600 hover:text-primary-500"
						>
							create a new account
						</Link>
					</p>
					<form className="space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div className="rounded-md bg-red-50 p-3 text-red-800 text-sm">
								{error}
							</div>
						)}
						<input
							id="email-address"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="input"
							placeholder="Email address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							className="input"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<div className="flex items-center justify-between">
							<Link
								to="/forgot-password"
								className="text-sm font-medium text-primary-600 hover:text-primary-500"
							>
								Forgot your password?
							</Link>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-full"
						>
							{loading ? (
								<Loader size="small" color="white" />
							) : (
								'Sign in'
							)}
						</button>
					</form>
				</div>
			</section>
			{/* Features Section */}
			<section className="relative z-10 py-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-b border-gray-200 dark:border-gray-800">
				<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
					{features.map((f, i) => (
						<div
							key={i}
							className="flex flex-col items-center md:items-start text-center md:text-left"
						>
							<div className="mb-3">
								<span className="inline-block p-3 rounded-full bg-primary-100 dark:bg-primary-900">
									{/* Icon placeholder, you can add icons here */}
									<span className="text-2xl">
										{String.fromCodePoint(0x1F4DD + i)}
									</span>
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
								{f.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								{f.desc}
							</p>
						</div>
					))}
				</div>
			</section>
			{/* Footer Section */}
			<footer className="relative z-10 py-8 text-center text-gray-400 text-xs bg-transparent">
				&copy; {new Date().getFullYear()} Med4U. All rights reserved.
			</footer>
		</div>
	);
};

export default Login;