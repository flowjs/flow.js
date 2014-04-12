function toFormData(value) {
  var form = new FormData();
  iterate('', value, true);
  return form;

  function iterate(name, value, first) {
    if (Array.isArray(value)) {
      each(value, function (value, key) {
        iterate(name + '[' + key + ']', value);
      });
    } else if (value instanceof Blob) {
      form.append(name, value, value.name);
    } else if (value === Object(value)) {
      each(value, function (value, key) {
        if (first) {
          iterate(key, value);
        } else {
          iterate(name + '[' + key + ']', value);
        }
      });
    } else {
      form.append(name, value);
    }
  }
}