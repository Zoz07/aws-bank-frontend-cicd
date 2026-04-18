import React, {Component} from 'react'
import {Navbar, Button} from 'react-bootstrap'

import './Navigation.css'

class Navigation extends Component {
    render() {
        const today = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date())

        return (
            <Navbar className="app-nav">
                <div className="app-nav__brand">
                    <span className="app-nav__mark">ZB</span>
                    <div>
                        <p className="app-nav__eyebrow">Zbank</p>
                        <h1 className="app-nav__title">{this.props.title}</h1>
                        <p className="app-nav__date">{today}</p>
                    </div>
                </div>
                <div className="app-nav__actions">
                    <Button
                    className="app-nav__button app-nav__button--ghost"
                    onClick = {() => {this.props.onRouteChange('virtual-card')}}
                    >
                    Virtual Card
                    </Button>
                    <Button
                    className="app-nav__button app-nav__button--ghost"
                    onClick = {this.props.getOverviewRoute}
                    >
                    Overview
                    </Button>
                    <Button
                    className="app-nav__button app-nav__button--solid"
                    onClick = {this.props.onSignOut}
                    >
                    Sign Out
                    </Button>
                </div>
            </Navbar>
        )
    }
}

export default Navigation
