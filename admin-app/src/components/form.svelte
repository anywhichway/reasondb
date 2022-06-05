<script>
    import Fieldset from "../components/fieldset.svelte";
    export let name;
    export let validate;
    export let layout;
    const normalizeLayout = (validate,layout,normalized) => {
        Object.entries(validate).forEach(([key,value]) => {
           const type = typeof(value);
            normalized[key] = layout[key] ||= {};
           if(value && type==="object" && !layout[key]) {
               normalizeLayout(value,layout[key],normalized[key])
           }
        });
    }
    const normalized = {};
    normalizeLayout(validate,layout,normalized);
    layout = normalized;
    const validations = Object.entries(validate).map(([key,value]) => { return {key,value}});
    const layouts = Object.entries(layout).map(([key,value]) => { return {key,value}});
</script>
<form>
    <fieldset>
        <legend>{name}</legend>
        {#each validations as validation, i}
            {#if validation.value && typeof(validation.value)==="object"}
                <Fieldset validate={validation} layout={layouts[i]}></Fieldset>
            {:else}
                <input placeholder={validation.key}>
            {/if}
        {/each}
    </fieldset>
</form>

<style>

</style>