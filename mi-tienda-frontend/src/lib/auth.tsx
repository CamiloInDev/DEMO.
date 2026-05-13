import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface AuthUser {
  user_id: number
  email: string
  full_name: string
  phone: string | null
  address: string | null
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
  const [user, setUser] = useState<AuthUser | null>(null)

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${t}` } })
      if (res.ok) {
        const data = await res.json()
        setUser({ user_id: data.id, email: data.email, full_name: data.full_name, phone: data.phone, address: data.address })
      }
    } catch {
      console.error("Error fetching user")
    }
  }, [])

  useEffect(() => {
    if (token) fetchUser(token)
  }, [token, fetchUser])

  const setAuthData = (data: any) => {
    localStorage.setItem("token", data.access_token)
    setToken(data.access_token)
    setUser({ user_id: data.user_id, email: data.email, full_name: data.full_name, phone: data.phone ?? null, address: data.address ?? null })
  }

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || "Error al iniciar sesión")
    }
    setAuthData(await res.json())
  }

  const register = async (email: string, password: string, full_name: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || "Error al registrarse")
    }
    setAuthData(await res.json())
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null)
  }

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token)
  }, [token, fetchUser])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
