"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function ProgressBarProvider() {
  return (
    <AppProgressBar
      height="3px"
      color="#1a1a1a"
      options={{ showSpinner: false, easing: "ease", speed: 400, minimum: 0.2 }}
      shallowRouting
    />
  );
}
