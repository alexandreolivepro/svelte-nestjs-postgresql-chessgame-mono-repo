import { PieceType } from "../../enums/piece-type.enum";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

export class Knight extends ChessPieceAbstract {
    readonly type = PieceType.KNIGHT;

    getAvailablePositions(pieces: ChessPiece[]): Position[] {
        return [];
    }
}