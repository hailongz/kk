(function () {

    if (kk.basePath === undefined) {
        kk.basePath = '';
    }

    var httpProxys = [];
    var httpTasks = {};
    var autoId = 0;
    var httpSend = kk.http.send;

    var http = function (options) {

        var data = {};

        for (var key in options) {
            var v = options[key];
            if (typeof v != 'function') {
                data[key] = v;
            }
        }

        var id = (++autoId);

        httpTasks[id] = options;

        $.ajax({
            url: '/_http',
            type: 'POST',
            dataType: options.type || 'json',
            contentType: "application/json",
            data: JSON.stringify(data),
            headers: options.headers,
            success: function (data) {
                var options = httpTasks[id];
                if (options) {
                    delete httpTasks[id];
                    if (typeof options.onload == 'function') {
                        options.onload(data);
                    }
                }
            },
            error: function (e) {
                var options = httpTasks[id];
                if (options) {
                    delete httpTasks[id];
                    if (typeof options.onfail == 'function') {
                        options.onfail(e + '');
                    }
                }
            }
        });

        return {
            cancel: function () {
                delete httpTasks[id];
            }
        };
    };

    kk.http.send = function (options) {
        var url = options.url || '';
        for (var i = 0; i < httpProxys.length; i++) {
            var p = httpProxys[i];
            if (p.prefix && url.startsWith(p.prefix)) {
                if (options.data && p.data) {
                    for (var key in p.data) {
                        options.data[key] = p.data[key];
                    }
                }
                return http(options);
            }
        }
        return httpSend(options);
    };

    var main = function (config) {

        var app = new kk.Application();

        app.config = config;

        if (config && config.app) {
            for (var key in config.app) {
                app.data.set([key], config.app[key]);
            }
        }

        if (config && config.http) {
            httpProxys = config.http;
        } else {
            httpProxys = [];
        }

        var query = app.data.get(["query"]) || {};

        (window.location.search || '').replace(/([^&=\?]+)=([^&=\?]*)/g, function (text, name, value) {
            query[name] = decodeURIComponent(value);
        });

        app.data.set(["hash"], window.location.hash);
        app.data.set(["query"], query);

        if (window.appObject) {
            for (var key in appObject) {
                app.data.set([key], appObject[key]);
            }
        }

        app.data.on(["alert"], function (data) {
            alert(data);
        });

        (function () {

            var updatting = false;

            app.data.on(["hash"], function (v) {
                updatting = true;
                window.location.hash = v;
                updatting = false;
            });

            var fn;

            fn = function () {

                if (window.location.hash != app.data.get(["hash"])) {
                    if (!updatting) {
                        app.data.set(["hash"], window.location.hash);
                    }
                }

                setTimeout(fn, 600);
            };

            setTimeout(fn, 600);

        })();

        app.run(kk.basePath + "/app.json?v=" + (query["v"] || ''), document.getElementById('kk-app'));

        if (kk.app === undefined) {
            kk.app = app;
        }
    };

    if (kk.config === undefined) {
        $.ajax({
            method: 'GET',
            url: kk.basePath + '/.config.json',
            dataType: 'json',
            error: function (e) {
                main();
            },
            success: function (data) {
                main(data);
            }
        });
    } else {
        main(kk.config);
    }

})();
