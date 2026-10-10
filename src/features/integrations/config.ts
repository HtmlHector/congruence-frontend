import type { IntegrationDefinition } from "./types";

export const INTEGRATION_CATALOG: IntegrationDefinition[] = [
  {
    id: "GITHUB",
    name: "GitHub",
    category: "Developer & CI/CD",
    description: "Connect GitHub repositories, surface pull requests, and stream commit webhook events.",
    isOAuth: true,
    docsUrl: "https://docs.github.com/en/apps",
  },
  {
    id: "SLACK",
    name: "Slack",
    category: "Alerts & Chat",
    description: "Receive real-time alerts, project notifications, and team activity directly in your Slack channels.",
    isOAuth: true,
    docsUrl: "https://api.slack.com",
  },
  {
    id: "LINEAR",
    name: "Linear",
    category: "Issue Tracking",
    description: "Sync project issues, create tasks from events, and update issue states automatically.",
    isOAuth: true,
    docsUrl: "https://developers.linear.app",
  },
  {
    id: "CUSTOM_API_KEY",
    name: "Custom API Key",
    category: "Custom",
    description: "Save encrypted external service tokens and access keys scoped to this workspace.",
    isOAuth: false,
  },
  {
    id: "CUSTOM_WEBHOOK",
    name: "Custom Webhook",
    category: "Custom",
    description: "Configure inbound webhook verification secrets to ingest external HTTP event streams.",
    isOAuth: false,
  },
];
