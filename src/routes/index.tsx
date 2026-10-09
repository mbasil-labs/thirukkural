import { createFileRoute } from "@tanstack/react-router";
import { Reader } from "@/components/reader";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Reader />;
}
