var sliceFn = Blob.prototype.slice || Blob.prototype.mozSlice || Blob.prototype.webkitSlice;
/**
 * Creates file slice with params
 * @param file
 * @param size
 * @returns {Object}
 */
function sliceFile(file, size) {
  return {
    blob: sliceFn.call(file.file, file.offset, size),
    data: {
      name: file.name,
      size: file.size,
      offset: file.offset
    }
  }
}