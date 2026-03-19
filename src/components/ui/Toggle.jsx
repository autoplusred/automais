export default function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? 'var(--green)' : 'var(--muted2)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', flexShrink: 0,
        transition: 'background .2s', opacity: disabled ? .5 : 1,
      }}
      aria-checked={on} role="switch"
    >
      <span style={{
        position: 'absolute',
        top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        transition: 'left .2s',
        display: 'block',
      }} />
    </button>
  )
}
