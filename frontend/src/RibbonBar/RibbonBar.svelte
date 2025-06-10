<script lang="ts">
    import Tab from "./Tab.svelte";
    import CitationMenu from "../Citation/CitationMenu.svelte";

    import HomeTab from "./HomeTab.svelte";

    //tab management
    let tabs = ["Home", "Edit"];
    let selectedTab = $state("Home");
    function onTabClick(name: string) {
        selectedTab = name;
    }

    let citationMenu: CitationMenu;
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
        <HomeTab />
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
