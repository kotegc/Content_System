import React, { useCallback, useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { PatchEvent, set } from "sanity";
import { useClient } from "sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityClient } from "@sanity/client";

type ImgRef = { _type: "reference"; _ref: string };
type ImgVal = { _type: "image"; asset: ImgRef; alt?: string };

export type Item = {
  _key: string;
  image: ImgVal;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Props = {
  value?: Item[];
  onChange: (evt: PatchEvent) => void;
};

const GRID = 8;
const CELL = 56; // Studio-only visual size (Astro will decide real sizing)
const CANVAS = GRID * CELL;

/* -----------------------------
   Small helpers
----------------------------- */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toUnits(px: number) {
  return Math.round(px / CELL);
}

function toPx(units: number) {
  return units * CELL;
}

function withinBounds(x: number, y: number, w: number, h: number) {
  return x >= 0 && y >= 0 && x + w <= GRID && y + h <= GRID;
}

function rectCells(x: number, y: number, w: number, h: number) {
  const cells: string[] = [];
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      cells.push(`${xx},${yy}`);
    }
  }
  return cells;
}

function buildOccupied(items: Item[], excludeKey?: string) {
  const occ = new Set<string>();
  for (const it of items) {
    if (excludeKey && it._key === excludeKey) continue;
    for (const c of rectCells(it.x, it.y, it.w, it.h)) occ.add(c);
  }
  return occ;
}

function canPlace(items: Item[], key: string, next: { x: number; y: number; w: number; h: number }) {
  if (!withinBounds(next.x, next.y, next.w, next.h)) return false;
  const occ = buildOccupied(items, key);
  const cells = rectCells(next.x, next.y, next.w, next.h);
  return !cells.some((c) => occ.has(c));
}

function findFreeSpot(items: Item[], w: number, h: number) {
  for (let y = 0; y <= GRID - h; y++) {
    for (let x = 0; x <= GRID - w; x++) {
      if (canPlace(items, "__new__", { x, y, w, h })) return { x, y };
    }
  }
  return null;
}

function urlForImage(client: SanityClient, image: ImgVal) {
  const builder = imageUrlBuilder(client);
  return builder.image(image);
}

export default function DynaGridInput(props: Props) {
  const { value = [], onChange } = props;
  const client = useClient({ apiVersion: "2024-01-01" });

  // last valid state per item (for snap-back on invalid overlap)
  const lastGoodRef = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});

  const commit = useCallback(
    (next: Item[]) => onChange(PatchEvent.from(set(next))),
    [onChange]
  );

  const updateItem = useCallback(
    (key: string, patch: Partial<Item>) => {
      const next = value.map((it) => (it._key === key ? { ...it, ...patch } : it));
      commit(next);
    },
    [value, commit]
  );

  const removeItem = useCallback(
    (key: string) => {
      commit(value.filter((it) => it._key !== key));
      delete lastGoodRef.current[key];
    },
    [value, commit]
  );

  const handleDropFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const next: Item[] = [...value];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const asset = await client.assets.upload("image", file, { filename: file.name });

        const defaultW = 3;
        const defaultH = 3;
        const spot = findFreeSpot(next, defaultW, defaultH);
        if (!spot) continue; // grid is full; ignore extra drops

        const item: Item = {
          _key: crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
          },
          x: spot.x,
          y: spot.y,
          w: defaultW,
          h: defaultH,
        };

        next.push(item);
        lastGoodRef.current[item._key] = { x: item.x, y: item.y, w: item.w, h: item.h };
      }

      commit(next);
    },
    [client, value, commit]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await handleDropFiles(e.dataTransfer.files);
    },
    [handleDropFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const sorted = useMemo(() => value.slice(), [value]); // stable order (no z)

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={2}>
          <Text size={1}>
            Drag & drop images onto the 8×8 grid. Move by dragging. Resize from corners. <b>Overlaps are blocked.</b>
          </Text>
          <Flex gap={2}>
            <Button
              text="Clear all"
              tone="critical"
              mode="ghost"
              onClick={() => {
                commit([]);
                lastGoodRef.current = {};
              }}
              disabled={value.length === 0}
            />
          </Flex>
        </Stack>
      </Card>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          width: CANVAS,
          height: CANVAS,
          position: "relative",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL}px ${CELL}px`,
          backgroundColor: "rgba(0,0,0,0.02)",
        }}
      >
        {sorted.map((it) => {
          // prime last-good if missing
          if (!lastGoodRef.current[it._key]) {
            lastGoodRef.current[it._key] = { x: it.x, y: it.y, w: it.w, h: it.h };
          }

          const xPx = toPx(it.x);
          const yPx = toPx(it.y);
          const wPx = toPx(it.w);
          const hPx = toPx(it.h);

          const src = urlForImage(client as any, it.image).width(1200).quality(80).auto("format").url();

          return (
            <Rnd
              key={it._key}
              size={{ width: wPx, height: hPx }}
              position={{ x: xPx, y: yPx }}
              bounds="parent"
              dragGrid={[CELL, CELL]}
              resizeGrid={[CELL, CELL]}
              enableResizing={{
                top: false,
                right: false,
                bottom: false,
                left: false,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              onDragStop={(_, d) => {
                const xU = clamp(toUnits(d.x), 0, GRID - 1);
                const yU = clamp(toUnits(d.y), 0, GRID - 1);

                const next = { x: xU, y: yU, w: it.w, h: it.h };

                if (canPlace(value, it._key, next)) {
                  lastGoodRef.current[it._key] = next;
                  updateItem(it._key, next);
                } else {
                  const prev = lastGoodRef.current[it._key];
                  if (prev) updateItem(it._key, prev);
                }
              }}
              onResizeStop={(_, __, ref, ___, pos) => {
                const wU = clamp(toUnits(ref.offsetWidth), 1, GRID);
                const hU = clamp(toUnits(ref.offsetHeight), 1, GRID);
                const xU = clamp(toUnits(pos.x), 0, GRID - 1);
                const yU = clamp(toUnits(pos.y), 0, GRID - 1);

                const next = { x: xU, y: yU, w: wU, h: hU };

                if (canPlace(value, it._key, next)) {
                  lastGoodRef.current[it._key] = next;
                  updateItem(it._key, next);
                } else {
                  const prev = lastGoodRef.current[it._key];
                  if (prev) updateItem(it._key, prev);
                }
              }}
              style={{
                borderRadius: 6,
                boxShadow: "0 8px 30px rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255,255,255,0.7)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <img
                  src={src}
                  alt={it.image?.alt ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  draggable={false}
                />

                <button
                  type="button"
                  onClick={() => removeItem(it._key)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    background: "rgba(255,255,255,0.9)",
                    cursor: "pointer",
                    lineHeight: "20px",
                    fontSize: 14,
                  }}
                  aria-label="Remove image"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </Rnd>
          );
        })}
      </div>

      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1}>
          Stored values are in <b>grid units</b>: x/y are 0–7, w/h are 1–8. Overlap is blocked in Studio, so your render side stays sane.
        </Text>
      </Card>
    </Stack>
  );
}
