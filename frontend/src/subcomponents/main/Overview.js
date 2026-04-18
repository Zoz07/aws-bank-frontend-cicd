import {Component} from 'react'
import {Table, Card, Button, Form} from 'react-bootstrap'

import Navigation from './../navigation/Navigation'
import './Overview.css'

class Overview extends Component {
    render() {
        const acctInfo = this.props.state.acctDetails
        const txPages = Array.isArray(this.props.state.txTable.txs) ? this.props.state.txTable.txs : []
        const allTransactions = txPages.flatMap((page) => page.txs_on_page || [])
        const accountNumber = acctInfo.accountNumber
        const outgoingTransactions = allTransactions.filter((tx) => tx.from_account === accountNumber)
        const incomingTransactions = allTransactions.filter((tx) => tx.to_account === accountNumber)
        const outgoingTotal = outgoingTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
        const incomingTotal = incomingTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
        const savedRecipients = this.props.state.savedRecipients || []

        return (
            <section className="dashboard">
                <Navigation
                title = "Account Overview"
                onRouteChange = {this.props.onRouteChange}
                onSignOut = {this.props.onSignOut}
                getOverviewRoute = {this.props.getOverviewRoute}
                />
                <div className="dashboard__grid">
                    <Card className="dashboard__hero">
                        <Card.Body>
                            <p className="dashboard__eyebrow">Primary account</p>
                            <h2 className="dashboard__headline">A calm, clear view of your finances.</h2>
                            <p className="dashboard__copy">
                                Monitor account activity, review balances, and move funds without digging through clutter.
                            </p>
                            <div className="dashboard__hero-stats">
                                <div>
                                    <span className="dashboard__hero-label">Account holder</span>
                                    <strong>{acctInfo.username || 'Your profile'}</strong>
                                </div>
                                <div>
                                    <span className="dashboard__hero-label">Available balance</span>
                                    <strong>{acctInfo.balance} SAR</strong>
                                </div>
                                <div>
                                    <span className="dashboard__hero-label">Money in</span>
                                    <strong>{incomingTotal.toFixed(2)} SAR</strong>
                                </div>
                                <div>
                                    <span className="dashboard__hero-label">Money out</span>
                                    <strong>{outgoingTotal.toFixed(2)} SAR</strong>
                                </div>
                            </div>
                            <div className="dashboard__hero-actions">
                                <Button
                                className="dashboard__cta"
                                onClick = {() => {this.props.onRouteChange('transfer')}}
                                >
                                Make a transfer
                                </Button>
                                <div className="dashboard__hero-note">
                                    <span>Security pulse</span>
                                    <strong>{outgoingTransactions.length > 3 ? 'High activity today' : 'Normal account activity'}</strong>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="dashboard__summary">
                        <Card.Body>
                            <AccountInformation
                            state = {this.props.state}
                            />
                        </Card.Body>
                    </Card>
                </div>

                <div className="dashboard__insights">
                    <InsightCard
                    label = "Recent recipients"
                    value = {savedRecipients.length ? `${savedRecipients.length} saved` : 'None yet'}
                    copy = {savedRecipients.length ? `Last used ${savedRecipients[0].accountNumber}` : 'Recipients you send to will appear here for faster transfers.'}
                    />
                    <InsightCard
                    label = "Transaction flow"
                    value = {allTransactions.length}
                    copy = {allTransactions.length ? `${incomingTransactions.length} incoming and ${outgoingTransactions.length} outgoing transactions in your current view.` : 'Once activity begins, this panel will summarize the mix of incoming and outgoing money.'}
                    />
                </div>

                <Card className="dashboard__transactions">
                    <Card.Body>
                        <div className="dashboard__section-heading">
                            <div>
                                <p className="dashboard__eyebrow">Recent activity</p>
                                <h3>Transaction history</h3>
                            </div>
                        </div>
                        <TransactionTable
                        state = {this.props.state}
                        onNavigatePagination = {this.props.onNavigatePagination}
                        />
                    </Card.Body>
                </Card>
            </section>
        )
    }
}

class AccountInformation extends Component {
    render() {
        let acctInfo = this.props.state.acctDetails

        return (
            <div className="summary-panel">
                <div className="summary-panel__header">
                    <p className="dashboard__eyebrow">Snapshot</p>
                    <h3>Account details</h3>
                </div>
                <div className="summary-panel__metrics">
                    <div className="summary-panel__metric">
                        <span>Name</span>
                        <strong>{acctInfo.username}</strong>
                    </div>
                    <div className="summary-panel__metric">
                        <span>Account Number</span>
                        <strong>{acctInfo.accountNumber}</strong>
                    </div>
                    <div className="summary-panel__metric summary-panel__metric--balance">
                        <span>Balance</span>
                        <strong>{acctInfo.balance}</strong>
                    </div>
                </div>
            </div>
        )
    }
}

class TransactionTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchTerm: '',
            directionFilter: 'all'
        }
    }

    render() {
        let txTable = this.props.state.txTable
        const acctInfo = this.props.state.acctDetails
        const activePage = txTable.tx_exists ? txTable.txs[txTable.page] : null
        const transactionsOnPage = activePage ? activePage.txs_on_page : []
        const filteredTransactions = transactionsOnPage.filter((tx) => {
            const joinedValues = [
                tx.id,
                tx.from_account,
                tx.to_account,
                tx.amount,
                tx.currency,
                tx.date
            ].join(' ').toLowerCase()
            const direction = tx.to_account === acctInfo.accountNumber ? 'incoming' : 'outgoing'
            const matchesSearch = joinedValues.includes(this.state.searchTerm.toLowerCase())
            const matchesDirection = this.state.directionFilter === 'all' || this.state.directionFilter === direction

            return matchesSearch && matchesDirection
        })

        return (
            <>
                {txTable.tx_exists
                ?
                    <>
                        <div className="transactions-toolbar">
                            <Form.Control
                            className="transactions-toolbar__search"
                            placeholder="Search by amount, account, or date"
                            value = {this.state.searchTerm}
                            onChange = {(event) => {this.setState({searchTerm: event.target.value})}}
                            />
                            <Form.Select
                            className="transactions-toolbar__filter"
                            value = {this.state.directionFilter}
                            onChange = {(event) => {this.setState({directionFilter: event.target.value})}}
                            >
                                <option value="all">All activity</option>
                                <option value="incoming">Incoming only</option>
                                <option value="outgoing">Outgoing only</option>
                            </Form.Select>
                        </div>
                        <div className="transactions-table__wrap">
                            <Table className="transactions-table" responsive>
                                <thead>
                                    <tr>
                                        <th>Direction</th>
                                        <th>Transaction ID</th>
                                        <th>From Account</th>
                                        <th>To Account</th>
                                        <th>Amount</th>
                                        <th>Currency</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx) => {
                                    const isIncoming = tx.to_account === acctInfo.accountNumber
                                    return (
                                    <tr key={tx.id}>
                                        <td>
                                            <span className={`transaction-badge ${isIncoming ? 'transaction-badge--incoming' : 'transaction-badge--outgoing'}`}>
                                                {isIncoming ? 'Incoming' : 'Outgoing'}
                                            </span>
                                        </td>
                                        <td>{tx.id}</td>
                                        <td>{tx.from_account}</td>
                                        <td>{tx.to_account}</td>
                                        <td>{tx.amount}</td>
                                        <td>{tx.currency}</td>
                                        <td>{tx.date}</td>
                                    </tr>
                                    )})}
                                </tbody>
                            </Table>
                        </div>
                        {!filteredTransactions.length
                        ?
                            <div className="transactions-empty transactions-empty--filtered">
                                <h4>No transactions match this view</h4>
                                <p>Try clearing your search or changing the direction filter to see more activity.</p>
                            </div>
                        :
                            null
                        }
                        <Pagination
                        state = {this.props.state}
                        onNavigatePagination = {this.props.onNavigatePagination}
                        />
                    </>
                :
                    <div className="transactions-empty">
                        <h4>No transactions yet</h4>
                        <p>Your account activity will appear here as soon as money starts moving.</p>
                    </div>
                }
            </>
        )
    }
}

class InsightCard extends Component {
    render() {
        return (
            <Card className="dashboard__insight-card">
                <Card.Body>
                    <p className="dashboard__eyebrow">{this.props.label}</p>
                    <h3>{this.props.value}</h3>
                    <p>{this.props.copy}</p>
                </Card.Body>
            </Card>
        )
    }
}

class Pagination extends Component {
    render() {
        let txTable = this.props.state.txTable
        return (
            <div className="transactions-pagination">
            {txTable.txs[txTable.page]['has_prev']
            ?
                <Button
                className="transactions-pagination__button transactions-pagination__button--ghost"
                onClick = {() => {this.props.onNavigatePagination('Previous')}}
                >
                    Previous
                </Button>
            :
                null
            }
            {txTable.txs[txTable.page]['has_next']
            ?
                <Button
                className="transactions-pagination__button"
                onClick = {() => {this.props.onNavigatePagination('Next')}}
                >
                    Next
                </Button>
            :
                null
            }
            </div>
        )
    }
}

export default Overview
