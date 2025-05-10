import * as utils from './utils.js';
import {Cytomine, User} from '@';
import config from './config.js';

describe('Cytomine', function() {
  before(function() {
    new Cytomine(config.host);
  });

  describe('Login/logout', function() {
    it('Login', async function() {
      await Cytomine.instance.login(config.username, config.password);
    });

    it('Logout', async function() {
      await Cytomine.instance.logout();
    });
  });

  describe('UI config', function() {
    let project;

    before(async function() {
      await utils.connect();
      project = await utils.getProject();
    });

    after(async function() {
      await utils.cleanData();
    });

    it('Global UI config', async function() {
      let config = await Cytomine.instance.fetchUIConfigCurrentUser();
      expect(config).to.be.an.instanceof(Object);
      for(let prop in config){
        expect(config[prop]).to.be.a('boolean');
      }
    });

    it('Project UI config', async function() {
      let config = await Cytomine.instance.fetchUIConfigCurrentUser(project.id);
      expect(config).to.be.an.instanceof(Object);
      for(let prop in config){
        expect(config[prop]).to.be.a('boolean');
      }
    });
  });

  describe('Switch user', function() {
    let otherUser;

    before(async function() {
      await utils.connect(true);
      otherUser = await utils.getUser();
    });

    after(async function() {
      await utils.cleanData();
    });

    it('Switch to another user account', async function() {
      await Cytomine.instance.switchUser(otherUser.username);
      let currentUser = await User.fetchCurrent();
      expect(currentUser.id).to.equal(otherUser.id);
    });

    it('Switch back to real user account', async function() {
      await Cytomine.instance.stopSwitchUser();
      let currentUser = await User.fetchCurrent();
      expect(currentUser.id).to.not.equal(otherUser.id);
    });
  });

  describe('Signature', function() {
    before(async function() {
      await utils.connect();
    });

    it('Signature', async function() {
      let signature = await Cytomine.instance.fetchSignature();
      expect(signature).to.be.a('string');
    });
  });

  describe('Forgot credentials', function() {
    let user;

    before(async function() {
      await utils.connect();
      user = await utils.getUser();
    });

    after(async function() {
      await utils.cleanData();
    });

    it('Forgot username', async function() {
      await Cytomine.instance.forgotUsername(user.email);
    });

    it('Forgot password', async function() {
      await Cytomine.instance.forgotPassword(user.username);
    });
  });

  describe('Stats', function() {
    before(async function() {
      await utils.connect();
    });

    it('Total counts', async function() {
      let counts = await Cytomine.instance.fetchTotalCounts();
      expect(counts).to.be.an.instanceof(Object);
      for(let prop in counts){
        expect(counts[prop]).to.be.a('number');
      }
    });

    it('Current stats', async function() {
      let currentStats = await Cytomine.instance.fetchCurrentStats();
      expect(currentStats).to.be.an.instanceof(Object);
      expect(currentStats.users).to.be.a('number');
      expect(currentStats.projects).to.be.a('number');
    });

    it('Storage stats', async function() {
      let storageStats = await Cytomine.instance.fetchStorageStats();
      expect(storageStats).to.be.an.instanceof(Object);
      for(let prop in storageStats){
        expect(storageStats[prop]).to.be.a('number');
      }
    });
  });
});
