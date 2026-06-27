import Link from "next/link";
import GovPageShell from "@/components/layout/GovPageShell";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";

const stats = [
  { value: "15+", label: "Central & State Schemes" },
  { value: "4 min", label: "Profile Registration" },
  { value: "100%", label: "Eligibility Matching" },
  { value: "24×7", label: "Online Access" },
];

const services = [
  {
    title: "Scheme Discovery",
    titleHi: "योजना शोध",
    desc: "Match your profile against PM-JAY, PM Awas, NSAP, PM-Kisan and other government schemes.",
  },
  {
    title: "Missed Benefits",
    titleHi: "चुकलेले लाभ",
    desc: "Identify welfare support you were eligible for in the past but never received.",
  },
  {
    title: "Application Support",
    titleHi: "अर्ज सहाय्य",
    desc: "Document checklist, application tracking, and step-by-step guidance for each scheme.",
  },
  {
    title: "Appeal Assistance",
    titleHi: "अपील सहाय्य",
    desc: "Structured support when a scheme application is rejected or delayed.",
  },
];

const steps = [
  { no: "1", title: "Register with Mobile OTP", desc: "Verify your identity using Aadhaar-linked mobile number (demo OTP supported)." },
  { no: "2", title: "Complete Citizen Profile", desc: "Fill a short form — income, occupation, family, BPL status, and location." },
  { no: "3", title: "Receive Matched Schemes", desc: "System evaluates eligibility and lists schemes you qualify for." },
];

export default function LandingPage() {
  return (
    <GovPageShell variant="public">
      <PageBanner
        title="Citizen Welfare & Scheme Discovery Portal"
        titleHi="नागरिक कल्याण व योजना शोध पोर्टल"
        subtitle="Find government schemes, scholarships, pensions, and subsidies you are eligible for — online, in your language, without visiting multiple offices."
        image={GOV_IMAGES.landing}
        breadcrumbs={[{ label: "Home", href: "/" }]}
      />

      {/* Notice ticker — common on gov sites */}
      <div className="border-b border-gov-border bg-white">
        <div className="gov-container flex flex-col gap-1 py-2 text-sm sm:flex-row sm:items-center">
          <span className="font-bold text-gov-navy shrink-0">Notice | सूचना:</span>
          <p className="text-gray-700">
            Demo portal for Agentic Arena 2026. Login with mobile <strong>+919876543210</strong> and OTP <strong>123456</strong>.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <section className="border-b border-gov-border bg-white">
        <div className="gov-container grid grid-cols-2 gap-0 divide-x divide-gov-border py-0 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="gov-stat-box border-0 py-5">
              <div className="gov-stat-value">{value}</div>
              <div className="gov-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero actions */}
      <section className="gov-content-area">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="gov-panel lg:col-span-2">
            <h2 className="gov-panel-heading font-devanagari">सरकारसेतु — प्रत्येक नागरिकापर्यंत योजना</h2>
            <p className="mb-4 text-gray-700">
              SarkarSetu connects eligible citizens to central and state welfare schemes. Many citizens miss pensions,
              health cover, housing assistance, and scholarships simply because they were never informed. This portal
              closes that gap through structured eligibility matching.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="gov-btn-saffron">Check My Eligibility</Link>
              <Link href="#how-it-works" className="gov-btn-outline">How It Works</Link>
            </div>
          </div>
          <div
            className="gov-panel min-h-[200px] bg-cover bg-center p-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0,51,102,0.55), rgba(0,51,102,0.55)), url(${GOV_IMAGES.dashboard})`,
            }}
          >
            <div className="flex h-full flex-col justify-end p-5 text-white">
              <p className="text-xs uppercase tracking-wide opacity-90">Featured</p>
              <p className="font-semibold">Rural &amp; Urban Welfare Schemes</p>
              <p className="mt-1 text-sm opacity-90">Health, housing, agriculture, education, insurance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-gov-border bg-white py-8">
        <div className="gov-container">
          <h2 id="schemes" className="mb-1 text-xl font-bold text-gov-navy">Citizen Services | नागरिक सेवा</h2>
          <p className="mb-6 text-sm text-gray-600">Online services available through this portal</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(({ title, titleHi, desc }) => (
              <article key={title} className="gov-panel">
                <h3 className="font-devanagari text-base font-bold text-gov-navy">{titleHi}</h3>
                <h4 className="mb-2 text-sm font-semibold text-gov-navy">{title}</h4>
                <p className="text-sm text-gray-700">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="gov-content-area">
        <h2 className="mb-6 text-xl font-bold text-gov-navy">Registration Process | नोंदणी प्रक्रिया</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ no, title, desc }) => (
            <div key={no} className="gov-panel">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center bg-gov-navy text-sm font-bold text-white">
                {no}
              </div>
              <h3 className="mb-2 font-semibold text-gov-navy">{title}</h3>
              <p className="text-sm text-gray-700">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Photo strip — real imagery like maharashtra.gov.in carousel */}
      <section className="border-t border-gov-border bg-white py-8">
        <div className="gov-container">
          <h2 className="mb-4 text-xl font-bold text-gov-navy">Citizen Welfare in India</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[GOV_IMAGES.benefits, GOV_IMAGES.applications, GOV_IMAGES.dashboard].map((src, i) => (
              <div
                key={src}
                className="h-40 border border-gov-border bg-cover bg-center sm:h-48"
                style={{ backgroundImage: `url(${src})` }}
                role="img"
                aria-label={["Health scheme camp", "Citizen service centre", "Rural development"][i]}
              />
            ))}
          </div>
        </div>
      </section>
    </GovPageShell>
  );
}
