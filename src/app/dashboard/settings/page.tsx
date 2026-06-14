import { getUserSession } from "@/app/actions/auth"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const session = await getUserSession()
  const userName = session?.user_metadata?.name || "Student"
  const userEmail = session?.email || "student@example.com"

  return <SettingsClient userName={userName} userEmail={userEmail} />
}

