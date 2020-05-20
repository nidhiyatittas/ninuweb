importScripts('/cache-polyfill.js');
console.log('Started', self);
self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Installed', event);
});
self.addEventListener('activate', function(event) {
  console.log('Activated', event);
});
self.addEventListener('push', function(event) {
  console.log('Push message', event);
    event.waitUntil(
    fetch("https://h4papi.herokuapp.com/getnotification.php").then(function(response) {
      if (response.status !== 200) {
        // Either show a message to the user explaining the error
        // or enter a generic message and handle the
        // onnotificationclick event to direct the user to a web page
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        throw new Error();
      }
      // Examine the text in the response
      return response.json().then(function(data) {
        if (data.error || !data.notification) {
          console.error('The API returned an error.', data.error);
          throw new Error();
        }
        var title = data.title;
        var message = data.message;
        var icon = data.icon;
        var notificationTag = data.tag;
        return self.registration.showNotification(title, {
          body: message,
          icon: icon,
          tag: notificationTag
        });
      });
    }).catch(function(err) {
      console.error('Unable to retrieve data', err);
      var title = 'An error occurred';
      var message = 'We were unable to get the information for this push message';
      var icon = "favi.png";
      var notificationTag = 'notification-error';
      return self.registration.showNotification(title, {
          body: message,
          icon: icon,
          tag: notificationTag
        });
    })
  );

});
self.addEventListener('notificationclick', function(event) {
    console.log('Notification click: tag ', event.notification.tag);
    event.notification.close();
    var url = 'https://hack4people.com';
    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
        .then(function(windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
