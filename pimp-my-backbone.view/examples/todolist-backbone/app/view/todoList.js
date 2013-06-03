define(['backbone', 'view/todoListItem'], function (Backbone, TodoListItem) {
    return Backbone.View.extend({
        tagName: 'ul',
        
        listItems: null,
        
        initialize: function () {
            this.listItems = {};
        },
        
        render: function () {
            this.$el.empty();
            
            this.removeListItems();
            
            this.model.on('add', this.onTodoAdded, this);
            this.model.on('reset', this.render, this);
            
            this.model.each(function (todo) {
                var listItem = this.getListItemForTodo(todo);
                
                listItem.render();
                
                this.$el.append(listItem.$el);
            }, this);
        },
        
        remove: function () {
            this.removeListItems();
            this.model.off(null, null, this);
            
            Backbone.View.prototype.remove.apply(this, arguments);
        },
        
        removeListItems: function () {
            _.invoke(this.listItems, 'remove');
        },
        
        getListItemForTodo: function (todo) {
            if (_.isUndefined(this.listItems[todo.text])) {
                this.listItems[todo.text] = new TodoListItem({
                    model: todo
                });
            }
            
            return this.listItems[todo.text];
        },
        
        onAddTodo: function (todo, collection) {
            var index = collection.indexOf(todo),
                listItem = this.getListItemForTodo(todo);

            this.insertListItemAtIndex(listItem, index);
        },

        insertListItemAtIndex: function (listItem, index) {
            var $list = this.$el;

            if ($list.children().length < index) {
                $list.append(listItem.$el);
            } else {
                $list.children().eq(index).prepend(listItem.$el);
            }
        }
    });
});