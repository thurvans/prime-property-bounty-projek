export function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, '');
}

export function compactObject(value) {
  return JSON.parse(JSON.stringify(value));
}

export function diffObjects(before, after) {
  const changes = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  keys.forEach((key) => {
    if (['updated_at'].includes(key)) return;
    const oldValue = JSON.stringify(before?.[key] ?? null);
    const newValue = JSON.stringify(after?.[key] ?? null);
    if (oldValue !== newValue) {
      changes[key] = {
        before: before?.[key] ?? null,
        after: after?.[key] ?? null
      };
    }
  });

  return changes;
}
