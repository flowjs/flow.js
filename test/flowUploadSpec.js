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

  describe('request', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock([], 'one'));
    });
    describe('url', function () {
      it('should set upload target', function () {
        flowObj.options.request.url = '/target';
        flowObj.upload();
        expect(requests[0].url).toBe('/target');
      });
    });
    describe('callback', function () {
      beforeEach(function () {
        flowObj.options.request = function () {
          return {url: '/target'};
        };
        flowObj.upload();
      });
      it('should allow to set a callback for a request', function () {
        expect(requests[0].url).toBe('/target');
      });
      it('should use POST method as a default', function () {
        expect(requests[0].method).toBe('POST');
      });
    });
  });

  describe('isUploading', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock([], 'one'));
    });
    it('should set isUploading to true then upload has started', function () {
      expect(flowObj.isUploading).toBeFalsy();
      flowObj.upload();
      expect(flowObj.isUploading).toBeTruthy();
    });
    it('should set isUploading to false then upload has finished', function () {
      flowObj.upload();
      requests[0].respond(200);
      expect(flowObj.isUploading).toBeFalsy();
    });
  });

  describe('single file upload', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock([], 'one'));
      flowObj.upload();
    });
    it('should upload single file', function () {
      expect(requests.length).toBe(1);
    });
    it('should upload once', function () {
      flowObj.upload();
      expect(requests.length).toBe(1);
    });
    it('should post as formdata', function () {
      expect(requests[0].method).toBe('POST');
      expect(requests[0].requestBody instanceof FormData).toBeTruthy();
    });
  });

  describe('request variables', function () {
    var requestBody;
    beforeEach(function () {
      flowObj.addFile(fileMock(['abc'], 'one'));
      flowObj.upload();
      requestBody = requests[0].requestBody;
    });
    it('should have count', function () {
      expect(requestBody.toObject().count).toBe(1);
    });
    it('should have files', function () {
      expect(requestBody.toObject().hasOwnProperty('files')).toBeTruthy();
    });
    describe('file variables', function () {
      var file;
      beforeEach(function () {
        file = requestBody.toObject().files['3-one'];
      });
      it('should have name', function () {
        expect(file.hasOwnProperty('name')).toBeTruthy();
        expect(file.name).toBe('one');
      });
      it('should have size', function () {
        expect(file.hasOwnProperty('size')).toBeTruthy();
        expect(file.size).toBe(3);
      });
      it('should have offset', function () {
        expect(file.hasOwnProperty('offset')).toBeTruthy();
        expect(file.offset).toBe(0);
      });
      it('should have file content', function () {
        expect(file.hasOwnProperty('content')).toBeTruthy();
        expect(file.content instanceof Blob).toBeTruthy();
      });
    });
  });

  describe('maxRequestSize - request should not exceed defined request max size', function () {
    var request;
    beforeEach(function () {
      flowObj = flow({
        maxRequestSize: 10
      });
      flowObj.addFile(fileMock(['123456'], 'one'));
      flowObj.addFile(fileMock(['123456'], 'two'));
      flowObj.upload();
      request = requests[0].requestBody.toObject();
    });
    it('should transfer first and second file', function () {
      expect(request.files.hasOwnProperty('6-one')).toBeTruthy();
      expect(request.files.hasOwnProperty('6-two')).toBeTruthy();
    });
    it('should send all data of first file', function () {
      var first = request.files['6-one'];
      expect(first.content.size).toEqual(6);
    });
    it('should slice second file to fill remaining request size', function () {
      var second = request.files['6-two'];
      expect(second.content.size).toEqual(4);
    });
    it('should call second request to finish transferring all files in queue', function () {
      requests[0].respond(200);
      expect(requests.length).toBe(2);
    });
    describe('final request', function () {
      beforeEach(function () {
        requests[0].respond(200);
        request = requests[1].requestBody.toObject();
      });
      it('should transfer second file', function () {
        expect(request.files.hasOwnProperty('6-one')).toBeFalsy();
        expect(request.files.hasOwnProperty('6-two')).toBeTruthy();
      });
      it('should send remaining content of second file', function () {
        var second = request.files['6-two'];
        expect(second.content.size).toEqual(2);
      });
      it('should not send third request', function () {
        requests[1].respond(200);
        expect(requests.length).toBe(2);
      });
    });
  });

  describe('remove', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock(['123456'], 'one'));
      flowObj.addFile(fileMock(['123456'], 'two'));
    });
    it('should remove file by its id', function () {
      expect(flowObj.getById('6-one')).not.toBeNull();
      flowObj.remove('6-one');
      expect(flowObj.getById('6-one')).toBeNull();
    });
    it('should not remove not existent files', function () {
      flowObj.remove('one');
      expect(flowObj.files.length).toBe(2);
    });
    it('should update files array length', function () {
      flowObj.remove('6-two');
      expect(flowObj.files.length).toBe(1);
    });
  });

  describe('removeAll', function () {
    beforeEach(function () {
      flowObj.addFile(fileMock(['123456'], 'one'));
      flowObj.addFile(fileMock(['123456'], 'two'));
    });
    it('should remove all files in queue', function () {
      flowObj.removeAll();
      expect(flowObj.files.length).toBe(0);
      expect(flowObj.getById('6-one')).toBeNull();
      expect(flowObj.getById('6-two')).toBeNull();
    });
  });
});