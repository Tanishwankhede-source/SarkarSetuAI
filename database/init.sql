CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  language_pref VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

CREATE TABLE citizen_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(100),
  age INTEGER,
  gender VARCHAR(10),
  state VARCHAR(50),
  district VARCHAR(50),
  annual_income INTEGER,
  bpl_card BOOLEAN DEFAULT FALSE,
  ration_card_type VARCHAR(10),
  occupation VARCHAR(50),
  employment_status VARCHAR(20),
  land_area_acres DECIMAL(6,2) DEFAULT 0,
  house_type VARCHAR(20),
  has_bank_account BOOLEAN DEFAULT FALSE,
  has_jan_dhan BOOLEAN DEFAULT FALSE,
  caste_category VARCHAR(10),
  disability_status BOOLEAN DEFAULT FALSE,
  disability_type VARCHAR(50),
  disability_percent INTEGER DEFAULT 0,
  family_size INTEGER DEFAULT 1,
  marital_status VARCHAR(20),
  num_children INTEGER DEFAULT 0,
  children_ages INTEGER[],
  education_level VARCHAR(30),
  currently_studying BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2) DEFAULT 0.50,
  twin_version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID REFERENCES citizens(id),
  event_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  details JSONB,
  source VARCHAR(20) DEFAULT 'citizen_reported',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_hi VARCHAR(200),
  category VARCHAR(30) NOT NULL,
  ministry VARCHAR(100),
  level VARCHAR(10) DEFAULT 'central',
  state VARCHAR(50),
  description_en TEXT,
  eligibility_criteria JSONB NOT NULL DEFAULT '{}',
  required_documents JSONB DEFAULT '[]',
  benefit_description TEXT,
  benefit_value_annual INTEGER DEFAULT 0,
  benefit_type VARCHAR(30),
  application_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  launched_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE citizen_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID REFERENCES citizens(id),
  scheme_id UUID REFERENCES schemes(id),
  status VARCHAR(20) DEFAULT 'discovered',
  eligibility_score DECIMAL(3,2),
  eligibility_reasons JSONB DEFAULT '[]',
  eligible_since DATE,
  is_missed BOOLEAN DEFAULT FALSE,
  missed_months INTEGER DEFAULT 0,
  missed_value_est INTEGER DEFAULT 0,
  discovered_at TIMESTAMP DEFAULT NOW(),
  applied_at TIMESTAMP,
  application_ref VARCHAR(100),
  application_data JSONB DEFAULT '{}',
  documents_submitted JSONB DEFAULT '[]',
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  appeal_generated BOOLEAN DEFAULT FALSE,
  UNIQUE(citizen_id, scheme_id)
);

CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID REFERENCES citizens(id),
  agent_name VARCHAR(50) NOT NULL,
  triggered_by VARCHAR(30),
  status VARCHAR(15) DEFAULT 'running',
  input_summary TEXT,
  output_summary TEXT,
  reasoning_log TEXT,
  tool_calls JSONB DEFAULT '[]',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  error_message TEXT
);

CREATE TABLE welfare_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state VARCHAR(50),
  district VARCHAR(50),
  scheme_id UUID REFERENCES schemes(id),
  total_eligible INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  enrollment_rate DECIMAL(5,2) DEFAULT 0,
  coverage_gap INTEGER DEFAULT 0,
  primary_barrier VARCHAR(50),
  estimated_gap_value BIGINT DEFAULT 0,
  gap_severity VARCHAR(10),
  last_calculated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cb_citizen ON citizen_benefits(citizen_id);
CREATE INDEX idx_cb_missed ON citizen_benefits(citizen_id, is_missed);
CREATE INDEX idx_ae_citizen ON agent_executions(citizen_id, started_at DESC);
CREATE INDEX idx_schemes_category ON schemes(category, is_active);
