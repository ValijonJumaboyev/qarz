import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  LockClosedIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline"

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
  })
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleRealSubmit()
  }

  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setDarkMode(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setDarkMode(true)
    }
  }

  const navigate = useNavigate()
  const { signUp, loading } = useAuth()

  const handleRealSubmit = async () => {
    try {
      if (form.password !== form.confirmPassword) {
        alert("Parollar mos emas")
        return
      }
      await signUp(form.email, form.password, form.businessName)
      navigate("/dashboard")
    } catch (e) {
      console.error(e)
      alert("Ro'yxatdan o'tish muvaffaqiyatsiz")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-950 dark:to-gray-900 px-4 py-8">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Hisob yaratish
          </h2>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:scale-110 transition shrink-0"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Ism va familiya
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-dark dark:text-white"
                placeholder="Ali Valiyev"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-dark dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Telefon raqam
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-dark dark:text-white"
                placeholder="+998 90 123 45 67"
                required
              />
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Do‘kon nomi
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-dark dark:text-white"
                placeholder="Qarzdor Supermarket"
                required
              />
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Do‘kon turi
            </label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 focus:outline-none"
              required
            >
              <option value="">Tanlang</option>
              <option value="grocery">Grocery / Bakkaleya</option>
              <option value="cafe">Cafe / Restoran</option>
              <option value="pharmacy">Dorixona</option>
              <option value="other">Boshqa</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Parol
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-dark dark:text-white"
                placeholder="********"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Parolni tasdiqlang
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-dark dark:text-white"
                placeholder="********"
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input type="checkbox" id="terms" className="mr-2" required />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Men{" "}
              <Link
                to="/terms"
                className="underline text-emerald-600 dark:text-emerald-400"
              >
                foydalanish shartlari
              </Link>{" "}
              va{" "}
              <Link
                to="/privacy"
                className="underline text-emerald-600 dark:text-emerald-400"
              >
                maxfiylik siyosatini
              </Link>{" "}
              qabul qilaman
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition"
          >
            {loading ? "Yuklanmoqda..." : "Hisob yaratish"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4 sm:mt-6">
          Allaqachon hisobingiz bormi?{" "}
          <Link
            to="/signin"
            className="text-emerald-600 dark:text-emerald-400 font-medium underline"
          >
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
