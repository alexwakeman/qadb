import * as React from "react";
import {Observable} from 'rxjs';

// RxJS Operators
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

export interface SearchFormProps { availableQAs: number; }
export interface SearchFormState { searchTerm: string; }

type ApiTarget = 'suggest' | 'search';

export class SearchForm extends React.Component<SearchFormProps, SearchFormState> {
    private input: HTMLInputElement;

    constructor() {
        super();
        this.performSearch = this.performSearch.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    get(target:ApiTarget, callback:any) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/' + target + '/?input=' + this.state.searchTerm);
        xhr.onload = () => {
            callback(JSON.parse(xhr.responseText));
        };
        xhr.send();
    }

    componentDidMount() {
        Observable.fromEvent(this.input, 'keyup').debounceTime(300).subscribe(() => {
            this.get('suggest', (response: any) => {
                console.log(response);
            });
        });
    }

    onChangeHandler(evt:any) {
        this.setState({searchTerm: evt.target.value});
    }

    performSearch(evt:any) {
        evt.preventDefault();
        this.get('search', (response: any) => {
            console.log(response);
        });
    }

    render() {
        return <div className="col-sm-12 pad-top">
            <div className="col-sm-6 col-xs-offset-3 text-center">
                <form onSubmit={this.performSearch}>
                    <div className="col-md-3 col-sm-12 search-label"><label
                        htmlFor="search-box">Ask a question: </label></div>
                    <div className="col-md-7 col-xs-10 search-box">
                        <input type="text" className="form-control" id="search-box" placeholder="...?"
                               ref={(c) => this.input = c} onChange={this.onChangeHandler}/>
                        <small>Search from over {this.props.availableQAs} Q&amp;A resources</small>
                    </div>
                    <div className="col-md-2 col-xs-3 search-btn">
                        <button type="submit" className="btn btn-primary">Go</button>
                    </div>
                </form>
            </div>
        </div>;
    }
}