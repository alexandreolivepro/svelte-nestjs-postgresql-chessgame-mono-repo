<script lang="ts">
import { onDestroy } from "svelte";

    import Chessboard from "../components/Chessboard.svelte";
    import type { GameStore } from "../models/game-store.model";
    import type { ChessPiece } from "../models/pieces/chess-piece.model";
    import { getDefaultGame } from "../services/chessboard.service";
    import gameStore from "../stores/game.store";

    let currentGame: GameStore;
    gameStore.setGame(getDefaultGame());

    const unsubscribe = gameStore.subscribe((game) => {
        currentGame = game;
        console.log(currentGame);
    });

    onDestroy(() => {
        unsubscribe();
    });

    function handlePieceClick(event: CustomEvent<ChessPiece>) {
        const { detail: piece } = event;

        gameStore.setSelectedPiece(piece);
    }
</script>

<Chessboard
    chessboardPieces="{currentGame.board}"
    selectedPiece="{currentGame.selectedPiece}"
    availableMoves="{currentGame.availableMoves}"
    on:pieceClick="{handlePieceClick}"
></Chessboard>