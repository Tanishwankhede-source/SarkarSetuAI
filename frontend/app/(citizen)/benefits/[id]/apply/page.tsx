"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBenefit, applyForBenefit, getTwin } from "@/lib/api";
import { getDocumentInfo } from "@/lib/documents";
import PageBanner from "@/components/layout/PageBanner";
import { GOV_IMAGES } from "@/lib/gov-images";
import type { ApplicationFormData, Benefit, CitizenProfile } from "@/types";
import { Loader2, Upload, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";

type DocState = { slug: string; file_name: string; confirmed: boolean };

const STEPS = ["Personal Details", "Upload Documents", "Review & Submit"];

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [benefit, setBenefit] = useState<Benefit | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    district: "",
    state: "",
    bank_account: "",
    bank_ifsc: "",
    additional_notes: "",
    declaration_accepted: false,
  });
  const [documents, setDocuments] = useState<DocState[]>([]);

  useEffect(() => {
    Promise.all([getBenefit(id as string), getTwin()])
      .then(([b, twin]) => {
        const benefitData = b as Benefit;
        setBenefit(benefitData);
        const p = twin as CitizenProfile;
        setProfile(p);
        setForm((f) => ({
          ...f,
          full_name: p.full_name || "",
          phone: (p as CitizenProfile & { phone?: string }).phone || localStorage.getItem("ss_phone") || "",
          district: p.district || "",
          state: p.state || "",
          address: `${p.district || ""}, ${p.state || ""}`.trim(),
        }));
        const docs = (benefitData.required_documents || []).map((slug) => ({
          slug,
          file_name: "",
          confirmed: false,
        }));
        setDocuments(docs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateDoc = (slug: string, field: "file_name" | "confirmed", value: string | boolean) => {
    setDocuments((docs) =>
      docs.map((d) => (d.slug === slug ? { ...d, [field]: value } : d))
    );
  };

  const handleFileSelect = (slug: string, file: File | null) => {
    if (!file) return;
    updateDoc(slug, "file_name", file.name);
    updateDoc(slug, "confirmed", true);
  };

  const validateStep = (): boolean => {
    setError("");
    if (step === 0) {
      if (!form.full_name.trim() || !form.phone.trim() || !form.address.trim()) {
        setError("Please fill all required personal details.");
        return false;
      }
    }
    if (step === 1) {
      const incomplete = documents.filter((d) => !d.file_name.trim() || !d.confirmed);
      if (incomplete.length > 0) {
        setError(`Please upload and confirm all ${documents.length} required documents.`);
        return false;
      }
    }
    if (step === 2 && !form.declaration_accepted) {
      setError("Please accept the declaration to submit your application.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };

  const handleSubmit = async () => {
    if (!validateStep() || !benefit) return;
    setSubmitting(true);
    setError("");
    try {
      const payload: ApplicationFormData = {
        ...form,
        documents: documents.map((d) => ({ slug: d.slug, file_name: d.file_name, confirmed: d.confirmed })),
      };
      const res = await applyForBenefit(benefit.scheme_id, payload as unknown as Record<string, unknown>) as { application_ref: string };
      setSuccess(res.application_ref);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Application submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="gov-content-area py-12 text-center text-gray-600">Loading application form…</div>;
  }

  if (!benefit) {
    return <div className="gov-content-area py-12 text-center text-gray-600">Scheme not found.</div>;
  }

  if (success) {
    return (
      <>
        <PageBanner title="Application Submitted" titleHi="आवेदन जमा हो गया" image={GOV_IMAGES.apply}
          breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Schemes", href: "/benefits" }, { label: "Submitted" }]} />
        <div className="gov-content-area">
          <div className="gov-panel max-w-lg mx-auto text-center py-8">
            <CheckCircle size={48} className="mx-auto text-gov-green mb-4" />
            <h2 className="text-xl font-bold text-gov-navy mb-2">Application Submitted Successfully!</h2>
            <p className="text-sm text-gray-600 mb-4">Your application for <strong>{benefit.scheme_name}</strong> has been received.</p>
            <p className="mb-6">Reference Number: <strong className="font-mono text-lg text-gov-navy">{success}</strong></p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/applications" className="gov-btn-primary no-underline">Track Application</Link>
              <Link href="/dashboard" className="gov-btn-outline no-underline">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title={`Apply: ${benefit.scheme_name}`}
        titleHi="योजना आवेदन फॉर्म"
        subtitle="Fill your details, upload documents, then review before submitting"
        image={GOV_IMAGES.apply}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Schemes", href: "/benefits" },
          { label: benefit.scheme_name, href: `/benefits/${id}` },
          { label: "Apply" },
        ]}
      />

      <div className="gov-content-area max-w-3xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= step ? "bg-gov-saffron text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-semibold hidden sm:inline ${i <= step ? "text-gov-navy" : "text-gray-400"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-gov-saffron" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {error && <div className="gov-alert gov-alert-warning mb-4">{error}</div>}

        {/* Step 1: Personal details */}
        {step === 0 && (
          <div className="gov-panel space-y-4">
            <h2 className="gov-panel-heading">Step 1: Personal Details</h2>
            <p className="text-sm text-gray-600">Pre-filled from your citizen profile. Please verify and update if needed.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="gov-label">Full Name *</label>
                <input className="gov-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <label className="gov-label">Phone Number *</label>
                <input className="gov-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="gov-label">State *</label>
                <input className="gov-input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <label className="gov-label">District *</label>
                <input className="gov-input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="gov-label">Full Address *</label>
                <textarea className="gov-input min-h-[80px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="gov-label">Bank Account Number</label>
                <input className="gov-input" value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} placeholder="For benefit transfer" />
              </div>
              <div>
                <label className="gov-label">IFSC Code</label>
                <input className="gov-input" value={form.bank_ifsc} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="gov-label">Additional Notes</label>
                <textarea className="gov-input" value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} placeholder="Any special circumstances or information" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="gov-alert border-blue-700 bg-blue-50 text-blue-900 text-sm">
              Upload each required document. Select a file from your device — the file name will be recorded with your application.
            </div>
            {documents.map((doc, i) => {
              const info = getDocumentInfo(doc.slug);
              return (
                <div key={doc.slug} className="gov-panel">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gov-navy text-white text-xs font-bold">{i + 1}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gov-navy">{info.label_en}</h3>
                      <p className="font-devanagari text-xs text-gray-500">{info.label_hi}</p>
                      <p className="mt-1 text-xs text-gray-600">{info.where_to_get_en}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="gov-btn-outline cursor-pointer flex items-center gap-2 !text-sm">
                          <Upload size={14} />
                          {doc.file_name || "Choose File"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileSelect(doc.slug, e.target.files?.[0] || null)}
                          />
                        </label>
                        {doc.file_name && (
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doc.confirmed}
                              onChange={(e) => updateDoc(doc.slug, "confirmed", e.target.checked)}
                              className="h-4 w-4"
                            />
                            I confirm this document is correct
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="gov-panel">
              <h2 className="gov-panel-heading">Review Personal Details</h2>
              <table className="gov-table text-sm">
                <tbody>
                  {[
                    ["Name", form.full_name],
                    ["Phone", form.phone],
                    ["Address", form.address],
                    ["State / District", `${form.state}, ${form.district}`],
                    ["Bank Account", form.bank_account || "—"],
                    ["IFSC", form.bank_ifsc || "—"],
                  ].map(([k, v]) => (
                    <tr key={k}><td className="bg-[#f5f5f5] font-semibold w-1/3">{k}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="gov-panel">
              <h2 className="gov-panel-heading">Documents Submitted ({documents.filter((d) => d.confirmed).length}/{documents.length})</h2>
              <ul className="space-y-2">
                {documents.map((doc) => {
                  const info = getDocumentInfo(doc.slug);
                  return (
                    <li key={doc.slug} className="flex items-center gap-2 text-sm">
                      {doc.confirmed ? <CheckCircle size={16} className="text-gov-green" /> : <span className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                      <span>{info.label_en}</span>
                      <span className="text-gray-500">— {doc.file_name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="gov-panel border-2 border-gov-navy">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.declaration_accepted}
                  onChange={(e) => setForm({ ...form, declaration_accepted: e.target.checked })}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  I hereby declare that all information and documents provided are true and correct to the best of my knowledge.
                  I understand that false information may lead to rejection of my application.
                  <span className="block font-devanagari text-xs text-gray-500 mt-1">
                    मैं घोषणा करता/करती हूँ कि दी गई सभी जानकारी और दस्तावेज़ सत्य हैं।
                  </span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(step - 1) : router.push(`/benefits/${id}`)}
            className="gov-btn-outline flex items-center gap-1"
          >
            <ChevronLeft size={16} /> {step > 0 ? "Previous" : "Cancel"}
          </button>
          {step < 2 ? (
            <button type="button" onClick={nextStep} className="gov-btn-saffron flex items-center gap-1">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting} className="gov-btn-saffron flex items-center gap-1 disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Submit Application
            </button>
          )}
        </div>
      </div>
    </>
  );
}
