/*
=====================================================
Gospel Reading Tracker
Version 1.0
Production Service Worker

Automatic Update + Offline Support
=====================================================
*/

"use strict";

/* =====================================================
CACHE CONFIGURATION
===================================================== */

const CACHE_VERSION = "grt-v1.0.2";

const APP_CACHE = `${CACHE_VERSION}-app`;

const DATA_CACHE = `${CACHE_VERSION}-data`;


/* =====================================================
APPLICATION FILES
===================================================== */

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./1.png",
    "./2.png"
];


/* =====================================================
BIBLE DATA FILES
===================================================== */

const DATA_FILES = [
    "./data/bible-plan.json",
    "./data/books/john.json",
    "./data/books/mark.json",
    "./data/books/matthew.json",
    "./data/books/luke.json",
    "./data/books/acts.json"
];


/* =====================================================
INSTALL
===================================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            Promise.all([

                caches.open(APP_CACHE)
                    .then(cache => {

                        return cache.addAll(
                            APP_FILES
                        );

                    }),

                caches.open(DATA_CACHE)
                    .then(cache => {

                        return cache.addAll(
                            DATA_FILES
                        );

                    })

            ])
                .then(() => {

                    /*
                    Activate the new Service Worker
                    immediately.
                    */

                    return self.skipWaiting();

                })

        );

    }
);


/* =====================================================
ACTIVATE
===================================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()

                .then(cacheNames => {

                    return Promise.all(

                        cacheNames.map(
                            cacheName => {

                                /*
                                Delete every old
                                Gospel Reading Tracker
                                cache.
                                */

                                if (
                                    cacheName !== APP_CACHE &&
                                    cacheName !== DATA_CACHE
                                ) {

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                                return Promise.resolve();

                            }
                        )

                    );

                })

                .then(() => {

                    /*
                    Take control of all open
                    pages immediately.
                    */

                    return self.clients.claim();

                })

        );

    }
);


/* =====================================================
FETCH HANDLER
===================================================== */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
        Only handle GET requests.
        */

        if (
            request.method !== "GET"
        ) {

            return;

        }


        /*
        Ignore external requests.
        */

        if (
            !request.url.startsWith(
                self.location.origin
            )
        ) {

            return;

        }


        /*
        =================================================
        NAVIGATION
        =================================================

        Online:
        Load the newest page.

        Offline:
        Use cached index.html.
        */

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const clone =
                                response.clone();


                            caches.open(
                                APP_CACHE
                            )
                                .then(cache => {

                                    cache.put(
                                        request,
                                        clone
                                    );

                                });

                        }


                        return response;

                    })

                    .catch(() => {

                        return caches.match(
                            request
                        )
                            .then(cachedResponse => {

                                if (
                                    cachedResponse
                                ) {

                                    return cachedResponse;

                                }


                                return caches.match(
                                    "./index.html"
                                );

                            });

                    })

            );

            return;

        }


        /*
        =================================================
        APPLICATION FILES
        =================================================

        Online:
        Always check the network for
        the newest CSS / JS / images.

        Offline:
        Use the cached version.
        */

        if (
            isApplicationAsset(request)
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const clone =
                                response.clone();


                            caches.open(
                                APP_CACHE
                            )
                                .then(cache => {

                                    cache.put(
                                        request,
                                        clone
                                    );

                                });

                        }


                        return response;

                    })

                    .catch(() => {

                        return caches.match(
                            request
                        );

                    })

            );

            return;

        }


        /*
        =================================================
        BIBLE DATA
        =================================================

        Online:
        Get the newest JSON.

        Offline:
        Use cached JSON.
        */

        if (
            isDataRequest(request)
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const clone =
                                response.clone();


                            caches.open(
                                DATA_CACHE
                            )
                                .then(cache => {

                                    cache.put(
                                        request,
                                        clone
                                    );

                                });

                        }


                        return response;

                    })

                    .catch(() => {

                        return caches.match(
                            request
                        );

                    })

            );

            return;

        }


        /*
        =================================================
        OTHER SAME-ORIGIN REQUESTS
        =================================================

        Network first with cache fallback.
        */

        event.respondWith(

            fetch(request)

                .then(response => {

                    if (
                        response &&
                        response.ok
                    ) {

                        const clone =
                            response.clone();


                        caches.open(
                            APP_CACHE
                        )
                            .then(cache => {

                                cache.put(
                                    request,
                                    clone
                                );

                            });

                    }


                    return response;

                })

                .catch(() => {

                    return caches.match(
                        request
                    );

                })

        );

    }
);


/* =====================================================
APPLICATION ASSET DETECTION
===================================================== */

function isApplicationAsset(request) {

    const url =
        new URL(
            request.url
        );


    const pathname =
        url.pathname.toLowerCase();


    return (

        pathname.endsWith(
            "/index.html"
        ) ||

        pathname.endsWith(
            "/style.css"
        ) ||

        pathname.endsWith(
            "/script.js"
        ) ||

        pathname.endsWith(
            "/manifest.json"
        ) ||

        pathname.endsWith(
            "/1.png"
        ) ||

        pathname.endsWith(
            "/2.png"
        )

    );

}


/* =====================================================
DATA REQUEST DETECTION
===================================================== */

function isDataRequest(request) {

    const url =
        new URL(
            request.url
        );


    return (
        url.pathname.includes(
            "/data/"
        )
    );

}