describe('flow', function () {
  /** @type {flow} */
  var flowObj;

  beforeEach(function () {
    flowObj = flow();
  });

  describe('addFiles', function () {
    function addFiles() {
      flowObj.addFiles([
        fileMock([], 'one'),
        fileMock([], 'two')
      ]);
    }

    it('should add new files', function () {
      addFiles();
      expect(flowObj.files.length).toBe(2);
    });

    it('should use custom constructor', function () {
      var i = 0;
      flowObj.options.fileConstructor = function () {
        this.id = i++;
      };
      addFiles();
      expect(flowObj.files.length).toBe(2);
      expect(flowObj.files[0].id).toBe(0);
      expect(flowObj.files[1].id).toBe(1);
    });

    describe('filterFileList', function () {
      var filterFileList;
      function createFilter(cb) {
        filterFileList = jasmine.createSpy('filter files').andCallFake(cb);
        flowObj.options.filterFileList = filterFileList;
      }
      it('should reject all added files', function () {
        createFilter(function () {
          return [];
        })
        addFiles();
        expect(filterFileList.callCount).toBe(1);
        expect(flowObj.files.length).toBe(0);
      });

      it('should validate every file', function () {
        createFilter(function (files) {
          var list = [];
          each(files, function (file) {
            if (file.name != 'one') {
              list.push(file);
            }
          });
          return list;
        });
        addFiles();
        expect(filterFileList.callCount).toBe(1);
        expect(flowObj.files.length).toBe(1);
        expect(flowObj.files[0].name).toBe('two');
      });

      it('should validate every file in short syntax', function () {
        createFilter(function (files) {
          return files.map(function (file) {
            return file.name != 'one' && file;
          });
        });
        addFiles();
        expect(filterFileList.callCount).toBe(1);
        expect(flowObj.files.length).toBe(1);
        expect(flowObj.files[0].name).toBe('two');
      });
    });


    it('should notify then files are added to queue', function () {
      var notify = jasmine.createSpy('files added callback');
      flowObj.options.onFilesAdded = notify;
      addFiles();
      expect(notify.callCount).toBe(1);
      expect(notify.mostRecentCall.args[0].length).toBe(2);
    });

  });

  describe('every file should have id by default', function () {
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
    describe('getById', function () {
      it('should get file by id', function () {
        expect(flowObj.getById('3-home/one')).toBe(flowObj.files[0])
      });
      it('should return null if file was not found', function () {
        expect(flowObj.getById('fqwf')).toBe(null);
      });
    });
  });

  describe('extension', function () {
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