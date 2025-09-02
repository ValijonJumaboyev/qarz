import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function PrivateRoute() {
  const { user, loading } = useAuth()

  console.log(
    "PrivateRoute - loading:",
    loading,
    "user:",
    user ? user.email : "null"
  )

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    )
  }

  // Redirect to signin if no user after loading is complete
  if (!user) {
    console.log("PrivateRoute - No user found, redirecting to signin")
    return <Navigate to="/signin" replace />
  }

  console.log("PrivateRoute - User authenticated, rendering dashboard")
  return <Outlet />
}
