import {Injectable} from '@angular/core';
import {Http, RequestOptions, Headers} from '@angular/http';

import {QA, Synonym} from "../models/qa.model";
import {Service} from './abstract.service'
import {AppSettings} from '../config/app.settings';

@Injectable()
export class QAService extends Service {
    private qaEndpoint = AppSettings.API_URL + '/qa';

    constructor(private http:Http) {
        super();
    }

    submitNewQA(qa:QA):Promise<void> {
        let body = JSON.stringify(qa);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        return this.http.post(this.qaEndpoint, body, options)
            .toPromise()
            .then(() => {}) // no-op
            .catch(super.handleError);
    }

    editQA(user:QA):Promise<void> {
        let body = JSON.stringify(user);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options: RequestOptions;
        options = new RequestOptions({headers: headers});
        return this.http.put(this.qaEndpoint, body, options)
            .toPromise()
            .then(() => {}) // no-op
            .catch(super.handleError);
    }

    getQAs(page:number):Promise<QA[]> {
        return this.http.get(this.qaEndpoint)
            .toPromise()
            .then(super.dataToModelArray(QA))
            .catch(super.handleError);
    }

    getUser(id:string):Promise<QA> {
        return this.http.get(this.qaEndpoint + '/' + id)
            .toPromise()
            .then(super.dataToModel(QA))
            .catch(super.handleError);
    }
}