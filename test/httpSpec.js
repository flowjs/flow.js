describe('http', function () {
  /**
   * @type {FakeXMLHttpRequest[]}
   */
  var requests = [];

  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr;

  beforeEach(function () {
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  describe('execute request', function () {
    var request;
    beforeEach(function () {
      request = http({url:'a.txt'});
    });
    it('should return xhr', function () {
      expect(request.xhr).toBeDefined();
    });
    it('should send http request', function () {
      expect(requests.length).toBe(1);
      expect(requests[0].url).toBe('a.txt');
    });
    it('should set accept header', function () {
      expect(requests[0].requestHeaders.Accept).toBe('application/json, text/plain, */*');
    });
  });


  it('should call complete event', function () {
    var complete = jasmine.createSpy('complete');
    http({
      url:'a.txt',
      onComplete: complete
    });
    requests[0].respond(200);
    expect(complete).toHaveBeenCalled();
  });
  it('should call progress event', function () {
    var progress = jasmine.createSpy('progress');
    http({
      url:'a.txt',
      onProgress: progress
    });
    requests[0].uploadProgress({loaded: 1, total:55, lengthComputable: true});
    expect(progress).toHaveBeenCalled();
    expect(progress.mostRecentCall.args[0]).toBe(1);
    expect(progress.mostRecentCall.args[1]).toBe(55);
  });


  describe('params', function () {
    it('should append parameters to url', function () {
      http({url:'a.txt', params: {a:1}});
      expect(requests[0].url).toBe('a.txt?a=1');
    });
    it('should append parameters to url with query', function () {
      http({url:'a.txt?b=1', params: {a:'b'}});
      expect(requests[0].url).toBe('a.txt?b=1&a=b');
    });
    it('should encode parameters', function () {
      http({url:'a.txt', params: {'a[b ]':'c&d'}});
      expect(requests[0].url).toBe('a.txt?a[b+]=c%26d');
    });
  });
});