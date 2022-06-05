function IndexKey({
        kind,
        path,
        data,
        reference,
        expiration
                }) {
        return [kind, path, data, reference, expiration];
}

export {IndexKey as default, IndexKey};