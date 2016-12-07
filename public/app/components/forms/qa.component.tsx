import * as React from "react";
import {Utils} from "../../utils/utils";
import {ReactRouter} from "../../utils/router";
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../../const/const";

interface QuestionAnswerProps { eventEngine: EventEmitter, router: ReactRouter }
interface QuestionAnswerState { qa: any }

export class QuestionAnswer extends React.Component<QuestionAnswerProps, QuestionAnswerState> {
    private id:string;
    constructor() {
        super();
        this.updateHandler = this.updateHandler.bind(this);
    }

    componentWillMount() {
        this.setState({ qa: {} });
    }

    componentDidMount() {
        this.props.eventEngine.on(Const.UPDATE_VIEW, this.updateHandler);
        this.fetchQA();
    }

    updateHandler() {
        this.fetchQA();
    }

    fetchQA() {
        this.id = this.props.router.getParam();
        Utils.get('qa', this.id, (response: any) => {
            this.setState({ qa: response.data });
        });
    }

    render() {
        return (
            <div className="answer col-sm-6 col-xs-offset-3">
                <div className="row">
                    <div className="col-sm-6 back"><a href="javascript:history.back()">Back</a></div>
                </div>

                <h4 className="text-center">{this.state.qa.question}</h4>
                <span>{this.state.qa.answer}</span>
            </div>
        )
    }
}