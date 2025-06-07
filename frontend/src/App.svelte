<script lang="ts">
    // @ts-ignore
    import { SaveFile } from "../wailsjs/go/main/App.js";
    import RibbonBar from "./RibbonBar/RibbonBar.svelte";
    import ShoSho from "shosho";
    import { EditorView } from "prosemirror-view";
    import {
        EditorState,
        NodeSelection,
        TextSelection,
        Transaction,
    } from "prosemirror-state";
    import { schema } from "prosemirror-schema-basic";
    import { undo, redo, history } from "prosemirror-history";
    import { keymap } from "prosemirror-keymap";
    import { baseKeymap, toggleMark } from "prosemirror-commands";
    import { onMount } from "svelte";
    import { MarkType, NodeType, Schema } from "prosemirror-model";

    let newSchema = schema.spec.nodes.append({
        citation: {
            content: "text*",
            inline: true,
            group: "inline",
            selectable: true,
            atom: true,
            isolating: false,

            toDOM(node) {
                return ["span", { class: "citation" }, 0];
            },
        },
    });
    let editorSchema = new Schema({
        nodes: newSchema,
        marks: schema.spec.marks,
    });

    let editorState: EditorState = EditorState.create({
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
    });

    let editorView: EditorView = $state(
        new EditorView(null, {
            state: editorState,
        }),
    );

    let pos = $state(0);

    function isMarkActive(state: EditorState, mark: MarkType): boolean {
        if (state.storedMarks) {
            return mark.isInSet(state.storedMarks) !== undefined;
        } else if (state.selection.empty) {
            return mark.isInSet(state.selection.$anchor.marks()) !== undefined;
        } else {
            if (
                state.selection.$from.marksAcross(state.selection.$to) == null
            ) {
                return false;
            }

            return (
                mark.isInSet(
                    state.selection.$from.marksAcross(state.selection.$to),
                ) !== undefined
            );
        }
    }

    function containsAttrs(nodeAttrs: any, attrs: any): boolean {
        for (let key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                if (
                    !nodeAttrs.hasOwnProperty(key) ||
                    nodeAttrs[key] != attrs[key]
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    function isNodeType(state: EditorState, nodeType: NodeType, attrs?: any) {
        let out = state.selection.$anchor.parent.type == nodeType;
        if (attrs != undefined) {
            out =
                out &&
                containsAttrs(state.selection.$anchor.parent.type, attrs);
        }
        state.selection.content().content.forEach((node) => {
            out = node.type == nodeType || out;
        });

        return out;
    }

    let activeButtons = $state({
        bold: false,
        italic: false,
        header: false,
    });

    function updateButtons(state: EditorState) {
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
                    let customSelectionTrigger = false;
                    // if (transaction.selectionSet) {
                    //     if (
                    //         transaction.selection.$to.parent.type.name ==
                    //         "citation"
                    //     ) {
                    //         customSelectionTrigger = true;
                    //         let anchor = transaction.selection.$anchor;

                    //         let head = editorView.state.doc.resolve(
                    //             transaction.selection.to +
                    //                 (transaction.selection.$to.parent.nodeSize -
                    //                     transaction.selection.$to
                    //                         .parentOffset) -
                    //                 1,
                    //         );

                    //         transaction.setSelection(
                    //             TextSelection.between(anchor, head),
                    //         );
                    //     }
                    //     if (
                    //         transaction.selection.$from.parent.type.name ==
                    //         "citation"
                    //     ) {
                    //         customSelectionTrigger = true;
                    //         let anchor = transaction.selection.$anchor;

                    //         let head = editorView.state.doc.resolve(
                    //             transaction.selection.from -
                    //                 transaction.selection.$from.parentOffset -
                    //                 1,
                    //         );
                    //         transaction.setSelection(
                    //             TextSelection.between(anchor, head),
                    //         );
                    //     }
                    // }

                    let newState = editorView.state.apply(transaction);

                    editorView.updateState(newState);
                    if (customSelectionTrigger) {
                        console.log("now!");
                    }
                    activeButtons = updateButtons(newState);
                    pos = editorView.state.selection.anchor;
                },
                handleDoubleClickOn: (
                    view,
                    pos,
                    node,
                    nodePos,
                    event,
                    direct,
                ) => {
                    if (node.type.name != "citation") {
                        return false;
                    }
                    let tr: Transaction = view.state.tr;

                    tr.setSelection(
                        NodeSelection.create(view.state.doc, nodePos),
                    );
                    tr.deleteSelection();
                    view.dispatch(tr);

                    return true;
                },
                handleTextInput: (view, from, to, text) => {
                    if (from != to) {
                        return false;
                    }

                    let resolved = view.state.doc.resolve(from);

                    if (
                        resolved.parent.type.name == "citation" &&
                        resolved.nodeAfter == null
                    ) {
                        let tr = view.state.tr;
                        tr.insertText(text, from + 1);
                        view.dispatch(tr);
                        return true;
                    }

                    if (
                        resolved.parent.type.name == "citation" &&
                        resolved.nodeBefore == null
                    ) {
                        let tr = view.state.tr;
                        tr.insertText(text, from - 1);
                        view.dispatch(tr);
                        return true;
                    }

                    return false;
                },
            },
        );
        shortcuts.start();
    });
</script>

<main>
    <RibbonBar bind:editorview={editorView} {activeButtons} {pos} />
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
        @apply w-[8.5in] h-[11in] bg-neutral-800 border-neutral-400 border-1 mx-auto my-10;
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
        @apply bg-yellow-900 border inline mx-[1px];
    }

    :global(.citation:hover) {
        @apply bg-yellow-700;
    }
</style>
