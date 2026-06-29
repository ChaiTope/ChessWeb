import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function Board({
  fen,
  width,
  orientation,
  squareStyles,
  arrows,
  onPieceDrop,
  onSquareClick,
  onPieceClick,
  canDragPiece,
}) {
  return (
    <div style={{ width, maxWidth: '100%' }}>
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          squareStyles,
          arrows,
          arrowOptions: {
            color: 'rgba(18, 113, 91, 0.72)',
            secondaryColor: 'rgba(18, 113, 91, 0.72)',
            tertiaryColor: 'rgba(18, 113, 91, 0.72)',
            opacity: 0.72,
            activeOpacity: 0.72,
            arrowWidthDenominator: 24,
            arrowLengthReducerDenominator: 8,
            sameTargetArrowLengthReducerDenominator: 4,
            activeArrowWidthMultiplier: 1,
          },
          allowDrawingArrows: false,
          clearArrowsOnClick: false,
          canDragPiece,
          onPieceDrop,
          onSquareClick,
          onPieceClick,
        }}
      />
    </div>
  );
}
