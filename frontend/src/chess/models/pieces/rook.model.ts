import { PieceType } from "../../enums/piece-type.enum";
import { getAvailableMovesBySide } from "../../utils/chessboard.utils";
import type { Move } from "../move.model";
import type { PieceColor } from "../piece-color.model";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

type RookName = 'short' | 'long';

export class Rook extends ChessPieceAbstract {
    readonly type = PieceType.ROOK;

    name: RookName;

    constructor(color: PieceColor, position: Position, name: RookName) {
        super(color, position);
        this.name = name;
    }

    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
        const availableMoves = [];

        availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1], this.position, this.color));

        return availableMoves;
    }
}