import type { ChessPiece } from './pieces/chess-piece.model';
import type { Position } from './position.model';

export interface Move {
	piece: ChessPiece;
	start: Position;
	end: Position;
}
