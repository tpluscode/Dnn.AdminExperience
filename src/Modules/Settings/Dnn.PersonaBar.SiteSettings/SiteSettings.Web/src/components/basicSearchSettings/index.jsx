import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
    pagination as PaginationActions,
    siteSettings as SiteSettingsActions
} from "../../actions";
import InputGroup from "dnn-input-group";
import SingleLineInputWithError from "dnn-single-line-input-with-error";
import NumberSlider from "dnn-slider";
import Grid from "dnn-grid-system";
import Switch from "dnn-switch";
import Dropdown from "dnn-dropdown";
import Label from "dnn-label";
import Button from "dnn-button";
import "./style.less";
import util from "../../utils";
import resx from "../../resources";
import styles from "./style.less";

class BasicSearchSettingsPanelBody extends Component {
    constructor() {
        super();
        this.state = {
            basicSearchSettings: undefined,
            error: {
                minlength: false,
                maxlength: false
            },
            triedToSubmit: false
        };
    }

    componentWillMount() {
        const {state, props} = this;
        if (props.basicSearchSettings) {
            this.setState({
                basicSearchSettings: props.basicSearchSettings
            });
            return;
        }
        props.dispatch(SiteSettingsActions.getBasicSearchSettings((data) => {
            this.setState({
                basicSearchSettings: Object.assign({}, data.Settings)
            });
        }));
    }

    componentWillReceiveProps(props) {
        let {state} = this;

        let minWordLength = props.basicSearchSettings["MinWordLength"];
        if (minWordLength === "") {
            state.error["minlength"] = true;
        }
        else if (minWordLength !== "") {
            state.error["minlength"] = false;
        }
        let maxWordLength = props.basicSearchSettings["MaxWordLength"];
        if (maxWordLength === "") {
            state.error["maxlength"] = true;
        }
        else if (maxWordLength !== "") {
            state.error["maxlength"] = false;
        }

        this.setState({
            basicSearchSettings: Object.assign({}, props.basicSearchSettings),
            error: state.error,
            triedToSubmit: false
        });
    } 

    onSettingChange(key, event) {
        let {state, props} = this;
        let basicSearchSettings = Object.assign({}, state.basicSearchSettings);

        basicSearchSettings[key] = typeof (event) === "object" ? event.target.value : event;

        if (basicSearchSettings[key] === "" && key === "MinWordLength") {
            state.error["minlength"] = true;
        }
        else if (basicSearchSettings[key] !== "" && key === "MinWordLength") {
            state.error["minlength"] = false;
        }
        if (basicSearchSettings[key] === "" && key === "MaxWordLength") {
            state.error["maxlength"] = true;
        }
        else if (basicSearchSettings[key] !== "" && key === "MaxWordLength") {
            state.error["maxlength"] = false;
        }

        this.setState({
            basicSearchSettings: basicSearchSettings,
            error: state.error,
            triedToSubmit: false
        });

        props.dispatch(SiteSettingsActions.basicSearchSettingsClientModified(basicSearchSettings));
    }

    getAnalyzerTypeOptions() {
        let options = [];
        if (this.props.searchCustomAnalyzers !== undefined) {
            options = this.props.searchCustomAnalyzers.map((item) => {
                return { label: item, value: item };
            });
        }
        return options;
    }

    onUpdate(event) {
        event.preventDefault();
        const {props, state} = this;
        this.setState({
            triedToSubmit: true
        });

        if (state.error.minlength || state.error.maxlength) {
            return;
        }

        props.dispatch(SiteSettingsActions.updateBasicSearchSettings(state.basicSearchSettings, (data) => {
            util.utilities.notify(resx.get("SettingsUpdateSuccess"));
        }, (error) => {
            util.utilities.notifyError(resx.get("SettingsError"));
        }));
    }

    onCancel(event) {
        const {props, state} = this;
        util.utilities.confirm(resx.get("SettingsRestoreWarning"), resx.get("Yes"), resx.get("No"), () => {
            props.dispatch(SiteSettingsActions.getBasicSearchSettings((data) => {
                this.setState({
                    basicSearchSettings: Object.assign({}, data.Settings)
                });
            }));
        });
    }

