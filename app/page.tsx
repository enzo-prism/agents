import { AgentPlayground } from "@/components/agent-playground";
import { clientAgents, isClientSlug } from "@/lib/client-agents";

type HomeProps = {
  searchParams: Promise<{
    client?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const requestedClient = Array.isArray(params.client)
    ? params.client[0]
    : params.client;
  const initialClient =
    requestedClient && isClientSlug(requestedClient)
      ? requestedClient
      : clientAgents[0].slug;

  return (
    <AgentPlayground clients={clientAgents} initialClient={initialClient} />
  );
}
