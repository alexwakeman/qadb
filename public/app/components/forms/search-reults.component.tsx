import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../../const/const";

interface SearchResultsProps { eventEngine: EventEmitter }
interface SearchResultsState { searchResults: any }

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    constructor() {
        super();
        this.updateHandler = this.updateHandler.bind(this);
    }

    componentWillMount() {
        this.setState({ searchResults: [] });
    }

    componentDidMount() {
        this.props.eventEngine.on(Const.SUGGEST_RESULT_EVT, this.updateHandler);
    }

    updateHandler(updatedSearchResults: any) {
        this.setState({ searchResults: updatedSearchResults });
    }

    render() {
        return <div className="suggest-list col-sm-6 col-xs-offset-3 text-center">
            <h5>Search Results</h5>
            {this.state.searchResults.map((searchResult: any) => {
                return <a href={'/qa/' + searchResult._id} key={searchResult._id}>{searchResult.question}&nbsp;</a>
            })}
        </div>
    }
}