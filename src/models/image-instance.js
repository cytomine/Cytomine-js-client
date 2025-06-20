import Cytomine from '../cytomine.js';
import Model from './model.js';
import SliceInstance from './slice-instance.js';

export default class ImageInstance extends Model {
  /** @inheritdoc */
  static get callbackIdentifier() {
    return 'imageinstance';
  }

  /** @inheritdoc */
  _initProperties() {
    super._initProperties();

    this.baseImage = null;
    this.project = null;
    this.user = null;

    this.filename = null;
    this.originalFilename = null;
    this.instanceFilename = null;
    this.path = null;

    this.sample = null;

    this.width = null;
    this.height = null;
    this.depth = null;
    this.time = null;
    this.channels = null;
    this.resolution = null;
    this.magnification = null;
    this.physicalSizeX = null;
    this.physicalSizeY = null;
    this.physicalSizeZ = null;
    this.fps = null;
    this.zoom = null;
    this.contentType = null;

    this.thumb = null;
    this.preview = null;
    this.macroURL = null;

    this.numberOfAnnotations = null;
    this.numberOfReviewedAnnotations = null;

    this.reviewStart = null;
    this.reviewStop = null;
    this.reviewUser = null;
    this.reviewed = null;
    this.inReview = null;
  }

  /** @inheritdoc */
  toString() {
    return `[${this.callbackIdentifier}] ${this.id}: ${this.instanceFilename}`;
  }

  /**
   * Get the preview URL.
   *
   * @param maxSize the desired preview size along largest side
   * @param format the desired preview format (jpg, png, webp)
   * @param otherParameters optional other parameters to include in the preview URL
   * @returns {String} the preview URL of the image with a specified size
   */
  previewURL(maxSize = 256, format = 'jpg', otherParameters = {}) {
    if (this.preview === null) {
      return null;
    }
    let url = this.preview.split('?')[0].split('.').slice(0, -1).join('.');
    let parameters = {maxSize, ...otherParameters};
    let query = new URLSearchParams(parameters).toString();
    return `${url}.${format}?${query}`;
  }

  /**
   * Get the thumbnail URL.
   *
   * @param maxSize the desired thumb size along largest side
   * @param format the desired thumb format (jpg, png, webp)
   * @param otherParameters optional other parameters to include in the thumb URL
   * @returns {String} the thumb URL of the image with a specified size
   */
  thumbURL(maxSize = 256, format = 'jpg', otherParameters = {}) {
    if (this.thumb === null) {
      return null;
    }
    let url = this.thumb.split('?')[0].split('.').slice(0, -1).join('.');
    let parameters = {maxSize, ...otherParameters};
    let query = new URLSearchParams(parameters).toString();
    return `${url}.${format}?${query}`;
  }

  /**
   * Get the associated image URL.
   *
   * @param kind the associated type (macro, label)
   * @param maxSize the desired associated image size along largest side
   * @param format the desired associated image format (jpg, png, webp)
   * @param otherParameters optional other parameters to include in the associated image URL
   * @returns {String} the associated image URL of the image with a specified size
   */
  associatedImageURL(kind = 'macro', maxSize = 256, format = 'jpg', otherParameters = {}) {
    if (this.macroURL === null) {
      return null;
    }
    let url = this.macroURL.split('?')[0].split('.').slice(0, -1).join('.');
    url = url.substring(0, url.lastIndexOf('/'));
    let parameters = {maxSize, ...otherParameters};
    let query = new URLSearchParams(parameters).toString();
    return `${url}/${kind}.${format}?${query}`;
  }

  /**
   * @returns {String} the download URL of the image (valid iff the identifier of the image was previously defined)
   */
  get downloadURL() {
    return `${Cytomine.instance.host}${Cytomine.instance.basePath}imageinstance/${this.id}/download`;
  }

