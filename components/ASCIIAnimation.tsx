import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Quality = "low" | "medium" | "high"
type SourceFormat = "auto" | "text" | "color"

interface ColorAsciiMeta {
  version: 2
  format: "color-ascii-v2"
  width: number
  height: number
  fps: number
  frameCount: number
  palette: string[]
  paletteSize: number
  charset: string
  renderMode: "ascii"
  colorMode: "color"
  bgMode: "black" | "green" | "transparent"
  dithering: "off" | "ordered"
  frameEncoding: "packed-12"
  bitsPerGlyph: number
  bitsPerColor: number
  bytesPerFrame: number
}

interface ASCIIAnimationProps {
  frames?: string[]
  className?: string
  fps?: number
  frameCount?: number
  frameFolder?: string
  textSize?: string
  previewFrameCount?: number
  showFrameCounter?: boolean
  quality?: Quality
  ariaLabel?: string
  lazy?: boolean
  color?: string
  gradient?: string
  playOnHover?: boolean
  trimWhitespace?: boolean
  verticalAlign?: "center" | "bottom"
  maxScale?: number
  sourceFormat?: SourceFormat
  filter?: string
}

interface AsciiBounds {
  top: number
  bottom: number
  left: number
  right: number
}

const FALLBACK_ORDER: Record<Quality, Quality[]> = {
  low: ["low", "high", "medium"],
  medium: ["medium", "high", "low"],
  high: ["high", "low", "medium"],
}

const FONT_SIZE = 10
const FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"

async function resolveFrameSource(
  frameFolder: string,
  quality: Quality,
  firstFrameFile: string,
  sourceFormat: SourceFormat
) {
  const fallbackQualities = FALLBACK_ORDER[quality]

  for (const candidate of fallbackQualities) {
    if (sourceFormat !== "text") {
      try {
        const metaUrl = `/${frameFolder}/${candidate}/meta.json`
        const metaResponse = await fetch(metaUrl)
        if (metaResponse.ok) {
          return { baseUrl: `/${frameFolder}/${candidate}`, format: "color" as const }
        }
      } catch {
        // continue
      }
    }

    if (sourceFormat !== "color") {
      try {
        const probeUrl = `/${frameFolder}/${candidate}/${firstFrameFile}`
        const probeResponse = await fetch(probeUrl)
        if (probeResponse.ok) {
          return { baseUrl: `/${frameFolder}/${candidate}`, format: "text" as const }
        }
      } catch {
        // continue
      }
    }
  }

  return null
}

function decodeColorFrame(meta: ColorAsciiMeta, buffer: Uint8Array) {
  const cellCount = meta.width * meta.height
  const glyphs = new Uint8Array(cellCount)
  const colors = new Uint8Array(cellCount)

  for (let i = 0, offset = 0; i < cellCount; i += 2, offset += 3) {
    const byte0 = buffer[offset] ?? 0
    const byte1 = buffer[offset + 1] ?? 0
    const byte2 = buffer[offset + 2] ?? 0
    const cellA = (byte0 << 4) | (byte1 >> 4)
    const cellB = ((byte1 & 0x0f) << 8) | byte2

    glyphs[i] = cellA >> meta.bitsPerColor
    colors[i] = cellA & ((1 << meta.bitsPerColor) - 1)

    if (i + 1 < cellCount) {
      glyphs[i + 1] = cellB >> meta.bitsPerColor
      colors[i + 1] = cellB & ((1 << meta.bitsPerColor) - 1)
    }
  }

  return {
    glyphs,
    colors,
  }
}

function drawColorFrame(canvas: HTMLCanvasElement, meta: ColorAsciiMeta, buffer: Uint8Array) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textBaseline = "top"
  const cellWidth = Math.ceil(ctx.measureText("M").width)
  const cellHeight = Math.ceil(FONT_SIZE)

  canvas.width = Math.max(1, meta.width * cellWidth)
  canvas.height = Math.max(1, meta.height * cellHeight)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (meta.bgMode !== "transparent") {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textBaseline = "top"

  const frame = decodeColorFrame(meta, buffer)
  for (let i = 0; i < frame.glyphs.length; i++) {
    const char = meta.charset[frame.glyphs[i]] ?? " "
    if (char === " ") continue
    ctx.fillStyle = meta.palette[frame.colors[i]] ?? "#fff"
    ctx.fillText(char, (i % meta.width) * cellWidth, Math.floor(i / meta.width) * cellHeight)
  }
}

