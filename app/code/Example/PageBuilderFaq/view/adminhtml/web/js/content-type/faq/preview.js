define([
    'jquery',
    'underscore',
    'knockout',
    'mage/translate',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/content-type/preview-collection',
    'Magento_PageBuilder/js/content-type-factory',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/content-type-menu/option',
    'Magento_PageBuilder/js/content-type/uploader',
    'mage/accordion',
], function ($, _, ko, $t, events, PreviewCollection, createContentType, pageBuilderConfig, option, uploader) {
    'use strict';

    /**
     * @param parent
     * @param config
     * @param stageId
     */
    function Preview(parent, config, stageId) {
        var self = this;

        PreviewCollection.call(this, parent, config, stageId);
    }

    Preview.prototype = Object.create(PreviewCollection.prototype);

    /**
     * Root element for accordion widget
     */
    Preview.prototype.element = null;

    Preview.prototype.isLiveEditing = ko.observable(false);

    Preview.prototype.initializeAccordionWidget = _.debounce(function () {
        if (this.element) {
            try {
                $(this.element).accordion('destroy');
            } catch (e) {
            }
            $(this.element).accordion();
        }
    }, 10);

    Preview.prototype.bindEvents = function bindEvents() {
        var self = this;

        PreviewCollection.prototype.bindEvents.call(this);

        events.on("faq:dropAfter", function (args) {
            if (args.id === self.parent.id && self.parent.children().length === 0) {
                self.addFaqItem();
            }
        });

        events.on("faq-item:renderAfter", (args) => {
            if (args.contentType.parent.id === self.parent.id) {
                this.initializeAccordionWidget();
            }
        });
    };

    /**
     * Add FAQ item
     */
    Preview.prototype.addFaqItem = function () {
        var self = this;
        createContentType(
            pageBuilderConfig.getContentTypeConfig("faq-item"),
            this.parent,
            this.parent.stageId,
            {
                question: $t("Question ") + (self.parent.children().length + 1),
                answer: $t("Edit answer here.")
            }
        ).then(function (container) {
            self.parent.addChild(container);
        });
    };

    /**
     * Return an array of options
     *
     * @returns {OptionsInterface}
     */
    Preview.prototype.retrieveOptions = function () {
        var self = this;
        var options = PreviewCollection.prototype.retrieveOptions.call(this);

        options.add = new option({
            preview: this,
            icon: "<i class='icon-pagebuilder-add'></i>",
            title: "Add",
            action: self.addFaqItem,
            classes: ["add-child"],
            sort: 10
        });
        return options;
    };

    /**
     * @returns {boolean}
     */
    Preview.prototype.afterRender = function (element) {
        this.element = element;
    };

    Preview.prototype.isContainer = function () {
        return false;
    };

    return Preview;
});
