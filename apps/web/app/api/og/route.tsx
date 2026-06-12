import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'MYGIFT'
  const sub = searchParams.get('sub') ?? 'Gifts & Clothing Delivered Across Pakistan'
  const img = searchParams.get('img') ?? null

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: '#FAF8F5',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Product/category image left half */}
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '560px',
              height: '630px',
              objectFit: 'cover',
            }}
          />
        )}
        {img && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '560px',
              height: '630px',
              background: 'linear-gradient(to right, rgba(31,26,23,0.5) 0%, transparent 100%)',
              display: 'flex',
            }}
          />
        )}

        {/* Content panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: img ? '60px 64px 60px 48px' : '60px 80px',
            marginLeft: img ? '520px' : '0',
            flex: 1,
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                width: '5px',
                height: '28px',
                background: '#7E2B36',
                borderRadius: '3px',
                display: 'flex',
              }}
            />
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#7E2B36',
                textTransform: 'uppercase',
              }}
            >
              MYGIFT
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 35 ? '52px' : '64px',
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#1F1A17',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </div>

          {/* Ribbon accent */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                height: '2px',
                width: '72px',
                background: '#7E2B36',
                borderRadius: '1px',
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '7px',
                height: '7px',
                background: '#7E2B36',
                borderRadius: '50%',
                marginLeft: '5px',
                display: 'flex',
              }}
            />
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: '22px',
              color: '#8A8178',
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {sub}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#7E2B36',
            display: 'flex',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
