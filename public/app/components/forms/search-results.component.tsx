import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Utils} from "../../utils/utils";
import {ReactRouter} from "../../utils/router";
import {Const} from "../../const/const";

interface SearchResultsProps { eventEngine: EventEmitter, router: ReactRouter }
interface SearchResultsState { searchResults: any }

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    private searchTerm: string;
    constructor() {
        super();
        this.updateHandler = this.updateHandler.bind(this);
    }

    componentWillMount() {
        this.props.eventEngine.on(Const.UPDATE_VIEW, this.updateHandler);
        this.setState({ searchResults: [] });
        this.fetchSearchResults();
    }

    updateHandler() {
        this.fetchSearchResults();
    }

    fetchSearchResults() {
        this.searchTerm = this.props.router.getParam();
        Utils.get('search', this.searchTerm, (response: any) => {
            this.setState({ searchResults: response.data.qaResults });
        });
    }

    render() {
        return (
            <div className="suggest-list col-sm-6 col-xs-offset-3 text-center">
                <h5>Search Results</h5>
                {this.state.searchResults.map((searchResult: any, i: number) => {
                    return (
                        <div className="row" key={i}>
                            <a href="javascript:void(0)" onClick={() => this.props.router.setPath('qa', searchResult._id)}>{searchResult.question}&nbsp;</a>
                        </div>
                    )
                })}
            </div>
        )
    }
}