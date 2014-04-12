describe('flow.upload', function () {

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
    flowObj = flow();

    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  describe('isUploading', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock([], 'one'));
    });
    it('should set isUploading to true', function () {
      expect(flowObj.isUploading).toBeFalsy();
      flowObj.upload();
      expect(flowObj.isUploading).toBeTruthy();
    });
  });

  describe('single file', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock([], 'one'));
    });
    it('should upload single file', function () {
      flowObj.upload();
      expect(requests.length).toBe(1);
    });
    it('should upload once', function () {
      flowObj.upload();
      flowObj.upload();
      expect(requests.length).toBe(1);
    });
    it('should post as formdata', function () {
      flowObj.upload();
      expect(requests[0].method).toBe('POST');
      expect(requests[0].requestBody instanceof FormData).toBeTruthy();
    });
  });

  describe('file params', function () {
    var requestBody;
    beforeEach(function () {
      flowObj.addFile(fileMock([], 'one'));
      flowObj.upload();
      requestBody = requests[0].requestBody;
    });
    it('should have default params', function () {
      expect(requestBody).toBeTruthy();
    });
  });
});