function findAsciiBounds(lines: string[]): AsciiBounds | null {
  let top = Number.POSITIVE_INFINITY
  let bottom = Number.NEGATIVE_INFINITY
  let left = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  const maxWidth = Math.max(...lines.map(line => line.length), 0)
  const rowCounts = Array.from({ length: lines.length }, () => 0)
  const columnCounts = Array.from({ length: maxWidth }, () => 0)

  lines.forEach((line, row) => {
    for (let column = 0; column < line.length; column += 1) {
      if (line[column] === " ") continue

      rowCounts[row] += 1
      columnCounts[column] += 1
      top = Math.min(top, row)
      bottom = Math.max(bottom, row)
      left = Math.min(left, column)
      right = Math.max(right, column)
    }
  })

  if (!Number.isFinite(top)) {
    return null
  }

  const denseRows = rowCounts
    .map((count, row) => ({ count, row }))
    .filter(({ count }) => count >= 3)

  const denseColumns = columnCounts
    .map((count, column) => ({ count, column }))
    .filter(({ count }) => count >= 1)

  return {
    top: denseRows[0]?.row ?? top,
    bottom: denseRows.at(-1)?.row ?? bottom,
    left: denseColumns[0]?.column ?? left,
    right: denseColumns.at(-1)?.column ?? right,
  }
}

function buildPreviewFrameNumbers(totalFrames: number, previewFrameCount: number) {
  if (totalFrames <= 0) return []
  if (previewFrameCount <= 1) return [0]
  if (previewFrameCount >= totalFrames) {
    return Array.from({ length: totalFrames }, (_, index) => index)
  }

  const sampledFrames = Array.from(
    { length: previewFrameCount },
    (_, index) => Math.round((index * (totalFrames - 1)) / (previewFrameCount - 1))
  )

  return [...new Set(sampledFrames)]
}

function pickLoadedFrameIndex(frameNumbers: number[], targetFrame: number) {
  if (!frameNumbers.length) return -1

  const exactMatch = frameNumbers.indexOf(targetFrame)
  if (exactMatch !== -1) {
    return exactMatch
  }

  for (let index = frameNumbers.length - 1; index >= 0; index -= 1) {
    if (frameNumbers[index] <= targetFrame) {
      return index
    }
  }

  return frameNumbers.length - 1
}

function trimTextFrames(frames: string[]) {
  let bounds: AsciiBounds | null = null

  frames.forEach(frame => {
    const nextBounds = findAsciiBounds(frame.split("\n"))
    if (!nextBounds) return

    if (!bounds) {
      bounds = { ...nextBounds }
      return
    }

    bounds = {
      top: Math.min(bounds.top, nextBounds.top),
      bottom: Math.max(bounds.bottom, nextBounds.bottom),
      left: Math.min(bounds.left, nextBounds.left),
      right: Math.max(bounds.right, nextBounds.right),
    }
  })

  if (!bounds) {
    return frames
  }

  const trimmedBounds = bounds as AsciiBounds

  return frames.map(frame =>
    frame
      .split("\n")
      .slice(trimmedBounds.top, trimmedBounds.bottom + 1)
      .map(line => line.slice(trimmedBounds.left, trimmedBounds.right + 1))
      .join("\n")
  )
}

