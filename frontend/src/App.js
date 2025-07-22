import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

function App() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen]   = useState(game.fen());

  // 동기 콜백: 즉시 true/false 리턴
  const onPieceDrop = (source, target) => {
    const g = new Chess(game.fen());
    const move = g.move({ from: source, to: target, promotion: "q" });
    if (!move) return false;    // 불가능한 수면 false

    // 로컬 state 바로 업데이트
    setGame(g);
    setFen(g.fen());

    // --- 여기서부터 비동기 엔진 호출 ---
    fetch("http://localhost:8000/bestmove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: g.fen() }),
    })
      .then(res => res.json())
      .then(data => {
        const g2 = new Chess(g.fen());
        g2.move(data.move);
        setGame(g2);
        setFen(g2.fen());
      })
      .catch(err => console.error("엔진 호출 에러:", err));

    return true;  // 드롭 허용
  };

  return (
    <div style={{ width: 400, margin: "auto", paddingTop: 20 }}>
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        arePiecesDraggable={true}  // 드래그 허용
      />
    </div>
  );
}

export default App;
