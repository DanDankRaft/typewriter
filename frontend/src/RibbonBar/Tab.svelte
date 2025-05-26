<script>
    //name (string) name of the tab
    //selected (bool) whether it's the current tab
    let { name = "Tab", selected = false, onclick } = $props();
</script>

<button class="tab {selected ? 'current' : 'not-current'}" {onclick}
    >{name}</button
>

<!-- <div class="separator"></div> -->

<style>
    @import "tailwindcss";

    .tab {
        font-size: 24px;
        padding: 0 10px;
        cursor: pointer;
        font-family: "IBM Plex Mono", monospace;
    }

    .current {
        @apply bg-neutral-700 border border-b-transparent;
    }

    .not-current {
        @apply border-b-white border-b;
    }

    .not-current:hover {
        @apply bg-neutral-400;
    }

    .not-current:active {
        @apply bg-neutral-800;
    }
</style>
