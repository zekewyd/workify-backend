function toManila(date = new Date()) {
  const utc = date.getTime();
  const offsetMs = 8 * 60 * 60 * 1000; // UTC+8
  const local = new Date(utc + offsetMs);

  const y = local.getUTCFullYear();
  const m = local.getUTCMonth() + 1;
  const d = local.getUTCDate();

  return {
    date: local,
    y,
    m,
    d,
    ymd: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  };
}

function manilaStartEndOfDay(date = new Date()) {
  const { y, m, d } = toManila(date);

  // 00:00 Manila = 16:00 previous day UTC
  const startLocal = Date.UTC(y, m - 1, d, -8, 0, 0, 0);
  // 23:59:59.999 Manila = 15:59:59.999 UTC
  const endLocal = Date.UTC(y, m - 1, d, 15, 59, 59, 999);

  return { startUtc: new Date(startLocal), endUtc: new Date(endLocal) };
}

module.exports = {
  toManila,
  manilaStartEndOfDay,
};
