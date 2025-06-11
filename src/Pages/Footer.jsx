import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111',
        color: '#fff',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        zIndex: 1000,
      }}
    >
      <div style={{ fontSize: '16px' }}>
        © {new Date().getFullYear()} Endless Vault
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <a
          href="https://www.instagram.com/endless_vault?igsh=MzYzaThzNDBkdWV4&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Instagram size={24} />
        </a>
        <a
          href="https://wa.me/918692030121"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
