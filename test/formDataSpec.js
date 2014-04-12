describe('toFormData', function () {

  it('should return form data object', function () {
    expect(toFormData({}) instanceof FormData).toBeTruthy();
  });

  it('should format objects', function () {
    expect(toFormData({'a':1, 'b':'c'}).keys).toEqual(['a', 'b']);
  });

  it('should format deep objects', function () {
    expect(toFormData({'a': {'d': 5}, 'b':'c'}).keys).toEqual(['a[d]', 'b']);
  });

  it('should format array', function () {
    expect(toFormData(['a', 1]).keys).toEqual(['[0]','[1]']);
  });

  it('should format all', function () {
    expect(toFormData({
      a: [
        {
          'a': 5,
          'b': [1,2,3]
        },
        {
          'a': 'c'
        }
      ]
    }).keys).toEqual([
        'a[0][a]',
        'a[0][b][0]',
        'a[0][b][1]',
        'a[0][b][2]',
        'a[1][a]'
      ]);
  });

});