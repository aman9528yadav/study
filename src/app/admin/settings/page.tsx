import { getSystemSettings } from "@/app/actions/settings"
import AdminSettingsClient from "./settings-client"

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings()

  return <AdminSettingsClient initialSettings={settings} />
}
