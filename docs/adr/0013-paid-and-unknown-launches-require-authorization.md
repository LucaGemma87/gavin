# Paid and unknown launches require per-run authorization

Provider/model names do not prove current entitlement, and an arbitrary command may launch a paid CLI; therefore Gavin's app-wide default is `Ask`, and app or workspace settings may choose `Ask` or `No paid requests` (a workspace choice overrides the app choice). `Ask` requires approval before every paid or unknown launch; `No paid requests` blocks known paid routes but still asks before each unknown launch, including an unclassifiable command. Approval applies to that launch only and never changes or establishes the route's entitlement.

## Amendment: evidence can place a route, an approval still cannot

A route is no longer always `Unknown`. The app reads a signed-in agent's subscription windows through the same probes the usage panel draws, and a launch may carry that reading (`CreateAuthorizedSession.evidence`, protocol v82): which entitlement it supports, where it was read and when. The daemon decides whether it still holds (`launch_policy::classify`): it must name a source, be no older than fifteen minutes, not come from the future, and ride a launch that names a stock profile. Anything else is `Unknown` and asks, exactly as before.

Evidence only ever clears a launch. It cannot mark a route `Paid`, so it cannot loosen `No paid requests` for a known paid route, and an approval still applies to one launch and never establishes an entitlement. The app sends a reading only for a window that exists on a plan (the five-hour, seven-day and equivalent windows); a pooled, pay-as-you-go or overage window (`on_demand`, `spend_limit`, `api`) or a spent plan window sends nothing, because a window that may bill must not read as one that does not.
