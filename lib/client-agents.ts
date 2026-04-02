export type ClientAgent = {
  slug: "njo" | "wong" | "norodovich" | "chuang";
  name: string;
  summary?: string;
  envKey: string;
  agentId?: string;
  accent: string;
  accentSoft: string;
  orbColors: [string, string];
};

const cleanValue = (value?: string) => value?.trim() || undefined;
const NJO_AGENT_ID = "agent_2901kn4t3ab6eycswyjbf82tqyxv";
const WONG_AGENT_ID = "agent_6401kmp8pjw0fc48j493nzkybmr0";
const NORODOVICH_AGENT_ID = "agent_6301kn20gh9denavkvn1bg9krf54";
const CHUANG_AGENT_ID = "agent_4801kn7ednjse6drbr2cnt62kkp2";

export const clientAgents = [
  {
    slug: "njo",
    name: "Dr. Njo",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NJO",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NJO) ??
      NJO_AGENT_ID,
    accent: "#23574b",
    accentSoft: "rgba(35, 87, 75, 0.14)",
    orbColors: ["#23574b", "#9ed9ca"],
  },
  {
    slug: "wong",
    name: "Dr. Wong",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_WONG",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_WONG) ??
      WONG_AGENT_ID,
    accent: "#3558b1",
    accentSoft: "rgba(53, 88, 177, 0.14)",
    orbColors: ["#3558b1", "#c6d4ff"],
  },
  {
    slug: "norodovich",
    name: "Dr. Narodovich",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NORODOVICH",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NORODOVICH) ??
      NORODOVICH_AGENT_ID,
    accent: "#6d5231",
    accentSoft: "rgba(109, 82, 49, 0.14)",
    orbColors: ["#6d5231", "#edd4b3"],
  },
  {
    slug: "chuang",
    name: "Dr. Chuang",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUANG",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUANG) ??
      CHUANG_AGENT_ID,
    accent: "#7b2f7d",
    accentSoft: "rgba(123, 47, 125, 0.14)",
    orbColors: ["#7b2f7d", "#e7b6ea"],
  },
] as const satisfies readonly ClientAgent[];
