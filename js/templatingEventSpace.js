/*global dessert, troop, sntls, evan, rubberband */
troop.postpone(rubberband, 'templatingEventSpace', function () {
    "use strict";

    /**
     * Event space dedicated to templating events.
     * @type {evan.EventSpace}
     */
    rubberband.templatingEventSpace = evan.EventSpace.create();
});
