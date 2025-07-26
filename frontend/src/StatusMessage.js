import React from 'react';

export default function StatusMessage({ status }) {
  if (!status) return null;
  return (
    <div style={{ marginTop: 10, textAlign: 'center', fontWeight: 'bold' }}>
      {status}
    </div>
  );
}
