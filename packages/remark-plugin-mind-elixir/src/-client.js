const SELECTOR = '.mind-elixir-block[data-mind-elixir]:not([data-rendered])'

let MindElixirPromise
const loadMindElixir = () =>
  (MindElixirPromise ??= import('mind-elixir').then(async (m) => {
    // await import('mind-elixir/style.css') // adjust if your version exposes the CSS differently
    return m.default
  }))

async function render(el) {
  el.dataset.rendered = 'true'
  try {
    const { data, options = {} } = JSON.parse(el.dataset.mindElixir)
    const MindElixir = await loadMindElixir()

    const dir = { left: MindElixir.LEFT, right: MindElixir.RIGHT, side: MindElixir.SIDE }[options.direction]
    const dark = options.theme === 'dark' || (options.theme == null && matchMedia('(prefers-color-scheme: dark)').matches)

    const mind = new MindElixir({
      el,
      direction: dir ?? MindElixir.SIDE,
      theme: dark ? MindElixir.DARK_THEME : MindElixir.THEME,
      editable: options.editable ?? false, // read-only by default
      contextMenu: options.editable ?? false,
      toolBar: options.toolbar ?? true,
      keypress: options.editable ?? false,
      draggable: options.editable ?? false,
    })
    mind.init(data)
    mind.toCenter?.()
    el._mind = mind // handy for debugging / external access
  } catch (err) {
    el.textContent = `mind-elixir: ${err.message}`
    el.classList.add('mind-elixir-error')
  }
}

export function hydrateMindElixir(root = document) {
  const nodes = root.querySelectorAll(SELECTOR)
  if (!nodes.length) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        render(e.target)
      }
    },
    { rootMargin: '200px' },
  )
  nodes.forEach((n) => io.observe(n))
}

// Auto-run
if (typeof document !== 'undefined') {
  const run = () => hydrateMindElixir()
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run()
  document.addEventListener('astro:page-load', run) // Astro view transitions
}