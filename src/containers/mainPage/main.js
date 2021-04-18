import React, {Component} from 'react';
import {
    withRouter
} from "react-router-dom";
import Modal from '../../components/modal'
import {withStyles} from '@material-ui/core/styles';
import {green} from '@material-ui/core/colors';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {HOST} from "../../constants/API";
import axios from "axios/index";
import DATE from 'date-and-time';
import './main.css';


const GreenCheckbox = withStyles({
    root: {
        color: green[400],
        '&$checked': {
            color: green[600],
        },
    },
    checked: {},
})((props) => <Checkbox color="default" {...props} />);

class Main extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            showModal: false,
            showNewListModal: false,
            showChangeModal:false,
            lists: null,
            currentListId: null,
            todoList: null,
            titleName: '',
            todoText:'',
            todoId:null,
            todoDate:''
        };
        this.handleChange = this.handleChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.showNewListModal = this.showNewListModal.bind(this);
        this.createNewList = this.createNewList.bind(this);
        this.fetchTodo = this.fetchTodo.bind(this);
        this.createNewTodo = this.createNewTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.showChangeModal = this.showChangeModal.bind(this);

    }

    async componentDidMount() {

        const lists = await axios.get(`${HOST}/list`);
        this.setState({
            ...this.state,
            lists: lists.data.msg
        })

    }

    //change checked in state
    async handleChange(id) {
        const elementsIndex = this.state.todoList.findIndex(element => element.id === id);
        let newArray = [...this.state.todoList];
        newArray[elementsIndex] = {...newArray[elementsIndex], checked: !newArray[elementsIndex].checked};

        this.setState({
            ...this.state,
            todoList: newArray
        });

        const updateTodo = await axios.put(`${HOST}/todo/checked/${id}`, {checked: newArray[elementsIndex].checked});

    };

    showModal() {
        this.setState({
            showModal: !this.state.showModal
        });
    };

    showNewListModal() {
        this.setState({
            showNewListModal: !this.state.showNewListModal
        });
    };
    showChangeModal() {
        this.setState({
            showChangeModal: !this.state.showChangeModal
        });
    };

    createNewList(list) {

        this.setState(state => {
            const lists = [...state.lists, list.data.msg];

            return {
                lists,
            };
        });
    }

    createNewTodo(todo) {
        const {todoList} = this.state;
        todoList.push(todo.data.msg);
        const sortArray = todoList.sort((a, b) => {
            return new Date(a.date) - new Date(b.date)
        });
        this.setState({
            ...this.state,
            todoList: sortArray
        });
    }

    async fetchTodo(id, text) {
        //change currentListId in state. It is need for creating new todo
        this.setState({
            ...this.state,
            currentListId: id,
            titleName: text
        });
        //fetch todo when clicked on list
        const listTodo = await axios.get(`${HOST}/todo/${id}`);

        this.setState({
            ...this.state,
            todoList: listTodo.data.msg
        })

    }

    async deleteTodo(id) {
        const{currentListId, titleName} = this.state;
        const confirm = window.confirm('Do you want delete this To-Do?');
        if (confirm) {
            const result = await axios.delete(`${HOST}/todo/${id}`);
            if (result.data.msg === 1) {
                this.fetchTodo(currentListId,titleName)
            }

        }

    }

    changeTodo(id, text, date ){
        this.setState({
            ...this.state,
            todoId:id,
            todoText:text,
            todoDate:date
        });
        this.showChangeModal()

    }

    renderLists({text, id, fileName}) {
        if (!fileName) {
            return (
                <div key={id} onClick={() => this.fetchTodo(id, text)} className={'main__listName__position'}>
                    <div className={'main__listName__position__img'}>
                        <img className={'btn_img'} src={process.env.PUBLIC_URL + '/menu.svg'} alt=""/>
                    </div>
                    <div className={'textHorCenter'}>
                        <p id={'text'}> {text} </p>
                    </div>
                </div>

            )
        }
        return (
            <div key={id} onClick={() => this.fetchTodo(id, text)} className={'main__listName__position'}>
                <div className={'main__listName__position__img'}>
                    <img className={'btn_img'} src={`${HOST}/${fileName}`} alt=""/>
                </div>
                <div className={'textHorCenter'}>
                    <p id={'text'}> {text} </p>
                </div>
            </div>

        )
    }

    renderTodo({id, text, date, checked}) {
        const now = new Date(date);

        const formDate = DATE.format(now, 'DD-MM-YYYY HH:mm');
        return (
            <div key={id} className={'main__todo__list__position'}>
                <div className={'main__todo__list__position__checkBox'}>
                    <FormControlLabel
                        control={<GreenCheckbox checked={checked}
                                                onChange={() => this.handleChange(id)}
                                                name="checked"/>}
                    />
                </div>

                <div className={'textHorCenter main__todo__list__position__text'}>
                    <p id={'text'}>{text}</p>
                </div>

                <div className={'main__todo__list__position__date'}>
                    <span> {formDate}</span>
                </div>

                <div className={'main__todo__list__position__edit'}>
                    <div className={'main__todo__list__position__edit__icon'} onClick={()=> this.changeTodo(id, text, date)}>
                        <img className={'btn_img'} src={process.env.PUBLIC_URL + '/pencil.svg'} alt=""/>
                    </div>
                    <div className={'main__todo__list__position__edit__icon'} onClick={() => this.deleteTodo(id)}>
                        <img className={'btn_img'} src={process.env.PUBLIC_URL + '/cancel.svg'} alt=""/>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {lists, todoList, titleName} = this.state;
        if (lists) {
            return (
                <div className={'main'}>
                    <div className={'main__listName'}>

                        {lists.map(this.renderLists, this)}

                        <div className={'main__listName__addList'} onClick={this.showNewListModal}>
                            <div className={'main__todo__add_todo__button'}>
                                <img width={'10px'} className={'btn_img'} src={process.env.PUBLIC_URL + '/plus.svg'}
                                     alt=""/>
                                <p className={'textHorCenter main__todo__add_todo__button__text'}>New List</p>
                            </div>
                        </div>
                    </div>

                    <div className={'main__todo'}>
                        <div className={'main__todo__headImage'}>
                            <img src="https://cdn.pixabay.com/photo/2014/02/27/16/10/tree-276014_960_720.jpg" alt=""
                                 id={'img'}/>
                            <p id={'img_title'}>{titleName}</p>
                        </div>

                        <div className={'main__todo__list'}>

                            {(todoList === null) ? null : todoList.map(this.renderTodo, this)}


                        </div>

                        <div className={(todoList === null) ? 'hidden' : 'main__todo__add_todo'}>
                            <div className={'main__todo__add_todo__button'} onClick={this.showModal}>
                                <img width={'10px'} className={'btn_img'} src={process.env.PUBLIC_URL + '/plus.svg'}
                                     alt=""/>
                                <p className={'textHorCenter main__todo__add_todo__button__text'}>New To-Do</p>
                            </div>
                        </div>

                    </div>
                    <Modal onClose={this.showModal} onCloseModalList={this.showNewListModal}
                           passNewList={this.createNewList} passNewTodo={this.createNewTodo} show={this.state.showModal}
                           showNewList={this.state.showNewListModal} currentListId={this.state.currentListId}
                            mainState={this.state} onCloseChangeModal={this.showChangeModal}/>
                </div>

            )
        }
        return null

    }
}

export default withRouter(Main)

