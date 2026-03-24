"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function ProgressBarProvider() {
  return (
    <AppProgressBar
      height="3px"
      color="#1B1C15"
      options={{ showSpinner: false, easing: "ease", speed: 400, minimum: 0.2 }}
      shallowRouting
    />
  );
}
