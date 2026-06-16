'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, User, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { SearchOverlay } from '@/components/layout/SearchOverlay'
import type { NavItem } from '@/lib/wp/queries/global'

interface HeaderProps {
  navItems: NavItem[]
}

export function Header({ navItems }: HeaderProps) {
  const { count, openCart } = useCartStore()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [scrolled, setScrolled]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState<Record<string, boolean>>({})
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mega-menu on outside click
  useEffect(() => {
    if (!activeMenu) return
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [activeMenu])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function toggleMobileItem(label: string) {
    setMobileOpen((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const activeItem = navItems.find((item) => item.label === activeMenu)
  const children   = activeItem?.children ?? []

  // Split children into up to 3 columns
  const colCount  = Math.min(3, Math.ceil(children.length / 3))
  const chunkSize = Math.ceil(children.length / colCount)
  const columns: typeof children[] = Array.from({ length: colCount }, (_, i) =>
    children.slice(i * chunkSize, i * chunkSize + chunkSize)
  ).filter((c) => c.length > 0)

  return (
    <header
      ref={headerRef}
      className={clsx(
        'sticky top-0 z-40 bg-ivory transition-shadow duration-200',
        scrolled ? 'shadow-[0_2px_16px_rgba(31,26,23,0.09)]' : 'border-b border-hairline'
      )}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 sm:h-[72px] gap-6">

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-wine shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 rounded"
            onClick={() => { setMenuOpen(false); setActiveMenu(null) }}
          >
            MYGIFT
          </Link>

          {/* ── Desktop nav ──────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0 flex-1" aria-label="Primary navigation">
            {navItems.map((item) => {
              const hasChildren = (item.children?.length ?? 0) > 0
              const isActive    = activeMenu === item.label
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasChildren && setActiveMenu(item.label)}
                >
                  <Link
                    href={item.link}
                    onClick={() => setActiveMenu(null)}
                    className={clsx(
                      'relative flex items-center gap-1 px-3.5 py-2 font-body text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 rounded',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine',
                      // wine underline pseudo-element
                      'after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-wine after:rounded-full',
                      'after:scale-x-0 after:transition-transform after:duration-200 after:origin-left',
                      isActive
                        ? 'text-wine after:scale-x-100'
                        : 'text-stone hover:text-ink hover:after:scale-x-100'
                    )}
                  >
                    {item.label}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* ── Right icons ──────────────────────────────────── */}
          <div className="flex items-center gap-0.5 ml-auto">
            {/* Desktop: search pill */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-2.5 mr-1 rounded-chip bg-cream border border-hairline text-stone hover:text-wine hover:border-wine/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine group"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="font-body text-sm">Search</span>
            </button>
            {/* Mobile: search icon */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden flex items-center justify-center w-10 h-10 text-stone hover:text-wine transition-colors rounded-full hover:bg-wine-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <Link
              href="/account"
              aria-label="My Account"
              className="relative flex items-center justify-center w-10 h-10 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <User className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex items-center justify-center w-10 h-10 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <Heart className="h-5 w-5" aria-hidden />
            </Link>
            <button
              type="button"
              aria-label={`Cart${count > 0 ? `, ${count} items` : ''}`}
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-wine text-ivory text-[10px] font-body font-semibold rounded-full px-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-ink hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mega-menu panel (desktop only, full-width) ──────── */}
      <AnimatePresence>
        {activeMenu && children.length > 0 && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-x-0 top-full hidden lg:block bg-ivory border-b border-hairline shadow-[0_12px_40px_rgba(31,26,23,0.10)] z-50"
            onMouseEnter={() => setActiveMenu(activeMenu)}
          >
            {/* Wine accent line at the very top */}
            <div className="h-[2px] bg-wine" />

            <div className="max-w-[1320px] mx-auto px-6 py-8">
              <div className="flex gap-12 lg:gap-16">

                {/* Left — category identity */}
                <div className="shrink-0 w-[160px]">
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-stone mb-1">
                    Browse
                  </p>
                  <h3 className="font-display text-[32px] uppercase leading-none text-ink mb-4">
                    {activeItem?.label}
                  </h3>
                  <Link
                    href={activeItem?.link ?? '#'}
                    onClick={() => setActiveMenu(null)}
                    className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-wine hover:text-wine-deep transition-colors group"
                  >
                    View All
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>

                {/* Divider */}
                <div className="w-px bg-hairline self-stretch shrink-0" />

                {/* Right — sub-links in columns */}
                <div
                  className={clsx(
                    'flex-1 grid gap-x-10 gap-y-0',
                    columns.length === 1 && 'grid-cols-1',
                    columns.length === 2 && 'grid-cols-2',
                    columns.length >= 3 && 'grid-cols-3'
                  )}
                >
                  {columns.map((col, ci) => (
                    <ul key={ci} className="space-y-0">
                      {col.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.link}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center gap-2 py-2 font-body text-sm text-stone hover:text-wine transition-colors group"
                          >
                            <span className="w-3 h-px bg-stone/30 group-hover:bg-wine group-hover:w-4 transition-all duration-150 shrink-0" aria-hidden />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile navigation drawer ────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-ink/50 z-[60] lg:hidden"
              aria-hidden
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              key="mob-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-ivory z-[65] lg:hidden flex flex-col shadow-[6px_0_40px_rgba(31,26,23,0.18)]"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-hairline shrink-0">
                <Link
                  href="/"
                  className="font-display text-2xl uppercase tracking-wider text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  MYGIFT
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 flex items-center justify-center text-stone hover:text-ink rounded-full hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {/* Scrollable nav */}
              <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  const hasChildren = (item.children?.length ?? 0) > 0
                  const isOpen      = mobileOpen[item.label] ?? false
                  return (
                    <div key={item.label} className="border-b border-hairline">
                      <div className="flex items-stretch">
                        <Link
                          href={item.link}
                          className="flex-1 px-5 py-4 font-display text-[22px] uppercase tracking-wide text-ink hover:text-wine transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleMobileItem(item.label)}
                            className="w-12 flex items-center justify-center border-l border-hairline text-stone hover:text-wine hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine"
                            aria-label={isOpen ? `Close ${item.label}` : `Open ${item.label}`}
                            aria-expanded={isOpen}
                          >
                            <ChevronDown
                              className={clsx('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
                              aria-hidden
                            />
                          </button>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {hasChildren && isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="bg-cream py-1.5 pl-5 pr-3 border-t border-hairline">
                              {item.children!.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.link}
                                  className="flex items-center gap-3 px-2 py-2.5 font-body text-[13px] text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  <span className="w-4 h-px bg-stone/30 shrink-0" aria-hidden />
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </nav>

              {/* Footer utility strip */}
              <div className="shrink-0 border-t border-hairline bg-cream">
                <div className="grid grid-cols-2 gap-px bg-hairline">
                  {([
                    { icon: <Search className="h-4 w-4" aria-hidden />,      label: 'Search',  href: null,       action: () => { setMenuOpen(false); setSearchOpen(true) } },
                    { icon: <User className="h-4 w-4" aria-hidden />,        label: 'Account', href: '/account', action: () => setMenuOpen(false) },
                    { icon: <Heart className="h-4 w-4" aria-hidden />,       label: 'Wishlist',href: '/wishlist',action: () => setMenuOpen(false) },
                    { icon: <ShoppingBag className="h-4 w-4" aria-hidden />, label: 'Cart',    href: null,       action: () => { setMenuOpen(false); openCart() } },
                  ] as const).map(({ icon, label, href, action }) =>
                    href ? (
                      <Link
                        key={label}
                        href={href}
                        onClick={action}
                        className="flex items-center gap-2.5 px-5 py-3.5 bg-cream font-body text-sm text-stone hover:text-wine hover:bg-wine-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine"
                      >
                        {icon} {label}
                      </Link>
                    ) : (
                      <button
                        key={label}
                        type="button"
                        onClick={action}
                        className="flex items-center gap-2.5 px-5 py-3.5 bg-cream font-body text-sm text-stone hover:text-wine hover:bg-wine-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine text-left"
                      >
                        {icon} {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
