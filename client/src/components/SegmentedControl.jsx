export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div>
      {label && <p className="mb-1 text-xs font-bold uppercase tracking-normal text-prime-black/55">{label}</p>}
      <div className="grid grid-cols-3 rounded-md border border-black/10 bg-white p-1">
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`h-8 rounded text-xs font-bold transition ${
              value === item.value ? 'bg-prime-black text-white' : 'text-prime-black/65 hover:bg-prime-gray'
            }`}
          >
            {item.label}
          </button>
          );
        })}
      </div>
    </div>
  );
}
