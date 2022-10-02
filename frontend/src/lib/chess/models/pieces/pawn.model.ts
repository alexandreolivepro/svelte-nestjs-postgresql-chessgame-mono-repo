import { PieceType } from "../../enums/piece-type.enum";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";
import { PieceColor } from "../../enums/piece-color.enum";
import { getLastDigitOfPosition, getOppositeColor, filterAvailableMovesIfKingIsChecked, isCheckWithoutPieceOnBoard, getBoardWithoutPiece } from "../../utils/chessboard.utils";
import type { Move } from "../move.model";
import type { GameStore } from "../game-store.model";
import { movementDirection } from "./config";

export class Pawn extends ChessPieceAbstract {
    readonly type = PieceType.PAWN;

    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[] {
        const direction: number = movementDirection[this.color];
        const availableMoves: Position[] = [];

        const hasPieceInPossibleMovement = pieces.find((piece) => piece.position === this.position + direction as Position);
        if (!hasPieceInPossibleMovement) {
            availableMoves.push(this.position + direction as Position);
            if (this.isStartingPosition() && !pieces.find((piece) => piece.position === this.position + (direction * 2) as Position)) {
                availableMoves.push(this.position + (direction * 2) as Position);
            }
        }
        // check if the pawn can take on the left side
        if (this.hasOpponentPieceAtPosition(pieces, direction, -9)) {
            availableMoves.push(this.position + (-9 * direction) as Position);
        }
        // check if the pawn can take on the right side
        if (this.hasOpponentPieceAtPosition(pieces, direction, 11)) { 
            availableMoves.push(this.position + (11 * direction) as Position);
        }

        if (this.isEnPassantSituation(moves, this.position)) {
            availableMoves.push(moves[moves.length -1].end + direction as Position);
        }
        
        return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
    }

    getPositionBetweenPieceAndOpponentKing(king: ChessPiece, availableMoves: Position[]): Position[] {
        return [this.position];
    }

    onMoveAction(gameStore: GameStore): GameStore {
        const { moves } = gameStore;
        if (!moves || moves.length === 0) {
            return gameStore;
        }
        const lastMove = moves[moves.length -1];
        // We check if the situation was en passant before the move to see if we need to remove the pawn
        if (lastMove.piece.type === this.type && lastMove.piece.color === this.color && this.isEnPassantSituation(moves.slice(0, moves.length - 1), lastMove.start)) {
            const direction: number = movementDirection[this.color];
            const positionPawnToRemove = gameStore.board.findIndex((piece) => piece.position === (this.position - direction));
            if (positionPawnToRemove > -1) {
                gameStore.board.splice(positionPawnToRemove, 1);
            }
        }
        return gameStore;
    }

    private isEnPassantSituation(moves: Move[], position: Position) {
        const lastMove = moves[moves.length -1];
        return (this.color === PieceColor.WHITE && getLastDigitOfPosition(position) === '5' && getLastDigitOfPosition(lastMove?.end) === '5' && getLastDigitOfPosition(lastMove?.start) === '7')
            || (this.color === PieceColor.BLACK && getLastDigitOfPosition(position) === '4' && getLastDigitOfPosition(lastMove?.end) === '4' && getLastDigitOfPosition(lastMove?.start) === '2')
    }

    private hasOpponentPieceAtPosition(pieces: ChessPiece[], direction: number, modifier: number): boolean {
        return !!pieces.find((piece) => piece.position === (this.position + (modifier * direction) as Position) && piece.color === getOppositeColor(this.color));
    }
 
    private isStartingPosition(): boolean {
        return (this.color === PieceColor.BLACK && this.position.toString()[1] === '7')
            || (this.color === PieceColor.WHITE && this.position.toString()[1] === '2');
    }
}