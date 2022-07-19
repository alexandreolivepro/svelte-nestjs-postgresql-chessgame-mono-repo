import { PieceType } from "../../enums/piece-type.enum";
import { getAvailableMovesBySide } from "../../utils/chessboard.utils";
import type { Move } from "../move.model";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

export class Queen extends ChessPieceAbstract {
    readonly type = PieceType.QUEEN;
    
    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
        const availableMoves = [];

        availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1, 9, 11, -9, -11], this.position, this.color));

        return availableMoves;
    }
}