import type { PieceColor } from "../../enums/piece-color.enum";
import type { PieceType } from "../../enums/piece-type.enum";
import type { GameStore } from "../game-store.model";
import type { Move } from "../move.model";
import type { Position } from "../position.model";
import type { Bishop } from "./bishop.model";
import type { King } from "./king.model";
import type { Knight } from "./knight.model";
import type { Pawn } from "./pawn.model";
import type { Queen } from "./queen.model";
import type { Rook } from "./rook.model";

export abstract class ChessPieceAbstract {
    type: PieceType;

    private _color?: PieceColor;

    private _position?: Position;

    constructor(color: PieceColor, position: Position) {
        this._color = color;
        this._position = position;
    }

    abstract getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean): Position[];

    onMoveAction(gameStore: GameStore): GameStore {
        return gameStore;
    }

    set position(position: Position) {
        this._position = position;
    }

    get position(): Position {
        return this._position;
    }

    get color(): PieceColor {
        return this._color;
    }
}

export type ChessPiece = King | Knight | Queen | Bishop | Knight | Rook | Pawn;