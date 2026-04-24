/// <reference types="vite/client" />

declare module "vanta/dist/vanta.halo.min" {
  interface VantaHaloOptions {
    el: HTMLElement;
    THREE: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    backgroundColor?: number;
    baseColor?: number;
    amplitudeFactor?: number;
    size?: number;
    xOffset?: number;
    yOffset?: number;
  }
  interface VantaEffect {
    destroy: () => void;
  }
  const HALO: (opts: VantaHaloOptions) => VantaEffect;
  export default HALO;
}

