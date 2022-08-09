import type { Game } from "./game.model";
import type { PieceColor } from "./piece-color.model";
import type { ChessPiece } from "./pieces/chess-piece.model";
import type { Position } from "./position.model";

export interface GameStore extends Partial<Game> {
    selectedPiece?: ChessPiece;
    availableMoves?: Position[];
    nextColorToPlay?: PieceColor;
    checkStatus: CheckStatus | null;
}

export enum CheckStatus {
    CHECK = 'check',
    CHECKMATE = 'checkmate',
    STALEMATE = 'stalemate'
} 