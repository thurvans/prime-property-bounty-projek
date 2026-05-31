export default function MultiSelect({ label, icon, options, value, onChange }) {
  const selected = new Set(value || []);

  function toggle(option) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange([...next]);
  }

  return (
    <details className="relative">
      <summary className="flex h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold">
        <span className="truncate">
          {icon && <i className={`fa-solid ${icon} mr-2 text-prime-gold`} />}
          {label}
        </span>
        <span className="flex items-center gap-2">
          {!!selected.size && <span className="rounded bg-prime-gold/20 px-2 py-0.5 text-xs">{selected.size}</span>}
          <i className="fa-solid fa-chevron-down text-xs text-prime-black/45" />
        </span>
      </summary>
      <div className="absolute z-30 mt-2 max-h-72 w-64 overflow-auto rounded-md border border-black/10 bg-white p-2 shadow-soft">
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return (
            <label key={item.value} className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-prime-gray">
              <input
                type="checkbox"
                checked={selected.has(item.value)}
                onChange={() => toggle(item.value)}
                className="h-4 w-4 accent-prime-gold"
              />
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
    </details>
  );
}
