<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { ChessPiece } from "../models/pieces/chess-piece.model";
    import Piece from "./Piece.svelte";

    const dispatch = createEventDispatcher();
    
    export let chessboardPieces: ChessPiece[];
    export let selectedPiece: ChessPiece;

    $: console.log(chessboardPieces);

    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
</script>

<style>
    .column {
        width: 5rem;
        height: 5rem;
    }

    .row:nth-child(odd) .column:nth-child(even) {
        background: gray;
    }

    .row:nth-child(even) .column:nth-child(odd) {
        background: gray;
    }

    .chessboard {
        position: relative;
    }

    .chess-pieces {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>

<div class="chessboard">
    {#each rows as row}
        <div class="row d-flex">
            {#each columns as column}
                <div class="column">
                    {column + row}
                </div>
            {/each}
        </div>
    {/each}
    {#if chessboardPieces && chessboardPieces.length > 0}
        <div class="chess-pieces">
            {#each chessboardPieces as piece}
                <Piece
                    {piece}
                    isSelected={selectedPiece?.position === piece.position}
                    on:click="{() => dispatch('pieceClick', piece)}"
                ></Piece>
            {/each}
        </div>
    {/if}
</div>
