import { ImageResponse } from 'next/og'

export const alt = 'Minimalist Toolkit - Snippets, Mockify, PromptCraft'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const palette = {
  canvas: '#0a0a0a',
  tile: '#0f0f0f',
  chip: '#18181b',
  hairline: '#27272a',
  subtitle: '#a1a1aa',
  label: '#d4d4d8',
  footer: '#71717a',
  ink: 'white',
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: palette.canvas,
          fontFamily: '"Geist Mono", "JetBrains Mono", monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: `1px solid ${palette.hairline}`,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '12px',
          }}
        >
          <svg
            aria-hidden="true"
            width="64"
            height="64"
            viewBox="0 0 32 32"
            fill="none"
            style={{ opacity: 0.9 }}
          >
            <rect width="32" height="32" rx="8" fill={palette.tile} />
            <circle cx="7.5" cy="8" r="1.8" fill={palette.ink} opacity="0.35" />
            <path
              d="M8 16.5L12 19.5L8 22.5"
              stroke={palette.ink}
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.9"
            />
            <rect x="15" y="17" width="9" height="2.5" rx="1" fill={palette.ink} opacity="0.8" />
            <rect x="15" y="21.5" width="5.5" height="2" rx="1" fill={palette.ink} opacity="0.25" />
          </svg>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '58px',
                fontWeight: 700,
                color: palette.ink,
                letterSpacing: '-1px',
                lineHeight: 1.1,
              }}
            >
              Minimalist Toolkit
            </span>
            <span
              style={{
                fontSize: '22px',
                color: palette.subtitle,
                letterSpacing: '0.04em',
                marginTop: '6px',
              }}
            >
              Snippets, Mockify, PromptCraft
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
            padding: '16px 28px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {['Snippet Manager', 'Mockify', 'PromptCraft', 'One account'].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '16px',
                  color: palette.label,
                  padding: '6px 12px',
                  background: palette.chip,
                  borderRadius: '6px',
                  border: `1px solid ${palette.hairline}`,
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            fontSize: '14px',
            color: palette.footer,
          }}
        >
          <span>Code snippets</span>
          <span>Image prompts</span>
          <span>Prompt workflows</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
