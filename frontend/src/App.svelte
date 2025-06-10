<script>
    // @ts-ignore
    import { SaveFile } from "../wailsjs/go/main/App.js";
    import RibbonBar from "./RibbonBar/RibbonBar.svelte";
    import ShoSho from "shosho";
    import { onMount } from "svelte";
    import { editorview, initiateView } from "./editor.svelte.js";

    const shortcuts = new ShoSho({
        capture: true,
        target: document,
        shouldHandleEvent(event) {
            return true;
        },
    });

    shortcuts.register("Ctrl+S", (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("saving file...");
        let text = editorview.view.state.doc.toJSON();

        console.log(text);
        SaveFile(text);
        return true;
    });

    onMount(() => {
        initiateView();
        shortcuts.start();
    });
</script>

<main>
    <RibbonBar />
    <div id="document-area" class="w-dvw fixed top-[111px] overflow-auto">
        <div id="document">
            <div
                id="document-editor"
                class="text-left w-full h-full outline-none text-xl"
            ></div>
        </div>
    </div>
</main>

<style>
    @import "./style.css";

    #document-area {
        height: calc(100vh - 111px);
    }

    #document {
        @apply w-[8.5in] h-[14in] bg-neutral-800 border-neutral-400 border-1 mx-auto my-10;
    }

    #document-editor {
        font-family: "IBM Plex Mono", monospace;
    }

    :global(.ProseMirror) {
        padding: 1in;
        height: 100%;
    }

    :global(.ProseMirror-focused) {
        outline: none;
    }

    :global(.ProseMirror h1) {
        @apply text-2xl font-bold text-center;
    }

    :global(.ProseMirror h2) {
        @apply text-2xl text-center;
    }

    :global(.citation) {
        @apply bg-yellow-900 border;
    }
    :global(.citation.ProseMirror-selectednode) {
        @apply bg-green-900;
    }
</style>
