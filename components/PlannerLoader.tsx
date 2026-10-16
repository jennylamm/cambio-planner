"use client";

import dynamic from "next/dynamic";

// The planner reads localStorage and uses browser drag-and-drop, so it must
// render client-side only. `ssr: false` is only allowed inside a Client
// Component, which is why this wrapper exists.
const Planner = dynamic(() => import("./Planner"), { ssr: false });

export default function PlannerLoader() {
  return <Planner />;
}
