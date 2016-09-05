import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Utils} from "../../utils/utils";
import {ReactRouter} from "../../utils/router";
import {Const} from "../../const/const";

interface SearchResultsProps { eventEngine: EventEmitter, router: ReactRouter }
interface SearchResultsState { searchResults: any, synonyms: any, searchTerm: string }

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    constructor() {
        super();
        this.updateHandler = this.updateHandler.bind(this);
    }

    componentWillMount() {
        this.props.eventEngine.on(Const.UPDATE_VIEW, this.updateHandler);
        this.setState({ searchResults: [], synonyms: [], searchTerm: '' });
        this.fetchSearchResults();
    }

    updateHandler() {
        this.fetchSearchResults();
    }

    fetchSearchResults() {
        var searchTerm = this.props.router.getParam();
        Utils.get('search', searchTerm, (response: any) => {
            this.setState({ searchResults: response.data.qaResults, synonyms: response.data.synonyms, searchTerm: searchTerm });
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
                    <div className="col-sm-12">
                        {this.state.synonyms.map((synonym: any, i: number) => {
                            return (
                                <div className="col-sm-2" key={i}>
                                    <a href="javascript:void(0)" onClick={() => this.props.router.setPath('search', this.state.searchTerm + ' ' + synonym.word)}>{synonym.word}</a>&nbsp;
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="row text-center">
                    <h5>Search Results</h5>
                    <div className="row">
                        <div className="col-sm-12">
                            {this.state.searchResults.map((searchResult: any, i: number) => {
                                return (
                                    <div className="row" key={i}>
                                        <a href="javascript:void(0)" onClick={() => this.props.router.setPath('qa', searchResult._id)}>{searchResult.question}</a>&nbsp;
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}