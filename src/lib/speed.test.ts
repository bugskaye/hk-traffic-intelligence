import assert from "node:assert/strict"
import { SPEED_FRESH_MS, SPEED_RETRY_MS, speedReadingTtl } from "./speed.ts"

assert.equal(speedReadingTtl(true), SPEED_FRESH_MS)
assert.equal(speedReadingTtl(false), SPEED_RETRY_MS)
assert.ok(SPEED_RETRY_MS < SPEED_FRESH_MS)

console.log("speed ok")
