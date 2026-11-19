import { useLayoutEffect, useRef } from 'react';

export default function AppDialog({ titleId, onDismiss, children, className = '' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={`app-dialog ${className}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClick={event => { if (event.target === event.currentTarget) onDismiss(); }}>
    <div className="modal-box">{children}</div>
  </dialog>;
}
