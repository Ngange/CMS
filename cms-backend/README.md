# CMS Backend

## Maintenance note: legacy `fullname_1` index

If you see `Duplicate value for fullname` when creating users, drop the old index in the `users` collection (one-time cleanup):

```sh
mongosh "mongodb://localhost:27017/your_database" --eval "db.users.dropIndex('fullname_1')"
```

Then restart the backend (`npm run dev` or `node server.js`) and retry. If `mongosh` is not installed, install the MongoDB shell or run the equivalent in any MongoDB client against the same database.
