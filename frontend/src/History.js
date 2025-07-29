import React from 'react';

export default function History({ history }) {
  return (
    <div style={{ marginTop: 20, maxHeight: '350px', overflowY: history.length > 15 ? 'auto' : 'visible' }}>
      <h3>수 기록</h3>
      <ol style={{ listStyle: 'decimal inside', margin: 0, padding: '0 1em' }}>
        {history.map((mv, idx) => (
          <li key={idx} style={{ marginBottom: '0.5em' }}>
            {mv}
          </li>
        ))}
      </ol>
    </div>
  );
}
