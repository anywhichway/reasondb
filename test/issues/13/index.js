'use strict'

const childProcess = require('child_process')
const path = require('path')

const App = function () {
  console.log("\n==========\nApp launch\n==========")
  this.launchFirst()
}

App.prototype.runScript = function (scriptPath, callback) {

    let invoked = false
    let process = childProcess.fork(scriptPath)

    process.on('error', (err) => {
        if (invoked) return
        invoked = true
        callback(err)
    })

    // execute the callback once the process has finished running
    process.on('exit', (code) => {
        if (invoked) return
        invoked = true
        let err = code === 0 ? null : new Error('exit code ' + code)
        callback(err)
    })

}

App.prototype.launchFirst = function () {
  this.runScript(path.resolve(__dirname,'first.js'), (err) => {
      if (err) throw err
      console.log("First script finished\n\n")
      this.runScript(path.resolve(__dirname,'second.js'), (err) => {
          if (err) throw err
          console.log("Second script finished\n\n")
          this.runScript(path.resolve(__dirname,'third.js'), (err) => {
              if (err) throw err
              console.log("Third script finished\n\n")
          })
      })
  })
}



module.exports = new App()