import Image from 'next/image'

const directionConfig = {
  left: {
    root: 'items-start',
    paragraph: 'w-[26vw]',
  },
  right: {
    root: 'items-end',
    paragraph: 'w-[27vw] pl-[10vw] pr-[2vw] text-right',
  },
}

export default function Stories({
  text,
  imageSrc,
  direction = 'left',
  alt = '',
  className = '',
  paragraphClassName = '',
  imageClassName = '',
}) {
  const config = directionConfig[direction] ?? directionConfig.left

  const image = (
    <div
      className={`aspect-video w-[37vw] shrink-0 overflow-hidden rounded-xl ${imageClassName}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        height={500}
        width={500}
        className="h-full w-full object-cover object-top"
      />
    </div>
  )

  const copy = (
    <p className={`text24 leading-[1.25] ${paragraphClassName || config.paragraph}`.trim()}>
      {text}
    </p>
  )

  return (
    <article
      className={`flex h-fit w-[40vw] flex-col gap-[2vw] ${config.root} ${className}`.trim()}
    >
      {direction === 'left' ? (
        <>
          {copy}
          {image}
        </>
      ) : (
        <>
          {image}
          {copy}
        </>
      )}
    </article>
  )
}
