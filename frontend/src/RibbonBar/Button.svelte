<script>
    let { onclick, children, active = false } = $props();
</script>

<button class={"ribbon-button" + (active ? " active" : "")} {onclick}>
    {@render children()}
</button>

<style>
    @import "../style.css";

    .ribbon-button {
        @apply hover:bg-buttonHover border border-transparent p-2 cursor-pointer;
        @apply active:bg-buttonPressed;
    }

    .active {
        @apply bg-buttonPressed border-white;
    }
</style>
