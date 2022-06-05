import Schema from "../src/schema.js";
import additionalProperties from "./user.js";

const SchemaSchema = new Schema(
    {
        forClassName: "Schema",
        manage: {
            timestampWrite: true,
            versioning: true,
            expiration: {
                ttl: Infinity,
                updateTTLOnWrite: true,
            }
        },
        secure: {
            // values for roles are either true, false, or a map of allowed or disallowed properties
            // attempts to create and update disallowed items will throw errors unless onViolation overrides
            onViolation: { // the defaults, can be overridden for each access type
                error: true, // throw error
                log: true, // log to sercurity log
                removeProperty: true, // remove the violating portion of an object, note ignored for read which always just drops
            },
            _: {
                roles: {
                    dba: true,
                    admin: true
                }
            }
        },
        validate: {
            additionalProperties: true,
            pattern: {
                forClassName: {
                    //$and: {
                        $typeof: "string",
                        $isUnique: true
                   // }
                },
                manage: {
                    $optional: {
                        $typeof: "object",
                        timestampRead: {
                            $default: false,
                            $typeof: "boolean"
                        },
                        timestampWrite: {
                            $default: true,
                            $typeof: "boolean"
                        },
                        versioning: {
                            $default: false,
                            $typeof: "boolean"
                        },
                        expiration: {
                            $optional: {
                                $typeof: "object",
                                ttl: {
                                    $default: Infinity,
                                    $typeof: "number"
                                },
                                updateTTLOnRead: {
                                    $default: false,
                                    $typeof: "boolean"
                                },
                                updateTTLOnWrite: {
                                    $default: true,
                                    $typeof: "boolean"
                                }
                           }
                        }

                    }
                },
                validate: {
                    $optional: {
                        additionalProperties: {
                            $default: false,
                            $typeof: "boolean"
                        },
                        pattern: {
                            $typeof: "object"
                        }
                    }
                },
                secure: {
                    $optional: {
                        $typeof: "object",
                        onViolation: {
                            $typeof: "object",
                            error: {
                                $optional: {
                                    $typeof: "boolean"
                                }
                            },
                            log: {
                                $optional: {
                                    $typeof: "boolean"
                                }
                            },
                            removeProperty: {
                                $optional: {
                                    $typeof: "boolean"
                                }
                            }
                        },
                        create: {
                            $typeof: "object"
                        },
                        read: {
                            $typeof: "object"
                        },
                        update: {
                            $typeof: "object"
                        },
                        delete: {
                            $typeof: "object"
                        }
                    }
                },
                compute: {
                    $optional: {
                        $typeof: "object"
                    }
                },
                aggregate: {
                    $optional: {
                        $typeof: "object"
                    }
                },
                triggers: {
                    $optional: {
                        $typeof: "object",
                        $values: {
                            on: {
                                $typeof: "object",
                                put: {
                                    $optional: {
                                        $typeof: "object"
                                    }
                                }
                            },
                            dispatch: {
                                $typeof: "object"
                            }
                        }
                    }
                }
            }
        }
    });

export {SchemaSchema as default, SchemaSchema}