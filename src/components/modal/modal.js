import React, {Component} from "react";
import {FormControl, InputGroup, Button, Form} from "react-bootstrap";
import DatePicker from "react-datepicker";
import axios from "axios"
import {HOST} from "../../constants/API"

import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './modal.css'


class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date,
            text: '',
            fileData: null,
            fileName: '',
        };
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleSubmitTODO = this.handleSubmitTODO.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitNewList = this.handleSubmitNewList.bind(this);
        this.handleSubmitEditTodo = this.handleSubmitEditTodo.bind(this);
        this.input = React.createRef();
    }


    async handleSubmitTODO(event) {
        event.preventDefault();

        const {text, startDate} = this.state;
        const checked = false;
        const list_id = this.props.currentListId;

        const createdTodo = await axios.post(`${HOST}/todo/save`, {text, startDate, list_id, checked});
        this.props.passNewTodo(createdTodo)
        if (createdTodo) {
            this.props.onClose && this.props.onClose(event);
            this.setState({
                text: ''
            })
        }
    }

    async handleSubmitNewList(event) {
        event.preventDefault();

        const {fileData} = this.state;
        const formData = new FormData();
        formData.append('logo', fileData);

        if (fileData === null) {

            //creating new list without custom logo
            const {fileName, text} = this.state;
            const createdList = await axios.post(`${HOST}/list/save`, {fileName, text});

            this.props.passNewList(createdList)
            if (createdList) {
                this.props.onCloseModalList && this.props.onCloseModalList(event)
                this.setState({
                    text: ''
                })
            }

        } else {

            const result = await axios.post(`${HOST}/upload`, formData);
            if (result) {
                this.setState({
                    ...this.state,
                    fileName: result.data.msg
                });
                //creating new list
                const {fileName, text} = this.state;
                const createdList = await axios.post(`${HOST}/list/save`, {fileName, text});

                this.props.passNewList(createdList);

                if (createdList) {
                    this.props.onCloseModalList && this.props.onCloseModalList(event)
                    this.setState({
                        text: ''
                    })
                }

            }
        }

    }

    handleChange(event) {

        this.setState({
            text: event.target.value
        })
    }

    handleChangeDate(date) {

        this.setState({
            startDate: date,

        })
    }

    handleFile = e => {

        this.setState({...this.state, [e.target.name]: e.target.files[0]});
    };

    onClose = e => {

        this.props.onClose && this.props.onClose(e);
    };


    onCloseEditModal = e => {

        this.props.onCloseChangeModal && this.props.onCloseChangeModal(e);
    };
    onCloseModalList = e => {

        this.props.onCloseModalList && this.props.onCloseModalList(e)
    };

    async handleSubmitEditTodo(event) {
        event.preventDefault();

        console.log(this.props.mainState);
        const {todoId} = this.props.mainState;
        const text = this.input.current.value;
        const {startDate: date} = this.state;

        const result = await axios.put(`${HOST}/todo/${todoId}`, {text, date});

        if (result.data.msg[0] === 1) {

            this.props.onCloseChangeModal && this.props.onCloseChangeModal(event);
            window.location.reload()
        }

    }


    render() {
        //Add new TODO
        if (this.props.show) {

            return (
                <div className={'modalPage'}>
                    <div className={'modalPage_head'}>
                        <img onClick={this.onClose} className={'btn_img'} src={process.env.PUBLIC_URL + '/cancel.svg'}
                             alt=""/>
                    </div>

                    <div className={'modal_body'}>

                        <form className={'modal_body__form'}>
                            <InputGroup className="mb-3 modal_body__form__input">
                                <FormControl value={this.state.text} onChange={this.handleChange}
                                             placeholder="Text"
                                />
                            </InputGroup>
                            <div className={'modal_body__picker'}>
                                <DatePicker selected={this.state.startDate}
                                            onChange={this.handleChangeDate}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                />

                            </div>
                            <Button className={'modal_body__form__btn'} onClick={this.handleSubmitTODO}
                                    variant="primary">Create</Button>
                        </form>

                    </div>
                </div>
            );
        }
        //Add new List

        if (this.props.showNewList) {

            return (
                <div className={'modalPage'}>
                    <div className={'modalPage_head'}>
                        <img onClick={this.onCloseModalList} className={'btn_img'}
                             src={process.env.PUBLIC_URL + '/cancel.svg'}
                             alt=""/>
                    </div>

                    <div className={'modal_body'}>

                        <form className={'modal_body__form'}>
                            <InputGroup className="mb-3 modal_body__form__input">
                                <FormControl value={this.state.text} onChange={this.handleChange}
                                             placeholder="List name"
                                />
                            </InputGroup>
                            <div className={'modal_body__picker'}>
                                <Form.Group>
                                    <Form.File id="exampleFormControlFile1"
                                               label="You can upload logo for your list. Only jpg, svg, png file"
                                               onChange={this.handleFile}
                                               type="file"
                                               name="fileData"

                                    />
                                </Form.Group>
                            </div>
                            <Button className={'modal_body__form__btn'} onClick={this.handleSubmitNewList}
                                    variant="primary">Create</Button>
                        </form>

                    </div>
                </div>
            )
        }

        //Modal page for edit To-Do
        if (this.props.mainState.showChangeModal) {
            const {todoText} = this.props.mainState;


            return (
                <div className={'modalPage'}>
                    <div className={'modalPage_head'}>
                        <img onClick={this.onCloseEditModal} className={'btn_img'}
                             src={process.env.PUBLIC_URL + '/cancel.svg'} alt=""/>
                    </div>

                    <div className={'modal_body'}>

                        <form className={'modal_body__form'} onSubmit={this.handleSubmitEditTodo}>
                            <InputGroup className="mb-3 modal_body__form__input">
                                <FormControl ref={this.input} defaultValue={todoText}
                                             placeholder="Text"
                                />
                            </InputGroup>
                            <div className={'modal_body__picker'}>
                                <DatePicker selected={this.state.startDate}
                                            onChange={this.handleChangeDate}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                />

                            </div>
                            <input className={'modal_body__form__btn'} type="submit" value={'Submit'}/>

                        </form>

                    </div>
                </div>
            );
        }

        return null;


    }
}


export default Modal