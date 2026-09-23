document.addEventListener("DOMContentLoaded", function () {
  if (typeof supabase === "undefined" || !window.SUPABASE_URL) return;
  var client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  var loginView = document.getElementById("login-view");
  var dashboardView = document.getElementById("dashboard-view");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var userEmailEl = document.getElementById("admin-user-email");
  var logoutBtn = document.getElementById("logout-btn");

  function showLoggedIn(session) {
    loginView.hidden = true;
    dashboardView.hidden = false;
    userEmailEl.textContent = session.user.email;
    loadEvents();
    loadPhotos();
  }
  function showLoggedOut() {
    loginView.hidden = false;
    dashboardView.hidden = true;
  }

  client.auth.getSession().then(function (result) {
    if (result.data.session) showLoggedIn(result.data.session);
    else showLoggedOut();
  });

  client.auth.onAuthStateChange(function (event, session) {
    if (session) showLoggedIn(session);
    else showLoggedOut();
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loginError.hidden = true;
    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;
    client.auth.signInWithPassword({ email: email, password: password }).then(function (result) {
      if (result.error) {
        loginError.textContent = result.error.message;
        loginError.hidden = false;
      }
    });
  });

  logoutBtn.addEventListener("click", function () {
    client.auth.signOut();
  });

  // ---- Tabs ----
  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      document.querySelectorAll(".admin-tab-panel").forEach(function (panel) {
        panel.hidden = true;
      });
      tab.classList.add("active");
      document.getElementById("tab-" + tab.dataset.tab).hidden = false;
    });
  });

  // ---- Events ----
  var eventForm = document.getElementById("event-form");
  var eventError = document.getElementById("event-error");
  var eventsAdminList = document.getElementById("events-admin-list");
  var eventsAdminEmpty = document.getElementById("events-admin-empty");

  function loadEvents() {
    client
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(function (result) {
        eventsAdminList.innerHTML = "";
        var rows = result.data || [];
        eventsAdminEmpty.hidden = rows.length > 0;

        rows.forEach(function (eventRow) {
          var item = document.createElement("div");
          item.className = "admin-list-item";

          var info = document.createElement("div");
          var title = document.createElement("strong");
          title.textContent = eventRow.title;
          var meta = document.createElement("div");
          var metaBits = [eventRow.event_date];
          if (eventRow.event_time) metaBits.push(eventRow.event_time);
          if (eventRow.location) metaBits.push(eventRow.location);
          meta.textContent = metaBits.join(" · ");
          info.appendChild(title);
          info.appendChild(meta);

          var del = document.createElement("button");
          del.type = "button";
          del.className = "btn btn-outline-dark admin-delete";
          del.textContent = "Delete";
          del.addEventListener("click", function () {
            if (!window.confirm('Delete "' + eventRow.title + '"?')) return;
            client
              .from("events")
              .delete()
              .eq("id", eventRow.id)
              .then(function () {
                loadEvents();
              });
          });

          item.appendChild(info);
          item.appendChild(del);
          eventsAdminList.appendChild(item);
        });
      });
  }

  eventForm.addEventListener("submit", function (submitEvent) {
    submitEvent.preventDefault();
    eventError.hidden = true;

    var title = document.getElementById("event-title").value.trim();
    var eventDate = document.getElementById("event-date").value;
    var eventTime = document.getElementById("event-time").value.trim();
    var location = document.getElementById("event-location").value.trim();
    var description = document.getElementById("event-description").value.trim();

    client
      .from("events")
      .insert({
        title: title,
        event_date: eventDate,
        event_time: eventTime || null,
        location: location || null,
        description: description || null,
      })
      .then(function (result) {
        if (result.error) {
          eventError.textContent = result.error.message;
          eventError.hidden = false;
          return;
        }
        eventForm.reset();
        loadEvents();
      });
  });

  // ---- Gallery ----
  var photoForm = document.getElementById("photo-form");
  var photoError = document.getElementById("photo-error");
  var galleryAdminList = document.getElementById("gallery-admin-list");
  var galleryAdminEmpty = document.getElementById("gallery-admin-empty");

  function loadPhotos() {
    client
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: true })
      .then(function (result) {
        galleryAdminList.innerHTML = "";
        var rows = result.data || [];
        galleryAdminEmpty.hidden = rows.length > 0;

        rows.forEach(function (photo) {
          var item = document.createElement("div");
          item.className = "admin-list-item admin-list-item-photo";

          var thumb = document.createElement("img");
          thumb.src = window.SUPABASE_URL + "/storage/v1/object/public/gallery/" + photo.image_path;
          thumb.alt = photo.caption || "";

          var caption = document.createElement("span");
          caption.textContent = photo.caption;

          var del = document.createElement("button");
          del.type = "button";
          del.className = "btn btn-outline-dark admin-delete";
          del.textContent = "Delete";
          del.addEventListener("click", function () {
            if (!window.confirm('Delete "' + photo.caption + '"?')) return;
            client.storage
              .from("gallery")
              .remove([photo.image_path])
              .then(function () {
                return client.from("gallery_photos").delete().eq("id", photo.id);
              })
              .then(function () {
                loadPhotos();
              });
          });

          item.appendChild(thumb);
          item.appendChild(caption);
          item.appendChild(del);
          galleryAdminList.appendChild(item);
        });
      });
  }

  photoForm.addEventListener("submit", function (submitEvent) {
    submitEvent.preventDefault();
    photoError.hidden = true;

    var fileInput = document.getElementById("photo-file");
    var caption = document.getElementById("photo-caption").value.trim();
    var file = fileInput.files[0];
    if (!file) return;

    var safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    var path = Date.now() + "-" + safeName;

    client.storage
      .from("gallery")
      .upload(path, file)
      .then(function (uploadResult) {
        if (uploadResult.error) throw uploadResult.error;
        return client.from("gallery_photos").insert({ caption: caption, image_path: path });
      })
      .then(function (insertResult) {
        if (insertResult && insertResult.error) throw insertResult.error;
        photoForm.reset();
        loadPhotos();
      })
      .catch(function (error) {
        photoError.textContent = error.message || "Upload failed.";
        photoError.hidden = false;
      });
  });
});
