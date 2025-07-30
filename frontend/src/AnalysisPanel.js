// src/AnalysisPanel.js
import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AnalysisPanel({ engine, fen, depth }) {
  const [suggestions, setSuggestions] = useState([null, null, null]);
  const [evalHistory, setEvalHistory] = useState([]);

  useEffect(() => {
    if (!engine) return;

    // 새로운 위치/깊이마다 초기화
    setSuggestions([null, null, null]);
    setEvalHistory([]);

    engine.postMessage('uci');
    engine.postMessage('setoption name MultiPV value 3');
    engine.postMessage('position fen ' + fen);
    engine.postMessage(`go depth ${depth}`);

    const handler = (event) => {
      const line = (event.data || event).toString();
      if (!line.startsWith('info depth')) return;

      const parts = line.split(/\s+/);
      const d      = parseInt(parts[2], 10);
      const cpIdx  = parts.indexOf('cp');
      const cp     = cpIdx > -1 ? parseInt(parts[cpIdx + 1], 10) : null;
      const mpIdx  = parts.indexOf('multipv');
      const rank   = mpIdx > -1 ? parseInt(parts[mpIdx + 1], 10) : 1;
      const pvIdx  = parts.indexOf('pv');
      const uci    = pvIdx > -1 ? parts[pvIdx + 1] : null;
      if (isNaN(d) || cp === null || !uci || rank < 1 || rank > 3) return;

      // **Chess.js 인스턴스 생성**
      const tmp = new Chess(fen);

      // **1) 합법 수 체크**: uci가 legal UCI list에 있으면 적용
      const legalMoves = tmp.moves({ verbose: true }).map(m => m.from + m.to + (m.promotion||''));
      if (!legalMoves.includes(uci)) {
        // 사용자 두기 전 혹은 위치가 바뀐 뒤 들어온 메시지라면 무시
        return;
      }

      // **2) tmp.move()는 이제 안전**
      const mobj = tmp.move({
        from: uci.slice(0, 2),
        to:   uci.slice(2, 4),
        promotion: 'q',
      });
      const san = mobj?.san || uci;

      // 후보 수 저장
      setSuggestions(prev => {
        const next = [...prev];
        next[rank - 1] = { rank, san, cp };
        return next;
      });

      // centi-pawn → 흑 승률 변환
      const whiteWin = 1 / (1 + Math.pow(10, -cp / 400)) * 100;
      const blackWin = 100 - whiteWin;
      setEvalHistory(hist => {
        const last = hist[hist.length - 1];
        if (last?.depth === d) {
          // 같은 depth 중복 방지
          return [...hist.slice(0, -1), { depth: d, blackWin: Number(blackWin.toFixed(1)) }];
        }
        return [...hist, { depth: d, blackWin: Number(blackWin.toFixed(1)) }];
      });
    };

    engine.addEventListener('message', handler);
    return () => engine.removeEventListener('message', handler);
  }, [engine, fen, depth]);

  // 렌더링
  return (
    <div style={{ marginTop: 20 }}>
      <h3>엔진 추천수 (1~3순위)</h3>
      <ul>
        {suggestions.map((s, i) =>
          s ? (
            <li key={i}>
              {s.rank}. {s.san} ({s.cp >= 0 ? '+' : ''}{s.cp})
            </li>
          ) : (
            <li key={i} style={{ opacity: 0.5 }}>
              {i+1}. —
            </li>
          )
        )}
      </ul>

      <h3>흑 승률 평가 그래프 (Depth)</h3>
      {evalHistory.length > 0 ? (
        <LineChart width={300} height={200} data={evalHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="depth" label={{ value: 'Depth', position: 'insideBottom', offset: -5 }} />
          <YAxis domain={[100, 0]} allowDataOverflow label={{ value: 'Black Win %', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={val => `${val}%`} />
          <Line type="monotone" dataKey="blackWin" dot={false} />
        </LineChart>
      ) : (
        <div>분석 중...</div>
      )}
    </div>
  );
}
