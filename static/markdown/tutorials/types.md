In addition to standard JavaScript primitive data types, `ReasonDB` can store the values `NaN`, `Infinity`, and `-Infinity`.

All properties are indexed and unless an object is marked as atomic, nested objects are replaced with their index key `<className>@<uid>` during serialization. With the future introduction of schema, indexing will become optional.

In some cases, objects can be restored directly from their key value. For example, Dates are not stored directly in the database, they are stored as keys of the form `Date@<milliseconds>`. This conserves RAM and also avoids un-necessry disk access. However, it is generally transparent to the database developer due to the automatic serializing and de-serializing of data by `ReasonDB`.

Additional custom types can be created that leverage the above approach when minimal data is required to define an object, e.g. `GeoPoint` is currently under development. How to add these types of classes will be documented in a future release.

`ReasonDB` does not currently support fixed precision or big decimal math; hence, it should not be used for financial applications requiring substative accounting.