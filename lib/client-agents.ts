export type ClientCapabilityIcon =
  | "book"
  | "briefcase"
  | "calendar"
  | "clock"
  | "map-pin"
  | "presentation"
  | "shield"
  | "stethoscope"
  | "user"
  | "users"
  | "wallet";

export type ClientCapability = {
  icon: ClientCapabilityIcon;
  title: string;
  description: string;
};

export type ClientAgent = {
  slug:
    | "njo"
    | "wong"
    | "norodovich"
    | "chuang"
    | "aguil"
    | "ji"
    | "anderson"
    | "banaga"
    | "chun";
  name: string;
  summary?: string;
  websiteUrl?: string;
  envKey: string;
  agentId?: string;
  accent: string;
  accentSoft: string;
  orbColors: [string, string];
  capabilities: readonly ClientCapability[];
};

export type ClientSlug = ClientAgent["slug"];

const cleanValue = (value?: string) => value?.trim() || undefined;
const NJO_AGENT_ID = "agent_2901kn4t3ab6eycswyjbf82tqyxv";
const WONG_AGENT_ID = "agent_6401kmp8pjw0fc48j493nzkybmr0";
const NORODOVICH_AGENT_ID = "agent_6301kn20gh9denavkvn1bg9krf54";
const CHUANG_AGENT_ID = "agent_4801kn7ednjse6drbr2cnt62kkp2";
const AGUIL_AGENT_ID = "agent_4901kn7nwpsse569ce7dp27aze8g";
const JI_AGENT_ID = "agent_4901kn9vshwtfnss5e365h297tve";
const ANDERSON_AGENT_ID = "agent_7901kn9vfzspeft9fxh46m318760";
const BANAGA_AGENT_ID = "agent_8801kn9vpzvwfn593sa0c0qn68vq";
const CHUN_AGENT_ID = "agent_8501kn9x0tsnf0bsh0ewbhpxjmgy";

const generalDentistCapabilities = [
  {
    icon: "calendar",
    title: "Visit routing",
    description: "Guide exams, cleanings, emergencies, and consult booking.",
  },
  {
    icon: "stethoscope",
    title: "General care",
    description: "Cover preventive, restorative, cosmetic, and urgent care.",
  },
  {
    icon: "map-pin",
    title: "Office details",
    description: "Share location, hours, and how to contact the office.",
  },
  {
    icon: "shield",
    title: "Insurance",
    description: "Cover benefits, self-pay, and financing basics.",
  },
  {
    icon: "users",
    title: "Visit prep",
    description: "Set expectations for first visits and follow-up steps.",
  },
] as const satisfies readonly ClientCapability[];

const endodontistCapabilities = [
  {
    icon: "calendar",
    title: "Pain triage",
    description: "Route same-day pain, referrals, and root canal consults.",
  },
  {
    icon: "stethoscope",
    title: "Root canal care",
    description: "Explain root canals, retreatments, and apicoectomy basics.",
  },
  {
    icon: "book",
    title: "Referral flow",
    description: "Confirm what records, imaging, or notes to bring.",
  },
  {
    icon: "shield",
    title: "Insurance",
    description: "Cover specialist billing, benefits, and next steps.",
  },
  {
    icon: "users",
    title: "Visit prep",
    description: "Set expectations for consult timing, comfort, and follow-up.",
  },
] as const satisfies readonly ClientCapability[];

const periodontistCapabilities = [
  {
    icon: "calendar",
    title: "Perio consults",
    description: "Route gum therapy, grafting, implant, and referral visits.",
  },
  {
    icon: "stethoscope",
    title: "Periodontal care",
    description: "Cover gum disease therapy, surgery, grafting, and implants.",
  },
  {
    icon: "book",
    title: "Referral flow",
    description: "Confirm records, imaging, and specialist handoff steps.",
  },
  {
    icon: "shield",
    title: "Insurance",
    description: "Cover specialist billing, benefits, and financing basics.",
  },
  {
    icon: "users",
    title: "Visit prep",
    description: "Set expectations for consult timing, sedation, and follow-up.",
  },
] as const satisfies readonly ClientCapability[];

