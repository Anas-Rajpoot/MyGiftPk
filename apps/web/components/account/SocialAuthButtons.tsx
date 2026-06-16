import { GoogleIcon, FacebookIcon } from './SocialIcons'

interface SocialAuthButtonsProps {
  /** Verb shown on the buttons, e.g. "Sign in" or "Sign up" */
  next?: string
}

export function SocialAuthButtons({ next }: SocialAuthButtonsProps) {
  const qs = next ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <div className="space-y-2.5">
      <a
        href={`/api/auth/oauth/google${qs}`}
        className="flex items-center justify-center gap-3 h-12 w-full rounded-input border border-hairline bg-ivory font-body text-[15px] font-medium text-ink hover:bg-cream hover:border-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </a>
      <a
        href={`/api/auth/oauth/facebook${qs}`}
        className="flex items-center justify-center gap-3 h-12 w-full rounded-input border border-hairline bg-ivory font-body text-[15px] font-medium text-ink hover:bg-cream hover:border-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
      >
        <FacebookIcon className="h-5 w-5" />
        Continue with Facebook
      </a>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-1.5" aria-hidden>
        <span className="h-px flex-1 bg-hairline" />
        <span className="font-body text-[11px] uppercase tracking-[0.18em] text-stone">
          or
        </span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
    </div>
  )
}
