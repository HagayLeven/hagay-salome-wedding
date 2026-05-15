'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG dimensions
const CX = 250
const CY = 250
const R_OUTER = 222
const R_INNER = 214
const CIRC_OUTER = 2 * Math.PI * R_OUTER
const CIRC_INNER = 2 * Math.PI * R_INNER

// Ring for the two interlocked circles at the bottom
const R_RING = 13
const CIRC_RING = 2 * Math.PI * R_RING

export default function SplashScreen() {
  const [show, setShow] = useState(true)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) {
      setShow(false)
      return
    }
    const t = setTimeout(() => setShow(false), 3200)
    // Haptic on phase 4 (1800ms)
    const h = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30])
      }
    }, 1800)
    return () => { clearTimeout(t); clearTimeout(h) }
  }, [prefersReducedMotion])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeIn', delay: 0.1 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F8F5F0',
          }}
        >
          {/* Breathing wrapper (phase 5) then exit scale (phase 6) */}
          <motion.div
            animate={{
              scale: [1, 1, 1.02, 1, 1.08],
              opacity: [1, 1, 1, 1, 0],
            }}
            transition={{
              duration: 3.2,
              times: [0, 0.69, 0.78, 0.84, 1],
              ease: 'easeInOut',
            }}
            style={{ width: 280, height: 280 }}
          >
            <svg viewBox="0 0 500 500" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="ss-shadow">
                  <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#1A1A1A" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* ── Phase 1: Outer ring draws in (0-600ms) ── */}
              <motion.circle
                cx={CX} cy={CY} r={R_OUTER}
                fill="none" stroke="#C9A96E" strokeWidth="1.5"
                strokeDasharray={CIRC_OUTER}
                initial={{ strokeDashoffset: CIRC_OUTER, rotate: -90, transformOrigin: '250px 250px' }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
                style={{ transformOrigin: '250px 250px', transform: 'rotate(-90deg)' }}
              />
              <motion.circle
                cx={CX} cy={CY} r={R_INNER}
                fill="none" stroke="#C9A96E" strokeWidth="0.6"
                strokeDasharray={CIRC_INNER}
                initial={{ strokeDashoffset: CIRC_INNER }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                style={{ transformOrigin: '250px 250px', transform: 'rotate(-90deg)', opacity: 0.4 }}
              />

              {/* Cardinal diamonds (phase 1, end) */}
              {[
                <polygon key="t" points="250,22 254.5,28 250,34 245.5,28" fill="#C9A96E" />,
                <polygon key="r" points="466,250 472,254.5 466,259 460,254.5" fill="#C9A96E" />,
                <polygon key="b" points="250,466 254.5,472 250,478 245.5,472" fill="#C9A96E" />,
                <polygon key="l" points="34,250 40,254.5 34,259 28,254.5" fill="#C9A96E" />,
              ].map((el, i) => (
                <motion.g key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.4 + i * 0.04 }}>
                  {el}
                </motion.g>
              ))}

              {/* Corner dots */}
              {[[407,93],[407,407],[93,407],[93,93]].map(([x, y], i) => (
                <motion.circle key={i} cx={x} cy={y} r={2.5} fill="#C9A96E"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                  transition={{ duration: 0.2, delay: 0.5 }} />
              ))}

              {/* ── Phase 2: H & S monogram (600-1200ms) ── */}
              <motion.text
                x="170" y="215"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="120" fontStyle="italic" fill="#1A1A1A" textAnchor="middle"
                filter="url(#ss-shadow)"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
              >H</motion.text>
              <motion.text
                x="330" y="215"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="120" fontStyle="italic" fill="#1A1A1A" textAnchor="middle"
                filter="url(#ss-shadow)"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
              >S</motion.text>
              <motion.text
                x="250" y="190"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="44" fontStyle="italic" fill="#C9A96E" textAnchor="middle"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.9 }}
              >&amp;</motion.text>

              {/* ── Phase 3: Botanical branches (1200-1800ms) ── */}
              {/* Left horizontal line */}
              <motion.line x1="82" y1="250" x2="180" y2="250" stroke="#C9A96E" strokeWidth="0.75"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 1.2 }} />
              {/* Right horizontal line */}
              <motion.line x1="320" y1="250" x2="418" y2="250" stroke="#C9A96E" strokeWidth="0.75"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 1.2 }} />

              {/* Left branch paths */}
              {[
                { d: "M 80,270 C 108,265 138,264 168,270", delay: 1.22 },
                { d: "M 94,269 C 91,260 95,252 101,256", delay: 1.28 },
                { d: "M 94,270 C 91,279 95,288 101,284", delay: 1.34 },
                { d: "M 111,268 C 108,259 112,251 118,255", delay: 1.40 },
                { d: "M 111,269 C 108,278 112,287 118,283", delay: 1.46 },
                { d: "M 129,267 C 126,258 130,250 136,254", delay: 1.52 },
                { d: "M 129,268 C 126,277 130,286 136,282", delay: 1.58 },
                { d: "M 148,268 C 145,259 149,251 155,255", delay: 1.62 },
                { d: "M 148,269 C 145,278 149,286 155,282", delay: 1.66 },
              ].map((p, i) => (
                <motion.path key={`lb-${i}`} d={p.d} stroke="#C9A96E" strokeWidth="0.9" fill="none"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.25, delay: p.delay, ease: 'easeOut' }} />
              ))}

              {/* Right branch paths */}
              {[
                { d: "M 420,270 C 392,265 362,264 332,270", delay: 1.22 },
                { d: "M 406,269 C 409,260 405,252 399,256", delay: 1.28 },
                { d: "M 406,270 C 409,279 405,288 399,284", delay: 1.34 },
                { d: "M 389,268 C 392,259 388,251 382,255", delay: 1.40 },
                { d: "M 389,269 C 392,278 388,287 382,283", delay: 1.46 },
                { d: "M 371,267 C 374,258 370,250 364,254", delay: 1.52 },
                { d: "M 371,268 C 374,277 370,286 364,282", delay: 1.58 },
                { d: "M 352,268 C 355,259 351,251 345,255", delay: 1.62 },
                { d: "M 352,269 C 355,278 351,286 345,282", delay: 1.66 },
              ].map((p, i) => (
                <motion.path key={`rb-${i}`} d={p.d} stroke="#C9A96E" strokeWidth="0.9" fill="none"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.25, delay: p.delay, ease: 'easeOut' }} />
              ))}

              {/* 3 diamonds on horizontal line */}
              {[
                "180,247 184,250 180,253 176,250",
                "250,247 253.5,250 250,253 246.5,250",
                "320,247 324,250 320,253 316,250",
              ].map((pts, i) => (
                <motion.polygon key={`d-${i}`} points={pts} fill="#C9A96E"
                  initial={{ scale: 0, transformOrigin: 'center' }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 1.5 + i * 0.06 }}
                  style={{ transformOrigin: 'center' }} />
              ))}

              {/* ── Phase 4: Text (1800-2200ms) ── */}
              <motion.text
                x="250" y="297"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="16" fill="#C9A96E" textAnchor="middle"
                initial={{ opacity: 0, letterSpacing: '0em' }} animate={{ opacity: 1, letterSpacing: '4px' }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 1.8 }}
              >HAGAY  ·  SALOME</motion.text>

              <motion.line x1="140" y1="313" x2="360" y2="313" stroke="#C9A96E" strokeWidth="0.6"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.3, delay: 1.95 }} />

              <motion.text
                x="250" y="336"
                fontFamily="Georgia, serif"
                fontSize="11" fill="#AAAAAA" textAnchor="middle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 2.0 }}
                style={{ letterSpacing: 5 }}
              >EST · MMXXVI</motion.text>

              {/* Interlocked rings at bottom */}
              <motion.circle cx={244} cy={415} r={R_RING} fill="none" stroke="#C9A96E" strokeWidth="1.3"
                strokeDasharray={CIRC_RING}
                initial={{ strokeDashoffset: CIRC_RING }} animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 2.05 }}
                style={{ transformOrigin: '244px 415px', transform: 'rotate(-90deg)' }} />
              <motion.circle cx={258} cy={415} r={R_RING} fill="none" stroke="#C9A96E" strokeWidth="1.3"
                strokeDasharray={CIRC_RING}
                initial={{ strokeDashoffset: CIRC_RING }} animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 2.15 }}
                style={{ transformOrigin: '258px 415px', transform: 'rotate(-90deg)' }} />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
