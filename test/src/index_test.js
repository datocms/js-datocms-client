import nock from 'nock';
import DatoCmsClient from '../../src/index';
import ApiException from '../../src/ApiException';

describe('DatoCmsClient', () => {
  describe('readOnlySession', () => {
    let session;

    beforeEach(mochaAsync(async () => {
      session = await DatoCmsClient.readOnlySession({
        domain: 'admin.foobar.com',
        token: 'XXX',
      });
    }));

    it('it is properly configured', () => {
      expect(session.baseUrl).to.equal('https://site-api.datocms.com');
      expect(session.domain).to.equal('admin.foobar.com');
      expect(session.token).to.equal('XXX');
    });
  });

  describe('authenticatedSession', () => {
    const options = {
      domain: 'admin.foobar.com',
      email: 'john@appleseed.com',
      password: 'changeme',
    };

    describe('if misconfigured', () => {
      beforeEach(() => {
        nock('https://site-api.datocms.com')
          .post('/sessions')
          .reply(406, { data: [{ id: 'FOO_ERROR', attributes: {} }] });
      });
      it('it rejects the promise', () => {
        return expect(DatoCmsClient.authenticatedSession(options))
          .to.be.rejectedWith(
            ApiException,
            'FOO_ERROR'
          );
      });
    });

    describe('if properly configured', () => {
      let session;

      beforeEach(() => {
        nock('https://site-api.datocms.com', {
          reqheaders: {
            'Content-Type': 'application/json',
            'X-Site-Domain': 'admin.foobar.com',
            Accept: 'application/json',
          },
        })
        .post('/sessions')
        .reply(201, {
          data: {
            type: 'session',
            id: 'TOKEN',
            relationships: {
              user: {
                data: { type: 'user', id: '312' },
              },
            },
          },
          included: [
            {
              type: 'user',
              id: '312',
              attributes: {
                email: 'foo@bar.com',
                first_name: 'Mark',
                last_name: 'Smith',
                state: 'INVITATION_PENDING',
                is_admin: true,
                password: 'example',
              },
            },
          ],
        });
      });

      beforeEach(mochaAsync(async () => {
        session = await DatoCmsClient.authenticatedSession(options);
      }));

      it('returns a configured session', () => {
        expect(session.baseUrl).to.equal('https://site-api.datocms.com');
        expect(session.domain).to.equal('admin.foobar.com');
        expect(session.token).to.equal('TOKEN');
      });
    });
  });
});
