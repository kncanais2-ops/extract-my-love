import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min";

export default function VantaBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;

    effectRef.current?.destroy();

    const isDark = resolvedTheme === "dark";

    effectRef.current = HALO({
      el: ref.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      backgroundColor: isDark ? 0x0a0a0a : 0xfafafa,
      baseColor: isDark ? 0x1f3a1f : 0x22c55e,
      amplitudeFactor: 0.8,
      size: 1.2,
      xOffset: 0,
      yOffset: 0,
    });

    return () => {
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [resolvedTheme]);

  return <div ref={ref} className="fixed inset-0 -z-10" aria-hidden="true" />;
}
