import type { Metadata } from "next"
import { MockifyTool } from "@/components/mockify/mockify-tool"

export const metadata: Metadata = {
  title: "Mockify",
  description: "Describe an idea and generate an image with Mockify.",
}

export default function MockifyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <MockifyTool />
    </div>
  )
}
