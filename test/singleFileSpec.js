describe('add single file', function() {
  /**
   * @type {Flow}
   */
  var flow;

  beforeEach(function () {
    flow = new Flow({
      generateUniqueIdentifier: function (file) {
        return file.size;
      },
      singleFile: true
    });
  });

  it('should add single file', function() {
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(1);
    var file = flow.files[0];
    flow.upload();
    expect(file.isUploading()).toBeTruthy();
    flow.addFile(new Blob(['file part 2']));
    expect(flow.files.length).toBe(1);
    expect(file.isUploading()).toBeFalsy();
  });
});