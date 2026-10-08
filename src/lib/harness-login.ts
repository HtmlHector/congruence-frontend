import type { SupportedHarness } from "@/lib/api";

// Host-native sign-in per harness. The command runs in the lane PTY via the
// vendor's own CLI; Congruence never observes the credential.
export const HARNESS_LOGIN_COMMANDS: Record<SupportedHarness, string> = {
  claude: "claude login",
  codex: "codex login",
  antigravity: "agy",
  opencode: "opencode auth login",
};

// What the user must do after the command starts, per sign-in flow.
export const HARNESS_LOGIN_HINTS: Record<SupportedHarness, string> = {
  claude: "Follow the private bridge URL in the terminal to finish Anthropic sign-in.",
  codex: "Follow the private bridge URL in the terminal to finish OpenAI sign-in.",
  antigravity:
    "Open the authorization URL printed in the terminal on any device, then paste the code back into the session.",
  opencode: "Pick your provider in the session terminal and follow its prompts.",
};
