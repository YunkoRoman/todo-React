import React, {Component} from 'react';
import {
    Switch,
    Route, withRouter
} from "react-router-dom";
import MainPage from '../../containers/mainPage'
import './App.css';



class App extends Component {


    render() {
        return (
            <Switch>
                <Route path={'/'} exact>
                    <MainPage/>
                </Route>

            </Switch>
        )
    }

}

export default withRouter(App)

