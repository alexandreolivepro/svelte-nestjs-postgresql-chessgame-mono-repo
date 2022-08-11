import type { Move } from "./move.model";
import type { ChessPiece } from "./pieces/chess-piece.model";

export interface Game {
    createdAt: Date;

    updatedAt: Date;

    moves: Move[];

    board: ChessPiece[];

    whitePlayerId: string;

    blackPlayerId: string;
}