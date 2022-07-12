import { defaultChessboardWithPieces } from "../services/chessboard.service";
import type { ChessPiece } from "./pieces/chess-piece.model";

export interface Game {
    createdAt: Date;

    updatedAt: Date;

    moves: string[];

    board: ChessPiece[];

    whitePlayerId: string;

    blackPlayerId: string;
}