describe('flow', function () {
  /** @type {flow} */
  var flowObj;

  beforeEach(function () {
    flowObj = flow();
  });

  it('should create flow object with event handling', function () {
    expect(flowObj.on).toBeDefined();
    expect(flowObj.off).toBeDefined();
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

    it('should validate all added files', function () {
      var validate = jasmine.createSpy('validate files');
      flowObj.on('validateFileList', validate);
      addFiles();
      expect(validate.callCount).toBe(1);
      expect(flowObj.files.length).toBe(2);
    });

    it('should reject all added files', function () {
      var validate = jasmine.createSpy('validate files').andCallFake(function (event, file) {
        event.preventDefault();
      });
      flowObj.on('validateFileList', validate);
      addFiles();
      expect(validate.callCount).toBe(1);
      expect(flowObj.files.length).toBe(0);
    });

    it('should validate every file', function () {
      var validate = jasmine.createSpy('validate file').andCallFake(function (event, file) {
        if (file.name == 'one') {
          event.preventDefault();
        }
      });
      flowObj.on('validateFile', validate);
      addFiles();
      expect(validate.callCount).toBe(2);
      expect(flowObj.files.length).toBe(1);
      expect(flowObj.files[0].name).toBe('two');
    });

    it('should notify then files are added to queue', function () {
      var notify = jasmine.createSpy('files added callback')
      flowObj.on('filesAdded', notify);
      addFiles();
      expect(notify.callCount).toBe(1);
      expect(notify.mostRecentCall.args[1].length).toBe(2);
    });

  });


  describe('addFile', function () {
    it('should behave same as addFiles', function () {
      var file = fileMock([], 'file');
      flowObj.addFile(file);
      expect(flowObj.files.length).toBe(1);
    });
  });

});