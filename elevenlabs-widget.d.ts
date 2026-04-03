import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "agent-id"?: string;
        "signed-url"?: string;
        "server-location"?: "us";
        variant?: "tiny" | "compact" | "full";
        placement?:
          | "top-left"
          | "top"
          | "top-right"
          | "bottom-left"
          | "bottom"
          | "bottom-right";
        dismissible?: "true" | "false";
        "default-expanded"?: "true" | "false";
        "always-expanded"?: "true" | "false";
        "avatar-image-url"?: string;
        "avatar-orb-color-1"?: string;
        "avatar-orb-color-2"?: string;
        "action-text"?: string;
        "start-call-text"?: string;
        "end-call-text"?: string;
        "expand-text"?: string;
        "listening-text"?: string;
        "speaking-text"?: string;
        "dynamic-variables"?: string;
        "override-first-message"?: string;
        "override-language"?: string;
        "override-prompt"?: string;
        "override-voice-id"?: string;
        "markdown-link-allowed-hosts"?: string;
        "markdown-link-include-www"?: "true" | "false";
        "show-avatar-when-collapsed"?: "true" | "false";
      };
    }
  }
}
