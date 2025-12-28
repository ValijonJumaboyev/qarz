import { useEffect, useState } from "react"
import {
  MoonIcon,
  SunIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid"
import { Link } from "react-router-dom"

export default function App() {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 sm:px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-md">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Qarz<span className="text-emerald-600">Daftar</span>
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="#features"
            className="hidden sm:inline text-sm sm:text-base text-gray-700 dark:text-gray-200 hover:text-emerald-600"
          >
            Xizmatlar
          </a>
          <a
            href="#faq"
            className="hidden sm:inline text-sm sm:text-base text-gray-700 dark:text-gray-200 hover:text-emerald-600"
          >
            FAQ
          </a>
          <Link
            to="/signup"
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-gray-700 dark:text-gray-200 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <span className="hidden sm:inline">Ro'yxatdan o'tish</span>
            <span className="sm:hidden">Ro'yxat</span>
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:scale-110 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-center py-16 sm:py-24 md:py-28 px-4 sm:px-6 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 dark:from-emerald-900 dark:via-green-950 dark:to-black">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-green-200 drop-shadow-lg animate-pulse">
            Daftardan raqamli davrga o't!
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-emerald-50 px-2">
            Qarzingizni yo'qotmang. Hammasi bir joyda, xavfsiz va tezkor.
          </p>
          <div className="mt-8 sm:mt-10 flex justify-center gap-4">
            <button className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full bg-white text-green-700 font-semibold shadow-lg hover:scale-105 hover:bg-gray-100 transition">
              <Link to="/signup">🚀 Sinab ko'rish</Link>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent)]"></div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-14">
          Nega do'kon egalari bizni tanlashadi?
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {[
            {
              title: "Daftarsiz hayot",
              desc: "Qarz yozuvlari yo‘qolmaydi. Har doim yoningizda.",
              icon: UserGroupIcon,
            },
            {
              title: "Tezkor qidiruv",
              desc: "Mijozni ismi yoki raqami orqali darhol toping.",
              icon: MagnifyingGlassIcon,
            },
            {
              title: "Avtomatik hisobotlar",
              desc: "Qarzdorliklar bo'yicha batafsil hisobotlar tayyorlang.",
              icon: DocumentChartBarIcon,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-emerald-400/50 hover:scale-105 transition transform"
            >
              <f.icon className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{f.title}</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Banner */}
      <section className="bg-emerald-600 dark:bg-emerald-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center text-white">
        <blockquote className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl italic">
          "Qarzdor.uz tufayli 300+ mijozimning qarzini tartibli yuritaman.
          Daftarga qaytishni xayolimga ham keltirmayman."
        </blockquote>
        <p className="mt-4 sm:mt-6 text-sm sm:text-base font-semibold">— Otabek, Do'kon egasi (Toshkent)</p>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-14">
          Ko'p so'raladigan savollar
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Internet bo‘lmasa ishlaydimi?",
              a: "Ha, offline rejimda ham yozuvlarni vaqtincha saqlaydi va internet paydo bo‘lganda avtomatik sinxronlashadi.",
            },
            {
              q: "SMS xizmatlari pullikmi?",
              a: "Ha, lekin arzon narxda. Har oy sizning tarifingizga qarab limit belgilanadi.",
            },
            {
              q: "Ma’lumotlarim xavfsizmi?",
              a: "Barcha ma’lumotlar shifrlangan holda saqlanadi va faqat sizning do‘koningizga tegishli.",
            },
          ].map((item, i) => (
            <details
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow"
            >
              <summary className="cursor-pointer font-semibold text-sm sm:text-base">
                {item.q}
              </summary>
              <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-emerald-700 dark:bg-emerald-950 py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6">
          Qarzdorlikni boshqarishning eng oson yo'li!
        </h2>
        <p className="text-base sm:text-lg mb-6 sm:mb-8">
          Hoziroq ro'yxatdan o'ting va daftaringizni telefonga ko'chiring.
        </p>
        <Link to="/signup">
          <button className="px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base bg-yellow-400 text-black font-bold rounded-full hover:scale-110 transition">
            🚀 Boshlash
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8 sm:py-10 px-4 sm:px-6 text-center text-sm sm:text-base">
        <p>© 2025 Qarzdor.uz — Barcha huquqlar himoyalangan.</p>
        <p className="mt-2">
          Aloqa:{" "}
          <a href="mailto:support@qarzdor.uz" className="underline hover:text-gray-300">
            support@qarzdor.uz
          </a>
        </p>
      </footer>
    </div>
  )
}
