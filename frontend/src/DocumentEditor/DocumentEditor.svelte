<script>
    import { schema } from "prosemirror-schema-basic";
    import { EditorState } from "prosemirror-state";
    import { EditorView } from "prosemirror-view";
    import { undo, redo, history } from "prosemirror-history";
    import { keymap } from "prosemirror-keymap";
    import { baseKeymap, toggleMark, selectAll } from "prosemirror-commands";

    import { onMount } from "svelte";

    let { view = $bindable() } = $props();

    let state = EditorState.create({
        schema,
        plugins: [
            history(),
            keymap(baseKeymap),
            keymap({
                "Mod-z": undo,
                "Mod-y": redo,
                "Mod-b": toggleMark(schema.marks.strong),
                "Mod-i": toggleMark(schema.marks.em),
            }),
        ],
    });

    onMount(() => {
        view = new EditorView(document.getElementById("document-editor"), {
            state,
        });
    });
</script>

<div
    id="document-editor"
    class="text-left w-full h-full outline-none
text-xl"
></div>

<style>
    @import "../style.css";

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
        @apply text-2xl text-center;
    }
</style>
