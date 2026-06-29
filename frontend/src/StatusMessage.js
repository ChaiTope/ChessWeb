import React from 'react';

export default function StatusMessage({ status }) {
  if (!status) return null;
  return (
    <div className="status-message">
      {status}
    </div>
  );
}
