import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../../const/const";

interface SuggestListProps { eventEngine: EventEmitter }
interface SuggestListState { suggestionList: any }

export class SuggestList extends React.Component<SuggestListProps, SuggestListState> {
    constructor() {
        super();
        this.updateHandler = this.updateHandler.bind(this);
    }

    componentWillMount() {
        this.setState({ suggestionList: [] });
    }

    componentDidMount() {
        this.props.eventEngine.on(Const.SUGGEST_RESULT_EVT, this.updateHandler);
    }

    updateHandler(updatedSuggestionList: any) {
        this.setState({ suggestionList: updatedSuggestionList });
    }

    render() {
        return <div className="suggest-list col-sm-6 col-xs-offset-3 text-center">
            {this.state.suggestionList.map((suggestion: any) => {
                return <a href={'/#/site/qa/' + suggestion._id} key={suggestion._id}>{suggestion.question}&nbsp;</a>
            })}
        </div>
    }
}