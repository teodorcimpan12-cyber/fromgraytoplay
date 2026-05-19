export function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

export function anonymizeName(name: string | undefined | null): string {
  if (!name) return 'Anonim';
  const trimmed = name.trim();
  if (!trimmed) return 'Anonim';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ro-RO').format(n);
}

/** Haversine distance between two lat/lng pairs, in kilometres. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
