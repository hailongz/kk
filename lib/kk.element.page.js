//按钮
(function () {


    kk.PageElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.PageElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "path") {
                this.open(value);
            }
        },

        setView: function (view) {
            if (this._page) {
                this._page.recycle();
                delete this._page;
            }
            kk.ViewElement.prototype.setView.apply(this, arguments);
        },

        open: function (path) {

            if (!this.view) {
                return false;
            }

            if (this._page && this._page.data.get(["path"]) == path) {
                return true;
            }

            if (this._page) {
                this._page.recycle();
            }

            var element = this;
            var page = this._page = new kk.Page(kk.getApp());

            page.data.set(["path"], path);
            page.data.set(["query"], this.data());
            
            page.data.on(["action", "close"], function (data) {
                var e = new kk.ElementEvent(element);
                e.data = data;
                element.emit("close", e);
            });

            page.data.on(["action", "open"], function (data) {
                var e = new kk.ElementEvent(element);
                e.data = data;
                element.emit("open", e);
            });

            page.open(path);

            page.obtainView(this.view);

        },

        createView: function () {
            var e = document.createElement("div");
            e.setAttribute("class", "kk-view kk-page");
            return e;
        }

    });

})();
