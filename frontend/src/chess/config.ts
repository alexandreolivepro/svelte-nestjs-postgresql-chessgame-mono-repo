import { PieceColor } from "./enums/piece-color.enum";
import type { GameStore } from "./models/game-store.model";
import { Bishop } from "./models/pieces/bishop.model";
import type { ChessPiece } from "./models/pieces/chess-piece.model";
import { King } from "./models/pieces/king.model";
import { Knight } from "./models/pieces/knight.model";
import { Pawn } from "./models/pieces/pawn.model";
import { Queen } from "./models/pieces/queen.model";
import { Rook } from "./models/pieces/rook.model";

export const sizeCaseInRem = 6;

// Black starts at the top of the chessboard and move towards the bottom
// White starts at the bottom and move towards the top
export const movementDirection = {
    [PieceColor.WHITE]: 1,
    [PieceColor.BLACK]: -1
}

export const defaultChessboardWithPieces: ChessPiece[] = [
    new King(PieceColor.WHITE, 31),
    // new Queen(PieceColor.WHITE, 41),
    // new Rook(PieceColor.WHITE, 11, 'long'),
    // new Rook(PieceColor.WHITE, 81, 'short'),
    // new Bishop(PieceColor.WHITE, 31),
    // new Bishop(PieceColor.WHITE, 61),
    // new Knight(PieceColor.WHITE, 21),
    // new Knight(PieceColor.WHITE, 71),
    // new Pawn(PieceColor.WHITE, 52),
    // new Pawn(PieceColor.WHITE, 42),
    // new Pawn(PieceColor.WHITE, 12),
    // new Pawn(PieceColor.WHITE, 82),
    new Pawn(PieceColor.WHITE, 32),
    new Pawn(PieceColor.WHITE, 62),
    new Pawn(PieceColor.WHITE, 22),
    new Pawn(PieceColor.WHITE, 72),
    new King(PieceColor.BLACK, 58),
    new Queen(PieceColor.BLACK, 48),
    new Rook(PieceColor.BLACK, 18, 'long'),
    new Rook(PieceColor.BLACK, 88, 'short'),
    new Bishop(PieceColor.BLACK, 38),
    new Bishop(PieceColor.BLACK, 68),
    new Knight(PieceColor.BLACK, 55),
    new Knight(PieceColor.BLACK, 78),
    new Pawn(PieceColor.BLACK, 57),
    new Pawn(PieceColor.BLACK, 47),
    new Pawn(PieceColor.BLACK, 17),
    new Pawn(PieceColor.BLACK, 87),
    new Pawn(PieceColor.BLACK, 37),
    new Pawn(PieceColor.BLACK, 67),
    new Pawn(PieceColor.BLACK, 27),
    new Pawn(PieceColor.BLACK, 77),
];

export const defaultGame: GameStore = {
    moves: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    board: defaultChessboardWithPieces,
    whitePlayerId: '',
    blackPlayerId: '',
    nextColorToPlay: PieceColor.BLACK,
}

export const castleValues = {
    [PieceColor.WHITE]: {
        short: {
            kingDestination: 71,
            towerDefaultPosition: 81,
            towerDestination: 61,
        },
        long: {
            kingDestination: 31,
            towerDefaultPosition: 11,
            towerDestination: 41,
        }
    },
    [PieceColor.BLACK]: {
        short: {
            kingDestination: 78,
            towerDefaultPosition: 88,
            towerDestination: 68,
        },
        long: {
            kingDestination: 38,
            towerDefaultPosition: 18,
            towerDestination: 48,
        }
    },
}