import { PieceColor } from "../enums/piece-color.enum";
import type { Game } from "../models/game.model";
import { Bishop } from "../models/pieces/bishop.model";
import type { ChessPiece } from "../models/pieces/chess-piece.model";
import { King } from "../models/pieces/king.model";
import { Knight } from "../models/pieces/knight.model";
import { Pawn } from "../models/pieces/pawn.model";
import { Queen } from "../models/pieces/queen.model";
import { Rook } from "../models/pieces/rook.model";
import type { BoardLetters, Position } from "../models/position.model";

export const defaultChessboardWithPieces: ChessPiece[] = [
    new King(PieceColor.WHITE, 'e1'),
    new Queen(PieceColor.WHITE, 'd1'),
    new Rook(PieceColor.WHITE, 'a1'),
    new Rook(PieceColor.WHITE, 'h1'),
    new Bishop(PieceColor.WHITE, 'c1'),
    new Bishop(PieceColor.WHITE, 'f1'),
    new Knight(PieceColor.WHITE, 'b1'),
    new Knight(PieceColor.WHITE, 'g1'),
    new Pawn(PieceColor.WHITE, 'e2'),
    new Pawn(PieceColor.WHITE, 'd2'),
    new Pawn(PieceColor.WHITE, 'a2'),
    new Pawn(PieceColor.WHITE, 'h2'),
    new Pawn(PieceColor.WHITE, 'c2'),
    new Pawn(PieceColor.WHITE, 'f2'),
    new Pawn(PieceColor.WHITE, 'b2'),
    new Pawn(PieceColor.WHITE, 'g2'),
    new King(PieceColor.BLACK, 'e8'),
    new Queen(PieceColor.BLACK, 'd8'),
    new Rook(PieceColor.BLACK, 'a8'),
    new Rook(PieceColor.BLACK, 'h8'),
    new Bishop(PieceColor.BLACK, 'c8'),
    new Bishop(PieceColor.BLACK, 'f8'),
    new Knight(PieceColor.BLACK, 'b8'),
    new Knight(PieceColor.BLACK, 'g8'),
    new Pawn(PieceColor.WHITE, 'e7'),
    new Pawn(PieceColor.WHITE, 'd7'),
    new Pawn(PieceColor.WHITE, 'a7'),
    new Pawn(PieceColor.WHITE, 'h7'),
    new Pawn(PieceColor.WHITE, 'c7'),
    new Pawn(PieceColor.WHITE, 'f7'),
    new Pawn(PieceColor.WHITE, 'b7'),
    new Pawn(PieceColor.WHITE, 'g7'),
];

export function transformLetterToNumber(positionLetter: BoardLetters): number {
    return 'abcdefgh'.search(positionLetter);
}

export function getDefaultGame(): Game {
    return {
        moves: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        board: defaultChessboardWithPieces,
        whitePlayerId: '',
        blackPlayerId: ''
    }
}