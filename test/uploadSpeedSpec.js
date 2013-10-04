describe('calculate upload speed', function() {
  /**
   * @type {Flow}
   */
  var flow;
  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr;
  /**
   * @type {FakeXMLHttpRequest[]}
   */
  var requests = [];

  beforeEach(function () {
    flow = new Flow({
      generateUniqueIdentifier: function (file) {
        return file.size;
      },
      testChunks: true
    });
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  it('should have upload speed', function() {
    flow.addFile(new Blob(['0123456789']));
    var file = flow.files[0];
    expect(file.currentSpeed).toBe(0);
    expect(file.averageSpeed).toBe(0);
    /*
     * @todo sinon does not support mocking upload progress, test for later
     */
  });
});