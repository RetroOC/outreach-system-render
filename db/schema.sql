-- outreach-core Postgres schema

create extension if not exists pgcrypto;

create type inbox_auth_status as enum ('pending', 'connected', 'expired');
create type inbox_health_status as enum ('healthy', 'degraded', 'paused');
create type lead_status as enum ('active', 'suppressed');
create type campaign_status as enum ('draft', 'active', 'paused', 'archived');
create type enrollment_state as enum ('active', 'paused', 'processing', 'completed', 'replied', 'bounced', 'unsubscribed', 'failed');
create type thread_state as enum ('open', 'replied', 'closed');
create type message_direction as enum ('inbound', 'outbound');
create type ai_task_name as enum ('reply_classification', 'unsubscribe_detection', 'out_of_office_detection', 'reply_draft', 'personalization_snippet');
create type ai_run_status as enum ('success', 'failed');
create type job_status as enum ('pending', 'processing', 'completed', 'failed');

create table if not exists accounts (
  id text primary key,
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists inboxes (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  email_address text not null,
  provider text not null,
  display_name text,
  auth_status inbox_auth_status not null default 'pending',
  health_status inbox_health_status not null default 'healthy',
  daily_limit integer not null,
  hourly_limit integer not null,
  min_delay_seconds integer not null default 0,
  sending_window jsonb not null default '{}'::jsonb,
  sent_today integer not null default 0,
  reserved_today integer not null default 0,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  unique(account_id, email_address)
);

create table if not exists leads (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  company text,
  title text,
  timezone text,
  source text,
  custom_fields jsonb not null default '{}'::jsonb,
  status lead_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(account_id, email)
);

create table if not exists campaigns (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  status campaign_status not null default 'draft',
  objective text,
  settings jsonb not null default '{}'::jsonb,
  schedule_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaign_steps (
  id text primary key,
  campaign_id text not null references campaigns(id) on delete cascade,
  step_number integer not null,
  type text not null,
  delay_kind text not null,
  delay_amount integer not null,
  delay_unit text not null,
  subject_template text not null,
  body_template text not null,
  created_at timestamptz not null default now(),
  unique(campaign_id, step_number)
);

create table if not exists enrollments (
  id text primary key,
  campaign_id text not null references campaigns(id) on delete cascade,
  lead_id text not null references leads(id) on delete cascade,
  assigned_inbox_id text not null references inboxes(id) on delete restrict,
  state enrollment_state not null,
  current_step_index integer not null default 0,
  next_action_at timestamptz not null,
  last_outbound_sent_at timestamptz,
  last_inbound_received_at timestamptz,
  stop_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, lead_id)
);

create table if not exists threads (
  id text primary key,
  enrollment_id text not null references enrollments(id) on delete cascade,
  lead_id text not null references leads(id) on delete cascade,
  inbox_id text not null references inboxes(id) on delete restrict,
  state thread_state not null,
  last_message_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  thread_id text not null references threads(id) on delete cascade,
  enrollment_id text not null references enrollments(id) on delete cascade,
  direction message_direction not null,
  subject text not null,
  body_text text not null,
  provider_message_id text,
  received_at timestamptz,
  sent_at timestamptz,
  classification jsonb,
  created_at timestamptz not null default now()
);

create table if not exists suppressions (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  email text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(account_id, email)
);

create table if not exists ai_provider_configs (
  id text primary key,
  account_id text references accounts(id) on delete cascade,
  provider text not null,
  credential_ref text,
  enabled boolean not null default true,
  default_model text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_task_policies (
  id text primary key,
  account_id text references accounts(id) on delete cascade,
  task_name ai_task_name not null,
  primary_provider text,
  primary_model text,
  fallback_chain jsonb not null default '[]'::jsonb,
  max_latency_ms integer,
  max_cost_usd numeric(12,6),
  min_confidence numeric(4,3),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(account_id, task_name)
);

create table if not exists ai_runs (
  id text primary key,
  account_id text references accounts(id) on delete set null,
  task_name ai_task_name not null,
  prompt_version text not null,
  schema_version text,
  provider text not null,
  model text not null,
  status ai_run_status not null,
  confidence numeric(4,3),
  latency_ms integer not null,
  estimated_cost_usd numeric(12,6),
  input_hash text,
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id text primary key,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  status job_status not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inboxes_account_id on inboxes(account_id);
create index if not exists idx_leads_account_id on leads(account_id);
create index if not exists idx_campaigns_account_id on campaigns(account_id);
create index if not exists idx_enrollments_campaign_id on enrollments(campaign_id);
create index if not exists idx_enrollments_lead_id on enrollments(lead_id);
create index if not exists idx_enrollments_state_next_action_at on enrollments(state, next_action_at);
create index if not exists idx_threads_enrollment_id on threads(enrollment_id);
create index if not exists idx_messages_thread_id on messages(thread_id);
create index if not exists idx_messages_enrollment_id on messages(enrollment_id);
create index if not exists idx_ai_runs_task_name_created_at on ai_runs(task_name, created_at desc);
create index if not exists idx_jobs_status_available_at on jobs(status, available_at);
