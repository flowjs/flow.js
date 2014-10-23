/**
 * File uploader
 * @function
 * @param {Object} [opts]
 */
function flow(opts) {

  /**
   * @name flow.options
   * @type {Object}
   */
  var $options = extend({
    request: {},
    fileConstructor: noop,
    onFilesAdded: noop,
    filterFileList: identity,
    maxRequestSize: 41943040//4Mb
  }, opts);

  var $files = [];

  var $map = {};

  /**
   * Last request
   */
  var $xhr;

  var $flow = {
    'options': $options,

    /**
     * @name flow.files
     * @readonly
     * @type {Array}
     */
    'files': $files,

    /**
     * id - file map
     * @name flow.map
     * @readonly
     * @type {Object}
     */
    'map': $map,

    /**
     * Indicates if file is uploading
     * @name flow.isUploading
     * @readonly
     * @type {boolean}
     */
    'isUploading': false,

    /**
     * Indicates if file upload is paused
     * @name flow.isPaused
     * @readonly
     * @type {boolean}
     */
    'isPaused': false,

    /**
     * GEt file by id
     * @function
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
     * @function
     * @name flow.addFile
     * @param {Blob|File} file
     */
    'addFile': function addFile(file) {
      $flow.addFiles([file]);
    },

    /**
     * Construct and validate file list
     * @function
     * @name flow.addFiles
     * @param {FileList|Array.<Blob>} fileList
     */
    'addFiles': function addFiles(fileList) {
      var list = [].concat(fileList).map(fileConstructor);
      list = $options.filterFileList(list);
      each(list, function (file) {
        if (file && !$flow.getById(file.id)) {
          $files.push(file);
          $map[file.id] = file;
        }
      });
      $options.onFilesAdded(list);
      return list;
    },

    /**
     * Start file upload
     * @function
     * @name flow.upload
     */
    'upload': function upload() {
      if ($flow.isUploading) {
        return ;
      }
      $flow.isPaused = false;
      uploadNext();
    },

    /**
     * Pause file upload
     * @function
     * @name flow.pause
     */
    'pause': function pause() {
      $flow.isPaused = true;
      $xhr && $xhr.abort();
    },

    /**
     * Remove file from queue
     * @function
     * @name flow.remove
     * @param id
     */
    remove: function(id) {
      if ($map.hasOwnProperty(id)) {
        arrayRemove($files, $map[id]);
        delete $map[id];
      }
    },

    /**
     * Remove all files from queue
     * @function
     * @name flow.removeAll
     */
    removeAll: function() {
      $files.length = 0;
      each($map, function (value, key) {
        delete $map[key];
      });
    }
  };
  return $flow;

  /**
   * @param {File} file
   */
  function fileConstructor(file) {
    var obj = new FlowFile(file);
    $options.fileConstructor.call(obj, $flow);
    return obj;
  }

  function uploadNext() {
    var data = processFiles();
    if (data.count > 0) {
      $flow.isUploading = true;
      $xhr = http(extend({
        method: 'POST',
        url: '/',
        data: toFormData(data),
        onComplete: handleResponse
      }, evalOpts($options.request, data))).xhr;
    }
  }

  function handleResponse(response) {
    $flow.isUploading = false;
    if (!$flow.isPaused) {
      uploadNext();
    }
  }

  function processFiles() {
    var data = {
      files: {},
      count: 0
    };
    var size = 0;
    each($files, function (file) {
      if (file.completed || $options.maxRequestSize === size) {
        return ;
      }
      var slice = Math.min($options.maxRequestSize - size, file.size - file.offset);
      size += slice;
      data.files[file.id] = {
        name: file.name,
        size: file.size,
        offset: file.offset,
        content: sliceFile(file.file, file.offset, file.offset + slice)
      };
      file.offset += slice;
      data.count++;
      if (file.offset === file.size) {
        file.completed = true;
      }
    });
    return data;
  }
}