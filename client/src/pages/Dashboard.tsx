import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import ThemeToggle from "../components/ThemeToggle"
import DebtForm from "../components/DebtForm"
import DebtList from "../components/DebtList"

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              Qarzdor Panel — {user?.shopName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Mijoz qarzlarini boshqarish
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-nowrap"
            >
              Chiqish
            </button>
          </div>
        </header>

        <DebtForm onCreated={() => setRefreshKey((k) => k + 1)} />
        <DebtList refreshKey={refreshKey} />
      </div>
    </div>
  )
}
