import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function Board({ fen, onPieceDrop }) {
  return (
    <Chessboard
      options={{
        position: fen,
        boardWidth: 400,
        arePiecesDraggable: true,
        onPieceDrop,
      }}
    />
  );
}