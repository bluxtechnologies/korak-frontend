import { describe, expect, it } from "vitest";
import {
  MOTION_SPRINGS,
  FINTECH_EASE,
  MOTION_TRANSITIONS,
  MOTION_VARIANTS,
  INTERACTION_PRESETS,
} from "./motion";

describe("Fintech Motion Design System (src/lib/motion.ts)", () => {
  it("defines high-stiffness spring configurations without excessive bounce", () => {
    expect(MOTION_SPRINGS.snappy.stiffness).toBeGreaterThanOrEqual(400);
    expect(MOTION_SPRINGS.snappy.damping).toBeGreaterThanOrEqual(30);
    expect(MOTION_SPRINGS.modal.stiffness).toBeGreaterThanOrEqual(350);
  });

  it("exports calibrated cubic-bezier fintech easing curve", () => {
    expect(FINTECH_EASE).toEqual([0.16, 1, 0.3, 1]);
  });

  it("restricts transitions between 140ms and 180ms for enterprise density", () => {
    expect(MOTION_TRANSITIONS.quick.duration).toBeLessThanOrEqual(0.18);
    expect(MOTION_TRANSITIONS.standard.duration).toBeLessThanOrEqual(0.2);
    expect(MOTION_TRANSITIONS.fade.duration).toBeLessThanOrEqual(0.15);
  });

  it("provides standard variants for dialogs, cards, and staggered lists", () => {
    expect(MOTION_VARIANTS.fadeIn).toBeDefined();
    expect(MOTION_VARIANTS.fadeInUp).toBeDefined();
    expect(MOTION_VARIANTS.staggerContainer).toBeDefined();
    expect(MOTION_VARIANTS.dialogScale).toBeDefined();
    expect(MOTION_VARIANTS.drawerSlideLeft).toBeDefined();
    expect(MOTION_VARIANTS.balanceMask).toBeDefined();
  });

  it("provides interactive hover and tap micro-interactions", () => {
    expect(INTERACTION_PRESETS.cardLift.whileHover).toBeDefined();
    expect(INTERACTION_PRESETS.buttonPress.whileTap).toBeDefined();
  });
});
