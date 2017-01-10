// Run this script first
// ** Third script covers **
// Relaunch app
// Get document
// Observe that document has reverted to the last version before the first App relaunch

'use strict'

const ReasonDB = require('reasondb')
const path = require('path')
const mkdirp = require('mkdirp')

const thirdInsert = {
  firstname: "Jack",
  lastname: "Smith"
}


class Person {

}

const Third = function () {
  this.db_path = path.resolve(__dirname, 'db')

  this.initDB()
  this.get(thirdInsert).then((docs) => {
    console.log(`We expect a result, as the Second script changed the name to "Jack", but we get ${docs[0]}`)
    console.log(`We revert back to "James" and try again`)
    thirdInsert.firstname = "James"
    this.get(thirdInsert).then((docs) => {
      console.log(`On the sixth GET, the returned document is ${docs[0].firstname} ${docs[0].lastname}. It should be Jack Smith`)
    })
  })
}

Third.prototype.insert = function (values) {
  return new Promise((resolve, reject) => {
    return this.db.insert(values)
    .into(Person)
    .exec()
    .then((doc, err) => {
      if (err) return reject(err)
      return resolve(doc)
    })
  })
}

Third.prototype.update = function (values) {
  return new Promise((resolve, reject) => {
    return this.db.update({$p: Person})
    .set({$p: values})
    .where({$p: {lastname: {$eq: values.lastname}}})
    .exec()
    .then((res) => {
      resolve(res === 0)
    })
  })
}

Third.prototype.get = function (values) {
  let results = []
  return new Promise((resolve, reject) => {
    return this.db
    .select()
    .from({$p: Person})
    .where({$p: values})
    .exec()
    .then((cursor) => {
      return cursor.forEach((row) => {
          results.push(row[0])
        }).then(() => {
          resolve(results)
        })
    }).catch((e) => {
      console.log("Try to get it", e)
    })
  })
}

Third.prototype.initDB = function () {
  console.log(`Starting DB in ${this.db_path}`)
  this.db = new ReasonDB(this.db_path, "@key",ReasonDB.JSONBlockStore,false,true,{saveIndexAsync: true})
}

module.exports = function () {
  return new Third()
}

module.exports = new Third()

