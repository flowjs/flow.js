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
    flowObj.addFiles([
      fileMock([], 'one'),
      fileMock([], 'two')
    ]);

    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  it('should start upload', function () {
    flowObj.upload();
    expect(requests.length).toBe(0);
  });
});