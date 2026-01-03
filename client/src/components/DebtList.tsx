import { useEffect, useState, useMemo } from "react"
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

type GroupedDebt = Debt & { records: Debt[] }

export default function DebtList({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "unpaid" | "denied"
  >("all")
  const [currentPage, setCurrentPage] = useState(1)
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
  }, [user, refreshKey])
  const [activeCustomer, setActiveCustomer] = useState<
    (Debt & { records?: Debt[] }) | null
  >(null)

  // Helper function to normalize customer names
  const normalizeName = (name: string): string => {
    return (name || "").toLowerCase().trim().replace(/\s+/g, " ")
  }

  // Type guard to check if debt is grouped
  const isGroupedDebt = (d: Debt | GroupedDebt): d is GroupedDebt => {
    return "records" in d && Array.isArray(d.records)
  }

  // Compute visible debts using useMemo for proper reactivity
  const visibleDebts = useMemo(() => {
    const term = search.trim().toLowerCase()

    // Always group unpaid debts by customer name, regardless of filter
    const unpaidDebts = debts.filter((d) => {
      const status = d.status || "unpaid"
      return status === "unpaid"
    })

    // Group unpaid debts by customer name
    const groupMap = new Map<string, GroupedDebt>()

    unpaidDebts.forEach((d) => {
      const key = normalizeName(d.customerName)
      if (!key) return // Skip if no customer name

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          ...d,
          _id: `group-${key}`,
          total: 0,
          records: [],
        })
      }

      const entry = groupMap.get(key)!
      entry.total += Number(d.total || 0)
      entry.records.push(d)
    })

    // Separate groups (multiple records) from individual debts (single record)
    const groups: GroupedDebt[] = []
    const individualDebts: Debt[] = []
    const groupedNames = new Set<string>()

    groupMap.forEach((group) => {
      if (group.records.length > 1) {
        groups.push(group)
        groupedNames.add(normalizeName(group.customerName))
      } else {
        // This is an individual debt (only one record for this customer)
        individualDebts.push(group.records[0])
      }
    })

    // Filter groups by search term
    const filteredGroups = groups.filter((g) => {
      const matchesSearch =
        term.length === 0 ||
        g.customerName.toLowerCase().includes(term) ||
        (g.phone ?? "").toLowerCase().includes(term) ||
        g.records.some((r) =>
          r.items?.some((i) => i.description.toLowerCase().includes(term))
        )
      return matchesSearch
    })

    // Filter individual debts by search term (exclude those that are in groups)
    const filteredIndividual = individualDebts.filter((d) => {
      const normalizedName = normalizeName(d.customerName)
      const isGrouped = groupedNames.has(normalizedName)
      if (isGrouped) return false // Skip if this customer is grouped

      const matchesSearch =
        term.length === 0 ||
        d.customerName.toLowerCase().includes(term) ||
        (d.phone ?? "").toLowerCase().includes(term) ||
        d.items?.some((i) => i.description.toLowerCase().includes(term))
      return matchesSearch
    })

    // Now handle non-unpaid debts based on status filter
    const nonUnpaidDebts = debts.filter((d) => {
      const status = d.status || "unpaid"
      return status !== "unpaid"
    })

    // Filter non-unpaid debts by status and search
    // Only include non-unpaid debts if statusFilter is "all" or matches their status
    const filteredNonUnpaid = nonUnpaidDebts.filter((d) => {
      const status = d.status || "unpaid"
      const shouldInclude = statusFilter === "all" || status === statusFilter
      if (!shouldInclude) return false

      const matchesSearch =
        term.length === 0 ||
        d.customerName.toLowerCase().includes(term) ||
        (d.phone ?? "").toLowerCase().includes(term) ||
        d.items?.some((i) => i.description.toLowerCase().includes(term))
      return matchesSearch
    })

    // Also filter unpaid groups/individuals by statusFilter if needed
    // If statusFilter is "unpaid", only show unpaid. If "all", show everything including unpaid
    const shouldShowUnpaid = statusFilter === "all" || statusFilter === "unpaid"

    // Combine grouped unpaid debts with filtered non-unpaid debts
    const result = shouldShowUnpaid
      ? [...filteredGroups, ...filteredIndividual, ...filteredNonUnpaid]
      : [...filteredNonUnpaid]
    return result
  }, [debts, search, statusFilter])

  // Pagination constants
  const ITEMS_PER_PAGE = 15
  const totalPages = Math.ceil(visibleDebts.length / ITEMS_PER_PAGE)

  // Get current page items
  const paginatedDebts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return visibleDebts.slice(startIndex, endIndex)
  }, [visibleDebts, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const totals = useMemo(() => {
    const total = visibleDebts.reduce((s, d) => s + (Number(d.total) || 0), 0)
    const count = visibleDebts.length
    return { total, count }
  }, [visibleDebts])

  const requestStatusChange = (
    debtId: string,
    newStatus: string,
    prevStatus: string,
    isGrouped?: boolean
  ) => {
    setPendingChange({ id: debtId, newStatus, prevStatus })
    // reflect selection optimistically
    if (isGrouped && debtId.startsWith("group-")) {
      // For grouped debts, update all records in the group
      const customerName = debtId.replace("group-", "")
      setDebts((current) =>
        current.map((d) => {
          const normalizedDebtName = (d.customerName || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
          const matchesCustomer = normalizedDebtName === customerName
          if (matchesCustomer && (d.status || "unpaid") === "unpaid") {
            return { ...d, status: newStatus }
          }
          return d
        })
      )
    } else {
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
  }

  const confirmStatusChange = async () => {
    if (!pendingChange) return
    const { id, newStatus, prevStatus } = pendingChange
    try {
      if (id.startsWith("group-")) {
        // For grouped debts, update all records in the group
        const customerName = id.replace("group-", "")
        const debtsToUpdate = debts.filter((d) => {
          const normalizedDebtName = (d.customerName || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
          const matchesCustomer = normalizedDebtName === customerName
          return matchesCustomer && (d.status || "unpaid") === "unpaid"
        })
        await Promise.all(
          debtsToUpdate.map((d) => updateDebtStatus(d._id, newStatus))
        )
      } else {
        await updateDebtStatus(id, newStatus)
      }
    } catch (error) {
      console.error("Error updating status", error)
      // revert on failure
      if (id.startsWith("group-")) {
        const customerName = id.replace("group-", "")
        setDebts((current) =>
          current.map((d) => {
            const normalizedDebtName = (d.customerName || "")
              .toLowerCase()
              .trim()
              .replace(/\s+/g, " ")
            const matchesCustomer = normalizedDebtName === customerName
            if (matchesCustomer && d.status === newStatus) {
              return { ...d, status: prevStatus }
            }
            return d
          })
        )
      } else {
        setDebts((current) =>
          current.map((d) => (d._id === id ? { ...d, status: prevStatus } : d))
        )
      }
      alert("Holatni o'zgartirishda xatolik yuz berdi")
    } finally {
      setPendingChange(null)
    }
  }

  const cancelStatusChange = () => {
    if (!pendingChange) return
    const { id, prevStatus } = pendingChange
    if (id.startsWith("group-")) {
      const customerName = id.replace("group-", "")
      setDebts((current) =>
        current.map((d) => {
          const normalizedDebtName = (d.customerName || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
          const matchesCustomer = normalizedDebtName === customerName
          if (matchesCustomer && d.status !== prevStatus) {
            return { ...d, status: prevStatus }
          }
          return d
        })
      )
    } else {
      setDebts((current) =>
        current.map((d) => (d._id === id ? { ...d, status: prevStatus } : d))
      )
    }
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
        {paginatedDebts.map((d) => (
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
                    d.status || "unpaid",
                    isGroupedDebt(d)
                  )
                }
                className={`px-2 py-1.5 rounded-lg text-xs border flex-shrink-0 ${
                  d.status === "paid"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : d.status === "unpaid"
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
            {isGroupedDebt(d) && d.records.length > 1 && (
              <button
                onClick={() => setActiveCustomer(d)}
                className="w-full mt-2 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 flex items-center justify-center gap-1.5"
              >
                <span>Ko'proq</span>
                <span className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                  {d.records.length}
                </span>
              </button>
            )}
          </div>
        ))}
        {paginatedDebts.length === 0 && visibleDebts.length > 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Bu sahifada ma'lumot yo'q
          </div>
        )}
        {visibleDebts.length === 0 && (
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
              <th className="px-4 py-2">Ko'proq</th>
              <th className="px-4 py-2">Sana</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDebts.map((d) => (
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
                        d.status || "unpaid",
                        isGroupedDebt(d)
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      d.status === "paid"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : d.status === "unpaid"
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
                <td className="px-4 py-2">
                  {isGroupedDebt(d) && d.records.length > 1 ? (
                    <button
                      onClick={() => setActiveCustomer(d)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 flex items-center gap-2"
                    >
                      <span>Ko'proq</span>
                      <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                        {d.records.length}
                      </span>
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
            {paginatedDebts.length === 0 && visibleDebts.length > 0 && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={6}>
                  Bu sahifada ma'lumot yo'q
                </td>
              </tr>
            )}
            {visibleDebts.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={6}>
                  Hozircha ma'lumot yo'q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span>
              Sahifa {currentPage} / {totalPages} ({visibleDebts.length} ta yozuv)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Oldingi
            </button>

            {/* Page numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      pageNum === currentPage
                        ? "bg-emerald-600 text-white"
                        : "text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}

      <br />

      <ReminderBtn />
      {pendingChange && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
      {activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {activeCustomer.customerName}
                </h3>
                {activeCustomer.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activeCustomer.phone}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {activeCustomer.records?.map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("uz-UZ", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "-"}
                      </div>
                      {r.phone && r.phone !== activeCustomer.phone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Telefon: {r.phone}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {Number(r.total || 0).toLocaleString()} so'm
                      </div>
                      <div className="text-xs mt-1">
                        <select
                          value={r.status || "unpaid"}
                          onChange={(e) =>
                            requestStatusChange(
                              r._id,
                              e.target.value,
                              r.status || "unpaid",
                              isGroupedDebt(r)
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm border ${
                            r.status === "paid"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : r.status === "unpaid"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : r.status === "denied"
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
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Mahsulotlar:
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {r.items &&
                      r.items.length > 0 &&
                      r.status === "unpaid" ? (
                        <ul className="list-disc list-inside space-y-1">
                          {r.items.map((item, idx) => (
                            <li key={idx}>
                              {item.description} -{" "}
                              {Number(item.amount || 0).toLocaleString()} so'm
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">Ma'lumot yo'q</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
