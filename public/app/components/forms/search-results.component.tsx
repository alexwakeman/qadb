import * as React from "react";
import {Utils} from "../../utils/utils";
import {ReactRouter} from "../../utils/router";

interface SearchResultsProps { router: ReactRouter }
interface SearchResultsState { searchResults: any }

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    private searchTerm: string;
    constructor() {
        super();
    }

    componentWillMount() {
        this.searchTerm = this.props.router.getParam();
        this.setState({ searchResults: [] });
        Utils.get('search', this.searchTerm, (response: any) => {
            console.log(response);
            this.setState({ searchResults: response.data.qaResults });
        });
    }

    render() {
        return <div className="suggest-list col-sm-6 col-xs-offset-3 text-center">
            <h5>Search Results</h5>
            {this.state.searchResults.map((searchResult: any, i: number) => {
                return <div className="row" key={i}>
                        <a href={'/#/site/qa/' + searchResult._id} key={searchResult._id}>{searchResult.question}&nbsp;</a>
                    </div>
            })}
        </div>
    }
}