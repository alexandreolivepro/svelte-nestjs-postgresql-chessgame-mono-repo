<script lang="ts">
    import type { ChessPiece } from "../models/pieces/chess-piece.model";

    export let piece: ChessPiece;
    export let isSelected: boolean;
</script>

<style lang="scss">
    $rows: '8', '7', '6', '5', '4', '3', '2', '1';
    $columns: 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h';

    div {
        position: absolute;
    }

    .is-selected {
        background: yellow;
    }

    @for $i from 1 through length($rows) {
        @for $j from 1 through length($columns) {
            .square-#{nth($columns, $j)}#{nth($rows, $i)} {
                transform: translate(($j * 5rem) - 5rem, ($i * 5rem) - 5rem);
            }
        }
    }
</style>

<div
    class="color-{piece.color} square-{piece.position}"
    class:is-selected={isSelected}
    on:click>
    {piece.type} {piece.position}
</div>
