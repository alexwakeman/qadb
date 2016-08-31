/// <reference path="../../typings/index.d.ts" />

import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';

import { Heading } from './components/heading/heading.component';
import { SearchForm } from './components/forms/search';
import { SearchResults } from './components/forms/search-reults.component';
import { QuestionAnswer } from './components/forms/qa.component';
import { Router, Route, IndexRoute, Link, hashHistory, browserHistory } from 'react-router';
import * as ReactDOM from 'react-dom';

var ee: EventEmitter = new EventEmitter();

export class App extends React.Component<{}, {}> {
    render() {
        return <div className="container-fluid">
            <Heading logoUrl="/img/logo.png" greeting="QADB" />
            <SearchForm eventEngine={ee} availableQAs={3450}/>
            {this.props.children}
        </div>;
    }
}

ReactDOM.render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <Route path="search/:term" component={SearchResults} />
            <Route path="qa/:id" component={QuestionAnswer} />
        </Route>
    </Router>
), document.getElementById('qadb-app'));