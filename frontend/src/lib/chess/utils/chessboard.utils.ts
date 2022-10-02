import { range, sliceArray } from '../../utils';
import { PieceColor } from '../enums/piece-color.enum';
import { PieceType } from '../enums/piece-type.enum';
import { CheckStatus } from '../models/game-store.model';
import type { Move } from '../models/move.model';
import { Bishop } from '../models/pieces/bishop.model';
import type { ChessPiece } from '../models/pieces/chess-piece.model';
import King from '../models/pieces/king.model';
import { Knight } from '../models/pieces/knight.model';
import { Pawn } from '../models/pieces/pawn.model';
import { Queen } from '../models/pieces/queen.model';
import { Rook, type RookName } from '../models/pieces/rook.model';

import type { Position } from '../models/position.model';

export function getOppositeColor(color: PieceColor) {
	return color === PieceColor.BLACK ? PieceColor.WHITE : PieceColor.BLACK;
}

/**
 * If the position finish by 0 or 9 it's not a valid position on the board
 * @param position The position to calculate
 * @returns true if the position is not a valid position
 */
export function isPositionOutsideBoundaries(position: number): boolean {
	return ['0', '9'].includes(position.toString()[1]) || position < 11 || position > 88;
}

export function hasPieceOnPosition(
	pieces: ChessPiece[],
	destination: Position,
	color: PieceColor
): boolean {
	return pieces.some(
		(piece) => piece.position === destination && piece.color !== getOppositeColor(color)
	);
}

export function hasAlreadyMoved(piece: ChessPiece, moves: Move[]): boolean {
	return moves.some((move) => move.piece.color === piece.color && move.piece.type === piece.type);
}

/**
 * Calculate the available movement for a given side (left or right)
 * @param pieces The list of pieces on the board
 * @param movementValuesBySide The pieces move by a given value, for exemple going straight up is +1 or straight right is +10. This is an array of all the possible movement for a piece
 * @param startingPosition The position of the piece
 * @param color the color of the piece
 * @param distance the distance the piece can travel (default is 8 because it's the maximum any piece can travel)
 * @returns
 */
export function getAvailableMovesBySide(
	pieces: ChessPiece[],
	movementValuesBySide: number[],
	startingPosition: Position,
	color: PieceColor,
	distance = 8
): Position[] {
	const availableMoves: Position[] = [];
	movementValuesBySide.forEach((move) => {
		let position = startingPosition;
		[...Array(distance).keys()].every(() => {
			position = (position + move) as Position;
			// If the position is out of boundaries or we encounter a piece of the same color
			if (isPositionOutsideBoundaries(position) || hasPieceOnPosition(pieces, position, color)) {
				return false;
			}
			// As long as the piece doesn't encounter his own piece we add position
			availableMoves.push(position);
			// If the last added piece is an enemy piece, we break the loop because the piece cannot go further
			if (
				pieces.find(
					(piece) => piece.position === position && piece.color === getOppositeColor(color)
				)
			) {
				return false;
			}
			return true;
		});
	});
	return availableMoves;
}

export function getDiagonalBetweenTwoPiece(firstPiece: ChessPiece, secondPiece: ChessPiece) {
	const rangeFromBishopPosition = [-9, 9, 11, -11].map((modifier) =>
		range(secondPiece.position, 8, modifier).filter(
			(value) => !isPositionOutsideBoundaries(value as Position)
		)
	);
	const diagonal = rangeFromBishopPosition
		.filter((listePositionByDiagonal) => {
			return listePositionByDiagonal.find((position) => position === firstPiece.position);
		})
		.flat();

	return diagonal.filter((position) => {
		if (firstPiece.position < secondPiece.position) {
			return position > firstPiece.position && position <= secondPiece.position;
		}
		return position < firstPiece.position && position >= secondPiece.position;
	}) as Position[];
}

export function getStraigthLineBetweenTwoPieces(firstPiece: ChessPiece, secondPiece: ChessPiece) {
	const highValue =
		secondPiece.position < firstPiece.position ? firstPiece.position : secondPiece.position;
	const lowValue =
		secondPiece.position < firstPiece.position ? secondPiece.position : firstPiece.position;
	let modifier = 1;
	let length = highValue - lowValue;

	if (
		getLastDigitOfPosition(secondPiece.position) === getLastDigitOfPosition(firstPiece.position)
	) {
		modifier = 10;
		length = +getFirstDigitOfPosition(highValue) - +getFirstDigitOfPosition(lowValue);
	}
	return (range(lowValue, length + 1, modifier) as Position[]).filter(
		(value) => !isPositionOutsideBoundaries(value)
	);
}

