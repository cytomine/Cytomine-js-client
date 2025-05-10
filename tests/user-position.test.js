import * as utils from './utils.js';
import {UserPosition, UserPositionCollection, User} from '@';

// WARNING the user positions created by these tests are not deleted
describe('UserPosition', function() {

  let image;

  let userPosition = null;

  before(async function() {
    await utils.connect();
    ({id: image} = await utils.getImageInstance());
  });

  after(async function() {
    await utils.cleanData();
  });

  describe('Create', function() {
    it('Create', async function() {
      userPosition = await UserPosition.create({image, topLeftX: 0, topLeftY: 10, topRightX: 10, topRightY: 10,
        bottomLeftX: 0, bottomLeftY: 0, bottomRightX: 10, bottomRightY: 0});
      expect(userPosition).to.be.an.instanceof(UserPosition);
      expect(userPosition.location).to.exist;
      expect(userPosition.x).to.equal(5);
      expect(userPosition.y).to.equal(5);
    });
  });

  describe('Fetch', function() {
    it('Fetch last position', async function() {
      let currentUser = await User.fetchCurrent();
      let fetchedUserPosition = await UserPosition.fetchLastPosition(image, currentUser.id);
      expect(fetchedUserPosition).to.be.an.instanceof(UserPosition);
      expect(fetchedUserPosition.location).to.equal(userPosition.location);
    });
  });

  // --------------------

  describe('UserPositionCollection', function() {

    let nbUserPositions = 3;
    let totalNb = 0;

    before(async function() {
      let userPositionPromises = [];
      for(let i = 0; i < nbUserPositions; i++) {
        userPositionPromises.push(UserPosition.create({image, topLeftX: 0, topLeftY: 10, topRightX: 10, topRightY: 10,
          bottomLeftX: 0, bottomLeftY: 0, bottomRightX: 10, bottomRightY: 0}));
      }
      await Promise.all(userPositionPromises);
    });

    describe('Fetch', function() {
      it('Fetch (instance method)', async function() {
        let collection = await new UserPositionCollection({filterKey: 'imageinstance', filterValue: image}).fetchAll();
        expect(collection).to.be.an.instanceof(UserPositionCollection);
        expect(collection).to.have.lengthOf.at.least(nbUserPositions);
        totalNb = collection.length;
      });

      it('Fetch (instance method) - without details', async function() {
        let collection = await new UserPositionCollection({showDetails: false,
          filterKey: 'imageinstance', filterValue: image}).fetchAll();
        expect(collection).to.be.an.instanceof(UserPositionCollection);
        expect(collection).to.have.lengthOf.at.most(totalNb); // some userpositions are aggregated
        expect(collection).to.have.lengthOf.at.least(1);
      });

      it('Fetch (static method)', async function() {
        let collection = await UserPositionCollection.fetchAll({filterKey: 'imageinstance', filterValue: image});
        expect(collection).to.be.an.instanceof(UserPositionCollection);
        expect(collection).to.have.lengthOf(totalNb);
      });

      it.skip('Fetch with several requests', async function() {
        let collection = await UserPositionCollection.fetchAll({nbPerPage: Math.ceil(totalNb/3),
          filterKey: 'imageinstance', filterValue: image});
        expect(collection).to.be.an.instanceof(UserPositionCollection);
        expect(collection).to.have.lengthOf(totalNb);
      });

      it('Fetch without filter', async function() {
        let collection = new UserPositionCollection();
        expect(collection.fetchAll()).to.be.rejected;
      });
    });

    describe('Working with the collection', function() {
      it('Iterate through', async function() {
        let collection = await UserPositionCollection.fetchAll({filterKey: 'imageinstance', filterValue: image});
        for(let userPosition of collection) {
          expect(userPosition).to.be.an.instanceof(UserPosition);
        }
      });

      it('Add item to the collection', function() {
        let collection = new UserPositionCollection();
        expect(collection).to.have.lengthOf(0);
        collection.push(new UserPosition());
        expect(collection).to.have.lengthOf(1);
      });

      it('Add arbitrary object to the collection', function() {
        let collection = new UserPositionCollection();
        expect(collection.push.bind(collection, {})).to.throw();
      });
    });

    describe.skip('Pagination', function() {
      let nbPerPage = 1;

      it('Fetch arbitrary page', async function() {
        let collection = new UserPositionCollection({nbPerPage, filterKey: 'imageinstance', filterValue: image});
        await collection.fetchPage(2);
        expect(collection).to.have.lengthOf(nbPerPage);
      });

      it('Fetch next page', async function() {
        let collection = new UserPositionCollection({nbPerPage, filterKey: 'imageinstance', filterValue: image});
        await collection.fetchNextPage();
        expect(collection).to.have.lengthOf(nbPerPage);
      });

      it('Fetch previous page', async function() {
        let collection = new UserPositionCollection({nbPerPage, filterKey: 'imageinstance', filterValue: image});
        collection.curPage = 2;
        await collection.fetchPreviousPage();
        expect(collection).to.have.lengthOf(nbPerPage);
      });
    });

  });

});
