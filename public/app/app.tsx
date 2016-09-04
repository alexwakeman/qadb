/// <reference path="../../typings/index.d.ts" />

import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import * as ReactDOM from 'react-dom';

import { Heading } from './components/heading/heading.component';
import { SearchForm } from './components/forms/search';
import { SearchResults } from './components/forms/search-results.component';
import { QuestionAnswer } from './components/forms/qa.component';
import {ReactRouter, RouterConfig} from "./utils/router";
import {Const} from "./const/const";

let routeConfigs: Array<RouterConfig> = [
    {
        component: SearchResults,
        route: '/search/:term'
    },
    {
        component: QuestionAnswer,
        route: '/qa/:id'
    }
];
var ee: EventEmitter = new EventEmitter();
var router: ReactRouter = new ReactRouter(routeConfigs, ee);

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
    }

    componentWillMount() {
        this.setState({Elem: DefaultComponent});
    }

    componentDidMount() {
        window.onhashchange = this.navigated;
        this.navigated();
    }

    navigated() {
        this.outComponent = router.getCurrentComponent();
        if (this.outComponent) {
            this.setState({Elem: this.outComponent});
        } else {
            this.setState({Elem: DefaultComponent});
        }
    }

    render() {
        let Out = this.state.Elem;
        return (
            <div className="container-fluid">
                <Heading logoUrl="/img/logo.png" greeting="QADB" />
                <SearchForm eventEngine={ee} availableQAs={3450} router={router}/>
                <Out router={router} eventEngine={ee} />
            </div>
        );
    }
}

ReactDOM.render((
    <App />
), document.getElementById('qadb-app'));