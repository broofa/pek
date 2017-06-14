import React, { Component } from 'react';
import logo from './pek.svg';
import './App.css';

import Pek from 'pek'

let id = 0;
const pek = global.pek = new Pek({
  lists: [
    {
      id: id++,
      name: 'Groceries',
      items: [
        {id: id++, name: 'Milk', done: false},
        {id: id++, name: 'Eggs', done: false},
        {id: id++, name: 'Bacon', done: true},
      ]
    },
    {
      id: id++,
      name: 'Honey-do',
      items: [
        {id: id++, name: 'Laundry', done: false},
        {id: id++, name: 'Weed garden', done: true},
        {id: id++, name: 'Stain deck', done: false},
      ]
    }
  ]
})
const model = global.model = pek.model;

class ListItem extends Component {
  componentWillMount() {
    // Listen for changes to item state
    this.off = pek.on(this.props.item, path => this.forceUpdate());

    // Toggle done state on checkbox click
    this.toggleDone = () => this.props.item.done = !this.props.item.done;
    this.onNameChange = (event) => this.props.item.name = event.target.value;
  }

  componentWillUnmount() {
    // Stop listening to item state changes
    this.off();
  }

  render() {
    const item = this.props.item;
    return <label>
      <input type="checkbox" defaultChecked={item.done}  onChange={this.toggleDone} />
      <input type="text" defaultValue={item.name} onChange={this.onNameChange}/>
      </label>
  }
}

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
    this.toggleOpen = () => this.setState({open: !this.state.open});

    this.rotate = (event) => {
      event.stopPropagation();
      this.props.list.items.push(this.props.list.items.shift());
    }
  }

  componentWillMount() {
    this.off = [
      pek.on(this.props.list, path => this.forceUpdate()),
      pek.on(this.props.list.items, path => this.forceUpdate())
    ]
  }

  componentWillUnmount() {
    this.off.forEach(f => f());
  }

  render() {
    return <div>
        <h2 onClick={this.toggleOpen}>{this.props.list.name} <button onClick={this.rotate} >Rotate</button></h2>
        {
          this.state.open ? <div className="list">{
            this.props.list.items.map((item,i) => <ListItem item={item} key={item.id} id={i} />)
          }</div> : null
        }
      </div>
  }
}

class App extends Component {
  componentWillMount() {
    this.off = pek.on('lists.*', path => this.forceUpdate());
  }

  componentWillUnmount() {
    this.off();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Pēk Example</h2>
        </div>
        <img src={logo} className="App-logo" alt="logo" />
        <ul className="lists">{
          model.lists.map((list, i) => <List list={list} key={list.id} id={i} />)
        }</ul>
      </div>
    );
  }
}

export default App;
