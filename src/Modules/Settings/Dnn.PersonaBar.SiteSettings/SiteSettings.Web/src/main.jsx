﻿import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import application from "./globals/application";
import configureStore from "./store/configureStore";
import App from "./containers/Root";
setTimeout(() => {
    let store = configureStore();

    application.dispatch = store.dispatch;

    const appContainer = document.getElementById("siteSettings-container");
    application.init(appContainer.dataset.initCallback);
    render(
        <Provider store={store}>
            <App />
        </Provider>,
        appContainer
    );
}, 500);