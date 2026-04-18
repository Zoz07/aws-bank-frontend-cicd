import {Component} from 'react'
import {Card, Button} from 'react-bootstrap'

import Navigation from './../navigation/Navigation'
import './VirtualCard.css'

class VirtualCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            card: this.loadCard()
        }
    }

    getStorageKey = () => {
        const username = (this.props.state.loginDetails.username || '').trim().toLowerCase()
        return username ? `zbank-virtual-card-${username}` : 'zbank-virtual-card-guest'
    }

    buildCard = () => {
        const username = (this.props.state.loginDetails.username || 'guest').trim().toLowerCase()
        const seed = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
        const baseDigits = `${seed}${Date.now()}`
            .replace(/\D/g, '')
            .padEnd(16, '7')
            .slice(0, 16)
        const expiryMonth = String((seed % 12) + 1).padStart(2, '0')
        const expiryYear = String(new Date().getFullYear() + 3 + (seed % 3)).slice(-2)
        const cvv = String((seed * 37) % 900 + 100)

        return {
            number: `${baseDigits.slice(0, 4)} ${baseDigits.slice(4, 8)} ${baseDigits.slice(8, 12)} ${baseDigits.slice(12, 16)}`,
            expiry: `${expiryMonth}/${expiryYear}`,
            cvv,
            holder: this.props.state.acctDetails.username || this.props.state.loginDetails.username || 'Zbank Customer',
            createdAt: new Date().toISOString()
        }
    }

    loadCard = () => {
        try {
            const existingCard = JSON.parse(localStorage.getItem(this.getStorageKey()) || 'null')
            if (existingCard && existingCard.number) {
                return existingCard
            }
        } catch (error) {
            localStorage.removeItem(this.getStorageKey())
        }
        return null
    }

    createCard = () => {
        if (this.state.card) {
            this.props.setNotice('A virtual card has already been created for this account.', 'info')
            return
        }

        const card = this.buildCard()
        localStorage.setItem(this.getStorageKey(), JSON.stringify(card))
        this.setState({card})
        this.props.setNotice('Your virtual card is ready to use.', 'success')
    }

    render() {
        const card = this.state.card

        return (
            <section className="virtual-card-page">
                <Navigation
                title = "Virtual Card"
                onRouteChange = {this.props.onRouteChange}
                onSignOut = {this.props.onSignOut}
                getOverviewRoute = {this.props.getOverviewRoute}
                />

                <div className="virtual-card-page__grid">
                    <Card className="virtual-card-page__hero">
                        <Card.Body>
                            <p className="virtual-card-page__eyebrow">Online spending</p>
                            <h2>Create a virtual Visa card for safer digital payments.</h2>
                            <p>Generate a card that is unique to your account on this device and use it for online purchases and subscriptions.</p>
                            <div className="virtual-card-page__actions">
                                <Button
                                className="virtual-card-page__button"
                                onClick={this.createCard}
                                disabled={Boolean(card)}
                                >
                                {card ? 'Card already created' : 'Create card'}
                                </Button>
                                <Button
                                className="virtual-card-page__button virtual-card-page__button--ghost"
                                onClick={this.props.getOverviewRoute}
                                >
                                Back to overview
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="virtual-card-page__panel">
                        <Card.Body>
                            {card
                            ?
                                <>
                                    <div className="virtual-card-page__card">
                                        <p className="virtual-card-page__visa">VISA</p>
                                        <strong>{card.number}</strong>
                                        <div className="virtual-card-page__meta">
                                            <div>
                                                <span>Card holder</span>
                                                <small>{card.holder}</small>
                                            </div>
                                            <div>
                                                <span>Expires</span>
                                                <small>{card.expiry}</small>
                                            </div>
                                            <div>
                                                <span>CVV</span>
                                                <small>{card.cvv}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="virtual-card-page__notes">
                                        <div>
                                            <span>Use case</span>
                                            <strong>Online purchases and subscriptions</strong>
                                        </div>
                                        <div>
                                            <span>Saved for</span>
                                            <strong>{this.props.state.loginDetails.username}</strong>
                                        </div>
                                    </div>
                                </>
                            :
                                <div className="virtual-card-page__empty">
                                    <h4>No virtual card created yet</h4>
                                    <p>Create a card to see its number, expiry date, and CVV here.</p>
                                </div>
                            }
                        </Card.Body>
                    </Card>
                </div>
            </section>
        )
    }
}

export default VirtualCard
