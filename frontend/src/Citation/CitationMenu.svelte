<script>
    let visible = $state(false);

    /**
     * @param {boolean} isvisible
     */
    export function toggleVisible(isvisible) {
        if (isvisible === undefined) {
            visible = !visible;
        } else {
            visible = isvisible;
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    function onkeydowncapture(event) {
        if (event.code == "Escape") {
            visible = false;
        }
    }

    function oninput(event) {
        console.log(event);
        event.target.style.width = event.target.value.length + "ch";
    }
</script>

{#if visible}
    <div
        {onkeydowncapture}
        class="fixed z-10 top-[50vh] left-[50vw] translate-[-50%]"
    >
        <input {oninput} type="text" placeholder="Enter citation here..." />
    </div>
{/if}

<style>
    @import "../style.css";

    input {
        font-family: "IBM Plex Mono";
        font-weight: 500;
        font-size: 24px;
        font-style: italic;
        min-width: calc(22ch + 8px);
        background: white;
        color: black;
        @apply px-1 outline-0;
    }
    input:focus {
        @apply border-black border-2;
    }
</style>
