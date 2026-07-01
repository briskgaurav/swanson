function drawCover(ctx, source, width, height) {
  const sw = source.width
  const sh = source.height
  const scale = Math.max(width / sw, height / sh)
  const w = sw * scale
  const h = sh * scale
  const x = (width - w) / 2
  const y = (height - h) / 2
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(source, x, y, w, h)
}

export function createCanvasRenderer({ cover = true } = {}) {
  let ctx
  let canvas
  let width = 0
  let height = 0

  return {
    mount(element) {
      canvas = element
      ctx = canvas.getContext("2d")
      canvas.style.width = ""
      canvas.style.height = ""
    },

    resize(w, h, dpr) {
      width = w
      height = h
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },

    draw(source) {
      if (!ctx || !source) return
      if (cover) drawCover(ctx, source, width, height)
      else ctx.drawImage(source, 0, 0, width, height)
    },

    destroy() {
      ctx = null
      canvas = null
    },
  }
}
