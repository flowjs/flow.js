import FlowFile from './FlowFile';

/**
 * AsyncFlowFile class
 * @name AsyncFlowFile
 */
export default class AsyncFlowFile extends FlowFile {

  /**
   * Retry aborted file upload
   * @function
   */
  async retry() {
    await this.bootstrap('retry');
    return this.flowObj.upload();
  }

  async bootstrap(event = null, initFileFn = this.flowObj.opts.initFileFn) {
    /**
     * Asynchronous initialization function, if defined, is run
     * Then _bootstrap follow-up occurs
     * And, optionally (in case of initial FlowFile creation), the `file-added` event is fired.
     */
    if (typeof initFileFn === 'function') {
      await initFileFn(this, event);
    }

    this._bootstrap();
    if (event !== 'retry') {
      this.flowObj.hook('file-added', this, event);
    }

    // console.log("Flowfile returns [async]", this._bootstrapped);
    return this;
  }
}
