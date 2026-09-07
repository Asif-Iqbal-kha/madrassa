import React from 'react';

export default function FitwatPage() {
  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'var(--color-bg-alt, #F7F7F7)',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '50px 36px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--color-border-light, #E5E5E5)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-urdu, inherit)',
            fontSize: '3.2rem',
            fontWeight: 'bold',
            color: 'var(--color-primary, #1A2B42)',
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          زیر تعمیر
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-urdu, inherit)',
            fontSize: '1.6rem',
            color: 'var(--color-text-secondary, #4A4A4A)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          یہ صفحہ زیر تعمیر ہے۔
        </p>
      </div>
    </div>
  );
}
