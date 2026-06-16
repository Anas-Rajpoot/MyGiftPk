'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import type { SizeChart } from '@/lib/content/size-charts'

interface SizeTableClientProps {
  chart: SizeChart
}

const CM_TO_IN = 0.3937

function toInches(cm: number): string {
  return (cm * CM_TO_IN).toFixed(1)
}

export function SizeTableClient({ chart }: SizeTableClientProps) {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')

  function display(cm: number): string {
    return unit === 'cm' ? `${cm}` : toInches(cm)
  }

  return (
    <div className="space-y-4">
      {/* Unit toggle */}
      <div
        className="inline-flex rounded-input border border-hairline overflow-hidden"
        role="group"
        aria-label="Unit of measurement"
      >
        {(['cm', 'in'] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={clsx(
              'h-9 px-5 font-body text-sm font-medium transition-colors',
              unit === u
                ? 'bg-wine text-ivory'
                : 'bg-ivory text-stone hover:text-ink'
            )}
            aria-pressed={unit === u}
          >
            {u === 'cm' ? 'Centimetres' : 'Inches'}
          </button>
        ))}
      </div>

      {/* Size table — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[480px] px-4 sm:px-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Size', 'Chest', 'Waist', 'Hip', 'Length'].map((h) => (
                  <th
                    key={h}
                    className="bg-wine text-ivory font-body font-semibold px-3 py-2.5 text-left"
                  >
                    {h}
                    {h !== 'Size' && (
                      <span className="ml-1 font-normal opacity-70">({unit})</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row, i) => (
                <tr key={row.size}>
                  <td
                    className={clsx(
                      'border border-hairline px-3 py-2 font-body font-semibold text-ink',
                      i % 2 === 0 ? 'bg-ivory' : 'bg-cream'
                    )}
                  >
                    {row.size}
                  </td>
                  {[row.chest, row.waist, row.hip, row.length].map((val, j) => (
                    <td
                      key={j}
                      className={clsx(
                        'border border-hairline px-3 py-2 font-body text-stone',
                        i % 2 === 0 ? 'bg-ivory' : 'bg-cream'
                      )}
                    >
                      {display(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
