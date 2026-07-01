import React from 'react'

export default function BorderFrame() {
    return (

        <div className="absolute bottom-0  pointer-events-none! left-0 w-full h-full z-4  flex-col  flex items-center justify-center">
            <div className="relative h-[calc(100vh-2.5vw)] w-[97.55vw] overflow-hidden">
                <div className="h-[15vh] w-full border-b border-foreground/5"></div>
                <div className="h-[20vh] w-full border-b border-foreground/5"></div>
                <div className="h-[5vh] w-full border-b border-foreground/5"></div>
                <div className="h-[40vh] w-[91.7vw] border-b border-foreground/5"></div>
                <span className="h-full block w-px absolute bottom-0 left-[23vw] bg-foreground/5"></span>
                <span className="h-[46.6vw] block w-px absolute bottom-0 left-1/2 bg-foreground/5"></span>
                <span className="h-[46.6vw] block w-px absolute bottom-0 left-[80vw] bg-foreground/5"></span>
            </div>
        </div>
    )
}
