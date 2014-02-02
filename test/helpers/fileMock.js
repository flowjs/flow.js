/**
 * Html5 File mock
 * @param {Array.<Blob>} data
 * @param {string} name
 * @param {Object} properties
 * @returns {Blob}
 */
function fileMock(data, name, properties) {
  var b = new Blob(data, properties || {});
  b.name = name;
  if (properties && properties.lastModified) {
    b.lastModified = properties.lastModified;
  }
  return b;
}