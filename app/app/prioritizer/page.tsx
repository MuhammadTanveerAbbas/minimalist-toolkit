import type { Metadata } from "next"
import { PrioritizerTool } from "@/components/prioritizer/prioritizer-tool"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Prioritizer",
  description: "Score features with weighted criteria, test the ranking, and export a decision record.",
}

export default function PrioritizerPage() {
  return <PrioritizerTool />
}
