var sliceFn = Blob.prototype.slice || Blob.prototype.mozSlice || Blob.prototype.webkitSlice;
/**
 * Creates file slice with params
 * @param file
 * @param size
 * @returns {Object}
 */
function sliceFile(file, size) {
  return sliceFn.call(file.file, file.offset, size);
}