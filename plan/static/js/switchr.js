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
            var cls = this.active ? "on" : "off";

            var dom = $("<div class='switch + " + cls + "' />");
            var that = this;

            dom.click(function() {
                that.toggle();
                that.onClick();
            });

            this.dom = dom;

            $(target).append(dom);
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

            attrs.code = attrs.code || "";

            this.initSwitches(attrs.code);
        },

        parseCode: function(code, result) {
            if(!code) {
                return;
            }

            result = result || [];

            result.push({
                on: code.slice(0, 1) === "1"
            });

            this.parseCode(code.slice(1), result);

            return result;
        },

        initSwitches: function(code) {
            var configs = this.parseCode(code);
            var that = this;

            $.each(configs, function() {
                that.switches.push(new Switch(this));
            });
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

    var System = Clazz.extend({

        init: function(attrs) {
            attrs = attrs || {};

            this.code = new SwitchBoard({
                code: attrs.code
            });

            this.name = attrs.name || "";
            this.channels = $.map(attrs.channels || [], function(channel, index) {
                return new Channel(channel, index);
            });
        },

        render: function(target) {
            var name = $("<h2>" + this.name + "</h2>");
            var that = this;

            target.append(name);

            this.code.render(target);

            $.each(this.channels, function() {
                var channel = this;

                this.render(target);

                this.dom.click(function() {
                    $.post("/plan/switch/", {
                        system: that.code.getCode().join(""),
                        channel: channel.nr,
                        active: channel.state()
                    });
                });
            });
        }

    });

    var Channel = Switch.extend({

        init: function(attrs, position) {
            attrs = attrs || {};

            this.nr = position || 0;

            this._super.call(this, attrs);
        },

        state: function() {
            if(this.active) {
                return "1";
            }

            return "0";
        }

    });

    $(document).ready(function() {

        $(".new-system .system-code").each(function() {
            var system = new SwitchBoard({
                code: $(this).attr("code")
            });

            system.render($(this));

            var form = $(".new-system form");

            $(".new-system a.add-system").click(function() {
                var channels = [];

                $(".new-system .channels input").each(function() {
                    channels.push($(this).val());
                });

                $.ajax({
                    url: form.attr("action"),
                    type: "POST",
                    dataType: "json",
                    data: {
                        csrfmiddlewaretoken: $.cookie("csrftoken"),
                        name: form.find("input[name=name]").val(),
                        code: system.getCode().join(""),
                        channels: channels
                    },
                    success: function() {
                        $(".new-system").slideUp();
                    },
                    error: function(response) {
                        alert(response.responseText);
                    }
                });

                return false;
            });

            $(".new-system a.cancel").click(function() {
                $(".new-system").slideUp();
                $("button.add-system").fadeIn();

                return false;
            });
        });

        var loading = $("<div class='loading'>loading systems...</div>");
        loading.hide();

        $(".systems").append(loading);

        $.ajax({
            url: "/plan/systems",
            dataType: "json",
            beforeSend: function() {
                loading.fadeIn();
            },
            success: function(systems) {
                loading.fadeOut();

                $.each(systems, function() {
                    var container = $("<div class='system'>");
                    var system = new System(this);

                    system.render(container);

                    $(".systems").append(container);
                });
            }
        });

        $("a.add-device").click(function() {
            var target = $(this).attr("target");

            var parent = $(".new-system ." + target);
            var deviceNumber = parent.children("input").length + 1;

            parent.append($("<input type='text' name='devices' placeholder='Device #" + deviceNumber + "' />"));

            return false;
        });

        $("button.add-system").click(function() {
            $(".new-system").slideDown();

            $(this).fadeOut();
        });

    });

}());
