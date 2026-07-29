"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const LAUNCH_DATE = new Date("2026-08-25T13:00:00+02:00").getTime()

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  launched: boolean
}

function calculateTimeRemaining(): TimeRemaining {
  const difference = LAUNCH_DATE - Date.now()

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      launched: true,
    }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
    launched: false,
  }
}

type CountdownItemProps = {
  value: number
  label: string
}

function CountdownItem({
  value,
  label,
}: CountdownItemProps) {
  return (
    <div className="min-w-20 rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-center backdrop-blur-sm sm:min-w-24">
      <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {value.toString().padStart(2, "0")}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">
        {label}
      </p>
    </div>
  )
}

export default function LaunchCountdown() {
  const [timeRemaining, setTimeRemaining] =
    useState<TimeRemaining | null>(null)

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining())

    const interval = window.setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  if (!timeRemaining) {
    return (
      <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
    )
  }

  if (timeRemaining.launched) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-white">
          The wait is over. Meka.WC is now open.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-bold text-gray-950 transition hover:bg-gray-100"
        >
          Shop now
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        <CountdownItem
          value={timeRemaining.days}
          label="Days"
        />

        <CountdownItem
          value={timeRemaining.hours}
          label="Hours"
        />

        <CountdownItem
          value={timeRemaining.minutes}
          label="Minutes"
        />

        <CountdownItem
          value={timeRemaining.seconds}
          label="Seconds"
        />
      </div>

      <p className="mt-5 text-center text-sm text-white/70">
        Launching 25 August 2026 at 13:00 SAST
      </p>
    </div>
  )
}