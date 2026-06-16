'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { clsx } from 'clsx'
import type { WpImage } from '@/lib/wp/queries/home'

interface LightboxProps {
  images: WpImage[]
  initialIndex: number
  productName: string
  open: boolean
  onClose: () => void
}

export function Lightbox({ images, initialIndex, productName, open, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)
  // Track previous open value in state (refs can't be read during render per lint rules)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setIndex(initialIndex)
      setZoomed(false)
      setPanOffset({ x: 0, y: 0 })
    }
  }

  const current = images[index]
  const total = images.length

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!thumbsRef.current) return
    const thumb = thumbsRef.current.children[index] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [index])

  function navigate(dir: number) {
    setDirection(dir)
    setIndex((prev) => (prev + dir + total) % total)
    setZoomed(false)
    setPanOffset({ x: 0, y: 0 })
  }

  function handleImageClick() {
    if (isDragging) return
    setZoomed((v) => !v)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    setCursorPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [zoomed])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0 }),
  }

  if (!open || !current) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black"
          role="dialog"
          aria-modal
          aria-label={`Image gallery: ${productName}`}
        >
          {/* ── Full-screen image (fills the entire div, no gaps) ── */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              <div
                className={clsx(
                  'absolute inset-0 overflow-hidden',
                  zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                )}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setCursorPos(null)}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={
                    zoomed
                      ? { scale: 2.4, x: panOffset.x, y: panOffset.y }
                      : { scale: 1, x: 0, y: 0 }
                  }
                  transition={{ type: 'spring', damping: 26, stiffness: 240 }}
                  drag={zoomed}
                  dragConstraints={{ left: -600, right: 600, top: -600, bottom: 600 }}
                  dragElastic={0.08}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(_, info) => {
                    setTimeout(() => setIsDragging(false), 50)
                    setPanOffset((p) => ({ x: p.x + info.offset.x, y: p.y + info.offset.y }))
                  }}
                  style={{ originX: 0.5, originY: 0.5 }}
                >
                  <Image
                    src={current.sourceUrl}
                    alt={current.altText || `${productName} ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover pointer-events-none select-none"
                    priority
                  />
                </motion.div>

                {/* Cursor glow hint */}
                {!zoomed && cursorPos && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(circle 100px at ${cursorPos.x}% ${cursorPos.y}%, rgba(255,255,255,0.10) 0%, transparent 70%)`,
                    }}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── TOP overlay (gradient → UI bar) ── */}
          <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-ink/70 via-ink/30 to-transparent pointer-events-none" style={{ height: '120px' }} />
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-6 pt-4">
            <p className="font-body text-sm text-ivory/80 tabular-nums drop-shadow-sm">
              {index + 1} / {total}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setZoomed((v) => !v); setPanOffset({ x: 0, y: 0 }) }}
                aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
                className="flex items-center gap-1.5 font-body text-xs text-ivory/70 hover:text-ivory transition-colors"
              >
                {zoomed
                  ? <><ZoomOut className="h-4 w-4" aria-hidden /> Zoom out</>
                  : <><ZoomIn className="h-4 w-4" aria-hidden /> Click to zoom</>
                }
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close gallery"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-ink/40 hover:bg-ink/70 text-ivory transition-all backdrop-blur-sm pointer-events-auto"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          {/* ── BOTTOM overlay (gradient → thumbnails) ── */}
          <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent pointer-events-none" style={{ height: '160px' }} />
          {total > 1 && (
            <div className="absolute bottom-0 inset-x-0 z-30 pb-4 pt-10">
              <div
                ref={thumbsRef}
                className={clsx(
                  'flex gap-2 overflow-x-auto justify-center px-4',
                  '[&::-webkit-scrollbar]:h-[2px]',
                  '[&::-webkit-scrollbar-track]:bg-transparent',
                  '[&::-webkit-scrollbar-thumb]:bg-ivory/30',
                  '[&::-webkit-scrollbar-thumb]:rounded-full',
                )}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); setZoomed(false); setPanOffset({ x: 0, y: 0 }) }}
                    aria-label={`View image ${i + 1}`}
                    className={clsx(
                      'relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-200 backdrop-blur-sm',
                      i === index
                        ? 'ring-2 ring-ivory scale-105 opacity-100'
                        : 'opacity-50 hover:opacity-80 ring-1 ring-ivory/30 hover:scale-105'
                    )}
                  >
                    <Image
                      src={img.sourceUrl}
                      alt={img.altText || `${productName} ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Left / Right nav (floating mid-screen) ── */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Previous image"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-full bg-ink/40 hover:bg-ink/70 text-ivory transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                aria-label="Next image"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-full bg-ink/40 hover:bg-ink/70 text-ivory transition-all backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
