import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

const roleOptions: UserRole[] = ['admin', 'analyst', 'viewer']

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('demo-password')
  const [role, setRole] = useState<UserRole>('admin')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)

    try {
      await login(email, password, role)
      toast.success('Signed in successfully')
      navigate(fromPath || '/app/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-900 flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue to your analytics workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Role (Demo)</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              {roleOptions.map((roleValue) => (
                <option key={roleValue} value={roleValue}>
                  {roleValue}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 font-medium disabled:opacity-60"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-cyan-600 hover:text-cyan-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
