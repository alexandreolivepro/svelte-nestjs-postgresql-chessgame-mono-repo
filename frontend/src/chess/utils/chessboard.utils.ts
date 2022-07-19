import { PieceColor } from "../enums/piece-color.enum";
import type { Move } from "../models/move.model";
import type { ChessPiece } from "../models/pieces/chess-piece.model";

import type { BoardLetters, Position } from "../models/position.model";

export function transformLetterToNumber(positionLetter: BoardLetters): number {
    return 'abcdefgh'.search(positionLetter);
}

export function getOppositeColor(color: PieceColor) {
    return color === PieceColor.BLACK ? PieceColor.WHITE : PieceColor.BLACK;
}

/**
 * If the position finish by 0 or 9 it's not a valid position on the board
 * @param position The position to calculate
 * @returns true if the position is not a valid position
 */
export function isPositionOutsideBoundaries(position: Position): boolean {
    return ["0", "9"].includes(position.toString()[1]);
}

export function hasPieceOnPosition(pieces: ChessPiece[], destination: Position, color: PieceColor) {
    return pieces.find((piece) => piece.position === destination && piece.color !== getOppositeColor(color));
}

export function hasAlreadyMoved(piece: ChessPiece, moves: Move[]): boolean {
    return !!moves.find((move) => move.piece.color === piece.color && move.piece.type === piece.type);
}

/**
     * Calculate the available movement for the bishop for a given side (left or right) based on the bishop position
     * @param pieces The list of pieces on the board
     * @param movementValuesBySide The bishop moves in diagonal so we give the movement values for the diagonal by side
     * @param numberOfAvailableColumnBySide The number of column till the end of the board for a side
     * @returns 
     */
export function getAvailableMovesBySide(pieces: ChessPiece[], movementValuesBySide: number[], startingPosition: Position, color: PieceColor): Position[] {
    const availableMoves = [];
    movementValuesBySide.forEach((move) => {
        let position = startingPosition;
        [...Array(8).keys()].every(() => {
            position = (position + move) as Position;
            // If the position is out of boundaries or we encounter a piece of the same color
            if (isPositionOutsideBoundaries(position)
                || hasPieceOnPosition(pieces, position, color)) {
                return false;
            }
            // As long as the bishop doesn't encounter his own piece we add position
            availableMoves.push(position);
            // If the last added piece is an enemy piece, we break the loop because the bishop cannot go further
            if (pieces.find((piece) => piece.position === position && piece.color === getOppositeColor(color))) {
                return false;
            }
            return true;
        });
    });
    return availableMoves;
}

export function getLastDigitOfPosition(position: Position): string {
    return position?.toString()[1];
}