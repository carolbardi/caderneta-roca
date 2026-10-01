export function Cabecalho({
  titulo,
  subtitulo,
  aoVoltar,
  aoAvancar,
}: {
  titulo: string
  subtitulo?: string
  aoVoltar?: () => void
  aoAvancar?: () => void
}) {
  return (
    <header className="mb-4 flex items-center gap-2">
      {aoVoltar && (
        <button onClick={aoVoltar} className="h-10 w-10 rounded-full text-2xl text-mata" aria-label="Anterior">
          ‹
        </button>
      )}
      <div className="flex-1 text-center">
        <h1 className="font-titulo text-2xl font-bold text-mata">{titulo}</h1>
        {subtitulo && <p className="text-sm text-cacau/70">{subtitulo}</p>}
      </div>
      {aoAvancar && (
        <button onClick={aoAvancar} className="h-10 w-10 rounded-full text-2xl text-mata" aria-label="Próximo">
          ›
        </button>
      )}
    </header>
  )
}
