export interface CitizenProfile {
  id: string;
  citizen_id: string;
  full_name: string;
  age: number;
  gender: string;
  state: string;
  district: string;
  annual_income: number;
  bpl_card: boolean;
  occupation: string;
  employment_status: string;
  caste_category: string;
  disability_status: boolean;
  family_size: number;
  marital_status: string;
  education_level: string;
  currently_studying: boolean;
  confidence_score: number;
  twin_version: number;
}

export interface CitizenSummary {
  citizen_id: string;
  full_name: string;
  eligible_count: number;
  missed_count: number;
  missed_value: number;
  applied_count: number;
  approved_count: number;
  confidence_score: number;
}

export interface Benefit {
  id: string;
  scheme_id: string;
  scheme_slug?: string;
  scheme_name: string;
  scheme_name_hi?: string;
  scheme_category: string;
  scheme_ministry: string;
  benefit_value_annual: number;
  benefit_type: string;
  status: string;
  eligibility_score: number;
  eligibility_reasons: string[];
  eligibility_criteria?: Record<string, unknown>;
  is_missed: boolean;
  missed_months: number;
  missed_value_est: number;
  eligible_since: string;
  discovered_at: string;
  applied_at?: string;
  application_ref?: string;
  rejection_reason?: string;
  description_en: string;
  benefit_description?: string;
  required_documents: string[];
  application_url?: string;
  application_data?: Record<string, unknown>;
  documents_submitted?: DocumentSubmission[];
}

export interface DocumentSubmission {
  slug: string;
  file_name: string;
  confirmed: boolean;
}

export interface ApplicationFormData {
  full_name: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  bank_account?: string;
  bank_ifsc?: string;
  additional_notes?: string;
  documents: DocumentSubmission[];
  declaration_accepted: boolean;
}

export interface AgentEvent {
  type: "thinking" | "tool_call" | "tool_result" | "complete" | "error" | "agent_start" | "all_complete";
  agent?: string;
  content: string;
  eligible_count?: number;
  missed_count?: number;
  missed_value?: number;
  confidence?: number;
  result?: Record<string, unknown>;
}

export interface AgentExecution {
  id: string;
  agent_name: string;
  triggered_by: string;
  status: string;
  input_summary: string;
  output_summary: string;
  reasoning_log: string;
  tool_calls: Array<{ tool: string; input?: string; output?: string }>;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface WelfareGap {
  state: string;
  district: string;
  scheme_name: string;
  scheme_category: string;
  total_eligible: number;
  total_enrolled: number;
  enrollment_rate: number;
  coverage_gap: number;
  primary_barrier: string;
  estimated_gap_value: number;
  gap_severity: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  health: "bg-teal-100 text-teal-800",
  education: "bg-blue-100 text-blue-800",
  housing: "bg-violet-100 text-violet-800",
  agriculture: "bg-green-100 text-green-800",
  finance: "bg-amber-100 text-amber-800",
  insurance: "bg-sky-100 text-sky-800",
  welfare: "bg-pink-100 text-pink-800",
  employment: "bg-indigo-100 text-indigo-800",
  skill: "bg-purple-100 text-purple-800",
};

export const CATEGORY_ICONS: Record<string, string> = {
  health: "🏥",
  education: "🎓",
  housing: "🏠",
  agriculture: "🌾",
  finance: "💰",
  insurance: "🛡️",
  welfare: "🤝",
  employment: "💼",
  skill: "⚙️",
};
