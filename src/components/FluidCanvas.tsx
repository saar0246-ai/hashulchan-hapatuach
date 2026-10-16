import { useEffect, useRef } from 'react'

/* ─── GLSL Vertex ─────────────────────────────────────────── */
const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

/* ─── GLSL Fragment — fluid colour blobs ─────────────────── */
const FRAG = `
  precision highp float;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec2  u_mouse;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.y = 1.0 - uv.y;

    vec2 m = u_mouse / u_res;
    m.y = 1.0 - m.y;

    float t = u_time * 0.16;

    /* Brand palette */
    vec3 cream = vec3(0.992, 0.984, 0.969);   /* #FDFBF7 */
    vec3 terra = vec3(0.753, 0.224, 0.039);   /* #C0390A */
    vec3 olive = vec3(0.176, 0.290, 0.118);   /* #2D4A1E */
    vec3 amber = vec3(0.961, 0.620, 0.043);   /* #F59E0B */

    /* Blob centres — drift + slight mouse offset */
    vec2 b1 = vec2(0.80 + sin(t * 0.64) * 0.22, 0.12 + cos(t * 0.47) * 0.17);
    b1 += (m - 0.5) * 0.14;

    vec2 b2 = vec2(0.10 + cos(t * 0.54) * 0.17, 0.80 + sin(t * 0.37) * 0.15);

    vec2 b3 = vec2(0.44 + sin(t * 0.87 + 1.2) * 0.21, 0.47 + cos(t * 0.65) * 0.19);
    b3 += (m - 0.5) * 0.09;

    vec2 b4 = vec2(0.78 + cos(t * 1.04) * 0.09, 0.84 + sin(t * 0.77) * 0.11);

    /* Soft radial blobs */
    float i1 = smoothstep(0.50, 0.0, length(uv - b1));
    float i2 = smoothstep(0.42, 0.0, length(uv - b2));
    float i3 = smoothstep(0.38, 0.0, length(uv - b3));
    float i4 = smoothstep(0.23, 0.0, length(uv - b4));

    /* Compose — additive tinting on cream base */
    vec3 col = cream;
    col = mix(col, terra, i1 * 0.18);
    col = mix(col, olive, i2 * 0.14);
    col = mix(col, amber, i3 * 0.16);
    col = mix(col, terra, i4 * 0.12);

    /* Vignette */
    vec2 q = uv - 0.5;
    col *= 1.0 - dot(q, q) * 0.30;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

function makeShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s)
    return null
  }
  return s
}

export default function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: 0, y: 0 })
  const rafRef    = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vert = makeShader(gl, gl.VERTEX_SHADER,   VERT)
    const frag = makeShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vert || !frag) return

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vert)
    gl.attachShader(prog, frag)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    /* Full-screen quad */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime  = gl.getUniformLocation(prog, 'u_time')
    const uRes   = gl.getUniformLocation(prog, 'u_res')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    function resize() {
      const w = window.innerWidth, h = window.innerHeight
      canvas!.width  = w
      canvas!.height = h
      gl!.viewport(0, 0, w, h)
      gl!.uniform2f(uRes, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    function trackPointer(e: MouseEvent | TouchEvent) {
      const t = 'touches' in e ? e.touches[0] : e as MouseEvent
      mouseRef.current = { x: t.clientX, y: t.clientY }
    }
    window.addEventListener('mousemove', trackPointer)
    window.addEventListener('touchmove', trackPointer, { passive: true })

    const t0 = performance.now()
    function draw() {
      const t = (performance.now() - t0) / 1000
      gl!.uniform1f(uTime, t)
      gl!.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', trackPointer)
      window.removeEventListener('touchmove', trackPointer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
