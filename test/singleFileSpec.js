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
  
  it('should fire remove event after adding another file', function(){
    var events = [];
    flow.on('catchAll', function (event) {
        events.push(event);
    });
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(1);
    expect(events.length).toBe(3);
    expect(events[0]).toBe('fileAdded');
    expect(events[1]).toBe('filesAdded');
    expect(events[2]).toBe('filesSubmitted');
    
    var removedFile = flow.files[0];
    flow.on('fileRemoved', function(file){
        expect(file).toBe(removedFile); 
    });
    flow.addFile(new Blob(['file part 2']));
    expect(flow.files.length).toBe(1);
    expect(events.length).toBe(7);
    expect(events[3]).toBe('fileAdded');
    expect(events[4]).toBe('filesAdded');
    expect(events[5]).toBe('fileRemoved');
    expect(events[6]).toBe('filesSubmitted');
  });
});