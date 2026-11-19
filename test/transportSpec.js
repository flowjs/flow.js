describe('Transport', function() {
  var OriginalXHR;
  var instances;

  class FakeXHR {
    constructor() {
      this.listeners = {};
      this.upload = {
        listeners: {},
        addEventListener: (name, callback) => {
          (this.upload.listeners[name] = this.upload.listeners[name] || []).push(callback);
        },
        removeEventListener: (name, callback) => {
          this.upload.listeners[name] = (this.upload.listeners[name] || [])
            .filter(entry => entry !== callback);
        },
        emit: (name, event) => {
          (this.upload.listeners[name] || []).slice().forEach(callback => callback(event));
        }
      };
      this.headers = {};
      this.sent = false;
      this.aborted = false;
      instances.push(this);
    }

    addEventListener(name, callback) {
      (this.listeners[name] = this.listeners[name] || []).push(callback);
    }

    removeEventListener(name, callback) {
      this.listeners[name] = (this.listeners[name] || [])
        .filter(entry => entry !== callback);
    }

    emit(name, event) {
      (this.listeners[name] || []).slice().forEach(callback => callback(event));
    }

    open(method, url, async) {
      this.method = method;
      this.url = url;
      this.async = async;
    }

    setRequestHeader(name, value) {
      this.headers[name] = value;
    }

    send(body) {
      if (FakeXHR.failSend) {
        throw new Error('send failed');
      }
      this.body = body;
      this.sent = true;
    }

    abort() {
      this.aborted = true;
      this.emit('abort', {});
    }

    fireLoad(status, responseText) {
      this.status = status;
      this.responseText = responseText;
      this.emit('load', {});
    }

    fireError() {
      this.emit('error', {});
    }

    fireTimeout() {
      this.emit('timeout', {});
    }
  }

  beforeAll(function() {
    OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = FakeXHR;
  });

  afterAll(function() {
    window.XMLHttpRequest = OriginalXHR;
  });

  beforeEach(function() {
    instances = [];
    FakeXHR.failSend = false;
  });

  function request(options) {
    return FlowTransport.sendRequest(Object.assign({
      method: 'POST',
      url: '/upload',
      body: 'payload',
      timeout: 25,
      withCredentials: true,
      headers: {'X-Test': 'yes'}
    }, options || {}));
  }

  it('resolves a successful request and applies request options', async function() {
    var progress = jasmine.createSpy('progress');
    var promise = request({onProgress: progress});
    var xhr = instances[0];
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe('/upload');
    expect(xhr.timeout).toBe(25);
    expect(xhr.withCredentials).toBe(true);
    expect(xhr.headers['X-Test']).toBe('yes');
    expect(xhr.body).toBe('payload');

    xhr.upload.emit('progress', {loaded: 4, total: 8});
    expect(progress).toHaveBeenCalled();

    xhr.fireLoad(201, 'ok');
    var result = await promise;
    expect(result.ok).toBe(true);
    expect(result.status).toBe(201);
    expect(result.responseText).toBe('ok');
  });

  it('resolves network errors and timeouts', async function() {
    var network = request();
    instances[0].fireError();
    var networkResult = await network;
    expect(networkResult.networkError).toBe(true);

    var timeout = request();
    instances[1].fireTimeout();
    var timeoutResult = await timeout;
    expect(timeoutResult.timedOut).toBe(true);
  });

  it('aborts through an AbortSignal', async function() {
    var controller = new AbortController();
    var promise = request({signal: controller.signal});
    controller.abort();
    var result = await promise;
    expect(result.aborted).toBe(true);
    expect(instances[0].aborted).toBe(true);
  });

  it('does not send when the signal is already aborted', async function() {
    var controller = new AbortController();
    controller.abort();
    var result = await request({signal: controller.signal});
    expect(result.aborted).toBe(true);
    expect(instances[0].sent).toBe(false);
  });

  it('resolves send exceptions', async function() {
    FakeXHR.failSend = true;
    var result = await request();
    expect(result.ok).toBe(false);
    expect(result.error.message).toBe('send failed');
  });

  it('ignores duplicate completion events', async function() {
    var promise = request();
    var xhr = instances[0];
    var load = xhr.listeners.load[0];
    xhr.status = 200;
    xhr.responseText = 'first';
    load();
    xhr.status = 500;
    xhr.responseText = 'second';
    load();
    var result = await promise;
    expect(result.status).toBe(200);
    expect(result.responseText).toBe('first');
  });
});
