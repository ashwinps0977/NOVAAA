import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authAPI } from "../../services/api";
import Logo from "../../components/Logo";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await authAPI.forgotPassword(email);
            if (res.success) {
                setSubmitted(true);
                setMessage(res.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white text-gray-800">
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <Logo />
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                            <p className="text-gray-600">Enter your email to receive a reset link</p>
                        </div>

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">Link Sent!</h3>
                                    <p className="text-gray-600">{message}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Didn't receive an email? Check your spam folder or try again.
                                </p>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
