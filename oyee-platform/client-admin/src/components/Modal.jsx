import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="mo open">
      <div className="mb">
        <div className="mh">
          <div className="mt">{title}</div>
          <button className="mcl" onClick={onClose}>✕</button>
        </div>
        <div className="mbd">{children}</div>
        {footer && <div className="mft">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;