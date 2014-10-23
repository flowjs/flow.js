describe('flow', function () {
  /** @type {flow} */
  var flowObj;

  beforeEach(function () {
    flowObj = flow();
  });

  function addTwoFiles() {
    flowObj.addFiles([
      fileMock([], 'one'),
      fileMock([], 'two')
    ]);
  }

  describe('addFiles', function () {
    it('should add new files to queue', function () {
      addTwoFiles();
      expect(flowObj.files.length).toBe(2);
    });

    it('should allow to add custom properties for files with custom constructor', function () {
      var i = 0;
      flowObj.options.fileConstructor = function () {
        this.id = i++;
      };
      addTwoFiles();
      expect(flowObj.files.length).toBe(2);
      expect(flowObj.files[0].id).toBe(0);
      expect(flowObj.files[1].id).toBe(1);
    });
  });

  describe('filterFileList', function () {
    var filterFileList;
    function createFilter(cb) {
      filterFileList = jasmine.createSpy('filter files').and.callFake(cb);
      flowObj.options.filterFileList = filterFileList;
    }
    it('should reject all added files', function () {
      createFilter(function () {
        return [];
      });
      addTwoFiles();
      expect(filterFileList.calls.count()).toBe(1);
      expect(flowObj.files.length).toBe(0);
    });

    it('should reject files with name "one"', function () {
      createFilter(function (files) {
        var list = [];
        each(files, function (file) {
          if (file.name != 'one') {
            list.push(file);
          }
        });
        return list;
      });
      addTwoFiles();
      expect(filterFileList.calls.count()).toBe(1);
      expect(flowObj.files.length).toBe(1);
      expect(flowObj.files[0].name).toBe('two');
    });

    it('should allow to change current files array and reject false values', function () {
      createFilter(function (files) {
        return files.map(function (file) {
          return file.name != 'one' && file;
        });
      });
      addTwoFiles();
      expect(filterFileList.calls.count()).toBe(1);
      expect(flowObj.files.length).toBe(1);
      expect(flowObj.files[0].name).toBe('two');
    });
  });

  describe('onFilesAdded', function () {
    var notify;
    beforeEach(function () {
      notify = jasmine.createSpy('files added callback');
      flowObj.options.onFilesAdded = notify;
      addTwoFiles();
    });
    it('should notify then files are added to queue', function () {
      expect(notify.calls.count()).toBe(1);
    });
    it('first argument should be array of files', function () {
      expect(notify.calls.mostRecent().args[0].length).toBe(2);
    });
  });

  describe('every file should have unique id by default', function () {
    beforeEach(function () {
      flowObj.addFile(
        fileMock(['abc'], 'one', {
          relativePath: 'home/one'
        })
      );
    });
    it('should generate id', function () {
      expect(flowObj.files[0].id).toBe('3-home/one');
    });
    it('should reject same files', function () {
      flowObj.addFile(
        fileMock(['abc'], 'one', {
          relativePath: 'home/one'
        })
      );
      expect(flowObj.files.length).toBe(1);
    });
  });

  describe('onDuplicateFilesAdded', function () {
    // duplicate files must be filtered in filterFileList
  });

  describe('getById', function () {
    beforeEach(function () {
      addTwoFiles();
    });
    it('should get file by id', function () {
      expect(flowObj.getById('0-one')).toBe(flowObj.files[0])
    });
    it('should return null if file was not found', function () {
      expect(flowObj.getById('none')).toBe(null);
    });
  });

  describe('relativePath', function () {
    beforeEach(function () {
      var file = fileMock([], 'one');
      file.relativePath = 'C:/one';
      flowObj.addFiles([
        file,
        fileMock([], 'two')
      ]);
    });
    it('should get file relative path', function () {
      expect(flowObj.files[0].relativePath).toBe('C:/one')
    });
    it('should return name if relative path is not available', function () {
      expect(flowObj.files[1].relativePath).toBe('two');
    });
  });

  describe('extension - file should have a valid extension property', function () {
    function fileExtension(name) {
      flowObj.addFile(
        fileMock([], name)
      );
      return flowObj.files[0].extension;
    }
    it('should get extension', function() {
      expect(fileExtension('image.jpg')).toBe('jpg');
    });
    it('should get extension for empty file name', function() {
      expect(fileExtension('')).toBe('');
    });
    it('should get extension for file without it', function() {
      expect(fileExtension('image')).toBe('');
    });
    it('should get extension in lowercase', function() {
      expect(fileExtension('.dwq.dq.wd.qdw.E')).toBe('e');
    });
  });
});