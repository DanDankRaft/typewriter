<script>
    // @ts-ignore
    import { SaveFile } from "../wailsjs/go/main/App.js";
    import RibbonBar from "./RibbonBar/RibbonBar.svelte";
    import DocumentEditor from "./DocumentEditor/DocumentEditor.svelte";
    import ShoSho from "shosho";
    import { EditorView } from "prosemirror-view";
    import { EditorState } from "prosemirror-state";
    import { schema } from "prosemirror-schema-basic";
    import { undo, redo, history } from "prosemirror-history";
    import { keymap } from "prosemirror-keymap";
    import { baseKeymap, toggleMark } from "prosemirror-commands";
    import { onMount, tick } from "svelte";
    import { MarkType, Schema } from "prosemirror-model";

    // let editorSchema = schema;
    let newSchema = schema.spec.nodes.append({
        citation: {
            content: "text*",
            inline: true,
            group: "inline",
            toDOM(node) {
                return ["span", { class: "citation" }, 0];
            },
        },
    });
    let editorSchema = new Schema({
        nodes: newSchema,
        marks: schema.spec.marks,
    });

    /**@type {EditorState} */
    let editorState = $state(
        EditorState.create({
            schema: editorSchema,
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
        }),
    );

    /**@type {?EditorView} */
    let editorView = $state(
        new EditorView(null, {
            state: editorState,
        }),
    );

    /**
     * @param {EditorState} state
     * @param {MarkType} mark
     */
    function isMarkActive(state, mark) {
        if (state.storedMarks) {
            return mark.isInSet(state.storedMarks) !== undefined;
        } else if (state.selection.empty) {
            return mark.isInSet(state.selection.$anchor.marks()) !== undefined;
        } else {
            return (
                mark.isInSet(
                    state.selection.$from.marksAcross(state.selection.$to),
                ) !== undefined
            );
        }
    }

    function isNodeType(state, nodeType) {
        let isheading = state.selection.$anchor.parent.type == nodeType;
        state.selection.content().content.forEach((node) => {
            isheading = node.type.name == "heading" || isheading;
        });

        return isheading;
    }

    let activeButtons = $state({
        bold: false,
        italic: false,
        header: false,
    });

    /**
     *
     * @param {EditorState} state
     */
    function updateButtons(state) {
        return {
            bold: isMarkActive(state, state.schema.marks["strong"]),
            italic: isMarkActive(state, state.schema.marks["em"]),
            header: isNodeType(state, state.schema.nodes["heading"]),
        };
    }

    let isBoldActive = $state(false);

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
        let text = editorView.state.doc.toJSON();

        console.log(text);
        SaveFile(text);
        return true;
    });

    onMount(() => {
        editorView = new EditorView(
            document.getElementById("document-editor"),
            {
                state: editorState,
                dispatchTransaction(transaction) {
                    let newState = editorView.state.apply(transaction);
                    editorView.updateState(newState);
                    activeButtons = updateButtons(newState);
                },
            },
        );
        shortcuts.start();
    });
</script>

<main>
    <RibbonBar bind:editorview={editorView} {activeButtons} />
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
</style>
