import { camelize, camelizeKeys, decamelizeKeys } from '../../src/utils/keyFormatter';

describe('Keys formatter', () => {
  it('formats correctly', () => {
    const camelized = camelize('foo_bar_lemon_grab');
    const camelizedKeys = camelizeKeys({ foo_bar_lemon_grab: 'unacceptable' });
    const decamelizedKeys = decamelizeKeys({ fooBarLemonGrab: 'unacceptable' });
    expect(camelized).to.equal('fooBarLemonGrab');
    expect(Object.keys(camelizedKeys)[0]).to.equal('fooBarLemonGrab');
    expect(Object.keys(decamelizedKeys)[0]).to.equal('foo_bar_lemon_grab');
  });

  it('makes exceptions for strings containing dashes', () => {
    const camelized = camelizeKeys({ 'en-UK': 'Hellow' });
    const decamelized = decamelizeKeys({ 'zh-CH': 'Ni-hao' });
    expect(Object.keys(camelized)[0]).to.equal('en-UK');
    expect(Object.keys(decamelized)[0]).to.equal('zh-CH');
  });

  it('decamelizeKeys makes exception for require2fa key', () => {
    const decamelized = decamelizeKeys({ require2fa: false });
    expect(Object.keys(decamelized)[0]).to.equal('require_2fa');
  });
});
