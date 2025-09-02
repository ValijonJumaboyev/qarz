import { useEffect, useMemo, useState } from "react"
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

export default function DebtList({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)

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

  const totals = useMemo(() => {
    const total = debts.reduce((s, d) => s + (Number(d.total) || 0), 0)
    const count = debts.length
    return { total, count }
  }, [debts])

  if (loading) return <div className="text-gray-500">Yuklanmoqda...</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Qarz soni
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {totals.count}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Jami summa
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {totals.total.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
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
            {debts.map((d) => (
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
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      d.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : d.status === "partial"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {d.status || "unpaid"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
            {debts.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={5}>
                  Hozircha ma'lumot yo'q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
