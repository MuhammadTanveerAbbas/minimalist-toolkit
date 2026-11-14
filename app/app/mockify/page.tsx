import { redirect } from "next/navigation"

export default function MockifyPage() {
  redirect("/app/chat")
}