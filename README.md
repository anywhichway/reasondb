# reasondb

A multi model 100% JavaScript database supporting:

1) key/values, graphs, documents

2) Industry standard [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage) (except `ReasonDB` is asynchronous), or a graph API similar to [GunDB](https://gun.eco/), or SQL like syntax.

3) Can be used with almost any key/value backing store.

4) joins

6) standard array like functions for iterating over results, e.g. `map`, `forEach`, etc.

7) inline functions or over 30 pre-defined predicates, e.g. $eq, $gt, $isIPAddress

8) automatic data expiration based on dates or durations

9) full text indexing

Full documentation is available at https://anywhichway.github.io/reasondb

## Updates (reverse chronological order)

2019-01-19 v1.0.4b Corrected years in this update list. Enhanced JOQULAR to support projections and validation.

2019-01-13 v1.0.3b Basic replication now working.

2019-01-12 v1.0.2b Documentation enhancements. Added `update` to SQL like commands and statistical methods to cursors.

2019-01-03 v1.0.1b Merged AnyWhichWay into ReasonDB. NOTE: There are substantial API and functonality changes. Databases and applications developed with v0.*.* are not compatible.

2017-05-23 v0.3.2 Improved fastForEach

2017-02-12 v0.3.1 Added full-text indexing and search. See `.fullTextKeys` and `$search` in documentation. Refactored 20 un-necessary nested Promises. Added fastForEach. Added minified version of `src/index.js` for Chrome and node v7.x users.

2017-02-10 v0.3.0 Code base made more modular with respect to server side drivers. Drivers must now be loaded separately. See documentation above. Added a `deferKeys` option to classes that prevents
a full index being created on a property but still allows the property to be queried using JOQULAR. Addressed a scoping issue with `JSONBlockStore` that prevented it from restoring classes properly in some situations.

2017-02-10 v0.2.10 Fixed Issue 19.

2017-01-21 v0.2.9 Added `limit(count)` and `page(offset)` to `select` added `.page(page,size)` to `Cursor` instances which returns reduced size cursor.

2017-01-17 v0.2.8 Fixed Issue 15, changes to intersection in v2.6 had been copied from a non-strict codebase and broke during babelify with no errors during compile.

2017-01-11 v0.2.7 Fixed Issue 13 where updates were being saved to the Object index when a constructor could not be found for the classes of objects being updated. 

2016-12-23 v0.2.6 Added more performant intersection. Added issues folder under test for managing resolution to issue reports.

2016-12-01 v0.2.5 Added function queries. `where` clause can now be a function that returns an array of rows of objects and ignores the normal look-up process, i.e. array of arrays. ReasonDB continues to handle projections and statistical sampling or row count limits.

2016-11-29 v0.2.4 Added `skipKeys` as a class configuration option to prevent indexing of specified properties.

2016-11-27 v0.2.3 Added `saveIndexAsync:true` as a database startup option. Saves indexes only during idle time, tripling or quadrupling insert speed for locally hosted databases.

2016-11-25 v0.2.2 Introduced the use of `const` producing substantial performance improvements. Tested against local copy of Redis.

2016-11-24 v0.2.1 Updated examples to use `/lib/uuid.js` since the update to v3.0.0 of `uuid` made `uuid` not directly browser loadable. Documentation updates.

2016-11-23 v0.1.9 Documentation updates, code quality improvements.

2016-11-23 v0.1.8 Documentation updates, code quality improvements updated uuid package to v3.0.0.

2016-11-20 v0.1.7 Documentation updates.

2016-11-20 v0.1.6 Added JSONBlockStore.

2016-11-15 v0.1.5 Added performance tests in `examples/load` directory.

2016-11-13 v0.1.4 Further optimizations to ensure action sequencing is correct when using a remote datastore. This fixed issues with Redis. Simplified coding to add new persistence stores.

2016-11-02 v0.1.3 Optimizations to help ensure all the actions required to support one change to a data element are complete prior to initiating another on the same element. This involved replacing Promise calls is functions with a passed reference to the resolver for a top level Promise. Added support for multiple arguments for `insert`, `delete`. Added LevelUpStore. Identified an fixed a couple of edge case Promises that contained `this` references. Corrected a join issue that resulted in right sides that were unrestricted for Redis and Memcache.

2016-10-31 v0.1.2 1.1 was pushed with incorrect test case config.

2016-10-31 v0.1.1 Added support for IronCache, Redis, and Memcached. Improved documentation.

2016-10-30 v0.1.0 Added `first`, `random`, and `sample` to `select`. Made cursor calls to `forEach`, `every`, `some`, `get` asynchronous. See documentation for rationale. Deprecated shared indexes, they did not scale well under volume and made working with localStorage somewhat obscure. This resulted in dropping the `as` clause for `insert`.

2016-10-28 v0.0.6 Added Update statement. Enhanced database to take a start-up flag that makes activating objects for automatic database and index update optional. Repaired 'delete' which broke when cursor.count was changed to a function. Added documentation. Published to npm.

2016-10-27 v0.0.5 Added documentation. Repaired 'when' which broke when cursor.count was changed to a function. Published to npm.

2016-10-26 v0.0.4 Added documentation. Changed `count` on Cursor instances to a function and added `maxCount` as a data member. Not published to npm.

2016-10-25 v0.0.3 First npm publication.

Prior to being re-named, ReasonDB existed as the first auto-synchronizing in-memory JavaScript object database JOQULAR, originally published in April of 2015.


## License

This software is provided as-is under the [MIT license](https://opensource.org/licenses/MIT).
