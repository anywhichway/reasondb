`ReasonDB` uses the JavaScript module format and is not currently transpiled due to issues with Babel traspilation of async generators. 

## Browser Use

To load `ReasonDB` apps in the browser, make the entire `src` tree of the installed package available plus `index.js`, then import `index.js` in your app entry point file. Then load your entry point in an HTML file using the module flag. 


```html
<html>
<head>
<script type="module" src="your_entry_point.js"></script>
</head>
<body>
</body>
</html>
```

See example HTML files in the examples directory. 


We are working on a webpack build, but due to the advanced JavaScript features used by `ReasonDB` are having some issues.


## Node Use

NodeJS currently requires that JavaScript modules be stored in and loaded from `.mjs` files. `ReasonDB` is almost 100% isomorphic (i.e. rund the same code on the server as in the client) and the default NodeJS approach breaks isomorphism. Fortunately, there is a great package called `esm` that effectively overcomes this issue. The `esm` package is installed as a dependency for `ReasonDB`. To run a `ReasonDB` NodeJS application use a command like this:

```
node -r esm index.js
```