  /**
  * Fetch the next image instance of the project (first image created before)
  *
  * @returns {ImageInstance}
  */
  async fetchNext() {
    if (this.isNew()) {
      throw new Error('Cannot fext next image of an image instance with no ID.');
    }

    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/next.json`);
    return new ImageInstance(data);
  }

  /**
  * Fetch the previous image instance of the project (first image created after)
  *
  * @returns {ImageInstance}
  */
  async fetchPrevious() {
    if (this.isNew()) {
      throw new Error('Cannot fext next image of an image instance with no ID.');
    }

    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/previous.json`);
    return new ImageInstance(data);
  }

  /**
   * Fetch the users that have opened the image recently
   *
   * @param {boolean} broadcast  If true, only users broadcasting their positions will be returned
   *
   * @returns {Array<number>} The list of IDs of the connected users
   */
  async fetchConnectedUsers(broadcast = false) {
    if (this.isNew()) {
      throw new Error('Cannot fetch connected users of an image with no ID.');
    }

    let uri = `${this.callbackIdentifier}/${this.id}/online.json${broadcast ? '?broadcast=true' : ''}`;
    let {data} = await Cytomine.instance.api.get(uri);
    return data.users;
  }

  /**
   * Fetch the layers associated with the base abstract image in other projects
   *
   * @param {number} project  The identifier of the project to search. If not set, all projects will be considered.
   *
   * @returns {Array<{image, project, projectName, user, username, firstname, lastname, admin}>} the layers
   */
  async fetchLayersInOtherProjects(project) {
    if (this.isNew()) {
      throw new Error('Cannot fetch layers in other projects of image with no ID.');
    }

    let params = {};
    if (project) {
      params.project = project;
    }

    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/sameimagedata.json`, {params});
    return data.collection;
  }

  /**
   * Fetch the information about the annotation layers present in the image instance
   *
   * @returns {Array<user, image, countAnnotation, countReviewedAnnotation>} The list of annotation layers with counts
   */
  async fetchAnnotationsIndex() {
    if (this.isNew()) {
      throw new Error('Cannot fetch annotations index of image with no ID.');
    }

    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/annotationindex.json`);
    return data.collection;
  }

  /**
   * Copy to the image instance the properties and description associated with the provided source image
   *
   * @param {number} idSource Identifier of the source image instance
   */
  async copyMetadata(idSource) {
    if (this.isNew()) {
      throw new Error('Cannot copy metadata to an image instance with no ID.');
    }

    if (!idSource) {
      throw new Error('The ID of the source image was not provided.');
    }

    await Cytomine.instance.api.post(`${this.callbackIdentifier}/${this.id}/copymetadata.json?based=${idSource}`);
  }

  /**
   * Copy to the image instance all annotations from provided layers
   *
   * @param {Array<{image: Number, user: Number}>} layers  Layers to copy
   * @param {boolean} [giveMe=false]   If true, all copied annotations will be added to the current user layer
   */
  async copyData(layers, giveMe = false) {
    if (this.isNew()) {
      throw new Error('Cannot copy data to an image instance with no ID.');
    }

    if (!layers || !layers.length) {
      throw new Error('At least one layer (characterized by image/user object) must be provided.');
    }

    let formattedLayers = layers.map(layer => `${layer.image}_${layer.user}`);
    let stringLayers = formattedLayers.join();

    await Cytomine.instance.api.post(`${this.callbackIdentifier}/${this.id}/copyimagedata.json?layers=${stringLayers}&giveMe=${giveMe}`);
  }

  /**
   * Start the review of the image instance
   *
   * @returns {this} The image instance as returned by backend
   */
  async review() {
    if (this.isNew()) {
      throw new Error('Cannot review animage with no ID.');
    }

    let {data} = await Cytomine.instance.api.put(`${this.callbackIdentifier}/${this.id}/review.json`);
    this.populate(data[this.callbackIdentifier]);
    Cytomine.instance.lastCommand = data.command;
    return this;
  }

  /**
   * Stop the review of the image instance (either validates the image or cancel the review/the validation)
   *
   * @param {boolean} [cancel=false]  If true, cancels the review (if the image is under review) or the validation
   *                                  (if the image is validated)
   *                                  If false, stop the review and validate the image
   *
   * @returns {this} The image instance as returned by backend
   */
  async stopReview(cancel = false) {
    if (this.isNew()) {
      throw new Error('Cannot stop the review on an image with no ID.');
    }

    let {data} = await Cytomine.instance.api.delete(`${this.callbackIdentifier}/${this.id}/review.json?cancel=${cancel}`);
    this.populate(data[this.callbackIdentifier]);
    return this;
  }

  /**
   * Fetch statistics regarding the number of reviewed annotations for each layer of the image
   *
   * @returns {Array<user: Number, all: Number, reviewed: Number>} The review statistics
   */
  async fetchReviewStatistics() {
    if (this.isNew()) {
      throw new Error('Cannot fetch review statistics on an image with no ID.');
    }

    let {data} = await Cytomine.instance.api.get(`imageinstance/${this.id}/reviewedannotation/stats.json`);
    return data.collection;
  }

  /**
   * Fetch the reference slice instance for the image instance
   *
   * @returns {SliceInstance}
   */
  async fetchReferenceSlice() {
    if (this.isNew()) {
      throw new Error('Cannot get reference slice of an image with no ID.');
    }

    if (!this._referenceSlice) {
      let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/sliceinstance/reference.json`);
      this._referenceSlice = new SliceInstance(data);
    }

    return this._referenceSlice;
  }

  async fetchHistogram({nBins} = {}) {
    if (this.isNew()) {
      throw new Error('Cannot get histogram for an image with no ID.');
    }
    let params = {nBins};
    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/histogram.json`, {params});
    return data;
  }

  async fetchHistogramBounds() {
    if (this.isNew()) {
      throw new Error('Cannot get histogram bounds for an image with no ID.');
    }

    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/histogram/bounds.json`);
    return data;
  }

  async fetchChannelHistograms({nBins} = {}) {
    if (this.isNew()) {
      throw new Error('Cannot get channel histograms for an image with no ID.');
    }
    let params = {nBins};
    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/channelhistogram.json`, {params});
    return data.collection;
  }

  async fetchChannelHistogramBounds() {
    if (this.isNew()) {
      throw new Error('Cannot get channel histogram bounds for an image with no ID.');
    }

    let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/channelhistogram/bounds.json`);
    return data.collection;
  }
}
