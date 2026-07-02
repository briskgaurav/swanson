

export default function DiagonalLines({ className = "" }) {
  return (

    <>

     {/* SIDE BLURS */}
    <div
      className="absolute size-[50vw] z-200blur-3xl left-[-32vw] top-[-15vw] opacity-15 rounded-full inset-0"
      style={{
        background: 'radial-gradient(circle, #AA7F2C 0%, #AA7F2C88 65%, transparent 100%)',
      }}
    />
    <div
      className="absolute size-[50vw] blur-3xl left-[75vw] top-[15vw] opacity-15 rounded-full "
      style={{
        background: 'radial-gradient(circle, #AA7F2C 0%, #AA7F2C88 65%, transparent 100%)',
      }}
    />
    {/* LINES */}
    <span className="w-px h-[80vw] rotate-55 top-[-20vw] left-[20vw] absolute bg-[#5D5D5D]/30" />
    <span className="w-px h-[80vw] rotate-55 bottom-[-20vw] right-[20vw] absolute bg-[#5D5D5D]/30" />
    <span className="w-px h-[120vw] rotate-54 top-[-25vw] left-[40vw] absolute bg-[#5D5D5D]/30" />
    </>
    
  )
}
