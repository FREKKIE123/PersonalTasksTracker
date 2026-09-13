import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const PIN_LENGTH = 6;

export default function Login() {
  const { login, error } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newDigits.every((d) => d !== "") && newDigits.filter(Boolean).length === PIN_LENGTH) {
      handleSubmit(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (pin?: string) => {
    const code = pin ?? digits.join("");
    if (code.length < PIN_LENGTH) return;
    setLoading(true);
    try {
      // Use the PIN as the password with a fixed email for single-user auth
      const email = import.meta.env.VITE_AUTH_EMAIL || "frekkiemaatla04@gmail.com";
      await login(email, code);
    } catch {
      setShake(true);
      setDigits(Array(PIN_LENGTH).fill(""));
      setTimeout(() => {
        setShake(false);
        inputRefs.current[0]?.focus();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const filled = digits.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-xs text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">FrekkieMe</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Your personal command center.</p>
        </div>

        {/* PIN input */}
        <div className={`flex justify-center gap-2 mb-6 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-12 text-center text-lg font-semibold bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 mb-4">{error}</p>
        )}

        {/* Unlock button */}
        <button
          onClick={() => handleSubmit()}
          disabled={filled < PIN_LENGTH || loading}
          className="w-full h-10 bg-[var(--primary)] text-white text-sm font-medium rounded-[var(--radius)] hover:bg-[#17483F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Unlocking…
            </span>
          ) : (
            "Unlock"
          )}
        </button>

        <p className="text-[11px] text-[var(--muted-foreground)] mt-6">
          Enter your 6-digit PIN
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
