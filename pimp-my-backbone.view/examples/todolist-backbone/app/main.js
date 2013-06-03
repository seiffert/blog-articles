require.config({
    paths: {
        backbone: '../lib/backbone',
        jquery: '../lib/jquery-1.9.1',
        lodash: '../lib/lodash.compat',
    },
    shim: {
        backbone: {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        },
    }
});

require(['backbone', 'view/todoList'], function (Backbone, TodoList) {
    var list = new TodoList({
        model: new Backbone.Collection([
            {
                text: 'Dishes!',
                dueDate: new Date()
            }
        ])
    });
    list.render();
    
    list.$el.appendTo(document.body);
});