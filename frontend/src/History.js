import React from 'react';

export default function History({ history }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>수 기록</h3>
      <ol>
        {history.map((mv, idx) => (
          <li key={idx}>{mv}</li>
        ))}
      </ol>
    </div>
  );
}