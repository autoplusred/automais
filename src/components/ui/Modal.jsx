export default function Modal({ id, title, open, onClose, children, wide }) {
  if (!open) return null
  return (
    <div className="modal-bd open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 600 } : {}}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}