export default function ASCIIAnimation({
  frames: providedFrames,
  className = "",
  fps = 24,
  frameCount = 60,
  frameFolder = "frames",
  textSize = "text-xs",
  showFrameCounter = false,
  previewFrameCount = 1,
  ariaLabel,
  quality = "medium",
  lazy = true,
  color,
  gradient,
  playOnHover = false,
  trimWhitespace = false,
  verticalAlign = "center",
  maxScale = 1,
  sourceFormat = "auto",
  filter,
}: ASCIIAnimationProps) {
  const [frames, setFrames] = useState<string[]>([])
  const [frameNumbers, setFrameNumbers] = useState<number[]>([])
  const [colorFrames, setColorFrames] = useState<Uint8Array[]>([])
  const [colorFrameNumbers, setColorFrameNumbers] = useState<number[]>([])
  const [meta, setMeta] = useState<ColorAsciiMeta | null>(null)
  const [format, setFormat] = useState<"text" | "color" | null>(providedFrames ? "text" : null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceRef = useRef<{ baseUrl: string; format: "text" | "color" } | null>(null)
  const fullLoadTriggered = useRef(false)

  const frameFiles = useMemo(
    () => Array.from({ length: frameCount }, (_, i) => `frame_${String(i + 1).padStart(5, "0")}.txt`),
    [frameCount]
  )

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting))
    }, { threshold: 0.1 })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const loadAllFrames = useCallback(
    async (resolvedSource = sourceRef.current) => {
      if (!resolvedSource || fullLoadTriggered.current) return
      fullLoadTriggered.current = true

      if (resolvedSource.format === "color") {
        const metaResponse = await fetch(`${resolvedSource.baseUrl}/meta.json`)
        const resolvedMeta = await metaResponse.json()
        setMeta(resolvedMeta)

        const loadedFrameNumbers = Array.from(
          { length: resolvedMeta.frameCount },
          (_, index) => index
        )
        const loaded = await Promise.all(
          loadedFrameNumbers.map(async (frameNumber) => {
            const response = await fetch(
              `${resolvedSource.baseUrl}/frame_${String(frameNumber + 1).padStart(5, "0")}.bin`
            )
            return new Uint8Array(await response.arrayBuffer())
          })
        )
        setColorFrames(loaded)
        setColorFrameNumbers(loadedFrameNumbers)
      } else {
        const loadedFrameNumbers = Array.from({ length: frameFiles.length }, (_, index) => index)
        const loaded = await Promise.all(
          loadedFrameNumbers.map(async (frameNumber) => {
            const response = await fetch(`${resolvedSource.baseUrl}/${frameFiles[frameNumber]}`)
            return response.text()
          })
        )
        setFrames(loaded)
        setFrameNumbers(loadedFrameNumbers)
      }
    },
    [frameFiles]
  )

  useEffect(() => {
    if (providedFrames) {
      setFrames(providedFrames)
      setFrameNumbers(Array.from({ length: providedFrames.length }, (_, index) => index))
      return
    }

    let cancelled = false
    fullLoadTriggered.current = false

    const loadPreview = async () => {
      const source = await resolveFrameSource(frameFolder, quality, frameFiles[0], sourceFormat)
      if (!source || cancelled) return

      sourceRef.current = source
      setFormat(source.format)

      const initialFrameLimit = Math.max(1, previewFrameCount)

      if (source.format === "color") {
        const metaResponse = await fetch(`${source.baseUrl}/meta.json`)
        const resolvedMeta = await metaResponse.json()
        if (cancelled) return
        setMeta(resolvedMeta)

        const previewNumbers = buildPreviewFrameNumbers(
          resolvedMeta.frameCount,
          Math.min(resolvedMeta.frameCount, initialFrameLimit)
        )
        const previewBuffers = await Promise.all(
          previewNumbers.map(async (frameNumber) => {
            const response = await fetch(
              `${source.baseUrl}/frame_${String(frameNumber + 1).padStart(5, "0")}.bin`
            )
            return new Uint8Array(await response.arrayBuffer())
          })
        )
        if (cancelled) return
        setColorFrames(previewBuffers)
        setColorFrameNumbers(previewNumbers)
      } else {
        const previewNumbers = buildPreviewFrameNumbers(frameFiles.length, initialFrameLimit)
        const previewFrames = await Promise.all(
          previewNumbers.map(async (frameNumber) => {
            const response = await fetch(`${source.baseUrl}/${frameFiles[frameNumber]}`)
            return response.text()
          })
        )
        if (cancelled) return
        setFrames(previewFrames)
        setFrameNumbers(previewNumbers)
      }

      if (!lazy) {
        await loadAllFrames(source)
      }
    }

    loadPreview()
    return () => {
      cancelled = true
    }
  }, [frameFiles, frameFolder, lazy, loadAllFrames, previewFrameCount, providedFrames, quality, sourceFormat])

  const shouldPlay = isVisible && (!playOnHover || isHovered)

  useEffect(() => {
    if (shouldPlay && lazy && !fullLoadTriggered.current) {
      loadAllFrames()
    }
  }, [lazy, loadAllFrames, shouldPlay])

  useEffect(() => {
    if (!shouldPlay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const totalFrameCount = format === "color" ? (meta?.frameCount || frameCount) : frameCount
    if (totalFrameCount <= 1) return

    let animationFrameId = 0
    let lastRenderedFrame = -1
    const frameDuration = 1000 / fps
    const animationStart = performance.now()

    const tick = (timestamp: number) => {
      const elapsed = timestamp - animationStart
      const nextFrame = Math.floor(elapsed / frameDuration) % totalFrameCount

      if (nextFrame !== lastRenderedFrame) {
        lastRenderedFrame = nextFrame
        setCurrentFrame(nextFrame)
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [format, fps, frameCount, meta?.frameCount, shouldPlay])

  const visibleTextFrames = useMemo(
    () => (trimWhitespace ? trimTextFrames(frames) : frames),
    [frames, trimWhitespace]
  )

  const displayedTextFrameIndex = useMemo(
    () => pickLoadedFrameIndex(frameNumbers, currentFrame),
    [frameNumbers, currentFrame]
  )
  const displayedColorFrameIndex = useMemo(
    () => pickLoadedFrameIndex(colorFrameNumbers, currentFrame),
    [colorFrameNumbers, currentFrame]
  )

  useEffect(() => {
    if (
      format === "color" &&
      meta &&
      displayedColorFrameIndex !== -1 &&
      colorFrames[displayedColorFrameIndex] &&
      canvasRef.current
    ) {
      drawColorFrame(canvasRef.current, meta, colorFrames[displayedColorFrameIndex])
    }
  }, [colorFrames, displayedColorFrameIndex, format, meta])

  const currentVisibleTextFrame =
    displayedTextFrameIndex === -1
      ? visibleTextFrames[0] || ""
      : visibleTextFrames[displayedTextFrameIndex] || visibleTextFrames[0] || ""
  const frameCounterTotal = format === "color" ? (meta?.frameCount || frameCount) : frameCount
  const transformOrigin = verticalAlign === "bottom" ? "center bottom" : "center"

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const target = format === "color" ? canvasRef.current : preRef.current
      if (!target) return

      const contentWidth = target.scrollWidth || target.clientWidth
      const contentHeight = target.scrollHeight || target.clientHeight
      if (!contentWidth || !contentHeight) return

      const nextScale = Math.min(
        container.clientWidth / contentWidth,
        container.clientHeight / contentHeight,
        maxScale
      )
      setScale(Number.isFinite(nextScale) ? nextScale : 1)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    if (preRef.current) observer.observe(preRef.current)
    if (canvasRef.current) observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [currentFrame, currentVisibleTextFrame, format, maxScale, meta])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex ${verticalAlign === "bottom" ? "items-end" : "items-center"} justify-center overflow-hidden ${className}`}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {format === "color" ? (
        <canvas
          ref={canvasRef}
          style={{
            filter,
            transform: `scale(${scale})`,
            transformOrigin,
          }}
        />
      ) : (
        <pre
          ref={preRef}
          className={`${textSize} leading-none whitespace-pre select-none`}
          style={{
            margin: 0,
            padding: 0,
            color,
            backgroundImage: gradient,
            backgroundClip: gradient ? "text" : undefined,
            filter,
            WebkitBackgroundClip: gradient ? "text" : undefined,
            WebkitTextFillColor: gradient ? "transparent" : undefined,
            fontFamily: FONT_FAMILY,
            transform: `scale(${scale})`,
            transformOrigin,
          }}
        >
          {currentVisibleTextFrame}
        </pre>
      )}

      {showFrameCounter && (
        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-[10px] font-mono text-white">
          Frame: {Math.min(currentFrame + 1, frameCounterTotal)}/{frameCounterTotal}
        </div>
      )}
    </div>
  )
}
