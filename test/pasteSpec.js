describe('FlowFile functions', function() {

  /**
   * @type {Flow}
   */
  var flow;
  /**
   * @type {Flow.FlowFile}
   */
  var file;

  beforeEach(function () {
    flow = new Flow({
    });
    file = new Flow.FlowFile(flow, {
      name: '',
      type: 'image/png'
    });
  });

  it('should call generateFileName() when name is empty', function() {
    var generateFileName = jasmine.createSpy('generateFileName');
    file.generateFileName = generateFileName;
    file.getFileName();
    expect(generateFileName).toHaveBeenCalled();
  });

  it('should generate a string when name is empty', function() {
    var fname = file.getFileName();
    expect(fname).toContain('-generated-filename.png');
  });

});