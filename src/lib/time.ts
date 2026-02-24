export function addDuration(base: Date, duration: string): Date {
  const regex = /^(\d+)([mhd])$/;
  const match = duration.match(regex);
  if (!match) {
    return new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs = unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return new Date(base.getTime() + amount * unitMs);
}
