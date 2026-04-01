import { AgentPlayground } from "@/components/agent-playground";
import { clientAgents } from "@/lib/client-agents";

export default function Home() {
  return <AgentPlayground clients={clientAgents} />;
}
