import React from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Alert
} from 'reactstrap';
import Octicon from 'react-octicon';
import Moment from 'moment';
import {Controlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/continuelist.js';
import 'codemirror/addon/display/placeholder.js';

import AppNavbar from './app-navbar.jsx';
import { diagrams } from './diagrams';
import CustomLoader from './custom-loader.jsx';

Moment.locale('ja');
Moment.locale('en');

const WAIT_INTERVAL = 1000;
const DISPLAY_WAIT_INTERVAL = 3000;

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            loading: false,
            diagramType: "blockdiag",
            source: "",
            svg: "<svg />",
            inputTimer: null,
            copyTimer: null,
            copied: false,
		};
        this.onTextChange = this.onTextChange.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.triggerChange = this.triggerChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.downloadSVG = this.downloadSVG.bind(this);
        this.onClickExample = this.onClickExample.bind(this);
    }

    componentDidMount() {
        const width = document.getElementById('source-input').clientWidth;
        const height = document.getElementById('source-input').clientHeight;
        const previewHeaderHeight = document.getElementById('preview-header').clientHeight;
        this.setState({
            imageWidth: width,
            imageHeight: height - previewHeaderHeight
        });
    }

	onTextChange(value) {
		clearTimeout(this.state.inputTimer);
		this.setState({
			source: value
		});

        this.state.inputTimer = setTimeout(this.triggerChange, WAIT_INTERVAL);
        event.preventDefault();
    }

    onSelectChange(event) {
		clearTimeout(this.state.inputTimer);
        this.setState({
            diagramType: event.target.value
        });

        this.state.inputTimer = setTimeout(this.triggerChange, WAIT_INTERVAL);
    }

    onCopy() {
        clearTimeout(this.state.copyTimer);
		this.setState({
			copied: true
		});

        this.state.copyTimer = setTimeout(() => this.setState({copied: false}), DISPLAY_WAIT_INTERVAL);
        event.preventDefault();
	}

	triggerChange() {
        this.setState({
            isError: false,
            loading: true,
            isRendererd: false,
        });

		axios.post(`/api/v1/${this.state.diagramType}`, {
			source: this.state.source
		}).then(res => {
            this.setState({
                loading: false,
                isRendererd: true,
                svg: res.data.image
            });
		}).catch(error => {
            if (error.response) {
                let errorType = error.response.data.etype;
                let errorMesage = error.response.data.error;

                this.setState({
                    loading: false,
                    isError: true,
                    errorType: errorType,
                    errorMessage: errorMesage
                });
            } else {
                console.log(error);
            }
        });
    }

    downloadSVG() {
        var svgData = document.querySelector( "svg" ).outerHTML;
        var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        var formattedDate = Moment().format("YYYY-MM-DD")
        downloadLink.download = `${formattedDate}_blockdiag.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    onClickExample() {
       this.setState({
           source: diagrams[this.state.diagramType]
       }, this.triggerChange);

       event.preventDefault();
    }

    render() {
        return(
            <div>
                <AppNavbar />
                <Container fluid className="mt-2">
                    <Row>
                        <Col md="6">
                            <Form id="source-input">
                                <FormGroup>
                                    <Label for="source" className="mb-0 mr-2">
                                        <h4>
                                            Source
                                        </h4>
                                    </Label>
                                    <Button size="sm" outline color="secondary" onClick={this.onClickExample}><Octicon name="light-bulb" /> See example ({this.state.diagramType})</Button>
                                    <CodeMirror
                                        className="border rounded"
                                        value={this.state.source}
                                        options={{
                                            mode: { name: 'javascript' },
                                            theme: 'default',
                                            lineWrapping: true,
                                            extraKeys: {
                                                "Enter": "newlineAndIndentContinueMarkdownList",
                                                "Tab": "indentMore",
                                                "Shift-Tab": "indentLess",
                                            },
                                            lineNumbers: true,
                                            indentUnit: 4,
                                            smartIndent: true,
                                            indentWithTabs: false,
                                            placeholder: ''
                                        }}
                                        onBeforeChange={(editor, data, value) => {
                                            this.onTextChange(value);
                                        }}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="type">
                                        <h4>
                                            Diagram type
                                        </h4>
                                    </Label>
                                    <Input
                                        type="select" name="select" id="diagram-type"
                                        value={this.state.diagramType}
                                        onChange={this.onSelectChange}
                                    >
                                        {
                                            Object.keys(diagrams).map((diagram_name) => {
                                                return <option key={diagram_name}>{diagram_name}</option>
                                            })
                                        }
                                    </Input>
                                </FormGroup>
                            </Form>
                        </Col>
                        <Col md="6">
                            <Form>
                                <FormGroup>
                                    <Label id="preview-header" for="preview" className="mb-0 mr-2">
                                        <h4>Preview</h4>
                                    </Label>
                                    { this.state.isRendererd ?
                                        <Button size="sm" outline color="info" onClick={this.downloadSVG}><Octicon name="desktop-download" /> Download SVG</Button>
                                    :
                                        null
                                    }
                                    <style>
                                        {`
                                            svg {
                                                width: ${this.state.imageWidth}px;
                                                height: ${this.state.imageHeight}px;
                                            }
                                        `}
                                    </style>
                                    <CustomLoader
                                        active={this.state.loading}
                                        color={'#0E6EB8'}
                                        text="Loading... Please wait!"
                                        borderRadius="0.25em"
                                        backgroundColor="rgba(0,0,0,0.8)"
                                    >
                                        { this.state.isError ?
                                            <Alert color="danger">
                                                <h5 className="alert-heading">{this.state.errorType}</h5>
                                                <p>
                                                    {this.state.errorMessage}
                                                </p>
                                            </Alert>
                                        :
                                            <div className="border rounded text-md-center" dangerouslySetInnerHTML={{__html : this.state.svg}} />
                                        }
                                    </CustomLoader>
                                </FormGroup>
                            </Form>
                        </Col>
                    </Row>
                    <hr />
                    <footer className="container-fluid">
                        <a href="https://github.com/kaishuu0123/blockdiag-api" target="_blank"><Octicon name="mark-github" /> source code</a><br />
                        © 2018 <a href="https://twitter.com/@kaishuu0123" target="_blank">@kaishuu0123</a> (Twitter)<br />
                        This work is based off <a href="http://blockdiag.com/" target="_blank">blockdiag</a>.
                    </footer>
                </Container>
            </div>
        );
    }
}

export default App;