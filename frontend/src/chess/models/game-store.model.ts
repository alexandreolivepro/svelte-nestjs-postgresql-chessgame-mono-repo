import type { Game } from "./game.model";
import type { ChessPiece } from "./pieces/chess-piece.model";
import type { Position } from "./position.model";

export interface GameStore extends Partial<Game> {
    selectedPiece?: ChessPiece;
    availableMoves?: Position[];
}