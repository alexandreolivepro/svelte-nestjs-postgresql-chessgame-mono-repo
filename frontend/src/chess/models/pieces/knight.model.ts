import { PieceType } from "../../enums/piece-type.enum";
import { hasPieceOnPosition, isPositionOutsideBoundaries } from "../../utils/chessboard.utils";
import type { Move } from "../move.model";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";

export class Knight extends ChessPieceAbstract {
    readonly type = PieceType.KNIGHT;

    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
        const possibleDestination = [12, -8, -12, 8, -19, 21, 19,-21].map((modifier) => (this.position + modifier as Position));

        const availableMoves = possibleDestination.filter(
            (destination) => !hasPieceOnPosition(pieces, destination, this.color) && !isPositionOutsideBoundaries(destination)
        );
        return availableMoves;
    }
}