export const clientAgents = [
  {
    slug: "njo",
    name: "Dr. Njo",
    websiteUrl: "https://michaelnjodds.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NJO",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NJO) ??
      NJO_AGENT_ID,
    accent: "#23574b",
    accentSoft: "rgba(35, 87, 75, 0.14)",
    orbColors: ["#23574b", "#9ed9ca"],
    capabilities: [
      {
        icon: "calendar",
        title: "Book a meeting",
        description: "Share the meeting link and next step.",
      },
      {
        icon: "book",
        title: "Book insights",
        description: "Pull key ideas and useful takeaways.",
      },
      {
        icon: "briefcase",
        title: "Who he helps",
        description: "Explain the leaders and teams he works with.",
      },
      {
        icon: "presentation",
        title: "Advisory formats",
        description: "Outline talks, workshops, and consulting options.",
      },
      {
        icon: "user",
        title: "Background",
        description: "Summarize his story and point of view.",
      },
    ],
  },
  {
    slug: "wong",
    name: "Dr. Wong",
    websiteUrl: "https://chriswongdds.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_WONG",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_WONG) ??
      WONG_AGENT_ID,
    accent: "#3558b1",
    accentSoft: "rgba(53, 88, 177, 0.14)",
    orbColors: ["#3558b1", "#c6d4ff"],
    capabilities: [
      {
        icon: "calendar",
        title: "Book appointment",
        description: "Route patients to the right visit type.",
      },
      {
        icon: "clock",
        title: "Hours and access",
        description: "Share office hours and how to reach the practice.",
      },
      {
        icon: "stethoscope",
        title: "Services",
        description: "Explain care options and what each visit covers.",
      },
      {
        icon: "shield",
        title: "Insurance",
        description: "Cover insurance, self-pay, and financing basics.",
      },
      {
        icon: "users",
        title: "Meet the team",
        description: "Introduce the doctor, team, and patient experience.",
      },
    ],
  },
  {
    slug: "norodovich",
    name: "Dr. Narodovich",
    websiteUrl: "https://sacramentodentalmedicine.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NORODOVICH",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NORODOVICH) ??
      NORODOVICH_AGENT_ID,
    accent: "#6d5231",
    accentSoft: "rgba(109, 82, 49, 0.14)",
    orbColors: ["#6d5231", "#edd4b3"],
    capabilities: [
      {
        icon: "calendar",
        title: "Book consult",
        description: "Help patients start with the right consult.",
      },
      {
        icon: "clock",
        title: "Availability",
        description: "Explain open hours and best booking windows.",
      },
      {
        icon: "stethoscope",
        title: "Care options",
        description: "Clarify treatments, fit, and next steps.",
      },
      {
        icon: "wallet",
        title: "Investment",
        description: "Discuss financing, payment plans, and fees.",
      },
      {
        icon: "user",
        title: "Practice story",
        description: "Share the doctor background and practice approach.",
      },
    ],
  },
  {
    slug: "chuang",
    name: "Dr. Chuang",
    websiteUrl: "https://famfirstsmile.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUANG",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUANG) ??
      CHUANG_AGENT_ID,
    accent: "#7b2f7d",
    accentSoft: "rgba(123, 47, 125, 0.14)",
    orbColors: ["#7b2f7d", "#e7b6ea"],
    capabilities: [
      {
        icon: "calendar",
        title: "Book visit",
        description: "Guide people to the right appointment type.",
      },
      {
        icon: "map-pin",
        title: "Office details",
        description: "Share location, hours, and contact details.",
      },
      {
        icon: "stethoscope",
        title: "Service offering",
        description: "Explain available care and what happens next.",
      },
      {
        icon: "shield",
        title: "Payment options",
        description: "Cover insurance, financing, and self-pay paths.",
      },
      {
        icon: "users",
        title: "About the practice",
        description: "Introduce the doctor, team, and care style.",
      },
    ],
  },
  {
    slug: "aguil",
    name: "Dr. Aguil",
    websiteUrl: "https://exquisitedentistryla.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_AGUIL",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_AGUIL) ??
      AGUIL_AGENT_ID,
    accent: "#8a5f2d",
    accentSoft: "rgba(138, 95, 45, 0.14)",
    orbColors: ["#8a5f2d", "#f1d1a5"],
    capabilities: [
      {
        icon: "calendar",
        title: "Book consult",
        description: "Route patients into the right cosmetic consult.",
      },
      {
        icon: "stethoscope",
        title: "Smile services",
        description: "Cover veneers, implants, whitening, and Invisalign.",
      },
      {
        icon: "map-pin",
        title: "Office details",
        description: "Share the Wilshire Blvd location and visit basics.",
      },
      {
        icon: "clock",
        title: "Hours",
        description: "Explain the Monday to Thursday office schedule.",
      },
      {
        icon: "shield",
        title: "Insurance and pay",
        description: "Discuss insurance support and flexible financing.",
      },
    ],
  },
  {
    slug: "ji",
    name: "Dr. Ji",
    summary: "General dentistry QA agent.",
    websiteUrl: "https://www.tingjenjidds.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_JI",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_JI) ?? JI_AGENT_ID,
    accent: "#2f6f76",
    accentSoft: "rgba(47, 111, 118, 0.14)",
    orbColors: ["#2f6f76", "#b7e1e4"],
    capabilities: generalDentistCapabilities,
  },
  {
    slug: "anderson",
    name: "Dr. Anderson",
    summary: "Endodontic QA agent.",
    websiteUrl: "https://www.winecountryrootcanal.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_ANDERSON",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_ANDERSON) ??
      ANDERSON_AGENT_ID,
    accent: "#6451a7",
    accentSoft: "rgba(100, 81, 167, 0.14)",
    orbColors: ["#6451a7", "#d4c8ff"],
    capabilities: endodontistCapabilities,
  },
  {
    slug: "banaga",
    name: "Dr. Banaga",
    summary: "General dentistry QA agent.",
    websiteUrl: "https://towncentredental.net",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_BANAGA",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_BANAGA) ??
      BANAGA_AGENT_ID,
    accent: "#9a5b31",
    accentSoft: "rgba(154, 91, 49, 0.14)",
    orbColors: ["#9a5b31", "#efccaf"],
    capabilities: generalDentistCapabilities,
  },
  {
    slug: "chun",
    name: "Dr. Chun",
    summary: "Periodontal QA agent.",
    websiteUrl: "https://www.coastperiodontics.com",
    envKey: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUN",
    agentId:
      cleanValue(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUN) ??
      CHUN_AGENT_ID,
    accent: "#3b7a67",
    accentSoft: "rgba(59, 122, 103, 0.14)",
    orbColors: ["#3b7a67", "#c4eadf"],
    capabilities: periodontistCapabilities,
  },
] as const satisfies readonly ClientAgent[];

export function isClientSlug(value: string): value is ClientSlug {
  return clientAgents.some((client) => client.slug === value);
}
