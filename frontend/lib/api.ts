const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ss_token");
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Auth
export const requestOtp = (phone: string) =>
  req<{ success: boolean; dev_otp?: string }>("/auth/request-otp", {
    method: "POST", body: JSON.stringify({ phone }),
  });

export const verifyOtp = (phone: string, otp: string) =>
  req<{ access_token: string; citizen_id: string; is_new: boolean; has_profile: boolean }>(
    "/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }
  );

// Citizen
export const submitOnboarding = (data: Record<string, unknown>) =>
  req<{ success: boolean }>("/citizen/onboard", { method: "POST", body: JSON.stringify(data) });

export const getTwin = () => req("/citizen/twin");

export const getSummary = () => req("/citizen/summary");

export const addLifeEvent = (event: { event_type: string; event_date: string; details?: Record<string, unknown> }) =>
  req("/citizen/events", { method: "POST", body: JSON.stringify(event) });

// Benefits
export const getEligible = (category?: string) =>
  req(`/benefits/eligible${category ? `?category=${category}` : ""}`);

export const getMissed = () => req("/benefits/missed");

export const getBenefit = (id: string) => req(`/benefits/${id}`);

export const applyForBenefit = (schemeId: string, data: Record<string, unknown>) =>
  req(`/benefits/${schemeId}/apply`, { method: "POST", body: JSON.stringify(data) });

export const getApplications = () => req("/benefits/applications/list");

// Agents
export const triggerDiscovery = (): Promise<Response> => {
  const token = getToken();
  return fetch(`${BASE}/api/v1/agents/run-discovery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ force_refresh: false }),
  });
};

export const triggerAdvocate = (application_id: string, rejection_reason: string): Promise<Response> => {
  const token = getToken();
  return fetch(`${BASE}/api/v1/agents/advocate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ application_id, rejection_reason }),
  });
};

export const getAgentLog = () => req("/agents/log");
export const getAgentStatus = () => req("/agents/status");

export const triggerVoiceChat = (message: string, language_hint?: string): Promise<Response> => {
  const token = getToken();
  return fetch(`${BASE}/api/v1/agents/voice-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, language_hint }),
  });
};

// Government
export const getGovOverview = () => req("/government/overview");
export const getWelfareGaps = (state?: string) =>
  req(`/government/welfare-gaps${state ? `?state=${state}` : ""}`);
export const getSchemePerformance = () => req("/government/scheme-performance");
