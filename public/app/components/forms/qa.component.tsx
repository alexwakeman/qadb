import * as React from "react";
import {Utils} from "../../utils/utils";
import {ReactRouter} from "../../utils/router";

interface QuestionAnswerProps { router: ReactRouter }
interface QuestionAnswerState { qa: any }

export class QuestionAnswer extends React.Component<QuestionAnswerProps, QuestionAnswerState> {
    private id:string;
    constructor() {
        super();
    }

    componentWillMount() {
        this.setState({ qa: {} });
    }

    componentDidMount() {
        this.id = this.props.router.getParam();
        Utils.get('qa', this.id, (response: any) => {
            console.log(response);
            this.setState({ qa: response.data });
        });
    }

    render() {
        return <div className="suggest-list col-sm-6 col-xs-offset-3 text-center">
            <h5>Answer</h5>
            <h6>{this.state.qa.question}</h6>
            <span>{this.state.qa.answer}</span>
        </div>
    }
}