import {Component} from 'react'
import {Card, Form, Button} from 'react-bootstrap'

import Navigation from './../navigation/Navigation'
import './Transfer.css'

class TransferPage extends Component {
    render() {
        const {txDetails, savedRecipients, acctDetails} = this.props.state
        const amount = Number(txDetails.txAmount || 0)
        const estimatedFee = amount > 0 ? Math.max(amount * 0.005, 2) : 0
        const remainingBalance = Number(acctDetails.balance || 0) - amount - estimatedFee
        const canSend = txDetails.txToAccount && amount > 0 && txDetails.txCurrency === 'SAR'

        return (
            <section className="transfer-page">
                <Navigation
                title = "Send Money"
                onRouteChange = {this.props.onRouteChange}
                onSignOut = {this.props.onSignOut}
                getOverviewRoute = {this.props.getOverviewRoute}
                />
                <div className="transfer-page__grid">
                    <Card className="transfer-page__panel transfer-page__panel--intro">
                        <Card.Body>
                            <p className="transfer-page__eyebrow">Transfer center</p>
                            <h2>Fast transfers without the clutter.</h2>
                            <p>
                                Send money quickly with a focused transfer flow built around Saudi Riyal payments.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card className="transfer-page__panel">
                        <Card.Body>
                            <div className="transfer-page__form-header">
                                <p className="transfer-page__eyebrow">Transfer details</p>
                                <h3>Create a new transfer</h3>
                            </div>
                            <TransferForm
                            state = {this.props.state}
                            onFormTextChange = {this.props.onFormTextChange}
                            useSavedRecipient = {this.props.useSavedRecipient}
                            />
                            <TransferPreview
                            txDetails = {txDetails}
                            estimatedFee = {estimatedFee}
                            remainingBalance = {remainingBalance}
                            canSend = {canSend}
                            savedRecipients = {savedRecipients}
                            />
                            <Button
                            type="button"
                            className="transfer-page__submit"
                            onClick = {() => {this.props.sendTransaction()}}
                            disabled = {this.props.state.isLoadingTransfer}
                            >
                            {this.props.state.isLoadingTransfer ? 'Sending...' : 'Send transfer'}
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </section>
        )
    }
}

class TransferForm extends Component {
    render() {
        const savedRecipients = this.props.state.savedRecipients || []

        return (
            <Form className="transfer-form">
                {savedRecipients.length
                ?
                    <div className="saved-recipients">
                        <div className="saved-recipients__header">
                            <span>Quick recipients</span>
                            <strong>Use a saved account</strong>
                        </div>
                        <div className="saved-recipients__list">
                            {savedRecipients.map((recipient) => (
                            <button
                            key={recipient.accountNumber}
                            type="button"
                            className="saved-recipients__chip"
                            onClick = {() => {this.props.useSavedRecipient(recipient)}}
                            >
                                <span>{recipient.accountNumber}</span>
                                <strong>{recipient.currency || 'SAR only'}</strong>
                            </button>
                            ))}
                        </div>
                    </div>
                :
                    null
                }
                <Form.Group className="transfer-form__group">
                    <Form.Label>To Account</Form.Label>
                    <Form.Control
                    placeholder="Recipient account number"
                    value = {this.props.state.txDetails.txToAccount}
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange('txDetails', 'txToAccount', event.target.value)
                        }
                    }
                    />
                </Form.Group>
                <Form.Group className="transfer-form__group">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                    type="number"
                    placeholder="0"
                    value = {this.props.state.txDetails.txAmount}
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange('txDetails', 'txAmount', event.target.value)
                        }
                    }
                    />
                </Form.Group>
                <Form.Group className="transfer-form__group">
                    <Form.Label>Currency</Form.Label>
                    <Form.Control
                    placeholder="SAR"
                    value = {this.props.state.txDetails.txCurrency}
                    readOnly
                    />
                </Form.Group>
            </Form>
        )
    }
}

class TransferPreview extends Component {
    render() {
        const {txDetails, estimatedFee, remainingBalance, canSend, savedRecipients} = this.props

        return (
            <div className="transfer-preview">
                <div className="transfer-preview__header">
                    <p className="transfer-page__eyebrow">Before you send</p>
                    <h4>Transfer preview</h4>
                </div>
                <div className="transfer-preview__grid">
                    <div className="transfer-preview__item">
                        <span>Recipient</span>
                        <strong>{txDetails.txToAccount || 'Waiting for account'}</strong>
                    </div>
                    <div className="transfer-preview__item">
                        <span>Amount</span>
                        <strong>{txDetails.txAmount || 0} {txDetails.txCurrency || ''}</strong>
                    </div>
                    <div className="transfer-preview__item">
                        <span>Estimated fee</span>
                        <strong>{estimatedFee.toFixed(2)} SAR</strong>
                    </div>
                    <div className="transfer-preview__item">
                        <span>Balance after send</span>
                        <strong>{canSend ? remainingBalance.toFixed(2) : 'Complete the form'}</strong>
                    </div>
                </div>
                <div className="transfer-preview__footer">
                    <p>{canSend ? 'Estimated arrival: within minutes for supported internal transfers.' : 'Fill in the transfer details to unlock a full preview.'}</p>
                    <span>{savedRecipients.length} saved recipients available</span>
                </div>
            </div>
        )
    }
}

export default TransferPage
