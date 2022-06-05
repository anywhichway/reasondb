const mapToArray = (map) => {
    return Object.entries(map).reduce((values,[key,value]) => { values.push({[key]:value}); return values;},[])
}

export {mapToArray as default,mapToArray};