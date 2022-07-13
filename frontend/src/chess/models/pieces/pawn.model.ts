import { PieceType } from "../../enums/piece-type.enum";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";
import { movementDirection } from '../../config';
import { PieceColor } from "../../enums/piece-color.enum";

export class Pawn extends ChessPieceAbstract {
    readonly type = PieceType.PAWN;

    getAvailablePositions(pieces: ChessPiece[]): Position[] {
        const direction: number = movementDirection[this.color];
        console.log(direction, this.color, this.position.toString()[1], );
        if (this.isStartingPosition()) {
            return [this.position + direction as Position, this.position + (direction * 2) as Position];
        }
        return [];
    }

    private isStartingPosition(): boolean {
        return (this.color === PieceColor.BLACK && this.position.toString()[1] === '7')
            || (this.color === PieceColor.WHITE && this.position.toString()[1] === '2');
    }
}