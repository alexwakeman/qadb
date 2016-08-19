import * as React from "react";

export interface HeadingProps { logoUrl: string; greeting: string;
}

export class Heading extends React.Component<HeadingProps, {}> {
    render() {
        return <div className="col-sm-12">
            <div className="col-sm-4 col-xs-offset-4 text-center">
                <img src={this.props.logoUrl} className="logo"/>
                <h3 className="text-center">{this.props.greeting}</h3>
            </div>
        </div>;
    }
}