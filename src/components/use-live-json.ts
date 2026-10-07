"use client"

import { useEffect, useRef, useState } from "react"
import { applyLiveBody } from "@/lib/last-reading"
import { politeQueue } from "@/lib/polite-fetch"

const arrivalLane = politeQueue(1)

export function useLiveJson<T extends { ok: boolean }>(url: string | null, intervalMs = 60_000, shareArrivalLane = false): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const held = useRef<{ data: T | null; error: string | null; generation: number }>({ data: null, error: null, generation: 0 })
  const serial = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!url) return
    let stopped = false
    let running = false
    let again = false

    const publish = (incoming: T, request: number, stale: boolean, failure: string) => {
      if (!mounted.current) return
      const next = applyLiveBody(held.current, incoming, request, stale, failure)
      held.current = next
      setData(next.data)
      setError(next.error)
    }

    const load = async () => {
      if (stopped || !mounted.current) return
      if (running) {
        again = true
        return
      }
      running = true
      try {
        do {
          again = false
          const request = ++serial.current
          const run = shareArrivalLane ? (task: () => Promise<void>) => arrivalLane(task) : (task: () => Promise<void>) => task()
          await run(async () => {
            if (!mounted.current) return
            try {
              const response = await fetch(url, { cache: "no-store" })
              const body: unknown = await response.json()
              if (!mounted.current) return
              const stale = stopped || request !== serial.current
              if (!hasOk(body)) {
                if (stale) return
                const message = `Unexpected response (${response.status})`
                held.current = { ...held.current, error: message }
                setError(message)
                return
              }
              const incoming = body as T
              publish(incoming, request, stale, incoming.ok ? "" : readingError(incoming, response.status))
            } catch (cause) {
              if (!mounted.current || stopped || request !== serial.current) return
              const message = cause instanceof Error ? cause.message : "Request failed"
              held.current = { ...held.current, error: message }
              setError(message)
            }
          })
        } while (again && !stopped && mounted.current)
      } finally {
        running = false
      }
    }

    void load()
    const timer = window.setInterval(() => void load(), intervalMs)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [intervalMs, shareArrivalLane, url])

  if (!url) return { data: null, error: null }
  return { data, error }
}

function readingError(body: { ok: boolean }, status: number): string {
  if ("error" in body && typeof body.error === "string" && body.error) return body.error
  return `Feed failed (${status})`
}

function hasOk(value: unknown): value is { ok: boolean } {
  if (typeof value !== "object" || value === null || !("ok" in value)) return false
  return typeof value.ok === "boolean"
}
