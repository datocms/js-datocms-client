import nock from 'nock';
import Session from '../../src/Session';

describe('Session', () => {
  let session;

  const options = [
    'https://site-api.datocms.com',
    'admin.foobar.com',
    'XXX',
  ];

  const reqheaders = {
    'Content-Type': 'application/json',
    'X-Site-Domain': 'admin.foobar.com',
    Accept: 'application/json',
    Authorization: 'Bearer XXX',
  };

  beforeEach(() => {
    session = new Session(...options);
  });

  describe('initialization', () => {
    it('it is properly configured', () => {
      expect(session.baseUrl).to.equal('https://site-api.datocms.com');
      expect(session.domain).to.equal('admin.foobar.com');
      expect(session.token).to.equal('XXX');
    });
  });

  describe('get', () => {
    describe('just the URL', () => {
      beforeEach(() => {
        nock('https://site-api.datocms.com', { reqheaders })
        .get('/endpoint')
        .reply(200, { data: 'success' });
      });

      it('returns the payload', mochaAsync(async () => {
        const response = await session.get('/endpoint');
        expect(response.data).to.equal('success');
      }));
    });

    describe('URL and params', () => {
      beforeEach(() => {
        nock('https://site-api.datocms.com', { reqheaders })
        .get('/endpoint')
        .query({ foo: 'bar' })
        .reply(200, { data: 'success' });
      });

      it('returns the payload', mochaAsync(async () => {
        const response = await session.get('/endpoint', { foo: 'bar' });
        expect(response.data).to.equal('success');
      }));
    });
  });
});

