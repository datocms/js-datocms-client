import ApiException from '../../src/ApiException';

describe('ApiException', () => {
  const response = {
    status: 500,
    statusText: 'Internal Exception',
  };

  const body = { data: [] };

  it('extends Error', () => {
    const exception = new ApiException(response, body);
    expect(exception instanceof Error).to.be.true();
  });

  it('does not throw with no params', () => {
    expect(() => new ApiException()).not.to.throw();
  });
});

