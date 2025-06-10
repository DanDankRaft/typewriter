<script lang="ts">
    import Tab from "./Tab.svelte";
    import Button from "./Button.svelte";
    import { SaveFile } from "../../wailsjs/go/main/App";
    import {
        editorview,
        activeButtons,
        schema,
        debugValues,
    } from "../editor.svelte.js";
    import { MarkType } from "prosemirror-model";
    import { toggleMark } from "prosemirror-commands";
    import {
        Bold24Outline,
        Italic24Outline,
        H124Outline,
        H224Outline,
        //@ts-ignore
    } from "@iconslib/svelte/heroicons";
    //@ts-ignore
    import { Save } from "@iconslib/svelte/feather";
    import { Transaction } from "prosemirror-state";

    function ribbonToggleMark(mark: MarkType) {
        editorview.view.focus(); //prevent selection from losing focus just because we pressed a button
        toggleMark(mark)(editorview.view.state, editorview.view.dispatch);
    }

    function saveFile() {
        SaveFile(editorview.view.state.doc.toJSON());
    }
</script>

<Button
    onclick={(event) => {
        saveFile();
    }}
>
    <Save class="w-6 h-6 stroke-current" />
</Button>
<Button
    active={activeButtons.bold}
    onclick={(event) => {
        ribbonToggleMark(schema.marks.strong);
    }}
>
    <Bold24Outline class="w-6 h-6" />
</Button>
<Button
    active={activeButtons.italic}
    onclick={(event) => {
        ribbonToggleMark(schema.marks.em);
    }}
>
    <Italic24Outline class="w-6 h-6" />
</Button>

<Button
    active={activeButtons.header}
    onclick={(event) => {
        editorview.view.focus();

        let tr: Transaction = editorview.view.state.tr;

        //check if the selection is a heading
        let isheading =
            tr.selection.$anchor.parent.type == schema.nodes["heading"];
        tr.selection.content().content.forEach((node, offset, index) => {
            isheading = node.type.name == "heading" || isheading;
        });

        tr.setBlockType(
            tr.selection.from,
            tr.selection.to,
            schema.nodes[isheading ? "paragraph" : "heading"],
            isheading ? null : { level: 1 },
        );

        let newState = editorview.view.state.apply(tr);
        editorview.view.updateState(newState);
        activeButtons.header = !activeButtons.header;
    }}
>
    <H124Outline class="w-6 h-6 stroke-2" />
</Button>
<Button
    onclick={(event) => {
        // console.log("STILL BEING IMPLEMENTED");
        editorview.view.focus();
        let tr = editorview.view.state.tr;
        tr.replaceSelectionWith(
            schema.node(
                "citation",
                null,
                schema.text("yippee", [schema.mark("em")]),
            ),
        );
        editorview.view.dispatch(tr);
    }}>citation</Button
>
{debugValues.cursor}
