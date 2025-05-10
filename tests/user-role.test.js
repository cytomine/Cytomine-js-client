import * as utils from './utils.js';
import {UserRole, UserRoleCollection} from '@';

describe('UserRole', function() {

  let role;
  let user;

  let userRole;

  beforeAll(async function() {
    await utils.connect(true);
    ({id: user} = await utils.getUser());
    ({id: role} = await utils.getRole());

    // clean the roles automatically associated to the user during its creation (otherwise, duplicate errors)
    let collection = await UserRoleCollection.fetchAll({filterKey: 'user', filterValue: user});
    for(let userRole of collection) {
      await userRole.delete();
    }
  });

  afterAll(async function() {
    await utils.cleanData();
  });

  describe('Create', function() {
    it('Create', async function() {
      userRole = new UserRole({role, user});
      userRole = await userRole.save();
      expect(userRole).toBeInstanceOf(UserRole);
      expect(userRole.id).to.exist;
    });
  });

  describe('Fetch', function() {
    it('Fetch with static method', async function() {
      let fetchedUserRole = await UserRole.fetch(user, role);
      expect(fetchedUserRole).toBeInstanceOf(UserRole);
      expect(fetchedUserRole).to.deep.equal(userRole);
    });

    it('Fetch with instance method', async function() {
      let fetchedUserRole = await new UserRole({user, role}).fetch();
      expect(fetchedUserRole).toBeInstanceOf(UserRole);
      expect(fetchedUserRole).to.deep.equal(userRole);
    });

    it('Fetch with wrong ID', function() {
      expect(UserRole.fetch(0)).rejects..toThrow();
    });
  });

  describe('Delete', function() {
    it('Delete', async function() {
      await UserRole.delete(user, role);
    });

    it('Fetch deleted', function() {
      expect(UserRole.fetch(user, role)).rejects..toThrow();
    });
  });

  // --------------------

  describe('UserRoleCollection', function() {

    let nbUserRoles = 3;
    let userRoles;

    beforeAll(async function() {
      let roles = await utils.getMultipleRoles(nbUserRoles);
      let userRolePromises = roles.map(role => new UserRole({role, user}).save());
      userRoles = await Promise.all(userRolePromises);
    });

    afterAll(async function() {
      let deletionPromises = userRoles.map(userRole => UserRole.delete(userRole.user, userRole.role));
      await Promise.all(deletionPromises);
    });

    describe('Fetch', function() {
      it('Fetch (instance method)', async function() {
        let collection = await new UserRoleCollection({filterKey: 'user', filterValue: user}).fetchAll();
        expect(collection).toBeInstanceOf(UserRoleCollection);
        expect(collection).toHaveLength(nbUserRoles);
      });

      it('Fetch (static method)', async function() {
        let collection = await UserRoleCollection.fetchAll({filterKey: 'user', filterValue: user});
        expect(collection).toBeInstanceOf(UserRoleCollection);
        expect(collection).toHaveLength(nbUserRoles);
      });

      it('Fetch with several requests', async function() {
        let collection = await UserRoleCollection.fetchAll({nbPerPage: 1,
          filterKey: 'user', filterValue: user});
        expect(collection).toBeInstanceOf(UserRoleCollection);
        expect(collection).toHaveLength(nbUserRoles);
      });

      it('Fetch without filter', async function() {
        let collection = new UserRoleCollection();
        expect(collection.fetchAll()).rejects..toThrow();
      });
    });

    describe('Working with the collection', function() {
      it('Iterate through', async function() {
        let collection = await UserRoleCollection.fetchAll({filterKey: 'user', filterValue: user});
        for(let userRole of collection) {
          expect(userRole).toBeInstanceOf(UserRole);
        }
      });

      it('Add item to the collection', function() {
        let collection = new UserRoleCollection();
        expect(collection).toHaveLength(0);
        collection.push(new UserRole());
        expect(collection).toHaveLength(1);
      });

      it('Add arbitrary object to the collection', function() {
        let collection = new UserRoleCollection();
        expect(collection.push.bind(collection, {})).toThrow();
      });
    });

    describe('Pagination', function() {
      let nbPerPage = 1;

      it('Fetch arbitrary page', async function() {
        let collection = new UserRoleCollection({nbPerPage, filterKey: 'user', filterValue: user});
        await collection.fetchPage(2);
        expect(collection).toHaveLength(nbPerPage);
      });

      it('Fetch next page', async function() {
        let collection = new UserRoleCollection({nbPerPage, filterKey: 'user', filterValue: user});
        await collection.fetchNextPage();
        expect(collection).toHaveLength(nbPerPage);
      });

      it('Fetch previous page', async function() {
        let collection = new UserRoleCollection({nbPerPage, filterKey: 'user', filterValue: user});
        collection.curPage = 2;
        await collection.fetchPreviousPage();
        expect(collection).toHaveLength(nbPerPage);
      });
    });

  });

});
