function FlowFile(file) {
  var f = this;
  f.file = file;
  f.name = file.name;
  f.size = file.size;
  f.relativePath = file.relativePath || file.webkitRelativePath || file.name;
  f.extension = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();

  f.offset = 0;
  f.inProgress = false;
  f.isPaused = false;
  f.isCompleted = false;

  f.id = f.size + '-' + f.relativePath;
}
FlowFile.prototype = {
  'pause': function () {
    if (!this.inProgress && !this.isCompleted) {
      this.isPaused = true;
    }
    return this.isPaused;
  }
};