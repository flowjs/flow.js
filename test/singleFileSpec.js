describe('add single file', function() {
  var flow;

  beforeEach(function() {
    flow = new Flow({
      generateUniqueIdentifier: function(file) {
        return (file.name || 'blob') + '-' + file.size;
      },
      singleFile: true
    });
  });

  it('should keep only the latest file', async function() {
    await flow.addFile(new File(['file part'], 'first.bin'));
    expect(flow.files.length).toBe(1);
    var first = flow.files[0];

    await flow.addFile(new File(['file part 2'], 'second.bin'));
    expect(flow.files.length).toBe(1);
    expect(flow.files[0]).not.toBe(first);
    expect(flow.files[0].name).toBe('second.bin');
  });

  it('should emit remove event after adding another file', async function() {
    var events = [];
    flow.addEventListener('catch-all', function(event) {
      events.push(event.detail.type);
    });
    await flow.addFile(new File(['file part'], 'first.bin'));
    expect(flow.files.length).toBe(1);
    expect(events).toEqual(['filterFile', 'fileAdded', 'filesAdded', 'filesSubmitted']);

    var removedFile = flow.files[0];
    flow.addEventListener('file-removed', function(event) {
      expect(event.detail.file).toBe(removedFile);
    });
    await flow.addFile(new File(['file part 2'], 'second.bin'));
    expect(flow.files.length).toBe(1);
    expect(events.slice(-5)).toEqual([
      'filterFile', 'fileAdded', 'filesAdded', 'file-removed', 'filesSubmitted'
    ]);
  });
});
