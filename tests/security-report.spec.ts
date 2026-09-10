import { expect, spyOn, test } from "bun:test";
import { handleSecurityReport } from "../src/lib/security-report";

function reportRequest(body: unknown, contentType = "application/csp-report", origin = "https://suchio.net") {
  return new Request("https://suchio.net/api/security-report", { method: "POST", headers: { "Content-Type": contentType, Origin: origin }, body: JSON.stringify(body) });
}

test("security reports log only finite directive names and disposition", async () => {
  const warn = spyOn(console, "warn").mockImplementation(() => {});
  try {
    const sensitive = "private@example.com";
    const response = await handleSecurityReport(reportRequest({ "csp-report": { "effective-directive": "script-src-elem", disposition: "report", "document-uri": `https://suchio.net/?email=${sensitive}`, "script-sample": sensitive } }));
    expect(response.status).toBe(204);
    await handleSecurityReport(reportRequest([{ type: "csp-violation", body: { effectiveDirective: "object-src", disposition: "enforce" } }], "application/reports+json"));
    await handleSecurityReport(reportRequest({ "csp-report": { "effective-directive": sensitive } }));
    expect(warn.mock.calls.map(call => JSON.parse(String(call[0])))).toEqual([
      { event: "security.csp_violation", directive: "script-src-elem", disposition: "report" },
      { event: "security.csp_violation", directive: "object-src", disposition: "enforce" },
    ]);
    expect(JSON.stringify(warn.mock.calls)).not.toContain(sensitive);
  } finally { warn.mockRestore(); }
});

test("security report endpoint rejects cross-origin and oversized input", async () => {
  expect((await handleSecurityReport(reportRequest({}, "text/plain"))).status).toBe(415);
  expect((await handleSecurityReport(reportRequest({}, "application/csp-report", "https://elsewhere.example"))).status).toBe(403);
  expect((await handleSecurityReport(reportRequest({ padding: "x".repeat(16001) }))).status).toBe(413);
  expect((await handleSecurityReport(new Request("https://suchio.net/api/security-report"))).status).toBe(405);
});
