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
    onFilesAdded: noop,
    filterFileList: identity,
    defaultChunkSize: 41943040//4Mb
  }, $options);

  var $chunkSize = $options.defaultChunkSize;

  /**
   * @name flow.files
   * @readonly
   * @type {Array}
   */
  var $files = [];

  /**
   * Files to be uploaded
   * @name flow.pendingFiles
   * @readonly
   * @type {Array}
   */
  var $pendingFiles = [];

  /**
   * id - file map
   * @name flow.map
   * @readonly
   * @type {Object}
   */
  var $map = {};

  var $flow = {

    'files': $files,
    'pendingFiles': $pendingFiles,

    /**
     * Indicates if file si uploading
     * @name flow.isUploading
     * @type {boolean}
     */
    'isUploading': false,

    'options': $options,
    'map': $map,

    /**
     * GEt file by id
     * @name flow.getById
     * @param id
     * @returns {Object|null}
     */
    'getById': function getById(id) {
        return $map[id] || null;
    },

    /**
     * Construct and validate file.
     * Shortcut for addFiles
     * @name flow.addFile
     * @param {Blob|File} file
     */
    'addFile': function addFile(file) {
      $flow.addFiles([file]);
    },

    /**
     * Construct and validate file list
     * @name flow.addFiles
     * @param {FileList|Array.<Blob>} fileList
     */
    'addFiles': function addFiles(fileList) {
      var list = [].concat(fileList).map(fileConstructor);
      list = $options.filterFileList(list);
      each(list, function (file) {
        if (file && !$flow.getById(file.id)) {
          $files.push(file);
          $pendingFiles.push(file);
          $map[file.id] = file;
        }
      });
      $options.onFilesAdded(list);
      return list;
    },

    'upload': function upload() {
      if ($flow.isUploading) {
        return ;
      }
      if (!$pendingFiles.length) {
        return ;
      }
      $flow.isUploading = true;
      openConnection();
    }
  };
  return $flow;

  /**
   * @param {File} file
   */
  function fileConstructor(file) {
    var obj = {
      file: file,
      name: file.name,
      size: file.size,
      relativePath: file.relativePath || file.webkitRelativePath || file.name,
      extension: file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2).toLowerCase(),

      inProgress: false,
      completed: false,
      progress: 0
    };
    obj.id = obj.size + '-' + obj.relativePath;
    $options.fileConstructor.call(obj, $flow);
    return obj;
  }

  function openConnection() {
//      var request = requestConstructor();
      http({
        method: 'POST',
        data: new FormData
      });
  }
}