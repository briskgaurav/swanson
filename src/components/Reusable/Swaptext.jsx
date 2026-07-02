import React from 'react'

export default function Swaptext({ label, className = '' }) {
    return (
                <span className={`relative block overflow-hidden ${className}`}>
                    <span className="block transition-transform duration-500 ease-out group-hover:-translate-y-full">
                        {label}
                    </span>
                    <span className="absolute text-shadow-2xs inset-0 block translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0">
                        {label}
                    </span>
                </span>
    )
}
