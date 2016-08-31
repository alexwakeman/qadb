/// <reference path="../../typings/index.d.ts" />

import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';

import { Heading } from './components/heading/heading.component';
import { SearchForm } from './components/forms/search';
import { SearchResults } from './components/forms/search-results.component';
import { QuestionAnswer } from './components/forms/qa.component';
import * as ReactDOM from 'react-dom';
import {ReactRouter} from "./utils/router";
import { browserHistory } from 'react-router';

var ee: EventEmitter = new EventEmitter();
var router: ReactRouter = new ReactRouter([
    {
        component: SearchResults,
        route: '/search/:term'
    },
    {
        component: QuestionAnswer,
        route: '/qa/:id'
    }
]);

interface AppState { Elem: any }

class DefaultComponent extends React.Component<{}, {}> {
    render() {
        return <link />
    }
}

export class App extends React.Component<{}, AppState> {
    private outComponent: any;

    constructor() {
        super();
        this.navigated = this.navigated.bind(this);
        browserHistory.push('/#/');
        ee.on('UPDATE_VIEW', this.navigated);
    }

    componentWillMount() {
        this.setState({Elem: DefaultComponent});
    }

    navigated() {
        this.outComponent = router.getCurrentComponent();
        this.setState({Elem: this.outComponent});
    }

    render() {
        var Out = this.state.Elem;
        return (
            <div className="container-fluid">
                <Heading logoUrl="/img/logo.png" greeting="QADB" />
                <SearchForm eventEngine={ee} availableQAs={3450}/>
                <Out router={router} />
            </div>
        );
    }
}

ReactDOM.render((
    <App />
), document.getElementById('qadb-app'));