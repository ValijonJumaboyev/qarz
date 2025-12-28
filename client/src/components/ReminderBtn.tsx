import { useEffect, useMemo, useState } from "react"
import { BellAlertIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { listDebts } from "../lib/api"
import { useAuth } from "../context/AuthContext"

type Debt = {
  _id: string
  customerName: string
  phone?: string
  items: { description: string; amount: number }[]
  total: number
  dueDate?: string
  status?: string
  createdAt?: string
}

function getDaysLeft(dueDate?: string) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return null

  const now = new Date()
  // Clear time portion for both dates for a day-based diff
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  const startOfDue = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  ).getTime()

  const diffMs = startOfDue - startOfToday
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function ReminderBtn() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])

  useEffect(() => {
    const fetchDebts = async () => {
      if (!user) return
      try {
        const data = await listDebts()
        setDebts(data)
      } catch (error) {
        console.error("Error fetching debts for reminder count:", error)
        setDebts([])
      }
    }

    fetchDebts()
    // Refresh every 30 seconds to keep count updated
    const interval = setInterval(fetchDebts, 30000)
    return () => clearInterval(interval)
  }, [user])

  const reminderCount = useMemo(() => {
    return debts.filter((d) => {
      const status = d.status || "unpaid"
      if (status !== "unpaid") return false

      const daysLeft = getDaysLeft(d.dueDate)
      // Show only debts that are still active and have <= 2 days left
      return daysLeft !== null && daysLeft >= 0 && daysLeft <= 2
    }).length
  }, [debts])

  const displayCount = reminderCount > 9 ? "9+" : reminderCount.toString()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => navigate("/reminders")}
        className="
            w-16 h-16 sm:w-20 sm:h-20
            rounded-full
            flex items-center justify-center
            border-2 border-yellow-500
            bg-yellow-500/10
            text-yellow-600
            transition-all duration-200
            hover:bg-yellow-500/20
            hover:scale-105
            active:scale-95
            shadow-lg
            relative
          "
      >
        <BellAlertIcon className="w-8 h-8 sm:w-12 sm:h-12 stroke-current" />
        {reminderCount > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              sm:-top-2
              sm:-right-2
              min-w-[20px]
              sm:min-w-[24px]
              h-5
              sm:h-6
              px-1
              sm:px-1.5
              rounded-full
              bg-red-500
              text-white
              text-xs
              sm:text-sm
              font-bold
              flex
              items-center
              justify-center
              border-2
              border-white
              dark:border-gray-900
              shadow-lg
            "
          >
            {displayCount}
          </span>
        )}
      </button>
    </div>
  )
}
