<script lang="ts">
    import Button from "./Button.svelte";
    import CitationMenu from "../Citation/CitationMenu.svelte";

    import {
        Bold24Outline,
        Italic24Outline,
        H124Outline,
        H224Outline,
        //@ts-ignore
    } from "@iconslib/svelte/heroicons";
    //@ts-ignore
    import { Save } from "@iconslib/svelte/feather";

    import { toggleMark } from "prosemirror-commands";
    import { SaveFile } from "../../wailsjs/go/main/App";
    import { Transaction, Selection, TextSelection } from "prosemirror-state";
    import { Fragment, MarkType, Schema, Slice } from "prosemirror-model";
    import { EditorView } from "prosemirror-view";
    import { Node } from "prosemirror-model";
    import { tick } from "svelte";

    interface Props {
        editorview: EditorView;
        activeButtons: any; //todo...
        citationMenu: CitationMenu; //todo...
        pos: number;
    }

    let { editorview, activeButtons, citationMenu, pos }: Props = $props();
    let schema: Schema = editorview.state.schema;

    function ribbonToggleMark(mark: MarkType) {
        editorview.focus(); //prevent selection from losing focus just because we pressed a button
        toggleMark(mark)(editorview.state, editorview.dispatch);
    }

    /**
     *
     * @param event
     * @param level must be an integer 0-9
     */
    function toggleHeader(event: MouseEvent, level: number) {
        editorview.focus();

        let tr: Transaction = editorview.state.tr;
        let selection: Selection = tr.selection;

        //check if the selection is a heading
        let isheading: boolean =
            selection.$anchor.parent.type == schema.nodes["heading"];
        selection.content().content.forEach((node: Node) => {
            isheading = node.type.name == "heading" || isheading;
        });

        tr.setBlockType(
            selection.from,
            selection.to,
            schema.nodes[isheading ? "paragraph" : "heading"],
            isheading ? null : { level: level },
        );

        let newState = editorview.state.apply(tr);
        editorview.updateState(newState);
        activeButtons.header = !activeButtons.header; //TODO: figure out a way to update activeButtons automatically...
    }

    function saveFile(): void {
        SaveFile(editorview.state.doc.toJSON());
    }
</script>

<Button
    onclick={(event: MouseEvent) => {
        saveFile();
    }}
>
    <Save class="w-6 h-6 stroke-current" />
</Button>
<Button
    active={activeButtons.bold}
    onclick={(event: MouseEvent) => {
        ribbonToggleMark(schema.marks.strong);
    }}
>
    <Bold24Outline class="w-6 h-6" />
</Button>
<Button
    active={activeButtons.italic}
    onclick={(event: MouseEvent) => {
        ribbonToggleMark(schema.marks.em);
    }}
>
    <Italic24Outline class="w-6 h-6" />
</Button>

<Button
    active={activeButtons.header}
    onclick={(event: MouseEvent) => {
        toggleHeader(event, 1);
    }}
>
    <H124Outline class="w-6 h-6 stroke-2" />
</Button>
<Button
    onclick={async (event) => {
        await citationMenu.createCitationNew(editorview);
    }}
    >citation
</Button>
<Button
    onclick={(event) => {
        let resolved = editorview.state.doc.resolve(
            editorview.state.selection.anchor,
        );
        console.log(resolved);
    }}
    >test
</Button>
<Button
    onclick={(event) => {
        citationMenu.debugFindCitations(editorview.state);
    }}
    >list citations
</Button>
{pos}
