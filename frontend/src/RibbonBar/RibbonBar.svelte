<script>
    import Tab from "./Tab.svelte";
    import CitationMenu from "../Citation/CitationMenu.svelte";

    import { EditorView } from "prosemirror-view";
    import HomeTab from "./HomeTab.svelte";

    //tab management
    let selectedTab = $state("Home");
    let tabs = ["Home", "Edit"];

    /**
     * @typedef {Object} Props
     * @property {EditorView} editorview
     * @property {any} activeButtons
     * @property {number} pos
     */

    /** @type {Props} */
    let { editorview = $bindable(), activeButtons, pos = 0 } = $props();

    /**
     * @param {string} name
     */
    function onTabClick(name) {
        selectedTab = name;
    }

    /**@type {CitationMenu} */
    let citationMenu = $state();
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
        {#if selectedTab == "Home"}
            <HomeTab {editorview} {activeButtons} {citationMenu} {pos} />
        {/if}
    </div>
</div>

<style>
    @import "../style.css";

    #ribbon-bar {
        position: fixed;
        top: 0;
        user-select: none;
    }

    #tabs {
        font-size: 24px;
        height: 36px;
        margin-top: 5px;
    }

    #contents {
        @apply bg-menuBackground;
        height: 60px;
        text-align: start;
        border: 1px solid white;
        border-top: 0px;
    }
</style>
