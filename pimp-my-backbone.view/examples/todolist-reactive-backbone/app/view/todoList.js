define(['react', 'jsx!view/todoListItem'], function (React, TodoListItem) {
  return React.createClass({
    getInitialState: function () {
      var updateState = function () {
        this.setState({ todos: _.clone(this.props.todos.models) });
      };
      
      this.props.todos.on('reset', updateState, this);
      this.props.todos.on('add', updateState, this);
      this.props.todos.on('remove', updateState, this);
      
      return { todos: _.clone(this.props.todos.models) };
    },
    
    render: function () {
      var todos = _.map(this.state.todos, function (todo) {
        return <TodoListItem todo={todo} />;
      });
      
      return <ul>{todos}</ul>;
    }
  });
});