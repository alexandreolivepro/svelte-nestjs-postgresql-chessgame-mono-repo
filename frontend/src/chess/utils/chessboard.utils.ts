import { range, sliceArray } from "../../shared/utils";
import { PieceColor } from "../enums/piece-color.enum";
import { PieceType } from "../enums/piece-type.enum";
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
export function isPositionOutsideBoundaries(position: number): boolean {
    return ["0", "9"].includes(position.toString()[1]) || position < 11 || position > 88;
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
export function getAvailableMovesBySide(pieces: ChessPiece[], movementValuesBySide: number[], startingPosition: Position, color: PieceColor, distance: number = 8): Position[] {
    const availableMoves = [];
    movementValuesBySide.forEach((move) => {
        let position = startingPosition;
        [...Array(distance).keys()].every(() => {
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

export function getDiagonalBetweenTwoPiece(firstPiece: ChessPiece, secondPiece: ChessPiece) {
    const rangeFromBishopPosition = [-9, 9, 11, -11].map((modifier) => range(secondPiece.position, 8, modifier).filter((value) => !isPositionOutsideBoundaries(value as Position)));
    const diagonal = rangeFromBishopPosition.filter((listePositionByDiagonal) => {
        return listePositionByDiagonal.find((position) => position === firstPiece.position);
    }).flat();

    return diagonal.filter((position) => {
        if (firstPiece.position < secondPiece.position) {
            return position > firstPiece.position && position <= secondPiece.position;
        }
        return position < firstPiece.position && position >= secondPiece.position;
    }) as Position[];
}

export function getStraigthLineBetweenTwoPieces(firstPiece: ChessPiece, secondPiece: ChessPiece) {
    let modifier = getLastDigitOfPosition(secondPiece.position) === getLastDigitOfPosition(firstPiece.position) ? 10 : 1;
    return secondPiece.position < firstPiece.position
        ? range(secondPiece.position,  firstPiece.position - 1 - secondPiece.position, modifier) as Position[]
        : range(firstPiece.position, secondPiece.position - firstPiece.position -1, modifier) as Position[];
}

export function getLastDigitOfPosition(position: Position): string {
    return position?.toString()[1];
}

export function getFirstDigitOfPosition(position: Position): string {
    return position?.toString()[0];
}

export function getPieceAttackingTheKing(king: ChessPiece, board: ChessPiece[]) {
    const opponents = board.filter(
        (piece) => piece.color === getOppositeColor(king.color),
    );

    return opponents.filter((piece) => !!piece.availableMoves.find((move) => move === king.position));
}

export function filterAvailableMovesIfKingIsChecked(board: ChessPiece[], currentPiece: ChessPiece, availableMoves: Position[]) {
    const [king] = board.filter((piece) => piece.type === PieceType.KING && piece.color === currentPiece.color);
    
    const piecesAttackingTheKing = getPieceAttackingTheKing(king, board);

    if (currentPiece.type === PieceType.KING) {
        const kingIndex = board.findIndex((piece) => piece.type === PieceType.KING && piece.color === currentPiece.color)
        const boardWithoutKing = board.slice(0, kingIndex).concat(board.slice(kingIndex + 1));
        const piecesAttackingTheKingMoves = piecesAttackingTheKing.map(
            (piece) => piece.getAvailablePositions(boardWithoutKing, [], false)
        ).flat();
        return availableMoves.filter((move) => !piecesAttackingTheKingMoves.find((position) => position === move));
    }

    if (piecesAttackingTheKing.length > 1) {
        return [];
    } else if (piecesAttackingTheKing.length === 1) {
        const [pieceAttackingTheKing] = piecesAttackingTheKing;
        
        const onlyPossiblePosition = pieceAttackingTheKing.getPositionBetweenPieceAndOpponentKing(king, availableMoves);
        return availableMoves.filter((move) => !!onlyPossiblePosition.find((position) => position === move));
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
    const [king] = board.filter((piece) => piece.type === PieceType.KING && piece.color === pieceToCheck.color);
    const boardWithoutPiece = getBoardWithoutPiece(board, pieceToCheck);
    const pieceAttackingTheKing = getPieceAttackingTheKing(
        king,
        boardWithoutPiece.map((piece) => {
            piece.availableMoves = piece.getAvailablePositions(boardWithoutPiece, [], false);
            return piece;
        }),
    );
    return pieceAttackingTheKing.length > 0;
}