/**
 * GitHub Webhook Event Types
 */
export enum EventType {
  PING = "ping",
  PUSH = "push",
  ISSUES = "issues",
  WORKFLOW_RUN = "workflow_run",
  WORKFLOW_JOB = "workflow_job",
}

/**
 * Base GitHub Webhook Payload
 */
export interface BasePayload {
  action?: string;
  sender: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  repository: {
    name: string;
    full_name: string;
    html_url: string;
    description?: string;
  };
}

/**
 * Push Event Payload
 */
export interface PushPayload extends BasePayload {
  ref: string;
  before: string;
  after: string;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    url: string;
    added: string[];
    removed: string[];
    modified: string[];
  }>;
}

/**
 * Issues Event Payload
 */
export interface IssuesPayload extends BasePayload {
  action: "opened" | "closed" | "reopened" | "labeled" | "unlabeled";
  issue: {
    number: number;
    title: string;
    body?: string;
    state: "open" | "closed";
    html_url: string;
    labels: Array<{
      name: string;
      color: string;
    }>;
    assignees: Array<{
      login: string;
      avatar_url: string;
    }>;
  };
}

/**
 * Workflow Run Event Payload
 */
export interface WorkflowRunPayload extends BasePayload {
  action: "requested" | "completed" | "in_progress";
  workflow_run: {
    id: number;
    name: string;
    status: "queued" | "in_progress" | "completed";
    conclusion?: "success" | "failure" | "cancelled" | "skipped";
    html_url: string;
    created_at: string;
    updated_at: string;
    run_started_at?: string;
  };
}

/**
 * Workflow Job Event Payload
 */
export interface WorkflowJobPayload extends BasePayload {
  action: "queued" | "in_progress" | "completed";
  workflow_job: {
    id: number;
    name: string;
    status: "queued" | "in_progress" | "completed";
    conclusion?: "success" | "failure" | "cancelled" | "skipped";
    html_url: string;
    started_at?: string;
    completed_at?: string;
    runner_name?: string;
  };
}

/**
 * Discord Embed Structure
 */
export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  timestamp?: string;
  url?: string;
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
}

/**
 * Discord Webhook Message
 */
export interface DiscordMessage {
  embeds: DiscordEmbed[];
}

/**
 * Application Configuration
 */
export interface AppConfig {
  app: {
    debug: boolean;
    port: number;
  };
  github: {
    secret: string;
  };
  discord: {
    webhook_url: string;
  };
  events: {
    push: boolean;
    issues: boolean;
    workflow_run: boolean;
    workflow_job: boolean;
  };
  events_config: {
    push: {
      show_file_changes: boolean;
      max_commits_shown: number;
      show_commit_details: boolean;
      embed_color: number;
    };
    issues: {
      show_labels: boolean;
      show_assignees: boolean;
      embed_color: number;
    };
    workflow_run: {
      show_duration: boolean;
      show_conclusion: boolean;
      embed_color: number;
    };
    workflow_job: {
      show_steps: boolean;
      show_runner: boolean;
      embed_color: number;
    };
  };
}

/**
 * Event Handler Base Class
 */
export abstract class Event {
  public readonly name: string;
  public readonly events: EventType[];

  constructor(options: { name: string; events: EventType[] }) {
    this.name = options.name;
    this.events = options.events;
  }

  public abstract execute(payload: any): Promise<void>;
}

/**
 * Generic object type
 */
export type Obj = Record<string, any>;
