import Cytomine from "../cytomine.js";
import Model from "./model.js";

/** Enum providing the annotation types handled in Cytomine */
export const AnnotationType = Object.freeze({
    ALGO: "AlgoAnnotation",
    USER: "UserAnnotation",
    REVIEWED: "ReviewedAnnotation",
    ROI: "RoiAnnotation"
});

export default class Annotation extends Model {
    /** @inheritdoc */
    static get callbackIdentifier() {
        return "annotation";
    }

    /** @inheritdoc **/
    _initProperties() {
        super._initProperties();

        this.project = null;
        this.image = null;
        this.imageURL = null;
        this.user = null;

        // this.container = null;

        this.location = null;
        this.geometryCompression = null;

        this.centroid = null;
        this.area = null;
        this.areaUnit = null;
        this.perimeter = null;
        this.perimeterUnit = null;

        this.reviewed = null;
        this.parentIdent = null; // only used for reviewed annotations
        // this.nbComments = null;

        this.term = null;
        // this.idTerm = null;
        // this.rate = null;
        // this.idExpectedTerm;
        //
        // this.similarity = null;

        this.cropURL = null;
        this.smallCropURL = null;
    }

    /** @type {AnnotationType} */
    get type() {
        return this._type;
    }

    set type(value) {
        if(Object.values(AnnotationType).includes(value)) {
            this._type = value;
        }
        else {
            throw new Error("Invalid assignment: the provided annotation type does not exist.");
        }
    }

    /** @inheritdoc */
    populate(props) {
        super.populate(props);

        if(props && props.class) {
            for(let key in AnnotationType) {
                if(props.class.endsWith(AnnotationType[key])) {
                    this._type = AnnotationType[key];
                    break;
                }
            }
        }
    }

    /**
     * @override
     * @static Fetch an annotation
     *
     * @param {number} id   The identifier of the annotation to fetch
     * @param {AnnotationType} [annotationType=null]    The type of the annotation (optional but allows to speed up request)
     *
     * @returns {Annotation} The fetched annotation
     */
    static async fetch(id, annotationType = null) {
        let annotation = new this({id});
        if(annotationType != null) {
            annotation.type = annotationType;
        }
        return annotation.fetch();
    }

    // TODO: comments handling
    // async comment(subject, message, users, comment) {
    // 	if(this.isNew()) {
    // 		throw new Error("Cannot comment an annotation with no ID.");
    // 	}
    //
    // 	if(this._type != AnnotationType.USER && this._type != AnnotationType.ALGO) {
    // 		throw new Error("Comment functionality not available for this type of annotation.");
    // 	}
    //
    // 	await Cytomine.instance.api.post(`${this._type.toLowerCase()}/${this.id}/comment.json`);
    // }
    //
    // async fetchComment(id) {
    // 	if(this.isNew()) {
    // 		throw new Error("Cannot fetch comment related to an annotation with no ID.");
    // 	}
    //
    // 	if(this._type != AnnotationType.USER && this._type != AnnotationType.ALGO) {
    // 		throw new Error("Comment functionality not available for this type of annotation.");
    // 	}
    // }
    //
    // async fetchAllComments() {
    // 	if(this.isNew()) {
    // 		throw new Error("Cannot fetch comments related to an annotation with no ID.");
    // 	}
    //
    // 	if(this._type != AnnotationType.USER && this._type != AnnotationType.ALGO) {
    // 		throw new Error("Comment functionality not available for this type of annotation.");
    // 	}
    // }


    /**
     * Create a reviewed annotation based on the current annotation
     *
     * @returns {Annotation} The newly created reviewed annotation
     */
    async review() {
        if(this.isNew()) {
            throw new Error("Cannot review an annotation with no ID.");
        }

        let {data} = await Cytomine.instance.api.put(`${this.callbackIdentifier}/${this.id}/review.json`);
        let reviewedAnnotation = new this.constructor(data["reviewedannotation"]);
        return reviewedAnnotation;
    }


    /**
     * Cancel the review of the current annotation (thus deleting associated reviewed annotations)
     */
    async cancelReview() {
        if(this.isNew()) {
            throw new Error("Cannot cancel review an annotation with no ID.");
        }

        await Cytomine.instance.api.delete(`${this.callbackIdentifier}/${this.id}/review.json`);
    }


    /**
     * Simplifies the annotation so that it is described with a number of points between minNbPoints and maxNbPoints (no
     * guarantee, best effort)
     *
     * @param {number} minNbPoints
     * @param {number} maxNbPoints
     *
     * @returns {Annotation} The simplified annotation
     */
    async simplify(minNbPoints, maxNbPoints) {
        if(this.isNew()) {
            throw new Error("Cannot simplify an annotation with no ID.");
        }

        let {data} = await Cytomine.instance.api.get(`${this.callbackIdentifier}/${this.id}/simplify.json?
            minPoint=${minNbPoints}&maxPoint=${maxNbPoints}`);

        this.populate(data);
        return this;
    }

    /**
     * @static correctAnnotations - Description
     *
     * @param {number} image    The identifier of the image instance
     * @param {string} location The correcting geometric object, described in WKT format
     * @param {boolean} review  If set to true, the correction is to be applied on reviewed annotations if possible
     * @param {boolean} remove  If true, the correcting geometric object will be removed from the existing annotations
     *                          If false, it will be added to them
     * @param {Array<Number>} layers   The identifiers of the layers to correct
     *
     * @returns {Annotation} One of the corrected annotations
     */
    static async correctAnnotations(image, location, review, remove, layers) {
        let {data} = await Cytomine.instance.api.post("annotationcorrection.json", {image, location, review, remove, layers});
        return new this(data.annotation);
    }

    /** @inheritdoc */
    get uri() { // cannot override callbackIdentifier because in response data, model is returned in "annotation" prop
        if(this._type == null) {
            return super.uri;
        }
        else {
            let name = this._type.toLowerCase();
            if(this.isNew()) {
                return `${name}.json`;
            }
            else {
                return `${name}/${this.id}.json`;
            }
        }
    }
}