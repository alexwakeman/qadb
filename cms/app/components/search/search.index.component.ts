import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute} from '@angular/router';
import {Router} from "@angular/router";

import {AppSettings} from '../../config/app.settings';
import {OnChanges} from "@angular/core";
import {SearchResults} from "../../models/search-results.model";
import {SearchService} from "../../services/search.service";
import {NavigationExtras} from "@angular/router/src/router";

@Component({
    templateUrl: AppSettings.COMPONENTS_DIR + '/search/search.index.html',
    directives: [ROUTER_DIRECTIVES]
})

export class SearchIndexComponent implements OnInit {
    public results: SearchResults;
    public searchTerm: string;
    public page: number;


    constructor(private route: ActivatedRoute,
                private router: Router,
                private searchService: SearchService) { }


    ngOnInit() {
        this.searchTerm = this.route.snapshot.params['searchTerm'];
        this.page = this.route.snapshot.params['page'];
        if (this.searchTerm) {
            this.runSearch();
        }
    }

    submitSearch() {
        this.page = 1;
        this.updateRoute();
        this.runSearch();
    }

    runSearch() {
        this.searchService.search(this.searchTerm, this.page)
            .then((results: SearchResults) => {
                this.results = results;
            });
    }

    updateRoute() {
        let navigationExtras: NavigationExtras = {
            queryParams: { 'searchTerm': this.searchTerm, 'page': this.page }
        };
        this.router.navigate(['/search'], navigationExtras);
    }

    deleteQA(id: string) {

    }

    nextPage() {
        this.page += 1;
        this.updateRoute();
        this.runSearch();
    }
}