// src/AnalysisPanel.js
import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalysisPanel({ engine, fen }) {
  const [suggestions, setSuggestions] = useState([]);
  const [evalHistory, setEvalHistory] = useState([]);

  useEffect(() => {
    if (!engine) return;

    // 체스판 초기화용
    const board = new Chess(fen);

    engine.postMessage('position fen ' + fen);
    engine.postMessage('go depth 15 multi pv 3');

    const handleMessage = (event) => {
      const line = event.data?.toString() || event.toString();
      if (!line.startsWith('info depth')) return;

      const parts   = line.split(' ');
      const cpIndex = parts.indexOf('cp');
      const evalCp  = cpIndex > -1 ? parseInt(parts[cpIndex + 1], 10) : null;
      const pvIndex = parts.indexOf('pv');
      if (evalCp === null || pvIndex === -1) return;

      // UCI best-move 목록(e2e4 e7e5 …)
      const pvMoves = parts.slice(pvIndex + 1, pvIndex + 4);

      // 1) SAN 으로 변환
      const tmp = new Chess(fen);
      const newSuggestions = pvMoves.map((uci, i) => {
        const moveObj = tmp.move({
          from: uci.slice(0,2),
          to:   uci.slice(2,4),
          promotion: 'q',
        });
        return {
          rank: i+1,
          uci,
          san: moveObj?.san || uci,
          cp: evalCp,
        };
      });
      setSuggestions(newSuggestions);

      // 2) centi-pawn → 흑 승률(%) 변환
      //    whiteWin% = 1/(1+10^(-cp/400)) *100
      //    blackWin% = 100 - whiteWin%
      const whiteWin = 1 / (1 + Math.pow(10, -evalCp / 400)) * 100;
      const blackWin = 100 - whiteWin;

      setEvalHistory(hist => [
        ...hist,
        { step: hist.length + 1, blackWin: Number(blackWin.toFixed(1)) },
      ]);
    };

    engine.addEventListener('message', handleMessage);
    return () => engine.removeEventListener('message', handleMessage);
  }, [engine, fen]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>엔진 추천수 (SAN)</h3>
      <ul>
        {suggestions.map(({ rank, san, cp }) => (
          <li key={rank}>
            {rank}. {san} ({cp >= 0 ? '+' : ''}{cp})
          </li>
        ))}
      </ul>

      <h3>흑 승률 평가 그래프</h3>
      <LineChart width={300} height={200} data={evalHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="step"
          label={{ value: 'Info 순서', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          domain={[100, 0]}               /* 위가 100%, 아래가 0%로 고정 */
          allowDataOverflow={true}        /* 데이터가 범위 밖이어도 축은 고정 */
          label={{ value: 'Black Win %', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip formatter={(val) => `${val}%`} />
        <Line type="monotone" dataKey="blackWin" dot={false} />
      </LineChart>
    </div>
  );
}
