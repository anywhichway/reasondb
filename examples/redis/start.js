require('babel-register')({
    presets: [ ["env", {
      "targets": {
        "node": "11.6.0"
      }
    }]]
})

// Import the rest of our application.
module.exports = require('./index.js')