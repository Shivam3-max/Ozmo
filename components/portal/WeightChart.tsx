export default function WeightChart({
  points,
  goal,
}: {
  points: { date: Date; weight: number }[];
  goal?: number | null;
}) {
  if (points.length < 2) {
    return (
      <p className="px-1 py-6 text-[14.5px] text-[var(--ink-3)]">
        Record a second weight and the trend appears here. One reading is a number; two is a
        direction.
      </p>
    );
  }

  const w = 640;
  const h = 200;
  const pad = { top: 16, right: 14, bottom: 26, left: 38 };

  const values = points.map((p) => p.weight);
  if (goal) values.push(goal);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const span = max - min || 1;

  const x = (i: number) => pad.left + (i / (points.length - 1)) * (w - pad.left - pad.right);
  const y = (v: number) => pad.top + (1 - (v - min) / span) * (h - pad.top - pad.bottom);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.weight).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${h - pad.bottom} L${x(0).toFixed(1)},${h - pad.bottom} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const change = Math.round((last.weight - first.weight) * 10) / 10;

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Weight from {first.weight} kg on {first.date.toDateString()} to {last.weight} kg on{" "}
        {last.date.toDateString()}, a change of {change} kg across {points.length} readings.
      </figcaption>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full min-w-[320px]" role="img" aria-label="Weight trend">
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={w - pad.right} y1={y(min + span * t)} y2={y(min + span * t)} stroke="var(--line)" strokeWidth="1" />
              <text x={pad.left - 8} y={y(min + span * t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">
                {(min + span * t).toFixed(0)}
              </text>
            </g>
          ))}

          {goal && goal >= min && goal <= max && (
            <>
              <line x1={pad.left} x2={w - pad.right} y1={y(goal)} y2={y(goal)} stroke="var(--good)" strokeWidth="1.5" strokeDasharray="5 4" />
              <text x={w - pad.right} y={y(goal) - 6} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--good)">goal</text>
            </>
          )}

          <path d={area} fill="var(--accent)" opacity="0.14" />
          <path d={line} fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={x(i)} cy={y(p.weight)} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? "var(--accent)" : "var(--ink)"} stroke="var(--paper)" strokeWidth="1.5" />
          ))}

          <text x={pad.left} y={h - 6} fontSize="11" fill="var(--ink-3)">
            {first.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </text>
          <text x={w - pad.right} y={h - 6} textAnchor="end" fontSize="11" fill="var(--ink-3)">
            {last.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </text>
        </svg>
      </div>
    </figure>
  );
}
