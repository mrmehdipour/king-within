'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Map' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/journal', label: 'Journal' },
  { href: '/admin/answers', label: 'Answers' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-6">
        <span className="font-display text-amber-400">King Within <span className="text-stone-500 text-sm">CMS</span></span>
        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((l) => {
            const active = l.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg transition ${
                  active ? 'bg-amber-500/15 text-amber-400' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        <Link href="/learn" className="ml-auto text-stone-500 hover:text-amber-400 text-sm">View app →</Link>
      </div>
    </header>
  )
}
