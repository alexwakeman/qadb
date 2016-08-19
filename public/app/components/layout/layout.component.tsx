import * as React from "react";

import { Heading } from '../heading/heading.component';
import { SearchForm } from '../forms/search';

export class Layout extends React.Component<{}, {}> {
    render() {
        return  <div className="container-fluid">
                    <Heading logoUrl="/img/logo.png" greeting="Welcome to QADB!" />
                    <SearchForm availableQAs={3450} />
                </div>;
    }
}