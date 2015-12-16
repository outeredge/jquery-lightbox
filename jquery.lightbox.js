// Uses CommonJS, AMD or browser globals to create a jQuery plugin.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.lightbox = function (config) {

        var plugin = {

            lightbox: null,
            items: null,
            item: null,
            image: null,

            init: function(items, settings)
            {
                this.settings = settings;

                this.items = items;
                this.items.click(this.open.bind(this));

                $(document).on('click', '.lightbox-overlay, .lightbox-close', this.close.bind(this));
                $(document).on('click', '.lightbox-image', function(e){
                    e.stopPropagation();
                });
                $(window).resize(this.resize.bind(this));

                $(document).on('click', '.lightbox .nav', this.navigate.bind(this));
            },

            create: function()
            {
                this.lightbox = $('<div>', {class: 'lightbox-overlay'})
                    .append($('<div>', {class: 'lightbox'})
                        .append($('<span>', {class: 'lightbox-image'})
                            .append($('<span>', {class: 'lightbox-close'}))
                            .append($('<img>'))));

                if (this.settings.info)
                    this.lightbox.find('.lightbox-image').append($('<div>', {class: 'lightbox-info'})
                        .append($('<span>', {class: 'lightbox-paging'}))
                        .append($('<span>', {class: 'lightbox-title'})));

                if (this.items.length > 1 && this.settings.group)
                    this.lightbox.addClass('lightbox-gallery')
                        .find('.lightbox-image')
                            .prepend($('<span>', {class: 'nav', 'data-direction': '1'}))
                            .prepend($('<span>', {class: 'nav', 'data-direction': '-1'}));

                if (this.settings.theme)
                    this.lightbox.addClass('theme-' + this.settings.theme);

                $('body').append(this.lightbox);
            },

            open: function(e)
            {
                this.item = e.target;
                var src;
                if ($(this.item).data('lightbox'))
                    src = $(this.item).data('lightbox');
                else if ($(this.item).is('img'))
                    src = $(this.item).attr('src');
                else
                    src = $(this.item).find('img').attr('src');

                if (!this.lightbox)
                    this.create();

                this.image = $('<img>', {src: src});
                this.image.load(this.resize.bind(this));
                this.lightbox.show().find('img').replaceWith(this.image);

                if (this.settings.info) {
                    var title = $(this.item).is('img') ? $(this.item).attr('alt') : $(this.item).find('img').attr('alt');
                    this.lightbox.find('.lightbox-title').html(title);
                    this.lightbox.find('.lightbox-paging').html((this.items.index(this.item) + 1) + ' / ' + this.items.length);
                }
            },

            close: function()
            {
                if (this.lightbox)
                    this.lightbox.hide();
            },

            resize: function()
            {
                if (!this.image)
                    return;
                
                if (!this.image.ratio)
                    this.image.ratio = this.image.get(0).naturalHeight / this.image.get(0).naturalWidth;

                this.image.removeAttr('style');

                var lightboxHeight = this.lightbox.find('.lightbox').height();

                if (this.image.width() < this.image.get(0).naturalWidth)
                    this.image.height(this.heightLessThanWindow(parseInt(this.image.width() * this.image.ratio)));

                if (this.image.height() > lightboxHeight) {
                    this.image.css({
                        height: this.heightLessThanWindow(parseInt(lightboxHeight)),
                        width: this.widthLessThanWindow(parseInt(this.heightLessThanWindow(lightboxHeight) / this.image.ratio))
                    });
                }
            },

            navigate: function(e)
            {
                var currentIndex = this.items.index(this.item);
                var nextIndex = currentIndex + $(e.target).data('direction');
                if (nextIndex === this.items.length)
                    nextIndex = 0;
                else if (nextIndex === -1)
                    nextIndex = (this.items.length - 1);

                $(this.items.get(nextIndex)).trigger('click');
            },

            heightLessThanWindow: function(height)
            {
                if ((height + (this.settings.border * 2)) > $(window).height())
                    height = $(window).height() - (this.settings.border * 2);
                return height;
            },

            widthLessThanWindow: function(width)
            {
                if ((width + (this.settings.border * 2)) > $(window).width())
                    width = $(window).width() - (this.settings.border * 2);
                return width;
            }
        };

        plugin.init(this, $.extend({
            group: true,
            info: true,
            theme: 'circle',
            border: 3
        }, config));
    };

    $(document).ready(function(){
        $('[data-lightbox]').lightbox();
    });
}));
