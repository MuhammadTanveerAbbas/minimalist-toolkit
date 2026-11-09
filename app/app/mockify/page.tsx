import { MockifyTool } from "@/components/mockify/mockify-tool"

export const dynamic = "force-dynamic"

export default function MockifyPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mockify</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create images from text prompts.</p>
      </div>
      <MockifyTool />
    </div>
  )
}
