import { Link } from 'react-router-dom'

const UnauthorizedPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center rounded-2xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access Restricted</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Your role does not have permission to view this section.
        </p>
        <Link
          to="/app/dashboard"
          className="inline-block mt-6 rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-2"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default UnauthorizedPage
