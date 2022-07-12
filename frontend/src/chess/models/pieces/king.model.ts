import { PieceType } from "../../enums/piece-type.enum";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

export class King extends ChessPieceAbstract {
    readonly type = PieceType.KING;

    getAvailablePositions(pieces: ChessPiece[]): Position[] {
        return [];
    }
}