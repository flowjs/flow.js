describe('flow.pause', function () {

  /** @type {flow} */
  var flowObj;

  /**
   * @type {FakeXMLHttpRequest[]}
   */
  var requests = [];

  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr;

  beforeEach(function () {
    flowObj = flow({maxRequestSize:1});
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  describe('pause', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock(['123456'], 'one'));
      flowObj.upload();
      flowObj.pause();
    });
    it('should abort active request', function () {
      expect(requests[0].aborted).toBeTruthy();
    });
    it('should not fire additional upload requests', function () {
      expect(requests.length).toBe(1);
    });
    it('should set isPaused to true', function () {
      expect(flowObj.isPaused).toBeTruthy();
    });
    describe('resume', function () {
      beforeEach(function () {
        flowObj.upload();
      });
      it('should set isPaused to false on resume', function () {
        expect(flowObj.isPaused).toBeFalsy();
      });
      it('should fire additional upload request', function () {
        expect(requests.length).toBe(2);
      });
    });
  });

  describe('pause single file', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock(['123456'], 'one'));
      flowObj.addFile(fileMock(['123456'], 'two'));
    });
    it('should add pause method for every file', function () {
      expect(flowObj.files[0].pause).toBeDefined();
    });
    it('should add isPaused property for every file', function () {
      expect(flowObj.files[0].isPaused).toBeFalsy();
    });
    it('should set isPaused property to true on pause', function () {
      flowObj.files[0].pause();
      expect(flowObj.files[0].isPaused).toBeTruthy();
    });
    // it should not upload paused file
    // it should not upload remaining data of paused file
    // it should not allow to pause in progress file?
    // it should be able to resume paused file
  });
});

