<script>
    import Input from "./input.svelte";
    export let validate = {};
    export let layout = {};
    export let editLegend = false;
    import Fieldset from "./fieldset.svelte";
    const validations = Object.entries(validate.value).map(([key,value]) => { return {key,value}});
    const layouts = Object.entries(layout.value||{}).map(([key,value]) => { return {key,value}});
    const legend = `${validate.key[0].toUpperCase()}${validate.key.substring(1)}`;
</script>
{#if layout?.value?.listEdit}
    <fieldset>
        <legend>{legend}</legend>
        {#each validations as validation,i}
            {#if validation.value && typeof(validation.value)==="object"}
                <Fieldset validate={validation} editLegend=true></Fieldset>
            {:else}
                <Input layout={layouts[i]} validate={validation}></Input>
            {/if}
        {/each}
    </fieldset>
{:else}
    <fieldset>
        <legend>{#if editLegend}<input value={legend}>{:else}{legend}{/if}</legend>
        {#each validations as validation,i}
            {#if validation.value && typeof(validation.value)==="object"}
                <Fieldset layout={layouts[i]} validate={validation}></Fieldset>
            {:else}
                <Input layout={layouts[i]} validate={validation}></Input>
            {/if}
        {/each}
    </fieldset>
{/if}

