import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signup, authorizeGoogleUser } from "../services/user";
import ReCAPTCHA from "react-google-recaptcha";
import Header from "@/components/Header";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

const SignUp = () => {
  const { theme, toggleTheme } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recaptcha, setRecaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorFirstName, setErrorFirstName] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [errorRecaptcha, setErrorRecaptcha] = useState(false);
  const navigate = useNavigate();

  const checkErrors = () => {
    if (!firstName.trim() || !email.trim() || !password.trim() || !recaptcha) {
      setErrorFirstName(!firstName.trim());
      setErrorEmail(!email.trim());
      setErrorPassword(!password.trim());
      setErrorRecaptcha(!recaptcha);
      toast.error("Please fill in all fields");
      return true;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return true;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must include a lowercase, an uppercase and a number");
      return true;
    }
    return false;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkErrors()) return;
    
    setLoading(true);
    const data = await signup(firstName, lastName, email, password, recaptcha);
    const error = data.error;
    if (error) {
      return toast.error(error);
    }
    navigate("/");
    setLoading(false);
  };

  const handleGoogleRegister = async (credentialResponse ) => {
    setLoading(true);
    const googleUser = await authorizeGoogleUser(credentialResponse );
    if (googleUser.error) {
      setLoading(false);
      return toast.error(googleUser.error);
    }
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header active="signup"/>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign up to keep your bundles longer
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-6">
            <GoogleLoginButton
              text="signup_with"
              onSuccess={handleGoogleRegister}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            {/* Registration form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value.trim())}
                      className={`pl-10 ${errorFirstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.trim())}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className={`pl-10 ${errorEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.trim())}
                    className={`pl-10 pr-10 ${errorPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 flex justify-center">
                <ReCAPTCHA
                  key={theme}
                  theme={theme}
                  className={`${errorRecaptcha ? "border border-red-500" : ""}`}
                  value={recaptcha}
                  onChange={(token) => setRecaptcha(token)}
                  sitekey={import.meta.env.VITE_RECAPTCHA_VISIBLE_SECRET_KEY}
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SignUp;
