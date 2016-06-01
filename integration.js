var readOnlySession = require('./lib').readOnlySession;
var RecordsRepo = require('./lib/RecordsRepo').default;

var dato;

readOnlySession({
  domain: 'dry-sea-4874.admin.datocms.com',
  token: 'b8561e6259da0119de3835cfeaa4bf42f119dd47ecdee009af',
})
.then(function(session) {
  dato = new RecordsRepo(session);
  return dato.refresh();
})
.then(function() {
  dato.repo.findEntitiesOfType('content_type').forEach(ct => {
    console.log(ct.api_key);
    console.log(ct.fields.map(x => x.api_key));
  });
})
.catch(function(e) {
  console.log(e);
});
