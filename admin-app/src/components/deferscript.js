(() => {
    const script = document.createElement("script");
    script.innerHTML =  document.currentScript.innerHTML;
    document.currentScript.replaceWith(script);
})();

