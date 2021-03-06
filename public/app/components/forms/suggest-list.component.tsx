import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../../const/const";
import {ReactRouter} from "../../utils/router";

interface SuggestListProps { eventEngine: EventEmitter, router: ReactRouter }
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
        var hidden = this.state.suggestionList.length > 0 ? '' : 'hidden',
            className = 'suggest-box ' + hidden;
        return <div className={className}>
            {this.state.suggestionList.map((suggestion: any) => {
                return <a className="result" href="javascript:void(0)" onClick={() => this.props.router.setPath('qa', suggestion._id)} key={suggestion._id}>{suggestion.question}&nbsp;</a>
            })}
        </div>
    }
}