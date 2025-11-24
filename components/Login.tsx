// components/Login.tsx
import React, { useState } from 'react';
// These are your UI icons, correctly imported
import { Building, Lock, User, ShieldCheck } from 'lucide-react';
// Firebase Authentication imports
import { signInWithEmailAndPassword } from 'firebase/auth';
// Import your 'auth' instance from the configured firebase.ts service file
import { auth } from '../services/firebase';
// Assuming UserProfile is a type you've defined in your project
import { UserProfile } from '../types';

interface LoginProps {
  // This prop is optional and if used, should likely be checked against the authenticated user.
  // For basic Firebase email/password login, it's not strictly necessary for the auth flow itself.
  registeredUsers?: UserProfile[];
}

export const Login: React.FC<LoginProps> = ({ registeredUsers }) => {
  // Login State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for displaying errors and managing loading feedback
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission
    setError(''); // Clear any previous error messages
    setIsLoading(true); // Indicate that a login attempt is in progress

    try {
      // THIS IS THE CORE FIREBASE AUTHENTICATION CALL
      // It uses the 'auth' object and the provided email/password to attempt a login.
      await signInWithEmailAndPassword(auth, email, password);
      // If successful, Firebase automatically triggers the onAuthStateChanged listener
      // in your App.tsx (or wherever you've set it up), which will handle navigation
      // or state updates for the logged-in user.
      console.log("User logged in successfully!"); // For console verification

    } catch (err: any) {
      // Catch any errors returned by Firebase during the login attempt
      console.error("Login Error:", err); // Log the full error for debugging

      // Provide user-friendly error messages based on Firebase error codes
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        // Generic error for unexpected issues
        setError('An unexpected error occurred. Please check your connection and try again.');
      }
      setIsLoading(false); // Turn off loading state if login fails
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in duration-500">
        <div className="bg-brand-900 p-10 text-center relative overflow-hidden">
           {/* Visual background elements if any */}
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                 <Building size={32} className="text-brand-500" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white tracking-wide">GABINAS PROPERTIES</h1>
              <p className="text-brand-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 opacity-90">Management Portal</p>
           </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="text-brand-500" size={20} />
            <h2 className="text-xl font-bold text-slate-800">Secure Login</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error display */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center justify-center text-center">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading} // Disable input while loading
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading} // Disable input while loading
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading} // Disable button while loading
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 mt-4"
            >
              {isLoading ? (
                // Show spinner if loading
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Access Dashboard'}
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-400 mt-6">
            Protected Area. Authorized Personnel Only.
          </p>
        </div>
      </div>
    </div>
  );
};
