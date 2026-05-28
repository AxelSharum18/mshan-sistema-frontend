import React from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '520px' }) => {
  if (!isOpen) return null;

  return (
    // Full-screen fixed backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Modal card — stop click propagation so clicking inside doesn't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          color: '#1a1a1a',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#1a1a1a' }}>
            {title}
          </h5>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              lineHeight: 1,
              cursor: 'pointer',
              color: '#888',
              padding: '0 4px',
            }}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', color: '#1a1a1a' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