    /* eslint-disable react/no-danger */
    render() {
        const {props, state} = this;
        if (state.basicSearchSettings) {
            const columnOne = <div className="left-column">
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("lblIndexWordMinLength.Help")}
                        label={resx.get("lblIndexWordMinLength")}
                        />
                    <SingleLineInputWithError
                        inputStyle={{ margin: "0" }}
                        withLabel={false}
                        error={state.error.minlength && state.triedToSubmit}
                        errorMessage={resx.get("valIndexWordMinLengthRequired.Error")}
                        value={state.basicSearchSettings.MinWordLength}
                        onChange={this.onSettingChange.bind(this, "MinWordLength")}
                        style={{ width: "100%" }}
                        />
                </InputGroup>
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("lblIndexWordMaxLength.Help")}
                        label={resx.get("lblIndexWordMaxLength")}
                        />
                    <SingleLineInputWithError
                        inputStyle={{ margin: "0" }}
                        withLabel={false}
                        error={state.error.maxlength && state.triedToSubmit}
                        errorMessage={resx.get("valIndexWordMaxLengthRequired.Error")}
                        value={state.basicSearchSettings.MaxWordLength}
                        onChange={this.onSettingChange.bind(this, "MaxWordLength")}
                        style={{ width: "100%" }}
                        />
                </InputGroup>
            </div>;
            const columnTwo = <div className="right-column">
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("lblCustomAnalyzer.Help")}
                        label={resx.get("lblCustomAnalyzer")}
                        />
                    <Dropdown
                        options={this.getAnalyzerTypeOptions()}
                        value={state.basicSearchSettings.SearchCustomAnalyzer}
                        onSelect={this.onSettingChange.bind(this, "SearchCustomAnalyzer")}
                        />
                </InputGroup>
                <InputGroup>
                    <div className="basicSearchSettings-row_switch">
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("lblAllowLeadingWildcard.Help")}
                            label={resx.get("lblAllowLeadingWildcard")}
                            />
                        <Switch
                            labelHidden={true}
                            value={state.basicSearchSettings.AllowLeadingWildcard}
                            onChange={this.onSettingChange.bind(this, "AllowLeadingWildcard")}
                            />
                    </div>
                </InputGroup>
            </div>;
            return (
                <div className={styles.basicSearchSettings}>
                    <Grid children={[columnOne, columnTwo]} numberOfColumns={2} />
                    <div className="sectionTitle">{resx.get("SearchPriorities")}</div>
                    <InputGroup>
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("lblTitleBoost.Help")}
                            label={resx.get("lblTitleBoost")}
                            />
                            
                        <NumberSlider
                            min={0}
                            max={50}
                            step={5}
                            value={25}
                            onChange={this.onSettingChange.bind(this, "TitleBoost")}
                            />
                    </InputGroup>
                    
                    <div className="sectionTitle">{resx.get("SearchIndex")}</div>
                    <div className="searchIndexWrapper">

                    </div>
                    <div className="buttons-box">
                        <Button
                            disabled={!this.props.basicSearchSettingsClientModified}
                            type="secondary"
                            onClick={this.onCancel.bind(this)}>
                            {resx.get("Cancel")}
                        </Button>
                        <Button
                            disabled={!this.props.basicSearchSettingsClientModified}
                            type="primary"
                            onClick={this.onUpdate.bind(this)}>
                            {resx.get("Save")}
                        </Button>
                    </div>
                </div>
            );
        }
        else return <div />;
    }
}

BasicSearchSettingsPanelBody.propTypes = {
    dispatch: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    basicSearchSettings: PropTypes.object,
    searchCustomAnalyzers: PropTypes.array,
    basicSearchSettingsClientModified: PropTypes.bool,
    portalId: PropTypes.number
};

function mapStateToProps(state) {
    return {
        tabIndex: state.pagination.tabIndex,
        basicSearchSettings: state.siteSettings.basicSearchSettings,
        searchCustomAnalyzers: state.siteSettings.searchCustomAnalyzers,
        basicSearchSettingsClientModified: state.siteSettings.basicSearchSettingsClientModified
    };
}

export default connect(mapStateToProps)(BasicSearchSettingsPanelBody);