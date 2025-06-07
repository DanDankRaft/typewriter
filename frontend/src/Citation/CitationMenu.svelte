<script lang="ts">
    import { on } from "svelte/events";
    import EventEmitter from "eventemitter3";
    import { EditorView } from "prosemirror-view";
    import { EditorState } from "prosemirror-state";

    interface Citation {
        source: string;
        content: string;
        bookmark: any;
    }

    let citations: Citation[] = [];

    let results = [
        "United States v. Texas",
        "Barkley v. Washington",
        "American Empire",
    ];

    let visible = $state(false);
    let searchbox = $state("");
    let submitted = $state("");
    let inputElement = $state();

    let resultsFiltered = $derived.by(() => {
        if (searchbox.trim() == "") {
            return citations.map((val) => val.source);
        } else {
            return citations
                .filter((val) =>
                    val.source
                        .toLowerCase()
                        .includes(searchbox.trim().toLowerCase()),
                )
                .map((val) => val.source);
        }
    });

    /**
     *
     * @param {string} text
     * @param {string} segment
     */
    function highlightSegment(text, segment) {
        if (!text.toLowerCase().includes(segment.toLowerCase())) return text;

        let start = text.toLowerCase().indexOf(segment.toLowerCase());
        let end = start + segment.length;

        return (
            text.substring(0, start) +
            "<b>" +
            text.substring(start, end) +
            "</b>" +
            text.substring(end, text.length)
        );
    }

    function hideMenu() {
        visible = false;
        bus.emit("submitted");
    }

    const bus = new EventEmitter();

    export async function createCitationNew(editorview: EditorView) {
        if (visible) {
            return;
        }

        visible = true;
        await new Promise((resolve) => bus.once("submitted", resolve));

        let resultSource = submitted.trim();

        if (resultSource == null || resultSource == "") {
            return;
        }

        editorview.focus();
        let tr = editorview.state.tr;
        citations.push({
            source: resultSource,
            content: resultSource,
            bookmark: tr.selection.getBookmark(),
        });

        tr.replaceSelectionWith(
            editorview.state.schema.node(
                "citation",
                null,
                editorview.state.schema.text(resultSource),
            ),
        );
        editorview.dispatch(tr);
    }

    export function debugPrintCitations() {
        console.log(`total citations: ${citations.length}`);
        for (let citation of citations) {
            console.log(citation);
        }
    }

    export function debugFindCitations(editorstate: EditorState) {
        editorstate.doc.descendants((node, pos, parent, index) => {
            if (node.type.name == "citation") {
                console.log("position: ", pos);
                console.log(node.textContent);
            }
        });
    }

    /**
     * @param {KeyboardEvent} event
     */
    function onkeydowncapture(event) {
        if (event.code == "Escape") {
            hideMenu();
        }

        if (event.key == "Enter") {
            event.preventDefault();
            submitted = searchbox;
            hideMenu();
        }
    }

    on(window, "mouseup", (event) => {
        if (event.button == 0) {
            hideMenu();
        }
    });
    function onmouseup(event) {
        event.stopPropagation();
    }

    function oninput(event) {
        event.target.style.width = event.target.value.length + 1 + "ch";
    }

    function init(element) {
        element.focus();
        searchbox = "";
        submitted = "";
    }
</script>

{#if visible}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        {onkeydowncapture}
        {onmouseup}
        class="fixed z-10 top-[50vh] left-[50vw] translate-[-50%] w-fit"
    >
        <input
            use:init
            {oninput}
            type="text"
            bind:value={searchbox}
            bind:this={inputElement}
            placeholder="Enter citation here..."
        />
        {#each resultsFiltered as result, index}
            <button
                class="suggestion"
                onmouseenter={(event) => {
                    event.target.focus();
                }}
                onclick={(event) => {
                    submitted = result;
                    hideMenu();
                }}
                onmouseleave={(event) => {
                    inputElement.focus();
                }}
            >
                {@html highlightSegment(result, searchbox)}
            </button>
        {/each}
    </div>
{/if}

<style>
    @import "../style.css";

    input {
        font-family: "IBM Plex Mono";
        font-weight: 600;
        font-size: 24px;
        font-style: italic;
        min-width: 100%;
        background: white;
        color: black;
        @apply w-fit px-1 outline-0 border-b-black border-b-2;
    }
    input:focus {
        @apply border-b-black border-b-2;
    }

    .suggestion {
        @apply w-full bg-white text-black px-1 outline-none;
        font-family: "IBM Plex Mono";
        font-weight: 400;
        font-size: 22px;
        text-align: left;
    }

    .suggestion:hover {
        @apply bg-blue-500 text-white cursor-pointer;
    }
</style>
