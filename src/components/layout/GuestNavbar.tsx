"use client";

import * as React from "react";
import { LandingNavbar, type LandingNavbarProps } from "@/components/landing/LandingNavbar";

/**
 * GuestNavbar delegates directly to LandingNavbar for Phase 01.
 * Maintains backwards-compatibility with existing layouts and test imports.
 */
export function GuestNavbar(props: LandingNavbarProps) {
  return <LandingNavbar {...props} />;
}
