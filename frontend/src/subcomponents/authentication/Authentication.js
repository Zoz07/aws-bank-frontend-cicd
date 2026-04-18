import {Component} from 'react'
import {Card, Form, Button} from 'react-bootstrap'

import './Authentication.css'

const authContent = {
    login: {
        eyebrow: 'Zbank',
        title: 'Move money with clarity and confidence.',
        description: 'Track balances, review activity, and make transfers from one refined Zbank workspace.',
        primaryLabel: 'Log In',
        secondaryLabel: 'Create Account',
        secondaryRoute: 'register'
    },
    register: {
        eyebrow: 'Join Zbank',
        title: 'Set up your banking profile in a minute.',
        description: 'Create secure access and jump straight into a cleaner, faster Zbank experience.',
        primaryLabel: 'Create Account',
        secondaryLabel: 'Back To Login',
        secondaryRoute: 'login'
    }
}

class Authentication extends Component {
    render() {
        const isLogin = this.props.state.route === 'login'
        const content = isLogin ? authContent.login : authContent.register

        return (
            <section className="auth-page">
                <div className="auth-hero">
                    <p className="auth-hero__eyebrow">{content.eyebrow}</p>
                    <h1 className="auth-hero__title">{content.title}</h1>
                    <p className="auth-hero__description">{content.description}</p>
                    <div className="auth-hero__stats">
                        <div className="auth-stat">
                            <span className="auth-stat__value">24/7</span>
                            <span className="auth-stat__label">account access</span>
                        </div>
                        <div className="auth-stat">
                            <span className="auth-stat__value">1</span>
                            <span className="auth-stat__label">supported currency</span>
                        </div>
                        <div className="auth-stat">
                            <span className="auth-stat__value">1</span>
                            <span className="auth-stat__label">clean dashboard</span>
                        </div>
                    </div>
                </div>
                <Card className="auth-card">
                    <Card.Body className="auth-card__body">
                        <div className="auth-card__header">
                            <span className="auth-card__badge">{isLogin ? 'Welcome back' : 'New profile'}</span>
                            <h2>{isLogin ? 'Access your Zbank workspace' : 'Create your Zbank workspace'}</h2>
                            <p>{isLogin ? 'Use your credentials to continue.' : 'Choose your details and start banking with Zbank.'}</p>
                        </div>
                        {isLogin
                        ?
                            <Login
                            onRouteChange = {this.props.onRouteChange}
                            onFormTextChange = {this.props.onFormTextChange}
                            onAuthentication = {this.props.onAuthentication}
                            isLoadingAuth = {this.props.isLoadingAuth}
                            primaryLabel = {content.primaryLabel}
                            secondaryLabel = {content.secondaryLabel}
                            secondaryRoute = {content.secondaryRoute}
                            />
                        :
                            <Register
                            onRouteChange = {this.props.onRouteChange}
                            onFormTextChange = {this.props.onFormTextChange}
                            onAuthentication = {this.props.onAuthentication}
                            isLoadingAuth = {this.props.isLoadingAuth}
                            primaryLabel = {content.primaryLabel}
                            secondaryLabel = {content.secondaryLabel}
                            secondaryRoute = {content.secondaryRoute}
                            />
                        }
                    </Card.Body>
                </Card>
            </section>
        )
    }
}

class Login extends Component {
    render() {
        return (
            <Form className="auth-form" onSubmit={(event) => {
                event.preventDefault()
                this.props.onAuthentication('login')
            }}>
                <Form.Group className="auth-form__group">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                    type ="text"
                    placeholder="Enter your username"
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange(
                                'loginDetails', 'username', event.target.value
                            )
                        }
                    }
                    />
                </Form.Group>
                <Form.Group className="auth-form__group">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                    type ="password"
                    placeholder="Enter your password"
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange(
                                'loginDetails', 'password', event.target.value
                            )
                        }
                    }
                    />
                </Form.Group>
                <div className="auth-form__actions">
                    <Button
                        type="submit"
                        className="auth-button auth-button--primary"
                        disabled = {this.props.isLoadingAuth}
                        >{this.props.primaryLabel}
                    </Button>
                    <Button
                        type="button"
                        className="auth-button auth-button--secondary"
                        onClick = {() => {this.props.onRouteChange(this.props.secondaryRoute)}}
                        >{this.props.secondaryLabel}
                    </Button>
                </div>
            </Form>
        )
    }
}

class Register extends Component {
    render() {
        return (
            <Form className="auth-form" onSubmit={(event) => {
                event.preventDefault()
                this.props.onAuthentication('register')
            }}>
                <Form.Group className="auth-form__group">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                    type ="email"
                    placeholder="name@example.com"
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange(
                                'loginDetails', 'email', event.target.value
                            )
                        }
                    }/>
                </Form.Group>
                <Form.Group className="auth-form__group">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                    type ="text"
                    placeholder="Choose a username"
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange(
                                'loginDetails', 'username', event.target.value
                            )
                        }
                    }/>
                </Form.Group>
                <Form.Group className="auth-form__group">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                    type ="password"
                    placeholder="Create a password"
                    onChange = {
                        (event) => {
                            this.props.onFormTextChange(
                                'loginDetails', 'password', event.target.value
                            )
                        }
                    }
                    />
                </Form.Group>
                <div className="auth-form__actions">
                    <Button
                        type="submit"
                        className="auth-button auth-button--primary"
                        disabled = {this.props.isLoadingAuth}
                    >
                        {this.props.primaryLabel}
                    </Button>
                    <Button
                        type="button"
                        className="auth-button auth-button--secondary"
                        onClick = {() => {this.props.onRouteChange(this.props.secondaryRoute)}}
                        >{this.props.secondaryLabel}
                    </Button>
                </div>
            </Form>
        )
    }
}

export default Authentication
