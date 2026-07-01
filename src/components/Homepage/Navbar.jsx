'use client'

import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import Swaptext from '../Reusable/Swaptext';

// Define navigation links
const links = [
    { href: '#about', label: 'About Us' },
    { href: '#story', label: 'Our Story' },
    { href: '#team', label: 'Team' },
    { href: '#governance', label: 'Governance' },
];


export default function Navbar() {
    return (
        <nav className="h-fit fixed px-[3.5vw] py-[2vw] top-0 left-0 z-50 w-full">
            <div className="flex items-center justify-between w-full">

                <div className="flex items-center gap-[1vw]">
                    <div className="size-[3.5vw] relative">
                        <Image
                            src={'/assets/svgs/swan.svg'}
                            alt="swan"
                            fill
                            className="object-contain h-full w-full"
                            priority
                        />
                    </div>
                    <p className="text50 font-philosopher">Swanson</p>
                </div>
                <div className='flex items-center gap-[1vw]'>

                    {/* Navigation Links and Schedule button bar */}
                    <div className="flex items-center gap-[5vw] bg-white/5 backdrop-blur-md rounded-md p-[.5vw]">

                        {/* Map navigation links */}
                        {links.map((link, idx) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`text14 group ${idx === 0 ? 'pl-[3vw]' : ''}`}
                            >
                                <Swaptext label={link.label} />
                            </Link>
                        ))}

                        <button
                            className='text14 group bg-primary text-background flex px-[1.2vw] py-[.7vw] rounded-sm items-center gap-[.8vw]'
                        >
                            <span className='size-[.7vw] block relative rounded-full transition-transform duration-500 ease-out group-hover:rotate-90'>
                                <Image src={'/assets/svgs/plus.svg'} alt='plus' fill className='object-contain h-full w-full' />
                            </span>
                            <Swaptext label="Schedule" />
                        </button>
                    </div>
                    {/* BUTTONS */}
                    <div className='flex items-center gap-[.5vw] flex-col'>
                        <span className='w-[4vw] h-[.2vw] block relative rounded-full bg-primary' />
                        <span className='w-[4vw] h-[.2vw] block relative rounded-full bg-primary' />
                    </div>
                </div>

            </div>
        </nav>
    )
}
