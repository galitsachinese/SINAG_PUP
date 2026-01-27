import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-4 sm:py-8"
      onClick={onClose}
    >
      {/* MODAL CONTENT */}
      <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
