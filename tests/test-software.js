import * as utils from './utils.js';
import {Software, SoftwareCollection} from '@';

describe.skip('Software', function() {

  let name = utils.randomString();
  let serviceName = 'createRabbitJobService';

  let project;

  let software = null;
  let id = 0;

  before(async function() {
    await utils.connect();
    ({id: project} = await utils.getProject());
  });

  after(async function() {
    await utils.cleanData();
  });

  describe('Create', function() {
    it.skip('Create', async function() {
      software = new Software({name, serviceName});
      software = await software.save();
      id = software.id;
      expect(id).to.exist;
      expect(software.name).to.equal(name);
    });
  });

  describe('Fetch', function() {
    it.skip('Fetch with static method', async function() {
      let fetchedSoftware = await Software.fetch(id);
      expect(fetchedSoftware).to.be.an.instanceof(Software);
      expect(fetchedSoftware.name).to.equal(name);
    });

    it.skip('Fetch with instance method', async function() {
      let fetchedSoftware = await new Software({id}).fetch();
      expect(fetchedSoftware).to.be.an.instanceof(Software);
      expect(fetchedSoftware.name).to.equal(name);
    });

    it.skip('Fetch with wrong ID', function() {
      expect(Software.fetch(0)).to.be.rejected;
    });
  });

  describe('Specific operations', function() {
    it.skip('Get statistics for a specific project', async function() {
      let stats = await software.fetchStats(project);
      expect(stats.numberOfJob).to.exist;
      expect(stats.numberOfNotLaunch).to.exist;
      expect(stats.numberOfInQueue).to.exist;
      expect(stats.numberOfRunning).to.exist;
      expect(stats.numberOfSuccess).to.exist;
      expect(stats.numberOfFailed).to.exist;
      expect(stats.numberOfIndeterminate).to.exist;
      expect(stats.numberOfWait).to.exist;
    });
  });

  describe('Update', function() {
    it.skip('Update', async function() {
      let newName = utils.randomString();
      software.name = newName;
      software = await software.update();
      expect(software).to.be.an.instanceof(Software);
      expect(software.name).to.equal(newName);
    });
  });

  describe('Delete', function() {
    it.skip('Delete', async function() {
      await Software.delete(id);
    });

    it.skip('Fetch deleted', function() {
      expect(Software.fetch(id)).to.be.rejected;
    });
  });

  // --------------------

  describe('SoftwareCollection', function() {

    let nbSoftwares = 3;
    let softwares;
    let totalNb = 0;

    before(async function() {
      let softwarePromises = [];
      for(let i = 0; i < nbSoftwares; i++) {
        softwarePromises.push(new Software({name: utils.randomString(), serviceName}).save());
      }
      softwares = await Promise.all(softwarePromises);

      await utils.getSoftwareProject({software: softwares[0].id, project});
    });

    after(async function() {
      let deletionPromises = softwares.map(software => Software.delete(software.id));
      await Promise.all(deletionPromises);
    });

    describe('Fetch', function() {
      it.skip('Fetch (instance method)', async function() {
        let collection = await new SoftwareCollection().fetchAll();
        expect(collection).to.be.an.instanceof(SoftwareCollection);
        expect(collection).to.have.lengthOf.at.least(nbSoftwares);
        totalNb = collection.length;
      });

      it.skip('Fetch (static method)', async function() {
        let collection = await SoftwareCollection.fetchAll();
        expect(collection).to.be.an.instanceof(SoftwareCollection);
        expect(collection).to.have.lengthOf(totalNb);
      });

      it.skip('Fetch with several requests', async function() {
        let collection = await SoftwareCollection.fetchAll({nbPerPage: Math.ceil(totalNb/3)});
        expect(collection).to.be.an.instanceof(SoftwareCollection);
        expect(collection).to.have.lengthOf(totalNb);
      });
    });

    describe('Working with the collection', function() {
      it.skip('Iterate through', async function() {
        let collection = await SoftwareCollection.fetchAll();
        for(let software of collection) {
          expect(software).to.be.an.instanceof(Software);
        }
      });

      it.skip('Add item to the collection', function() {
        let collection = new SoftwareCollection();
        expect(collection).to.have.lengthOf(0);
        collection.push(new Software());
        expect(collection).to.have.lengthOf(1);
      });

      it.skip('Add arbitrary object to the collection', function() {
        let collection = new SoftwareCollection();
        expect(collection.push.bind(collection, {})).to.throw();
      });
    });

    describe('Filtering', function() {
      it.skip('Filter on project', async function() {
        let collection = await SoftwareCollection.fetchAll({filterKey: 'project', filterValue: project});
        expect(collection).to.have.lengthOf(1);
      });
    });

    describe('Pagination', function() {
      let nbPerPage = 1;

      it.skip('Fetch arbitrary page', async function() {
        let collection = new SoftwareCollection({nbPerPage});
        await collection.fetchPage(2);
        expect(collection).to.have.lengthOf(nbPerPage);
      });

      it.skip('Fetch next page', async function() {
        let collection = new SoftwareCollection({nbPerPage});
        await collection.fetchNextPage();
        expect(collection).to.have.lengthOf(nbPerPage);
      });

      it.skip('Fetch previous page', async function() {
        let collection = new SoftwareCollection({nbPerPage});
        collection.curPage = 2;
        await collection.fetchPreviousPage();
        expect(collection).to.have.lengthOf(nbPerPage);
      });
    });

  });

});
