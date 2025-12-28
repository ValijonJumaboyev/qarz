import { useEffect, useMemo, useState } from "react"
import { listDebts, updateDebtStatus } from "../lib/api"
import { useAuth } from "../context/AuthContext"
import ThemeToggle from "../components/ThemeToggle"

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

export default function Reminders() {
  const { user, signOut } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    id: string
    newStatus: string
    prevStatus: string
  } | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!user) return
      setLoading(true)
      try {
        const data = await listDebts()
        setDebts(data)
      } catch (error) {
        console.error("Error fetching debts:", error)
        setDebts([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user])

  const reminderDebts = useMemo(() => {
    return debts.filter((d) => {
      const status = d.status || "unpaid"
      if (status !== "unpaid") return false

      const daysLeft = getDaysLeft(d.dueDate)
      // Show only debts that are still active and have <= 2 days left
      return daysLeft !== null && daysLeft >= 0 && daysLeft <= 2
    })
  }, [debts])

  const requestStatusChange = (
    debtId: string,
    newStatus: string,
    prevStatus: string
  ) => {
    setPendingChange({ id: debtId, newStatus, prevStatus })
    setDebts((current) =>
      current.map((d) =>
        d._id === debtId
          ? {
              ...d,
              status: newStatus,
            }
          : d
      )
    )
  }

  const confirmStatusChange = async () => {
    if (!pendingChange) return
    const { id, newStatus, prevStatus } = pendingChange
    try {
      await updateDebtStatus(id, newStatus)
    } catch (error) {
      console.error("Error updating status", error)
      setDebts((current) =>
        current.map((d) => (d._id === id ? { ...d, status: prevStatus } : d))
      )
      alert("Holatni o‘zgartirishda xatolik yuz berdi")
    } finally {
      setPendingChange(null)
    }
  }

  const cancelStatusChange = () => {
    if (!pendingChange) return
    const { id, prevStatus } = pendingChange
    setDebts((current) =>
      current.map((d) => (d._id === id ? { ...d, status: prevStatus } : d))
    )
    setPendingChange(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
        <div className="max-w-5xl mx-auto text-gray-500 dark:text-gray-400">
          Yuklanmoqda...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Eslatmalar
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {`Qolgan muddati 2 kundan kam bo'lgan (jami 10 kunlik) qarzlar ro'yxati`}
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

        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Eslatma ostidagi qarzlar soni
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {reminderDebts.length}
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3 mt-4">
            {reminderDebts.map((d) => {
              const daysLeft = getDaysLeft(d.dueDate)
              return (
                <div
                  key={d._id}
                  className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {d.customerName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {d.items?.map((i) => i.description).join(", ")}
                      </div>
                    </div>
                    <div className="ml-2 text-right shrink-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {Number(d.total || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {daysLeft !== null ? `${daysLeft} kun` : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                      {d.phone || "Telefon yo'q"}
                    </div>
                    <select
                      value={d.status || "unpaid"}
                      onChange={(e) =>
                        requestStatusChange(
                          d._id,
                          e.target.value,
                          d.status || "unpaid"
                        )
                      }
                      className={`px-2 py-1.5 rounded-lg text-xs border flex-shrink-0 ${
                        d.status === "paid"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : d.status === "denied"
                          ? "bg-amber-100 text-gray-800 border-amber-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      <option value="unpaid">To'lanmagan</option>
                      <option value="paid">To'langan</option>
                      <option value="denied">Rad etilgan</option>
                    </select>
                  </div>
                </div>
              )
            })}
            {reminderDebts.length === 0 && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Hozircha eslatma kerak bo'lgan qarzlar yo'q
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow mt-4">
            <table className="min-w-full text-left bg-white dark:bg-gray-900">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2">Mijoz</th>
                  <th className="px-4 py-2">Telefon</th>
                  <th className="px-4 py-2">Jami</th>
                  <th className="px-4 py-2">Qolgan kun</th>
                  <th className="px-4 py-2">Holat</th>
                </tr>
              </thead>
              <tbody>
                {reminderDebts.map((d) => {
                  const daysLeft = getDaysLeft(d.dueDate)
                  return (
                    <tr
                      key={d._id}
                      className="border-t border-gray-200 dark:border-gray-800"
                    >
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {d.customerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {d.items?.map((i) => i.description).join(", ")}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        {d.phone || "-"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {Number(d.total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        {daysLeft ?? "-"}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={d.status || "unpaid"}
                          onChange={(e) =>
                            requestStatusChange(
                              d._id,
                              e.target.value,
                              d.status || "unpaid"
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm border ${
                            d.status === "paid"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : d.status === "denied"
                              ? "bg-amber-100 text-gray-800 border-amber-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          <option value="unpaid">To'lanmagan</option>
                          <option value="paid">To'langan</option>
                          <option value="denied">Rad etilgan</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
                {reminderDebts.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-6 text-center text-gray-500"
                      colSpan={5}
                    >
                      Hozircha eslatma kerak bo&apos;lgan qarzlar yo&apos;q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              O&apos;zgartirishlarni kiritmoqchimisiz?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Holatni{" "}
              <span className="font-semibold">
                {pendingChange.prevStatus || "unpaid"}
              </span>{" "}
              dan{" "}
              <span className="font-semibold">{pendingChange.newStatus}</span>{" "}
              ga o&apos;zgartirishni tasdiqlang.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Yo&apos;q
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Ha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
