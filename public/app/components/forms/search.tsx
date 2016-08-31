import * as React from 'react';
import {Observable} from 'rxjs';
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../../const/const";
import {Utils} from "../../utils/utils";
import {SuggestList} from './suggest-list.component';
import { browserHistory } from 'react-router';

// RxJS Operators
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

export interface SearchFormProps { availableQAs: number; eventEngine: EventEmitter }
export interface SearchFormState { searchTerm: string; }

export class SearchForm extends React.Component<SearchFormProps, SearchFormState> {
    private input: HTMLInputElement;

    constructor() {
        super();
        this.openSearchResults = this.openSearchResults.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    componentDidMount() {
        Observable.fromEvent(this.input, 'keyup').debounceTime(300).subscribe(() => {
            Utils.get('suggest', this.state.searchTerm, (response: any) => {
                console.log(response);
                this.props.eventEngine.emitEvent(Const.SUGGEST_RESULT_EVT, [response.data]);
            });
        });
    }

    onChangeHandler(evt:any) {
        this.setState({searchTerm: evt.target.value});
    }

    openSearchResults(evt:any) {
        evt.preventDefault();
        browserHistory.push('/#/search/' + this.state.searchTerm);
        this.props.eventEngine.emitEvent('UPDATE_VIEW', []);
    }

    render() {
        return <div className='col-sm-12 pad-top'>
            <div className='col-sm-6 col-xs-offset-3 text-center'>
                <form onSubmit={this.openSearchResults}>
                    <div className='col-md-3 col-sm-12 search-label'><label
                        htmlFor='search-box'>Ask a question: </label></div>
                    <div className='col-md-7 col-xs-10 search-box'>
                        <input type='text' className='form-control' id='search-box' placeholder='...?'
                               ref={(c) => this.input = c} onChange={this.onChangeHandler}/>
                        <small>Search from over {this.props.availableQAs} Q&amp;A resources</small>
                    </div>
                    <div className='col-md-2 col-xs-3 search-btn'>
                        <button type='submit' className='btn btn-primary'>Go</button>
                    </div>
                </form>
            </div>
            <SuggestList eventEngine={this.props.eventEngine} />
        </div>;
    }
}