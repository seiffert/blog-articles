define(['backbone', 'react', 'jsx!view/todoList'], function (Backbone, React, TodoList) {
  return Backbone.Router.extend({
    routes: {
      '*default': 'defaultAction'
    },
    
    defaultAction: function () {
      var todos = new Backbone.Collection([
        {
          text: 'Dishes!',
          dueDate: new Date()
        }
      ]);
        
      React.renderComponent(<TodoList todos={todos} />, document.body);
    }
  });
});