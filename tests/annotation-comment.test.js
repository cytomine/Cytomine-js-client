import * as utils from './utils.js';
import {AnnotationComment, AnnotationCommentCollection} from '@';

describe('AnnotationComment', function() {

  let annotation = null;
  let receivers = null;
  let text = utils.randomString();

  let annotationComment = null;
  let id = 0;

  beforeAll(async function() {
    await utils.connect();
    let user = await utils.getUser();
    receivers = [user.id];
    annotation = await utils.getAnnotation();
  });

  afterAll(async function() {
    await utils.cleanData();
  });

  describe('Create', function() {
    it('Create', async function() {
      annotationComment = new AnnotationComment({subject: 'test AnnotationComment', comment: text, receivers}, annotation);
      await annotationComment.save();
      expect(annotationComment).toBeInstanceOf(AnnotationComment);
      id = annotationComment.id;
      expect(id).toBeDefined();
      expect(annotationComment.comment).toEqual(text);
    });

    it('Create without providing annotation', async function() {
      let annotationCommentWithoutObject = new AnnotationComment({comment: text});
      expect(annotationCommentWithoutObject.save()).rejects.toThrow();
    });
  });

  describe('Fetch', function() {
    it('Fetch with static method', async function() {
      let fetchedAnnotationComment = await AnnotationComment.fetch(id, annotation);
      expect(fetchedAnnotationComment).toBeInstanceOf(AnnotationComment);
      expect(fetchedAnnotationComment.domainIdent).toEqual(annotation.id);
      expect(fetchedAnnotationComment.comment).toEqual(text);
    });

    it('Fetch with instance method', async function() {
      let fetchedAnnotationComment = await new AnnotationComment({id}, annotation).fetch();
      expect(fetchedAnnotationComment).toBeInstanceOf(AnnotationComment);
      expect(fetchedAnnotationComment.domainIdent).toEqual(annotation.id);
      expect(fetchedAnnotationComment.comment).toEqual(text);
    });

    it('Fetch without providing associated object', function() {
      expect(AnnotationComment.fetch({id})).rejects.toThrow();
    });
  });

  describe('Update', function() {
    it('Update', function() {
      expect(annotationComment.update.bind(annotationComment)).toThrow();
    });
  });

  describe('Delete', function() {
    it('Delete', function() {
      expect(annotationComment.delete.bind(annotationComment)).toThrow();
    });
  });

  // --------------------

  describe('AnnotationCommentCollection', function() {
    let nbComments = 3;

    beforeAll(async function() {
      let commentsPromises = [];
      for(let i = 0; i < nbComments - 1; i++) {
        commentsPromises.push(new AnnotationComment({subject: 'test AnnotationComment', comment: utils.randomString(), receivers}, annotation).save());
      }
      await Promise.all(commentsPromises);
    });

    describe('Fetch', function() {
      it('Fetch (instance method)', async function() {
        let collection = await new AnnotationCommentCollection({annotation}).fetchAll();
        expect(collection).toBeInstanceOf(AnnotationCommentCollection);
        expect(collection).toHaveLength(nbComments);
      });

      it('Fetch (static method)', async function() {
        let collection = await AnnotationCommentCollection.fetchAll({annotation});
        expect(collection).toBeInstanceOf(AnnotationCommentCollection);
        expect(collection).toHaveLength(nbComments);
      });

      it('Fetch with several requests', async function() {
        let collection = await AnnotationCommentCollection.fetchAll({nbPerPage: 1, annotation});
        expect(collection).toBeInstanceOf(AnnotationCommentCollection);
        expect(collection).toHaveLength(nbComments);
      });

      it('Fetch without associated object', async function() {
        expect(AnnotationCommentCollection.fetchAll()).rejects.toThrow();
      });
    });

    describe('Working with the collection', function() {
      it('Iterate through', async function() {
        let collection = await AnnotationCommentCollection.fetchAll({annotation});
        for(let annotationComment of collection) {
          expect(annotationComment).toBeInstanceOf(AnnotationComment);
        }
      });

      it('Add item to the collection', function() {
        let collection = new AnnotationCommentCollection({annotation});
        expect(collection).toHaveLength(0);
        collection.push(new AnnotationComment({}, annotation));
        expect(collection).toHaveLength(1);
      });

      it('Add arbitrary object to the collection', function() {
        let collection = new AnnotationCommentCollection(annotation);
        expect(collection.push.bind(collection, {})).toThrow();
      });
    });

    describe('Pagination', function() {
      let nbPerPage = 1;

      it('Fetch arbitrary page', async function() {
        let collection = new AnnotationCommentCollection({nbPerPage, annotation});
        await collection.fetchPage(2);
        expect(collection).toHaveLength(nbPerPage);
      });

      it('Fetch next page', async function() {
        let collection = new AnnotationCommentCollection({nbPerPage, annotation});
        await collection.fetchNextPage();
        expect(collection).toHaveLength(nbPerPage);
      });

      it('Fetch previous page', async function() {
        let collection = new AnnotationCommentCollection({nbPerPage, annotation});
        collection.curPage = 2;
        await collection.fetchPreviousPage();
        expect(collection).toHaveLength(nbPerPage);
      });
    });

  });

});
