import { expect, test } from "bun:test";
import { readLimitedBytes, readLimitedJson } from "../src/lib/request-body";
import { boundedText } from "../src/lib/audit-measurement";

function stream(chunks: Uint8Array[], onCancel?: () => void) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(chunk));
      controller.close();
    },
    cancel: onCancel,
  });
}

test("bounded readers preserve multibyte text across chunks at the exact byte limit", async () => {
  const bytes = new TextEncoder().encode('{"text":"Grüße"}');
  const chunks = [bytes.slice(0, 12), bytes.slice(12, 13), bytes.slice(13)];
  const body = stream(chunks);
  expect(await boundedText(body, bytes.length)).toBe('{"text":"Grüße"}');
  expect(body.locked).toBeFalse();
  const request = new Request("https://suchio.net/", { method: "POST", body: stream(chunks) });
  expect(await readLimitedJson(request, bytes.length)).toEqual({ ok: true, value: { text: "Grüße" } });
  expect(request.body!.locked).toBeFalse();
});

test("bounded readers cancel oversized streams and release their locks", async () => {
  let cancelled = false;
  const body = stream([new Uint8Array(3), new Uint8Array(3), new Uint8Array(1)], () => { cancelled = true; });
  expect(await readLimitedBytes(body, 5)).toBeNull();
  expect(cancelled).toBeTrue();
  expect(body.locked).toBeFalse();
  expect(await boundedText(stream([new Uint8Array(6)]), 5)).toBeNull();
  const request = new Request("https://suchio.net/", { method: "POST", headers: { "content-length": "1" }, body: stream([new Uint8Array(6)]) });
  expect(await readLimitedJson(request, 5)).toEqual({ ok: false, status: 413 });
});

test("JSON stays strict about UTF-8 while bounded text preserves replacement decoding", async () => {
  const chunks = [new Uint8Array([0x22, 0xff, 0x22])];
  expect(await boundedText(stream(chunks), 3)).toBe('"\ufffd"');
  const request = new Request("https://suchio.net/", { method: "POST", body: stream(chunks) });
  expect(await readLimitedJson(request, 3)).toEqual({ ok: false, status: 400 });
  expect(await boundedText(null, 3)).toBeNull();
});

test("failed streams release locks and retain each caller's error contract", async () => {
  const broken = () => new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("read failed")); } });
  const body = broken();
  await expect(boundedText(body, 10)).rejects.toThrow("read failed");
  expect(body.locked).toBeFalse();
  const request = new Request("https://suchio.net/", { method: "POST", body: broken() });
  expect(await readLimitedJson(request, 10)).toEqual({ ok: false, status: 400 });
  expect(request.body!.locked).toBeFalse();
});
