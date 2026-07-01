import React from 'react'
import Image from 'next/image'

export default function Loader() {
    return (
        <div className="absolute inset-0 z-3 grid place-items-center bg-background text-foreground">
            <Image
                src="/assets/svgs/swan.svg"
                alt="Loading..."
                width={500}
                height={500}
                className="w-52 h-52 animate-spin"
                priority
            />
        </div>
    )
}
