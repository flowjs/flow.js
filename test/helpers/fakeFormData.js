(function (window) {
  window.FormData.prototype._append = window.FormData.prototype.append;
  window.FormData.prototype.append = function (key, value) {
    this.keys = this.keys || [];
    this.values = this.values || [];
    this.keys.push(key);
    this.values.push(value);
    this._append.apply(this, arguments);
  };
  window.FormData.prototype.get = function (key) {
    return this.values[this.keys.indexOf(key)] || null;
  };
})(window);