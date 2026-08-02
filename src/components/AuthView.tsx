import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Phone, Key, ShieldAlert, Check } from 'lucide-react';
import { UserProfile, MockDatabase } from '../utils/mockDb';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const AVAILABLE_SPORTS = ['Badminton', 'Cricket', 'Basketball', 'Football', 'Tennis', 'Volley Ball', 'Table Tennis', 'Shuttlecock', 'Handball', 'Chess', 'Carrom', 'Throw Ball'];

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  showToast
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  
  // Math Security Verification
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setCaptchaQuestion({ num1: n1, num2: n2, answer: n1 + n2 });
    setCaptchaInput('');
  };

  const handleTabChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setCollegeId('');
    setPassword('');
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [isLogin]);

  const handleTogglePref = (sport: string) => {
    if (selectedPrefs.includes(sport)) {
      setSelectedPrefs(selectedPrefs.filter(s => s !== sport));
    } else {
      setSelectedPrefs([...selectedPrefs, sport]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await MockDatabase.login(collegeId.trim(), password);
    if (result.success && result.user) {
      showToast(result.message, 'success');
      onAuthSuccess(result.user);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Captcha Validate
    if (parseInt(captchaInput) !== captchaQuestion.answer) {
      showToast('Incorrect CAPTCHA security sum.', 'error');
      generateCaptcha();
      return;
    }

    // Check if user already exists
    const existing = await MockDatabase.getUserById(collegeId.trim());
    if (existing) {
      showToast('College ID already exists in registry.', 'error');
      return;
    }

    const newUser = await MockDatabase.createUser({
      name: name.trim(),
      phone: phone.trim(),
      collegeId: collegeId.trim(),
      role: 'Student',
      preferences: selectedPrefs,
      password: password
    });

    showToast('Registration successful! Logging you in...', 'success');
    onAuthSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-[#1E2640] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="SportSync Logo" className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-blue-500/10 mx-auto" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">SportSync VIT</h1>
            <p className="text-xs text-slate-450 uppercase tracking-widest font-semibold font-mono">
              Pre-Booking Session Authenticator
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 bg-slate-950/80 p-1 border border-slate-900 rounded-xl select-none">
          <button
            onClick={() => handleTabChange(true)}
            className={`py-2 rounded-lg text-xs font-semibold font-heading transition ${
              isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-450 hover:text-white'
            }`}
          >
            Access Session
          </button>
          <button
            onClick={() => handleTabChange(false)}
            className={`py-2 rounded-lg text-xs font-semibold font-heading transition ${
              !isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-450 hover:text-white'
            }`}
          >
            Create Registry
          </button>
        </div>

         {isLogin ? (
          // Login Form
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">College ID / Admin ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter ID"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" /> Authenticate & Enter
            </button>

          </form>
        ) : (
          // Register Form
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">College ID (Student ID)</label>
              <input
                type="text"
                required
                placeholder="Enter College ID"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Choose Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            {/* Preference multi-select */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Favorite Sports</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SPORTS.map(sport => {
                  const selected = selectedPrefs.includes(sport);
                  return (
                    <button
                      type="button"
                      key={sport}
                      onClick={() => handleTogglePref(sport)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] transition ${
                        selected 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-950 border-slate-850 text-slate-400'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Captcha */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Security Math Verification</label>
              <div className="flex items-center gap-2.5">
                <div className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 font-mono font-bold text-blue-400 tracking-wider">
                  {captchaQuestion.num1} + {captchaQuestion.num2} = ?
                </div>
                <input
                  type="number"
                  required
                  placeholder="Answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 active:scale-95"
            >
              Confirm Registration
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
