"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function ProgressBarProvider() {
  return (
    <AppProgressBar
      height="3px"
      color="linear-gradient(90deg, #7c3aed, #a855f7, #d946ef)"
      options={{ showSpinner: false, easing: "ease", speed: 400, minimum: 0.2 }}
      shallowRouting
    />
  );
}
