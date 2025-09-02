import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { signIn as apiSignIn, signUp as apiSignUp } from "../lib/api"

type User = {
  id: string
  email: string
  shopName: string
  dbName: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, shopName: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [initialized, setInitialized] = useState(false) // Track if initial auth check is complete

  // Function to validate JWT token
  const validateToken = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp < currentTime) {
        console.log("JWT token expired")
        return false
      }
      return true
    } catch (error) {
      console.warn("JWT token validation error:", error)
      return false
    }
  }

  // Check for JWT token expiration on mount and set interval
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("jwt_token")
      if (token) {
        if (!validateToken(token)) {
          // Token expired, sign out
          console.log("JWT token expired, signing out")
          setUser(null)
          localStorage.removeItem("jwt_token")
          localStorage.removeItem("auth_user")
        }
      }
    }

    // Check immediately
    checkTokenExpiration()

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log("=== AUTH CONTEXT INITIALIZATION ===")
    const stored = localStorage.getItem("auth_user")
    const token = localStorage.getItem("jwt_token")

    console.log(
      "AuthContext - Initial load - stored user:",
      !!stored,
      "token:",
      !!token
    )
    console.log("AuthContext - Token length:", token ? token.length : 0)
    console.log(
      "AuthContext - Stored user data:",
      stored ? stored.substring(0, 100) + "..." : "null"
    )

    if (stored && token) {
      try {
        // Validate the token before restoring user
        if (validateToken(token)) {
          const userData = JSON.parse(stored)
          console.log("AuthContext - Token valid, user data:", userData)
          setUser(userData)
          console.log("User restored from localStorage:", userData.email)
        } else {
          console.log("Stored token is invalid, clearing data")
          localStorage.removeItem("auth_user")
          localStorage.removeItem("jwt_token")
          setUser(null)
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        // Clear corrupted data
        localStorage.removeItem("auth_user")
        localStorage.removeItem("jwt_token")
        setUser(null)
      }
    } else if (!token) {
      // No token, clear user
      console.log("No JWT token found, clearing user")
      setUser(null)
    }

    setInitialized(true)
    setLoading(false)
    console.log("=== AUTH CONTEXT INITIALIZATION COMPLETE ===")
  }, [])

  useEffect(() => {
    console.log("AuthContext - User state changed:", user ? user.email : "null")
    if (user) localStorage.setItem("auth_user", JSON.stringify(user))
    else localStorage.removeItem("auth_user")
  }, [user])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await apiSignIn({ email, password })
      const u = res.user as User
      const userData = {
        id: u.id || (u as any)._id,
        email: u.email,
        shopName: (u as any).shopName,
        dbName: (u as any).dbName,
      }
      console.log("SignIn - Setting user:", userData)
      setUser(userData)
      console.log("User signed in successfully:", userData.email)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, shopName: string) => {
    setLoading(true)
    try {
      const res = await apiSignUp({ email, password, shopName })
      const u = res.user as User
      const userData = {
        id: u.id,
        email: u.email,
        shopName: u.shopName,
        dbName: u.dbName,
      }
      console.log("SignUp - Setting user:", userData)
      setUser(userData)
      console.log("User signed up successfully:", userData.email)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    console.log("User signing out")
    setUser(null)
    localStorage.removeItem("jwt_token")
    localStorage.removeItem("auth_user")
  }

  const value = useMemo(
    () => ({ user, loading: loading || !initialized, signIn, signUp, signOut }),
    [user, loading, initialized]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
