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
  
  it('should emit remove event after adding another file', function(){
    var events = [];
    flow.on('catch-all', ({detail: [event_name]}) => {
      events.push(event_name);
    });
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(1);
    expect(events).toEqual(['filter-file', 'file-added', 'files-added', 'files-submitted']);

    var removedFile = flow.files[0];
    flow.on('file-removed', ({detail: [file]}) => {
        expect(file).toBe(removedFile); 
    });
    flow.addFile(new Blob(['file part 2']));
    expect(flow.files.length).toBe(1);
    expect(events.length).toBe(9);
    expect(events.slice(-5)).toEqual(['filter-file', 'file-added', 'files-added', 'file-removed', 'files-submitted']);
  });
});
