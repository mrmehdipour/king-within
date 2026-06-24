'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Bottom navigation for the authenticated shell. Mobile-first (thumb reach),
// works equally on desktop. Active tab is derived from the current path.

const TABS = [
  {
    href: '/learn',
    label: 'Learn',
    // map / path icon
    icon: (
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Zm0 0v14m6-12v14" />
    ),
  },
  {
    href: '/journal',
    label: 'Journal',
    // book + pen
    icon: <path d="M4 5a2 2 0 0 1 2-2h11v15H6a2 2 0 0 0-2 2V5Zm13 13H6m11-15v15" />,
  },
  {
    href: '/stats',
    label: 'Stats',
    icon: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-stone-900/95 backdrop-blur border-t border-stone-800 pb-safe">
      <div className="max-w-xl mx-auto flex">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition ${
                active ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {tab.icon}
              </svg>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
