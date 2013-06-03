define(['backbone'], function (Backbone) {
    return Backbone.View.extend({
        tagName: 'li',
        
        render: function () {
            this.model.on('change', this.render, this);
            this.model.on('remove', this.remove, this);
            
            this.$el.html(this.model.get('text'));
        },
        
        remove: function () {
            this.model.off(null, null, this);
            
            Backbone.View.prototype.remove.apply(this, arguments);
        }
    });
});