import assert from "node:assert/strict"
import { applyLiveBody, nextReading, takeReading } from "./last-reading.ts"

const kept = { ok: true, stops: ["HH650"] }
const failed = { ok: false, error: "Feed failed", stops: [] as string[] }
const arrived = { ok: true, stops: ["YT119"] }
assert.equal(nextReading(null, failed), failed)
assert.equal(nextReading(kept, failed), kept)
assert.deepEqual(nextReading(kept, arrived).stops, ["YT119"])
assert.equal(nextReading(failed, failed), failed)

assert.equal(takeReading(null, 0, arrived, 1, true), arrived)
assert.equal(takeReading(kept, 2, arrived, 1, true), kept)
assert.equal(takeReading(kept, 1, arrived, 2, true), arrived)
assert.equal(takeReading(failed, 1, arrived, 2, true), arrived)
assert.equal(takeReading(null, 0, failed, 1, true), null)
assert.equal(takeReading(kept, 1, failed, 2, true), kept)
assert.equal(takeReading(null, 0, failed, 1, false), failed)

const empty = { data: null, error: "Parking catalogue failed", generation: 0 }
const shown = applyLiveBody(empty, arrived, 1, true, "Parking catalogue failed")
assert.equal(shown.data, arrived)
assert.equal(shown.error, null)
assert.equal(shown.generation, 1)

const held = applyLiveBody({ data: kept, error: null, generation: 2 }, arrived, 1, true, "Parking catalogue failed")
assert.equal(held.data, kept)
assert.equal(held.generation, 2)

const moved = applyLiveBody({ data: kept, error: null, generation: 1 }, arrived, 2, true, "Parking catalogue failed")
assert.equal(moved.data, arrived)
assert.equal(moved.error, null)

const quiet = applyLiveBody({ data: null, error: null, generation: 0 }, failed, 1, true, "Parking catalogue failed")
assert.equal(quiet.data, null)
assert.equal(quiet.error, null)

const freshFail = applyLiveBody({ data: kept, error: null, generation: 1 }, failed, 2, false, "Parking catalogue failed")
assert.equal(freshFail.data, kept)
assert.equal(freshFail.error, "Parking catalogue failed")
assert.equal(freshFail.generation, 1)

console.log("last reading ok")
