import { PieceType } from '../../enums/piece-type.enum';
import {
	filterAvailableMovesIfKingIsChecked,
	getAvailableMovesBySide,
	getBoardWithoutPiece,
	getDiagonalBetweenTwoPiece,
	isCheckWithoutPieceOnBoard
} from '../../utils/chessboard.utils';
import type { Move } from '../move.model';
import type { Position } from '../position.model';
import type { ChessPiece } from './chess-piece.model';
import { ChessPieceAbstract } from './chess-piece.model';

export class Bishop extends ChessPieceAbstract {
	readonly type = PieceType.BISHOP;

	getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
		let availableMoves = getAvailableMovesBySide(
			pieces,
			[9, 11, -9, -11],
			this.position,
			this.color
		);

		// We remove all the availableMoves that does not protect the king is it is checked
		availableMoves = filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);

		if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
			// If the piece is locked in place, we only allow moves that protect the king
			availableMoves = filterAvailableMovesIfKingIsChecked(
				getBoardWithoutPiece(pieces, this),
				this,
				availableMoves
			);
		}

		return availableMoves;
	}

	getPositionBetweenPieceAndOpponentKing(king: ChessPiece, availableMoves: Position[]): Position[] {
		return getDiagonalBetweenTwoPiece(king, this);
	}
}
