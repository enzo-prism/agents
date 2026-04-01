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
        variant?: "expanded";
        dismissible?: "true" | "false";
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
      };
    }
  }
}
