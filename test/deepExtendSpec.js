describe('deepExtend', function () {
  it('should extend one level objects', function () {
    expect(deepExtend({
      a:1, b:2
    }, {
      a: 2, c :3
    })).toEqual({
      a:2, b:2, c:3
    });
  });
  it('should extend two level objects', function () {
    expect(deepExtend({
      a: 1,
      b: {
        c: 2
      }
    }, {
      a: 2,
      b: {
        d: 3
      }
    })).toEqual({
      a: 2,
      b: {
        c: 2,
        d: 3
      }
    });
  });
});