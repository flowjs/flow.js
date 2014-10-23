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
  window.FormData.prototype.toObject = function () {
    this.keys = this.keys || [];
    var obj = {};
    for (var i=0; i<this.keys.length; i++) {
      var path = this.keys[i];
      var value = this.values[i];
      var pathOfKeys = path.split('[');
      var pointer, prevPointer = pointer = obj;
      var key, prevKey = key = '';
      for (var j=0; j<pathOfKeys.length; j++) {
        if (key) {
          prevKey = key;
          prevPointer = pointer;
          pointer = pointer[key];
        }
        key = pathOfKeys[j].replace(/[\]]+/g, '');
        pointer[key] = pointer[key] || {};
      }
      if (isNumeric(key)) {
        pointer = prevPointer[prevKey] = tryConvertToArray(pointer);
      }
      pointer[key] = value;
    }
    return obj;
  };
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  function tryConvertToArray(obj) {
    var i;
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (!isNumeric(i)) {
          return obj;
        }
      }
    }
    var a = [];
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        a[i] = obj[i];
      }
    }
    return a;
  }
})(window);