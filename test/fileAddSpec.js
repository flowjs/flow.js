describe('fileAdd hooks', function() {
  var flow;

  function addHook(name, callback) {
    flow.opts.hooks = flow.opts.hooks || {};
    var current = flow.opts.hooks[name];
    if (current === undefined) {
      flow.opts.hooks[name] = [callback];
    } else if (Array.isArray(current)) {
      current.push(callback);
    } else {
      flow.opts.hooks[name] = [current, callback];
    }
  }

  beforeEach(function() {
    flow = new Flow({
      hooks: {},
      generateUniqueIdentifier: function(file) {
        return (file.name || 'blob') + '-' + file.size;
      }
    });
  });

  it('should call fileAdded hook', async function() {
    var valid = false;
    addHook('fileAdded', function(file, context) {
      expect(file.file instanceof Blob).toBeTruthy();
      expect(context.flow).toBe(flow);
      valid = true;
    });
    await flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });

  it('should call filesAdded hook', async function() {
    var count = 0;
    addHook('filesAdded', function(files) {
      count = files.length;
    });
    await flow.addFiles([
      new Blob(['file part']),
      new Blob(['file 2 part'])
    ]);
    expect(count).toBe(2);
    expect(flow.files.length).toBe(2);
  });

  it('should call fileAdded only when configured', async function() {
    var event = jasmine.createSpy('event');
    addHook('fileAdded', event);
    await flow.addFile(new File(['file part'], 'a.bin'));
    expect(event).toHaveBeenCalledTimes(1);

    delete flow.opts.hooks.fileAdded;
    await flow.addFile(new File(['file part'], 'b.bin'));
    expect(event).toHaveBeenCalledTimes(1);
  });

  it('fileAdded can be replaced', async function() {
    var event = jasmine.createSpy('event');
    flow.opts.hooks.fileAdded = event;
    await flow.addFile(new File(['file part'], 'c.bin'));
    expect(event).toHaveBeenCalledTimes(1);

    flow.opts.hooks.fileAdded = null;
    await flow.addFile(new File(['file part'], 'd.bin'));
    expect(event).toHaveBeenCalledTimes(1);
  });

  it('should validate fileAdded', async function() {
    addHook('fileAdded', function(file) {
      delete file.file;
      return false;
    });
    await flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
  });

  it('should validate async fileAdded', async function() {
    addHook('fileAdded', async function(file) {
      await sleep(200);
      delete file.file;
      return false;
    });
    await flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
  });

  it('should keep a file from being queued', async function() {
    spyOn(console, 'warn');
    addHook('filterFile', function() { return false; });
    await flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should validate filterFile and filesAdded', async function() {
    addHook('filterFile', function() { return false; });
    var valid = false;
    addHook('filesAdded', function(files) {
      valid = files.length === 0;
    });
    await flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });

  it('should run multiple filterFile hooks and AND their result', async function() {
    var customFunction = jasmine.createSpy('fn');
    addHook('filterFile', async function() {
      customFunction();
      return true;
    });
    addHook('filterFile', async function() {
      customFunction();
      return false;
    });
    addHook('filterFile', async function() {
      customFunction();
      return true;
    });
    var valid = false;
    addHook('filesAdded', function(files) {
      valid = files.length === 0;
    });
    await flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
    expect(customFunction).toHaveBeenCalledTimes(3);
  });

  it('should emit catch-all after hooks', async function() {
    var valid = false;
    flow.addEventListener('catch-all', function(event) {
      if (event.detail.type === 'filesSubmitted') {
        valid = true;
      }
    });
    addHook('filesSubmitted', function() {
      valid = false;
    });
    await flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });

  it('should report hook errors without breaking addFile', async function() {
    var error = jasmine.createSpy('error');
    flow.addEventListener('error', function(event) {
      error(event.detail);
    });
    addHook('fileAdded', function() {
      throw new Error('hook failed');
    });
    await flow.addFile(new File(['file part'], 'hook-error.bin'));
    expect(flow.files.length).toBe(1);
    expect(error).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'hook failed',
      hook: 'fileAdded'
    }));
  });

  describe('async/sync hooks', function() {
    beforeAll(function() {
      jasmine.getEnv().addReporter({
        specStarted: function(result) { jasmine.currentTest = result; },
        specDone: function(result) { jasmine.currentTest = result; }
      });
    });

    it('An async filesAdded hook', async function() {
      var customFunction1 = jasmine.createSpy('fn');
      var customFunction2 = jasmine.createSpy('fn');
      addHook('filesAdded', function() {
        customFunction1();
      });
      addHook('filesAdded', async function() {
        await sleep(250);
        customFunction2();
      });

      var sampleFile = new File(['abc'], 'hooks-async-' + jasmine.currentTest.id + '.bin');
      await flow.addFiles([sampleFile]);
      expect(customFunction1).toHaveBeenCalledTimes(1);
      expect(customFunction2).toHaveBeenCalledTimes(1);
    });

    it('fileAdded hook can change one file', async function() {
      addHook('fileAdded', function(flowfile) {
        if (flowfile.name.includes('aaa')) {
          flowfile.name = 'bbb.bin';
        }
      });
      addHook('fileAdded', async function(flowfile) {
        await sleep(250);
        var text = (await flowfile.file.text()).replace(/a/g, 'x');
        flowfile.file = new File([text], flowfile.name);
      });

      var flowfiles = await flow.addFiles([
        new File(['aaa'], 'aaa.bin'),
        new File(['GGG'], 'GGG.bin')
      ]);
      expect(flowfiles[0].name).toBe('bbb.bin');
      await expectAsync(flowfiles[0].file.text()).toBeResolvedTo('xxx');
    });

    it('A filesAdded hook can change files', async function() {
      var customFunction = jasmine.createSpy('fn');
      var files = [
        new File(['abc'], 'hooks-abc-' + jasmine.currentTest.id + '.bin'),
        new File(['def'], 'hooks-def-' + jasmine.currentTest.id + '.bin')
      ];

      addHook('filesAdded', function(addedFiles) {
        customFunction();
        expect(addedFiles.length).toEqual(2);
        addedFiles.reverse();
      });

      var flowfiles = await flow.addFiles(files);
      expect(customFunction).toHaveBeenCalledTimes(1);
      expect(flowfiles.length).toEqual(2);
      expect(flowfiles[0].name).toEqual('hooks-def-' + jasmine.currentTest.id + '.bin');
    });

    it('filterFile can select files', async function() {
      var customFunction = jasmine.createSpy('fn');
      var files = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu']
        .map(function(value) {
          return new File([value], 'hooks-' + value + '-' + jasmine.currentTest.id + '.bin');
        });

      addHook('filterFile', function(flowFile) {
        customFunction();
        return /\b(abc|def)\b/.test(flowFile.name);
      });

      var flowfiles = await flow.addFiles(files);
      expect(customFunction).toHaveBeenCalledTimes(7);
      expect(flowfiles.length).toEqual(2);
    });
  });
});
