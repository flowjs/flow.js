describe('fakeFormData', function () {
  function expectConvert(obj) {
      expect(toFormData(obj).toObject()).toEqual(obj);
  }
  describe('toObject', function () {
    it('should convert single values', function () {
      expectConvert({a:1,b:2});
    });
    it('should convert nested values', function () {
      expectConvert({a: {b:2}});
    });
    it('should convert multiple nested values', function () {
      expectConvert({a: {b:2, c:3}, d:4});
    });
    it('should convert arrays', function () {
      expectConvert({a: [1,2,3]});
    });
  })
});