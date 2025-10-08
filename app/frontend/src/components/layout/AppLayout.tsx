import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '../common/ToastContainer'

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 transition-colors duration-200 dark:bg-slate-950">
      <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:max-w-xl md:max-w-4xl md:flex-row md:px-6 lg:max-w-5xl xl:max-w-6xl">
        <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-20 bg-slate-900/30 md:hidden dark:bg-slate-900/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="min-h-[calc(100vh-120px)] flex-1 space-y-6 md:pr-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
