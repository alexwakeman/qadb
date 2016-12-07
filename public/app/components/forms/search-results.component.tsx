import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Utils} from "../../utils/utils";
import {ReactRouter} from "../../utils/router";
import {Const} from "../../const/const";

interface SearchResultsProps { eventEngine: EventEmitter, router: ReactRouter }
interface SearchResultsState { searchResults: any, synonyms: any, searchTerm: string, totalPages: number }

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    private page:number;
    constructor() {
        super();
        this.updateHandler = this.updateHandler.bind(this);
    }

    componentWillMount() {
        this.page = 1;
        this.props.eventEngine.on(Const.UPDATE_VIEW, this.updateHandler);
        this.setState({ searchResults: [], synonyms: [], searchTerm: '', totalPages: 1 });
        this.fetchSearchResults();
    }

    updateHandler() {
        this.page = 1;
        this.fetchSearchResults();
    }

    fetchSearchResults() {
        var searchTerm = this.props.router.getParam();
        Utils.search(searchTerm, this.page, (response: any) => {
            this.setState({
                searchResults: response.data.qaResults,
                synonyms: response.data.synonyms,
                searchTerm: searchTerm,
                totalPages: response.data.totalPages
            });
        });
    }

    render() {
        return (
            <div className="search-results col-sm-6 col-xs-offset-3">
                <div className="row">
                    <div className="row">
                        <div className="col-sm-3">
                            <small>Related: </small>
                        </div>
                    </div>
                    <div className="col-sm-12 related">
                        {this.state.synonyms.map((synonym: any, i: number) => {
                            return (
                                <div className="col-sm-2" key={i}>
                                    <a href="javascript:void(0)" onClick={() => this.props.router.setPath('search', this.state.searchTerm + ' ' + synonym.word)}>{synonym.word}</a>&nbsp;
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="row">
                    <div className="row">
                        <div className="col-sm-12 results">
                            {this.state.searchResults.map((searchResult: any, i: number) => {
                                {
                                    var needsSlice = searchResult.answer.length > 200;
                                    var answer = needsSlice ? searchResult.answer.slice(0, 200) + '...' : searchResult.answer
                                }
                                return (
                                    <div className="row result" key={i}>
                                        <a className="link" href="javascript:void(0)" onClick={() => this.props.router.setPath('qa', searchResult._id)}>{searchResult.question}</a>&nbsp;
                                        <div className="answer-preview">
                                            <span className="answer">
                                                {answer}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="row page-nav">
                    <div className="col-sm-3 prev">
                        {(this.page > 1) && <a href="javascript:void(0);" onClick={() => {this.page -= 1; this.fetchSearchResults(); } }>Prev</a>}
                    </div>
                    <div className="col-sm-6"></div>
                    <div className="col-sm-3 next">
                        {(this.page < this.state.totalPages) && <a href="javascript:void(0);" onClick={() => { this.page += 1; this.fetchSearchResults(); window.scrollTo(0, 0); } }>Next</a>}
                    </div>
                </div>
            </div>
        )
    }
}