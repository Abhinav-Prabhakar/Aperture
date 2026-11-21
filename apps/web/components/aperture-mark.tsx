import type { SVGProps } from "react";

const BLADES = Array.from({ length: 6 }, (_, index) => {
  const start = index * 60 + 2;
  const end = index * 60 + 58;
  const toPoint = (angle: number, radius: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return [
      24 + radius * Math.cos(radians),
      24 + radius * Math.sin(radians),
    ] as const;
  };
  const [x1, y1] = toPoint(start, 20);
  const [x2, y2] = toPoint(end, 20);
  return `M24 24 L${x1.toFixed(2)} ${y1.toFixed(2)} A20 20 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
});

export function ApertureMark({
  title = "Aperture",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      fill="currentColor"
      role={title ? "img" : undefined}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {BLADES.map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
