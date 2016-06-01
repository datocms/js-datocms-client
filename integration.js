var readOnlySession = require('./lib').readOnlySession;
var RecordsRepo = require('./lib/RecordsRepo').default;

var dato;

readOnlySession({
  domain: 'dry-sea-4874.admin.datocms.com',
  token: 'b8561e6259da0119de3835cfeaa4bf42f119dd47ecdee009af',
})
.then(function(session) {

  session.getSpace({ include: 'content_types,content_types.fields' })
  .then(body => console.log(JSON.stringify(body)));
  session.getRecords({ 'page[limit]': 10000 })
  .then(body => console.log(JSON.stringify(body)));

  dato = new RecordsRepo(session);
  return dato.refresh();
})
.then(function() {
  dato.locale = 'en';
  console.log(dato.find('9288').id);
  console.log(dato.find('9288').image.url({ w: 50 }));
})
.catch(function(e) {
  console.log(e);
});
