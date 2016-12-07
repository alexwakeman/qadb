import {Injectable} from '@angular/core';
import {Http, RequestOptions, Headers} from '@angular/http';

import {SearchResults} from '../models/search-results.model';
import {Service} from './abstract.service'
import {AppSettings} from '../config/app.settings';

@Injectable()
export class SearchService extends Service {
    private searchEndpoint = AppSettings.API_URL + '/search';

    constructor(private http:Http) {
        super();
    }

    search(term: string, page: number) {
        return this.http.get(this.searchEndpoint + '/' + term + '/' + page)
            .toPromise()
            .then(super.dataToModel(SearchResults))
            .catch(super.handleError);
    }
}