export function getLastDigitOfPosition(position: Position): string {
	return position?.toString()[1];
}

export function getFirstDigitOfPosition(position: Position): string {
	return position?.toString()[0];
}

export function getPieceAttackingTheKing(king: ChessPiece, board: ChessPiece[]) {
	const opponents = board.filter((piece) => piece.color === getOppositeColor(king.color));

	return opponents.filter((piece) => piece.availableMoves.some((move) => move === king.position));
}

export function filterAvailableMovesIfKingIsChecked(
	board: ChessPiece[],
	currentPiece: ChessPiece,
	availableMoves: Position[]
) {
	const [king] = board.filter(
		(piece) => piece.type === PieceType.KING && piece.color === currentPiece.color
	);
	const piecesAttackingTheKing = getPieceAttackingTheKing(king, board);

	if (piecesAttackingTheKing.length > 1) {
		return [];
	} else if (piecesAttackingTheKing.length === 1) {
		const [pieceAttackingTheKing] = piecesAttackingTheKing;

		const onlyPossiblePosition = pieceAttackingTheKing.getPositionBetweenPieceAndOpponentKing(
			king,
			availableMoves
		);
		return availableMoves.filter(
			(move) => !!onlyPossiblePosition.find((position) => position === move)
		);
	}
	return availableMoves;
}

export function getBoardWithoutPiece(board: ChessPiece[], pieceToRemove: ChessPiece): ChessPiece[] {
	const pieceIndex = board.findIndex((piece) => piece.position === pieceToRemove.position);
	return sliceArray<ChessPiece>([...board], pieceIndex);
}

/**
 * Check if the king is under attack if a piece is not on the board to see if the piece is pinned
 * @param board The current board of pieces
 * @param pieceToCheck The piece to check if it's pinned
 * @returns
 */
export function isCheckWithoutPieceOnBoard(board: ChessPiece[], pieceToCheck: ChessPiece): boolean {
	const [king] = board.filter(
		(piece) => piece.type === PieceType.KING && piece.color === pieceToCheck.color
	);
	const boardWithoutPiece = getBoardWithoutPiece(board, pieceToCheck);
	const pieceAttackingTheKing = getPieceAttackingTheKing(
		king,
		boardWithoutPiece.map((piece) => {
			piece.availableMoves = piece.getAvailablePositions(boardWithoutPiece, [], false);
			return piece;
		})
	);
	return pieceAttackingTheKing.length > 0;
}

export function getCheckStatus(board: ChessPiece[], colorToPlay: PieceColor): CheckStatus | null {
	const king = board.find(
		(piece) => piece.type === PieceType.KING && piece.color === colorToPlay
	) as King;
	const pieceAttackingTheKing = getPieceAttackingTheKing(king, board);
	const pieceCanPlay = board.filter(
		(piece) =>
			piece.color === colorToPlay &&
			piece.availableMoves.length > 0 &&
			piece.type !== PieceType.KING
	);
	const allPieceMovement = pieceCanPlay
		.map((piece) => piece.availableMoves)
		.concat(king.getAvailablePositions(board, [], true))
		.flat();
	if (pieceAttackingTheKing.length > 0) {
		return allPieceMovement.length === 0 ? CheckStatus.CHECKMATE : CheckStatus.CHECK;
	} else if (pieceAttackingTheKing.length === 0 && allPieceMovement.length === 0) {
		return CheckStatus.STALEMATE;
	}
	return null;
}

export function getBoardWithNewInstance(board: ChessPiece[]): ChessPiece[] {
	return board.map((piece) => {
		if (piece.type === PieceType.ROOK) {
			return pieceFactory(piece.type, piece.position, piece.color, piece.name);
		}
		return pieceFactory(piece.type, piece.position, piece.color);
	});
}

export function pieceFactory(
	type: PieceType,
	position: Position,
	color: PieceColor,
	name?: RookName
): King | Queen | Bishop | Pawn | Rook | Knight {
	switch (type) {
		case PieceType.BISHOP: {
			return new Bishop(color, position);
		}
		case PieceType.QUEEN: {
			return new Queen(color, position);
		}
		case PieceType.KING: {
			return new King(color, position);
		}
		case PieceType.PAWN: {
			return new Pawn(color, position);
		}
		case PieceType.ROOK: {
			return new Rook(color, position, name as RookName);
		}
		case PieceType.KNIGHT: {
			return new Knight(color, position);
		}
		default: {
			throw new Error('Type should be a PieceType');
		}
	}
}
