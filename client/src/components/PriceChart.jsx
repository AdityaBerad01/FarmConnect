export default function PriceChart({ data = [], width = 300, height = 120, color = '#52b788' }) {
  if (!data.length) return null;

  const padding = { top: 10, right: 10, bottom: 20, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / range) * chartH
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area fill
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y-axis labels
  const yLabels = [minVal, (minVal + maxVal) / 2, maxVal].map(v => Math.round(v));

  return (
    <svg width={width} height={height} className="price-chart">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((val, i) => {
        const y = padding.top + chartH - ((val - minVal) / range) * chartH;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
              stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4" />
            <text x={padding.left - 5} y={y + 4} textAnchor="end"
              fill="var(--color-text-muted)" fontSize="9">
              ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="var(--color-bg)" strokeWidth="1.5">
          <title>{data[i].label}: ₹{data[i].value}</title>
        </circle>
      ))}

      {/* X-axis labels */}
      {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text key={i} x={points[idx].x} y={height - 3} textAnchor="middle"
            fill="var(--color-text-muted)" fontSize="8">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
