import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
// import spotLogo from 'figma:asset/87d319d70a74f2182b104a15a264753a0cfb9143.png';
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
// import FacebookLogin from 'react-facebook-login';
import { API_URL } from "../config/api";
// Eye icons as inline SVG components
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const OtpInput = ({
  otpValue,
  setOtpValue,
}: {
  otpValue: string;
  setOtpValue: (val: string) => void;
}) => {

  const inputs = Array(6).fill(0);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const otpArray = otpValue.split("");
    otpArray[index] = value;

    const newOtp = otpArray.join("").slice(0, 6);
    setOtpValue(newOtp);

    // move to next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {inputs.map((_, index) => (
        <input
          title='otp'
          key={index}
          id={`otp-${index}`}
          type="text"
          maxLength={1}
          value={otpValue[index] || ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition"
        />
      ))}
    </div>
  );
};


// بعد ← أضيفي preferences
interface LoginProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'account' | 'preferences') => void; onLoginSuccess?: (userData: {
    name: string; email: string; avatar?: string,
    phone: string, location: string, bio: string, tier: string
    , loyaltyPoints: number, walletBalance: number,
    createdAt: Date
  }, isNewUser?: boolean) => void;
}
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "YOUR_FACEBOOK_APP_ID",
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
    };
  }, []);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    login: false,
    signup: false,
    confirmSignup: false
  });

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState("");



  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse?.credential;

    console.log("ID TOKEN:", idToken);

    if (!idToken) {
      console.log("Google credential is missing");
      return;
    }

    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      console.log("Server error:", await res.text());
      return;
    }

    const data = await res.json();
    toast.success("Google login successful!");
    console.log(data);
  };


  const handleFacebookLogin = () => {
    window.FB.login(
      function (response: any) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          console.log("FB TOKEN:", accessToken);

          // ابعتيه للباك
          fetch(`${API_URL}/auth/facebook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken }),
          })
            .then(res => res.json())
            .then(data => console.log(data));
        } else {
          console.log("User cancelled login");
        }
      },
      { scope: "email" }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const adminRes = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const adminData = await adminRes.json();

      if (adminRes.ok) {
        localStorage.setItem("adminToken", adminData.token);
        localStorage.setItem("adminName", adminData.admin?.name || adminData.admin?.userName || "");
        onNavigate("admin-dashboard" as any);
        return;
      }

      const res = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        // ✅ لو isNewUser flag موجودة → preferences، غير كده → home
        const isNewUser = localStorage.getItem("isNewUser") === "true";
        localStorage.removeItem("isNewUser");

        onLoginSuccess?.({
          name: data.existUser.userName,
          email: data.existUser.email,
          avatar: data.existUser.profilePicture?.secure_url || data.existUser.avatar || "",
          phone: data.existUser.phone || "",
          location: data.existUser.location || "",
          bio: data.existUser.bio || "",
          loyaltyPoints: data.existUser.loyaltyPoints || 0,
          walletBalance: data.existUser.walletBalance || 0,
          tier: data.existUser.tier || "Bronze",
          createdAt: data.existUser.createdAt,
        }, isNewUser);

        return;
      }

      const errorMsg = data.message || adminData.message || "Invalid email or password";
      toast.error(errorMsg);

    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: `${signupData.firstName} ${signupData.lastName}`.trim(),
          email: signupData.email,
          password: signupData.password,
          cPassword: signupData.confirmPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error");
        return;
      }

      localStorage.removeItem(`user_${signupData.email}`);
      toast.success("Check your email for OTP");
      setShowOtpInput(true);

    } catch (err) {
      console.error("Network error:", err);
      toast.error("Signup failed");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: signupData.email,
          otp: otpValue
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Email verified 🎉 Please login to continue");
      localStorage.setItem("isNewUser", "true"); // ← ده ناقص

      setShowOtpInput(false);
      setOtpValue("");
      setActiveTab("login");

    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: signupData.email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success("OTP resent ✅");

    } catch (err) {
      console.error(err);
      toast.error("Failed to resend OTP");
    }
  };
  const togglePasswordVisibility = (field: 'login' | 'signup' | 'confirmSignup') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <section className="relative min-h-screen pt-24 pb-8 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
        <img
          src="../assets/87d319d70a74f2182b104a15a264753a0cfb9143.png"
          alt="SPOT Watermark"
          className="w-[600px] h-[600px] object-contain transform -rotate-12"
        />
      </div>

      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-200/20 to-purple-200/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-cyan-200/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-cyan-300/10 to-purple-300/10 rounded-full blur-lg"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">

        {/* Login/Signup Card */}
        <Card className="bg-white/80 backdrop-blur-md shadow-2xl border border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-center bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent text-2xl font-bold mb-2">
              Get Started
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
              {/* Desktop Divider */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 z-10">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex-1 w-px bg-gray-200"></div>

                  <div className="flex-1 w-px bg-gray-200"></div>
                </div>
              </div>

              {/* Left Column - Email Login/Signup */}
              <div className="space-y-6">
                {/* Separator on mobile */}
                <div className="relative lg:hidden">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/50">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPasswords.login ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('login')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPasswords.login ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                          <span className="text-gray-600">Remember me</span>
                        </label>
                        <a href="#" className="text-cyan-600 hover:text-purple-600 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Signup Form */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-firstName">First Name</Label>
                          <Input
                            id="signup-firstName"
                            type="text"
                            placeholder="First name"
                            value={signupData.firstName}
                            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                            className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-lastName">Last Name</Label>
                          <Input
                            id="signup-lastName"
                            type="text"
                            placeholder="Last name"
                            value={signupData.lastName}
                            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                            className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPasswords.signup ? "text" : "password"}
                            placeholder="Create a password"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('signup')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPasswords.signup ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirmPassword"
                            type={showPasswords.confirmSignup ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            className="h-12 border-2 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmSignup')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPasswords.confirmSignup ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 text-sm">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" required />
                        <span className="text-gray-600">
                          I agree to the{' '}
                          <a href="#" className="text-cyan-600 hover:text-purple-600 transition-colors">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-cyan-600 hover:text-purple-600 transition-colors">Privacy Policy</a>
                        </span>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>

              {showOtpInput && (
                <div className="mt-6 p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
                  <h3 className="text-center text-lg font-semibold mb-4 text-gray-700">
                    Enter Verification Code
                  </h3>

                  <OtpInput otpValue={otpValue} setOtpValue={setOtpValue} />

                  <button
                    onClick={handleVerifyOtp}
                    className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:opacity-90 transition"
                  >
                    Verify OTP
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Didn’t receive code?
                    <span
                      className="text-cyan-600 cursor-pointer ml-1 hover:underline"
                      onClick={handleResend}
                    >
                      Resend
                    </span>
                  </p>

                </div>
              )}

              {/* Right Column - Social Login */}
              <div className="space-y-6">
                {/* Mobile Separator */}
                <div className="relative lg:hidden">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or use social login</span>
                  </div>
                </div>

                {/* Social Login Section */}
                <Tabs defaultValue="social" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 mb-6 bg-gray-100/50">
                    <TabsTrigger
                      value="social"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      Quick Sign In
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="social" className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="space-y-4">
                      {/* Google Login الحقيقي */}
                      <div className="w-full h-12 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                      >
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => console.log("Google Login Failed")}
                          text="continue_with"
                          shape="rectangular"
                          theme="outline"
                          size="large"
                        />
                      </div>



                      {/* Social Login Information */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          Social login provides quick access using your existing accounts
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            By continuing, you agree to SPOT's terms and conditions and acknowledge
            that you have read our privacy policy.
          </p>
        </div>
      </div>
    </section >
  );
};