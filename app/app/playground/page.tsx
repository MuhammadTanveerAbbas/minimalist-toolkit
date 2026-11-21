import type { Metadata } from "next"
import { PlaygroundClient } from "@/components/playground/playground-client"

export const metadata: Metadata = {
  title: "AI Playground",
}

export default function PlaygroundPage() {
  return <PlaygroundClient />
}
