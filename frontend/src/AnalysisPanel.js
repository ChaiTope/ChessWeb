import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalysisPanel({ engine, fen }) {
  const [suggestions, setSuggestions] = useState([]);
  const [evalHistory, setEvalHistory] = useState([]);

  useEffect(() => {
    if (!engine) return;
    engine.postMessage('position fen ' + fen);
    engine.postMessage('go depth 15 multi pv 3');

    const handleMessage = (event) => {
      const line = event.data || event;
      if (typeof line !== 'string') return;
      if (line.startsWith('info depth')) {
        const parts = line.split(' ');
        const cpIndex = parts.indexOf('cp');
        const evalCp = cpIndex > -1 ? parseInt(parts[cpIndex + 1], 10) : null;
        const pvIndex = parts.indexOf('pv');
        if (pvIndex > -1) {
          const pvMoves = parts.slice(pvIndex + 1, pvIndex + 4);
          setSuggestions(pvMoves.map((m, i) => ({ move: m, eval: evalCp, rank: i + 1 })));
          setEvalHistory((hist) => [
            ...hist,
            { step: hist.length, eval: evalCp },
          ]);
        }
      }
    };

    engine.addEventListener('message', handleMessage);
    return () => engine.removeEventListener('message', handleMessage);
  }, [engine, fen]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>엔진 추천수</h3>
      <ul>
        {suggestions.map(({ move, eval: ev, rank }) => (
          <li key={rank}>
            {rank}. {move} ({ev >= 0 ? '+' : ''}{(ev / 100).toFixed(2)})
          </li>
        ))}
      </ul>

      <h3>평가 그래프</h3>
      <LineChart width={250} height={200} data={evalHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="step" label={{ value: '검색 순서', position: 'insideBottom', offset: -5 }} />
        <YAxis domain={[dataMin => dataMin - 1, dataMax => dataMax + 1]} />
        <Tooltip />
        <Line type="monotone" dataKey="eval" dot={false} />
      </LineChart>
    </div>
  );
}