import type { PieceColor } from './piece-color.model';
import type { RookName } from './pieces/rook.model';
import type { Position } from './position.model';

export type CastleConfig = {
	[key in PieceColor]: {
		[key in RookName]: {
			kingDestination: Position;
			towerDefaultPosition: Position;
			towerDestination: Position;
		};
	};
};
