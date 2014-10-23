var sliceFn = Blob.prototype.slice || Blob.prototype.mozSlice || Blob.prototype.webkitSlice;
/**
 * Creates file slice with params
 * @param file
 * @param offset
 * @param size
 * @returns {Object}
 */
function sliceFile(file, offset, size) {
  return sliceFn.call(file, offset, size, file.type);
}