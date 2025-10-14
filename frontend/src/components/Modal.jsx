import React from 'react'

export default function Modal({title, children, onClose, onConfirm, confirmText='OK'}){
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h4>{title}</h4>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          {onConfirm && <button className="btn primary" onClick={onConfirm}>{confirmText}</button>}
        </div>
      </div>
    </div>
  )
}
