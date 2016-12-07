import {Model, ModelUtil} from "./model.utils";
import {QA, Synonym} from "./qa.model";

export class SearchResults implements Model {
    public data: SearchData = new SearchData();
    constructor(params?: any) {
        params ? ModelUtil.bind(params, this) : null;
    }
}

class SearchData implements Model  {
    public qaResults: Array<QA> = [];
    public synonyms: Array<Synonym> = [];
    public totalPages: number = 0;
}

