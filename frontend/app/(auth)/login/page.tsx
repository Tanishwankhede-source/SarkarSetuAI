"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestOtp, verifyOtp } from "@/lib/api";
import { setToken } from "@/lib/streaming";
import GovPageShell from "@/components/layout/GovPageShell";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await requestOtp(phone);
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setStep("otp");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp(phone, otp);
      setToken(res.access_token);
      localStorage.setItem("ss_citizen_id", res.citizen_id);
      localStorage.setItem("ss_phone", phone);
      router.push(res.has_profile ? "/dashboard" : "/onboarding");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GovPageShell variant="public">
      <PageBanner
        title="Citizen Login"
        titleHi="नागरिक प्रवेश"
        subtitle="Login using your registered mobile number and OTP verification."
        image={GOV_IMAGES.login}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Citizen Login" },
        ]}
      />

      <div className="gov-content-area">
        <div className="mx-auto max-w-lg">
          <div className="gov-panel">
            <h2 className="gov-panel-heading">OTP Based Authentication</h2>
            <p className="mb-5 text-sm text-gray-600">
              {step === "phone"
                ? "Enter your 10-digit mobile number registered with Aadhaar."
                : `Enter the 6-digit OTP sent to ${phone}`}
            </p>

            {step === "phone" ? (
              <div className="space-y-4">
                <div>
                  <label className="gov-label" htmlFor="phone">Mobile Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="+91 9876543210"
                    className="gov-input"
                  />
                </div>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !phone.trim()}
                  className="gov-btn-primary w-full disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="gov-label" htmlFor="otp">OTP Code</label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                    placeholder="123456"
                    className="gov-input text-center text-xl tracking-widest"
                  />
                  {devOtp && (
                    <p className="mt-1 text-center text-xs text-gray-500">
                      Dev OTP:{" "}
                      <button type="button" onClick={() => setOtp(devOtp)} className="font-bold text-gov-link">
                        {devOtp}
                      </button>
                    </p>
                  )}
                </div>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="gov-btn-primary w-full disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="w-full text-sm text-gov-link hover:underline"
                >
                  Change mobile number
                </button>
              </div>
            )}
          </div>

          <div className="gov-alert gov-alert-warning mt-4">
            <strong>Demo credentials:</strong> Mobile +919876543210 | OTP 123456
          </div>

          <p className="mt-4 text-center text-sm">
            <Link href="/" className="text-gov-link">← Back to Home</Link>
          </p>
        </div>
      </div>
    </GovPageShell>
  );
}
