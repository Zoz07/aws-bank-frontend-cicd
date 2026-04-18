import React, {Component} from 'react'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Overview from './subcomponents/main/Overview'
import TransferPage from './subcomponents/main/Transfer'
import VirtualCardPage from './subcomponents/main/VirtualCard'
import Authentication from './subcomponents/authentication/Authentication'
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://98.93.31.226:5001/';

const initialTxDetails = {
  txToAccount: '',
  txAmount: 0,
  txCurrency: 'SAR'
}

const initialLoginDetails = {
  email: '',
  username: '',
  password: ''
}

const initialAcctDetails = {
  username: '',
  accountNumber: '',
  balance: 0
}

const initialTxTable = {
  tx_exists: false,
  txs: [],
  page: 0
}

const initialState = {
  route: 'login',
  loginDetails: initialLoginDetails,
  acctDetails: initialAcctDetails,
  txDetails: initialTxDetails,
  txTable: initialTxTable,
  savedRecipients: [],
  isLoadingAuth: false,
  isLoadingTransfer: false,
  notice: {
    text: '',
    type: ''
  }
}

class App extends Component {

  constructor() {
    super()
    this.state = initialState
    this.noticeTimeout = null
  }

  componentWillUnmount() {
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout)
    }
  }

  componentDidMount() {
    this.loadSavedRecipients()
  }
  
  onRouteChange = (dest) => {
    this.clearNotice()
    this.setState({
      route: dest
    })
  }

  onSignOut = () => {
    this.clearNotice()
    this.setState({
      ...initialState,
      route: 'login'
    })
  }

  clearNotice = () => {
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout)
      this.noticeTimeout = null
    }

    this.setState({
      notice: {
        text: '',
        type: ''
      }
    })
  }

  setNotice = (text, type = 'info') => {
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout)
    }

    this.setState({
      notice: {
        text,
        type
      }
    })

    this.noticeTimeout = setTimeout(() => {
      this.clearNotice()
    }, 3500)
  }

  getSavedRecipientsKey = (username = this.state.loginDetails.username) => {
    const normalizedUsername = (username || '').trim().toLowerCase()
    return normalizedUsername ? `zbank-saved-recipients-${normalizedUsername}` : 'zbank-saved-recipients-guest'
  }

  loadSavedRecipients = (username = this.state.loginDetails.username) => {
    const storageKey = this.getSavedRecipientsKey(username)

    try {
      const savedRecipients = JSON.parse(localStorage.getItem(storageKey) || '[]')
      this.setState({
        savedRecipients: Array.isArray(savedRecipients) ? savedRecipients : []
      })
    } catch (error) {
      localStorage.removeItem(storageKey)
      this.setState({
        savedRecipients: []
      })
    }
  }

  normalizeTxTable = (txTable = initialTxTable) => {
    return {
      tx_exists: Boolean(txTable.tx_exists || txTable.exists),
      txs: Array.isArray(txTable.txs) ? txTable.txs : [],
      page: Number(txTable.page || 0)
    }
  }

  requestJson = async (path, requestOptions, fallbackMessage) => {
    try {
      const response = await fetch(BACKEND_URL + path, requestOptions)
      return await response.json()
    } catch (error) {
      this.setNotice(fallbackMessage, 'error')
      return null
    }
  }

  onFormTextChange = (object, key, value) => {
    this.setState({
      [object]: {
        ...this.state[object],
        [key]: value
      }
    })
  }

  sendTransaction = async (txOverride = null) => {
    if (this.state.isLoadingTransfer) {
      return
    }

    const hasTxOverride = txOverride &&
      typeof txOverride === 'object' &&
      Object.prototype.hasOwnProperty.call(txOverride, 'txToAccount')

    const activeTxDetails = hasTxOverride ? txOverride : this.state.txDetails
    const {txToAccount, txAmount, txCurrency} = activeTxDetails
    const normalizedCurrency = (txCurrency || '').trim().toUpperCase()
    const parsedAmount = Number(txAmount)

    if (!txToAccount || !parsedAmount) {
      this.setNotice('Enter the recipient account and amount before sending.', 'error')
      return
    }

    if (parsedAmount <= 0) {
      this.setNotice('Transfer amount must be greater than zero.', 'error')
      return
    }

    if (normalizedCurrency !== 'SAR') {
      this.setNotice('Currency must be SAR.', 'error')
      return
    }

    if (txToAccount === this.state.acctDetails.accountNumber) {
      this.setNotice('Choose a different destination account for this transfer.', 'error')
      return
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.loginDetails.username,
        txDetails: {
          ...activeTxDetails,
          txAmount: parsedAmount,
          txCurrency: normalizedCurrency
        }
      })
    }
    this.setState({
      isLoadingTransfer: true
    })

    let response = await this.requestJson(
      'send_transaction',
      requestOptions,
      'We could not complete the transfer right now. Please try again.'
    )

    if (!response) {
      this.setState({
        isLoadingTransfer: false
      })
      return
    }

    let {message, result} = response
    this.setNotice(message, result ? 'success' : 'error')

    if (result) {
      this.persistRecipient({
        accountNumber: txToAccount,
        currency: 'SAR',
        lastAmount: parsedAmount
      })
      await this.getOverviewRoute()
      this.setState({
        route: 'overview',
        txDetails: initialTxDetails
      })
    }

    this.setState({
      isLoadingTransfer: false
    })
  }

  onAuthentication = async (route) => {
    if (this.state.isLoadingAuth) {
      return
    }

    const normalizedLoginDetails = {
      email: (this.state.loginDetails.email || '').trim(),
      username: (this.state.loginDetails.username || '').trim(),
      password: (this.state.loginDetails.password || '').trim()
    }
    const {username, password, email} = normalizedLoginDetails

    if (!username || !password || (route === 'register' && !email)) {
      this.setNotice('Complete the required fields before continuing.', 'error')
      return
    }

    if (route === 'register' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.setNotice('Enter a valid email address.', 'error')
      return
    }

    if (route === 'register' && password.length < 6) {
      this.setNotice('Password must be at least 6 characters long.', 'error')
      return
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginDetails: normalizedLoginDetails })
    }

    const path = route.startsWith('/') ? route.slice(1) : route

    this.setState({
      isLoadingAuth: true
    })

    let response = await this.requestJson(
      path,
      requestOptions,
      'We could not reach the bank services right now. Please try again.'
    )

    if (!response) {
      this.setState({
        isLoadingAuth: false
      })
      return
    }

    let { success, message, result } = response
    const safeMessage = message === 'Wrong info, fool.' ? 'Incorrect username or password.' : message

    this.setNotice(safeMessage, success ? 'success' : 'error')

    if (success) {
      this.setState({
        route: 'overview',
        loginDetails: {
          ...this.state.loginDetails,
          ...normalizedLoginDetails
        },
        acctDetails: result.account_details,
        txTable: this.normalizeTxTable(result.tx_table),
        txDetails: initialTxDetails
      })
      this.loadSavedRecipients(normalizedLoginDetails.username)
    }

    this.setState({
      isLoadingAuth: false
    })
  }



  getOverviewRoute = async () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loginDetails: this.state.loginDetails
      })
    }
    let response = await this.requestJson(
      'get_overview_route',
      requestOptions,
      'We could not refresh your account overview right now.'
    )
    if (!response) {
      return
    }
    let {success, result} = response
    if (success) {
      this.setState({
        route: 'overview',
        acctDetails: result['account_details'],
        txTable: this.normalizeTxTable(result['tx_table'])
      })
    }
  }

  onNavigatePagination = (value) => {
    let page = this.state.txTable.page
    const pageCount = this.state.txTable.txs.length
    if (value === 'Next') {
      this.setState({
        txTable: {
          ...this.state.txTable,
          page: Math.min(page + 1, Math.max(pageCount - 1, 0))
        }
      })
     } else {
      this.setState({
        txTable: {
          ...this.state.txTable,
          page: Math.max(page - 1, 0)
        }
      })
    }
  }

  persistRecipient = (recipient) => {
    const nextRecipients = [
      {
        ...recipient,
        lastUsed: new Date().toISOString()
      },
      ...this.state.savedRecipients.filter((savedRecipient) => {
        return savedRecipient.accountNumber !== recipient.accountNumber
      })
    ].slice(0, 5)

    localStorage.setItem(this.getSavedRecipientsKey(), JSON.stringify(nextRecipients))
    this.setState({
      savedRecipients: nextRecipients
    })
  }

  useSavedRecipient = (recipient) => {
    this.setState({
      txDetails: {
        ...this.state.txDetails,
        txToAccount: recipient.accountNumber,
        txCurrency: 'SAR'
      }
    })
  }

  render() {
    return (
      <div className = "app">
        <div className="app__background app__background--one" />
        <div className="app__background app__background--two" />
        {this.state.notice.text
        ?
          <div className={`app__notice app__notice--${this.state.notice.type}`}>
            <span>{this.state.notice.text}</span>
            <button
              className="app__notice-close"
              type="button"
              onClick={this.clearNotice}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        :
          null
        }
        {this.state.route === 'overview'
        ?
          <Overview
          state = {this.state}
          onRouteChange = {this.onRouteChange}
          onSignOut = {this.onSignOut}
          getOverviewRoute = {this.getOverviewRoute}
          onNavigatePagination = {this.onNavigatePagination}
          />
        : this.state.route === 'transfer'
        ?
          <TransferPage
          state = {this.state}
          onRouteChange = {this.onRouteChange}
          onSignOut = {this.onSignOut}
          sendTransaction = {this.sendTransaction}
          onFormTextChange = {this.onFormTextChange}
          getOverviewRoute = {this.getOverviewRoute}
          useSavedRecipient = {this.useSavedRecipient}
          />
        : this.state.route === 'virtual-card'
        ?
          <VirtualCardPage
          state = {this.state}
          onRouteChange = {this.onRouteChange}
          onSignOut = {this.onSignOut}
          getOverviewRoute = {this.getOverviewRoute}
          setNotice = {this.setNotice}
          />
        : this.state.route === 'login' || this.state.route === 'register'
        ? 
          <Authentication
          state = {this.state}
          onRouteChange = {this.onRouteChange}
          onFormTextChange = {this.onFormTextChange}
          onAuthentication = {this.onAuthentication}
          isLoadingAuth = {this.state.isLoadingAuth}
          />
        :
          <></>
        }
      </div>
    )
  }
}

export default App;
