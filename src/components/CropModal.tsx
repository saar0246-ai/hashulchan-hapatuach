import { useRef, useState, useEffect, useCallback } from 'react'

interface CropModalProps {
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

const VIEWPORT = 280

export default function CropModal({ file, onConfirm, onCancel }: CropModalProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [imgNaturalW, setImgNaturalW] = useState(0)
  const [imgNaturalH, setImgNaturalH] = useState(0)
  // rendered size of image (scaled so shorter side fills VIEWPORT)
  const [imgW, setImgW] = useState(VIEWPORT)
  const [imgH, setImgH] = useState(VIEWPORT)
  // top-left position of image relative to viewport
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastTouch = useRef({ x: 0, y: 0 })

  // Load file as data URL
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImgNaturalW(img.naturalWidth)
      setImgNaturalH(img.naturalHeight)
      // Scale so shorter side fills VIEWPORT
      const scale = VIEWPORT / Math.min(img.naturalWidth, img.naturalHeight)
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      setImgW(w)
      setImgH(h)
      // Center image
      setPos({ x: -Math.round((w - VIEWPORT) / 2), y: -Math.round((h - VIEWPORT) / 2) })
      setImgSrc(url)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const clampPos = useCallback((x: number, y: number, w: number, h: number) => {
    // image must cover the full VIEWPORT square
    const minX = -(w - VIEWPORT)
    const minY = -(h - VIEWPORT)
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    }
  }, [])

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    lastTouch.current = { x: e.clientX, y: e.clientY }
  }
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastTouch.current.x
      const dy = e.clientY - lastTouch.current.y
      lastTouch.current = { x: e.clientX, y: e.clientY }
      setPos(prev => clampPos(prev.x + dx, prev.y + dy, imgW, imgH))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [imgW, imgH, clampPos])

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragging.current = true
    lastTouch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    e.preventDefault()
    const t = e.touches[0]
    const dx = t.clientX - lastTouch.current.x
    const dy = t.clientY - lastTouch.current.y
    lastTouch.current = { x: t.clientX, y: t.clientY }
    setPos(prev => clampPos(prev.x + dx, prev.y + dy, imgW, imgH))
  }
  const onTouchEnd = () => { dragging.current = false }

  const handleConfirm = () => {
    if (!imgSrc || imgNaturalW === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = VIEWPORT
    canvas.height = VIEWPORT
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      // pos is the top-left of the rendered image relative to viewport top-left
      // we need to map viewport (0,0,VIEWPORT,VIEWPORT) back to natural image coords
      const scale = VIEWPORT / Math.min(imgNaturalW, imgNaturalH)
      // in rendered coords, the crop region starts at (-pos.x, -pos.y) and spans VIEWPORT×VIEWPORT
      const srcX = (-pos.x) / scale
      const srcY = (-pos.y) / scale
      const srcW = VIEWPORT / scale
      const srcH = VIEWPORT / scale
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, VIEWPORT, VIEWPORT)
      canvas.toBlob(blob => {
        if (blob) onConfirm(blob)
      }, 'image/jpeg', 0.9)
    }
    img.src = imgSrc
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,6,3,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'rgba(253,249,243,0.97)',
          borderRadius: 24,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 24px 72px rgba(0,0,0,0.32)',
          border: '1px solid rgba(255,255,255,0.90)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1714', margin: 0, letterSpacing: '-0.02em' }}>
          חיתוך תמונה
        </h2>
        <p style={{ fontSize: 12, color: '#8C7060', margin: 0, textAlign: 'center' }}>
          גרור כדי לבחור את אזור הפנים
        </p>

        {/* Circular viewport */}
        <div
          style={{
            width: VIEWPORT,
            height: VIEWPORT,
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            border: '3px solid rgba(192,82,42,0.40)',
            boxShadow: '0 0 0 4px rgba(192,82,42,0.10)',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="crop"
              draggable={false}
              style={{
                position: 'absolute',
                top: pos.y,
                left: pos.x,
                width: imgW,
                height: imgH,
                maxWidth: 'none',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'rgba(232,226,216,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(192,82,42,0.4)', borderTopColor: '#C0522A', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 14, fontWeight: 600, fontSize: 14,
              border: '1.5px solid rgba(232,226,216,0.80)', background: 'rgba(255,255,255,0.60)',
              color: '#8C7060', cursor: 'pointer',
            }}
          >
            ביטול
          </button>
          <button
            onClick={handleConfirm}
            disabled={!imgSrc}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 14, fontWeight: 700, fontSize: 14,
              border: 'none', background: 'linear-gradient(135deg, #C0522A, #8C3318)',
              color: 'white', cursor: imgSrc ? 'pointer' : 'not-allowed', opacity: imgSrc ? 1 : 0.5,
            }}
          >
            סיים
          </button>
        </div>
      </div>
    </div>
  )
}
