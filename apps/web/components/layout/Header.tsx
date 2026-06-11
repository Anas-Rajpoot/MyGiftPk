'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import type { NavItem } from '@/lib/wp/queries/global'

interface HeaderProps {
  navItems: NavItem[]
}

export function Header({ navItems }: HeaderProps) {
  const { count, openCart } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mega-menu on outside click
  useEffect(() => {
    if (!activeMenu) return
    const onPointerDown = (e: PointerEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [activeMenu])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 bg-ivory transition-shadow duration-200',
        scrolled ? 'shadow-[0_2px_12px_rgba(31,26,23,0.08)]' : 'border-b border-hairline'
      )}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 sm:h-18 gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-wine shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 rounded"
            onClick={() => setMenuOpen(false)}
          >
            MYGIFT
          </Link>

          {/* Desktop nav */}
          <nav
            ref={megaRef}
            className="hidden lg:flex items-center gap-1 ml-6 flex-1"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const isActive = activeMenu === item.label
              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    className={clsx(
                      'flex items-center gap-1 px-3 py-2 font-body text-sm font-medium rounded transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine',
                      isActive ? 'text-wine bg-wine-tint' : 'text-ink hover:text-wine'
                    )}
                    aria-expanded={isActive}
                    onClick={() => setActiveMenu(isActive ? null : item.label)}
                    onMouseEnter={() => hasChildren && setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    {item.label}
                    {hasChildren && (
                      <ChevronDown
                        className={clsx('h-3.5 w-3.5 transition-transform duration-150', isActive && 'rotate-180')}
                        aria-hidden
                      />
                    )}
                  </button>

                  {/* Mega-menu dropdown */}
                  {hasChildren && (
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          onMouseEnter={() => setActiveMenu(item.label)}
                          onMouseLeave={() => setActiveMenu(null)}
                          className="absolute top-full left-0 mt-1 min-w-[180px] bg-ivory border border-hairline rounded-card shadow-[var(--shadow-float)] py-2"
                        >
                          {item.children!.map((child) => (
                            <Link
                              key={child.label}
                              href={child.link}
                              className="block px-4 py-2 font-body text-sm text-ink hover:text-wine hover:bg-wine-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine"
                              onClick={() => setActiveMenu(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search stub */}
            <button
              type="button"
              aria-label="Search"
              className="flex items-center justify-center w-10 h-10 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex items-center justify-center w-10 h-10 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <Heart className="h-5 w-5" aria-hidden />
            </Link>

            {/* Cart trigger */}
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

            {/* Mobile menu toggle */}
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

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-ink/40 z-30 lg:hidden"
              aria-hidden
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-16 left-0 bottom-0 w-[280px] bg-ivory z-40 lg:hidden overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <div className="py-4">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.link}
                      className="flex items-center px-5 py-3 font-display text-2xl uppercase text-ink hover:text-wine hover:bg-wine-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="pb-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.link}
                            className="block px-8 py-2 font-body text-sm text-stone hover:text-wine hover:bg-wine-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mx-5 border-b border-hairline" />
                  </div>
                ))}
                <div className="px-5 pt-6 space-y-3">
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 font-body text-sm text-stone hover:text-wine transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" aria-hidden /> Wishlist
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-3 font-body text-sm text-stone hover:text-wine transition-colors"
                    onClick={() => { setMenuOpen(false); openCart() }}
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden /> Cart
                  </button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
