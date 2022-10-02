import { PieceType } from '../../enums/piece-type.enum';
import {
	filterAvailableMovesIfKingIsChecked,
	getBoardWithoutPiece,
	hasPieceOnPosition,
	isCheckWithoutPieceOnBoard,
	isPositionOutsideBoundaries
} from '../../utils/chessboard.utils';
import type { Move } from '../move.model';
import type { Position } from '../position.model';
import type { ChessPiece } from './chess-piece.model';
import { ChessPieceAbstract } from './chess-piece.model';

export class Knight extends ChessPieceAbstract {
	readonly type = PieceType.KNIGHT;

	getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
		const possibleDestination = [12, -8, -12, 8, -19, 21, 19, -21].map(
			(modifier) => (this.position + modifier) as Position
		);

		let availableMoves = possibleDestination.filter(
			(destination) =>
				!hasPieceOnPosition(pieces, destination, this.color) &&
				!isPositionOutsideBoundaries(destination)
		);
		if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
			// If the piece is locked in place, we only allow moves that protect the king
			availableMoves = filterAvailableMovesIfKingIsChecked(
				getBoardWithoutPiece(pieces, this),
				this,
				availableMoves
			);
		}
		return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
	}

	getPositionBetweenPieceAndOpponentKing(king: ChessPiece, availableMoves: Position[]): Position[] {
		return [this.position];
	}
}
