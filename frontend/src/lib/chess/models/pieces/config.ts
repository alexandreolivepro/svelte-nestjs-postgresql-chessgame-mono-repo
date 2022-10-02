import type { CastleConfig } from '../castle-config.model';
import { PieceColor } from '../piece-color.model';

export const castleValues: CastleConfig = {
	[PieceColor.WHITE]: {
		short: {
			kingDestination: 71,
			towerDefaultPosition: 81,
			towerDestination: 61
		},
		long: {
			kingDestination: 31,
			towerDefaultPosition: 11,
			towerDestination: 41
		}
	},
	[PieceColor.BLACK]: {
		short: {
			kingDestination: 78,
			towerDefaultPosition: 88,
			towerDestination: 68
		},
		long: {
			kingDestination: 38,
			towerDefaultPosition: 18,
			towerDestination: 48
		}
	}
};

// Black starts at the top of the chessboard and move towards the bottom
// White starts at the bottom and move towards the top
export const movementDirection = {
	[PieceColor.WHITE]: 1,
	[PieceColor.BLACK]: -1
};
