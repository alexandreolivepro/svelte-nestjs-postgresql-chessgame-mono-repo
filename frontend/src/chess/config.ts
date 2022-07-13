import { PieceColor } from "./enums/piece-color.enum";

export const sizeCaseInRem = 6;

// Black starts at the top of the chessboard and move towards the bottom
// White starts at the bottom and move towards the top
export const movementwhite = 1;

export const movementDirection = {
    [PieceColor.WHITE]: 1,
    [PieceColor.BLACK]: -1
}