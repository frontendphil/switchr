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

        afterRender: function(me) {
            var that = this;

            me.find(".switch").click(function() {
                that.toggle();
                that.onClick();
            });
        },

        getClass: function () {
            return this.active ? "on" : "off";
        },

        renderComponent: function() {
            return $("<div class='switch-container'><div class='switch " + this.getClass() + "' /></div>");
        },

        render: function(target) {
            this.dom = this.renderComponent(target);

            $(target).append(this.dom);

            this.afterRender(this.dom);
        },

        on: function() {
            this.active = true;

            this.dom.find(".switch").removeClass("off").addClass("on");
        },

        off: function() {
            this.active = false;

            this.dom.find(".switch").removeClass("on").addClass("off");
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
            this.channels = $.map(attrs.channels || [], function(channel) {
                return new Channel(channel);
            });
        },

        getCode: function() {
            return this.code.getCode().join("");
        },

        render: function(target) {
            var system = $("<div class='system' />");
            var container = $("<div class='container' />");

            system.append(container);

            var that = this;
            var name = $("<h2>" + this.name + "</h2>");

            var remove = $("<a href='#' class='btn pull-right remove'><i class='icon-remove'></i></a>");
            name.append(remove);

            remove.click(function() {
                $.ajax({
                    type: "POST",
                    url: "/plan/remove/",
                    data: {
                        csrfmiddlewaretoken: $.cookie("csrftoken"),
                        code: that.getCode()
                    },
                    success: function() {
                        system.fadeOut(function() {
                            system.remove();
                        });
                    }
                });

                return false;
            });

            container.append(name);

            this.code.render(container);

            var channels = $("<div class='channels well' />");
            container.append(channels);

            $.each(this.channels, function() {
                var channel = this;

                this.render(channels);

                this.dom.click(function() {
                    $.post("/plan/switch/", {
                        system: that.getCode(),
                        channel: channel.position,
                        active: channel.state()
                    });
                });
            });

            target.append(system);
            system.fadeIn();
        }

    });

    var Channel = Switch.extend({

        init: function(attrs) {
            attrs = attrs || {};

            this.position = attrs.position || 1;
            this.name = attrs.name || "";

            this._super.call(this, attrs);
        },

        state: function() {
            if(this.active) {
                return "1";
            }

            return "0";
        },

        renderComponent: function() {
            var container = $("<div class='channel' />");
            var name = $("<label>" + this.name + "</label>");
            var swtch = this._super();
            var that = this;

            container.append(name, swtch);

            name.click(function() {
                that.toggle();
            });

            return container;
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
                    success: function(system) {
                        $(".new-system").slideUp(function() {
                            addSystem(system);

                            $("button.add-system").fadeIn();
                        });
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

        var addSystem = function(conf) {
            var system = new System(conf);

            system.render($(".systems"));
        };

        $.ajax({
            url: "/plan/systems",
            dataType: "json",
            beforeSend: function() {
                loading.fadeIn();
            },
            success: function(systems) {
                loading.fadeOut(function() {
                    $.each(systems, function() {
                        addSystem(this);
                    });

                    loading.remove();
                });
            }
        });

        $("a.add-device").click(function() {
            var target = $(this).attr("target");

            var parent = $(".new-system ." + target);
            var deviceNumber = parent.children("input").length + 1;

            var input = $("<input type='text' name='devices' placeholder='Device #" + deviceNumber + "' />");

            parent.append(input);

            input.focus();

            return false;
        });

        $("button.add-system").click(function() {
            $(".new-system").slideDown();

            $(this).fadeOut();
        });

    });

}());
