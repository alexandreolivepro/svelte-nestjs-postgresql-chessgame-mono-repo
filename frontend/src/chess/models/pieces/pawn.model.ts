import { PieceType } from "../../enums/piece-type.enum";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

export class Pawn extends ChessPieceAbstract {
    readonly type = PieceType.PAWN;

    getAvailablePositions(pieces: ChessPiece[]): Position[] {
        return [];
    }
}