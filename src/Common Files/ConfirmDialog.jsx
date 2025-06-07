import React from 'react';

const ConfirmDialog = ({ show, onConfirm, onCancel, message }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          minWidth: '300px',
          textAlign: 'center',
        }}
      >
        <p>{message}</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: 'green',
              color: 'white',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
