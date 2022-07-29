import { PieceType } from "../../enums/piece-type.enum";
import { filterAvailableMovesIfKingIsChecked, getAvailableMovesBySide, getBoardWithoutPiece, getDiagonalBetweenTwoPiece, getFirstDigitOfPosition, getLastDigitOfPosition, getStraigthLineBetweenTwoPieces, isCheckWithoutPieceOnBoard } from "../../utils/chessboard.utils";
import type { Move } from "../move.model";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

export class Queen extends ChessPieceAbstract {
    readonly type = PieceType.QUEEN;
    
    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
        let availableMoves = [];

        availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1, 9, 11, -9, -11], this.position, this.color));

        if (isMovedPiece && isCheckWithoutPieceOnBoard(pieces, this)) {
            // If the piece is locked in place, we only allow moves that protect the king
            availableMoves = filterAvailableMovesIfKingIsChecked(getBoardWithoutPiece(pieces, this), this, availableMoves);
        }

        return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
    }

    getPositionBetweenPieceAndOpponentKing(king: ChessPiece, availableMoves: Position[]): Position[] {
        let isStraightLine = getLastDigitOfPosition(this.position) === getLastDigitOfPosition(king.position) || getFirstDigitOfPosition(this.position) === getFirstDigitOfPosition(king.position);
        if (isStraightLine) {
            return getStraigthLineBetweenTwoPieces(king, this);
        }
        return getDiagonalBetweenTwoPiece(king, this);
    }
}