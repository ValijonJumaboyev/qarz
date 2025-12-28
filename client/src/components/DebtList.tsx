import { useEffect, useMemo, useState } from "react"
import { listDebts, updateDebtStatus } from "../lib/api"
import { useAuth } from "../context/AuthContext"
import ReminderBtn from "./ReminderBtn"

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

export default function DebtList({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "partial" | "denied"
  >("all")
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
        console.log("Fetching debts for user:", user.email)
        const data = await listDebts()
        console.log("Received debts:", data)
        setDebts(data)
      } catch (error) {
        console.error("Error fetching debts:", error)
        setDebts([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user, refreshKey])

  const filteredDebts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return debts.filter((d) => {
      const status = d.status || "unpaid"
      const matchesStatus =
        statusFilter === "all" ? true : status === statusFilter
      const matchesSearch =
        term.length === 0 ||
        d.customerName.toLowerCase().includes(term) ||
        (d.phone ?? "").toLowerCase().includes(term) ||
        d.items?.some((i) => i.description.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [debts, search, statusFilter])

  const totals = useMemo(() => {
    const total = filteredDebts.reduce((s, d) => s + (Number(d.total) || 0), 0)
    const count = filteredDebts.length
    return { total, count }
  }, [filteredDebts])

  const requestStatusChange = (
    debtId: string,
    newStatus: string,
    prevStatus: string
  ) => {
    setPendingChange({ id: debtId, newStatus, prevStatus })
    // reflect selection optimistically
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
      // revert on failure
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

  if (loading) return <div className="text-gray-500">Yuklanmoqda...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mijoz, telefon yoki tavsif bo‘yicha qidirish"
            className="w-full sm:w-80 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Barcha holatlar</option>
            <option value="unpaid">To‘lanmagan</option>
            <option value="paid">To‘langan</option>
            <option value="denied">Rad etilgan</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full md:w-auto">
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 shadow">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Qarz soni
            </div>
            <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {totals.count}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-900 shadow">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Jami summa
            </div>
            <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {totals.total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredDebts.map((d) => (
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
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString()
                    : "-"}
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
                    : d.status === "partial"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
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
        ))}
        {filteredDebts.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Hozircha ma'lumot yo'q
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-left bg-white dark:bg-gray-900">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">Mijoz</th>
              <th className="px-4 py-2">Telefon</th>
              <th className="px-4 py-2">Jami</th>
              <th className="px-4 py-2">Holat</th>
              <th className="px-4 py-2">Sana</th>
            </tr>
          </thead>
          <tbody>
            {filteredDebts.map((d) => (
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
                        : d.status === "partial"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
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
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
            {filteredDebts.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={5}>
                  Hozircha ma'lumot yo'q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <br />

      <ReminderBtn />
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
