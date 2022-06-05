const timeish = (data) => {
    if(typeof(data)==="string") {
        const year = parseInt(data),
            yearstr = year+"";
        return data.length>=24 && data.length<=29 && ((year>=0 && data[10]==="T") || (year<0 && data[11]==="T")) && !isNaN(year) && (yearstr.length===4 || yearstr.length===5 || year===0)
        // ISO format starts with a 4 digit year number
        // T is at 10 or 11 depending on if date is BC or AD
    }
    return false;
}

export {timeish as default, timeish}