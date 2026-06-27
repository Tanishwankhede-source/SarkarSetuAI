"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitOnboarding } from "@/lib/api";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import { Loader2 } from "lucide-react";

type Step1 = { full_name: string; age: string; gender: string; state: string; district: string };
type Step2 = {
  annual_income: string; bpl_card: boolean; occupation: string; employment_status: string;
  caste_category: string; disability_status: boolean; family_size: string;
  marital_status: string; education_level: string; currently_studying: boolean;
  land_area_acres: string; has_bank_account: boolean; has_jan_dhan: boolean;
};

const STATES = ["andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa","gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala","madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland","odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura","uttar pradesh","uttarakhand","west bengal","delhi","jammu and kashmir"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [s1, setS1] = useState<Step1>({ full_name: "", age: "", gender: "", state: "", district: "" });
  const [s2, setS2] = useState<Step2>({
    annual_income: "", bpl_card: false, occupation: "", employment_status: "",
    caste_category: "general", disability_status: false, family_size: "1",
    marital_status: "single", education_level: "secondary", currently_studying: false,
    land_area_acres: "0", has_bank_account: false, has_jan_dhan: false,
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await submitOnboarding({
        step1: { ...s1, age: parseInt(s1.age) },
        step2: { ...s2, annual_income: parseInt(s2.annual_income) || 0, family_size: parseInt(s2.family_size) || 1, land_area_acres: parseFloat(s2.land_area_acres) || 0 },
      });
      router.push("/onboarding/twin");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner
        title="Citizen Profile Registration"
        titleHi="नागरिक प्रोफाइल नोंदणी"
        subtitle="Complete both steps — information is used only for scheme eligibility matching."
        image={GOV_IMAGES.onboarding}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Registration" },
        ]}
      />

      <div className="gov-content-area">
        <div className="mx-auto max-w-2xl">
          {/* Step indicator — gov form style */}
          <table className="gov-table mb-6">
            <tbody>
              <tr>
                <td className="w-1/2 font-semibold bg-[#f5f5f5]">Step 1: Personal Details</td>
                <td className={`w-1/2 font-semibold ${step === 2 ? "bg-[#f5f5f5]" : ""}`}>Step 2: Household & Income</td>
              </tr>
            </tbody>
          </table>

          <div className="gov-panel">
            <h2 className="gov-panel-heading">
              {step === 1 ? "Personal Information | वैयक्तिक माहिती" : "Household & Livelihood | कुटुंब व उत्पन्न"}
            </h2>

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="gov-label">Full Name (as per Aadhaar)</label>
                  <input className="gov-input" value={s1.full_name} onChange={(e) => setS1({ ...s1, full_name: e.target.value })} placeholder="Meera Patil" />
                </div>
                <div>
                  <label className="gov-label">Age</label>
                  <input className="gov-input" type="number" value={s1.age} onChange={(e) => setS1({ ...s1, age: e.target.value })} />
                </div>
                <div>
                  <label className="gov-label">Gender</label>
                  <select className="gov-input" value={s1.gender} onChange={(e) => setS1({ ...s1, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="gov-label">State</label>
                  <select className="gov-input" value={s1.state} onChange={(e) => setS1({ ...s1, state: e.target.value })}>
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s} value={s}>{s.replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gov-label">District</label>
                  <input className="gov-input" value={s1.district} onChange={(e) => setS1({ ...s1, district: e.target.value })} placeholder="Mumbai" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="gov-label">Annual Income (₹)</label>
                  <input className="gov-input" type="number" value={s2.annual_income} onChange={(e) => setS2({ ...s2, annual_income: e.target.value })} />
                </div>
                <div>
                  <label className="gov-label">Family Size</label>
                  <input className="gov-input" type="number" value={s2.family_size} onChange={(e) => setS2({ ...s2, family_size: e.target.value })} />
                </div>
                <div>
                  <label className="gov-label">Occupation</label>
                  <select className="gov-input" value={s2.occupation} onChange={(e) => setS2({ ...s2, occupation: e.target.value })}>
                    <option value="">Select</option>
                    {["farmer","salaried","self_employed","student","homemaker","unemployed","artisan","entrepreneur"].map((o) => (
                      <option key={o} value={o}>{o.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="gov-label">Caste Category</label>
                  <select className="gov-input" value={s2.caste_category} onChange={(e) => setS2({ ...s2, caste_category: e.target.value })}>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                  </select>
                </div>
                <div>
                  <label className="gov-label">Marital Status</label>
                  <select className="gov-input" value={s2.marital_status} onChange={(e) => setS2({ ...s2, marital_status: e.target.value })}>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="gov-label">Education Level</label>
                  <select className="gov-input" value={s2.education_level} onChange={(e) => setS2({ ...s2, education_level: e.target.value })}>
                    {["none","primary","secondary","higher_secondary","graduate","postgraduate"].map((e) => (
                      <option key={e} value={e}>{e.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-2 border border-gov-border bg-[#fafafa] p-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={s2.bpl_card} onChange={(e) => setS2({ ...s2, bpl_card: e.target.checked })} />
                    BPL card holder
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={s2.has_bank_account} onChange={(e) => setS2({ ...s2, has_bank_account: e.target.checked })} />
                    Bank account available
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={s2.has_jan_dhan} onChange={(e) => setS2({ ...s2, has_jan_dhan: e.target.checked })} />
                    Jan Dhan account
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={s2.disability_status} onChange={(e) => setS2({ ...s2, disability_status: e.target.checked })} />
                    Disability in household
                  </label>
                </div>
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-gov-border pt-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(1)} className="gov-btn-outline">Previous</button>
              )}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!s1.full_name || !s1.age || !s1.gender || !s1.state}
                  className="gov-btn-primary disabled:opacity-50"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !s2.occupation}
                  className="gov-btn-saffron disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit & Run Scheme Matching"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
