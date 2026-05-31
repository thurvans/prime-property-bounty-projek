export default function Modal({ title, children, onClose, width = 'max-w-3xl' }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4">
      <div className={`max-h-[92vh] w-full ${width} overflow-hidden rounded-md bg-white shadow-soft`}>
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md hover:bg-prime-gray" aria-label="Tutup">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-66px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
