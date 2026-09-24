#!/usr/bin/env node
/**
 * Post-deploy launch smoke checks against production (or APP_URL).
 * Usage: node scripts/launch-check.mjs [baseUrl]
 */
const base = (process.argv[2] || process.env.APP_URL || "https://www.sprymd.ai").replace(
  /\/$/,
  "",
);

async function main() {
  const healthRes = await fetch(`${base}/api/health`);
  const health = await healthRes.json().catch(() => ({}));
  const reconcileRes = await fetch(`${base}/api/ops/reconcile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allAwaiting: true }),
  });
  const queueRes = await fetch(`${base}/api/ops/queue`);
  const statusRes = await fetch(`${base}/api/ops/status`);
  const opsDemoRes = await fetch(`${base}/ops?demo=1`);

  const report = {
    base,
    health: { status: healthRes.status, body: health },
    reconcile: {
      status: reconcileRes.status,
      expect: "401 once deployed (staff auth); 404 means route missing",
    },
    queue: { status: queueRes.status, expect: "401 when deployed" },
    status: { status: statusRes.status, expect: "401 when deployed" },
    opsDemo: { status: opsDemoRes.status, expect: 200 },
    launchGates: {
      cashPayReady: Boolean(health?.ok),
      reconcileRouted: reconcileRes.status !== 404,
      opsDemoOk: opsDemoRes.status === 200,
      videoDaily: Boolean(health?.checks?.dailyApiKey),
      videoTwilio: Boolean(health?.checks?.twilioVideo),
      opsStaffEnv: Boolean(health?.checks?.opsStaffEmailsEnv),
      opsStaffBuiltin: Boolean(health?.checks?.opsStaffBuiltinAllowlist),
    },
  };

  console.log(JSON.stringify(report, null, 2));
  const ok =
    report.launchGates.cashPayReady &&
    report.launchGates.reconcileRouted &&
    report.launchGates.opsDemoOk;
  process.exit(ok ? 0 : 2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
