import { clsx } from 'clsx'

interface ProseContentProps {
  html: string
  className?: string
}

export function ProseContent({ html, className }: ProseContentProps) {
  return (
    <div
      className={clsx(
        'font-body text-base text-ink leading-[1.7]',
        // Headings
        '[&_h2]:font-display [&_h2]:text-[24px] [&_h2]:sm:text-[28px] [&_h2]:uppercase [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-4',
        '[&_h3]:font-body [&_h3]:font-semibold [&_h3]:text-[17px] [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2',
        // Paragraphs
        '[&_p]:mb-4 [&_p]:leading-[1.7]',
        // Links
        '[&_a]:text-wine [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-wine-deep',
        // Lists
        '[&_ul]:list-none [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul_li]:pl-4 [&_ul_li]:before:content-["—"] [&_ul_li]:before:text-wine [&_ul_li]:before:mr-2',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4',
        // Tables
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-6',
        '[&_th]:bg-wine [&_th]:text-ivory [&_th]:font-body [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left',
        '[&_td]:border [&_td]:border-hairline [&_td]:bg-ivory [&_td]:px-3 [&_td]:py-2 [&_td]:text-stone',
        '[&_tr:nth-child(even)_td]:bg-cream',
        // Strong / em
        '[&_strong]:font-semibold [&_strong]:text-ink',
        '[&_em]:italic',
        // HR
        '[&_hr]:border-hairline [&_hr]:my-8',
        // Blockquote
        '[&_blockquote]:border-l-4 [&_blockquote]:border-wine [&_blockquote]:pl-4 [&_blockquote]:text-stone [&_blockquote]:italic [&_blockquote]:my-4',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
