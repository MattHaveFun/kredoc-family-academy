import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <h1 className="text-3xl font-semibold">404 — Page Not Found</h1>
      <Link to="/" className="mt-4 text-slate-400 underline hover:text-slate-200">
        Return home
      </Link>
    </main>
  )
}

export default NotFound
