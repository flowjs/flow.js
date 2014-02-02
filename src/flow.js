/**
 * File uploader
 * @name flow
 * @param {Object} $options
 */
function flow($options) {

  /**
   * @name flow.options
   * @type {Object}
   */
  $options = extend({
    fileConstructor: noop,
    sliceConstructor: noop,
    defaultChunkSize: 41943040//4Mb
  }, $options);

  var event = events();
  var $fire = event.fire;
  var $chunkSize = $options.defaultChunkSize;

  /**
   * @name flow.files
   * @type {Array}
   */
  var $files = [];

  var $flow = {
    'files': $files,
    'options': $options,

    'on': event.on,
    'off': event.off,
    'addFile': addFile,
    'addFiles': addFiles,
    'upload': upload
  };
  return $flow;

  /**
   * @param {File} file
   */
  function fileConstructor(file) {
    var obj = {
      file: file,
      name: file.name,
      size: file.size
    };
    $options.fileConstructor.call(obj, $flow);
    return obj;
  }


  /**
   * Construct and validate file
   * @name flow.addFile
   * @param {File|Blob} file
   */
  function addFile(file) {
    return addFiles([file]);
  }

  /**
   * Construct and validate file list
   * @name flow.addFiles
   * @param {FileList|Array.<Blob>} fileList
   */
  function addFiles(fileList) {
    var list = [];
    each(fileList, function (file) {
      list.push(fileConstructor(file));
    });
    if ($fire('validateFileList', list).defaultPrevented) {
      return [];
    }
    each(list, function (file) {
      if (!$fire('validateFile', file).defaultPrevented) {
        $files.push(file);
      }
    });
    $fire('filesAdded', list);
    return list;
  }

  function upload() {
    uploadNext();
  }

  function uploadNext() {
    var requestSize = 0;
    var data = [];
    var file;
    while (requestSize < $chunkSize && (file = next())) {
      var slice = sliceFile(file, $chunkSize - requestSize);
      $options.sliceConstructor.call(slice, $flow);
      requestSize += slice.size;
      data.push(file);
    }
  }

  function next(i) {
    for (i = i || 0; i < $files.length; i++) {
      if (!$files[i].completed) {
        return $files[i];
      }
    }
    return null;
  }
}