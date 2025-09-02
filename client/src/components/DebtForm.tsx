import { useState } from "react"
import { createDebt } from "../lib/api"
import type { DebtItem } from "../lib/api"
import { useAuth } from "../context/AuthContext"

export default function DebtForm({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth()
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [items, setItems] = useState<DebtItem[]>([
    { description: "", amount: 0 },
  ])
  const [dueDate, setDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)

  const updateItem = (idx: number, field: keyof DebtItem, value: string) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx
          ? { ...it, [field]: field === "amount" ? Number(value) : value }
          : it
      )
    )
  }

  const addItem = () =>
    setItems((prev) => [...prev, { description: "", amount: 0 }])
  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx))

  const submit = async () => {
    if (!user) return
    if (!customerName || total <= 0) {
      alert("Mijoz nomi va summa talab qilinadi")
      return
    }
    setSubmitting(true)
    try {
      await createDebt({
        customerName,
        phone,
        items: items.filter((i) => i.description && i.amount > 0),
        total,
        dueDate: dueDate || undefined,
      })
      setCustomerName("")
      setPhone("")
      setItems([{ description: "", amount: 0 }])
      setDueDate("")
      onCreated()
    } catch (e) {
      console.error(e)
      alert("Qarz yozuvi yaratilolmadi")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        Yangi qarz
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800"
          placeholder="Mijoz nomi"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800"
          placeholder="Telefon (ixtiyoriy)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <input
              className="col-span-7 border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800"
              placeholder="Tovar/ish"
              value={it.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
            />
            <input
              className="col-span-3 border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800"
              placeholder="Summa"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={String(it.amount ?? "")}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/[^0-9]/g, "")
                updateItem(idx, "amount", digitsOnly)
              }}
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="col-span-2 px-3 py-2 rounded-lg bg-red-100 text-red-700"
            >
              O'chirish
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800"
        >
          + Yozuv qo'shish
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <input
          className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="text-right font-semibold text-gray-900 dark:text-gray-100">
          Jami: {total.toLocaleString()}
        </div>
      </div>
      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="w-full md:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
      >
        {submitting ? "Saqlanmoqda..." : "Qarz qo'shish"}
      </button>
    </div>
  )
}
