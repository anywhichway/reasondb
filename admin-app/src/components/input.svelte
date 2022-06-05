<script>
    export let layout;
    export let validate;
//        <input name={layout.key} placeholder="{layout.key}">
    const getTypes = (validate,types=new Set()) => {
        console.log(validate)
        if(validate.$typeof) {
            console.log("ok")
            types.add(validate.$typeof);
        }
        for(const key of ["$and","$or","$xor","$ior"]) {
            if(validate[key]) {
               getTypes(validate[key],types);
            }
        }
        return types;
    }
    const types = getTypes(validate);
    const type = types.count===0 || types.count>1 ? null : Array.from(types)[0];
</script>
{#if type}
    <input name={layout.key} type={type} placeholder={layout.placeholder||validate.key}>
{:else}
    <input>
{/if}
<style>

</style>
