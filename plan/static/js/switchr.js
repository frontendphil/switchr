(function() {

    var emptyFn = function() {};

    var Switch = Clazz.extend({

        init: function(attrs) {
            attrs = attrs || {};

            this.active = attrs.on || false;
            this.onClick = attrs.click || emptyFn;
        },

        toggle: function() {
            if(this.active) {
                this.off();
            } else {
                this.on();
            }
        },

        render: function(target) {
            var dom = $("<div class='switch' />");
            var that = this;

            dom.click(function() {
                that.toggle();
                that.onClick();
            });

            this.dom = dom;

            $(target).append(dom);

            this.toggle();
        },

        on: function() {
            this.active = true;

            this.dom.removeClass("off").addClass("on");
        },

        off: function() {
            this.active = false;

            this.dom.removeClass("on").addClass("off");
        },

        getCode: function() {
            if(this.active) {
                return "1";
            }

            return "0";
        }

    });

    var SwitchBoard = Clazz.extend({

        init: function(attrs) {
            attrs = attrs || {};

            this.switches = [];

            attrs.switches = attrs.switches || 0;
            attrs.config = attrs.config || {};

            this.initSwitches(attrs.switches, attrs.config);
        },

        initSwitches: function(count, config) {
            var i;

            for(i = 0; i < count; i = i + 1) {
                this.switches.push(new Switch(config));
            }
        },

        render: function(target) {
            var dom = $("<div class='switch-board' />");

            $.each(this.switches, function() {
                this.render(dom);
            });

            this.dom = dom;

            $(target).append(dom);
        },

        getCode: function() {
            return $.map(this.switches, function(el) {
                return el.getCode();
            });
        }

    });

    $(document).ready(function() {

        var board = new SwitchBoard({
            switches: 5
        });

        board.render(".system-code");

        var aChannel = new Switch({
            click: function() {
                $.post("/plan/switch/", {
                    system: board.getCode().join(""),
                    channel: "1",
                    active: this.active ? "1" : "0"
                });
            }
        });

        aChannel.render(".plugs");

    });

}());
