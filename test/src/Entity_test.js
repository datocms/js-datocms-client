import Entity from '../../src/Entity';

describe('Entity', () => {
  let entity;

  const repo = {
    findEntity(type, id) {
      return `${type}-${id}`;
    },
  };

  const payload = {
    id: 'peter',
    type: 'person',
    attributes: {
      first_name: 'Peter',
      last_name: 'Griffin',
    },
    relationships: {
      children: {
        data: [
          { type: 'person', id: 'stewie' },
        ],
      },
      mother: {
        data: { type: 'person', id: 'thelma' },
      },
    },
  };

  beforeEach(() => {
    entity = new Entity(payload, repo);
  });

  it('id and type are properly configured', () => {
    expect(entity.id).to.equal('peter');
    expect(entity.type).to.equal('person');
  });

  it('attributes are property setup', () => {
    expect(entity.first_name).to.equal('Peter');
    expect(entity.last_name).to.equal('Griffin');
  });

  it('relationships are property setup', () => {
    expect(entity.children).to.eql(['person-stewie']);
    expect(entity.mother).to.eql('person-thelma');
  });
});
