import React from 'react';

export default function History({ history }) {
  return (
    <div className="history-list">
      <h3>수 기록</h3>
      <ol>
        {history.map((mv, idx) => (
          <li key={idx}>
            {mv}
          </li>
        ))}
        {history.length === 0 && <li className="muted">아직 둔 수가 없습니다.</li>}
      </ol>
    </div>
  );
}
