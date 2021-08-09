describe('fileAdd event', function() {
  /**
   * @type {Flow}
   */
  var flow;

  beforeEach(function () {
    flow = new Flow({
      generateUniqueIdentifier: function (file) {
        return file.size;
      }
    });
  });

  it('should call file-added event', function() {
    var valid = false;
    flow.on('file-added', (file) => {
      expect(file.file instanceof Blob).toBeTruthy();
      valid = true;
    });
    flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });

  it('should call files-added event', function() {
    var count = 0;
    flow.on('files-added', (files) => {
      count = files.length;
    });
    flow.addFiles([
      new Blob(['file part']),
      new Blob(['file 2 part'])
    ]);
    expect(count).toBe(2);
    expect(flow.files.length).toBe(2);
  });

  it('should call file-added only when bound', function() {
    var event = jasmine.createSpy('event');

    flow.on('file-added', event);
    flow.addFile(new File(['file part'], 'a.bin'));
    expect(event).toHaveBeenCalledTimes(1);

    flow.off('file-added');
    flow.addFile(new File(['file part'], 'b.bin'));
    expect(event).toHaveBeenCalledTimes(1);
  });

  it('file-added can be removed specifying the callback', function() {
    var event = jasmine.createSpy('event');
    flow.on('file-added', event);
    flow.addFile(new File(['file part'], 'c.bin'));
    expect(event).toHaveBeenCalledTimes(1);

    flow.off('file-added', event);
    flow.addFile(new File(['file part'], 'd.bin'));
    expect(event).toHaveBeenCalledTimes(1);
  });

  it('should validate file-added', function() {
    spyOn(console, 'warn');
    flow.on('file-added', (file) => {
      delete file.file;
      return false;
    });
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('should keeps file from being queued', function() {
    spyOn(console, 'warn');
    flow.on('filter-file', () => false);
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should validate filter-file and files-added', function() {
    flow.on('filter-file', () => false);
    var valid = false;
    flow.on('files-added', (files) => {
      valid = files.length === 0;
    });
    flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });

  describe('async/sync hooks', function () {
    beforeAll(function() {
      jasmine.getEnv().addReporter({
        specStarted: result => (jasmine.currentTest = result),
        specDone: result => (jasmine.currentTest = result),
      });
    });

    it('An async files-added hook', async function() {
      var flowfiles,
          content = gen_file(4, 512),
          sample_file = new File([content], `foobar-asyncInitFileFn-${jasmine.currentTest.id}.bin`),
          customFunction1 = jasmine.createSpy('fn'),
          customFunction2 = jasmine.createSpy('fn');
      flow.on('files-added', (files) => {
        customFunction1();
      });
      flow.on('files-added', async (files) => {
        await sleep(250);
        customFunction2();
      });

      flowfiles = await flow.asyncAddFiles([sample_file]);
      expect(customFunction1).toHaveBeenCalledTimes(1);
      expect(customFunction2).toHaveBeenCalledTimes(1);
    });

    it('file-added hook can actually change one file', async () => {
      flow.on('file-added', (flowfile) => {
        // Synchronous hook changes the filename of the first file
        if (flowfile.name.includes('aaa')) {
          flowfile.name = 'bbb.bin';
        }
      });
      flow.on('file-added', async (flowfile) => {
        await sleep(250);
        // Asynchronous hook replace the content
        var text = (await flowfile.file.text()).replace(/a/g, 'x');
        flowfile.file = new File([text], flowfile.name);
      });

      var flowfiles = await flow.asyncAddFiles([
        new File(['aaa'], 'aaa.bin'),
        new File(['GGG'], 'GGG.bin'),
      ]);
      expect(flowfiles[0].name).toBe('bbb.bin');
      expect(await flowfiles[0].file.text()).toBe('xxx');
    });

    it('A files-added hook can actually change files', async function() {
      var flowfiles,
          customFunction = jasmine.createSpy('fn'),
          files = [
            new File(['abc'], `foobar-abc-${jasmine.currentTest.id}.bin`),
            new File(['def'], `foobar-def-${jasmine.currentTest.id}.bin`)
          ];

      flow.on('files-added', (files, event) => {
        customFunction();
        expect(files.length).toEqual(2);
        files.reverse();
      });

      flowfiles = await flow.asyncAddFiles(files);
      expect(customFunction).toHaveBeenCalledTimes(1);
      expect(flowfiles.length).toEqual(2);
      // The files have been inverted by the hook
      expect(flowfiles[0].name).toEqual(`foobar-def-${jasmine.currentTest.id}.bin`);
    });

    it('A files-added hook can actually change files', async function() {
      var flowfiles,
          customFunction = jasmine.createSpy('fn'),
          files = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu']
          .map(e => new File([e], `foobar-${e}-${jasmine.currentTest.id}.bin`));

      flow.on('filter-file', (flowFile, event) => {
        customFunction();
        return /\b(abc|def)\b/.test(flowFile.name);
      });

      flowfiles = await flow.asyncAddFiles(files);
      expect(customFunction).toHaveBeenCalledTimes(7);
      expect(flowfiles.length).toEqual(2);
    });
  });
});
