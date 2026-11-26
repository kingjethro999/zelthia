"use client";

import { useId, useState } from "react";
import type { AdminOverviewSeriesPoint } from "@/lib/admin-types";
import { SegmentedControl } from "./SegmentedControl";

export function MiniSparkline({
  data,
  color = "var(--brand)",
  width = 72,
  height = 28,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const gid = useId();
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = Math.max(1, max - min);
  const pad = 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SeriesKey = "conversations" | "users" | "facilities";

const SERIES_META: Record<
  SeriesKey,
  { label: string; color: string; noun: string }
> = {
  conversations: {
    label: "Health chats",
    color: "var(--brand)",
    noun: "conversations",
  },
  users: { label: "Signups", color: "var(--sky)", noun: "accounts" },
  facilities: {
    label: "Facilities",
    color: "var(--caution)",
    noun: "listings",
  },
};

export function ActivityAreaChart({
  series,
}: {
  series: AdminOverviewSeriesPoint[];
}) {
  const [metric, setMetric] = useState<SeriesKey>("conversations");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const gradId = useId();

  const meta = SERIES_META[metric];
  const values = series.map((d) => d[metric]);
  const total14d = values.reduce((acc, n) => acc + n, 0);
  const max = Math.max(...values, 1);

  const w = 640;
  const h = 190;
  const padX = 14;
  const padY = 16;

  const pts = series.map((d, i) => {
    const x =
      series.length > 1
        ? padX + (i / (series.length - 1)) * (w - padX * 2)
        : w / 2;
    const y = h - padY - (d[metric] / max) * (h - padY * 2);
    return { x, y, date: d.date, val: d[metric] };
  });

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = pts.length
    ? `${line} L${pts[pts.length - 1].x.toFixed(1)},${h - padY} L${pts[0].x.toFixed(1)},${h - padY} Z`
    : "";

  const activePoint =
    hoverIdx !== null && pts[hoverIdx] ? pts[hoverIdx] : pts[pts.length - 1];

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pts.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * w;
    let closest = 0;
    let best = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dist = Math.abs(pts[i].x - relX);
      if (dist < best) {
        best = dist;
        closest = i;
      }
    }
    setHoverIdx(closest);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="adm-micro text-[11px] font-semibold uppercase text-muted">
            14-day velocity
          </p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="adm-kpi font-display text-2xl font-semibold text-ink">
              {total14d.toLocaleString("en-NG")}
            </span>
            <span className="adm-caption text-xs text-muted">
              {meta.noun} in last 14 days
            </span>
          </div>
        </div>
        <SegmentedControl<SeriesKey>
          ariaLabel="Activity series"
          size="sm"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "conversations", label: "Chats" },
            { value: "users", label: "Signups" },
            { value: "facilities", label: "Facilities" },
          ]}
        />
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-48 w-full touch-pan-y select-none overflow-visible"
          role="img"
          aria-label={`14-day chart for ${meta.label}: total ${total14d}`}
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((t) => {
            const y = h - padY - t * (h - padY * 2);
            return (
              <line
                key={t}
                x1={padX}
                y1={y}
                x2={w - padX}
                y2={y}
                stroke="var(--line)"
                strokeOpacity="0.55"
                strokeDasharray="3 4"
              />
            );
          })}

          {area && <path d={area} fill={`url(#${gradId})`} />}
          {line && (
            <path
              d={line}
              fill="none"
              stroke={meta.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1={padY}
                x2={activePoint.x}
                y2={h - padY}
                stroke={meta.color}
                strokeOpacity="0.45"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="var(--surface)"
                stroke={meta.color}
                strokeWidth="2.5"
              />
            </>
          )}
        </svg>

        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>
            {series[0]?.date
              ? new Date(series[0].date).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          {activePoint && (
            <span className="tabular rounded-full border border-line bg-surface/90 px-2.5 py-0.5 font-medium text-ink">
              {new Date(activePoint.date).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
              })}
              {" · "}
              <strong className="font-semibold">{activePoint.val}</strong>{" "}
              {meta.noun}
            </span>
          )}
          <span>
            {series[series.length - 1]?.date
              ? new Date(series[series.length - 1].date).toLocaleDateString(
                  "en-NG",
                  { month: "short", day: "numeric" },
                )
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface PipelineSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

export function PipelineBarChart({
  title,
  segments,
}: {
  title: string;
  segments: PipelineSegment[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <span className="tabular text-xs text-muted">
          {total.toLocaleString("en-NG")} total
        </span>
      </div>
      <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-mist">
        {total === 0 ? (
          <div className="h-full w-full bg-line/60" />
        ) : (
          segments.map((seg) => {
            const pct = (seg.value / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={seg.key}
                title={`${seg.label}: ${seg.value}`}
                className="h-full transition-[width] duration-500 ease-[var(--ease-out)]"
                style={{ width: `${pct}%`, background: seg.color }}
              />
            );
          })
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: seg.color }}
              aria-hidden
            />
            <span className="truncate text-muted">{seg.label}</span>
            <span className="tabular ml-auto font-semibold text-ink">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
