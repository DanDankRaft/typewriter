<script>
    import Tab from "./Tab.svelte";
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
    import { EditorState, TextSelection, Transaction } from "prosemirror-state";
    import { Fragment, Schema } from "prosemirror-model";
    import { EditorView } from "prosemirror-view";

    //tab management
    let selectedTab = $state("Home");
    let tabs = ["Home", "Edit"];

    /**
     * @typedef {Object} Props
     * @property {EditorView} editorview
     * @property {any} activeButtons
     */

    /** @type {Props} */
    let { editorview = $bindable(), activeButtons } = $props();
    /**
     * @type {Schema}
     */
    let editorSchema = editorview.state.schema;
    /**
     * @type {EditorState}
     */
    let editorState = $derived(editorview.state);

    /**
     * @param {string} name
     */
    function onTabClick(name) {
        selectedTab = name;
    }

    /**
     * @param {import("prosemirror-model").MarkType} mark
     */
    function ribbonToggleMark(mark) {
        editorview.focus(); //prevent selection from losing focus just because we pressed a button
        toggleMark(mark)(editorview.state, editorview.dispatch);
    }

    function saveFile() {
        SaveFile(editorview.state.doc.toJSON());
    }

    /**@type {CitationMenu} */
    let citationMenu;
</script>

<CitationMenu bind:this={citationMenu} />
<div id="ribbon-bar" class="w-[100vw]">
    <div id="tabs" class="flex flex-row">
        {#each tabs as tab}
            <Tab
                name={tab}
                selected={selectedTab == tab}
                onclick={() => onTabClick(tab)}
            />
        {/each}
        <div class="grow border-b"></div>
    </div>
    <div id="contents" class="pl-2 pr-1 pt-1 pb-1">
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
                ribbonToggleMark(editorSchema.marks.strong);
            }}
        >
            <Bold24Outline class="w-6 h-6" />
        </Button>
        <Button
            active={activeButtons.italic}
            onclick={(event) => {
                ribbonToggleMark(editorSchema.marks.em);
            }}
        >
            <Italic24Outline class="w-6 h-6" />
        </Button>

        <Button
            active={activeButtons.header}
            onclick={(event) => {
                editorview.focus();
                /**
                 * @type {Transaction}
                 */
                let tr = editorview.state.tr;

                //check if the selection is a heading
                let isheading =
                    tr.selection.$anchor.parent.type ==
                    editorSchema.nodes["heading"];
                tr.selection
                    .content()
                    .content.forEach((node, offset, index) => {
                        isheading = node.type.name == "heading" || isheading;
                    });

                tr.setBlockType(
                    tr.selection.from,
                    tr.selection.to,
                    editorSchema.nodes[isheading ? "paragraph" : "heading"],
                    isheading ? null : { level: 1 },
                );

                let newState = editorview.state.apply(tr);
                editorview.updateState(newState);
                activeButtons.header = !activeButtons.header;
            }}
        >
            <H124Outline class="w-6 h-6 stroke-2" />
        </Button>
        <Button
            onclick={(event) => {
                citationMenu.toggleVisible(true);
                // let content = window.prompt("enter citation content", "");
                // if (content == "") {
                //     return;
                // }
                let content = "pop";

                editorview.focus();
                let schema = editorview.state.schema;
                let tr = editorview.state.tr;
                tr.insert(
                    tr.selection.from,
                    Fragment.fromArray([
                        schema.text("\u200b"),
                        schema.node(
                            "citation",
                            null,
                            schema.text("\u200b" + content),
                        ),
                        schema.text("\u200b"),
                    ]),
                );
                editorview.dispatch(tr);
            }}>citation</Button
        >
    </div>
</div>

<style>
    @import "../style.css";

    #ribbon-bar {
        position: fixed;
        top: 0;
    }

    #tabs {
        font-size: 24px;
        height: 36px;
        margin-top: 5px;
    }

    #contents {
        @apply bg-menuBackground;
        height: fit-content;
        text-align: start;
        border: 1px solid white;
        border-top: 0px;
    }
</style>
