(function(){
  'use strict';




  var config     = App.config
    , map        = App.map
    , uids       = App.uids
    , queue      = App.queue
    , dispatches = App.dispatches
    , $list



      // Called when the AJAX request fails.
    , ajaxError = function(jqXHR, status, error) {
        // TODO: handle ajax error
      }
    
      // After a successful AJAX request, parse the RSS into entries and add them to the processing queue.
      // Remember that our proxy server returns the RSS XML as one big JSONP string.
    , ajaxSuccess = function(data, status, jqXHR) {
        $($.parseXML(data)).find('entry').each(addDispatchToQueue);
      }
      
      // The options used for every AJAX request.
    , ajaxOptions = {
        cache:    false
      , dataType: 'jsonp'
      , success:  ajaxSuccess
      , error:    ajaxError
      }
      
      // Fetch the RSS feed via an AJAX JSONP request.
    , getData = function() {
        $.ajax(config.dataURL, ajaxOptions);
      }
      
      // When the DOM is loaded...
    , start = function() {
        // Render the Google Map
        map = new google.maps.Map(document.getElementById(config.mapDivID), config.mapOptions);
        // Fetch the RSS now and on an interval.
        getData();
        setInterval(getData, config.refreshRate);
        // Process the queue on an interval
        setInterval(processDispatchQueue, config.processRate);
        // Update marker icon colors on interval
        setInterval(updateMarkerIcons, config.iconUpdateRate);        
        // Get the DOM node where dispatch list items will be rendered.
        $list = $(config.listSelector);
      }
      
      // Add an unprocessed dispatch RSS entry to the queue.
    , addDispatchToQueue = function() {
        queue.push(this);
      }
      
      // Process a single entry in the queue unless the queue is empty.
    , processDispatchQueue = function() {
        var $xml, uid, dispatch;
        if (queue.length > 0) {
          // Remove a single entry from the queue.
          $xml = $(queue.pop());
          // Get the unique ID of this entry.
          uid = $xml.find('id').text();
          // If this dispatch isn't already in the array of unique IDs...
          // - Add it to the array of unique IDs
          // - Create and render a new Dispatch
          // - Add the new dispatch to the dispatches array.
          if (uids.indexOf(uid) < 0) {
            dispatch = new App.Dispatch($xml, uid);
            uids.push(uid);
            dispatches.push(dispatch);
            dispatch.render(map, $list);
          }
        }
      }
      
      // Update the icon of every marker on the map.
    , updateMarkerIcons = function() {
        var i = dispatches.length;
        while (i--) {
          dispatches[i].updateIcon();
        }
      };
    



  // Go go go!
  $(start);




}());