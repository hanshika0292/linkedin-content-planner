"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, FileText, Home, NotebookPen, LogOut, UserCircle, ChevronDown } from "lucide-react"
import type { ViewMode } from "../types"
import { useApp } from "../context/use-app"
import { useAuth } from "../hooks/useAuth"

export function Header() {
  const { state, dispatch } = useApp()
  const { signOut, user } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="w-5 h-5" /> },
    { id: "posts", label: "Posts", icon: <FileText className="w-5 h-5" /> },
  ]

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <NotebookPen className="w-8 h-8 text-blue-600" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Content Planner</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => dispatch({ type: "SET_VIEW", payload: item.id })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.currentView === item.id
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                aria-current={state.currentView === item.id ? "page" : undefined}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info and Sign Out */}
          <div className="relative flex items-center space-x-3 pl-4 border-l border-gray-200">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <UserCircle className="w-6 h-6" />
              <span className="hidden md:inline text-sm font-medium">{user?.email || "Guest"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  Signed in as <span className="font-semibold truncate">{user?.email || "Guest"}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
