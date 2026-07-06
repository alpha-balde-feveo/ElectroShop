import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Carte 3D interactive : s'incline en suivant la souris,
 * avec un reflet lumineux qui suit le curseur.
 */
export default function Tilt3D({
  children,
  className = "",
  max = 12,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>(
    "perspective(1000px) rotateX(0deg) rotateY(0deg)"
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;

    setTransform(
      `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(
        2
      )}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const onMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
    setGlare((g) => ({ ...g, opacity: 0 }));
  };

  const style: CSSProperties = {
    transform,
    transition: "transform 0.15s ease-out",
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative ${className}`}
      style={style}
    >
      {children}
      {/* Reflet lumineux */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.28), transparent 55%)`,
          opacity: glare.opacity,
          transition: "opacity 0.35s ease",
        }}
      />
    </div>
  );
}
