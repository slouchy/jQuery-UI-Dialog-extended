/*
* jQuery UI dialogOptions v1.0
* @desc extending jQuery Ui Dialog - Responsive, click outside, class handling
* @author Jason Day
* 
* Dependencies:
*              jQuery: http://plugins.jquery.com/project/jPrintArea
*              jQuery UI: https://github.com/permanenttourist/jquery.jqprint
*              debouncedresize: https://github.com/louisremi/jquery-smartresize
*
* MIT license:
*              http://www.opensource.org/licenses/mit-license.php
*
* (c) Jason Day 2014
*
* New Options:
*	clickOut: true              // closes dialog when clicked outside
*	responsive: true            // fluid width & height based on viewport
*	showTitleBar: true          // hide titlebar
*	showCloseButton: true       // hide close button
*  
* Added functionality:
* 	add & remove dialogClass to .ui-widget-overlay for scoping styles
* 	patch for: http://bugs.jqueryui.com/ticket/4671
*/

// orientation change event - requires debouncedresize
var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "debouncedresize";


// add new options with default values
$.ui.dialog.prototype.options.clickOut = true;
$.ui.dialog.prototype.options.responsive = true;
$.ui.dialog.prototype.options.showTitleBar = true;
$.ui.dialog.prototype.options.showCloseButton = true;


// extend _init
var _init = $.ui.dialog.prototype._init;
$.ui.dialog.prototype._init = function () {
    var self = this;
    // apply original arguments
    _init.apply(this, arguments);
    // responsive width & height
    if (self.options["responsive"]) {
         var resize = function () {
            var elem = self.element,
                wHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight,
                wWidth = "innerWidth" in window ? window.innerWidth : document.documentElement.offsetWidth,
                dHeight = elem.parent().outerHeight(),
                dWidth = elem.parent().outerWidth(),
                setHeight = wHeight * 0.8,
                setWidth = wWidth * 0.8;
            
            if((dHeight + 100) > wHeight){
                elem.dialog("option","height", setHeight);
            }
            if((dWidth + 100) > wWidth){
                elem.dialog("option","width", setWidth);
            }
            
            elem.dialog("option", "position", "center");
           
            elem.css({
                "overflow-y": "scroll",
                "-webkit-overflow-scrolling": "touch"
            });
        }

        resize();

        $(window).on(orientationEvent, function () {
            resize(function () {
                self.element.dialog("option", "position", "center");
            });
        });
    }

    // hide titlebar
    if (!self.options["showTitleBar"]) {
        self.uiDialogTitlebar.css({
            "height": 0,
            "padding": 0,
            "background": "none",
            "border": 0
        });
        self.uiDialogTitlebar.find(".ui-dialog-title").css("display", "none");
    }

    //hide close button
    if (!self.options["showCloseButton"]) {
        self.uiDialogTitlebar.find(".ui-dialog-titlebar-close").css("display", "none");
    }
    
    //patch
    $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function(event) { return event + '.dialog-overlay'; }).join(' ');

}
// end _init

// extend open function
var _open = $.ui.dialog.prototype.open;
$.ui.dialog.prototype.open = function () {
    var self = this;
    // apply original arguments
    _open.apply(this, arguments);

    // close on clickOut
    if (self.options['clickOut'] && !self.options['modal']) {
        // use transparent div - simplest approach (rework)
        $('<div id="dialog-overlay"></div>').insertBefore(self.element.parent());
        $('#dialog-overlay').css({
            "position": "fixed",
            "top": 0,
            "right": 0,
            "bottom": 0,
            "left": 0,
            "background-color": "transparent"
        });
        $('#dialog-overlay').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.close();
        });
        // else close on modal click
    } else if (self.options['modal']) {
        $('.ui-widget-overlay').click(function (e) {
            self.close();
        });
    }

    // add dialogClass to overlay
    if (self.options['dialogClass']) {
        $('.ui-widget-overlay').addClass(self.options['dialogClass']);
    }
}
//end open

// extend close function
var _close = $.ui.dialog.prototype.close;
$.ui.dialog.prototype.close = function () {
    var self = this;
    // apply original arguments
    _close.apply(this, arguments);

    // remove dialogClass to overlay
    if (self.options['dialogClass']) {
        $('.ui-widget-overlay').removeClass(self.options['dialogClass']);
    }
     //remove clickOut overlay
    if($("#dialog-overlay").length ){
        $("#dialog-overlay").remove();
    }
}
//end close
