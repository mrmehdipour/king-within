import { AppDataProvider } from '../lib/appData'
import TabBar from '../components/TabBar'

// Shell for the authenticated area: shared data provider + bottom tab bar.
// (Phase 2 will add the real auth gate that redirects to /signup.)
export default function AppLayout({ children }) {
  return (
    <AppDataProvider>
      <div className="relative z-[1] min-h-screen pb-24">{children}</div>
      <TabBar />
    </AppDataProvider>
  )
}
